<?php

namespace App\Services;

use App\Models\Ambulance;
use App\Models\AmbulanceDispatch;
use App\Events\AmbulanceLocationUpdated;
use App\Events\GeofenceAlert;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class GpsTrackingService
{
    private const GOOGLE_MAPS_API_URL = 'https://maps.googleapis.com/maps/api';
    private const MAPBOX_API_URL = 'https://api.mapbox.com';
    private const GEOFENCE_RADIUS = 100; // meters
    private const LOCATION_UPDATE_INTERVAL = 30; // seconds
    
    /**
     * Update ambulance location with GPS coordinates
     */
    public function updateLocation(Ambulance $ambulance, float $lat, float $lng, array $metadata = []): bool
    {
        try {
            $previousLocation = $ambulance->current_location;
            
            $locationData = [
                'lat' => $lat,
                'lng' => $lng,
                'accuracy' => $metadata['accuracy'] ?? null,
                'speed' => $metadata['speed'] ?? null,
                'heading' => $metadata['heading'] ?? null,
                'altitude' => $metadata['altitude'] ?? null,
                'timestamp' => now()->toISOString(),
                'source' => $metadata['source'] ?? 'manual',
            ];
            
            // Update ambulance current location
            $ambulance->update(['current_location' => $locationData]);
            
            // Store location history
            $this->storeLocationHistory($ambulance, $locationData);
            
            // Check geofences for active dispatches
            $this->checkGeofences($ambulance, $lat, $lng);
            
            // Calculate and update ETA for active dispatches
            $this->updateDispatchETAs($ambulance);
            
            // Broadcast location update
            broadcast(new AmbulanceLocationUpdated($ambulance, $locationData));
            
            // Update route progress if ambulance is on active dispatch
            $this->updateRouteProgress($ambulance, $lat, $lng);
            
            Log::info("Location updated for ambulance {$ambulance->id}", [
                'ambulance_id' => $ambulance->id,
                'location' => $locationData,
                'previous_location' => $previousLocation
            ]);
            
            return true;
            
        } catch (\Exception $e) {
            Log::error("Failed to update ambulance location", [
                'ambulance_id' => $ambulance->id,
                'error' => $e->getMessage(),
                'lat' => $lat,
                'lng' => $lng
            ]);
            
            return false;
        }
    }
    
    /**
     * Store location history for tracking and analytics
     */
    private function storeLocationHistory(Ambulance $ambulance, array $locationData): void
    {
        \DB::table('ambulance_location_history')->insert([
            'ambulance_id' => $ambulance->id,
            'latitude' => $locationData['lat'],
            'longitude' => $locationData['lng'],
            'accuracy' => $locationData['accuracy'],
            'speed' => $locationData['speed'],
            'heading' => $locationData['heading'],
            'altitude' => $locationData['altitude'],
            'source' => $locationData['source'],
            'recorded_at' => $locationData['timestamp'],
            'created_at' => now(),
        ]);
    }
    
    /**
     * Check if ambulance has entered/exited geofences
     */
    private function checkGeofences(Ambulance $ambulance, float $lat, float $lng): void
    {
        $activeDispatch = $ambulance->currentDispatch;
        if (!$activeDispatch) {
            return;
        }
        
        // Check pickup location geofence
        if ($activeDispatch->pickup_location && $activeDispatch->status === 'en_route_pickup') {
            $pickupLat = $activeDispatch->pickup_location['lat'];
            $pickupLng = $activeDispatch->pickup_location['lng'];
            
            if ($this->isWithinGeofence($lat, $lng, $pickupLat, $pickupLng, self::GEOFENCE_RADIUS)) {
                $this->handleGeofenceEntry($activeDispatch, 'pickup');
            }
        }
        
        // Check destination geofence
        if ($activeDispatch->destination_location && $activeDispatch->status === 'en_route_destination') {
            $destLat = $activeDispatch->destination_location['lat'];
            $destLng = $activeDispatch->destination_location['lng'];
            
            if ($this->isWithinGeofence($lat, $lng, $destLat, $destLng, self::GEOFENCE_RADIUS)) {
                $this->handleGeofenceEntry($activeDispatch, 'destination');
            }
        }
    }
    
    /**
     * Check if coordinates are within geofence radius
     */
    private function isWithinGeofence(float $lat1, float $lng1, float $lat2, float $lng2, float $radiusMeters): bool
    {
        $distance = $this->calculateDistance($lat1, $lng1, $lat2, $lng2) * 1000; // Convert to meters
        return $distance <= $radiusMeters;
    }
    
    /**
     * Handle geofence entry events
     */
    private function handleGeofenceEntry(AmbulanceDispatch $dispatch, string $type): void
    {
        $now = now();
        
        if ($type === 'pickup' && !$dispatch->arrived_pickup_at) {
            $dispatch->update([
                'status' => 'at_pickup',
                'arrived_pickup_at' => $now,
            ]);
            
            broadcast(new GeofenceAlert($dispatch, 'pickup_arrival'));
            
        } elseif ($type === 'destination' && !$dispatch->arrived_destination_at) {
            $dispatch->update([
                'status' => 'arrived',
                'arrived_destination_at' => $now,
            ]);
            
            broadcast(new GeofenceAlert($dispatch, 'destination_arrival'));
        }
    }
    
    /**
     * Update ETA calculations for active dispatches
     */
    private function updateDispatchETAs(Ambulance $ambulance): void
    {
        $activeDispatch = $ambulance->currentDispatch;
        if (!$activeDispatch || !$ambulance->current_location) {
            return;
        }
        
        $currentLat = $ambulance->current_location['lat'];
        $currentLng = $ambulance->current_location['lng'];
        
        // Update ETA to pickup if en route to pickup
        if ($activeDispatch->status === 'en_route_pickup' && $activeDispatch->pickup_location) {
            $eta = $this->calculateETA(
                $currentLat, 
                $currentLng, 
                $activeDispatch->pickup_location['lat'], 
                $activeDispatch->pickup_location['lng']
            );
            
            $activeDispatch->update(['eta_pickup' => $eta]);
        }
        
        // Update ETA to destination if en route to destination
        if ($activeDispatch->status === 'en_route_destination' && $activeDispatch->destination_location) {
            $eta = $this->calculateETA(
                $currentLat, 
                $currentLng, 
                $activeDispatch->destination_location['lat'], 
                $activeDispatch->destination_location['lng']
            );
            
            $activeDispatch->update(['eta_destination' => $eta]);
        }
    }
    
    /**
     * Calculate ETA using traffic data
     */
    public function calculateETA(float $fromLat, float $fromLng, float $toLat, float $toLng): ?Carbon
    {
        try {
            $cacheKey = "eta_{$fromLat}_{$fromLng}_{$toLat}_{$toLng}";
            
            return Cache::remember($cacheKey, 300, function () use ($fromLat, $fromLng, $toLat, $toLng) {
                $response = Http::get(self::GOOGLE_MAPS_API_URL . '/directions/json', [
                    'origin' => "{$fromLat},{$fromLng}",
                    'destination' => "{$toLat},{$toLng}",
                    'departure_time' => 'now',
                    'traffic_model' => 'best_guess',
                    'key' => config('services.google_maps.api_key'),
                ]);
                
                if ($response->successful()) {
                    $data = $response->json();
                    if (!empty($data['routes'][0]['legs'][0]['duration_in_traffic']['value'])) {
                        $durationSeconds = $data['routes'][0]['legs'][0]['duration_in_traffic']['value'];
                        return now()->addSeconds($durationSeconds);
                    }
                }
                
                // Fallback to simple distance-based calculation
                $distance = $this->calculateDistance($fromLat, $fromLng, $toLat, $toLng);
                $averageSpeed = 50; // km/h average speed for ambulances
                $durationHours = $distance / $averageSpeed;
                
                return now()->addHours($durationHours);
            });
            
        } catch (\Exception $e) {
            Log::error("Failed to calculate ETA", [
                'error' => $e->getMessage(),
                'from' => "{$fromLat},{$fromLng}",
                'to' => "{$toLat},{$toLng}"
            ]);
            
            return null;
        }
    }
    
    /**
     * Update route progress for active dispatch
     */
    private function updateRouteProgress(Ambulance $ambulance, float $lat, float $lng): void
    {
        $activeDispatch = $ambulance->currentDispatch;
        if (!$activeDispatch) {
            return;
        }
        
        // Calculate total distance and progress
        $totalDistance = 0;
        $completedDistance = 0;
        
        if ($activeDispatch->pickup_location && $activeDispatch->destination_location) {
            $totalDistance = $this->calculateDistance(
                $activeDispatch->pickup_location['lat'],
                $activeDispatch->pickup_location['lng'],
                $activeDispatch->destination_location['lat'],
                $activeDispatch->destination_location['lng']
            );
            
            if ($activeDispatch->status === 'en_route_destination') {
                $completedDistance = $this->calculateDistance(
                    $activeDispatch->pickup_location['lat'],
                    $activeDispatch->pickup_location['lng'],
                    $lat,
                    $lng
                );
            }
        }
        
        $progress = $totalDistance > 0 ? min(100, ($completedDistance / $totalDistance) * 100) : 0;
        
        // Store route progress
        Cache::put("route_progress_{$activeDispatch->id}", [
            'total_distance_km' => round($totalDistance, 2),
            'completed_distance_km' => round($completedDistance, 2),
            'progress_percentage' => round($progress, 1),
            'updated_at' => now()->toISOString(),
        ], 3600);
    }
    
    /**
     * Calculate distance between two points using Haversine formula
     */
    private function calculateDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371; // Earth's radius in kilometers
        
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        
        $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng/2) * sin($dLng/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        
        return $earthRadius * $c;
    }
    
    /**
     * Get real-time traffic data for route
     */
    public function getTrafficData(float $fromLat, float $fromLng, float $toLat, float $toLng): array
    {
        try {
            $response = Http::get(self::GOOGLE_MAPS_API_URL . '/directions/json', [
                'origin' => "{$fromLat},{$fromLng}",
                'destination' => "{$toLat},{$toLng}",
                'departure_time' => 'now',
                'traffic_model' => 'best_guess',
                'alternatives' => true,
                'key' => config('services.google_maps.api_key'),
            ]);
            
            if ($response->successful()) {
                return $response->json();
            }
            
        } catch (\Exception $e) {
            Log::error("Failed to get traffic data", [
                'error' => $e->getMessage(),
                'from' => "{$fromLat},{$fromLng}",
                'to' => "{$toLat},{$toLng}"
            ]);
        }
        
        return [];
    }
    
    /**
     * Get ambulance location history
     */
    public function getLocationHistory(Ambulance $ambulance, Carbon $from = null, Carbon $to = null): array
    {
        $query = \DB::table('ambulance_location_history')
            ->where('ambulance_id', $ambulance->id)
            ->orderBy('recorded_at');
            
        if ($from) {
            $query->where('recorded_at', '>=', $from);
        }
        
        if ($to) {
            $query->where('recorded_at', '<=', $to);
        }
        
        return $query->get()->toArray();
    }
}
