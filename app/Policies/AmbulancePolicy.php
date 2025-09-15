<?php

namespace App\Policies;

use App\Models\Ambulance;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class AmbulancePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any ambulances.
     */
    public function viewAny(User $user): bool
    {
        // Ambulance staff, dispatchers, and admins can view ambulances
        return in_array($user->role, [
            'super_admin', 
            'hospital_admin', 
            'dispatcher', 
            'ambulance_driver', 
            'ambulance_paramedic'
        ]);
    }

    /**
     * Determine whether the user can view the ambulance.
     */
    public function view(User $user, Ambulance $ambulance): bool
    {
        // Admins and dispatchers can view any ambulance
        if (in_array($user->role, ['super_admin', 'hospital_admin', 'dispatcher'])) {
            return true;
        }

        // Ambulance staff can view ambulances they're assigned to
        if (in_array($user->role, ['ambulance_driver', 'ambulance_paramedic'])) {
            return $ambulance->crews()->where('user_id', $user->id)->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can create ambulances.
     */
    public function create(User $user): bool
    {
        // Only admins can create ambulances
        return in_array($user->role, ['super_admin', 'hospital_admin']);
    }

    /**
     * Determine whether the user can update the ambulance.
     */
    public function update(User $user, Ambulance $ambulance): bool
    {
        // Admins can update any ambulance
        if (in_array($user->role, ['super_admin', 'hospital_admin'])) {
            return true;
        }

        // Dispatchers can update status and location
        if ($user->role === 'dispatcher') {
            return true;
        }

        // Ambulance staff can update their assigned ambulance status
        if (in_array($user->role, ['ambulance_driver', 'ambulance_paramedic'])) {
            return $ambulance->crews()->where('user_id', $user->id)->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can delete the ambulance.
     */
    public function delete(User $user, Ambulance $ambulance): bool
    {
        // Only super admins can delete ambulances
        return $user->role === 'super_admin';
    }

    /**
     * Determine whether the user can dispatch the ambulance.
     */
    public function dispatch(User $user, Ambulance $ambulance): bool
    {
        // Dispatchers and admins can dispatch ambulances
        return in_array($user->role, ['super_admin', 'hospital_admin', 'dispatcher']);
    }

    /**
     * Determine whether the user can update ambulance location.
     */
    public function updateLocation(User $user, Ambulance $ambulance): bool
    {
        // Dispatchers, admins, and assigned crew can update location
        if (in_array($user->role, ['super_admin', 'hospital_admin', 'dispatcher'])) {
            return true;
        }

        if (in_array($user->role, ['ambulance_driver', 'ambulance_paramedic'])) {
            return $ambulance->crews()->where('user_id', $user->id)->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can view ambulance tracking.
     */
    public function viewTracking(User $user, Ambulance $ambulance): bool
    {
        // Dispatchers, admins, and involved medical staff can view tracking
        if (in_array($user->role, ['super_admin', 'hospital_admin', 'dispatcher'])) {
            return true;
        }

        // Doctors and nurses involved in referrals can track ambulances
        if (in_array($user->role, ['doctor', 'nurse'])) {
            return $ambulance->dispatches()
                ->whereHas('referral', function ($query) use ($user) {
                    if ($user->role === 'doctor' && $user->doctor) {
                        $query->where('referring_doctor_id', $user->doctor->id)
                              ->orWhere('receiving_doctor_id', $user->doctor->id);
                    } elseif ($user->role === 'nurse') {
                        $query->where('referring_facility_id', $user->facility_id)
                              ->orWhere('receiving_facility_id', $user->facility_id);
                    }
                })
                ->exists();
        }

        // Ambulance crew can view their own ambulance tracking
        if (in_array($user->role, ['ambulance_driver', 'ambulance_paramedic'])) {
            return $ambulance->crews()->where('user_id', $user->id)->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can manage ambulance crew.
     */
    public function manageCrew(User $user, Ambulance $ambulance): bool
    {
        // Only admins and dispatchers can manage crew assignments
        return in_array($user->role, ['super_admin', 'hospital_admin', 'dispatcher']);
    }
}
