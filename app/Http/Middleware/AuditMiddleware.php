<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuditMiddleware
{
    /**
     * Handle an incoming request and log sensitive operations.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log for authenticated users
        if (!auth()->check()) {
            return $response;
        }

        $user = auth()->user();
        $method = $request->method();
        $path = $request->path();

        // Define sensitive routes that should be audited
        $sensitiveRoutes = [
            'patients' => ['patient_access', 'privacy_sensitive'],
            'referrals' => ['referral', 'medical'],
            'ambulances' => ['ambulance', 'emergency'],
            'admin' => ['admin', 'system_management'],
            'users' => ['user_management', 'security'],
        ];

        // Check if this is a sensitive route
        $tags = [];
        foreach ($sensitiveRoutes as $route => $routeTags) {
            if (str_contains($path, $route)) {
                $tags = $routeTags;
                break;
            }
        }

        // Log the activity if it's a sensitive route
        if (!empty($tags)) {
            $action = $this->getActionFromRequest($request);
            $severity = $this->getSeverityFromAction($action, $method);

            AuditLog::logActivity(
                $action,
                null,
                [],
                [],
                $this->getDescriptionFromRequest($request),
                $severity,
                $tags
            );
        }

        // Log failed authorization attempts
        if ($response->getStatusCode() === 403) {
            AuditLog::logSecurityEvent(
                'access_denied',
                "User {$user->full_name} (Role: {$user->role}) attempted to access {$method} {$path}",
                'warning'
            );
        }

        return $response;
    }

    /**
     * Get action name from request
     */
    private function getActionFromRequest(Request $request): string
    {
        $method = strtolower($request->method());
        $path = $request->path();

        // Extract resource from path
        $segments = explode('/', $path);
        $resource = $segments[1] ?? 'unknown';

        // Map HTTP methods to actions
        $actionMap = [
            'get' => 'viewed',
            'post' => 'created',
            'put' => 'updated',
            'patch' => 'updated',
            'delete' => 'deleted',
        ];

        $action = $actionMap[$method] ?? 'accessed';

        return "{$resource}.{$action}";
    }

    /**
     * Get severity level based on action and method
     */
    private function getSeverityFromAction(string $action, string $method): string
    {
        $method = strtolower($method);

        // High severity for destructive operations
        if (in_array($method, ['delete'])) {
            return 'high';
        }

        // Medium severity for modifications
        if (in_array($method, ['post', 'put', 'patch'])) {
            return 'medium';
        }

        // Low severity for read operations
        return 'info';
    }

    /**
     * Get description from request
     */
    private function getDescriptionFromRequest(Request $request): string
    {
        $method = $request->method();
        $path = $request->path();
        $user = auth()->user();

        return "User {$user->full_name} performed {$method} on {$path}";
    }
}
