<?php

namespace App\Events;

use App\Models\VideoCall;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CallInitiated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $videoCall;
    public $initiator;

    /**
     * Create a new event instance.
     */
    public function __construct(VideoCall $videoCall, User $initiator)
    {
        $this->videoCall = $videoCall;
        $this->initiator = $initiator;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        $channels = [];

        // Broadcast to all participants
        foreach ($this->videoCall->participants as $participant) {
            $channels[] = new PrivateChannel('user.' . $participant->user_id);
        }

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'call.initiated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'call' => [
                'id' => $this->videoCall->id,
                'call_id' => $this->videoCall->call_id,
                'room_id' => $this->videoCall->room_id,
                'type' => $this->videoCall->type,
                'title' => $this->videoCall->title,
                'description' => $this->videoCall->description,
                'status' => $this->videoCall->status,
                'scheduled_at' => $this->videoCall->scheduled_at?->toISOString(),
                'duration_minutes' => $this->videoCall->duration_minutes,
                'settings' => $this->videoCall->settings,
                'join_url' => route('video-call.join', ['call' => $this->videoCall->call_id]),
            ],
            'initiator' => [
                'id' => $this->initiator->id,
                'name' => $this->initiator->full_name,
                'avatar' => $this->initiator->avatar_url,
                'role' => $this->initiator->role,
            ],
            'timestamp' => now()->toISOString(),
        ];
    }
}
