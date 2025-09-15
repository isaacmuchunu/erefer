<?php

namespace App\Events;

use App\Models\Ambulance;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AmbulanceLocationUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $ambulance;
    public $locationData;

    /**
     * Create a new event instance.
     */
    public function __construct(Ambulance $ambulance, array $locationData)
    {
        $this->ambulance = $ambulance;
        $this->locationData = $locationData;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('ambulance.' . $this->ambulance->id),
            new PrivateChannel('facility.' . $this->ambulance->facility_id),
            new PrivateChannel('dispatch-center'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'location.updated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'ambulance_id' => $this->ambulance->id,
            'vehicle_number' => $this->ambulance->vehicle_number,
            'location' => $this->locationData,
            'status' => $this->ambulance->status,
            'current_dispatch' => $this->ambulance->currentDispatch ? [
                'id' => $this->ambulance->currentDispatch->id,
                'dispatch_number' => $this->ambulance->currentDispatch->dispatch_number,
                'status' => $this->ambulance->currentDispatch->status,
                'eta_pickup' => $this->ambulance->currentDispatch->eta_pickup,
                'eta_destination' => $this->ambulance->currentDispatch->eta_destination,
            ] : null,
            'timestamp' => now()->toISOString(),
        ];
    }
}
