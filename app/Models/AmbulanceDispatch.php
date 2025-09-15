<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AmbulanceDispatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'dispatch_number',
        'referral_id',
        'ambulance_id',
        'dispatcher_id',
        'crew_members',
        'pickup_location',
        'destination_location',
        'dispatched_at',
        'eta_pickup',
        'eta_destination',
        'arrived_pickup_at',
        'left_pickup_at',
        'arrived_destination_at',
        'status',
        'special_instructions',
        'patient_condition_on_pickup',
        'patient_condition_on_arrival',
        'distance_km',
        'notes'
    ];

    protected $casts = [
        'crew_members' => 'array',
        'pickup_location' => 'array',
        'destination_location' => 'array',
        'dispatched_at' => 'datetime',
        'eta_pickup' => 'datetime',
        'eta_destination' => 'datetime',
        'arrived_pickup_at' => 'datetime',
        'left_pickup_at' => 'datetime',
        'arrived_destination_at' => 'datetime',
        'patient_condition_on_pickup' => 'array',
        'patient_condition_on_arrival' => 'array',
        'distance_km' => 'decimal:2'
    ];

    public function referral(): BelongsTo
    {
        return $this->belongsTo(Referral::class);
    }

    public function ambulance(): BelongsTo
    {
        return $this->belongsTo(Ambulance::class);
    }

    public function dispatcher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dispatcher_id');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['dispatched', 'en_route_pickup', 'at_pickup', 'en_route_destination']);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function getCrewMembersAttribute($value)
    {
        $crewIds = json_decode($value, true) ?? [];
        return AmbulanceCrew::whereIn('id', $crewIds)->get();
    }

    public function getTotalTransportTime(): ?int
    {
        if (!$this->arrived_destination_at || !$this->dispatched_at) {
            return null;
        }
        
        return $this->dispatched_at->diffInMinutes($this->arrived_destination_at);
    }

    public function getResponseTime(): ?int
    {
        if (!$this->arrived_pickup_at || !$this->dispatched_at) {
            return null;
        }
        
        return $this->dispatched_at->diffInMinutes($this->arrived_pickup_at);
    }
}


?>