<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class WhatsAppBusinessAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_account_id',
        'name',
        'phone_number',
        'phone_number_id',
        'access_token',
        'webhook_verify_token',
        'status',
        'settings',
        'rate_limits',
        'last_sync_at',
    ];

    protected $casts = [
        'settings' => 'array',
        'rate_limits' => 'array',
        'last_sync_at' => 'datetime',
    ];

    // Relationships
    public function conversations(): HasMany
    {
        return $this->hasMany(WhatsAppConversation::class, 'business_account_id');
    }

    public function templates(): HasMany
    {
        return $this->hasMany(WhatsAppTemplate::class, 'business_account_id');
    }

    public function contactLabels(): HasMany
    {
        return $this->hasMany(WhatsAppContactLabel::class, 'business_account_id');
    }

    public function automationRules(): HasMany
    {
        return $this->hasMany(WhatsAppAutomationRule::class, 'business_account_id');
    }

    public function analytics(): HasMany
    {
        return $this->hasMany(WhatsAppAnalytics::class, 'business_account_id');
    }

    // Accessors
    protected function isActive(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'active'
        );
    }

    protected function formattedPhoneNumber(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->formatPhoneNumber($this->phone_number)
        );
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    // Methods
    public function getApiUrl(): string
    {
        return "https://graph.facebook.com/v18.0/{$this->phone_number_id}";
    }

    public function getWebhookUrl(): string
    {
        return route('whatsapp.webhook');
    }

    public function updateSettings(array $settings): bool
    {
        return $this->update([
            'settings' => array_merge($this->settings ?? [], $settings)
        ]);
    }

    public function getSetting(string $key, $default = null)
    {
        return $this->settings[$key] ?? $default;
    }

    public function updateRateLimits(array $limits): bool
    {
        return $this->update([
            'rate_limits' => array_merge($this->rate_limits ?? [], $limits)
        ]);
    }

    public function getRateLimit(string $endpoint): ?array
    {
        return $this->rate_limits[$endpoint] ?? null;
    }

    public function isRateLimited(string $endpoint): bool
    {
        $limit = $this->getRateLimit($endpoint);
        
        if (!$limit) {
            return false;
        }

        $now = now();
        $windowStart = \Carbon\Carbon::parse($limit['window_start']);
        $windowEnd = \Carbon\Carbon::parse($limit['window_end']);

        // Check if we're still in the rate limit window
        if ($now->between($windowStart, $windowEnd)) {
            return $limit['requests_made'] >= $limit['requests_limit'];
        }

        return false;
    }

    public function incrementRateLimit(string $endpoint): void
    {
        $limits = $this->rate_limits ?? [];
        
        if (!isset($limits[$endpoint])) {
            $limits[$endpoint] = [
                'requests_made' => 0,
                'requests_limit' => 1000, // Default limit
                'window_start' => now()->toISOString(),
                'window_end' => now()->addHour()->toISOString(),
            ];
        }

        $limits[$endpoint]['requests_made']++;
        
        $this->update(['rate_limits' => $limits]);
    }

    public function syncWithFacebook(): bool
    {
        // Implement Facebook API sync logic
        try {
            // Sync business account info
            // Sync templates
            // Sync phone number info
            
            $this->update(['last_sync_at' => now()]);
            return true;
        } catch (\Exception $e) {
            \Log::error('WhatsApp Business Account sync failed', [
                'account_id' => $this->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    public function getStats(int $days = 30): array
    {
        $startDate = now()->subDays($days);
        
        return [
            'total_conversations' => $this->conversations()->count(),
            'active_conversations' => $this->conversations()->active()->count(),
            'new_conversations' => $this->conversations()->where('created_at', '>=', $startDate)->count(),
            'total_messages' => $this->conversations()->withCount('messages')->get()->sum('messages_count'),
            'templates_count' => $this->templates()->count(),
            'approved_templates' => $this->templates()->where('status', 'approved')->count(),
        ];
    }

    private function formatPhoneNumber(string $phone): string
    {
        // Remove any non-digit characters
        $phone = preg_replace('/\D/', '', $phone);
        
        // Format as international number
        if (!str_starts_with($phone, '+')) {
            return '+' . $phone;
        }
        
        return $phone;
    }

    public function canSendMessage(): bool
    {
        return $this->is_active && !$this->isRateLimited('messages');
    }

    public function getMessageQuota(): array
    {
        $limit = $this->getRateLimit('messages');
        
        return [
            'limit' => $limit['requests_limit'] ?? 1000,
            'used' => $limit['requests_made'] ?? 0,
            'remaining' => ($limit['requests_limit'] ?? 1000) - ($limit['requests_made'] ?? 0),
            'reset_at' => $limit['window_end'] ?? null,
        ];
    }
}
