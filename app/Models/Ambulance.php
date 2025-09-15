<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\AmbulanceDispatch;

class Ambulance extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'facility_id',
        'vehicle_number',
        'license_plate',
        'type',
        'make_model',
        'year_of_manufacture',
        'equipment_inventory',
        'capacity',
        'gps_device_info',
        'insurance_expiry',
        'license_expiry',
        'last_maintenance',
        'next_maintenance_due',
        'status',
        'fuel_level',
        'current_location',
    ];

    protected $casts = [
        'equipment_inventory' => 'array',
        'gps_device_info' => 'array',
        'insurance_expiry' => 'date',
        'license_expiry' => 'date',
        'last_maintenance' => 'date',
        'next_maintenance_due' => 'date',
        'fuel_level' => 'decimal:2',
        'current_location' => 'array',
    ];

    // Accessors & Mutators
    protected function isAvailable(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'available'
        );
    }

    protected function isDispatched(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'dispatched'
        );
    }

    protected function needsMaintenance(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->next_maintenance_due <= now()->addDays(7)
        );
    }

    protected function isLowFuel(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->fuel_level && $this->fuel_level < 25
        );
    }

    // Relationships
    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    public function dispatches(): HasMany
    {
        return $this->hasMany(AmbulanceDispatch::class);
    }

    public function currentDispatch(): HasOne
    {
        return $this->hasOne(AmbulanceDispatch::class)
            ->whereIn('status', ['dispatched', 'en_route_pickup', 'at_pickup', 'en_route_destination']);
    }

    public function maintenanceRecords(): HasMany
    {
        return $this->hasMany(AmbulanceMaintenanceRecord::class);
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeDispatched($query)
    {
        return $query->where('status', 'dispatched');
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeAtFacility($query, int $facilityId)
    {
        return $query->where('facility_id', $facilityId);
    }

    public function scopeNeedingMaintenance($query)
    {
        return $query->where('next_maintenance_due', '<=', now()->addDays(7));
    }

    public function scopeNearby($query, float $lat, float $lng, float $radiusKm = 20)
    {
        return $query->whereNotNull('current_location')
            ->whereRaw("
                ST_Distance_Sphere(
                    POINT(JSON_EXTRACT(current_location, '$.lng'), JSON_EXTRACT(current_location, '$.lat')),
                    POINT(?, ?)
                ) <= ?
            ", [$lng, $lat, $radiusKm * 1000]);
    }

    // Methods
    public function dispatch(array $dispatchData): AmbulanceDispatch
    {
        $this->update(['status' => 'dispatched']);

        return $this->dispatches()->create([
            'dispatch_number' => $this->generateDispatchNumber(),
            'referral_id' => $dispatchData['referral_id'] ?? null,
            'dispatcher_id' => auth()->user()->id,
            'crew_members' => $dispatchData['crew_members'],
            'pickup_location' => $dispatchData['pickup_location'],
            'destination_location' => $dispatchData['destination_location'],
            'dispatched_at' => now(),
            'special_instructions' => $dispatchData['special_instructions'] ?? null,
            'status' => 'dispatched',
        ]);
    }

    public function updateLocation(float $lat, float $lng): bool
    {
        return $this->update([
            'current_location' => [
                'lat' => $lat,
                'lng' => $lng,
                'updated_at' => now()->toISOString(),
            ]
        ]);
    }

    public function hasEquipment(string $equipment): bool
    {
        return collect($this->equipment_inventory)->contains('name', $equipment);
    }

    public function getDistanceFrom(float $lat, float $lng): ?float
    {
        if (!$this->current_location) {
            return null;
        }

        $location = $this->current_location;
        return $this->haversineDistance(
            $lat, 
            $lng, 
            $location['lat'], 
            $location['lng']
        );
    }

    private function generateDispatchNumber(): string
    {
        $date = now()->format('Ymd');
        $sequence = AmbulanceDispatch::whereDate('created_at', today())->count() + 1;
        return "DISP{$date}" . sprintf('%04d', $sequence);
    }

    private function haversineDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371; // Earth's radius in kilometers
        
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        
        $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng/2) * sin($dLng/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        
        return $earthRadius * $c;
    }
}

?>