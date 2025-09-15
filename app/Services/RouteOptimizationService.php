<?php

namespace App\Services;

use App\Models\Ambulance;
use App\Models\AmbulanceDispatch;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RouteOptimizationService
{
    private const GOOGLE_MAPS_API_URL = 'https://maps.googleapis.com/maps/api';
    private const MAPBOX_API_URL = 'https://api.mapbox.com';
    
    /**
     * Get optimized route with multiple options
     */
    public function getOptimizedRoute(float $fromLat, float $fromLng, float $toLat, float $toLng, array $options = []): array
    {
        $cacheKey = "route_" . md5("{$fromLat}_{$fromLng}_{$toLat}_{$toLng}_" . serialize($options));
        
        return Cache::remember($cacheKey, 300, function () use ($fromLat, $fromLng, $toLat, $toLng, $options) {
            try {
                $response = Http::get(self::GOOGLE_MAPS_API_URL . '/directions/json', [
                    'origin' => "{$fromLat},{$fromLng}",
                    'destination' => "{$toLat},{$toLng}",
                    'departure_time' => $options['departure_time'] ?? 'now',
                    'traffic_model' => 'best_guess',
                    'alternatives' => true,
                    'avoid' => $options['avoid'] ?? '',
                    'mode' => 'driving',
                    'key' => config('services.google_maps.api_key'),
                ]);
                
                if ($response->successful()) {
                    $data = $response->json();
                    return $this->processRouteData($data);
                }
                
            } catch (\Exception $e) {
                Log::error("Route optimization failed", [
                    'error' => $e->getMessage(),
                    'from' => "{$fromLat},{$fromLng}",
                    'to' => "{$toLat},{$toLng}"
                ]);
            }
            
            return $this->getFallbackRoute($fromLat, $fromLng, $toLat, $toLng);
        });
    }
    
    /**
     * Process route data from mapping service
     */
    private function processRouteData(array $data): array
    {
        $routes = [];
        
        foreach ($data['routes'] as $index => $route) {
            $leg = $route['legs'][0];
            
            $routes[] = [
                'route_index' => $index,
                'summary' => $route['summary'] ?? "Route " . ($index + 1),
                'distance' => [
                    'text' => $leg['distance']['text'],
                    'value' => $leg['distance']['value'], // meters
                    'km' => round($leg['distance']['value'] / 1000, 2)
                ],
                'duration' => [
                    'text' => $leg['duration']['text'],
                    'value' => $leg['duration']['value'], // seconds
                    'minutes' => round($leg['duration']['value'] / 60, 1)
                ],
                'duration_in_traffic' => isset($leg['duration_in_traffic']) ? [
                    'text' => $leg['duration_in_traffic']['text'],
                    'value' => $leg['duration_in_traffic']['value'],
                    'minutes' => round($leg['duration_in_traffic']['value'] / 60, 1)
                ] : null,
                'polyline' => $route['overview_polyline']['points'],
                'steps' => $this->processRouteSteps($leg['steps']),
                'warnings' => $route['warnings'] ?? [],
                'traffic_conditions' => $this->analyzeTrafficConditions($leg),
                'fuel_estimate' => $this->estimateFuelConsumption($leg['distance']['value']),
                'recommended' => $index === 0, // First route is usually the recommended one
            ];
        }
        
        return [
            'status' => 'success',
            'routes' => $routes,
            'timestamp' => now()->toISOString(),
        ];
    }
    
    /**
     * Process individual route steps
     */
    private function processRouteSteps(array $steps): array
    {
        $processedSteps = [];
        
        foreach ($steps as $step) {
            $processedSteps[] = [
                'instruction' => strip_tags($step['html_instructions']),
                'distance' => [
                    'text' => $step['distance']['text'],
                    'value' => $step['distance']['value']
                ],
                'duration' => [
                    'text' => $step['duration']['text'],
                    'value' => $step['duration']['value']
                ],
                'start_location' => $step['start_location'],
                'end_location' => $step['end_location'],
                'maneuver' => $step['maneuver'] ?? null,
                'polyline' => $step['polyline']['points'] ?? null,
            ];
        }
        
        return $processedSteps;
    }
    
    /**
     * Analyze traffic conditions for the route
     */
    private function analyzeTrafficConditions(array $leg): array
    {
        $normalDuration = $leg['duration']['value'];
        $trafficDuration = $leg['duration_in_traffic']['value'] ?? $normalDuration;
        
        $delay = $trafficDuration - $normalDuration;
        $delayPercentage = $normalDuration > 0 ? ($delay / $normalDuration) * 100 : 0;
        
        $condition = 'light';
        if ($delayPercentage > 50) {
            $condition = 'heavy';
        } elseif ($delayPercentage > 25) {
            $condition = 'moderate';
        }
        
        return [
            'condition' => $condition,
            'delay_seconds' => $delay,
            'delay_minutes' => round($delay / 60, 1),
            'delay_percentage' => round($delayPercentage, 1),
            'severity_score' => min(100, round($delayPercentage, 0)),
        ];
    }
    
    /**
     * Estimate fuel consumption for the route
     */
    private function estimateFuelConsumption(int $distanceMeters): array
    {
        $distanceKm = $distanceMeters / 1000;
        $averageFuelEfficiency = 8; // liters per 100km for ambulances
        $fuelLiters = ($distanceKm / 100) * $averageFuelEfficiency;
        $fuelCostPerLiter = 1.50; // Default fuel cost
        
        return [
            'liters' => round($fuelLiters, 2),
            'cost' => round($fuelLiters * $fuelCostPerLiter, 2),
            'efficiency_rating' => $this->getFuelEfficiencyRating($distanceKm, $fuelLiters),
        ];
    }
    
    /**
     * Get fuel efficiency rating
     */
    private function getFuelEfficiencyRating(float $distanceKm, float $fuelLiters): string
    {
        if ($distanceKm == 0) return 'unknown';
        
        $efficiency = ($distanceKm / $fuelLiters) * 100; // km per 100L
        
        if ($efficiency > 15) return 'excellent';
        if ($efficiency > 12) return 'good';
        if ($efficiency > 10) return 'average';
        return 'poor';
    }
    
    /**
     * Get fallback route when API fails
     */
    private function getFallbackRoute(float $fromLat, float $fromLng, float $toLat, float $toLng): array
    {
        $distance = $this->calculateDistance($fromLat, $fromLng, $toLat, $toLng);
        $averageSpeed = 50; // km/h
        $duration = ($distance / $averageSpeed) * 3600; // seconds
        
        return [
            'status' => 'fallback',
            'routes' => [[
                'route_index' => 0,
                'summary' => 'Direct route (estimated)',
                'distance' => [
                    'text' => round($distance, 1) . ' km',
                    'value' => $distance * 1000,
                    'km' => round($distance, 2)
                ],
                'duration' => [
                    'text' => round($duration / 60, 0) . ' mins',
                    'value' => $duration,
                    'minutes' => round($duration / 60, 1)
                ],
                'duration_in_traffic' => null,
                'polyline' => null,
                'steps' => [],
                'warnings' => ['Route calculated using fallback method'],
                'traffic_conditions' => ['condition' => 'unknown'],
                'fuel_estimate' => $this->estimateFuelConsumption($distance * 1000),
                'recommended' => true,
            ]],
            'timestamp' => now()->toISOString(),
        ];
    }
    
    /**
     * Calculate distance between two points
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
     * Get route with waypoints (for multiple stops)
     */
    public function getRouteWithWaypoints(array $waypoints, array $options = []): array
    {
        if (count($waypoints) < 2) {
            throw new \InvalidArgumentException('At least 2 waypoints required');
        }
        
        $origin = array_shift($waypoints);
        $destination = array_pop($waypoints);
        
        $waypointsStr = '';
        if (!empty($waypoints)) {
            $waypointsStr = implode('|', array_map(function($wp) {
                return $wp['lat'] . ',' . $wp['lng'];
            }, $waypoints));
        }
        
        try {
            $response = Http::get(self::GOOGLE_MAPS_API_URL . '/directions/json', [
                'origin' => $origin['lat'] . ',' . $origin['lng'],
                'destination' => $destination['lat'] . ',' . $destination['lng'],
                'waypoints' => $waypointsStr,
                'optimize' => $options['optimize'] ?? true,
                'departure_time' => $options['departure_time'] ?? 'now',
                'traffic_model' => 'best_guess',
                'key' => config('services.google_maps.api_key'),
            ]);
            
            if ($response->successful()) {
                return $this->processRouteData($response->json());
            }
            
        } catch (\Exception $e) {
            Log::error("Multi-waypoint route optimization failed", [
                'error' => $e->getMessage(),
                'waypoints' => $waypoints
            ]);
        }
        
        return ['status' => 'error', 'routes' => []];
    }
    
    /**
     * Find optimal ambulance for dispatch based on location and other factors
     */
    public function findOptimalAmbulance(float $pickupLat, float $pickupLng, array $criteria = []): ?Ambulance
    {
        $availableAmbulances = Ambulance::available()
            ->with(['facility', 'currentDispatch'])
            ->whereNotNull('current_location')
            ->get();
            
        if ($availableAmbulances->isEmpty()) {
            return null;
        }
        
        $scoredAmbulances = [];
        
        foreach ($availableAmbulances as $ambulance) {
            $score = $this->calculateAmbulanceScore($ambulance, $pickupLat, $pickupLng, $criteria);
            $scoredAmbulances[] = [
                'ambulance' => $ambulance,
                'score' => $score,
            ];
        }
        
        // Sort by score (highest first)
        usort($scoredAmbulances, function($a, $b) {
            return $b['score'] <=> $a['score'];
        });
        
        return $scoredAmbulances[0]['ambulance'] ?? null;
    }
    
    /**
     * Calculate ambulance suitability score
     */
    private function calculateAmbulanceScore(Ambulance $ambulance, float $pickupLat, float $pickupLng, array $criteria): float
    {
        $score = 0;
        $location = $ambulance->current_location;
        
        // Distance score (closer is better) - 40% weight
        $distance = $this->calculateDistance(
            $location['lat'], 
            $location['lng'], 
            $pickupLat, 
            $pickupLng
        );
        $distanceScore = max(0, 100 - ($distance * 5)); // Penalty of 5 points per km
        $score += $distanceScore * 0.4;
        
        // Fuel level score - 20% weight
        $fuelScore = $ambulance->fuel_level ?? 50;
        $score += $fuelScore * 0.2;
        
        // Equipment match score - 20% weight
        $equipmentScore = 50; // Default score
        if (isset($criteria['required_equipment'])) {
            $matchCount = 0;
            $totalRequired = count($criteria['required_equipment']);
            foreach ($criteria['required_equipment'] as $equipment) {
                if ($ambulance->hasEquipment($equipment)) {
                    $matchCount++;
                }
            }
            $equipmentScore = $totalRequired > 0 ? ($matchCount / $totalRequired) * 100 : 100;
        }
        $score += $equipmentScore * 0.2;
        
        // Crew availability score - 10% weight
        $crewScore = 100; // Assume crew is available if ambulance is available
        $score += $crewScore * 0.1;
        
        // Maintenance status score - 10% weight
        $maintenanceScore = $ambulance->needsMaintenance ? 50 : 100;
        $score += $maintenanceScore * 0.1;
        
        return round($score, 2);
    }
}
