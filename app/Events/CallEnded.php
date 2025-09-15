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

class CallEnded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $videoCall;
    public $endedBy;

    /**
     * Create a new event instance.
     */
    public function __construct(VideoCall $videoCall, User $endedBy)
    {
        $this->videoCall = $videoCall;
        $this->endedBy = $endedBy;
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
        return 'call.ended';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'call_id' => $this->videoCall->call_id,
            'room_id' => $this->videoCall->room_id,
            'ended_by' => [
                'id' => $this->endedBy->id,
                'name' => $this->endedBy->full_name,
                'role' => $this->endedBy->role,
            ],
            'duration_seconds' => $this->videoCall->started_at ?
                now()->diffInSeconds($this->videoCall->started_at) : 0,
            'timestamp' => now()->toISOString(),
        ];
    }
}
