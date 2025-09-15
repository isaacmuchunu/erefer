<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class Appointment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'appointment_number',
        'patient_id',
        'doctor_id',
        'facility_id',
        'referral_id',
        'appointment_type',
        'specialty_id',
        'scheduled_at',
        'duration_minutes',
        'status',
        'priority',
        'reason',
        'notes',
        'preparation_instructions',
        'location_details',
        'is_telemedicine',
        'meeting_link',
        'meeting_id',
        'meeting_password',
        'confirmed_at',
        'checked_in_at',
        'started_at',
        'completed_at',
        'cancelled_at',
        'cancellation_reason',
        'cancelled_by',
        'rescheduled_from',
        'rescheduled_to',
        'follow_up_required',
        'follow_up_date',
        'reminder_sent_at',
        'confirmation_sent_at',
        'patient_arrived',
        'doctor_notes',
        'diagnosis',
        'treatment_plan',
        'prescriptions',
        'next_appointment_recommended',
        'patient_satisfaction_score',
        'feedback',
        'billing_amount',
        'insurance_claim_id',
        'payment_status',
        'ai_risk_score',
        'ai_recommendations',
        'metadata',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'checked_in_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'follow_up_date' => 'datetime',
        'reminder_sent_at' => 'datetime',
        'confirmation_sent_at' => 'datetime',
        'patient_arrived' => 'boolean',
        'is_telemedicine' => 'boolean',
        'follow_up_required' => 'boolean',
        'next_appointment_recommended' => 'boolean',
        'duration_minutes' => 'integer',
        'patient_satisfaction_score' => 'integer',
        'billing_amount' => 'decimal:2',
        'ai_risk_score' => 'decimal:2',
        'prescriptions' => 'array',
        'ai_recommendations' => 'array',
        'metadata' => 'array',
    ];

    // Accessors & Mutators
    protected function isUpcoming(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->scheduled_at > now() && in_array($this->status, ['scheduled', 'confirmed'])
        );
    }

    protected function isPast(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->scheduled_at < now()
        );
    }

    protected function isToday(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->scheduled_at->isToday()
        );
    }

    protected function canBeCancelled(): Attribute
    {
        return Attribute::make(
            get: fn () => in_array($this->status, ['scheduled', 'confirmed']) && 
                         $this->scheduled_at > now()->addHours(2)
        );
    }

    protected function canBeRescheduled(): Attribute
    {
        return Attribute::make(
            get: fn () => in_array($this->status, ['scheduled', 'confirmed']) && 
                         $this->scheduled_at > now()->addHours(4)
        );
    }

    protected function requiresReminder(): Attribute
    {
        return Attribute::make(
            get: fn () => !$this->reminder_sent_at && 
                         $this->scheduled_at > now() && 
                         $this->scheduled_at <= now()->addHours(24)
        );
    }

    protected function isOverdue(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->scheduled_at < now()->subMinutes(15) && 
                         in_array($this->status, ['scheduled', 'confirmed'])
        );
    }

    protected function estimatedEndTime(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->scheduled_at->addMinutes($this->duration_minutes)
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

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    public function specialty(): BelongsTo
    {
        return $this->belongsTo(Specialty::class);
    }

    public function referral(): BelongsTo
    {
        return $this->belongsTo(Referral::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(PatientNotification::class);
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(AppointmentReminder::class);
    }

    public function followUps(): HasMany
    {
        return $this->hasMany(PatientFollowUp::class);
    }

    public function telemedicineSession(): HasOne
    {
        return $this->hasOne(TelemedicineSession::class);
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    public function billingRecord(): HasOne
    {
        return $this->hasOne(AppointmentBilling::class);
    }

    // Scopes
    public function scopeUpcoming($query)
    {
        return $query->where('scheduled_at', '>', now())
                    ->whereIn('status', ['scheduled', 'confirmed']);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('scheduled_at', today());
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByDoctor($query, $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    public function scopeByPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeByFacility($query, $facilityId)
    {
        return $query->where('facility_id', $facilityId);
    }

    public function scopeTelemedicine($query)
    {
        return $query->where('is_telemedicine', true);
    }

    public function scopeInPerson($query)
    {
        return $query->where('is_telemedicine', false);
    }

    public function scopeRequiringReminder($query)
    {
        return $query->whereNull('reminder_sent_at')
                    ->where('scheduled_at', '>', now())
                    ->where('scheduled_at', '<=', now()->addHours(24))
                    ->whereIn('status', ['scheduled', 'confirmed']);
    }

    public function scopeOverdue($query)
    {
        return $query->where('scheduled_at', '<', now()->subMinutes(15))
                    ->whereIn('status', ['scheduled', 'confirmed']);
    }

    public function scopeHighRisk($query)
    {
        return $query->where('ai_risk_score', '>', 7.0);
    }

    // Methods
    public function confirm(): bool
    {
        if (!in_array($this->status, ['scheduled'])) {
            return false;
        }

        return $this->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);
    }

    public function checkIn(): bool
    {
        if (!in_array($this->status, ['confirmed', 'scheduled'])) {
            return false;
        }

        return $this->update([
            'status' => 'checked_in',
            'checked_in_at' => now(),
            'patient_arrived' => true,
        ]);
    }

    public function start(): bool
    {
        if (!in_array($this->status, ['checked_in', 'confirmed'])) {
            return false;
        }

        return $this->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);
    }

    public function complete(array $completionData = []): bool
    {
        if ($this->status !== 'in_progress') {
            return false;
        }

        $updateData = [
            'status' => 'completed',
            'completed_at' => now(),
        ];

        if (isset($completionData['doctor_notes'])) {
            $updateData['doctor_notes'] = $completionData['doctor_notes'];
        }

        if (isset($completionData['diagnosis'])) {
            $updateData['diagnosis'] = $completionData['diagnosis'];
        }

        if (isset($completionData['treatment_plan'])) {
            $updateData['treatment_plan'] = $completionData['treatment_plan'];
        }

        if (isset($completionData['follow_up_required'])) {
            $updateData['follow_up_required'] = $completionData['follow_up_required'];
            if ($completionData['follow_up_required'] && isset($completionData['follow_up_date'])) {
                $updateData['follow_up_date'] = $completionData['follow_up_date'];
            }
        }

        if (isset($completionData['next_appointment_recommended'])) {
            $updateData['next_appointment_recommended'] = $completionData['next_appointment_recommended'];
        }

        return $this->update($updateData);
    }

    public function cancel(string $reason, int $cancelledBy = null): bool
    {
        if (!$this->can_be_cancelled) {
            return false;
        }

        return $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
            'cancelled_by' => $cancelledBy ?? auth()->id(),
        ]);
    }

    public function reschedule(Carbon $newDateTime, string $reason = null): bool
    {
        if (!$this->can_be_rescheduled) {
            return false;
        }

        // Create new appointment
        $newAppointment = $this->replicate();
        $newAppointment->scheduled_at = $newDateTime;
        $newAppointment->status = 'scheduled';
        $newAppointment->rescheduled_from = $this->id;
        $newAppointment->confirmed_at = null;
        $newAppointment->reminder_sent_at = null;
        $newAppointment->save();

        // Update current appointment
        $this->update([
            'status' => 'rescheduled',
            'rescheduled_to' => $newAppointment->id,
            'cancellation_reason' => $reason ?? 'Rescheduled by request',
        ]);

        return true;
    }

    public function markReminderSent(): bool
    {
        return $this->update(['reminder_sent_at' => now()]);
    }

    public function markConfirmationSent(): bool
    {
        return $this->update(['confirmation_sent_at' => now()]);
    }

    public function generateMeetingLink(): string
    {
        if (!$this->is_telemedicine) {
            return '';
        }

        // Generate unique meeting ID and password
        $meetingId = 'APT-' . $this->id . '-' . now()->format('YmdHi');
        $meetingPassword = substr(str_shuffle('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, 8);

        $this->update([
            'meeting_id' => $meetingId,
            'meeting_password' => $meetingPassword,
            'meeting_link' => config('app.url') . "/telemedicine/join/{$meetingId}",
        ]);

        return $this->meeting_link;
    }

    public function calculateRiskScore(): float
    {
        $riskFactors = 0;
        $totalFactors = 10;

        // Patient age factor
        if ($this->patient->age > 65) $riskFactors += 2;
        elseif ($this->patient->age > 50) $riskFactors += 1;

        // Medical history factors
        if ($this->patient->has_chronic_conditions) $riskFactors += 2;
        if ($this->patient->has_allergies) $riskFactors += 1;

        // Appointment factors
        if ($this->priority === 'urgent') $riskFactors += 2;
        if ($this->appointment_type === 'follow_up') $riskFactors += 1;

        // Historical factors
        $missedAppointments = $this->patient->appointments()
            ->where('status', 'no_show')
            ->where('created_at', '>', now()->subMonths(6))
            ->count();

        if ($missedAppointments > 2) $riskFactors += 2;
        elseif ($missedAppointments > 0) $riskFactors += 1;

        $riskScore = ($riskFactors / $totalFactors) * 10;

        $this->update(['ai_risk_score' => $riskScore]);

        return $riskScore;
    }

    public function generateAIRecommendations(): array
    {
        $recommendations = [];

        // Risk-based recommendations
        if ($this->ai_risk_score > 7) {
            $recommendations[] = [
                'type' => 'high_risk',
                'message' => 'High-risk patient - consider additional monitoring',
                'action' => 'schedule_follow_up',
                'priority' => 'high',
            ];
        }

        // Appointment type recommendations
        if ($this->appointment_type === 'initial_consultation') {
            $recommendations[] = [
                'type' => 'preparation',
                'message' => 'Ensure patient brings all medical records and current medications',
                'action' => 'send_preparation_reminder',
                'priority' => 'medium',
            ];
        }

        // Telemedicine recommendations
        if ($this->is_telemedicine) {
            $recommendations[] = [
                'type' => 'technology',
                'message' => 'Send technology check reminder 1 hour before appointment',
                'action' => 'tech_check_reminder',
                'priority' => 'medium',
            ];
        }

        $this->update(['ai_recommendations' => $recommendations]);

        return $recommendations;
    }

    public function getDurationInHours(): float
    {
        return $this->duration_minutes / 60;
    }

    public function getTimeUntilAppointment(): string
    {
        if ($this->scheduled_at < now()) {
            return 'Past appointment';
        }

        return $this->scheduled_at->diffForHumans();
    }

    public function getStatusColor(): string
    {
        return match($this->status) {
            'scheduled' => 'blue',
            'confirmed' => 'green',
            'checked_in' => 'purple',
            'in_progress' => 'orange',
            'completed' => 'emerald',
            'cancelled' => 'red',
            'no_show' => 'gray',
            'rescheduled' => 'yellow',
            default => 'gray',
        };
    }

    public function getStatusLabel(): string
    {
        return match($this->status) {
            'scheduled' => 'Scheduled',
            'confirmed' => 'Confirmed',
            'checked_in' => 'Checked In',
            'in_progress' => 'In Progress',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
            'no_show' => 'No Show',
            'rescheduled' => 'Rescheduled',
            default => 'Unknown',
        };
    }
}
