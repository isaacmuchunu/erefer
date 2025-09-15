<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Carbon\Carbon;

class Patient extends Authenticatable
{
    use HasFactory, SoftDeletes, Notifiable, HasApiTokens;

    protected $fillable = [
        'medical_record_number',
        'first_name',
        'last_name',
        'email',
        'password',
        'date_of_birth',
        'gender',
        'phone',
        'whatsapp_number',
        'address',
        'national_id',
        'insurance_info',
        'emergency_contacts',
        'emergency_contact_name',
        'emergency_contact_phone',
        'medical_history',
        'allergies',
        'current_medications',
        'blood_group',
        'communication_preferences',
        'avatar',
        'email_verified_at',
        'phone_verified_at',
        'special_notes',
        'consent_for_data_sharing',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'email_verified_at' => 'datetime',
        'phone_verified_at' => 'datetime',
        'password' => 'hashed',
        'address' => 'array',
        'insurance_info' => 'array',
        'emergency_contacts' => 'array',
        'medical_history' => 'array',
        'allergies' => 'array',
        'current_medications' => 'array',
        'communication_preferences' => 'array',
        'consent_for_data_sharing' => 'boolean',
    ];

    // Accessors & Mutators
    protected function fullName(): Attribute
    {
        return Attribute::make(
            get: fn () => "{$this->first_name} {$this->last_name}"
        );
    }

    protected function age(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->date_of_birth?->diffInYears(now())
        );
    }

    protected function isMinor(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->age < 18
        );
    }

    protected function hasAllergies(): Attribute
    {
        return Attribute::make(
            get: fn () => !empty($this->allergies)
        );
    }

    protected function isHighRisk(): Attribute
    {
        return Attribute::make(
            get: fn () => !empty($this->medical_history) && 
                collect($this->medical_history)->contains(fn ($condition) => 
                    in_array(strtolower($condition['condition'] ?? ''), [
                        'diabetes', 'hypertension', 'heart disease', 'kidney disease', 'cancer'
                    ])
                )
        );
    }

    // Relationships
    public function referrals(): HasMany
    {
        return $this->hasMany(Referral::class);
    }

    public function bedReservations(): HasMany
    {
        return $this->hasMany(BedReservation::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(PatientDocument::class);
    }

    // Scopes
    public function scopeMinors($query)
    {
        return $query->whereRaw('DATEDIFF(NOW(), date_of_birth) < (18 * 365)');
    }

    public function scopeAdults($query)
    {
        return $query->whereRaw('DATEDIFF(NOW(), date_of_birth) >= (18 * 365)');
    }

    public function scopeSeniors($query)
    {
        return $query->whereRaw('DATEDIFF(NOW(), date_of_birth) >= (65 * 365)');
    }

    public function scopeByAgeRange($query, int $minAge, int $maxAge)
    {
        return $query->whereRaw('DATEDIFF(NOW(), date_of_birth) BETWEEN ? AND ?', [
            $minAge * 365, $maxAge * 365
        ]);
    }

    public function scopeByBloodGroup($query, string $bloodGroup)
    {
        return $query->where('blood_group', $bloodGroup);
    }

    public function scopeWithConsent($query)
    {
        return $query->where('consent_for_data_sharing', true);
    }

    public function scopeByGender($query, string $gender)
    {
        return $query->where('gender', $gender);
    }

    public function scopeHighRisk($query)
    {
        return $query->whereNotNull('medical_history')
            ->whereRaw("JSON_SEARCH(medical_history, 'one', 'diabetes') IS NOT NULL 
                       OR JSON_SEARCH(medical_history, 'one', 'hypertension') IS NOT NULL
                       OR JSON_SEARCH(medical_history, 'one', 'heart disease') IS NOT NULL
                       OR JSON_SEARCH(medical_history, 'one', 'kidney disease') IS NOT NULL
                       OR JSON_SEARCH(medical_history, 'one', 'cancer') IS NOT NULL");
    }

    public function scopeWithAllergies($query)
    {
        return $query->whereNotNull('allergies')
            ->whereRaw("JSON_LENGTH(allergies) > 0");
    }

    public function scopeRecentlyAdmitted($query, int $days = 30)
    {
        return $query->whereHas('referrals', function ($q) use ($days) {
            $q->where('status', 'completed')
              ->where('completed_at', '>=', now()->subDays($days));
        });
    }

    public function scopeWithActiveReferrals($query)
    {
        return $query->whereHas('referrals', function ($q) {
            $q->whereIn('status', ['pending', 'accepted', 'in_transit', 'arrived']);
        });
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%")
              ->orWhere('medical_record_number', 'like', "%{$search}%")
              ->orWhere('phone', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
        });
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(PatientNotification::class);
    }

    public function followUps(): HasMany
    {
        return $this->hasMany(PatientFollowUp::class);
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    public function medicalRecords(): HasMany
    {
        return $this->hasMany(MedicalRecord::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    // Methods
    public function getActiveReferrals()
    {
        return $this->referrals()
            ->whereIn('status', ['pending', 'accepted', 'in_transit', 'arrived'])
            ->with(['referringFacility', 'receivingFacility', 'specialty'])
            ->latest()
            ->get();
    }

    public function getEmergencyContact(string $relationship = 'primary')
    {
        return collect($this->emergency_contacts)
            ->firstWhere('relationship', $relationship);
    }

    public function hasAllergy(string $allergen): bool
    {
        return collect($this->allergies)->contains(function ($allergy) use ($allergen) {
            return stripos($allergy['allergen'] ?? '', $allergen) !== false;
        });
    }

    public function addMedicalHistory(string $condition, string $date, ?string $notes = null): void
    {
        $history = $this->medical_history ?? [];
        $history[] = [
            'condition' => $condition,
            'date' => $date,
            'notes' => $notes,
            'added_at' => now()->toDateTimeString(),
        ];
        
        $this->update(['medical_history' => $history]);
    }

    public function generateMRN(): string
    {
        $year = now()->year;
        $sequence = static::whereYear('created_at', $year)->count() + 1;
        return sprintf('MRN%d%06d', $year, $sequence);
    }
}
?>