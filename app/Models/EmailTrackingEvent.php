<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;

class EmailTrackingEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'email_message_id',
        'event_type',
        'recipient_email',
        'event_data',
        'user_agent',
        'ip_address',
        'occurred_at',
    ];

    protected $casts = [
        'event_data' => 'array',
        'occurred_at' => 'datetime',
    ];

    // Relationships
    public function emailMessage(): BelongsTo
    {
        return $this->belongsTo(EmailMessage::class);
    }

    // Accessors
    protected function isOpenEvent(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->event_type === 'opened'
        );
    }

    protected function isClickEvent(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->event_type === 'clicked'
        );
    }

    protected function isDeliveryEvent(): Attribute
    {
        return Attribute::make(
            get: fn () => in_array($this->event_type, ['delivered', 'bounced', 'failed'])
        );
    }

    protected function browserInfo(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->parseBrowserInfo($this->user_agent)
        );
    }

    protected function locationInfo(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->getLocationFromIP($this->ip_address)
        );
    }

    // Scopes
    public function scopeOpened($query)
    {
        return $query->where('event_type', 'opened');
    }

    public function scopeClicked($query)
    {
        return $query->where('event_type', 'clicked');
    }

    public function scopeDelivered($query)
    {
        return $query->where('event_type', 'delivered');
    }

    public function scopeBounced($query)
    {
        return $query->where('event_type', 'bounced');
    }

    public function scopeFailed($query)
    {
        return $query->where('event_type', 'failed');
    }

    public function scopeForRecipient($query, string $email)
    {
        return $query->where('recipient_email', $email);
    }

    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('occurred_at', '>=', now()->subHours($hours));
    }

    // Methods
    public function getEventDescription(): string
    {
        return match ($this->event_type) {
            'opened' => 'Email was opened',
            'clicked' => 'Link was clicked: ' . ($this->event_data['url'] ?? 'Unknown URL'),
            'delivered' => 'Email was delivered',
            'bounced' => 'Email bounced: ' . ($this->event_data['reason'] ?? 'Unknown reason'),
            'failed' => 'Email delivery failed: ' . ($this->event_data['reason'] ?? 'Unknown reason'),
            'unsubscribed' => 'Recipient unsubscribed',
            'spam_complaint' => 'Marked as spam',
            default => 'Unknown event: ' . $this->event_type,
        };
    }

    public function getEventIcon(): string
    {
        return match ($this->event_type) {
            'opened' => 'fa-envelope-open',
            'clicked' => 'fa-mouse-pointer',
            'delivered' => 'fa-check-circle',
            'bounced' => 'fa-exclamation-triangle',
            'failed' => 'fa-times-circle',
            'unsubscribed' => 'fa-user-minus',
            'spam_complaint' => 'fa-flag',
            default => 'fa-info-circle',
        };
    }

    public function getEventColor(): string
    {
        return match ($this->event_type) {
            'opened' => 'text-blue-600',
            'clicked' => 'text-green-600',
            'delivered' => 'text-green-600',
            'bounced' => 'text-yellow-600',
            'failed' => 'text-red-600',
            'unsubscribed' => 'text-gray-600',
            'spam_complaint' => 'text-red-600',
            default => 'text-gray-600',
        };
    }

    private function parseBrowserInfo(?string $userAgent): array
    {
        if (!$userAgent) {
            return ['browser' => 'Unknown', 'os' => 'Unknown'];
        }

        // Simple browser detection
        $browser = 'Unknown';
        $os = 'Unknown';

        if (str_contains($userAgent, 'Chrome')) {
            $browser = 'Chrome';
        } elseif (str_contains($userAgent, 'Firefox')) {
            $browser = 'Firefox';
        } elseif (str_contains($userAgent, 'Safari')) {
            $browser = 'Safari';
        } elseif (str_contains($userAgent, 'Edge')) {
            $browser = 'Edge';
        }

        if (str_contains($userAgent, 'Windows')) {
            $os = 'Windows';
        } elseif (str_contains($userAgent, 'Mac')) {
            $os = 'macOS';
        } elseif (str_contains($userAgent, 'Linux')) {
            $os = 'Linux';
        } elseif (str_contains($userAgent, 'Android')) {
            $os = 'Android';
        } elseif (str_contains($userAgent, 'iOS')) {
            $os = 'iOS';
        }

        return compact('browser', 'os');
    }

    private function getLocationFromIP(?string $ipAddress): array
    {
        if (!$ipAddress || $ipAddress === '127.0.0.1' || $ipAddress === '::1') {
            return ['country' => 'Local', 'city' => 'Local'];
        }

        // In a real application, you would use a GeoIP service
        // For now, return placeholder data
        return ['country' => 'Unknown', 'city' => 'Unknown'];
    }

    public function toArray(): array
    {
        return array_merge(parent::toArray(), [
            'description' => $this->getEventDescription(),
            'icon' => $this->getEventIcon(),
            'color' => $this->getEventColor(),
            'browser_info' => $this->browser_info,
            'location_info' => $this->location_info,
            'is_open_event' => $this->is_open_event,
            'is_click_event' => $this->is_click_event,
            'is_delivery_event' => $this->is_delivery_event,
        ]);
    }
}
