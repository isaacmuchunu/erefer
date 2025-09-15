<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'ip_address',
        'user_agent',
        'device_type',
        'browser',
        'platform',
        'last_activity',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'last_activity' => 'datetime',
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * The user that owns the session.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get active sessions
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get recent sessions
     */
    public function scopeRecent($query, int $minutes = 30)
    {
        return $query->where('last_activity', '>', now()->subMinutes($minutes));
    }

    /**
     * Check if session is expired
     */
    public function isExpired(int $timeoutMinutes = 30): bool
    {
        return $this->last_activity->diffInMinutes(now()) > $timeoutMinutes;
    }

    /**
     * Update session activity
     */
    public function updateActivity(): void
    {
        $this->update([
            'last_activity' => now(),
            'is_active' => true,
        ]);
    }

    /**
     * Terminate session
     */
    public function terminate(): void
    {
        $this->update(['is_active' => false]);
    }

    /**
     * Get device info from user agent
     */
    public function parseUserAgent(): array
    {
        $userAgent = $this->user_agent ?? '';
        
        // Simple device detection
        $deviceType = 'desktop';
        if (preg_match('/Mobile|Android|iPhone|iPad/', $userAgent)) {
            $deviceType = preg_match('/iPad/', $userAgent) ? 'tablet' : 'mobile';
        }

        // Simple browser detection
        $browser = 'Unknown';
        if (preg_match('/Chrome/', $userAgent)) $browser = 'Chrome';
        elseif (preg_match('/Firefox/', $userAgent)) $browser = 'Firefox';
        elseif (preg_match('/Safari/', $userAgent)) $browser = 'Safari';
        elseif (preg_match('/Edge/', $userAgent)) $browser = 'Edge';

        // Simple platform detection
        $platform = 'Unknown';
        if (preg_match('/Windows/', $userAgent)) $platform = 'Windows';
        elseif (preg_match('/Mac/', $userAgent)) $platform = 'macOS';
        elseif (preg_match('/Linux/', $userAgent)) $platform = 'Linux';
        elseif (preg_match('/Android/', $userAgent)) $platform = 'Android';
        elseif (preg_match('/iOS/', $userAgent)) $platform = 'iOS';

        return [
            'device_type' => $deviceType,
            'browser' => $browser,
            'platform' => $platform,
        ];
    }

    /**
     * Create session from request
     */
    public static function createFromRequest($request, $user): self
    {
        $userAgentInfo = (new static)->parseUserAgent();
        
        return static::create([
            'user_id' => $user->id,
            'session_id' => $request->session()->getId(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'device_type' => $userAgentInfo['device_type'],
            'browser' => $userAgentInfo['browser'],
            'platform' => $userAgentInfo['platform'],
            'last_activity' => now(),
            'is_active' => true,
        ]);
    }
}