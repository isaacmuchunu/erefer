<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'level',
        'is_active',
        'color',
        'icon',
        'metadata',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'level' => 'integer',
        'metadata' => 'array',
    ];

    /**
     * The permissions that belong to the role.
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permissions')
            ->withTimestamps();
    }

    /**
     * The users that belong to the role.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'role', 'slug');
    }

    /**
     * Scope to get active roles
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get roles by level
     */
    public function scopeByLevel($query, int $level)
    {
        return $query->where('level', $level);
    }

    /**
     * Check if role has permission
     */
    public function hasPermission(string $permission): bool
    {
        return $this->permissions()
            ->where('slug', $permission)
            ->where('is_active', true)
            ->exists();
    }

    /**
     * Check if role has any of the given permissions
     */
    public function hasAnyPermission(array $permissions): bool
    {
        return $this->permissions()
            ->whereIn('slug', $permissions)
            ->where('is_active', true)
            ->exists();
    }

    /**
     * Check if role has all of the given permissions
     */
    public function hasAllPermissions(array $permissions): bool
    {
        $hasPermissions = $this->permissions()
            ->whereIn('slug', $permissions)
            ->where('is_active', true)
            ->count();

        return $hasPermissions === count($permissions);
    }

    /**
     * Grant permission to role
     */
    public function givePermission(string $permission): bool
    {
        $permissionModel = Permission::where('slug', $permission)->first();
        
        if (!$permissionModel) {
            return false;
        }

        if (!$this->hasPermission($permission)) {
            $this->permissions()->attach($permissionModel->id);
        }

        return true;
    }

    /**
     * Revoke permission from role
     */
    public function revokePermission(string $permission): bool
    {
        $permissionModel = Permission::where('slug', $permission)->first();
        
        if (!$permissionModel) {
            return false;
        }

        $this->permissions()->detach($permissionModel->id);
        return true;
    }

    /**
     * Sync permissions for role
     */
    public function syncPermissions(array $permissions): void
    {
        $permissionIds = Permission::whereIn('slug', $permissions)->pluck('id')->toArray();
        $this->permissions()->sync($permissionIds);
    }

    /**
     * Get role hierarchy level
     */
    public function isHigherThan(Role $role): bool
    {
        return $this->level > $role->level;
    }

    /**
     * Get all roles with their permission count
     */
    public static function withPermissionCount()
    {
        return static::withCount('permissions');
    }
}