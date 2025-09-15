<?php

namespace App\Policies;

use App\Models\Equipment;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class EquipmentPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAny(User $user)
    {
        return true; // All authenticated users can view equipment list
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Equipment  $equipment
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(User $user, Equipment $equipment)
    {
        return true; // All authenticated users can view equipment details
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(User $user)
    {
        return $user->hasPermissionTo('manage equipment') || 
               $user->hasRole(['admin', 'facility_manager']);
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Equipment  $equipment
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function update(User $user, Equipment $equipment)
    {
        // Users can update equipment if they have permission or are facility managers of the equipment's facility
        return $user->hasPermissionTo('manage equipment') || 
               $user->hasRole('admin') || 
               ($user->hasRole('facility_manager') && $user->facilities->contains($equipment->facility_id));
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Equipment  $equipment
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(User $user, Equipment $equipment)
    {
        // Only admins and users with specific permission can delete equipment
        return $user->hasPermissionTo('manage equipment') || 
               $user->hasRole('admin');
    }

    /**
     * Determine whether the user can schedule maintenance for the equipment.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Equipment  $equipment
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function scheduleMaintenance(User $user, Equipment $equipment)
    {
        return $user->hasPermissionTo('manage equipment') || 
               $user->hasRole('admin') || 
               ($user->hasRole('facility_manager') && $user->facilities->contains($equipment->facility_id)) ||
               ($user->hasRole('maintenance_staff') && $user->departments->contains($equipment->department_id));
    }

    /**
     * Determine whether the user can update the status of the equipment.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Equipment  $equipment
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function updateStatus(User $user, Equipment $equipment)
    {
        return $user->hasPermissionTo('manage equipment') || 
               $user->hasRole('admin') || 
               ($user->hasRole('facility_manager') && $user->facilities->contains($equipment->facility_id)) ||
               ($user->hasRole('maintenance_staff') && $user->departments->contains($equipment->department_id));
    }
}