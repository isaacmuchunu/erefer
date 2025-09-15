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
use Illuminate\Support\Facades\Hash;
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
        'role_id',
        'status',
        'last_login_at',
        'two_factor_enabled',
        'two_factor_secret',
        'notification_preferences',
        'permissions',
        'last_password_change',
        'password_expires_at',
        'failed_login_attempts',
        'locked_until',
        'must_change_password',
        'security_questions',
        'preferences',
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
        'last_password_change' => 'datetime',
        'password_expires_at' => 'datetime',
        'locked_until' => 'datetime',
        'two_factor_enabled' => 'boolean',
        'must_change_password' => 'boolean',
        'notification_preferences' => 'array',
        'permissions' => 'array',
        'security_questions' => 'array',
        'preferences' => 'array',
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
    public function roleModel(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function userSessions(): HasMany
    {
        return $this->hasMany(UserSession::class);
    }

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

    // Enhanced RBAC Methods

    /**
     * Check if user has a specific permission
     */
    public function hasPermission(string $permission): bool
    {
        // Check user-specific permissions first
        if ($this->permissions && in_array($permission, $this->permissions)) {
            return true;
        }

        // Check role-based permissions
        if ($this->roleModel) {
            return $this->roleModel->hasPermission($permission);
        }

        return false;
    }

    /**
     * Check if user has any of the given permissions
     */
    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if user has all of the given permissions
     */
    public function hasAllPermissions(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (!$this->hasPermission($permission)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Give permission to user (user-specific)
     */
    public function givePermission(string $permission): void
    {
        $permissions = $this->permissions ?? [];
        if (!in_array($permission, $permissions)) {
            $permissions[] = $permission;
            $this->update(['permissions' => $permissions]);
        }
    }

    /**
     * Revoke permission from user (user-specific)
     */
    public function revokePermission(string $permission): void
    {
        $permissions = $this->permissions ?? [];
        $permissions = array_diff($permissions, [$permission]);
        $this->update(['permissions' => array_values($permissions)]);
    }

    /**
     * Check if account is locked
     */
    public function isLocked(): bool
    {
        return $this->locked_until && $this->locked_until->isFuture();
    }

    /**
     * Check if password has expired
     */
    public function isPasswordExpired(): bool
    {
        return $this->password_expires_at && $this->password_expires_at->isPast();
    }

    /**
     * Lock user account
     */
    public function lockAccount(int $minutes = 30): void
    {
        $this->update([
            'locked_until' => now()->addMinutes($minutes),
            'failed_login_attempts' => 0,
        ]);
    }

    /**
     * Unlock user account
     */
    public function unlockAccount(): void
    {
        $this->update([
            'locked_until' => null,
            'failed_login_attempts' => 0,
        ]);
    }

    /**
     * Increment failed login attempts
     */
    public function incrementFailedLoginAttempts(): void
    {
        $attempts = $this->failed_login_attempts + 1;
        $this->update(['failed_login_attempts' => $attempts]);

        // Lock account after 5 failed attempts
        if ($attempts >= 5) {
            $this->lockAccount();
        }
    }

    /**
     * Reset failed login attempts
     */
    public function resetFailedLoginAttempts(): void
    {
        $this->update(['failed_login_attempts' => 0]);
    }

    /**
     * Set password with expiration
     */
    public function setPasswordWithExpiration(string $password, int $daysUntilExpiration = 90): void
    {
        $this->update([
            'password' => Hash::make($password),
            'last_password_change' => now(),
            'password_expires_at' => now()->addDays($daysUntilExpiration),
            'must_change_password' => false,
        ]);
    }

    /**
     * Force password change on next login
     */
    public function forcePasswordChange(): void
    {
        $this->update(['must_change_password' => true]);
    }

    /**
     * Get user's dashboard route based on role
     */
    public function getDashboardRoute(): string
    {
        $roleRoutes = [
            'super_admin' => 'dashboards.super-admin',
            'hospital_admin' => 'dashboards.hospital-admin',
            'doctor' => 'dashboards.doctor',
            'nurse' => 'dashboards.nurse',
            'dispatcher' => 'dashboards.dispatcher',
            'ambulance_driver' => 'dashboards.ambulance-driver',
            'ambulance_paramedic' => 'dashboards.ambulance-paramedic',
            'patient' => 'dashboards.patient',
        ];

        return $roleRoutes[$this->role] ?? 'dashboard';
    }

    /**
     * Get user's layout component based on role
     */
    public function getLayoutComponent(): string
    {
        $roleLayouts = [
            'super_admin' => 'SuperAdminLayout',
            'hospital_admin' => 'HospitalAdminLayout',
            'doctor' => 'DoctorLayout',
            'nurse' => 'NurseLayout',
            'dispatcher' => 'DispatcherLayout',
            'ambulance_driver' => 'AmbulanceDriverLayout',
            'ambulance_paramedic' => 'AmbulanceDriverLayout',
            'patient' => 'PatientLayout',
        ];

        return $roleLayouts[$this->role] ?? 'AppLayout';
    }

    /**
     * Get user's role color for UI
     */
    public function getRoleColor(): string
    {
        return $this->roleModel?->color ?? '#6B7280';
    }

    /**
     * Get user's role icon for UI
     */
    public function getRoleIcon(): string
    {
        return $this->roleModel?->icon ?? 'User';
    }

    /**
     * Check if user can impersonate another user
     */
    public function canImpersonate(): bool
    {
        return $this->role === 'super_admin';
    }

    /**
     * Check if user can be impersonated
     */
    public function canBeImpersonated(): bool
    {
        return $this->role !== 'super_admin';
    }

    /**
     * Get active sessions for user
     */
    public function getActiveSessions()
    {
        return $this->userSessions()
            ->where('is_active', true)
            ->where('last_activity', '>', now()->subMinutes(30))
            ->orderBy('last_activity', 'desc')
            ->get();
    }

    /**
     * Terminate all sessions except current
     */
    public function terminateOtherSessions(string $currentSessionId = null): void
    {
        $query = $this->userSessions()->where('is_active', true);
        
        if ($currentSessionId) {
            $query->where('session_id', '!=', $currentSessionId);
        }
        
        $query->update(['is_active' => false]);
    }
}
 ?>
