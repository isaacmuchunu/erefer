<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;

class ChatMessage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'chat_room_id',
        'sender_id',
        'message',
        'message_type',
        'attachments',
        'metadata',
        'reply_to_id',
        'is_system_message',
        'is_edited',
        'edited_at',
        'priority',
        'expires_at',
    ];

    protected $casts = [
        'attachments' => 'array',
        'metadata' => 'array',
        'is_system_message' => 'boolean',
        'is_edited' => 'boolean',
        'edited_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    // Relationships
    public function chatRoom(): BelongsTo
    {
        return $this->belongsTo(ChatRoom::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(ChatMessage::class, 'reply_to_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(ChatMessage::class, 'reply_to_id');
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(MessageReaction::class);
    }

    public function readReceipts(): HasMany
    {
        return $this->hasMany(MessageReadReceipt::class);
    }

    // Accessors
    protected function isExpired(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->expires_at && $this->expires_at < now()
        );
    }

    protected function hasAttachments(): Attribute
    {
        return Attribute::make(
            get: fn () => !empty($this->attachments)
        );
    }

    protected function isReply(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->reply_to_id !== null
        );
    }

    protected function reactionCounts(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->reactions()
                    ->selectRaw('emoji, COUNT(*) as count')
                    ->groupBy('emoji')
                    ->pluck('count', 'emoji')
                    ->toArray();
            }
        );
    }

    protected function readByCount(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->readReceipts()->count()
        );
    }

    // Scopes
    public function scopeByType($query, string $type)
    {
        return $query->where('message_type', $type);
    }

    public function scopeFromUser($query, int $userId)
    {
        return $query->where('sender_id', $userId);
    }

    public function scopeSystemMessages($query)
    {
        return $query->where('is_system_message', true);
    }

    public function scopeUserMessages($query)
    {
        return $query->where('is_system_message', false);
    }

    public function scopeWithAttachments($query)
    {
        return $query->whereNotNull('attachments');
    }

    public function scopeUnexpired($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>', now());
        });
    }

    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('created_at', '>=', now()->subHours($hours));
    }

    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeUnread($query, int $userId)
    {
        return $query->whereDoesntHave('readReceipts', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        });
    }

    // Methods
    public function markAsRead(User $user): MessageReadReceipt
    {
        return $this->readReceipts()->firstOrCreate(
            ['user_id' => $user->id],
            ['read_at' => now()]
        );
    }

    public function isReadBy(User $user): bool
    {
        return $this->readReceipts()->where('user_id', $user->id)->exists();
    }

    public function addReaction(User $user, string $emoji): MessageReaction
    {
        // Remove existing reaction from this user first
        $this->reactions()->where('user_id', $user->id)->delete();
        
        return $this->reactions()->create([
            'user_id' => $user->id,
            'emoji' => $emoji,
        ]);
    }

    public function removeReaction(User $user): bool
    {
        return $this->reactions()->where('user_id', $user->id)->delete() > 0;
    }

    public function getUserReaction(User $user): ?string
    {
        $reaction = $this->reactions()->where('user_id', $user->id)->first();
        return $reaction?->emoji;
    }

    public function edit(string $newMessage, array $metadata = []): bool
    {
        return $this->update([
            'message' => $newMessage,
            'is_edited' => true,
            'edited_at' => now(),
            'metadata' => array_merge($this->metadata ?? [], $metadata)
        ]);
    }

    public function canBeEditedBy(User $user): bool
    {
        // Only sender can edit their own messages
        if ($this->sender_id !== $user->id) {
            return false;
        }

        // System messages cannot be edited
        if ($this->is_system_message) {
            return false;
        }

        // Messages older than 24 hours cannot be edited
        if ($this->created_at < now()->subHours(24)) {
            return false;
        }

        return true;
    }

    public function canBeDeletedBy(User $user): bool
    {
        // Sender can delete their own messages
        if ($this->sender_id === $user->id) {
            return true;
        }

        // Chat room admins can delete messages
        $participant = $this->chatRoom->participants()
            ->where('user_id', $user->id)
            ->first();

        if ($participant && in_array($participant->role, ['admin', 'moderator'])) {
            return true;
        }

        // System admins can delete any message
        if (in_array($user->role, ['super_admin', 'hospital_admin'])) {
            return true;
        }

        return false;
    }

    public function getAttachmentsByType(string $type): array
    {
        if (!$this->attachments) {
            return [];
        }

        return array_filter($this->attachments, function ($attachment) use ($type) {
            return ($attachment['type'] ?? null) === $type;
        });
    }

    public function hasAttachmentType(string $type): bool
    {
        return !empty($this->getAttachmentsByType($type));
    }

    public function getFormattedMessage(): string
    {
        $message = $this->message;

        // Format mentions (@username)
        $message = preg_replace_callback('/@(\w+)/', function ($matches) {
            $username = $matches[1];
            $user = User::where('email', 'like', "%{$username}%")->first();
            if ($user) {
                return "<span class=\"mention\">@{$user->full_name}</span>";
            }
            return $matches[0];
        }, $message);

        // Format links
        $message = preg_replace(
            '/(https?:\/\/[^\s]+)/',
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
            $message
        );

        return $message;
    }

    public function expire(): bool
    {
        return $this->update(['expires_at' => now()]);
    }

    public function isVisibleTo(User $user): bool
    {
        // Check if message is expired
        if ($this->is_expired) {
            return false;
        }

        // Check if user can access the chat room
        return $this->chatRoom->canUserAccess($user);
    }

    public function getReadByUsers(): array
    {
        return $this->readReceipts()
            ->with('user')
            ->get()
            ->pluck('user')
            ->toArray();
    }

    public function getUnreadByUsers(): array
    {
        $chatRoomParticipants = $this->chatRoom->participants()
            ->with('user')
            ->get()
            ->pluck('user');

        $readByUserIds = $this->readReceipts()->pluck('user_id')->toArray();

        return $chatRoomParticipants
            ->whereNotIn('id', $readByUserIds)
            ->where('id', '!=', $this->sender_id) // Exclude sender
            ->values()
            ->toArray();
    }
}
