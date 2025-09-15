<?php

namespace App\Services;

use App\Models\Referral;
use App\Models\Ambulance;
use App\Models\Patient;
use App\Models\Equipment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class MachineLearningService
{
    /**
     * Predict patient transfer risk using multiple factors
     */
    public function predictTransferRisk(array $patientData): array
    {
        $riskFactors = [
            'age' => $this->calculateAgeRiskScore($patientData['age'] ?? 0),
            'vital_signs' => $this->calculateVitalSignsRiskScore($patientData['vital_signs'] ?? []),
            'medical_history' => $this->calculateMedicalHistoryRiskScore($patientData['medical_history'] ?? []),
            'current_condition' => $this->calculateConditionRiskScore($patientData['condition'] ?? ''),
            'transport_distance' => $this->calculateDistanceRiskScore($patientData['distance_km'] ?? 0),
            'weather_conditions' => $this->calculateWeatherRiskScore($patientData['weather'] ?? []),
            'time_of_day' => $this->calculateTimeRiskScore($patientData['time'] ?? now()),
        ];

        $totalRiskScore = array_sum($riskFactors);
        $normalizedScore = min(100, max(0, $totalRiskScore));

        return [
            'risk_score' => round($normalizedScore, 1),
            'risk_level' => $this->categorizeRiskLevel($normalizedScore),
            'risk_factors' => $riskFactors,
            'recommendations' => $this->generateRiskRecommendations($normalizedScore, $riskFactors),
            'confidence' => $this->calculatePredictionConfidence($riskFactors),
            'similar_cases' => $this->findSimilarCases($patientData),
        ];
    }

    /**
     * Predict ambulance maintenance needs
     */
    public function predictMaintenanceNeeds(Ambulance $ambulance): array
    {
        $maintenanceHistory = $this->getMaintenanceHistory($ambulance);
        $usageMetrics = $this->getUsageMetrics($ambulance);
        $performanceData = $this->getPerformanceData($ambulance);

        $predictions = [
            'engine' => $this->predictEngineMaintenanceNeeds($ambulance, $usageMetrics, $maintenanceHistory),
            'transmission' => $this->predictTransmissionNeeds($ambulance, $usageMetrics),
            'brakes' => $this->predictBrakeMaintenanceNeeds($ambulance, $usageMetrics),
            'tires' => $this->predictTireReplacementNeeds($ambulance, $usageMetrics),
            'medical_equipment' => $this->predictMedicalEquipmentNeeds($ambulance),
            'electrical_system' => $this->predictElectricalSystemNeeds($ambulance, $performanceData),
        ];

        $overallRisk = $this->calculateOverallMaintenanceRisk($predictions);

        return [
            'overall_risk_score' => $overallRisk['score'],
            'overall_risk_level' => $overallRisk['level'],
            'predicted_failures' => $predictions,
            'recommended_actions' => $this->generateMaintenanceRecommendations($predictions),
            'cost_estimates' => $this->estimateMaintenanceCosts($predictions),
            'optimal_schedule' => $this->generateOptimalMaintenanceSchedule($predictions),
        ];
    }

    /**
     * Predict demand patterns using historical data and external factors
     */
    public function predictDemandPatterns(array $parameters = []): array
    {
        $facilityId = $parameters['facility_id'] ?? null;
        $forecastDays = $parameters['forecast_days'] ?? 30;
        $includeExternalFactors = $parameters['include_external_factors'] ?? true;

        // Get historical data
        $historicalData = $this->getHistoricalDemandData($facilityId, 365);
        
        // Extract features
        $features = $this->extractDemandFeatures($historicalData);
        
        // Apply time series analysis
        $timeSeriesModel = $this->buildTimeSeriesModel($features);
        
        // Include external factors if requested
        if ($includeExternalFactors) {
            $externalFactors = $this->getExternalFactors();
            $timeSeriesModel = $this->adjustForExternalFactors($timeSeriesModel, $externalFactors);
        }

        // Generate predictions
        $predictions = $this->generateDemandPredictions($timeSeriesModel, $forecastDays);

        return [
            'predictions' => $predictions,
            'model_accuracy' => $timeSeriesModel['accuracy'],
            'confidence_intervals' => $this->calculateConfidenceIntervals($predictions),
            'seasonal_patterns' => $timeSeriesModel['seasonal_patterns'],
            'trend_analysis' => $timeSeriesModel['trend'],
            'external_factors_impact' => $includeExternalFactors ? $externalFactors : null,
        ];
    }

    /**
     * Optimize resource allocation using predictive models
     */
    public function optimizeResourceAllocation(array $constraints = []): array
    {
        $currentResources = $this->getCurrentResourceState();
        $demandForecast = $this->predictDemandPatterns(['forecast_days' => 7]);
        $constraints = array_merge($this->getDefaultConstraints(), $constraints);

        // Apply optimization algorithm (simplified linear programming approach)
        $optimization = $this->solveResourceOptimization($currentResources, $demandForecast, $constraints);

        return [
            'optimal_allocation' => $optimization['allocation'],
            'expected_performance' => $optimization['performance'],
            'cost_savings' => $optimization['cost_savings'],
            'implementation_plan' => $optimization['implementation_plan'],
            'sensitivity_analysis' => $this->performSensitivityAnalysis($optimization),
            'alternative_scenarios' => $this->generateAlternativeScenarios($optimization),
        ];
    }

    /**
     * Detect anomalies in system performance
     */
    public function detectAnomalies(array $metrics, array $parameters = []): array
    {
        $threshold = $parameters['threshold'] ?? 2.0; // Standard deviations
        $windowSize = $parameters['window_size'] ?? 30; // Days
        
        $anomalies = [];
        
        foreach ($metrics as $metricName => $data) {
            $anomaly = $this->detectMetricAnomalies($metricName, $data, $threshold, $windowSize);
            if ($anomaly['is_anomaly']) {
                $anomalies[] = $anomaly;
            }
        }

        return [
            'anomalies_detected' => count($anomalies),
            'anomalies' => $anomalies,
            'overall_anomaly_score' => $this->calculateOverallAnomalyScore($anomalies),
            'recommendations' => $this->generateAnomalyRecommendations($anomalies),
        ];
    }

    /**
     * Calculate age-based risk score
     */
    private function calculateAgeRiskScore(int $age): float
    {
        if ($age < 1) return 15; // Infants
        if ($age < 5) return 10; // Young children
        if ($age < 18) return 5; // Children/adolescents
        if ($age < 65) return 0; // Adults
        if ($age < 80) return 10; // Elderly
        return 20; // Very elderly
    }

    /**
     * Calculate vital signs risk score
     */
    private function calculateVitalSignsRiskScore(array $vitalSigns): float
    {
        $riskScore = 0;
        
        // Blood pressure
        $systolic = $vitalSigns['systolic_bp'] ?? 120;
        $diastolic = $vitalSigns['diastolic_bp'] ?? 80;
        
        if ($systolic > 180 || $systolic < 90 || $diastolic > 110 || $diastolic < 60) {
            $riskScore += 15;
        } elseif ($systolic > 160 || $systolic < 100 || $diastolic > 100 || $diastolic < 70) {
            $riskScore += 10;
        }

        // Heart rate
        $heartRate = $vitalSigns['heart_rate'] ?? 70;
        if ($heartRate > 120 || $heartRate < 50) {
            $riskScore += 10;
        } elseif ($heartRate > 100 || $heartRate < 60) {
            $riskScore += 5;
        }

        // Oxygen saturation
        $oxygenSat = $vitalSigns['oxygen_saturation'] ?? 98;
        if ($oxygenSat < 90) {
            $riskScore += 20;
        } elseif ($oxygenSat < 95) {
            $riskScore += 10;
        }

        // Temperature
        $temperature = $vitalSigns['temperature'] ?? 37.0;
        if ($temperature > 39.0 || $temperature < 35.0) {
            $riskScore += 10;
        } elseif ($temperature > 38.5 || $temperature < 36.0) {
            $riskScore += 5;
        }

        return $riskScore;
    }

    /**
     * Calculate medical history risk score
     */
    private function calculateMedicalHistoryRiskScore(array $medicalHistory): float
    {
        $riskScore = 0;
        $highRiskConditions = [
            'heart_disease' => 15,
            'diabetes' => 10,
            'respiratory_disease' => 12,
            'kidney_disease' => 10,
            'cancer' => 15,
            'stroke_history' => 12,
            'seizure_disorder' => 8,
        ];

        foreach ($medicalHistory as $condition) {
            if (isset($highRiskConditions[$condition])) {
                $riskScore += $highRiskConditions[$condition];
            }
        }

        return min($riskScore, 30); // Cap at 30 points
    }

    /**
     * Predict engine maintenance needs
     */
    private function predictEngineMaintenanceNeeds(Ambulance $ambulance, array $usageMetrics, array $maintenanceHistory): array
    {
        $mileage = $usageMetrics['total_mileage'] ?? 0;
        $hoursOfOperation = $usageMetrics['hours_of_operation'] ?? 0;
        $lastMaintenance = $this->getLastMaintenanceDate($maintenanceHistory, 'engine');
        
        $daysSinceLastMaintenance = $lastMaintenance ? now()->diffInDays($lastMaintenance) : 365;
        
        // Calculate risk based on multiple factors
        $mileageRisk = min(100, ($mileage % 10000) / 100); // Risk increases as approaching 10k mile intervals
        $timeRisk = min(100, $daysSinceLastMaintenance / 3.65); // Risk increases after 100 days
        $usageRisk = min(100, $hoursOfOperation / 20); // Risk based on daily usage hours
        
        $overallRisk = ($mileageRisk + $timeRisk + $usageRisk) / 3;
        
        return [
            'risk_score' => round($overallRisk, 1),
            'predicted_failure_date' => $this->predictFailureDate($overallRisk),
            'recommended_action' => $this->getMaintenanceRecommendation($overallRisk),
            'factors' => [
                'mileage_risk' => $mileageRisk,
                'time_risk' => $timeRisk,
                'usage_risk' => $usageRisk,
            ],
        ];
    }

    /**
     * Build time series model for demand prediction
     */
    private function buildTimeSeriesModel(array $features): array
    {
        // Extract trend component
        $trend = $this->extractTrend($features);
        
        // Extract seasonal component
        $seasonal = $this->extractSeasonalComponent($features);
        
        // Calculate residuals
        $residuals = $this->calculateResiduals($features, $trend, $seasonal);
        
        // Calculate model accuracy
        $accuracy = $this->calculateModelAccuracy($features, $trend, $seasonal);
        
        return [
            'trend' => $trend,
            'seasonal_patterns' => $seasonal,
            'residuals' => $residuals,
            'accuracy' => $accuracy,
        ];
    }

    /**
     * Extract trend component using moving averages
     */
    private function extractTrend(array $data): array
    {
        $windowSize = 7; // 7-day moving average
        $trend = [];
        
        for ($i = $windowSize - 1; $i < count($data); $i++) {
            $window = array_slice($data, $i - $windowSize + 1, $windowSize);
            $average = array_sum(array_column($window, 'value')) / $windowSize;
            $trend[] = [
                'date' => $data[$i]['date'],
                'value' => $average,
            ];
        }
        
        return $trend;
    }

    /**
     * Extract seasonal patterns
     */
    private function extractSeasonalComponent(array $data): array
    {
        $seasonalPatterns = [];
        
        // Group by day of week
        for ($day = 0; $day < 7; $day++) {
            $dayData = array_filter($data, function ($item) use ($day) {
                return Carbon::parse($item['date'])->dayOfWeek === $day;
            });
            
            if (!empty($dayData)) {
                $average = array_sum(array_column($dayData, 'value')) / count($dayData);
                $seasonalPatterns['day_of_week'][$day] = $average;
            }
        }
        
        // Group by month
        for ($month = 1; $month <= 12; $month++) {
            $monthData = array_filter($data, function ($item) use ($month) {
                return Carbon::parse($item['date'])->month === $month;
            });
            
            if (!empty($monthData)) {
                $average = array_sum(array_column($monthData, 'value')) / count($monthData);
                $seasonalPatterns['month'][$month] = $average;
            }
        }
        
        return $seasonalPatterns;
    }

    /**
     * Generate maintenance recommendations based on risk scores
     */
    private function generateMaintenanceRecommendations(array $predictions): array
    {
        $recommendations = [];
        
        foreach ($predictions as $component => $prediction) {
            if ($prediction['risk_score'] > 80) {
                $recommendations[] = [
                    'component' => $component,
                    'priority' => 'critical',
                    'action' => 'immediate_maintenance',
                    'timeframe' => 'within_24_hours',
                    'estimated_cost' => $this->getMaintenanceCost($component, 'critical'),
                ];
            } elseif ($prediction['risk_score'] > 60) {
                $recommendations[] = [
                    'component' => $component,
                    'priority' => 'high',
                    'action' => 'schedule_maintenance',
                    'timeframe' => 'within_week',
                    'estimated_cost' => $this->getMaintenanceCost($component, 'high'),
                ];
            } elseif ($prediction['risk_score'] > 40) {
                $recommendations[] = [
                    'component' => $component,
                    'priority' => 'medium',
                    'action' => 'monitor_closely',
                    'timeframe' => 'within_month',
                    'estimated_cost' => $this->getMaintenanceCost($component, 'medium'),
                ];
            }
        }
        
        return $recommendations;
    }

    /**
     * Calculate prediction confidence based on data quality and model performance
     */
    private function calculatePredictionConfidence(array $factors): float
    {
        $dataQualityScore = $this->assessDataQuality($factors);
        $modelPerformanceScore = 0.85; // Simulated model performance
        $sampleSizeScore = min(1.0, count($factors) / 10); // More factors = higher confidence
        
        $confidence = ($dataQualityScore + $modelPerformanceScore + $sampleSizeScore) / 3;
        
        return round($confidence * 100, 1);
    }

    /**
     * Assess data quality for confidence calculation
     */
    private function assessDataQuality(array $factors): float
    {
        $completeness = count(array_filter($factors, fn($value) => $value !== null && $value !== '')) / count($factors);
        $consistency = 1.0; // Simplified - would check for data consistency in real implementation
        $accuracy = 0.9; // Simplified - would validate against known accurate sources
        
        return ($completeness + $consistency + $accuracy) / 3;
    }
}
