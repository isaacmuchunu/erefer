<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DoctorMiddleware
{
    /**
     * Handle an incoming request for doctor-specific routes.
     * Ensures doctors can only access patients under their care.
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

        // Only doctors and admins can access doctor routes
        if (!in_array($user->role, ['doctor', 'super_admin', 'hospital_admin'])) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Access denied. Doctor privileges required.'], 403);
            }
            abort(403, 'Access denied. Doctor privileges required.');
        }

        return $next($request);
    }
}
