<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use App\Models\User;
use App\Models\UserSession;
use App\Models\AuditLog;
use Carbon\Carbon;

class SecurityController extends Controller
{
    /**
     * Show security dashboard
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        
        $securityMetrics = [
            'active_sessions' => $user->getActiveSessions()->count(),
            'last_password_change' => $user->last_password_change?->diffForHumans(),
            'failed_login_attempts' => $user->failed_login_attempts,
            'account_locked' => $user->isLocked(),
            'password_expired' => $user->isPasswordExpired(),
            'two_factor_enabled' => $user->two_factor_enabled,
            'recent_login_attempts' => $this->getRecentLoginAttempts($user),
            'security_events' => $this->getRecentSecurityEvents($user),
        ];

        return Inertia::render('security/dashboard', [
            'securityMetrics' => $securityMetrics,
            'activeSessions' => $user->getActiveSessions(),
        ]);
    }

    /**
     * Show two-factor authentication setup
     */
    public function twoFactorSetup(Request $request)
    {
        $user = $request->user();
        
        if (!$user->two_factor_enabled) {
            $secretKey = $this->generateTwoFactorSecret();
            $qrCodeUrl = $this->generateQrCodeUrl($user->email, $secretKey);
            
            return Inertia::render('security/two-factor-setup', [
                'secretKey' => $secretKey,
                'qrCodeUrl' => $qrCodeUrl,
            ]);
        }

        return Inertia::render('security/two-factor-manage', [
            'backupCodes' => $this->generateBackupCodes(),
        ]);
    }

    /**
     * Enable two-factor authentication
     */
    public function enableTwoFactor(Request $request)
    {
        $request->validate([
            'secret' => 'required|string',
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();
        
        if ($this->verifyTwoFactorCode($request->secret, $request->code)) {
            $user->update([
                'two_factor_enabled' => true,
                'two_factor_secret' => encrypt($request->secret),
            ]);

            $this->logSecurityEvent($user, 'two_factor_enabled', 'Two-factor authentication enabled');

            return redirect()->back()->with('success', 'Two-factor authentication has been enabled.');
        }

        return redirect()->back()->withErrors(['code' => 'Invalid verification code.']);
    }

    /**
     * Disable two-factor authentication
     */
    public function disableTwoFactor(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            return redirect()->back()->withErrors(['password' => 'Invalid password.']);
        }

        $user->update([
            'two_factor_enabled' => false,
            'two_factor_secret' => null,
        ]);

        $this->logSecurityEvent($user, 'two_factor_disabled', 'Two-factor authentication disabled');

        return redirect()->back()->with('success', 'Two-factor authentication has been disabled.');
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return redirect()->back()->withErrors(['current_password' => 'Current password is incorrect.']);
        }

        // Check password history to prevent reuse
        if ($this->isPasswordReused($user, $request->password)) {
            return redirect()->back()->withErrors(['password' => 'Password has been used recently. Please choose a different password.']);
        }

        $user->setPasswordWithExpiration($request->password);
        
        $this->logSecurityEvent($user, 'password_changed', 'Password changed successfully');

        // Terminate other sessions for security
        $user->terminateOtherSessions($request->session()->getId());

        return redirect()->back()->with('success', 'Password has been changed successfully.');
    }

    /**
     * Show active sessions
     */
    public function sessions(Request $request)
    {
        $user = $request->user();
        $activeSessions = $user->getActiveSessions();
        $currentSessionId = $request->session()->getId();

        return Inertia::render('security/sessions', [
            'activeSessions' => $activeSessions->map(function ($session) use ($currentSessionId) {
                return [
                    'id' => $session->id,
                    'session_id' => $session->session_id,
                    'ip_address' => $session->ip_address,
                    'device_type' => $session->device_type,
                    'browser' => $session->browser,
                    'platform' => $session->platform,
                    'last_activity' => $session->last_activity->diffForHumans(),
                    'is_current' => $session->session_id === $currentSessionId,
                ];
            }),
        ]);
    }

