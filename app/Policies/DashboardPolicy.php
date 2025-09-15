<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class DashboardPolicy
{
    use HandlesAuthorization;

    /**
     * Super Admin Dashboard access
     */
    public function viewSuperAdminDashboard(User $user): bool
    {
        return $user->role === 'super_admin';
    }

    /**
     * Admin Panel access (for both super admin and hospital admin)
     */
    public function viewAdminPanel(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'hospital_admin']);
    }

    /**
     * User Management access
     */
    public function manageUsers(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'hospital_admin']);
    }

    /**
     * System Settings access
     */
    public function manageSystemSettings(User $user): bool
    {
        return $user->role === 'super_admin';
    }

    /**
     * Facility Management access
     */
    public function manageFacilities(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'hospital_admin']);
    }

    /**
     * Hospital Admin Dashboard access
     */
    public function viewHospitalAdminDashboard(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'hospital_admin']);
    }

    /**
     * Doctor Dashboard access
     */
    public function viewDoctorDashboard(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'hospital_admin', 'doctor']);
    }

    /**
     * Nurse Dashboard access
     */
    public function viewNurseDashboard(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'hospital_admin', 'nurse']);
    }

    /**
     * Dispatcher Dashboard access
     */
    public function viewDispatcherDashboard(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'dispatcher']);
    }

    /**
     * Ambulance Driver Dashboard access
     */
    public function viewAmbulanceDriverDashboard(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'dispatcher', 'ambulance_driver']);
    }

    /**
     * Ambulance Paramedic Dashboard access
     */
    public function viewAmbulanceParamedicDashboard(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'dispatcher', 'ambulance_paramedic']);
    }

    /**
     * Patient Dashboard access
     */
    public function viewPatientDashboard(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'patient']);
    }
}