<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;

class ChatRoom extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'type',
        'referral_id',
        'incident_id',
        'created_by',
        'is_active',
        'is_private',
        'settings',
        'last_activity_at',
        'archived_at',
    ];

    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
        'is_private' => 'boolean',
        'last_activity_at' => 'datetime',
        'archived_at' => 'datetime',
    ];

    // Relationships
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function referral(): BelongsTo
    {
        return $this->belongsTo(Referral::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(ChatRoomParticipant::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'chat_room_participants')
            ->withPivot(['role', 'joined_at', 'notification_settings'])
            ->withTimestamps();
    }

    public function videoCalls(): HasMany
    {
        return $this->hasMany(VideoCall::class);
    }

    // Accessors
    protected function isArchived(): Attribute
    {
        return Attribute::make(
            get: fn () => !$this->is_active || $this->archived_at !== null
        );
    }

    protected function participantCount(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->participants()->count()
        );
    }

    protected function unreadMessageCount(): Attribute
    {
        return Attribute::make(
            get: function () {
                $participant = $this->participants()
                    ->where('user_id', auth()->id())
                    ->first();
                
                if (!$participant) {
                    return 0;
                }

                return $this->messages()
                    ->where('created_at', '>', $participant->last_read_at ?? $participant->joined_at)
                    ->where('sender_id', '!=', auth()->id())
                    ->count();
            }
        );
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeArchived($query)
    {
        return $query->where('is_active', false)->orWhereNotNull('archived_at');
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->whereHas('participants', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        });
    }

    public function scopeWithUnreadMessages($query, int $userId)
    {
        return $query->whereHas('participants', function ($q) use ($userId) {
            $q->where('user_id', $userId)
              ->whereHas('chatRoom.messages', function ($mq) use ($q) {
                  $mq->where('created_at', '>', $q->select('last_read_at'))
                    ->where('sender_id', '!=', $userId);
              });
        });
    }

    public function scopeRecentActivity($query, int $days = 7)
    {
        return $query->where('last_activity_at', '>=', now()->subDays($days));
    }

    // Methods
    public function addParticipant(User $user, string $role = 'participant'): ChatRoomParticipant
    {
        return $this->participants()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'role' => $role,
                'joined_at' => now(),
                'notification_settings' => [
                    'muted' => false,
                    'notification_level' => 'all'
                ]
            ]
        );
    }

    public function removeParticipant(User $user): bool
    {
        return $this->participants()->where('user_id', $user->id)->delete() > 0;
    }

    public function isParticipant(User $user): bool
    {
        return $this->participants()->where('user_id', $user->id)->exists();
    }

    public function getParticipantRole(User $user): ?string
    {
        $participant = $this->participants()->where('user_id', $user->id)->first();
        return $participant?->role;
    }

    public function markAsRead(User $user): void
    {
        $participant = $this->participants()->where('user_id', $user->id)->first();
        if ($participant) {
            $participant->update(['last_read_at' => now()]);
        }
    }

    public function getLastMessage(): ?ChatMessage
    {
        return $this->messages()->latest()->first();
    }

    public function archive(): bool
    {
        return $this->update([
            'is_active' => false,
            'archived_at' => now()
        ]);
    }

    public function unarchive(): bool
    {
        return $this->update([
            'is_active' => true,
            'archived_at' => null
        ]);
    }

    public function updateActivity(): void
    {
        $this->update(['last_activity_at' => now()]);
    }

    public function canUserAccess(User $user): bool
    {
        // Check if user is participant
        if ($this->isParticipant($user)) {
            return true;
        }

        // Check if user has admin role
        if (in_array($user->role, ['super_admin', 'hospital_admin'])) {
            return true;
        }

        // Check if it's a referral chat and user is involved in the referral
        if ($this->referral_id && $this->referral) {
            return $this->referral->referring_doctor_id === $user->doctor?->id ||
                   $this->referral->receiving_doctor_id === $user->doctor?->id ||
                   $this->referral->referring_facility_id === $user->facility_id ||
                   $this->referral->receiving_facility_id === $user->facility_id;
        }

        return false;
    }

    public function getSettings(string $key = null, $default = null)
    {
        if ($key === null) {
            return $this->settings ?? [];
        }

        return $this->settings[$key] ?? $default;
    }

    public function updateSettings(array $settings): bool
    {
        return $this->update([
            'settings' => array_merge($this->settings ?? [], $settings)
        ]);
    }

    public function getOnlineParticipants(): array
    {
        $communicationService = app(\App\Services\RealTimeCommunicationService::class);
        $participantIds = $this->participants()->pluck('user_id')->toArray();
        $onlineUserIds = $communicationService->getOnlineUsers($participantIds);
        
        return User::whereIn('id', $onlineUserIds)->get()->toArray();
    }

    public function getTypingUsers(): array
    {
        $communicationService = app(\App\Services\RealTimeCommunicationService::class);
        return $communicationService->getTypingUsers($this);
    }

    public function generateInviteCode(): string
    {
        $code = \Str::random(8);
        $this->update(['invite_code' => $code]);
        return $code;
    }

    public static function findByInviteCode(string $code): ?self
    {
        return static::where('invite_code', $code)->first();
    }
}
