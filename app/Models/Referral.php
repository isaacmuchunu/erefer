<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\SoftDeletes;

class Referral extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'referral_number',
        'patient_id',
        'referring_facility_id',
        'referring_doctor_id',
        'receiving_facility_id',
        'receiving_doctor_id',
        'specialty_id',
        'urgency',
        'type',
        'clinical_summary',
        'reason_for_referral',
        'vital_signs',
        'investigations_done',
        'current_medications',
        'treatment_given',
        'transport_required',
        'bed_required',
        'bed_type_id',
        'status',
        'rejection_reason',
        'referred_at',
        'response_deadline',
        'responded_at',
        'patient_arrived_at',
        'completed_at',
        'outcome',
        'estimated_cost',
        'special_requirements',
    ];

    protected $casts = [
        'vital_signs' => 'array',
        'investigations_done' => 'array',
        'current_medications' => 'array',
        'bed_required' => 'boolean',
        'referred_at' => 'datetime',
        'response_deadline' => 'datetime',
        'responded_at' => 'datetime',
        'patient_arrived_at' => 'datetime',
        'completed_at' => 'datetime',
        'outcome' => 'array',
        'estimated_cost' => 'decimal:2',
    ];

    // Accessors & Mutators
    protected function isUrgent(): Attribute
    {
        return Attribute::make(
            get: fn () => in_array($this->urgency, ['emergency', 'urgent'])
        );
    }

    protected function isExpired(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'pending' && $this->response_deadline < now()
        );
    }

    protected function responseTime(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->responded_at?->diffInMinutes($this->referred_at)
        );
    }

    protected function totalTime(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->completed_at?->diffInHours($this->referred_at)
        );
    }

    protected function isInProgress(): Attribute
    {
        return Attribute::make(
            get: fn () => in_array($this->status, ['accepted', 'in_transit', 'arrived'])
        );
    }

    // Relationships
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function referringFacility(): BelongsTo
    {
        return $this->belongsTo(Facility::class, 'referring_facility_id');
    }

    public function receivingFacility(): BelongsTo
    {
        return $this->belongsTo(Facility::class, 'receiving_facility_id');
    }

    public function referringDoctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'referring_doctor_id');
    }

    public function receivingDoctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'receiving_doctor_id');
    }

    public function specialty(): BelongsTo
    {
        return $this->belongsTo(Specialty::class);
    }

    public function bedType(): BelongsTo
    {
        return $this->belongsTo(BedType::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ReferralDocument::class);
    }

    public function communications(): HasMany
    {
        return $this->hasMany(Communication::class);
    }

    public function ambulanceDispatch(): HasOne
    {
        return $this->hasOne(AmbulanceDispatch::class);
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(ReferralFeedback::class);
    }

    public function timeline(): HasMany
    {
        return $this->hasMany(ReferralTimeline::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeUrgent($query)
    {
        return $query->whereIn('urgency', ['emergency', 'urgent']);
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'pending')
            ->where('response_deadline', '<', now());
    }

    public function scopeByFacility($query, int $facilityId)
    {
        return $query->where('referring_facility_id', $facilityId)
            ->orWhere('receiving_facility_id', $facilityId);
    }

    public function scopeBySpecialty($query, int $specialtyId)
    {
        return $query->where('specialty_id', $specialtyId);
    }

    public function scopeInDateRange($query, $from, $to)
    {
        return $query->whereBetween('referred_at', [$from, $to]);
    }

    public function scopeRequiringTransport($query)
    {
        return $query->where('transport_required', '!=', 'none');
    }

    public function scopeRequiringBed($query)
    {
        return $query->where('bed_required', true);
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopeInTransit($query)
    {
        return $query->where('status', 'in_transit');
    }

    public function scopeArrived($query)
    {
        return $query->where('status', 'arrived');
    }

    public function scopeInProgress($query)
    {
        return $query->whereIn('status', ['accepted', 'in_transit', 'arrived']);
    }

    public function scopeByUrgency($query, string $urgency)
    {
        return $query->where('urgency', $urgency);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByDoctor($query, int $doctorId)
    {
        return $query->where('referring_doctor_id', $doctorId)
            ->orWhere('receiving_doctor_id', $doctorId);
    }

    public function scopeByPatient($query, int $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('referred_at', today());
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('referred_at', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ]);
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('referred_at', now()->month)
            ->whereYear('referred_at', now()->year);
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'pending')
            ->where('response_deadline', '<', now());
    }

    public function scopeDueSoon($query, int $hours = 2)
    {
        return $query->where('status', 'pending')
            ->where('response_deadline', '<=', now()->addHours($hours))
            ->where('response_deadline', '>', now());
    }

    public function scopeWithDocuments($query)
    {
        return $query->whereHas('documents');
    }

    public function scopeWithoutDocuments($query)
    {
        return $query->whereDoesntHave('documents');
    }

    public function scopeWithFeedback($query)
    {
        return $query->whereHas('feedback');
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('referral_number', 'like', "%{$search}%")
              ->orWhere('clinical_summary', 'like', "%{$search}%")
              ->orWhere('reason_for_referral', 'like', "%{$search}%")
              ->orWhereHas('patient', function($pq) use ($search) {
                  $pq->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('medical_record_number', 'like', "%{$search}%");
              });
        });
    }

    public function scopeHighPriority($query)
    {
        return $query->whereIn('urgency', ['emergency', 'urgent'])
            ->orWhereHas('patient', function($q) {
                $q->where('is_high_risk', true);
            });
    }

    public function scopeRequiringAmbulance($query)
    {
        return $query->whereIn('transport_required', ['ambulance', 'emergency_ambulance']);
    }

    public function scopeByBedType($query, int $bedTypeId)
    {
        return $query->where('bed_type_id', $bedTypeId);
    }

    // Methods
    public function generateReferralNumber(): string
    {
        $year = now()->year;
        $month = now()->format('m');
        $sequence = static::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->count() + 1;
        
        return sprintf('REF%d%s%06d', $year, $month, $sequence);
    }

    public function accept(Doctor $doctor, ?array $additionalData = null): bool
    {
        return $this->update([
            'status' => 'accepted',
            'receiving_doctor_id' => $doctor->id,
            'responded_at' => now(),
            'estimated_cost' => $additionalData['estimated_cost'] ?? null,
        ]);
    }

    public function reject(string $reason): bool
    {
        return $this->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
            'responded_at' => now(),
        ]);
    }

    public function markCompleted(array $outcome): bool
    {
        return $this->update([
            'status' => 'completed',
            'completed_at' => now(),
            'outcome' => $outcome,
        ]);
    }

    public function calculatePriority(): int
    {
        $priority = match($this->urgency) {
            'emergency' => 100,
            'urgent' => 75,
            'semi_urgent' => 50,
            'routine' => 25,
            default => 0,
        };

        // Adjust priority based on patient age
        if ($this->patient && $this->patient->age < 18) {
            $priority += 10; // Children get higher priority
        }

        if ($this->patient && $this->patient->age > 65) {
            $priority += 5; // Elderly get slightly higher priority
        }

        // Adjust for high-risk patients
        if ($this->patient && $this->patient->is_high_risk) {
            $priority += 15;
        }

        return min($priority, 100);
    }

    public function canBeModified(): bool
    {
        return in_array($this->status, ['pending', 'accepted']);
    }

    public function requiresImmediateAttention(): bool
    {
        return $this->urgency === 'emergency' || 
            ($this->urgency === 'urgent' && $this->response_deadline < now()->addHours(2));
    }
}
?>