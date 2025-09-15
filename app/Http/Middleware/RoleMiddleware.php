<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!auth()->check()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }
            return redirect()->route('login');
        }

        $user = auth()->user();

        // Check if user has any of the required roles
        if (!$user->hasAnyRole($roles)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Access denied. Insufficient privileges.',
                    'required_roles' => $roles,
                    'user_role' => $user->role
                ], 403);
            }
            abort(403, 'Access denied. Insufficient privileges.');
        }

        return $next($request);
    }
}
