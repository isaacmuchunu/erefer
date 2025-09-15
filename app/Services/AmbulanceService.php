<?php
namespace App\Services;

use App\Models\Ambulance;
use App\Models\AmbulanceCrew;
use App\Models\AmbulanceDispatch;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AmbulanceService
{
    /**
     * Create a new ambulance record
     *
     * @param array $data
     * @return Ambulance
     */
    public function create(array $data): Ambulance
    {
        return Ambulance::create($data);
    }

    /**
     * Update an existing ambulance record
     *
     * @param Ambulance $ambulance
     * @param array $data
     * @return Ambulance
     */
    public function update(Ambulance $ambulance, array $data): Ambulance
    {
        $ambulance->update($data);
        return $ambulance->fresh();
    }

    /**
     * Delete an ambulance record
     *
     * @param Ambulance $ambulance
     * @return bool
     */
    public function delete(Ambulance $ambulance): bool
    {
        return $ambulance->delete();
    }

    /**
     * Update ambulance status
     *
     * @param Ambulance $ambulance
     * @param array $data
     * @return Ambulance
     */
    public function updateStatus(Ambulance $ambulance, array $data): Ambulance
    {
        $ambulance->update([
            'status' => $data['status'],
            'notes' => $data['notes'] ?? null,
        ]);

        return $ambulance->fresh();
    }

    /**
     * Assign crew to ambulance
     *
     * @param Ambulance $ambulance
     * @param array $crewIds
     * @return Ambulance
     */
    public function assignCrew(Ambulance $ambulance, array $crewIds): Ambulance
    {
        // Delete existing crew assignments
        AmbulanceCrew::where('ambulance_id', $ambulance->id)->delete();

        // Create new crew assignments
        foreach ($crewIds as $crewId) {
            AmbulanceCrew::create([
                'ambulance_id' => $ambulance->id,
                'user_id' => $crewId,
                'assigned_at' => now(),
            ]);
        }

        return $ambulance->fresh();
    }

    /**
     * Dispatch ambulance
     *
     * @param Ambulance $ambulance
     * @param array $data
     * @return AmbulanceDispatch
     */
    public function dispatch(Ambulance $ambulance, array $data): AmbulanceDispatch
    {
        // Check if ambulance is available
        if ($ambulance->status !== 'available') {
            throw new \Exception('Ambulance is not available for dispatch');
        }

        // Use model's dispatch method to ensure consistency with fillable fields
        $dispatch = $ambulance->dispatch($data);

        return $dispatch;
    }

    /**
     * Update dispatch status
     *
     * @param AmbulanceDispatch $dispatch
     * @param array $data
     * @return AmbulanceDispatch
     */
    public function updateDispatchStatus(AmbulanceDispatch $dispatch, array $data): AmbulanceDispatch
    {
        // Always update the status and notes first
        $dispatch->update([
            'status' => $data['status'],
            'notes' => $data['notes'] ?? $dispatch->notes,
        ]);

        // Update timestamps and additional fields based on status transitions
        switch ($data['status']) {
            case 'en_route_pickup':
                // Already dispatched; optionally could set ETA to pickup if provided
                break;
            case 'at_pickup':
                $dispatch->update([
                    'arrived_pickup_at' => now(),
                    'patient_condition_on_pickup' => $data['patient_condition'] ?? $dispatch->patient_condition_on_pickup,
                ]);
                break;
            case 'en_route_destination':
                $dispatch->update([
                    'left_pickup_at' => now(),
                ]);
                break;
            case 'arrived':
                $dispatch->update([
                    'arrived_destination_at' => now(),
                    'patient_condition_on_arrival' => $data['patient_condition'] ?? $dispatch->patient_condition_on_arrival,
                ]);
                break;
            case 'completed':
                // Mark ambulance available again
                $dispatch->ambulance->update([
                    'status' => 'available',
                ]);
                break;
            case 'cancelled':
                // Mark ambulance available again
                $dispatch->ambulance->update([
                    'status' => 'available',
                ]);
                break;
        }

        return $dispatch->fresh();
    }

    /**
     * Get available ambulances
     *
     * @param array $filters
     * @return array
     */
    public function getAvailable(array $filters = []): array
    {
        $query = Ambulance::query()
            ->with(['facility', 'crew'])
            ->where('status', 'available');

        if (isset($filters['facility_id'])) {
            $query->where('facility_id', $filters['facility_id']);
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        return $query->get()->toArray();
    }

    /**
     * Find nearby ambulances within specified radius
     *
     * @param float $lat
     * @param float $lng 
     * @param float $radius (in kilometers)
     * @return array
     */
    public function findNearby(float $lat, float $lng, float $radius = 20): array
    {
        return Ambulance::query()
            ->with(['facility'])
            ->where('status', 'available')
            ->whereNotNull('current_location')
            ->get()
            ->filter(function ($ambulance) use ($lat, $lng, $radius) {
                $location = $ambulance->current_location;
                if (!isset($location['lat']) || !isset($location['lng'])) {
                    return false;
                }
                
                // Calculate distance using Haversine formula
                $distance = $this->calculateDistance(
                    $lat, 
                    $lng, 
                    $location['lat'], 
                    $location['lng']
                );
                
                return $distance <= $radius;
            })
            ->map(function ($ambulance) use ($lat, $lng) {
                $location = $ambulance->current_location;
                $distance = $this->calculateDistance(
                    $lat, 
                    $lng, 
                    $location['lat'], 
                    $location['lng']
                );
                
                return array_merge($ambulance->toArray(), ['distance_km' => round($distance, 2)]);
            })
            ->sortBy('distance_km')
            ->values()
            ->toArray();
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     *
     * @param float $lat1
     * @param float $lng1
     * @param float $lat2
     * @param float $lng2
     * @return float Distance in kilometers
     */
    private function calculateDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371; // Earth's radius in kilometers

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}