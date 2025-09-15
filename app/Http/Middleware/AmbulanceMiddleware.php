<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AmbulanceMiddleware
{
    /**
     * Handle an incoming request for ambulance-specific routes.
     * Ensures only ambulance staff and dispatchers can access ambulance operations.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }
            return redirect()->route('login');
        }

        $user = auth()->user();

        // Only ambulance staff, dispatchers and admins can access ambulance routes
        $allowedRoles = ['ambulance_driver', 'ambulance_paramedic', 'dispatcher', 'super_admin', 'hospital_admin'];
        
        if (!in_array($user->role, $allowedRoles)) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Access denied. Ambulance staff privileges required.'], 403);
            }
            abort(403, 'Access denied. Ambulance staff privileges required.');
        }

        return $next($request);
    }
}
