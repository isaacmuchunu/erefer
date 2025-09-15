<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Casts\Attribute;

class PatientNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'notifiable_type',
        'notifiable_id',
        'type',
        'channel',
        'title',
        'message',
        'template_id',
        'template_data',
        'scheduled_at',
        'sent_at',
        'delivered_at',
        'read_at',
        'failed_at',
        'failure_reason',
        'status',
        'priority',
        'retry_count',
        'max_retries',
        'metadata',
        'external_id',
        'external_status',
        'cost',
        'ai_optimized',
        'ai_score',
        'personalization_data',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
        'failed_at' => 'datetime',
        'template_data' => 'array',
        'metadata' => 'array',
        'retry_count' => 'integer',
        'max_retries' => 'integer',
        'cost' => 'decimal:4',
        'ai_optimized' => 'boolean',
        'ai_score' => 'decimal:2',
        'personalization_data' => 'array',
    ];

    // Accessors & Mutators
    protected function isPending(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'pending'
        );
    }

    protected function isSent(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'sent'
        );
    }

    protected function isDelivered(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'delivered'
        );
    }

    protected function isRead(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'read'
        );
    }

    protected function isFailed(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'failed'
        );
    }

    protected function canRetry(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'failed' && $this->retry_count < $this->max_retries
        );
    }

    protected function isScheduled(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->scheduled_at && $this->scheduled_at > now()
        );
    }

    protected function isOverdue(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->scheduled_at && $this->scheduled_at < now() && $this->status === 'pending'
        );
    }

    // Relationships
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function notifiable(): MorphTo
    {
        return $this->morphTo();
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(NotificationTemplate::class, 'template_id');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopeDelivered($query)
    {
        return $query->where('status', 'delivered');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeByChannel($query, $channel)
    {
        return $query->where('channel', $channel);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeScheduled($query)
    {
        return $query->whereNotNull('scheduled_at')
                    ->where('scheduled_at', '>', now());
    }

    public function scopeOverdue($query)
    {
        return $query->whereNotNull('scheduled_at')
                    ->where('scheduled_at', '<', now())
                    ->where('status', 'pending');
    }

    public function scopeCanRetry($query)
    {
        return $query->where('status', 'failed')
                    ->whereRaw('retry_count < max_retries');
    }

    public function scopeHighPriority($query)
    {
        return $query->where('priority', 'high');
    }

    public function scopeAiOptimized($query)
    {
        return $query->where('ai_optimized', true);
    }

    // Methods
    public function markAsSent(string $externalId = null): bool
    {
        return $this->update([
            'status' => 'sent',
            'sent_at' => now(),
            'external_id' => $externalId,
        ]);
    }

    public function markAsDelivered(): bool
    {
        return $this->update([
            'status' => 'delivered',
            'delivered_at' => now(),
        ]);
    }

    public function markAsRead(): bool
    {
        return $this->update([
            'status' => 'read',
            'read_at' => now(),
        ]);
    }

    public function markAsFailed(string $reason): bool
    {
        return $this->update([
            'status' => 'failed',
            'failed_at' => now(),
            'failure_reason' => $reason,
            'retry_count' => $this->retry_count + 1,
        ]);
    }

    public function retry(): bool
    {
        if (!$this->can_retry) {
            return false;
        }

        return $this->update([
            'status' => 'pending',
            'failed_at' => null,
            'failure_reason' => null,
        ]);
    }

    public function schedule(\DateTime $scheduledAt): bool
    {
        return $this->update([
            'scheduled_at' => $scheduledAt,
            'status' => 'pending',
        ]);
    }

    public function updateExternalStatus(string $status, array $metadata = []): bool
    {
        $updateData = [
            'external_status' => $status,
            'metadata' => array_merge($this->metadata ?? [], $metadata),
        ];

        // Map external status to internal status
        switch (strtolower($status)) {
            case 'delivered':
                $updateData['status'] = 'delivered';
                $updateData['delivered_at'] = now();
                break;
            case 'read':
            case 'opened':
                $updateData['status'] = 'read';
                $updateData['read_at'] = now();
                break;
            case 'failed':
            case 'bounced':
            case 'rejected':
                $updateData['status'] = 'failed';
                $updateData['failed_at'] = now();
                $updateData['failure_reason'] = $metadata['reason'] ?? 'External service failure';
                break;
        }

        return $this->update($updateData);
    }

    public function calculateCost(): float
    {
        $baseCosts = [
            'sms' => 0.05,
            'email' => 0.001,
            'whatsapp' => 0.02,
            'push' => 0.0001,
            'voice' => 0.10,
        ];

        $cost = $baseCosts[$this->channel] ?? 0;

        // Apply AI optimization discount
        if ($this->ai_optimized && $this->ai_score > 8.0) {
            $cost *= 0.9; // 10% discount for high-quality AI optimized messages
        }

        $this->update(['cost' => $cost]);

        return $cost;
    }

    public function personalizeMessage(): string
    {
        $message = $this->message;
        $data = $this->personalization_data ?? [];

        // Basic personalization
        $message = str_replace('{patient_name}', $this->patient->full_name, $message);
        $message = str_replace('{first_name}', $this->patient->first_name, $message);

        // Dynamic data replacement
        foreach ($data as $key => $value) {
            $message = str_replace("{{$key}}", $value, $message);
        }

        // AI-powered personalization based on patient preferences
        if ($this->ai_optimized) {
            $message = $this->applyAIPersonalization($message);
        }

        return $message;
    }

    private function applyAIPersonalization(string $message): string
    {
        // Get patient communication preferences
        $preferences = $this->patient->communication_preferences ?? [];

        // Adjust tone based on patient age and preferences
        if ($this->patient->age > 65) {
            $message = str_replace('Hi!', 'Dear', $message);
            $message = str_replace('Thanks!', 'Thank you', $message);
        }

        // Adjust language complexity based on patient education level
        if (isset($preferences['simple_language']) && $preferences['simple_language']) {
            $message = $this->simplifyLanguage($message);
        }

        // Add cultural sensitivity adjustments
        if (isset($preferences['cultural_context'])) {
            $message = $this->applyCulturalContext($message, $preferences['cultural_context']);
        }

        return $message;
    }

    private function simplifyLanguage(string $message): string
    {
        $replacements = [
            'appointment' => 'visit',
            'consultation' => 'meeting',
            'medication' => 'medicine',
            'prescription' => 'medicine order',
            'examination' => 'check-up',
        ];

        foreach ($replacements as $complex => $simple) {
            $message = str_ireplace($complex, $simple, $message);
        }

        return $message;
    }

    private function applyCulturalContext(string $message, string $context): string
    {
        // Apply cultural context based on patient background
        // This would be expanded based on specific cultural requirements
        
        switch ($context) {
            case 'formal':
                $message = str_replace('Hi', 'Dear', $message);
                break;
            case 'family_oriented':
                if (strpos($message, 'appointment') !== false) {
                    $message .= ' Feel free to bring a family member if you wish.';
                }
                break;
        }

        return $message;
    }

    public function getDeliveryTime(): ?int
    {
        if (!$this->sent_at || !$this->delivered_at) {
            return null;
        }

        return $this->sent_at->diffInSeconds($this->delivered_at);
    }

    public function getReadTime(): ?int
    {
        if (!$this->delivered_at || !$this->read_at) {
            return null;
        }

        return $this->delivered_at->diffInSeconds($this->read_at);
    }

    public function getChannelIcon(): string
    {
        return match($this->channel) {
            'sms' => '📱',
            'email' => '📧',
            'whatsapp' => '💬',
            'push' => '🔔',
            'voice' => '📞',
            default => '📨',
        };
    }

    public function getStatusColor(): string
    {
        return match($this->status) {
            'pending' => 'yellow',
            'sent' => 'blue',
            'delivered' => 'green',
            'read' => 'emerald',
            'failed' => 'red',
            default => 'gray',
        };
    }

    public function getPriorityColor(): string
    {
        return match($this->priority) {
            'low' => 'gray',
            'normal' => 'blue',
            'high' => 'orange',
            'urgent' => 'red',
            default => 'gray',
        };
    }

    public function shouldRetry(): bool
    {
        return $this->can_retry && 
               $this->failed_at && 
               $this->failed_at < now()->subMinutes(5); // Wait 5 minutes before retry
    }

    public function getNextRetryTime(): ?\DateTime
    {
        if (!$this->can_retry) {
            return null;
        }

        // Exponential backoff: 5min, 15min, 45min, 2hr, 6hr
        $delays = [5, 15, 45, 120, 360];
        $delay = $delays[min($this->retry_count, count($delays) - 1)];

        return $this->failed_at->addMinutes($delay);
    }
}