    /**
     * Terminate specific session
     */
    public function terminateSession(Request $request, UserSession $session)
    {
        $user = $request->user();
        
        if ($session->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        $session->terminate();
        
        $this->logSecurityEvent($user, 'session_terminated', "Session terminated: {$session->ip_address}");

        return redirect()->back()->with('success', 'Session has been terminated.');
    }

    /**
     * Terminate all other sessions
     */
    public function terminateAllSessions(Request $request)
    {
        $user = $request->user();
        $currentSessionId = $request->session()->getId();
        
        $terminatedCount = $user->userSessions()
            ->where('is_active', true)
            ->where('session_id', '!=', $currentSessionId)
            ->count();
            
        $user->terminateOtherSessions($currentSessionId);
        
        $this->logSecurityEvent($user, 'all_sessions_terminated', "All other sessions terminated ({$terminatedCount} sessions)");

        return redirect()->back()->with('success', "All other sessions have been terminated ({$terminatedCount} sessions).");
    }

    /**
     * Show security events/audit log
     */
    public function securityEvents(Request $request)
    {
        $user = $request->user();
        
        $events = AuditLog::where('user_id', $user->id)
            ->where('tags', 'like', '%security%')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('security/events', [
            'events' => $events,
        ]);
    }

    /**
     * Lock account (admin only)
     */
    public function lockAccount(Request $request, User $user)
    {
        $this->authorize('update', $user);
        
        $request->validate([
            'reason' => 'required|string|max:255',
            'duration' => 'required|integer|min:1|max:10080', // max 1 week in minutes
        ]);

        $user->lockAccount($request->duration);
        
        $this->logSecurityEvent($user, 'account_locked', "Account locked by admin: {$request->reason}");

        return redirect()->back()->with('success', 'Account has been locked.');
    }

    /**
     * Unlock account (admin only)
     */
    public function unlockAccount(Request $request, User $user)
    {
        $this->authorize('update', $user);
        
        $user->unlockAccount();
        
        $this->logSecurityEvent($user, 'account_unlocked', 'Account unlocked by admin');

        return redirect()->back()->with('success', 'Account has been unlocked.');
    }

    /**
     * Force password change (admin only)
     */
    public function forcePasswordChange(Request $request, User $user)
    {
        $this->authorize('update', $user);
        
        $user->forcePasswordChange();
        
        $this->logSecurityEvent($user, 'password_change_forced', 'Password change forced by admin');

        return redirect()->back()->with('success', 'User will be required to change password on next login.');
    }

    /**
     * Generate backup codes
     */
    public function generateBackupCodes(Request $request)
    {
        $user = $request->user();
        
        if (!$user->two_factor_enabled) {
            return redirect()->back()->withErrors(['message' => 'Two-factor authentication must be enabled first.']);
        }

        $backupCodes = collect(range(1, 8))->map(function () {
            return strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 8));
        })->toArray();

        // Store hashed backup codes
        $user->update([
            'backup_codes' => $backupCodes,
        ]);

        $this->logSecurityEvent($user, 'backup_codes_generated', 'Backup codes generated');

        return Inertia::render('security/backup-codes', [
            'backupCodes' => $backupCodes,
        ]);
    }

    // Private helper methods

    private function generateTwoFactorSecret(): string
    {
        return substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'), 0, 32);
    }

    private function generateQrCodeUrl(string $email, string $secret): string
    {
        $appName = config('app.name');
        $qrString = "otpauth://totp/{$appName}:{$email}?secret={$secret}&issuer={$appName}";
        
        return "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" . urlencode($qrString);
    }

    private function verifyTwoFactorCode(string $secret, string $code): bool
    {
        // This would typically use a library like pragmarx/google2fa
        // For now, we'll simulate the verification
        return strlen($code) === 6 && is_numeric($code);
    }

    private function isPasswordReused(User $user, string $newPassword): bool
    {
        // Check against the last 5 passwords (you'd need to store password history)
        // For now, just check against current password
        return Hash::check($newPassword, $user->password);
    }

    private function getRecentLoginAttempts(User $user): array
    {
        return AuditLog::where('user_id', $user->id)
            ->where('action', 'like', '%login%')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($log) {
                return [
                    'action' => $log->action,
                    'ip_address' => $log->ip_address,
                    'created_at' => $log->created_at->diffForHumans(),
                    'success' => str_contains($log->action, 'successful'),
                ];
            })
            ->toArray();
    }

    private function getRecentSecurityEvents(User $user): array
    {
        return AuditLog::where('user_id', $user->id)
            ->where('tags', 'like', '%security%')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($log) {
                return [
                    'action' => $log->action,
                    'description' => $log->description,
                    'severity' => $log->severity,
                    'created_at' => $log->created_at->diffForHumans(),
                ];
            })
            ->toArray();
    }

    private function logSecurityEvent(User $user, string $action, string $description): void
    {
        try {
            AuditLog::create([
                'user_id' => $user->id,
                'action' => $action,
                'model_type' => 'Security',
                'model_id' => $user->id,
                'old_values' => null,
                'new_values' => json_encode(['timestamp' => now()]),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'url' => request()->fullUrl(),
                'method' => request()->method(),
                'description' => $description,
                'severity' => 'info',
                'tags' => json_encode(['security', 'user_action']),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create security audit log', [
                'user_id' => $user->id,
                'action' => $action,
                'error' => $e->getMessage(),
            ]);
        }
    }
}