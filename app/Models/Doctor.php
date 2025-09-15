<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\SoftDeletes;

class Doctor extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'facility_id',
        'medical_license_number',
        'license_expiry',
        'qualifications',
        'years_of_experience',
        'languages_spoken',
        'bio',
        'consultation_fee',
        'availability_schedule',
        'accepts_referrals',
        'max_daily_referrals',
        'rating',
        'rating_count',
        'status',
    ];

    protected $casts = [
        'license_expiry' => 'date',
        'qualifications' => 'array',
        'languages_spoken' => 'array',
        'availability_schedule' => 'array',
        'accepts_referrals' => 'boolean',
        'consultation_fee' => 'decimal:2',
        'rating' => 'decimal:2',
    ];

    // Accessors & Mutators
    protected function isAvailable(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'active' && $this->accepts_referrals
        );
    }

    protected function dailyReferralCount(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->referralsReceived()
                ->whereDate('created_at', today())
                ->count()
        );
    }

    protected function canAcceptMoreReferrals(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->daily_referral_count < $this->max_daily_referrals
        );
    }

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    public function specialties(): BelongsToMany
    {
        return $this->belongsToMany(Specialty::class, 'doctor_specialties')
            ->withPivot(['primary_specialty', 'years_of_experience_in_specialty', 'certifications'])
            ->withTimestamps();
    }

    public function referralsReceived(): HasMany
    {
        return $this->hasMany(Referral::class, 'receiving_doctor_id');
    }

    public function referralsMade(): HasMany
    {
        return $this->hasMany(Referral::class, 'referring_doctor_id');
    }

    public function departments(): BelongsToMany
    {
        return $this->belongsToMany(Department::class, 'doctor_departments');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeAcceptingReferrals($query)
    {
        return $query->where('accepts_referrals', true)
            ->where('status', 'active');
    }

    public function scopeWithSpecialty($query, int $specialtyId)
    {
        return $query->whereHas('specialties', function ($q) use ($specialtyId) {
            $q->where('specialty_id', $specialtyId);
        });
    }

    public function scopeAtFacility($query, int $facilityId)
    {
        return $query->where('facility_id', $facilityId);
    }

    public function scopeAvailableNow($query)
    {
        return $query->where('status', 'active')
            ->where('accepts_referrals', true)
            ->whereRaw('
                JSON_EXTRACT(availability_schedule, CONCAT("$.day_", DAYOFWEEK(NOW()) - 1, ".available")) = true
            ');
    }

    // Methods
    public function hasSpecialty(int $specialtyId): bool
    {
        return $this->specialties()->where('specialty_id', $specialtyId)->exists();
    }

    public function getPrimarySpecialty(): ?Specialty
    {
        return $this->specialties()
            ->wherePivot('primary_specialty', true)
            ->first();
    }

    public function isAvailableAt(\DateTime $dateTime): bool
    {
        $dayOfWeek = $dateTime->format('N') - 1; // 0-6 for Monday-Sunday
        $schedule = $this->availability_schedule;
        
        if (!isset($schedule["day_{$dayOfWeek}"])) {
            return false;
        }
        
        $daySchedule = $schedule["day_{$dayOfWeek}"];
        
        if (!$daySchedule['available']) {
            return false;
        }
        
        $currentTime = $dateTime->format('H:i');
        return $currentTime >= $daySchedule['start_time'] && $currentTime <= $daySchedule['end_time'];
    }

    public function updateRating(float $newRating): void
    {
        $totalRating = ($this->rating * $this->rating_count) + $newRating;
        $newCount = $this->rating_count + 1;
        
        $this->update([
            'rating' => round($totalRating / $newCount, 2),
            'rating_count' => $newCount,
        ]);
    }
}
?>