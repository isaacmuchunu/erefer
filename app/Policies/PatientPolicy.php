<?php

namespace App\Policies;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class PatientPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any patients.
     */
    public function viewAny(User $user): bool
    {
        // Admins, doctors, and nurses can view patient lists
        return in_array($user->role, ['super_admin', 'hospital_admin', 'doctor', 'nurse']);
    }

    /**
     * Determine whether the user can view the patient.
     */
    public function view(User $user, Patient $patient): bool
    {
        // Admins can view any patient
        if (in_array($user->role, ['super_admin', 'hospital_admin'])) {
            return true;
        }

        // Patients can only view their own data
        if ($user->role === 'patient') {
            return $user->patient && $user->patient->id === $patient->id;
        }

        // Doctors can view patients they're treating or have referred
        if ($user->role === 'doctor' && $user->doctor) {
            return $patient->referrals()
                ->where(function ($query) use ($user) {
                    $query->where('referring_doctor_id', $user->doctor->id)
                          ->orWhere('receiving_doctor_id', $user->doctor->id);
                })
                ->exists();
        }

        // Nurses can view patients in their facility
        if ($user->role === 'nurse') {
            return $user->facility_id && 
                   $patient->referrals()
                       ->where(function ($query) use ($user) {
                           $query->where('referring_facility_id', $user->facility_id)
                                 ->orWhere('receiving_facility_id', $user->facility_id);
                       })
                       ->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can create patients.
     */
    public function create(User $user): bool
    {
        // Admins, doctors, and nurses can create patients
        return in_array($user->role, ['super_admin', 'hospital_admin', 'doctor', 'nurse']);
    }

    /**
     * Determine whether the user can update the patient.
     */
    public function update(User $user, Patient $patient): bool
    {
        // Admins can update any patient
        if (in_array($user->role, ['super_admin', 'hospital_admin'])) {
            return true;
        }

        // Patients can update their own basic information
        if ($user->role === 'patient') {
            return $user->patient && $user->patient->id === $patient->id;
        }

        // Doctors can update patients they're treating
        if ($user->role === 'doctor' && $user->doctor) {
            return $patient->referrals()
                ->where(function ($query) use ($user) {
                    $query->where('referring_doctor_id', $user->doctor->id)
                          ->orWhere('receiving_doctor_id', $user->doctor->id);
                })
                ->exists();
        }

        // Nurses can update patients in their facility
        if ($user->role === 'nurse') {
            return $user->facility_id && 
                   $patient->referrals()
                       ->where(function ($query) use ($user) {
                           $query->where('referring_facility_id', $user->facility_id)
                                 ->orWhere('receiving_facility_id', $user->facility_id);
                       })
                       ->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can delete the patient.
     */
    public function delete(User $user, Patient $patient): bool
    {
        // Only super admins can delete patients
        return $user->role === 'super_admin';
    }

    /**
     * Determine whether the user can view patient medical records.
     */
    public function viewMedicalRecords(User $user, Patient $patient): bool
    {
        // Same as view but more restrictive - no nurses unless specifically assigned
        if (in_array($user->role, ['super_admin', 'hospital_admin'])) {
            return true;
        }

        if ($user->role === 'patient') {
            return $user->patient && $user->patient->id === $patient->id;
        }

        if ($user->role === 'doctor' && $user->doctor) {
            return $patient->referrals()
                ->where(function ($query) use ($user) {
                    $query->where('referring_doctor_id', $user->doctor->id)
                          ->orWhere('receiving_doctor_id', $user->doctor->id);
                })
                ->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can update patient medical records.
     */
    public function updateMedicalRecords(User $user, Patient $patient): bool
    {
        // Only doctors and admins can update medical records
        if (in_array($user->role, ['super_admin', 'hospital_admin'])) {
            return true;
        }

        if ($user->role === 'doctor' && $user->doctor) {
            return $patient->referrals()
                ->where('receiving_doctor_id', $user->doctor->id)
                ->exists();
        }

        return false;
    }
}
