<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PatientMiddleware
{
    /**
     * Handle an incoming request for patient-specific routes.
     * Ensures patients can only access their own data.
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

        // Only patients and admins can access patient routes
        if (!in_array($user->role, ['patient', 'super_admin', 'hospital_admin'])) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Access denied. Patient access required.'], 403);
            }
            abort(403, 'Access denied. Patient access required.');
        }

        // If user is a patient, ensure they can only access their own data
        if ($user->role === 'patient') {
            $patientId = $request->route('patient')?->id ?? $request->route('id') ?? $request->input('patient_id');
            
            if ($patientId && $user->patient && $user->patient->id != $patientId) {
                if ($request->expectsJson()) {
                    return response()->json(['message' => 'Access denied. You can only access your own data.'], 403);
                }
                abort(403, 'Access denied. You can only access your own data.');
            }
        }

        return $next($request);
    }
}
