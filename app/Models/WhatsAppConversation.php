<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\SoftDeletes;

class WhatsAppConversation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'business_account_id',
        'conversation_id',
        'contact_phone',
        'contact_name',
        'contact_profile',
        'status',
        'type',
        'last_message_at',
        'unread_count',
        'labels',
        'assigned_to',
        'referral_id',
    ];

    protected $casts = [
        'contact_profile' => 'array',
        'labels' => 'array',
        'last_message_at' => 'datetime',
    ];

    // Relationships
    public function businessAccount(): BelongsTo
    {
        return $this->belongsTo(WhatsAppBusinessAccount::class);
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function referral(): BelongsTo
    {
        return $this->belongsTo(Referral::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(WhatsAppMessage::class, 'conversation_id');
    }

    public function labels(): BelongsToMany
    {
        return $this->belongsToMany(WhatsAppContactLabel::class, 'whatsapp_conversation_labels', 'conversation_id', 'label_id')
                    ->withPivot('applied_by')
                    ->withTimestamps();
    }

    // Accessors
    protected function isActive(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'active'
        );
    }

    protected function isArchived(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'archived'
        );
    }

    protected function isBlocked(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'blocked'
        );
    }

    protected function hasUnreadMessages(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->unread_count > 0
        );
    }

    protected function lastMessage(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->messages()->latest()->first()
        );
    }

    protected function formattedPhone(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->formatPhoneNumber($this->contact_phone)
        );
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeArchived($query)
    {
        return $query->where('status', 'archived');
    }

    public function scopeBlocked($query)
    {
        return $query->where('status', 'blocked');
    }

    public function scopeUnread($query)
    {
        return $query->where('unread_count', '>', 0);
    }

    public function scopeAssignedTo($query, int $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    public function scopeUnassigned($query)
    {
        return $query->whereNull('assigned_to');
    }

    public function scopeWithLabel($query, string $labelName)
    {
        return $query->whereHas('labels', function ($q) use ($labelName) {
            $q->where('name', $labelName);
        });
    }

    public function scopeForBusinessAccount($query, int $businessAccountId)
    {
        return $query->where('business_account_id', $businessAccountId);
    }

    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('last_message_at', '>=', now()->subHours($hours));
    }

    public function scopeByPhone($query, string $phone)
    {
        return $query->where('contact_phone', $phone);
    }

    // Methods
    public function sendMessage(array $data): WhatsAppMessage
    {
        $message = $this->messages()->create([
            'message_id' => \Str::uuid(),
            'direction' => 'outbound',
            'type' => $data['type'] ?? 'text',
            'content' => $data['content'],
            'sender_id' => $data['sender_id'] ?? auth()->id(),
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        $this->update([
            'last_message_at' => now(),
        ]);

        return $message;
    }

    public function receiveMessage(array $data): WhatsAppMessage
    {
        $message = $this->messages()->create([
            'message_id' => $data['message_id'],
            'wamid' => $data['wamid'] ?? null,
            'direction' => 'inbound',
            'type' => $data['type'] ?? 'text',
            'content' => $data['content'],
            'status' => 'delivered',
            'sent_at' => $data['timestamp'] ?? now(),
            'metadata' => $data['metadata'] ?? null,
        ]);

        $this->increment('unread_count');
        $this->update(['last_message_at' => now()]);

        return $message;
    }

    public function markAsRead(User $user = null): void
    {
        $this->update(['unread_count' => 0]);

        // Mark all unread messages as read
        $this->messages()
            ->where('direction', 'inbound')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function assignTo(User $user): void
    {
        $this->update(['assigned_to' => $user->id]);
    }

    public function unassign(): void
    {
        $this->update(['assigned_to' => null]);
    }

    public function archive(): void
    {
        $this->update(['status' => 'archived']);
    }

    public function unarchive(): void
    {
        $this->update(['status' => 'active']);
    }

    public function block(): void
    {
        $this->update(['status' => 'blocked']);
    }

    public function unblock(): void
    {
        $this->update(['status' => 'active']);
    }

    public function addLabel(WhatsAppContactLabel $label, User $user): void
    {
        $this->labels()->syncWithoutDetaching([
            $label->id => ['applied_by' => $user->id]
        ]);
    }

    public function removeLabel(WhatsAppContactLabel $label): void
    {
        $this->labels()->detach($label->id);
    }

    public function updateContactInfo(array $profile): void
    {
        $this->update([
            'contact_name' => $profile['name'] ?? $this->contact_name,
            'contact_profile' => array_merge($this->contact_profile ?? [], $profile),
        ]);
    }

    public function canBeAccessedBy(User $user): bool
    {
        // Check if user is assigned to this conversation
        if ($this->assigned_to === $user->id) {
            return true;
        }

        // Check if user has access to the business account
        // This would depend on your business logic
        return true; // For now, allow all authenticated users
    }

    public function getResponseTime(): ?int
    {
        $lastInboundMessage = $this->messages()
            ->where('direction', 'inbound')
            ->latest('sent_at')
            ->first();

        if (!$lastInboundMessage) {
            return null;
        }

        $nextOutboundMessage = $this->messages()
            ->where('direction', 'outbound')
            ->where('sent_at', '>', $lastInboundMessage->sent_at)
            ->oldest('sent_at')
            ->first();

        if (!$nextOutboundMessage) {
            return null;
        }

        return $lastInboundMessage->sent_at->diffInMinutes($nextOutboundMessage->sent_at);
    }

    public function getAverageResponseTime(int $days = 30): ?float
    {
        $conversations = $this->messages()
            ->where('created_at', '>=', now()->subDays($days))
            ->get()
            ->groupBy(function ($message) {
                return $message->sent_at->format('Y-m-d H:i');
            });

        $responseTimes = [];

        foreach ($conversations as $messages) {
            $inbound = $messages->where('direction', 'inbound')->first();
            $outbound = $messages->where('direction', 'outbound')
                ->where('sent_at', '>', $inbound?->sent_at)
                ->first();

            if ($inbound && $outbound) {
                $responseTimes[] = $inbound->sent_at->diffInMinutes($outbound->sent_at);
            }
        }

        return empty($responseTimes) ? null : array_sum($responseTimes) / count($responseTimes);
    }

    private function formatPhoneNumber(string $phone): string
    {
        // Remove any non-digit characters
        $phone = preg_replace('/\D/', '', $phone);
        
        // Format as international number
        if (strlen($phone) === 10) {
            return '+1' . $phone; // Assume US number if 10 digits
        }
        
        if (!str_starts_with($phone, '+')) {
            return '+' . $phone;
        }
        
        return $phone;
    }
}
