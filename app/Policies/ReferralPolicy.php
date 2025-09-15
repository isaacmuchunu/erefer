<?php

namespace App\Policies;

use App\Models\Referral;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ReferralPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any referrals.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users except patients can view referral lists
        return !in_array($user->role, ['patient']);
    }

    /**
     * Determine whether the user can view the referral.
     */
    public function view(User $user, Referral $referral): bool
    {
        // Admins can view any referral
        if (in_array($user->role, ['super_admin', 'hospital_admin'])) {
            return true;
        }

        // Patients can view their own referrals
        if ($user->role === 'patient') {
            return $user->patient && $user->patient->id === $referral->patient_id;
        }

        // Doctors can view referrals they're involved in
        if ($user->role === 'doctor' && $user->doctor) {
            return $referral->referring_doctor_id === $user->doctor->id ||
                   $referral->receiving_doctor_id === $user->doctor->id;
        }

        // Nurses can view referrals in their facility
        if ($user->role === 'nurse') {
            return $user->facility_id && 
                   ($referral->referring_facility_id === $user->facility_id ||
                    $referral->receiving_facility_id === $user->facility_id);
        }

        // Dispatchers can view referrals that need ambulance services
        if ($user->role === 'dispatcher') {
            return $referral->requires_ambulance || $referral->ambulanceDispatch()->exists();
        }

        // Ambulance staff can view referrals they're assigned to
        if (in_array($user->role, ['ambulance_driver', 'ambulance_paramedic'])) {
            return $referral->ambulanceDispatch()
                ->whereHas('ambulance.crews', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can create referrals.
     */
    public function create(User $user): bool
    {
        // Doctors and admins can create referrals
        return in_array($user->role, ['super_admin', 'hospital_admin', 'doctor']);
    }

    /**
     * Determine whether the user can update the referral.
     */
    public function update(User $user, Referral $referral): bool
    {
        // Admins can update any referral
        if (in_array($user->role, ['super_admin', 'hospital_admin'])) {
            return true;
        }

        // Referring doctor can update before acceptance
        if ($user->role === 'doctor' && $user->doctor) {
            if ($referral->referring_doctor_id === $user->doctor->id && 
                in_array($referral->status, ['pending', 'in_review'])) {
                return true;
            }

            // Receiving doctor can update after acceptance
            if ($referral->receiving_doctor_id === $user->doctor->id && 
                in_array($referral->status, ['accepted', 'in_progress'])) {
                return true;
            }
        }

        // Nurses can update status and notes for referrals in their facility
        if ($user->role === 'nurse') {
            return $user->facility_id && 
                   ($referral->referring_facility_id === $user->facility_id ||
                    $referral->receiving_facility_id === $user->facility_id);
        }

        return false;
    }

    /**
     * Determine whether the user can delete the referral.
     */
    public function delete(User $user, Referral $referral): bool
    {
        // Only super admins and referring doctors (before acceptance) can delete
        if ($user->role === 'super_admin') {
            return true;
        }

        if ($user->role === 'doctor' && $user->doctor) {
            return $referral->referring_doctor_id === $user->doctor->id &&
                   in_array($referral->status, ['pending', 'draft']);
        }

        return false;
    }

    /**
     * Determine whether the user can accept the referral.
     */
    public function accept(User $user, Referral $referral): bool
    {
        // Only doctors at the receiving facility can accept
        if ($user->role === 'doctor' && $user->doctor) {
            return $user->facility_id === $referral->receiving_facility_id &&
                   $referral->status === 'pending';
        }

        return false;
    }

    /**
     * Determine whether the user can reject the referral.
     */
    public function reject(User $user, Referral $referral): bool
    {
        // Doctors at receiving facility and admins can reject
        if (in_array($user->role, ['super_admin', 'hospital_admin'])) {
            return true;
        }

        if ($user->role === 'doctor' && $user->doctor) {
            return $user->facility_id === $referral->receiving_facility_id &&
                   in_array($referral->status, ['pending', 'in_review']);
        }

        return false;
    }

    /**
     * Determine whether the user can dispatch ambulance for referral.
     */
    public function dispatchAmbulance(User $user, Referral $referral): bool
    {
        // Dispatchers and admins can dispatch ambulances
        return in_array($user->role, ['super_admin', 'hospital_admin', 'dispatcher']);
    }
}
