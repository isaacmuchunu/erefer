<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class TelemedicineSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'patient_id',
        'doctor_id',
        'session_id',
        'meeting_url',
        'meeting_password',
        'platform',
        'status',
        'scheduled_start',
        'actual_start',
        'actual_end',
        'duration_minutes',
        'connection_quality',
        'recording_enabled',
        'recording_url',
        'recording_consent',
        'chat_enabled',
        'screen_sharing_enabled',
        'file_sharing_enabled',
        'participants',
        'technical_issues',
        'session_notes',
        'patient_satisfaction',
        'doctor_satisfaction',
        'follow_up_required',
        'prescription_issued',
        'referral_made',
        'next_appointment_scheduled',
        'ai_analysis',
        'ai_sentiment_score',
        'ai_engagement_score',
        'ai_recommendations',
        'metadata',
    ];

    protected $casts = [
        'scheduled_start' => 'datetime',
        'actual_start' => 'datetime',
        'actual_end' => 'datetime',
        'recording_enabled' => 'boolean',
        'recording_consent' => 'boolean',
        'chat_enabled' => 'boolean',
        'screen_sharing_enabled' => 'boolean',
        'file_sharing_enabled' => 'boolean',
        'follow_up_required' => 'boolean',
        'prescription_issued' => 'boolean',
        'referral_made' => 'boolean',
        'next_appointment_scheduled' => 'boolean',
        'duration_minutes' => 'integer',
        'patient_satisfaction' => 'integer',
        'doctor_satisfaction' => 'integer',
        'ai_sentiment_score' => 'decimal:2',
        'ai_engagement_score' => 'decimal:2',
        'participants' => 'array',
        'technical_issues' => 'array',
        'ai_analysis' => 'array',
        'ai_recommendations' => 'array',
        'metadata' => 'array',
    ];

    // Accessors & Mutators
    protected function isActive(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'in_progress'
        );
    }

    protected function isCompleted(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'completed'
        );
    }

    protected function isScheduled(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'scheduled'
        );
    }

    protected function canStart(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'scheduled' && 
                         $this->scheduled_start <= now()->addMinutes(15)
        );
    }

    protected function isOverdue(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'scheduled' && 
                         $this->scheduled_start < now()->subMinutes(15)
        );
    }

    protected function hasRecording(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->recording_enabled && !empty($this->recording_url)
        );
    }

    protected function actualDuration(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->actual_start || !$this->actual_end) {
                    return null;
                }
                return $this->actual_start->diffInMinutes($this->actual_end);
            }
        );
    }

    // Relationships
    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function chatMessages(): HasMany
    {
        return $this->hasMany(TelemedicineChatMessage::class);
    }

    public function sharedFiles(): HasMany
    {
        return $this->hasMany(TelemedicineSharedFile::class);
    }

    public function technicalLogs(): HasMany
    {
        return $this->hasMany(TelemedicineTechnicalLog::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('scheduled_start', today());
    }

    public function scopeByDoctor($query, $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    public function scopeByPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeWithRecording($query)
    {
        return $query->where('recording_enabled', true)
                    ->whereNotNull('recording_url');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'scheduled')
                    ->where('scheduled_start', '<', now()->subMinutes(15));
    }

    // Methods
    public function start(): bool
    {
        if (!$this->can_start) {
            return false;
        }

        return $this->update([
            'status' => 'in_progress',
            'actual_start' => now(),
        ]);
    }

    public function end(array $completionData = []): bool
    {
        if ($this->status !== 'in_progress') {
            return false;
        }

        $updateData = [
            'status' => 'completed',
            'actual_end' => now(),
            'duration_minutes' => $this->actual_start ? 
                $this->actual_start->diffInMinutes(now()) : 0,
        ];

        if (isset($completionData['session_notes'])) {
            $updateData['session_notes'] = $completionData['session_notes'];
        }

        if (isset($completionData['follow_up_required'])) {
            $updateData['follow_up_required'] = $completionData['follow_up_required'];
        }

        if (isset($completionData['prescription_issued'])) {
            $updateData['prescription_issued'] = $completionData['prescription_issued'];
        }

        if (isset($completionData['referral_made'])) {
            $updateData['referral_made'] = $completionData['referral_made'];
        }

        $result = $this->update($updateData);

        // Trigger AI analysis
        $this->performAIAnalysis();

        return $result;
    }

    public function cancel(string $reason): bool
    {
        if (!in_array($this->status, ['scheduled', 'in_progress'])) {
            return false;
        }

        return $this->update([
            'status' => 'cancelled',
            'metadata' => array_merge($this->metadata ?? [], [
                'cancellation_reason' => $reason,
                'cancelled_at' => now()->toISOString(),
                'cancelled_by' => auth()->id(),
            ]),
        ]);
    }

    public function generateMeetingUrl(): string
    {
        $sessionId = 'TM-' . $this->id . '-' . now()->format('YmdHi');
        $password = substr(str_shuffle('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, 8);

        $meetingUrl = config('app.url') . "/telemedicine/session/{$sessionId}";

        $this->update([
            'session_id' => $sessionId,
            'meeting_url' => $meetingUrl,
            'meeting_password' => $password,
        ]);

        return $meetingUrl;
    }

    public function recordConnectionQuality(array $qualityData): void
    {
        $this->technicalLogs()->create([
            'log_type' => 'connection_quality',
            'data' => $qualityData,
            'timestamp' => now(),
        ]);

        // Update overall connection quality
        $avgQuality = $this->technicalLogs()
            ->where('log_type', 'connection_quality')
            ->avg('data->quality_score');

        $this->update(['connection_quality' => $avgQuality]);
    }

    public function addChatMessage(int $senderId, string $message, string $type = 'text'): TelemedicineChatMessage
    {
        return $this->chatMessages()->create([
            'sender_id' => $senderId,
            'sender_type' => $senderId === $this->patient_id ? 'patient' : 'doctor',
            'message' => $message,
            'message_type' => $type,
            'timestamp' => now(),
        ]);
    }

    public function shareFile(int $sharedBy, string $fileName, string $filePath, string $fileType): TelemedicineSharedFile
    {
        return $this->sharedFiles()->create([
            'shared_by' => $sharedBy,
            'file_name' => $fileName,
            'file_path' => $filePath,
            'file_type' => $fileType,
            'file_size' => filesize(storage_path('app/' . $filePath)),
            'shared_at' => now(),
        ]);
    }

    public function enableRecording(bool $patientConsent = false): bool
    {
        if (!$patientConsent) {
            return false;
        }

        return $this->update([
            'recording_enabled' => true,
            'recording_consent' => true,
        ]);
    }

    public function setRecordingUrl(string $url): bool
    {
        return $this->update(['recording_url' => $url]);
    }

    public function performAIAnalysis(): void
    {
        $analysis = [];
        $sentimentScore = 5.0; // Neutral baseline
        $engagementScore = 5.0; // Neutral baseline

        // Analyze chat messages for sentiment
        $messages = $this->chatMessages()->get();
        if ($messages->count() > 0) {
            $sentimentScore = $this->analyzeChatSentiment($messages);
            $engagementScore = $this->analyzeEngagement($messages);
        }

        // Analyze session duration vs scheduled duration
        $scheduledDuration = $this->appointment->duration_minutes ?? 30;
        $actualDuration = $this->actual_duration ?? 0;
        
        if ($actualDuration < $scheduledDuration * 0.5) {
            $analysis['duration_concern'] = 'Session ended significantly early';
        } elseif ($actualDuration > $scheduledDuration * 1.5) {
            $analysis['duration_note'] = 'Session ran longer than scheduled';
        }

        // Analyze technical issues
        $technicalIssues = $this->technical_issues ?? [];
        if (!empty($technicalIssues)) {
            $analysis['technical_issues'] = count($technicalIssues);
            if (count($technicalIssues) > 3) {
                $analysis['technical_concern'] = 'Multiple technical issues reported';
            }
        }

        // Generate recommendations
        $recommendations = $this->generateAIRecommendations($sentimentScore, $engagementScore, $analysis);

        $this->update([
            'ai_analysis' => $analysis,
            'ai_sentiment_score' => $sentimentScore,
            'ai_engagement_score' => $engagementScore,
            'ai_recommendations' => $recommendations,
        ]);
    }

    private function analyzeChatSentiment($messages): float
    {
        $totalSentiment = 0;
        $messageCount = 0;

        foreach ($messages as $message) {
            // Simple sentiment analysis based on keywords
            $text = strtolower($message->message);
            $sentiment = 5.0; // Neutral

            // Positive indicators
            $positiveWords = ['good', 'better', 'great', 'excellent', 'thank you', 'helpful', 'clear'];
            foreach ($positiveWords as $word) {
                if (strpos($text, $word) !== false) {
                    $sentiment += 1;
                }
            }

            // Negative indicators
            $negativeWords = ['bad', 'worse', 'terrible', 'confused', 'unclear', 'problem', 'issue'];
            foreach ($negativeWords as $word) {
                if (strpos($text, $word) !== false) {
                    $sentiment -= 1;
                }
            }

            $totalSentiment += max(1, min(10, $sentiment));
            $messageCount++;
        }

        return $messageCount > 0 ? $totalSentiment / $messageCount : 5.0;
    }

    private function analyzeEngagement($messages): float
    {
        $patientMessages = $messages->where('sender_type', 'patient')->count();
        $doctorMessages = $messages->where('sender_type', 'doctor')->count();
        $totalMessages = $messages->count();

        if ($totalMessages === 0) {
            return 3.0; // Low engagement if no chat
        }

        // Calculate engagement based on message balance and frequency
        $messageBalance = $patientMessages > 0 && $doctorMessages > 0 ? 
            min($patientMessages, $doctorMessages) / max($patientMessages, $doctorMessages) : 0;

        $messageFrequency = $totalMessages / max(1, $this->actual_duration ?? 1);

        $engagementScore = ($messageBalance * 5) + ($messageFrequency * 2);

        return max(1, min(10, $engagementScore));
    }

    private function generateAIRecommendations(float $sentiment, float $engagement, array $analysis): array
    {
        $recommendations = [];

        // Sentiment-based recommendations
        if ($sentiment < 4.0) {
            $recommendations[] = [
                'type' => 'follow_up',
                'priority' => 'high',
                'message' => 'Patient showed negative sentiment - consider follow-up call',
                'action' => 'schedule_follow_up_call',
            ];
        }

        // Engagement-based recommendations
        if ($engagement < 3.0) {
            $recommendations[] = [
                'type' => 'communication',
                'priority' => 'medium',
                'message' => 'Low patient engagement - consider alternative communication methods',
                'action' => 'review_communication_style',
            ];
        }

        // Technical issue recommendations
        if (isset($analysis['technical_concern'])) {
            $recommendations[] = [
                'type' => 'technical',
                'priority' => 'medium',
                'message' => 'Technical issues affected session - provide tech support resources',
                'action' => 'send_tech_support_info',
            ];
        }

        // Duration-based recommendations
        if (isset($analysis['duration_concern'])) {
            $recommendations[] = [
                'type' => 'clinical',
                'priority' => 'high',
                'message' => 'Session ended early - ensure all patient concerns were addressed',
                'action' => 'review_session_completeness',
            ];
        }

        return $recommendations;
    }

    public function getQualityScore(): float
    {
        $score = 5.0; // Base score

        // Factor in connection quality
        if ($this->connection_quality) {
            $score = ($score + $this->connection_quality) / 2;
        }

        // Factor in AI scores
        if ($this->ai_sentiment_score) {
            $score = ($score + $this->ai_sentiment_score) / 2;
        }

        if ($this->ai_engagement_score) {
            $score = ($score + $this->ai_engagement_score) / 2;
        }

        // Deduct for technical issues
        $technicalIssueCount = count($this->technical_issues ?? []);
        $score -= ($technicalIssueCount * 0.5);

        return max(1, min(10, $score));
    }

    public function getStatusColor(): string
    {
        return match($this->status) {
            'scheduled' => 'blue',
            'in_progress' => 'green',
            'completed' => 'emerald',
            'cancelled' => 'red',
            'failed' => 'red',
            default => 'gray',
        };
    }

    public function getPlatformIcon(): string
    {
        return match($this->platform) {
            'zoom' => '📹',
            'teams' => '💼',
            'meet' => '🎥',
            'webrtc' => '🌐',
            default => '📱',
        };
    }
}
