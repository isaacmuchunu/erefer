<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\AuditLog;
use Symfony\Component\HttpFoundation\Response;

class EnhancedRoleMiddleware
{
    /**
     * Handle an incoming request with enhanced security and audit logging.
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $startTime = microtime(true);
        
        // Check authentication
        if (!auth()->check()) {
            $this->logSecurityEvent('unauthenticated_access_attempt', $request);
            
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }
            return redirect()->route('login');
        }

        $user = auth()->user();
        
        // Enhanced role checking with hierarchical permissions
        $hasAccess = $this->checkRoleAccess($user, $roles);
        
        if (!$hasAccess) {
            $this->logSecurityEvent('unauthorized_access_attempt', $request, [
                'user_id' => $user->id,
                'user_role' => $user->role,
                'required_roles' => $roles,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'url' => $request->fullUrl(),
                'method' => $request->method(),
            ]);
            
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Access denied. Insufficient privileges.',
                    'required_roles' => $roles,
                    'user_role' => $user->role,
                    'timestamp' => now()->toISOString(),
                ], 403);
            }
            
            abort(403, 'Access denied. Insufficient privileges.');
        }

        // Log successful access for audit trail
        $this->logAuditTrail($user, $request, 'role_access_granted', [
            'granted_roles' => $roles,
            'processing_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
        ]);

        // Add security headers
        $response = $next($request);
        
        if ($response instanceof Response) {
            $response->headers->set('X-Content-Type-Options', 'nosniff');
            $response->headers->set('X-Frame-Options', 'DENY');
            $response->headers->set('X-XSS-Protection', '1; mode=block');
            $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        }

        return $response;
    }

    /**
     * Check role access with hierarchical permissions
     */
    private function checkRoleAccess($user, array $roles): bool
    {
        // Check direct role match
        if ($user->hasAnyRole($roles)) {
            return true;
        }

        // Hierarchical role checking
        $roleHierarchy = [
            'super_admin' => ['hospital_admin', 'doctor', 'nurse', 'dispatcher', 'ambulance_driver', 'ambulance_paramedic', 'patient'],
            'hospital_admin' => ['doctor', 'nurse'],
            'dispatcher' => ['ambulance_driver', 'ambulance_paramedic'],
            'doctor' => [],
            'nurse' => [],
            'ambulance_driver' => [],
            'ambulance_paramedic' => [],
            'patient' => [],
        ];

        $userRole = $user->role;
        $allowedRoles = $roleHierarchy[$userRole] ?? [];

        // Check if any of the required roles are in the user's allowed roles
        return !empty(array_intersect($roles, array_merge([$userRole], $allowedRoles)));
    }

    /**
     * Log security events
     */
    private function logSecurityEvent(string $event, Request $request, array $additionalData = []): void
    {
        $data = array_merge([
            'event' => $event,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'timestamp' => now()->toISOString(),
            'session_id' => $request->session()->getId(),
        ], $additionalData);

        Log::warning("Security Event: {$event}", $data);

        // Store in database for audit trail
        try {
            AuditLog::create([
                'user_id' => $additionalData['user_id'] ?? null,
                'action' => $event,
                'model_type' => 'Security',
                'model_id' => null,
                'old_values' => null,
                'new_values' => json_encode($data),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'description' => "Security event: {$event}",
                'severity' => $event === 'unauthorized_access_attempt' ? 'high' : 'medium',
                'tags' => json_encode(['security', 'access_control', $event]),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create audit log entry', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Log audit trail for successful access
     */
    private function logAuditTrail($user, Request $request, string $action, array $additionalData = []): void
    {
        try {
            AuditLog::create([
                'user_id' => $user->id,
                'action' => $action,
                'model_type' => 'Access',
                'model_id' => $user->id,
                'old_values' => null,
                'new_values' => json_encode(array_merge([
                    'user_role' => $user->role,
                    'facility_id' => $user->facility_id,
                ], $additionalData)),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'description' => "User accessed protected resource",
                'severity' => 'info',
                'tags' => json_encode(['access', 'audit', 'role_based']),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create audit log entry', ['error' => $e->getMessage()]);
        }
    }
}