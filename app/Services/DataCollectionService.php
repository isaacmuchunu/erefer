<?php

namespace App\Services;

use App\Models\AnalyticsMetric;
use App\Models\Referral;
use App\Models\Ambulance;
use App\Models\AmbulanceDispatch;
use App\Models\Patient;
use App\Models\Facility;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DataCollectionService
{
    /**
     * Collect all daily metrics
     */
    public function collectDailyMetrics(Carbon $date = null): void
    {
        $date = $date ?? now();
        
        Log::info("Starting daily metrics collection for {$date->toDateString()}");
        
        try {
            $this->collectReferralMetrics($date);
            $this->collectAmbulanceMetrics($date);
            $this->collectPatientMetrics($date);
            $this->collectFacilityMetrics($date);
            $this->collectPerformanceMetrics($date);
            $this->collectQualityMetrics($date);
            $this->collectCostMetrics($date);
            
            Log::info("Daily metrics collection completed successfully");
        } catch (\Exception $e) {
            Log::error("Daily metrics collection failed: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Collect referral-related metrics
     */
    private function collectReferralMetrics(Carbon $date): void
    {
        $startOfDay = $date->copy()->startOfDay();
        $endOfDay = $date->copy()->endOfDay();

        // Total referrals by facility
        $referralsByFacility = Referral::whereBetween('created_at', [$startOfDay, $endOfDay])
            ->selectRaw('referring_facility_id as facility_id, COUNT(*) as count')
            ->groupBy('referring_facility_id')
            ->get();

        foreach ($referralsByFacility as $data) {
            AnalyticsMetric::recordMetric([
                'date' => $date->toDateString(),
                'type' => 'referral_volume',
                'category' => 'performance',
                'value' => $data->count,
                'unit' => 'count',
                'facility_id' => $data->facility_id,
            ]);
        }

        // Referral acceptance rate
        $acceptanceRates = Referral::whereBetween('created_at', [$startOfDay, $endOfDay])
            ->selectRaw('
                receiving_facility_id as facility_id,
                COUNT(*) as total,
                SUM(CASE WHEN status = "accepted" THEN 1 ELSE 0 END) as accepted
            ')
            ->groupBy('receiving_facility_id')
            ->get();

        foreach ($acceptanceRates as $data) {
            $rate = $data->total > 0 ? ($data->accepted / $data->total) * 100 : 0;
            
            AnalyticsMetric::recordMetric([
                'date' => $date->toDateString(),
                'type' => 'referral_acceptance_rate',
                'category' => 'quality',
                'value' => $rate,
                'unit' => 'percentage',
                'facility_id' => $data->facility_id,
                'metadata' => [
                    'total_referrals' => $data->total,
                    'accepted_referrals' => $data->accepted,
                ],
            ]);
        }

        // Average response time
        $responseTimes = Referral::whereBetween('created_at', [$startOfDay, $endOfDay])
            ->whereNotNull('accepted_at')
            ->selectRaw('
                receiving_facility_id as facility_id,
                AVG(TIMESTAMPDIFF(MINUTE, created_at, accepted_at)) as avg_response_time
            ')
            ->groupBy('receiving_facility_id')
            ->get();

        foreach ($responseTimes as $data) {
            AnalyticsMetric::recordMetric([
                'date' => $date->toDateString(),
                'type' => 'referral_response_time',
                'category' => 'performance',
                'value' => $data->avg_response_time,
                'unit' => 'minutes',
                'facility_id' => $data->facility_id,
            ]);
        }

        // Referrals by urgency
        $urgencyBreakdown = Referral::whereBetween('created_at', [$startOfDay, $endOfDay])
            ->selectRaw('urgency, COUNT(*) as count')
            ->groupBy('urgency')
            ->get();

        foreach ($urgencyBreakdown as $data) {
            AnalyticsMetric::recordMetric([
                'date' => $date->toDateString(),
                'type' => 'referral_by_urgency',
                'category' => 'performance',
                'value' => $data->count,
                'unit' => 'count',
                'dimensions' => ['urgency' => $data->urgency],
            ]);
        }
    }

    /**
     * Collect ambulance-related metrics
     */
    private function collectAmbulanceMetrics(Carbon $date): void
    {
        $startOfDay = $date->copy()->startOfDay();
        $endOfDay = $date->copy()->endOfDay();

        // Ambulance utilization by facility
        $utilizationData = AmbulanceDispatch::whereBetween('created_at', [$startOfDay, $endOfDay])
            ->join('ambulances', 'ambulance_dispatches.ambulance_id', '=', 'ambulances.id')
            ->selectRaw('
                ambulances.facility_id,
                COUNT(DISTINCT ambulance_dispatches.ambulance_id) as active_ambulances,
                COUNT(*) as total_dispatches,
                AVG(TIMESTAMPDIFF(MINUTE, ambulance_dispatches.created_at, 
                    COALESCE(ambulance_dispatches.completed_at, NOW()))) as avg_dispatch_duration
            ')
            ->groupBy('ambulances.facility_id')
            ->get();

        foreach ($utilizationData as $data) {
            // Utilization rate (assuming 24 hours available time)
            $utilizationRate = ($data->avg_dispatch_duration * $data->total_dispatches) / (24 * 60) * 100;
            
            AnalyticsMetric::recordMetric([
                'date' => $date->toDateString(),
                'type' => 'ambulance_utilization_rate',
                'category' => 'efficiency',
                'value' => min(100, $utilizationRate),
                'unit' => 'percentage',
                'facility_id' => $data->facility_id,
                'metadata' => [
                    'active_ambulances' => $data->active_ambulances,
                    'total_dispatches' => $data->total_dispatches,
                    'avg_dispatch_duration' => $data->avg_dispatch_duration,
                ],
            ]);
        }

        // Average response time for ambulance dispatches
        $ambulanceResponseTimes = AmbulanceDispatch::whereBetween('created_at', [$startOfDay, $endOfDay])
            ->whereNotNull('dispatched_at')
            ->join('ambulances', 'ambulance_dispatches.ambulance_id', '=', 'ambulances.id')
            ->selectRaw('
                ambulances.facility_id,
                AVG(TIMESTAMPDIFF(MINUTE, ambulance_dispatches.created_at, 
                    ambulance_dispatches.dispatched_at)) as avg_response_time
            ')
            ->groupBy('ambulances.facility_id')
            ->get();

        foreach ($ambulanceResponseTimes as $data) {
            AnalyticsMetric::recordMetric([
                'date' => $date->toDateString(),
                'type' => 'ambulance_response_time',
                'category' => 'performance',
                'value' => $data->avg_response_time,
                'unit' => 'minutes',
                'facility_id' => $data->facility_id,
            ]);
        }

        // Fuel efficiency metrics
        $fuelData = DB::table('ambulance_performance_metrics')
            ->where('metric_date', $date->toDateString())
            ->selectRaw('
                ambulance_id,
                fuel_efficiency_km_per_liter,
                total_distance_km,
                fuel_consumed_liters
            ')
            ->whereNotNull('fuel_efficiency_km_per_liter')
            ->get();

        foreach ($fuelData as $data) {
            $ambulance = Ambulance::find($data->ambulance_id);
            if ($ambulance) {
                AnalyticsMetric::recordMetric([
                    'date' => $date->toDateString(),
                    'type' => 'fuel_efficiency',
                    'category' => 'cost',
                    'value' => $data->fuel_efficiency_km_per_liter,
                    'unit' => 'km_per_liter',
                    'facility_id' => $ambulance->facility_id,
                    'ambulance_id' => $data->ambulance_id,
                    'metadata' => [
                        'total_distance' => $data->total_distance_km,
                        'fuel_consumed' => $data->fuel_consumed_liters,
                    ],
                ]);
            }
        }
    }

    /**
     * Collect patient-related metrics
     */
    private function collectPatientMetrics(Carbon $date): void
    {
        $startOfDay = $date->copy()->startOfDay();
        $endOfDay = $date->copy()->endOfDay();

        // Patient satisfaction scores
        $satisfactionData = DB::table('patient_feedback')
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->selectRaw('
                facility_id,
                AVG(overall_satisfaction) as avg_satisfaction,
                COUNT(*) as feedback_count
            ')
            ->groupBy('facility_id')
            ->get();

        foreach ($satisfactionData as $data) {
            AnalyticsMetric::recordMetric([
                'date' => $date->toDateString(),
                'type' => 'patient_satisfaction',
                'category' => 'quality',
                'value' => $data->avg_satisfaction,
                'unit' => 'score',
                'facility_id' => $data->facility_id,
                'metadata' => [
                    'feedback_count' => $data->feedback_count,
                ],
            ]);
        }

        // Patient transfer outcomes
        $transferOutcomes = Referral::whereBetween('created_at', [$startOfDay, $endOfDay])
            ->where('status', 'completed')
            ->selectRaw('
                receiving_facility_id as facility_id,
                COUNT(*) as total_transfers,
                SUM(CASE WHEN patient_outcome = "improved" THEN 1 ELSE 0 END) as successful_transfers
            ')
            ->groupBy('receiving_facility_id')
            ->get();

        foreach ($transferOutcomes as $data) {
            $successRate = $data->total_transfers > 0 ? 
                ($data->successful_transfers / $data->total_transfers) * 100 : 0;
            
            AnalyticsMetric::recordMetric([
                'date' => $date->toDateString(),
                'type' => 'transfer_success_rate',
                'category' => 'quality',
                'value' => $successRate,
                'unit' => 'percentage',
                'facility_id' => $data->facility_id,
                'metadata' => [
                    'total_transfers' => $data->total_transfers,
                    'successful_transfers' => $data->successful_transfers,
                ],
            ]);
        }
    }

    /**
     * Collect facility-related metrics
     */
    private function collectFacilityMetrics(Carbon $date): void
    {
        $facilities = Facility::all();

        foreach ($facilities as $facility) {
            // Bed utilization rate
            $totalBeds = DB::table('beds')->where('facility_id', $facility->id)->count();
            $occupiedBeds = DB::table('beds')
                ->where('facility_id', $facility->id)
                ->where('status', 'occupied')
                ->count();

            $utilizationRate = $totalBeds > 0 ? ($occupiedBeds / $totalBeds) * 100 : 0;

            AnalyticsMetric::recordMetric([
                'date' => $date->toDateString(),
                'type' => 'bed_utilization_rate',
                'category' => 'efficiency',
                'value' => $utilizationRate,
                'unit' => 'percentage',
                'facility_id' => $facility->id,
                'metadata' => [
                    'total_beds' => $totalBeds,
                    'occupied_beds' => $occupiedBeds,
                ],
            ]);

            // Staff utilization
            $totalStaff = User::where('facility_id', $facility->id)
                ->whereIn('role', ['doctor', 'nurse'])
                ->count();

            $activeStaff = User::where('facility_id', $facility->id)
                ->whereIn('role', ['doctor', 'nurse'])
                ->where('last_seen_at', '>=', $date->copy()->subHours(24))
                ->count();

            $staffUtilization = $totalStaff > 0 ? ($activeStaff / $totalStaff) * 100 : 0;

            AnalyticsMetric::recordMetric([
                'date' => $date->toDateString(),
                'type' => 'staff_utilization_rate',
                'category' => 'efficiency',
                'value' => $staffUtilization,
                'unit' => 'percentage',
                'facility_id' => $facility->id,
                'metadata' => [
                    'total_staff' => $totalStaff,
                    'active_staff' => $activeStaff,
                ],
            ]);
        }
    }

    /**
     * Collect performance metrics
     */
    private function collectPerformanceMetrics(Carbon $date): void
    {
        // System-wide performance metrics
        $totalReferrals = Referral::whereDate('created_at', $date)->count();
        $completedReferrals = Referral::whereDate('created_at', $date)
            ->where('status', 'completed')
            ->count();

        $completionRate = $totalReferrals > 0 ? ($completedReferrals / $totalReferrals) * 100 : 0;

        AnalyticsMetric::recordMetric([
            'date' => $date->toDateString(),
            'type' => 'system_completion_rate',
            'category' => 'performance',
            'value' => $completionRate,
            'unit' => 'percentage',
            'metadata' => [
                'total_referrals' => $totalReferrals,
                'completed_referrals' => $completedReferrals,
            ],
        ]);

        // Average system response time
        $avgSystemResponseTime = Referral::whereDate('created_at', $date)
            ->whereNotNull('accepted_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(MINUTE, created_at, accepted_at)) as avg_time')
            ->first()
            ->avg_time ?? 0;

        AnalyticsMetric::recordMetric([
            'date' => $date->toDateString(),
            'type' => 'system_response_time',
            'category' => 'performance',
            'value' => $avgSystemResponseTime,
            'unit' => 'minutes',
        ]);
    }

    /**
     * Collect quality metrics
     */
    private function collectQualityMetrics(Carbon $date): void
    {
        // Error rates
        $totalTransactions = Referral::whereDate('created_at', $date)->count();
        $errorTransactions = Referral::whereDate('created_at', $date)
            ->where('status', 'failed')
            ->count();

        $errorRate = $totalTransactions > 0 ? ($errorTransactions / $totalTransactions) * 100 : 0;

        AnalyticsMetric::recordMetric([
            'date' => $date->toDateString(),
            'type' => 'error_rate',
            'category' => 'quality',
            'value' => $errorRate,
            'unit' => 'percentage',
            'metadata' => [
                'total_transactions' => $totalTransactions,
                'error_transactions' => $errorTransactions,
            ],
        ]);
    }

    /**
     * Collect cost metrics
     */
    private function collectCostMetrics(Carbon $date): void
    {
        // Average cost per referral
        $referralCosts = Referral::whereDate('created_at', $date)
            ->whereNotNull('estimated_cost')
            ->selectRaw('
                receiving_facility_id as facility_id,
                AVG(estimated_cost) as avg_cost,
                COUNT(*) as referral_count
            ')
            ->groupBy('receiving_facility_id')
            ->get();

        foreach ($referralCosts as $data) {
            AnalyticsMetric::recordMetric([
                'date' => $date->toDateString(),
                'type' => 'cost_per_referral',
                'category' => 'cost',
                'value' => $data->avg_cost,
                'unit' => 'currency',
                'facility_id' => $data->facility_id,
                'metadata' => [
                    'referral_count' => $data->referral_count,
                ],
            ]);
        }
    }

    /**
     * Collect real-time metrics (called more frequently)
     */
    public function collectRealTimeMetrics(): void
    {
        $now = now();

        // Current system load
        $pendingReferrals = Referral::where('status', 'pending')->count();
        $activeDispatches = AmbulanceDispatch::whereIn('status', ['dispatched', 'en_route'])->count();
        $availableAmbulances = Ambulance::where('status', 'available')->count();

        AnalyticsMetric::recordMetric([
            'date' => $now->toDateString(),
            'type' => 'current_system_load',
            'category' => 'performance',
            'value' => $pendingReferrals + $activeDispatches,
            'unit' => 'count',
            'metadata' => [
                'pending_referrals' => $pendingReferrals,
                'active_dispatches' => $activeDispatches,
                'available_ambulances' => $availableAmbulances,
                'timestamp' => $now->toISOString(),
            ],
        ]);
    }
}
