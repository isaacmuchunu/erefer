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

class ScreenSharingStarted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $videoCall;
    public $user;

    /**
     * Create a new event instance.
     */
    public function __construct(VideoCall $videoCall, User $user)
    {
        $this->videoCall = $videoCall;
        $this->user = $user;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('video-call.' . $this->videoCall->room_id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'screen.sharing.started';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->full_name,
                'avatar' => $this->user->avatar_url,
                'role' => $this->user->role,
            ],
            'call_id' => $this->videoCall->call_id,
            'room_id' => $this->videoCall->room_id,
            'timestamp' => now()->toISOString(),
        ];
    }
}
