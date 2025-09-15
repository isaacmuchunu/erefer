<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any users.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'hospital_admin']);
    }

    /**
     * Determine whether the user can view any user statistics.
     */
    public function viewStats(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'hospital_admin']);
    }

    /**
     * Determine whether the user can export users.
     */
    public function export(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'hospital_admin']);
    }

    /**
     * Determine whether the user can import users.
     */
    public function import(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'hospital_admin']);
    }

    /**
     * Determine whether the user can view the specific user.
     */
    public function view(User $user, User $model): bool
    {
        // Super admin can view any user
        if ($user->role === 'super_admin') {
            return true;
        }

        // Hospital admin can view users in their facility
        if ($user->role === 'hospital_admin') {
            return $model->facility_id === $user->facility_id;
        }

        // Users can view their own profile
        return $user->id === $model->id;
    }

    /**
     * Determine whether the user can create users.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'hospital_admin']);
    }

    /**
     * Determine whether the user can create super admin users.
     */
    public function createSuperAdmin(User $user): bool
    {
        return $user->role === 'super_admin';
    }

    /**
     * Determine whether the user can perform bulk actions.
     */
    public function bulkAction(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'hospital_admin']);
    }

    /**
     * Determine whether the user can update the user.
     */
    public function update(User $user, User $model): bool
    {
        // Super admin can update any user except other super admins (unless it's themselves)
        if ($user->role === 'super_admin') {
            return $model->role !== 'super_admin' || $user->id === $model->id;
        }

        // Hospital admin can update users in their facility (except super admin)
        if ($user->role === 'hospital_admin') {
            return $model->facility_id === $user->facility_id && 
                   !in_array($model->role, ['super_admin']);
        }

        // Users can update their own profile (limited fields)
        return $user->id === $model->id;
    }

    /**
     * Determine whether the user can update user status.
     */
    public function updateStatus(User $user, User $model): bool
    {
        // Prevent status changes for super admin and current user
        if ($model->role === 'super_admin' || $model->id === $user->id) {
            return false;
        }

        // Super admin can update any user status
        if ($user->role === 'super_admin') {
            return true;
        }

        // Hospital admin can update status for users in their facility
        if ($user->role === 'hospital_admin') {
            return $model->facility_id === $user->facility_id && 
                   !in_array($model->role, ['super_admin', 'hospital_admin']);
        }

        return false;
    }

    /**
     * Determine whether the user can reset password for another user.
     */
    public function resetPassword(User $user, User $model): bool
    {
        return $this->update($user, $model);
    }

    /**
     * Determine whether the user can delete the user.
     */
    public function delete(User $user, User $model): bool
    {
        // Super admin can delete users except other super admins and themselves
        if ($user->role === 'super_admin') {
            return $model->role !== 'super_admin' && $user->id !== $model->id;
        }

        // Hospital admin can delete users in their facility (except super admin and themselves)
        if ($user->role === 'hospital_admin') {
            return $model->facility_id === $user->facility_id && 
                   !in_array($model->role, ['super_admin', 'hospital_admin']) &&
                   $user->id !== $model->id;
        }

        return false;
    }

    /**
     * Determine whether the user can restore the user.
     */
    public function restore(User $user, User $model): bool
    {
        return $this->delete($user, $model);
    }

    /**
     * Determine whether the user can permanently delete the user.
     */
    public function forceDelete(User $user, User $model): bool
    {
        // Only super admin can permanently delete
        return $user->role === 'super_admin' && 
               $model->role !== 'super_admin' && 
               $user->id !== $model->id;
    }
}