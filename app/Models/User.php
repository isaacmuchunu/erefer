<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'phone',
        'role',
        'status',
        'last_login_at',
        'two_factor_enabled',
        'two_factor_secret',
        'notification_preferences',
    ];

    /**
     * The attributes that should have default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'role' => 'patient',
        'status' => 'active',
        'two_factor_enabled' => false,
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'two_factor_enabled' => 'boolean',
        'notification_preferences' => 'array',
        'password' => 'hashed',
    ];

    // Accessors & Mutators
    protected function fullName(): Attribute
    {
        return Attribute::make(
            get: fn () => "{$this->first_name} {$this->last_name}"
        );
    }

    protected function isActive(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'active'
        );
    }

    // Relationships
    public function doctor(): HasOne
    {
        return $this->hasOne(Doctor::class);
    }

    public function patient(): HasOne
    {
        return $this->hasOne(Patient::class, 'email', 'email');
    }

    public function ambulanceCrew(): HasOne
    {
        return $this->hasOne(AmbulanceCrew::class);
    }

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    public function sentCommunications(): HasMany
    {
        return $this->hasMany(Communication::class, 'sender_id');
    }

    public function receivedCommunications(): HasMany
    {
        return $this->hasMany(Communication::class, 'receiver_id');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function referralFeedback(): HasMany
    {
        return $this->hasMany(ReferralFeedback::class, 'feedback_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    public function scopeWithTwoFactor($query)
    {
        return $query->where('two_factor_enabled', true);
    }

    // Methods
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role, $roles);
    }

    public function canAccessFacility(Facility $facility): bool
    {
        return $this->facility_id === $facility->id || $this->role === 'super_admin';
    }

    public function getUnreadNotificationsCount(): int
    {
        return $this->unreadNotifications()->count();
    }

    /**
     * Check if user is an admin (super_admin or hospital_admin)
     */
    public function isAdmin(): bool
    {
        return in_array($this->role, ['super_admin', 'hospital_admin']);
    }

    /**
     * Check if user is medical staff (doctor or nurse)
     */
    public function isMedicalStaff(): bool
    {
        return in_array($this->role, ['doctor', 'nurse']);
    }

    /**
     * Check if user is ambulance staff
     */
    public function isAmbulanceStaff(): bool
    {
        return in_array($this->role, ['ambulance_driver', 'ambulance_paramedic']);
    }

    /**
     * Check if user can access patient data
     */
    public function canAccessPatientData(Patient $patient): bool
    {
        // Admins can access any patient data
        if ($this->isAdmin()) {
            return true;
        }

        // Patients can only access their own data
        if ($this->role === 'patient') {
            return $this->patient && $this->patient->id === $patient->id;
        }

        // Doctors can access patients they're treating
        if ($this->role === 'doctor' && $this->doctor) {
            return $patient->referrals()
                ->where(function ($query) {
                    $query->where('referring_doctor_id', $this->doctor->id)
                          ->orWhere('receiving_doctor_id', $this->doctor->id);
                })
                ->exists();
        }

        // Nurses can access patients in their facility
        if ($this->role === 'nurse') {
            return $this->facility_id &&
                   $patient->referrals()
                       ->where(function ($query) {
                           $query->where('referring_facility_id', $this->facility_id)
                                 ->orWhere('receiving_facility_id', $this->facility_id);
                       })
                       ->exists();
        }

        return false;
    }

    /**
     * Get accessible patients for the user
     */
    public function getAccessiblePatients()
    {
        if ($this->isAdmin()) {
            return Patient::query();
        }

        if ($this->role === 'patient') {
            return Patient::where('id', $this->patient?->id);
        }

        if ($this->role === 'doctor' && $this->doctor) {
            return Patient::whereHas('referrals', function ($query) {
                $query->where('referring_doctor_id', $this->doctor->id)
                      ->orWhere('receiving_doctor_id', $this->doctor->id);
            });
        }

        if ($this->role === 'nurse' && $this->facility_id) {
            return Patient::whereHas('referrals', function ($query) {
                $query->where('referring_facility_id', $this->facility_id)
                      ->orWhere('receiving_facility_id', $this->facility_id);
            });
        }

        return Patient::whereRaw('1 = 0'); // Return empty query
    }
}
 ?>
