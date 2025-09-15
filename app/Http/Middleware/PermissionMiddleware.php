<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\AuditLog;
use Symfony\Component\HttpFoundation\Response;

class PermissionMiddleware
{
    /**
     * Handle an incoming request with permission-based access control.
     */
    public function handle(Request $request, Closure $next, ...$permissions): Response
    {
        if (!auth()->check()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }
            return redirect()->route('login');
        }

        $user = auth()->user();

        // Check if user has any of the required permissions
        $hasPermission = $user->hasAnyPermission($permissions);

        if (!$hasPermission) {
            $this->logUnauthorizedAccess($user, $request, $permissions);

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Access denied. Insufficient permissions.',
                    'required_permissions' => $permissions,
                    'user_role' => $user->role,
                    'timestamp' => now()->toISOString(),
                ], 403);
            }

            abort(403, 'Access denied. You do not have the required permissions to access this resource.');
        }

        // Log successful permission check
        $this->logPermissionAccess($user, $request, $permissions);

        return $next($request);
    }

    /**
     * Log unauthorized permission access attempt
     */
    private function logUnauthorizedAccess($user, Request $request, array $permissions): void
    {
        $data = [
            'user_id' => $user->id,
            'user_role' => $user->role,
            'required_permissions' => $permissions,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'timestamp' => now()->toISOString(),
        ];

        Log::warning('Unauthorized permission access attempt', $data);

        try {
            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'unauthorized_permission_access',
                'model_type' => 'Permission',
                'model_id' => null,
                'old_values' => null,
                'new_values' => json_encode($data),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'description' => "User attempted to access resource requiring permissions: " . implode(', ', $permissions),
                'severity' => 'high',
                'tags' => json_encode(['security', 'permission', 'unauthorized']),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create audit log entry', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Log successful permission access
     */
    private function logPermissionAccess($user, Request $request, array $permissions): void
    {
        try {
            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'permission_access_granted',
                'model_type' => 'Permission',
                'model_id' => $user->id,
                'old_values' => null,
                'new_values' => json_encode([
                    'granted_permissions' => $permissions,
                    'user_role' => $user->role,
                ]),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'description' => "User accessed resource with permissions: " . implode(', ', $permissions),
                'severity' => 'info',
                'tags' => json_encode(['access', 'permission', 'granted']),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create audit log entry', ['error' => $e->getMessage()]);
        }
    }
}