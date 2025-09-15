<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatRoomParticipant extends Model
{
    use HasFactory;

    protected $fillable = [
        'chat_room_id',
        'user_id',
        'role',
        'joined_at',
        'last_read_at',
        'notification_settings',
    ];

    protected $casts = [
        'notification_settings' => 'array',
        'joined_at' => 'datetime',
        'last_read_at' => 'datetime',
    ];

    // Relationships
    public function chatRoom(): BelongsTo
    {
        return $this->belongsTo(ChatRoom::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Methods
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isModerator(): bool
    {
        return in_array($this->role, ['admin', 'moderator']);
    }

    public function canManageParticipants(): bool
    {
        return $this->isAdmin();
    }

    public function canDeleteMessages(): bool
    {
        return $this->isModerator();
    }

    public function updateLastRead(): void
    {
        $this->update(['last_read_at' => now()]);
    }

    public function getNotificationSetting(string $key, $default = null)
    {
        return $this->notification_settings[$key] ?? $default;
    }

    public function updateNotificationSettings(array $settings): bool
    {
        return $this->update([
            'notification_settings' => array_merge($this->notification_settings ?? [], $settings)
        ]);
    }

    public function isMuted(): bool
    {
        return $this->getNotificationSetting('muted', false);
    }

    public function mute(): bool
    {
        return $this->updateNotificationSettings(['muted' => true]);
    }

    public function unmute(): bool
    {
        return $this->updateNotificationSettings(['muted' => false]);
    }
}
