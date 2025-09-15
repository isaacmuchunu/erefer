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

class PatientConditionUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $dispatch;

    /**
     * Create a new event instance.
     */
    public function __construct(AmbulanceDispatch $dispatch)
    {
        $this->dispatch = $dispatch;
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
            
            // Add receiving facility channel
            if ($this->dispatch->referral && $this->dispatch->referral->receiving_facility_id) {
                $channels[] = new PrivateChannel('facility.' . $this->dispatch->referral->receiving_facility_id);
            }
        }

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'patient.condition.updated';
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
            'patient_condition' => $this->dispatch->patient_condition_on_pickup,
            'status' => $this->dispatch->status,
            'referral_id' => $this->dispatch->referral_id,
            'patient_info' => $this->dispatch->referral && $this->dispatch->referral->patient ? [
                'id' => $this->dispatch->referral->patient->id,
                'name' => $this->dispatch->referral->patient->first_name . ' ' . $this->dispatch->referral->patient->last_name,
                'medical_record_number' => $this->dispatch->referral->patient->medical_record_number,
            ] : null,
            'timestamp' => now()->toISOString(),
        ];
    }
}
