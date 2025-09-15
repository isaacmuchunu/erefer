<?php

namespace App\Events;

use App\Models\AmbulanceDispatch;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GeofenceAlert implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $dispatch;
    public $alertType;

    /**
     * Create a new event instance.
     */
    public function __construct(AmbulanceDispatch $dispatch, string $alertType)
    {
        $this->dispatch = $dispatch;
        $this->alertType = $alertType;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('dispatch.' . $this->dispatch->id),
            new PrivateChannel('ambulance.' . $this->dispatch->ambulance_id),
            new PrivateChannel('dispatch-center'),
        ];

        // Add referral-specific channel if this dispatch is for a referral
        if ($this->dispatch->referral_id) {
            $channels[] = new PrivateChannel('referral.' . $this->dispatch->referral_id);
        }

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'geofence.alert';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'dispatch_id' => $this->dispatch->id,
            'dispatch_number' => $this->dispatch->dispatch_number,
            'ambulance_id' => $this->dispatch->ambulance_id,
            'ambulance_vehicle_number' => $this->dispatch->ambulance->vehicle_number,
            'alert_type' => $this->alertType,
            'status' => $this->dispatch->status,
            'referral_id' => $this->dispatch->referral_id,
            'message' => $this->getAlertMessage(),
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * Get human-readable alert message
     */
    private function getAlertMessage(): string
    {
        switch ($this->alertType) {
            case 'pickup_arrival':
                return "Ambulance {$this->dispatch->ambulance->vehicle_number} has arrived at pickup location";
            case 'destination_arrival':
                return "Ambulance {$this->dispatch->ambulance->vehicle_number} has arrived at destination";
            default:
                return "Geofence alert for ambulance {$this->dispatch->ambulance->vehicle_number}";
        }
    }
}
