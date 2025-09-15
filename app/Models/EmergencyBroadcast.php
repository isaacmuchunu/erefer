<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmergencyBroadcast extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'message',
        'severity',
        'type',
        'sent_by',
        'target_roles',
        'target_facilities',
        'channels',
        'status',
        'sent_at',
        'expires_at',
        'recipient_count',
        'success_count',
        'failure_count',
        'delivery_results',
        'metadata',
    ];

    protected $casts = [
        'target_roles' => 'array',
        'target_facilities' => 'array',
        'channels' => 'array',
        'delivery_results' => 'array',
        'metadata' => 'array',
        'sent_at' => 'datetime',
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'sent')
                    ->where(function ($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                    });
    }

    public function scopeBySeverity($query, $severity)
    {
        return $query->where('severity', $severity);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeRecent($query, $hours = 24)
    {
        return $query->where('created_at', '>=', now()->subHours($hours));
    }

    // Accessors
    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'sent' && 
               ($this->expires_at === null || $this->expires_at->isFuture());
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function getSuccessRateAttribute(): float
    {
        if ($this->recipient_count === 0) {
            return 0;
        }
        return round(($this->success_count / $this->recipient_count) * 100, 2);
    }

    public function getSeverityColorAttribute(): string
    {
        return match($this->severity) {
            'critical' => 'red',
            'high' => 'orange',
            'medium' => 'yellow',
            'low' => 'blue',
            default => 'gray',
        };
    }

    public function getTypeIconAttribute(): string
    {
        return match($this->type) {
            'medical_emergency' => 'medical-bag',
            'system_alert' => 'exclamation-triangle',
            'security_alert' => 'shield-exclamation',
            'weather_alert' => 'cloud-rain',
            'evacuation' => 'sign-out-alt',
            default => 'bell',
        };
    }

    // Methods
    public function markAsSent(): bool
    {
        return $this->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    public function markAsFailed(string $reason = null): bool
    {
        return $this->update([
            'status' => 'failed',
            'metadata' => array_merge($this->metadata ?? [], [
                'failure_reason' => $reason,
                'failed_at' => now()->toISOString(),
            ]),
        ]);
    }

    public function updateDeliveryResults(array $results): bool
    {
        $successCount = collect($results)->where('result.success', true)->count();
        $failureCount = count($results) - $successCount;

        return $this->update([
            'delivery_results' => $results,
            'success_count' => $successCount,
            'failure_count' => $failureCount,
        ]);
    }

    public function canBeRetried(): bool
    {
        return in_array($this->status, ['failed', 'partial']) && 
               $this->failure_count > 0;
    }

    public function getTargetUserCount(): int
    {
        $query = User::where('is_active', true);

        if ($this->target_roles) {
            $query->whereIn('role', $this->target_roles);
        }

        if ($this->target_facilities) {
            $query->whereIn('facility_id', $this->target_facilities);
        }

        if (!$this->target_roles && !$this->target_facilities) {
            $query->whereIn('role', ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'dispatcher']);
        }

        return $query->count();
    }

    public function getChannelNames(): array
    {
        $channelMap = [
            'database' => 'In-App',
            'email' => 'Email',
            'sms' => 'SMS',
            'whatsapp' => 'WhatsApp',
            'push' => 'Push Notification',
            'voice' => 'Voice Call',
        ];

        return array_map(function ($channel) use ($channelMap) {
            return $channelMap[$channel] ?? ucfirst($channel);
        }, $this->channels ?? []);
    }

    public function getFormattedDuration(): ?string
    {
        if (!$this->sent_at) {
            return null;
        }

        $endTime = $this->expires_at ?? now();
        $duration = $this->sent_at->diffInMinutes($endTime);

        if ($duration < 60) {
            return "{$duration} minutes";
        } elseif ($duration < 1440) {
            $hours = floor($duration / 60);
            $minutes = $duration % 60;
            return "{$hours}h {$minutes}m";
        } else {
            $days = floor($duration / 1440);
            $hours = floor(($duration % 1440) / 60);
            return "{$days}d {$hours}h";
        }
    }

    // Static methods
    public static function createEmergencyAlert(array $data): self
    {
        return self::create(array_merge($data, [
            'severity' => 'critical',
            'type' => 'medical_emergency',
            'status' => 'pending',
            'channels' => ['database', 'push', 'sms', 'email'],
        ]));
    }

    public static function getActiveBroadcasts(): \Illuminate\Database\Eloquent\Collection
    {
        return self::active()->orderBy('created_at', 'desc')->get();
    }

    public static function getRecentBroadcasts(int $hours = 24): \Illuminate\Database\Eloquent\Collection
    {
        return self::recent($hours)->orderBy('created_at', 'desc')->get();
    }

    public static function getBroadcastStats(int $days = 30): array
    {
        $startDate = now()->subDays($days);

        return [
            'total' => self::where('created_at', '>=', $startDate)->count(),
            'by_severity' => self::where('created_at', '>=', $startDate)
                ->selectRaw('severity, COUNT(*) as count')
                ->groupBy('severity')
                ->pluck('count', 'severity')
                ->toArray(),
            'by_type' => self::where('created_at', '>=', $startDate)
                ->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray(),
            'success_rate' => self::where('created_at', '>=', $startDate)
                ->where('status', 'sent')
                ->avg('success_count') ?? 0,
        ];
    }
}
