<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;
    public $notification;
    public $deliveryResults;

    /**
     * Create a new event instance.
     */
    public function __construct(User $user, $notification, array $deliveryResults = [])
    {
        $this->user = $user;
        $this->notification = $notification;
        $this->deliveryResults = $deliveryResults;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->user->id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'notification.sent';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $notificationData = is_array($this->notification) ? $this->notification : [
            'id' => $this->notification->id ?? null,
            'type' => $this->notification->type ?? 'general',
            'title' => $this->notification->data['title'] ?? 'Notification',
            'message' => $this->notification->data['message'] ?? '',
            'priority' => $this->notification->data['priority'] ?? 'normal',
            'category' => $this->notification->data['category'] ?? 'general',
            'action_url' => $this->notification->data['action_url'] ?? null,
            'action_text' => $this->notification->data['action_text'] ?? null,
            'icon' => $this->notification->data['icon'] ?? null,
            'is_read' => $this->notification->read_at !== null,
            'created_at' => $this->notification->created_at ?? now(),
        ];

        return [
            'notification' => $notificationData,
            'user_id' => $this->user->id,
            'delivery_results' => $this->deliveryResults,
            'timestamp' => now()->toISOString(),
        ];
    }
}
