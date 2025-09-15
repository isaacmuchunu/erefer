<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Auth\Events\Attempting;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Models\AuditLog;
use App\Models\UserSession;
use App\Models\User;

class AuthenticationEventListener
{
    protected $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    /**
     * Handle user login events.
     */
    public function handleLogin(Login $event): void
    {
        $user = $event->user;
        
        // Reset failed login attempts on successful login
        $user->resetFailedLoginAttempts();
        
        // Update last login timestamp
        $user->update(['last_login_at' => now()]);
        
        // Create or update user session
        $this->createUserSession($user);
        
        // Log successful login
        $this->logAuthEvent($user, 'login_successful', 'User logged in successfully', 'info');
        
        // Check for suspicious login patterns
        $this->checkSuspiciousActivity($user);
    }

    /**
     * Handle failed login attempts.
     */
    public function handleFailed(Failed $event): void
    {
        $email = $event->credentials['email'] ?? 'unknown';
        $user = User::where('email', $email)->first();
        
        if ($user) {
            // Increment failed login attempts
            $user->incrementFailedLoginAttempts();
            
            // Log failed login attempt
            $this->logAuthEvent($user, 'login_failed', 'Failed login attempt', 'warning', [
                'attempted_email' => $email,
                'ip_address' => $this->request->ip(),
                'user_agent' => $this->request->userAgent(),
            ]);
            
            // Check if account should be locked
            if ($user->failed_login_attempts >= 5) {
                $this->logAuthEvent($user, 'account_locked_failed_attempts', 'Account locked due to failed login attempts', 'high');
            }
        } else {
            // Log attempt with non-existent email
            $this->logAuthEvent(null, 'login_failed_invalid_email', 'Login attempt with invalid email', 'warning', [
                'attempted_email' => $email,
                'ip_address' => $this->request->ip(),
                'user_agent' => $this->request->userAgent(),
            ]);
        }
    }

    /**
     * Handle user logout events.
     */
    public function handleLogout(Logout $event): void
    {
        $user = $event->user;
        
        // Deactivate current session
        $this->deactivateCurrentSession($user);
        
        // Log logout
        $this->logAuthEvent($user, 'logout_successful', 'User logged out successfully', 'info');
    }

    /**
     * Handle account lockout events.
     */
    public function handleLockout(Lockout $event): void
    {
        $email = $event->request->input('email');
        $user = User::where('email', $email)->first();
        
        if ($user) {
            $this->logAuthEvent($user, 'account_lockout', 'Account locked due to too many login attempts', 'high', [
                'lockout_duration' => '30 minutes',
                'ip_address' => $this->request->ip(),
            ]);
        }
    }

    /**
     * Handle password reset events.
     */
    public function handlePasswordReset(PasswordReset $event): void
    {
        $user = $event->user;
        
        // Force logout from all sessions for security
        $user->terminateOtherSessions();
        
        // Log password reset
        $this->logAuthEvent($user, 'password_reset', 'Password reset completed', 'info');
    }

    /**
     * Handle user registration events.
     */
    public function handleRegistered(Registered $event): void
    {
        $user = $event->user;
        
        // Log new user registration
        $this->logAuthEvent($user, 'user_registered', 'New user account created', 'info', [
            'registration_method' => 'web',
            'ip_address' => $this->request->ip(),
        ]);
    }

    /**
     * Handle email verification events.
     */
    public function handleVerified(Verified $event): void
    {
        $user = $event->user;
        
        // Log email verification
        $this->logAuthEvent($user, 'email_verified', 'Email address verified', 'info');
    }

    /**
     * Handle login attempt events.
     */
    public function handleAttempting(Attempting $event): void
    {
        $email = $event->credentials['email'] ?? 'unknown';
        
        // Log login attempt for monitoring
        Log::info('Login attempt', [
            'email' => $email,
            'ip_address' => $this->request->ip(),
            'user_agent' => $this->request->userAgent(),
            'timestamp' => now(),
        ]);
        
        // Check for brute force attempts from same IP
        $this->checkBruteForceAttempts();
    }

