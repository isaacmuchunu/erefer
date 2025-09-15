<?php

namespace App\Http\Controllers;

use App\Services\AdvancedAnalyticsService;
use App\Services\MachineLearningService;
use App\Models\AnalyticsDashboard;
use App\Models\AnalyticsReport;
use App\Models\AnomalyDetection;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    private $analyticsService;
    private $mlService;

    public function __construct(AdvancedAnalyticsService $analyticsService, MachineLearningService $mlService)
    {
        $this->analyticsService = $analyticsService;
        $this->mlService = $mlService;
    }

    /**
     * Display analytics dashboard
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['start_date', 'end_date', 'facility_id']);
        $analytics = $this->analyticsService->getDashboardAnalytics($filters);

        return Inertia::render('Analytics/Dashboard', [
            'analytics' => $analytics,
            'filters' => $filters,
            'dashboards' => AnalyticsDashboard::where('is_active', true)->get(),
        ]);
    }

    /**
     * Get comprehensive analytics data
     */
    public function getAnalytics(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'facility_id' => 'nullable|exists:facilities,id',
            'metrics' => 'nullable|array',
        ]);

        $filters = $request->only(['start_date', 'end_date', 'facility_id']);
        $analytics = $this->analyticsService->getDashboardAnalytics($filters);

        return response()->json([
            'success' => true,
            'data' => $analytics,
            'generated_at' => now()->toISOString(),
        ]);
    }

    /**
     * Get predictive insights
     */
    public function getPredictiveInsights(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:demand_forecast,risk_assessment,maintenance_prediction,capacity_planning',
            'parameters' => 'nullable|array',
            'facility_id' => 'nullable|exists:facilities,id',
        ]);

        $type = $request->type;
        $parameters = $request->parameters ?? [];
        $parameters['facility_id'] = $request->facility_id;

        $insights = match($type) {
            'demand_forecast' => $this->mlService->predictDemandPatterns($parameters),
            'risk_assessment' => $this->mlService->predictTransferRisk($parameters),
            'maintenance_prediction' => $this->getMaintenancePredictions($parameters),
            'capacity_planning' => $this->analyticsService->getPredictiveInsights(
                $parameters['start_date'] ?? now()->subDays(30),
                $parameters['end_date'] ?? now(),
                $parameters['facility_id'] ?? null
            ),
        };

        return response()->json([
            'success' => true,
            'type' => $type,
            'insights' => $insights,
            'generated_at' => now()->toISOString(),
        ]);
    }

    /**
     * Get real-time decision support
     */
    public function getDecisionSupport(Request $request): JsonResponse
    {
        $context = $request->input('context', []);
        $recommendations = $this->analyticsService->getDecisionSupport($context);

        return response()->json([
            'success' => true,
            'recommendations' => $recommendations,
            'generated_at' => now()->toISOString(),
        ]);
    }

    /**
     * Detect and return anomalies
     */
    public function detectAnomalies(Request $request): JsonResponse
    {
        $request->validate([
            'metrics' => 'required|array',
            'threshold' => 'nullable|numeric|min:1|max:5',
            'window_size' => 'nullable|integer|min:7|max:90',
        ]);

        $anomalies = $this->mlService->detectAnomalies(
            $request->metrics,
            $request->only(['threshold', 'window_size'])
        );

        return response()->json([
            'success' => true,
            'anomalies' => $anomalies,
            'detected_at' => now()->toISOString(),
        ]);
    }

    /**
     * Get performance benchmarks
     */
    public function getPerformanceBenchmarks(Request $request): JsonResponse
    {
        $request->validate([
            'facility_id' => 'nullable|exists:facilities,id',
            'metric_types' => 'nullable|array',
            'benchmark_category' => 'nullable|in:internal,industry,regulatory',
        ]);

        $benchmarks = $this->analyticsService->getPerformanceBenchmarks($request->all());

        return response()->json([
            'success' => true,
            'benchmarks' => $benchmarks,
            'generated_at' => now()->toISOString(),
        ]);
    }

    /**
     * Generate custom report
     */
    public function generateReport(Request $request): JsonResponse
    {
        $request->validate([
            'report_type' => 'required|string',
            'parameters' => 'required|array',
            'output_format' => 'required|in:pdf,excel,csv,json',
            'email_recipients' => 'nullable|array',
            'email_recipients.*' => 'email',
        ]);

        $reportData = $this->analyticsService->generateCustomReport(
            $request->report_type,
            $request->parameters,
            $request->output_format
        );

        // If email recipients provided, send the report
        if ($request->email_recipients) {
            $this->sendReportByEmail($reportData, $request->email_recipients);
        }

        return response()->json([
            'success' => true,
            'report' => $reportData,
            'generated_at' => now()->toISOString(),
        ]);
    }

    /**
     * Get optimization recommendations
     */
    public function getOptimizationRecommendations(Request $request): JsonResponse
    {
        $request->validate([
            'facility_id' => 'nullable|exists:facilities,id',
            'recommendation_type' => 'nullable|in:staffing,equipment,process,cost',
            'priority' => 'nullable|in:low,medium,high,critical',
        ]);

        $recommendations = $this->mlService->optimizeResourceAllocation($request->all());

        return response()->json([
            'success' => true,
            'recommendations' => $recommendations,
            'generated_at' => now()->toISOString(),
        ]);
    }

    /**
     * Get maintenance predictions for all ambulances
     */
    private function getMaintenancePredictions(array $parameters): array
    {
        $facilityId = $parameters['facility_id'] ?? null;
        $ambulances = \App\Models\Ambulance::when($facilityId, function ($query, $facilityId) {
            return $query->where('facility_id', $facilityId);
        })->get();

        $predictions = [];
        foreach ($ambulances as $ambulance) {
            $predictions[] = [
                'ambulance_id' => $ambulance->id,
                'vehicle_number' => $ambulance->vehicle_number,
                'predictions' => $this->mlService->predictMaintenanceNeeds($ambulance),
            ];
        }

        return [
            'ambulance_predictions' => $predictions,
            'summary' => $this->summarizeMaintenancePredictions($predictions),
        ];
    }

    /**
     * Summarize maintenance predictions
     */
    private function summarizeMaintenancePredictions(array $predictions): array
    {
        $criticalCount = 0;
        $highCount = 0;
        $totalCost = 0;

        foreach ($predictions as $prediction) {
            foreach ($prediction['predictions']['predicted_failures'] as $failure) {
                if ($failure['risk_score'] > 80) {
                    $criticalCount++;
                } elseif ($failure['risk_score'] > 60) {
                    $highCount++;
                }
            }

            if (isset($prediction['predictions']['cost_estimates'])) {
                $totalCost += array_sum($prediction['predictions']['cost_estimates']);
            }
        }

        return [
            'critical_maintenance_needed' => $criticalCount,
            'high_priority_maintenance' => $highCount,
            'estimated_total_cost' => $totalCost,
            'ambulances_analyzed' => count($predictions),
        ];
    }

    /**
     * Send report by email
     */
    private function sendReportByEmail(array $reportData, array $recipients): void
    {
        // Implementation would depend on your email service
        // This is a placeholder for the email sending logic
        foreach ($recipients as $recipient) {
            // Mail::to($recipient)->send(new AnalyticsReportMail($reportData));
        }
    }
}