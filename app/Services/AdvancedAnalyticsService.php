<?php

namespace App\Services;

use App\Models\Referral;
use App\Models\Ambulance;
use App\Models\AmbulanceDispatch;
use App\Models\Patient;
use App\Models\Facility;
use App\Models\Equipment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AdvancedAnalyticsService
{
    /**
     * Generate comprehensive analytics dashboard data
     */
    public function getDashboardAnalytics(array $filters = []): array
    {
        $startDate = $filters['start_date'] ?? now()->subDays(30);
        $endDate = $filters['end_date'] ?? now();
        $facilityId = $filters['facility_id'] ?? null;

        return [
            'overview' => $this->getOverviewMetrics($startDate, $endDate, $facilityId),
            'referral_analytics' => $this->getReferralAnalytics($startDate, $endDate, $facilityId),
            'ambulance_analytics' => $this->getAmbulanceAnalytics($startDate, $endDate, $facilityId),
            'patient_analytics' => $this->getPatientAnalytics($startDate, $endDate, $facilityId),
            'facility_analytics' => $this->getFacilityAnalytics($startDate, $endDate, $facilityId),
            'predictive_insights' => $this->getPredictiveInsights($startDate, $endDate, $facilityId),
            'performance_metrics' => $this->getPerformanceMetrics($startDate, $endDate, $facilityId),
            'quality_indicators' => $this->getQualityIndicators($startDate, $endDate, $facilityId),
        ];
    }

    /**
     * Get overview metrics
     */
    private function getOverviewMetrics($startDate, $endDate, $facilityId): array
    {
        $referralQuery = Referral::whereBetween('created_at', [$startDate, $endDate]);
        $ambulanceQuery = AmbulanceDispatch::whereBetween('created_at', [$startDate, $endDate]);

        if ($facilityId) {
            $referralQuery->where(function ($q) use ($facilityId) {
                $q->where('referring_facility_id', $facilityId)
                  ->orWhere('receiving_facility_id', $facilityId);
            });
        }

        return [
            'total_referrals' => $referralQuery->count(),
            'completed_referrals' => $referralQuery->where('status', 'completed')->count(),
            'pending_referrals' => $referralQuery->where('status', 'pending')->count(),
            'urgent_referrals' => $referralQuery->where('urgency', 'emergency')->count(),
            'total_dispatches' => $ambulanceQuery->count(),
            'active_ambulances' => Ambulance::where('status', 'available')->count(),
            'average_response_time' => $this->calculateAverageResponseTime($startDate, $endDate, $facilityId),
            'bed_utilization_rate' => $this->calculateBedUtilizationRate($facilityId),
            'patient_satisfaction_score' => $this->calculatePatientSatisfactionScore($startDate, $endDate, $facilityId),
            'cost_per_referral' => $this->calculateCostPerReferral($startDate, $endDate, $facilityId),
        ];
    }

    /**
     * Get detailed referral analytics
     */
    private function getReferralAnalytics($startDate, $endDate, $facilityId): array
    {
        $query = Referral::whereBetween('created_at', [$startDate, $endDate]);
        
        if ($facilityId) {
            $query->where(function ($q) use ($facilityId) {
                $q->where('referring_facility_id', $facilityId)
                  ->orWhere('receiving_facility_id', $facilityId);
            });
        }

        return [
            'trends' => $this->getReferralTrends($query, $startDate, $endDate),
            'by_specialty' => $this->getReferralsBySpecialty($query),
            'by_urgency' => $this->getReferralsByUrgency($query),
            'by_facility' => $this->getReferralsByFacility($query),
            'acceptance_rates' => $this->getAcceptanceRates($query),
            'rejection_reasons' => $this->getRejectionReasons($query),
            'completion_times' => $this->getCompletionTimes($query),
            'peak_hours' => $this->getPeakHours($query),
            'seasonal_patterns' => $this->getSeasonalPatterns($query),
            'conversion_funnel' => $this->getConversionFunnel($query),
        ];
    }

    /**
     * Get ambulance analytics
     */
    private function getAmbulanceAnalytics($startDate, $endDate, $facilityId): array
    {
        $query = AmbulanceDispatch::whereBetween('created_at', [$startDate, $endDate]);
        
        if ($facilityId) {
            $query->whereHas('ambulance', function ($q) use ($facilityId) {
                $q->where('facility_id', $facilityId);
            });
        }

        return [
            'utilization_rates' => $this->getAmbulanceUtilizationRates($query),
            'response_times' => $this->getAmbulanceResponseTimes($query),
            'fuel_efficiency' => $this->getFuelEfficiencyMetrics($query),
            'maintenance_analytics' => $this->getMaintenanceAnalytics($startDate, $endDate, $facilityId),
            'route_optimization' => $this->getRouteOptimizationMetrics($query),
            'crew_performance' => $this->getCrewPerformanceMetrics($query),
            'cost_analysis' => $this->getAmbulanceCostAnalysis($query),
            'predictive_maintenance' => $this->getPredictiveMaintenanceInsights($facilityId),
        ];
    }

    /**
     * Get predictive insights using machine learning-like algorithms
     */
    public function getPredictiveInsights($startDate, $endDate, $facilityId): array
    {
        return [
            'demand_forecast' => $this->forecastDemand($startDate, $endDate, $facilityId),
            'capacity_planning' => $this->getCapacityPlanningInsights($facilityId),
            'risk_assessment' => $this->getRiskAssessment($startDate, $endDate, $facilityId),
            'resource_optimization' => $this->getResourceOptimizationRecommendations($facilityId),
            'anomaly_detection' => $this->detectAnomalies($startDate, $endDate, $facilityId),
            'trend_analysis' => $this->getTrendAnalysis($startDate, $endDate, $facilityId),
        ];
    }

    /**
     * Forecast demand using historical patterns
     */
    private function forecastDemand($startDate, $endDate, $facilityId): array
    {
        // Get historical data for the past 6 months
        $historicalData = $this->getHistoricalDemandData($facilityId, 180);
        
        // Simple linear regression for trend analysis
        $forecast = $this->calculateLinearTrend($historicalData);
        
        // Seasonal adjustments
        $seasonalFactors = $this->calculateSeasonalFactors($historicalData);
        
        // Generate 30-day forecast
        $forecastPeriod = 30;
        $predictions = [];
        
        for ($i = 1; $i <= $forecastPeriod; $i++) {
            $date = now()->addDays($i);
            $dayOfWeek = $date->dayOfWeek;
            $dayOfYear = $date->dayOfYear;
            
            // Base trend prediction
            $basePrediction = $forecast['slope'] * $i + $forecast['intercept'];
            
            // Apply seasonal factors
            $seasonalAdjustment = $seasonalFactors[$dayOfWeek] ?? 1.0;
            
            // Apply confidence intervals
            $prediction = max(0, $basePrediction * $seasonalAdjustment);
            $confidence = $this->calculateConfidenceInterval($prediction, $forecast['r_squared']);
            
            $predictions[] = [
                'date' => $date->toDateString(),
                'predicted_referrals' => round($prediction),
                'confidence_lower' => round($confidence['lower']),
                'confidence_upper' => round($confidence['upper']),
                'confidence_level' => round($forecast['r_squared'] * 100, 1),
            ];
        }
        
        return [
            'predictions' => $predictions,
            'model_accuracy' => round($forecast['r_squared'] * 100, 1),
            'trend_direction' => $forecast['slope'] > 0 ? 'increasing' : 'decreasing',
            'seasonal_patterns' => $seasonalFactors,
        ];
    }

    /**
     * Get capacity planning insights
     */
    private function getCapacityPlanningInsights($facilityId): array
    {
        $currentCapacity = $this->getCurrentCapacityMetrics($facilityId);
        $demandForecast = $this->forecastDemand(now()->subDays(30), now(), $facilityId);
        
        return [
            'current_utilization' => $currentCapacity,
            'projected_demand' => $demandForecast,
            'capacity_gaps' => $this->identifyCapacityGaps($currentCapacity, $demandForecast),
            'recommendations' => $this->generateCapacityRecommendations($currentCapacity, $demandForecast),
            'optimal_staffing' => $this->calculateOptimalStaffing($facilityId),
            'equipment_needs' => $this->predictEquipmentNeeds($facilityId),
        ];
    }

    /**
     * Detect anomalies in system performance
     */
    private function detectAnomalies($startDate, $endDate, $facilityId): array
    {
        $metrics = [
            'referral_volume' => $this->detectReferralVolumeAnomalies($startDate, $endDate, $facilityId),
            'response_times' => $this->detectResponseTimeAnomalies($startDate, $endDate, $facilityId),
            'rejection_rates' => $this->detectRejectionRateAnomalies($startDate, $endDate, $facilityId),
            'ambulance_utilization' => $this->detectAmbulanceUtilizationAnomalies($startDate, $endDate, $facilityId),
        ];

        $anomalies = [];
        foreach ($metrics as $type => $data) {
            if (!empty($data['anomalies'])) {
                $anomalies[] = [
                    'type' => $type,
                    'severity' => $data['severity'],
                    'description' => $data['description'],
                    'detected_at' => $data['detected_at'],
                    'recommendations' => $data['recommendations'],
                ];
            }
        }

        return [
            'anomalies' => $anomalies,
            'anomaly_score' => $this->calculateAnomalyScore($anomalies),
            'alert_level' => $this->determineAlertLevel($anomalies),
        ];
    }

    /**
     * Calculate average response time
     */
    private function calculateAverageResponseTime($startDate, $endDate, $facilityId): float
    {
        $query = Referral::whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('accepted_at');

        if ($facilityId) {
            $query->where('receiving_facility_id', $facilityId);
        }

        $avgTime = $query->selectRaw('AVG(TIMESTAMPDIFF(MINUTE, created_at, accepted_at)) as avg_time')
            ->first()
            ->avg_time ?? 0;

        return round($avgTime, 2);
    }

    /**
     * Calculate bed utilization rate
     */
    private function calculateBedUtilizationRate($facilityId): float
    {
        $query = DB::table('beds');
        
        if ($facilityId) {
            $query->where('facility_id', $facilityId);
        }

        $totalBeds = $query->count();
        $occupiedBeds = $query->where('status', 'occupied')->count();

        return $totalBeds > 0 ? round(($occupiedBeds / $totalBeds) * 100, 2) : 0;
    }

    /**
     * Get historical demand data for forecasting
     */
    private function getHistoricalDemandData($facilityId, int $days): array
    {
        $startDate = now()->subDays($days);
        $endDate = now();

        $query = Referral::whereBetween('created_at', [$startDate, $endDate]);
        
        if ($facilityId) {
            $query->where('receiving_facility_id', $facilityId);
        }

        return $query->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item, $index) {
                return [
                    'x' => $index,
                    'y' => $item->count,
                    'date' => $item->date,
                ];
            })
            ->toArray();
    }

    /**
     * Calculate linear trend using least squares method
     */
    private function calculateLinearTrend(array $data): array
    {
        $n = count($data);
        if ($n < 2) {
            return ['slope' => 0, 'intercept' => 0, 'r_squared' => 0];
        }

        $sumX = array_sum(array_column($data, 'x'));
        $sumY = array_sum(array_column($data, 'y'));
        $sumXY = array_sum(array_map(fn($item) => $item['x'] * $item['y'], $data));
        $sumX2 = array_sum(array_map(fn($item) => $item['x'] * $item['x'], $data));
        $sumY2 = array_sum(array_map(fn($item) => $item['y'] * $item['y'], $data));

        $slope = ($n * $sumXY - $sumX * $sumY) / ($n * $sumX2 - $sumX * $sumX);
        $intercept = ($sumY - $slope * $sumX) / $n;

        // Calculate R-squared
        $meanY = $sumY / $n;
        $ssTotal = array_sum(array_map(fn($item) => pow($item['y'] - $meanY, 2), $data));
        $ssResidual = array_sum(array_map(fn($item) => pow($item['y'] - ($slope * $item['x'] + $intercept), 2), $data));
        $rSquared = $ssTotal > 0 ? 1 - ($ssResidual / $ssTotal) : 0;

        return [
            'slope' => $slope,
            'intercept' => $intercept,
            'r_squared' => max(0, min(1, $rSquared)),
        ];
    }

    /**
     * Calculate seasonal factors by day of week
     */
    private function calculateSeasonalFactors(array $data): array
    {
        $dayFactors = [];
        $overall_average = array_sum(array_column($data, 'y')) / count($data);

        for ($day = 0; $day < 7; $day++) {
            $dayData = array_filter($data, function ($item) use ($day) {
                return Carbon::parse($item['date'])->dayOfWeek === $day;
            });

            if (!empty($dayData)) {
                $dayAverage = array_sum(array_column($dayData, 'y')) / count($dayData);
                $dayFactors[$day] = $overall_average > 0 ? $dayAverage / $overall_average : 1.0;
            } else {
                $dayFactors[$day] = 1.0;
            }
        }

        return $dayFactors;
    }

    /**
     * Calculate confidence interval for predictions
     */
    private function calculateConfidenceInterval(float $prediction, float $rSquared): array
    {
        $standardError = $prediction * (1 - $rSquared) * 0.5;
        $margin = 1.96 * $standardError; // 95% confidence interval

        return [
            'lower' => max(0, $prediction - $margin),
            'upper' => $prediction + $margin,
        ];
    }

    /**
     * Generate real-time decision support recommendations
     */
    public function getDecisionSupport($context = []): array
    {
        $recommendations = [];

        // Check current system load
        $currentLoad = $this->getCurrentSystemLoad();
        if ($currentLoad['referral_queue'] > 10) {
            $recommendations[] = [
                'type' => 'capacity_alert',
                'priority' => 'high',
                'message' => 'High referral queue detected. Consider activating additional staff.',
                'action' => 'increase_capacity',
                'estimated_impact' => 'Reduce queue by 50% within 2 hours',
            ];
        }

        // Check ambulance availability
        $ambulanceAvailability = $this->getAmbulanceAvailability();
        if ($ambulanceAvailability['available_percentage'] < 20) {
            $recommendations[] = [
                'type' => 'ambulance_alert',
                'priority' => 'critical',
                'message' => 'Low ambulance availability. Consider requesting mutual aid.',
                'action' => 'request_mutual_aid',
                'estimated_impact' => 'Increase availability by 30%',
            ];
        }

        // Predictive maintenance alerts
        $maintenanceAlerts = $this->getPredictiveMaintenanceAlerts();
        foreach ($maintenanceAlerts as $alert) {
            $recommendations[] = [
                'type' => 'maintenance_alert',
                'priority' => $alert['priority'],
                'message' => $alert['message'],
                'action' => 'schedule_maintenance',
                'estimated_impact' => $alert['impact'],
            ];
        }

        return [
            'recommendations' => $recommendations,
            'system_health_score' => $this->calculateSystemHealthScore(),
            'next_review_time' => now()->addMinutes(15)->toISOString(),
        ];
    }
}