    /**
     * Create or update user session record.
     */
    protected function createUserSession(User $user): void
    {
        try {
            // Check if session already exists
            $existingSession = UserSession::where('session_id', $this->request->session()->getId())->first();
            
            if ($existingSession) {
                $existingSession->updateActivity();
            } else {
                UserSession::createFromRequest($this->request, $user);
            }
        } catch (\Exception $e) {
            Log::error('Failed to create user session', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Deactivate current user session.
     */
    protected function deactivateCurrentSession(User $user): void
    {
        try {
            $session = UserSession::where('user_id', $user->id)
                ->where('session_id', $this->request->session()->getId())
                ->first();
                
            if ($session) {
                $session->terminate();
            }
        } catch (\Exception $e) {
            Log::error('Failed to deactivate user session', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Check for suspicious login activity.
     */
    protected function checkSuspiciousActivity(User $user): void
    {
        try {
            // Check for login from new location
            $recentSessions = $user->userSessions()
                ->where('created_at', '>', now()->subDays(30))
                ->get();
                
            $currentIp = $this->request->ip();
            $knownIps = $recentSessions->pluck('ip_address')->unique();
            
            if (!$knownIps->contains($currentIp)) {
                $this->logAuthEvent($user, 'login_new_location', 'Login from new IP address detected', 'warning', [
                    'new_ip' => $currentIp,
                    'known_ips' => $knownIps->take(5)->toArray(),
                ]);
            }
            
            // Check for unusual time login
            $currentHour = now()->hour;
            $recentLogins = $recentSessions->where('created_at', '>', now()->subDays(7));
            $usualHours = $recentLogins->map(function ($session) {
                return $session->created_at->hour;
            })->unique();
            
            if ($recentLogins->count() > 5 && !$usualHours->contains($currentHour)) {
                $this->logAuthEvent($user, 'login_unusual_time', 'Login at unusual time detected', 'info', [
                    'current_hour' => $currentHour,
                    'usual_hours' => $usualHours->toArray(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to check suspicious activity', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Check for brute force attempts.
     */
    protected function checkBruteForceAttempts(): void
    {
        try {
            $ip = $this->request->ip();
            $recentAttempts = AuditLog::where('ip_address', $ip)
                ->where('action', 'login_failed')
                ->where('created_at', '>', now()->subMinutes(15))
                ->count();
                
            if ($recentAttempts >= 10) {
                $this->logAuthEvent(null, 'brute_force_detected', 'Potential brute force attack detected', 'critical', [
                    'ip_address' => $ip,
                    'attempts_count' => $recentAttempts,
                    'time_window' => '15 minutes',
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to check brute force attempts', [
                'ip_address' => $this->request->ip(),
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Log authentication events.
     */
    protected function logAuthEvent(?User $user, string $action, string $description, string $severity, array $additionalData = []): void
    {
        try {
            $data = array_merge([
                'ip_address' => $this->request->ip(),
                'user_agent' => $this->request->userAgent(),
                'url' => $this->request->fullUrl(),
                'method' => $this->request->method(),
                'timestamp' => now(),
            ], $additionalData);

            AuditLog::create([
                'user_id' => $user?->id,
                'action' => $action,
                'model_type' => 'Authentication',
                'model_id' => $user?->id,
                'old_values' => null,
                'new_values' => json_encode($data),
                'ip_address' => $this->request->ip(),
                'user_agent' => $this->request->userAgent(),
                'url' => $this->request->fullUrl(),
                'method' => $this->request->method(),
                'description' => $description,
                'severity' => $severity,
                'tags' => json_encode(['authentication', 'security', $action]),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create authentication audit log', [
                'user_id' => $user?->id,
                'action' => $action,
                'error' => $e->getMessage(),
            ]);
        }
    }
}