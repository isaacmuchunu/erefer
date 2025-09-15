<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreEmergencyAlertRequest;
use App\Models\EmergencyAlert;
use App\Services\EmergencyService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EmergencyController extends Controller
{
    public function __construct(
        private EmergencyService $emergencyService
    ) {}

    public function alerts(Request $request): JsonResponse
    {
        $alerts = EmergencyAlert::query()
            ->when($request->type, fn($q, $type) => $q->where('type', $type))
            ->when($request->severity, fn($q, $severity) => $q->where('severity', $severity))
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->active_only, fn($q) => $q->where('status', 'active'))
            ->latest('alert_start')
            ->paginate($request->per_page ?? 15);

        return response()->json($alerts);
    }

    public function publicStatus(Request $request): JsonResponse
    {
        $status = [
            'active_alerts' => EmergencyAlert::query()->where('status', 'active')->count(),
            'last_updated' => now()->toISOString(),
        ];

        return response()->json($status);
    }

    public function createAlert(StoreEmergencyAlertRequest $request): JsonResponse
    {
        $alert = $this->emergencyService->createAlert($request->validated());

        return response()->json([
            'message' => 'Emergency alert created successfully',
            'alert' => $alert
        ], 201);
    }

    public function updateAlert(Request $request, EmergencyAlert $alert): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:active,resolved,cancelled',
            'resolution_notes' => 'nullable|string'
        ]);

        $alert = $this->emergencyService->updateAlert($alert, $request->validated());

        return response()->json([
            'message' => 'Alert updated successfully',
            'alert' => $alert
        ]);
    }

    public function massCasualtyProtocol(Request $request): JsonResponse
    {
        $request->validate([
            'incident_location' => 'required|array',
            'estimated_casualties' => 'required|integer|min:1',
            'severity_breakdown' => 'nullable|array',
            'incident_type' => 'required|string'
        ]);

        $response = $this->emergencyService->initiateMassCasualtyProtocol($request->validated());

        return response()->json([
            'message' => 'Mass casualty protocol initiated',
            'response' => $response
        ]);
    }

    public function resourceMobilization(Request $request): JsonResponse
    {
        $request->validate([
            'alert_id' => 'required|exists:emergency_alerts,id',
            'resources_needed' => 'required|array',
            'priority_facilities' => 'nullable|array'
        ]);

        $mobilization = $this->emergencyService->mobilizeResources($request->validated());

        return response()->json([
            'message' => 'Resources mobilized successfully',
            'mobilization' => $mobilization
        ]);
    }

    public function emergencyContacts(Request $request): JsonResponse
    {
        // Return system-wide emergency contacts
        $contacts = [
            'emergency_coordination_center' => [
                'name' => 'Emergency Coordination Center',
                'phone' => '+1-800-EMERGENCY',
                'email' => 'emergency@health.gov',
                'available_24_7' => true,
            ],
            'poison_control' => [
                'name' => 'Poison Control Center',
                'phone' => '+1-800-222-1222',
                'email' => 'poison@control.org',
                'available_24_7' => true,
            ],
            'disease_control' => [
                'name' => 'Disease Control Center',
                'phone' => '+1-800-CDC-INFO',
                'email' => 'info@cdc.gov',
                'available_24_7' => true,
            ],
        ];

        return response()->json(['contacts' => $contacts]);
    }

    public function alertWebhook(Request $request): JsonResponse
    {
        $request->validate([
            'alert_type' => 'required|string',
            'severity' => 'required|in:low,medium,high,critical',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'external_id' => 'nullable|string',
        ]);

        // Create alert from external webhook
        $alert = $this->emergencyService->createAlert([
            'type' => $request->alert_type,
            'severity' => $request->severity,
            'title' => $request->title,
            'description' => $request->description,
            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'Alert received and processed',
            'alert_id' => $alert->id,
        ]);
    }
}
