<?php

namespace App\Events;

use App\Models\EmergencyBroadcast;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EmergencyBroadcastSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $broadcast;
    public $sender;

    /**
     * Create a new event instance.
     */
    public function __construct(EmergencyBroadcast $broadcast, User $sender)
    {
        $this->broadcast = $broadcast;
        $this->sender = $sender;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        // Broadcast to all users who should receive emergency alerts
        $channels = [
            new Channel('emergency-alerts'), // Public channel for all emergency alerts
        ];

        // Add private channels for specific roles if targeted
        if ($this->broadcast->target_roles) {
            foreach ($this->broadcast->target_roles as $role) {
                $channels[] = new PrivateChannel("role.{$role}");
            }
        } else {
            // Broadcast to all medical staff roles
            $roles = ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'dispatcher', 'ambulance_driver', 'ambulance_paramedic'];
            foreach ($roles as $role) {
                $channels[] = new PrivateChannel("role.{$role}");
            }
        }

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'emergency.broadcast.sent';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'broadcast' => [
                'id' => $this->broadcast->id,
                'title' => $this->broadcast->title,
                'message' => $this->broadcast->message,
                'severity' => $this->broadcast->severity,
                'type' => $this->broadcast->type,
                'severity_color' => $this->broadcast->severity_color,
                'type_icon' => $this->broadcast->type_icon,
                'expires_at' => $this->broadcast->expires_at?->toISOString(),
                'is_active' => $this->broadcast->is_active,
            ],
            'sender' => [
                'id' => $this->sender->id,
                'name' => $this->sender->full_name,
                'role' => $this->sender->role,
            ],
            'timestamp' => now()->toISOString(),
        ];
    }
}
