<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class VideoCall extends Model
{
    use HasFactory;

    protected $fillable = [
        'chat_room_id',
        'initiator_id',
        'call_id',
        'type',
        'status',
        'participants',
        'settings',
        'started_at',
        'ended_at',
        'duration_minutes',
        'recording_info',
    ];

    protected $casts = [
        'participants' => 'array',
        'settings' => 'array',
        'recording_info' => 'array',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    // Relationships
    public function chatRoom(): BelongsTo
    {
        return $this->belongsTo(ChatRoom::class);
    }

    public function initiator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'initiator_id');
    }

    public function callParticipants(): HasMany
    {
        return $this->hasMany(CallParticipant::class);
    }

    // Accessors
    protected function isActive(): Attribute
    {
        return Attribute::make(
            get: fn () => in_array($this->status, ['initiated', 'ringing', 'active'])
        );
    }

    protected function isEnded(): Attribute
    {
        return Attribute::make(
            get: fn () => in_array($this->status, ['ended', 'cancelled', 'failed'])
        );
    }

    protected function participantCount(): Attribute
    {
        return Attribute::make(
            get: fn () => count($this->participants ?? [])
        );
    }

    protected function activeParticipantCount(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->callParticipants()->where('status', 'joined')->count()
        );
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['initiated', 'ringing', 'active']);
    }

    public function scopeEnded($query)
    {
        return $query->whereIn('status', ['ended', 'cancelled', 'failed']);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('initiator_id', $userId)
              ->orWhereJsonContains('participants', $userId);
        });
    }

    // Methods
    public function addParticipant(User $user): CallParticipant
    {
        // Add to participants array if not already there
        $participants = $this->participants ?? [];
        if (!in_array($user->id, $participants)) {
            $participants[] = $user->id;
            $this->update(['participants' => $participants]);
        }

        return $this->callParticipants()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'status' => 'invited',
                'invited_at' => now(),
            ]
        );
    }

    public function removeParticipant(User $user): bool
    {
        // Remove from participants array
        $participants = array_filter($this->participants ?? [], fn($id) => $id !== $user->id);
        $this->update(['participants' => array_values($participants)]);

        // Update participant status
        $participant = $this->callParticipants()->where('user_id', $user->id)->first();
        if ($participant) {
            $participant->update([
                'status' => 'left',
                'left_at' => now(),
                'duration_minutes' => $participant->joined_at 
                    ? $participant->joined_at->diffInMinutes(now()) 
                    : 0
            ]);
        }

        return true;
    }

    public function joinCall(User $user): bool
    {
        $participant = $this->callParticipants()->where('user_id', $user->id)->first();
        if (!$participant) {
            $participant = $this->addParticipant($user);
        }

        return $participant->update([
            'status' => 'joined',
            'joined_at' => now(),
        ]);
    }

    public function leaveCall(User $user): bool
    {
        return $this->removeParticipant($user);
    }

    public function isParticipant(User $user): bool
    {
        return in_array($user->id, $this->participants ?? []);
    }

    public function canUserJoin(User $user): bool
    {
        // Check if call is active
        if (!$this->is_active) {
            return false;
        }

        // Check if user is invited
        if (!$this->isParticipant($user)) {
            return false;
        }

        // Check max participants limit
        $maxParticipants = $this->settings['max_participants'] ?? 8;
        if ($this->active_participant_count >= $maxParticipants) {
            return false;
        }

        return true;
    }

    public function canUserControl(User $user): bool
    {
        // Initiator can always control
        if ($this->initiator_id === $user->id) {
            return true;
        }

        // Check if user has admin role in chat room
        if ($this->chatRoom) {
            $participant = $this->chatRoom->participants()
                ->where('user_id', $user->id)
                ->first();
            
            return $participant && $participant->role === 'admin';
        }

        return false;
    }

    public function startRecording(): bool
    {
        if (!$this->settings['recording_enabled'] ?? false) {
            return false;
        }

        $recordingInfo = [
            'started_at' => now()->toISOString(),
            'recording_id' => \Str::uuid(),
            'status' => 'recording',
        ];

        return $this->update(['recording_info' => $recordingInfo]);
    }

    public function stopRecording(): bool
    {
        $recordingInfo = $this->recording_info ?? [];
        $recordingInfo['ended_at'] = now()->toISOString();
        $recordingInfo['status'] = 'completed';
        $recordingInfo['duration_minutes'] = isset($recordingInfo['started_at'])
            ? now()->diffInMinutes($recordingInfo['started_at'])
            : 0;

        return $this->update(['recording_info' => $recordingInfo]);
    }

    public function isRecording(): bool
    {
        return ($this->recording_info['status'] ?? null) === 'recording';
    }

    public function end(string $reason = 'ended'): bool
    {
        $endTime = now();
        $duration = $this->started_at ? $this->started_at->diffInMinutes($endTime) : 0;

        // Update all active participants
        $this->callParticipants()
            ->where('status', 'joined')
            ->update([
                'status' => 'left',
                'left_at' => $endTime,
                'duration_minutes' => \DB::raw("TIMESTAMPDIFF(MINUTE, joined_at, '{$endTime}')")
            ]);

        // Stop recording if active
        if ($this->isRecording()) {
            $this->stopRecording();
        }

        return $this->update([
            'status' => $reason,
            'ended_at' => $endTime,
            'duration_minutes' => $duration,
        ]);
    }

    public function getCallUrl(): string
    {
        return route('call.join', ['call' => $this->call_id]);
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

    public function getParticipantUsers(): array
    {
        return User::whereIn('id', $this->participants ?? [])->get()->toArray();
    }

    public function getActiveParticipants(): array
    {
        return $this->callParticipants()
            ->where('status', 'joined')
            ->with('user')
            ->get()
            ->pluck('user')
            ->toArray();
    }
}
