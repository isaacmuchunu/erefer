<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    /**
     * Display role management interface
     */
    public function index(): Response
    {
        Gate::authorize('manage-users');

        $users = User::with(['facility', 'doctor', 'ambulanceCrew'])
            ->paginate(20);

        $roleStats = [
            'super_admin' => User::where('role', 'super_admin')->count(),
            'hospital_admin' => User::where('role', 'hospital_admin')->count(),
            'doctor' => User::where('role', 'doctor')->count(),
            'nurse' => User::where('role', 'nurse')->count(),
            'dispatcher' => User::where('role', 'dispatcher')->count(),
            'ambulance_driver' => User::where('role', 'ambulance_driver')->count(),
            'ambulance_paramedic' => User::where('role', 'ambulance_paramedic')->count(),
            'patient' => User::where('role', 'patient')->count(),
        ];

        return Inertia::render('admin/roles/index', [
            'users' => $users,
            'roleStats' => $roleStats,
            'availableRoles' => $this->getAvailableRoles(),
            'rolePermissions' => $this->getRolePermissions(),
        ]);
    }

    /**
     * Update user role
     */
    public function updateUserRole(Request $request, User $user): JsonResponse
    {
        Gate::authorize('manage-users');

        $request->validate([
            'role' => 'required|in:super_admin,hospital_admin,doctor,nurse,dispatcher,ambulance_driver,ambulance_paramedic,patient'
        ]);

        $oldRole = $user->role;
        $newRole = $request->role;

        // Prevent users from removing their own super_admin role
        if (auth()->id() === $user->id && $oldRole === 'super_admin' && $newRole !== 'super_admin') {
            return response()->json([
                'message' => 'You cannot remove your own super admin privileges.'
            ], 403);
        }

        $user->update(['role' => $newRole]);

        // Log the role change
        \App\Models\AuditLog::logActivity(
            'user.role_changed',
            $user,
            ['role' => $oldRole],
            ['role' => $newRole],
            "User role changed from {$oldRole} to {$newRole}",
            'medium',
            ['user_management', 'security', 'role_change']
        );

        return response()->json([
            'message' => 'User role updated successfully',
            'user' => $user->fresh()
        ]);
    }

    /**
     * Get role permissions matrix
     */
    public function rolePermissions(): JsonResponse
    {
        Gate::authorize('manage-users');

        return response()->json([
            'permissions' => $this->getRolePermissions()
        ]);
    }

    /**
     * Get audit logs for role changes
     */
    public function roleAuditLogs(Request $request): JsonResponse
    {
        Gate::authorize('view-audit-logs');

        $logs = \App\Models\AuditLog::query()
            ->where('action', 'user.role_changed')
            ->with('user')
            ->when($request->user_id, fn($q, $userId) => $q->where('model_id', $userId))
            ->when($request->date_from, fn($q, $date) => $q->whereDate('created_at', '>=', $date))
            ->when($request->date_to, fn($q, $date) => $q->whereDate('created_at', '<=', $date))
            ->latest()
            ->paginate(15);

        return response()->json($logs);
    }

    /**
     * Get available roles
     */
    private function getAvailableRoles(): array
    {
        return [
            'super_admin' => [
                'name' => 'Super Administrator',
                'description' => 'Full system access and control',
                'color' => 'red'
            ],
            'hospital_admin' => [
                'name' => 'Hospital Administrator',
                'description' => 'Hospital management and administration',
                'color' => 'purple'
            ],
            'doctor' => [
                'name' => 'Doctor/Physician',
                'description' => 'Medical professional with patient care responsibilities',
                'color' => 'blue'
            ],
            'nurse' => [
                'name' => 'Nurse',
                'description' => 'Nursing staff with patient care support',
                'color' => 'green'
            ],
            'dispatcher' => [
                'name' => 'Ambulance Dispatcher',
                'description' => 'Emergency dispatch and ambulance coordination',
                'color' => 'orange'
            ],
            'ambulance_driver' => [
                'name' => 'Ambulance Driver',
                'description' => 'Ambulance vehicle operation',
                'color' => 'yellow'
            ],
            'ambulance_paramedic' => [
                'name' => 'Paramedic',
                'description' => 'Emergency medical technician',
                'color' => 'teal'
            ],
            'patient' => [
                'name' => 'Patient',
                'description' => 'Healthcare service recipient',
                'color' => 'gray'
            ]
        ];
    }

    /**
     * Get role permissions matrix
     */
    private function getRolePermissions(): array
    {
        return [
            'super_admin' => [
                'user_management' => true,
                'facility_management' => true,
                'patient_access' => true,
                'medical_records' => true,
                'referral_management' => true,
                'ambulance_management' => true,
                'emergency_response' => true,
                'system_administration' => true,
                'audit_access' => true,
                'reporting' => true
            ],
            'hospital_admin' => [
                'user_management' => true,
                'facility_management' => true,
                'patient_access' => true,
                'medical_records' => true,
                'referral_management' => true,
                'ambulance_management' => true,
                'emergency_response' => true,
                'system_administration' => false,
                'audit_access' => true,
                'reporting' => true
            ],
            'doctor' => [
                'user_management' => false,
                'facility_management' => false,
                'patient_access' => true,
                'medical_records' => true,
                'referral_management' => true,
                'ambulance_management' => false,
                'emergency_response' => true,
                'system_administration' => false,
                'audit_access' => false,
                'reporting' => true
            ],
            'nurse' => [
                'user_management' => false,
                'facility_management' => false,
                'patient_access' => true,
                'medical_records' => false,
                'referral_management' => false,
                'ambulance_management' => false,
                'emergency_response' => false,
                'system_administration' => false,
                'audit_access' => false,
                'reporting' => false
            ],
            'dispatcher' => [
                'user_management' => false,
                'facility_management' => false,
                'patient_access' => false,
                'medical_records' => false,
                'referral_management' => false,
                'ambulance_management' => true,
                'emergency_response' => true,
                'system_administration' => false,
                'audit_access' => false,
                'reporting' => false
            ],
            'ambulance_driver' => [
                'user_management' => false,
                'facility_management' => false,
                'patient_access' => false,
                'medical_records' => false,
                'referral_management' => false,
                'ambulance_management' => false,
                'emergency_response' => true,
                'system_administration' => false,
                'audit_access' => false,
                'reporting' => false
            ],
            'ambulance_paramedic' => [
                'user_management' => false,
                'facility_management' => false,
                'patient_access' => false,
                'medical_records' => false,
                'referral_management' => false,
                'ambulance_management' => false,
                'emergency_response' => true,
                'system_administration' => false,
                'audit_access' => false,
                'reporting' => false
            ],
            'patient' => [
                'user_management' => false,
                'facility_management' => false,
                'patient_access' => false, // Only their own data
                'medical_records' => false, // Only their own data
                'referral_management' => false, // Only view their own
                'ambulance_management' => false,
                'emergency_response' => false,
                'system_administration' => false,
                'audit_access' => false,
                'reporting' => false
            ]
        ];
    }
}
