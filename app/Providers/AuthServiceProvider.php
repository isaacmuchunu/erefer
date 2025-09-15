<?php

namespace App\Providers;

use App\Models\Patient;
use App\Models\Referral;
use App\Models\Ambulance;
use App\Models\User;
use App\Policies\PatientPolicy;
use App\Policies\ReferralPolicy;
use App\Policies\AmbulancePolicy;
use App\Policies\DashboardPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Patient::class => PatientPolicy::class,
        Referral::class => ReferralPolicy::class,
        Ambulance::class => AmbulancePolicy::class,
        User::class => UserPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // Define Gates for role-based permissions
        
        // Administrative permissions
        Gate::define('manage-users', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin']);
        });

        Gate::define('manage-facilities', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin']);
        });

        Gate::define('view-system-reports', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin']);
        });

        Gate::define('manage-system-settings', function (User $user) {
            return $user->role === 'super_admin';
        });

        // Patient data permissions
        Gate::define('view-all-patients', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin', 'doctor', 'nurse']);
        });

        Gate::define('create-patients', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin', 'doctor', 'nurse']);
        });

        Gate::define('view-patient-medical-records', function (User $user, Patient $patient) {
            return app(PatientPolicy::class)->viewMedicalRecords($user, $patient);
        });

        Gate::define('update-patient-medical-records', function (User $user, Patient $patient) {
            return app(PatientPolicy::class)->updateMedicalRecords($user, $patient);
        });

        // Referral permissions
        Gate::define('create-referrals', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin', 'doctor']);
        });

        Gate::define('accept-referrals', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin', 'doctor']);
        });

        Gate::define('reject-referrals', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin', 'doctor']);
        });

        // Ambulance permissions
        Gate::define('dispatch-ambulances', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin', 'dispatcher']);
        });

        Gate::define('manage-ambulance-fleet', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin']);
        });

        Gate::define('track-ambulances', function (User $user) {
            return in_array($user->role, [
                'super_admin', 
                'hospital_admin', 
                'dispatcher', 
                'doctor', 
                'nurse',
                'ambulance_driver',
                'ambulance_paramedic'
            ]);
        });

        Gate::define('update-ambulance-status', function (User $user) {
            return in_array($user->role, [
                'super_admin', 
                'hospital_admin', 
                'dispatcher',
                'ambulance_driver',
                'ambulance_paramedic'
            ]);
        });

        // Communication permissions
        Gate::define('send-emergency-broadcasts', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin', 'dispatcher']);
        });

        Gate::define('access-communication-system', function (User $user) {
            return !in_array($user->role, ['patient']); // All staff can communicate
        });

        Gate::define('create-chat-rooms', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'dispatcher']);
        });

        Gate::define('send-whatsapp-messages', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'dispatcher']);
        });

        Gate::define('send-emails', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin', 'doctor', 'nurse']);
        });

        Gate::define('make-video-calls', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'dispatcher']);
        });

        Gate::define('access-emergency-communications', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin', 'dispatcher', 'ambulance_driver', 'ambulance_paramedic']);
        });

        Gate::define('send-notifications', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'dispatcher']);
        });

        Gate::define('manage-notifications', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin']);
        });

        Gate::define('view-all-notifications', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin']);
        });

        Gate::define('manage-ambulances', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin', 'dispatcher']);
        });

        Gate::define('view-all-dispatches', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin', 'dispatcher']);
        });

        // Equipment permissions
        Gate::define('manage-equipment', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin']);
        });

        Gate::define('view-equipment', function (User $user) {
            return in_array($user->role, [
                'super_admin', 
                'hospital_admin', 
                'doctor', 
                'nurse'
            ]);
        });

        // Bed management permissions
        Gate::define('manage-beds', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin', 'nurse']);
        });

        Gate::define('reserve-beds', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin', 'doctor', 'nurse']);
        });

        // Analytics and reporting permissions
        Gate::define('view-analytics', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin', 'doctor']);
        });

        Gate::define('export-reports', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin']);
        });

        // Audit permissions
        Gate::define('view-audit-logs', function (User $user) {
            return in_array($user->role, ['super_admin', 'hospital_admin']);
        });

        // Emergency permissions
        Gate::define('declare-emergency', function (User $user) {
            return in_array($user->role, [
                'super_admin', 
                'hospital_admin', 
                'doctor', 
                'dispatcher'
            ]);
        });

        Gate::define('manage-emergency-response', function (User $user) {
            return in_array($user->role, [
                'super_admin', 
                'hospital_admin', 
                'dispatcher',
                'ambulance_driver',
                'ambulance_paramedic'
            ]);
        });
    }
}
