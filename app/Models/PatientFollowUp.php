<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class PatientFollowUp extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'appointment_id',
        'referral_id',
        'follow_up_type',
        'priority',
        'status',
        'scheduled_date',
        'completed_date',
        'title',
        'description',
        'instructions',
        'questions',
        'patient_responses',
        'doctor_notes',
        'outcome',
        'next_follow_up_date',
        'follow_up_method',
        'automated',
        'ai_generated',
        'ai_score',
        'ai_recommendations',
        'reminder_frequency',
        'reminder_count',
        'last_reminder_sent',
        'patient_satisfaction',
        'compliance_score',
        'health_metrics',
        'medication_adherence',
        'symptoms_reported',
        'red_flags',
        'escalation_required',
        'escalated_at',
        'escalated_to',
        'metadata',
    ];

    protected $casts = [
        'scheduled_date' => 'datetime',
        'completed_date' => 'datetime',
        'next_follow_up_date' => 'datetime',
        'last_reminder_sent' => 'datetime',
        'escalated_at' => 'datetime',
        'automated' => 'boolean',
        'ai_generated' => 'boolean',
        'escalation_required' => 'boolean',
        'ai_score' => 'decimal:2',
        'patient_satisfaction' => 'integer',
        'compliance_score' => 'decimal:2',
        'medication_adherence' => 'decimal:2',
        'reminder_count' => 'integer',
        'questions' => 'array',
        'patient_responses' => 'array',
        'ai_recommendations' => 'array',
        'health_metrics' => 'array',
        'symptoms_reported' => 'array',
        'red_flags' => 'array',
        'metadata' => 'array',
    ];

    // Accessors & Mutators
    protected function isPending(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'pending'
        );
    }

    protected function isCompleted(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'completed'
        );
    }

    protected function isOverdue(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->scheduled_date < now() && $this->status === 'pending'
        );
    }

    protected function isDueToday(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->scheduled_date->isToday() && $this->status === 'pending'
        );
    }

    protected function needsReminder(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->status !== 'pending') return false;
                if (!$this->last_reminder_sent) return true;
                
                $frequency = $this->reminder_frequency ?? 'daily';
                $interval = match($frequency) {
                    'hourly' => 1,
                    'daily' => 24,
                    'weekly' => 168,
                    default => 24,
                };
                
                return $this->last_reminder_sent->addHours($interval) <= now();
            }
        );
    }

    protected function hasRedFlags(): Attribute
    {
        return Attribute::make(
            get: fn () => !empty($this->red_flags)
        );
    }

    protected function isHighRisk(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->ai_score > 7.0 || $this->has_red_flags
        );
    }

    // Relationships
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function referral(): BelongsTo
    {
        return $this->belongsTo(Referral::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(PatientNotification::class, 'notifiable_id')
                   ->where('notifiable_type', self::class);
    }

    public function escalatedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'escalated_to');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeOverdue($query)
    {
        return $query->where('scheduled_date', '<', now())
                    ->where('status', 'pending');
    }

    public function scopeDueToday($query)
    {
        return $query->whereDate('scheduled_date', today())
                    ->where('status', 'pending');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('follow_up_type', $type);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeByDoctor($query, $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    public function scopeHighRisk($query)
    {
        return $query->where('ai_score', '>', 7.0)
                    ->orWhereNotNull('red_flags');
    }

    public function scopeNeedingReminder($query)
    {
        return $query->where('status', 'pending')
                    ->where(function ($q) {
                        $q->whereNull('last_reminder_sent')
                          ->orWhere('last_reminder_sent', '<', now()->subDay());
                    });
    }

    public function scopeAutomated($query)
    {
        return $query->where('automated', true);
    }

    public function scopeAiGenerated($query)
    {
        return $query->where('ai_generated', true);
    }

    // Methods
    public function complete(array $completionData = []): bool
    {
        if ($this->status !== 'pending') {
            return false;
        }

        $updateData = [
            'status' => 'completed',
            'completed_date' => now(),
        ];

        if (isset($completionData['patient_responses'])) {
            $updateData['patient_responses'] = $completionData['patient_responses'];
        }

        if (isset($completionData['doctor_notes'])) {
            $updateData['doctor_notes'] = $completionData['doctor_notes'];
        }

        if (isset($completionData['outcome'])) {
            $updateData['outcome'] = $completionData['outcome'];
        }

        if (isset($completionData['patient_satisfaction'])) {
            $updateData['patient_satisfaction'] = $completionData['patient_satisfaction'];
        }

        if (isset($completionData['next_follow_up_date'])) {
            $updateData['next_follow_up_date'] = $completionData['next_follow_up_date'];
        }

        $result = $this->update($updateData);

        // Analyze responses and update AI score
        $this->analyzeResponses();

        // Check for red flags
        $this->checkRedFlags();

        // Schedule next follow-up if needed
        if (isset($completionData['next_follow_up_date'])) {
            $this->scheduleNextFollowUp($completionData['next_follow_up_date']);
        }

        return $result;
    }

    public function sendReminder(): bool
    {
        if (!$this->needs_reminder) {
            return false;
        }

        // Create notification
        $notification = PatientNotification::create([
            'patient_id' => $this->patient_id,
            'notifiable_type' => self::class,
            'notifiable_id' => $this->id,
            'type' => 'follow_up_reminder',
            'channel' => $this->patient->preferred_communication_channel ?? 'email',
            'title' => 'Follow-up Reminder',
            'message' => $this->generateReminderMessage(),
            'priority' => $this->priority,
            'scheduled_at' => now(),
        ]);

        // Update reminder tracking
        $this->update([
            'last_reminder_sent' => now(),
            'reminder_count' => $this->reminder_count + 1,
        ]);

        return true;
    }

    public function escalate(int $escalateTo, string $reason = null): bool
    {
        return $this->update([
            'escalation_required' => true,
            'escalated_at' => now(),
            'escalated_to' => $escalateTo,
            'metadata' => array_merge($this->metadata ?? [], [
                'escalation_reason' => $reason,
                'escalated_by' => auth()->id(),
            ]),
        ]);
    }

    public function analyzeResponses(): void
    {
        if (empty($this->patient_responses)) {
            return;
        }

        $score = 5.0; // Base score
        $redFlags = [];

        foreach ($this->patient_responses as $questionId => $response) {
            $question = collect($this->questions)->firstWhere('id', $questionId);
            
            if (!$question) continue;

            // Analyze response based on question type
            switch ($question['type']) {
                case 'pain_scale':
                    if ($response > 7) {
                        $score += 2;
                        $redFlags[] = 'High pain level reported';
                    }
                    break;
                    
                case 'symptoms':
                    $concerningSymptoms = ['chest pain', 'difficulty breathing', 'severe headache'];
                    foreach ($concerningSymptoms as $symptom) {
                        if (stripos($response, $symptom) !== false) {
                            $score += 3;
                            $redFlags[] = "Concerning symptom reported: {$symptom}";
                        }
                    }
                    break;
                    
                case 'medication_adherence':
                    if (strtolower($response) === 'no' || stripos($response, 'missed') !== false) {
                        $score += 1;
                        $redFlags[] = 'Medication adherence issue';
                    }
                    break;
                    
                case 'satisfaction':
                    if (is_numeric($response) && $response < 3) {
                        $score += 1;
                    }
                    break;
            }
        }

        $this->update([
            'ai_score' => min($score, 10.0),
            'red_flags' => $redFlags,
        ]);
    }

    public function checkRedFlags(): void
    {
        $redFlags = $this->red_flags ?? [];

        // Check for escalation criteria
        if ($this->ai_score > 8.0 || count($redFlags) > 2) {
            $this->update(['escalation_required' => true]);
        }

        // Auto-escalate critical red flags
        $criticalFlags = ['chest pain', 'difficulty breathing', 'severe headache', 'loss of consciousness'];
        foreach ($redFlags as $flag) {
            foreach ($criticalFlags as $critical) {
                if (stripos($flag, $critical) !== false) {
                    $this->escalate(
                        $this->doctor_id,
                        "Critical symptom reported: {$flag}"
                    );
                    break 2;
                }
            }
        }
    }

    public function generateReminderMessage(): string
    {
        $patientName = $this->patient->first_name;
        $doctorName = $this->doctor->name;
        
        $baseMessage = "Hi {$patientName}, this is a reminder about your follow-up with Dr. {$doctorName}. ";
        
        switch ($this->follow_up_type) {
            case 'medication_check':
                $baseMessage .= "Please let us know how you're feeling with your current medications.";
                break;
            case 'symptom_monitoring':
                $baseMessage .= "Please update us on your symptoms and how you're feeling.";
                break;
            case 'recovery_check':
                $baseMessage .= "We'd like to check on your recovery progress.";
                break;
            case 'test_results':
                $baseMessage .= "Please review your test results and let us know if you have any questions.";
                break;
            default:
                $baseMessage .= "Please complete your follow-up questionnaire.";
        }
        
        $baseMessage .= " Click here to respond: " . config('app.url') . "/patient/follow-up/{$this->id}";
        
        return $baseMessage;
    }

    public function scheduleNextFollowUp(\DateTime $date): ?PatientFollowUp
    {
        if (!$this->is_completed) {
            return null;
        }

        return self::create([
            'patient_id' => $this->patient_id,
            'doctor_id' => $this->doctor_id,
            'appointment_id' => $this->appointment_id,
            'referral_id' => $this->referral_id,
            'follow_up_type' => $this->follow_up_type,
            'priority' => 'normal',
            'status' => 'pending',
            'scheduled_date' => $date,
            'title' => 'Scheduled Follow-up',
            'description' => 'Continuation of previous follow-up care',
            'automated' => true,
            'ai_generated' => true,
            'questions' => $this->questions,
            'reminder_frequency' => $this->reminder_frequency,
        ]);
    }

    public function generateAIQuestions(): array
    {
        $questions = [];

        // Base questions for all follow-ups
        $questions[] = [
            'id' => 'general_wellbeing',
            'type' => 'scale',
            'question' => 'How are you feeling overall today?',
            'scale' => [1 => 'Very Poor', 5 => 'Excellent'],
            'required' => true,
        ];

        // Type-specific questions
        switch ($this->follow_up_type) {
            case 'medication_check':
                $questions[] = [
                    'id' => 'medication_adherence',
                    'type' => 'yes_no',
                    'question' => 'Are you taking your medications as prescribed?',
                    'required' => true,
                ];
                $questions[] = [
                    'id' => 'side_effects',
                    'type' => 'text',
                    'question' => 'Are you experiencing any side effects from your medications?',
                    'required' => false,
                ];
                break;

            case 'symptom_monitoring':
                $questions[] = [
                    'id' => 'pain_scale',
                    'type' => 'scale',
                    'question' => 'Rate your pain level (0 = no pain, 10 = severe pain)',
                    'scale' => range(0, 10),
                    'required' => true,
                ];
                $questions[] = [
                    'id' => 'symptoms',
                    'type' => 'text',
                    'question' => 'Describe any symptoms you are experiencing',
                    'required' => false,
                ];
                break;

            case 'recovery_check':
                $questions[] = [
                    'id' => 'activity_level',
                    'type' => 'multiple_choice',
                    'question' => 'How would you describe your current activity level?',
                    'options' => ['Bed rest', 'Limited activity', 'Normal activity', 'Full activity'],
                    'required' => true,
                ];
                break;
        }

        // AI-generated personalized questions based on patient history
        $personalizedQuestions = $this->generatePersonalizedQuestions();
        $questions = array_merge($questions, $personalizedQuestions);

        $this->update(['questions' => $questions]);

        return $questions;
    }

    private function generatePersonalizedQuestions(): array
    {
        $questions = [];

        // Analyze patient's medical history for relevant questions
        if ($this->patient->has_diabetes) {
            $questions[] = [
                'id' => 'blood_sugar',
                'type' => 'text',
                'question' => 'What have your blood sugar levels been like recently?',
                'required' => false,
            ];
        }

        if ($this->patient->has_hypertension) {
            $questions[] = [
                'id' => 'blood_pressure',
                'type' => 'text',
                'question' => 'Have you been monitoring your blood pressure? What are the readings?',
                'required' => false,
            ];
        }

        // Add questions based on previous responses
        $previousFollowUps = self::where('patient_id', $this->patient_id)
            ->where('status', 'completed')
            ->orderBy('completed_date', 'desc')
            ->limit(3)
            ->get();

        foreach ($previousFollowUps as $followUp) {
            if (!empty($followUp->red_flags)) {
                $questions[] = [
                    'id' => 'previous_concerns',
                    'type' => 'text',
                    'question' => 'How are the concerns we discussed in your last follow-up?',
                    'required' => false,
                ];
                break;
            }
        }

        return $questions;
    }

    public function getComplianceScore(): float
    {
        $score = 100.0;

        // Deduct points for late responses
        if ($this->is_overdue) {
            $daysOverdue = $this->scheduled_date->diffInDays(now());
            $score -= min($daysOverdue * 10, 50); // Max 50 points deduction
        }

        // Deduct points for incomplete responses
        if (!empty($this->questions)) {
            $totalQuestions = count($this->questions);
            $answeredQuestions = count($this->patient_responses ?? []);
            $completionRate = $totalQuestions > 0 ? ($answeredQuestions / $totalQuestions) : 1;
            $score *= $completionRate;
        }

        // Bonus points for early completion
        if ($this->is_completed && $this->completed_date < $this->scheduled_date) {
            $score += 10;
        }

        $this->update(['compliance_score' => max(0, min(100, $score))]);

        return $score;
    }

    public function getStatusColor(): string
    {
        return match($this->status) {
            'pending' => $this->is_overdue ? 'red' : 'yellow',
            'completed' => 'green',
            'cancelled' => 'gray',
            default => 'gray',
        };
    }

    public function getPriorityColor(): string
    {
        return match($this->priority) {
            'low' => 'gray',
            'normal' => 'blue',
            'high' => 'orange',
            'urgent' => 'red',
            default => 'gray',
        };
    }
}
