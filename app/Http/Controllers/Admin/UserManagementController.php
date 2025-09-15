<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Facility;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    /**
     * Display a listing of users
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $users = User::with(['facility'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->role, function ($query, $role) {
                $query->where('role', $role);
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        // Calculate stats
        $stats = [
            'total' => User::count(),
            'active' => User::where('status', 'active')->count(),
            'inactive' => User::where('status', 'inactive')->count(),
            'by_role' => User::selectRaw('role, count(*) as count')
                ->groupBy('role')
                ->pluck('count', 'role')
                ->toArray(),
        ];

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'status']),
            'roles' => $this->getAvailableRoles(),
            'statuses' => ['active', 'inactive', 'suspended'],
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new user
     */
    public function create(): Response
    {
        $this->authorize('create', User::class);

        return Inertia::render('admin/users/create', [
            'roles' => $this->getAvailableRoles(),
            'facilities' => Facility::active()->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', User::class);

        $validRoles = $this->getValidRolesForCreation();
        
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:' . implode(',', array_keys($validRoles)),
            'password' => 'required|string|min:8|confirmed',
            'facility_id' => 'nullable|exists:facilities,id',
            'status' => 'required|in:active,inactive,suspended',
        ]);

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => $request->role,
            'password' => Hash::make($request->password),
            'facility_id' => $request->facility_id,
            'status' => $request->status,
            'email_verified_at' => now(), // Admin-created users are auto-verified
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user->load('facility'),
        ], 201);
    }

    /**
     * Display the specified user
     */
    public function show(User $user): Response
    {
        $this->authorize('view', $user);

        return Inertia::render('admin/users/show', [
            'user' => $user->load(['facility']),
        ]);
    }

    /**
     * Show the form for editing the specified user
     */
    public function edit(User $user): Response
    {
        $this->authorize('update', $user);

        return Inertia::render('admin/users/edit', [
            'user' => $user->load('facility'),
            'roles' => $this->getAvailableRoles(),
            'facilities' => Facility::active()->get(['id', 'name']),
        ]);
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $validRoles = $this->getValidRolesForUpdate($user);
        
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:' . implode(',', array_keys($validRoles)),
            'facility_id' => 'nullable|exists:facilities,id',
            'status' => 'required|in:active,inactive,suspended',
        ]);

        $user->update([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => $request->role,
            'facility_id' => $request->facility_id,
            'status' => $request->status,
        ]);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user->fresh()->load('facility'),
        ]);
    }

    /**
     * Reset user password
     */
    public function resetPassword(Request $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Password reset successfully',
        ]);
    }

    /**
     * Remove the specified user from storage
     */
    public function destroy(User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        // Don't allow deletion of super admin or current user
        if ($user->role === 'super_admin' || $user->id === Auth::id()) {
            throw ValidationException::withMessages([
                'user' => ['Cannot delete this user.'],
            ]);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }

    /**
     * Bulk actions for users
     */
    public function bulkAction(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $request->validate([
            'action' => 'required|in:activate,deactivate,suspend,delete',
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
        ]);

        $users = User::whereIn('id', $request->user_ids)
            ->where('role', '!=', 'super_admin') // Protect super admin
            ->where('id', '!=', Auth::id()); // Protect current user

        if ($request->action === 'delete') {
            $this->authorize('delete', User::class);
            $deleted = $users->delete();
            return response()->json([
                'message' => "{$deleted} user(s) deleted successfully",
            ]);
        }

        $status = match($request->action) {
            'activate' => 'active',
            'deactivate' => 'inactive',
            'suspend' => 'suspended',
        };

        $updated = $users->update(['status' => $status]);

        return response()->json([
            'message' => "{$updated} user(s) {$request->action}d successfully",
        ]);
    }

    /**
     * Update user status
     */
    public function updateStatus(Request $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);
        
        $request->validate([
            'status' => 'required|in:active,inactive,suspended',
        ]);
        
        // Protect super admin and current user
        if ($user->role === 'super_admin' || $user->id === Auth::id()) {
            return response()->json([
                'message' => 'Cannot change status of this user.',
            ], 403);
        }
        
        $user->update(['status' => $request->status]);
        
        return response()->json([
            'message' => 'User status updated successfully',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Export users to CSV
     */
    public function export(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $this->authorize('viewAny', User::class);

        $users = User::with(['facility'])
            ->when($request->role, function ($query, $role) {
                $query->where('role', $role);
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->facility_id, function ($query, $facilityId) {
                $query->where('facility_id', $facilityId);
            })
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $filename = 'users_export_' . now()->format('Y_m_d_H_i_s') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($users) {
            $file = fopen('php://output', 'w');
            fputcsv($file, [
                'ID', 'First Name', 'Last Name', 'Email', 'Phone', 
                'Role', 'Status', 'Facility', 'Email Verified', 
                'Last Login', 'Created At', 'Updated At'
            ]);

            foreach ($users as $user) {
                fputcsv($file, [
                    $user->id,
                    $user->first_name,
                    $user->last_name,
                    $user->email,
                    $user->phone,
                    $user->role,
                    $user->status,
                    $user->facility?->name ?? 'N/A',
                    $user->email_verified_at ? 'Yes' : 'No',
                    $user->last_login_at?->format('Y-m-d H:i:s') ?? 'Never',
                    $user->created_at->format('Y-m-d H:i:s'),
                    $user->updated_at->format('Y-m-d H:i:s'),
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Import users from CSV
     */
    public function import(Request $request): JsonResponse
    {
        $this->authorize('create', User::class);
        
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);
        
        $file = $request->file('file');
        $path = $file->getRealPath();
        $data = array_map('str_getcsv', file($path));
        
        // Remove header row
        $header = array_shift($data);
        
        $imported = 0;
        $errors = [];
        
        foreach ($data as $index => $row) {
            try {
                if (count($row) < 5) {
                    $errors[] = "Row " . ($index + 2) . ": Insufficient data";
                    continue;
                }
                
                [$firstName, $lastName, $email, $phone, $role, $password, $facilityId, $status] = array_pad($row, 8, null);
                
                // Validate role
                $validRoles = array_keys($this->getValidRolesForCreation());
                if (!in_array($role, $validRoles)) {
                    $errors[] = "Row " . ($index + 2) . ": Invalid role '{$role}'";
                    continue;
                }
                
                // Check if email already exists
                if (User::where('email', $email)->exists()) {
                    $errors[] = "Row " . ($index + 2) . ": Email '{$email}' already exists";
                    continue;
                }
                
                User::create([
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $email,
                    'phone' => $phone,
                    'role' => $role,
                    'password' => Hash::make($password ?: 'password123'),
                    'facility_id' => $facilityId ?: null,
                    'status' => $status ?: 'active',
                    'email_verified_at' => now(),
                ]);
                
                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Row " . ($index + 2) . ": " . $e->getMessage();
            }
        }
        
        return response()->json([
            'message' => "Successfully imported {$imported} users",
            'imported' => $imported,
            'errors' => $errors,
        ]);
    }

    /**
     * Get available roles for user creation/editing
     */
    private function getAvailableRoles(): array
    {
        $user = Auth::user();

        if ($user->role === 'super_admin') {
            return [
                'super_admin' => 'Super Administrator',
                'hospital_admin' => 'Hospital Administrator',
                'doctor' => 'Doctor',
                'nurse' => 'Nurse',
                'dispatcher' => 'Dispatcher',
                'ambulance_driver' => 'Ambulance Driver',
                'ambulance_paramedic' => 'Ambulance Paramedic',
                'patient' => 'Patient',
            ];
        }

        if ($user->role === 'hospital_admin') {
            return [
                'doctor' => 'Doctor',
                'nurse' => 'Nurse',
            ];
        }

        return [];
    }

    /**
     * Get valid roles for user creation
     */
    private function getValidRolesForCreation(): array
    {
        return $this->getAvailableRoles();
    }

    /**
     * Get valid roles for user update
     */
    private function getValidRolesForUpdate(User $user): array
    {
        $currentUser = Auth::user();
        $availableRoles = $this->getAvailableRoles();
        
        // Prevent changing own role unless super admin
        if ($user->id === $currentUser->id && $currentUser->role !== 'super_admin') {
            return [$user->role => $availableRoles[$user->role] ?? $user->role];
        }
        
        return $availableRoles;
    }
}
