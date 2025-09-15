<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAmbulanceRequest;
use App\Http\Requests\UpdateAmbulanceRequest;
use App\Http\Resources\AmbulanceResource;
use App\Models\Ambulance;
use App\Models\AmbulanceDispatch;
use App\Services\AmbulanceService;
use App\Services\GpsTrackingService;
use App\Services\RouteOptimizationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse;

class AmbulanceController extends Controller
{
    public function __construct(
        private AmbulanceService $ambulanceService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Ambulance::class);

        $user = auth()->user();
        $query = Ambulance::query()->with(['facility']);

        // Apply role-based filtering
        if (in_array($user->role, ['ambulance_driver', 'ambulance_paramedic'])) {
            $query->whereHas('crews', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } elseif ($user->facility_id && !in_array($user->role, ['super_admin', 'dispatcher'])) {
            $query->where('facility_id', $user->facility_id);
        }

        $ambulances = $query
            ->when($request->facility_id, fn($q, $id) => $q->where('facility_id', $id))
            ->when($request->type, fn($q, $type) => $q->where('type', $type))
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->available_only, fn($q) => $q->where('status', 'available'))
            ->paginate($request->per_page ?? 15);

        return response()->json($ambulances);
    }

    public function store(StoreAmbulanceRequest $request): JsonResponse
    {
        $this->authorize('create', Ambulance::class);

        $ambulance = $this->ambulanceService->create($request->validated());

        return response()->json([
            'message' => 'Ambulance created successfully',
            'ambulance' => $ambulance->load('facility')
        ], 201);
    }

    public function show(Ambulance $ambulance): JsonResponse
    {
        $this->authorize('view', $ambulance);

        return response()->json([
            'ambulance' => $ambulance->load([
                'facility',
                'dispatches' => fn($q) => $q->latest()->limit(10),
                'dispatches.referral.patient'
            ])
        ]);
    }

    public function edit(Ambulance $ambulance)
    {
        return Inertia::render('ambulances/edit', [
            'ambulance' => new AmbulanceResource($ambulance->load(['facility'])),
        ]);
    }

    public function update(UpdateAmbulanceRequest $request, Ambulance $ambulance): JsonResponse
    {
        $ambulance = $this->ambulanceService->update($ambulance, $request->validated());

        return response()->json([
            'message' => 'Ambulance updated successfully',
            'ambulance' => $ambulance->load('facility')
        ]);
    }

    public function destroy(Ambulance $ambulance): JsonResponse
    {
        $this->ambulanceService->delete($ambulance);

        return response()->json([
            'message' => 'Ambulance deleted successfully'
        ]);
    }

    public function dispatch(Request $request): JsonResponse
    {
        $request->validate([
            'ambulance_id' => 'required|exists:ambulances,id',
            'referral_id' => 'nullable|exists:referrals,id',
            'pickup_location' => 'required|array',
            'destination_location' => 'required|array',
            'crew_members' => 'required|array',
            'special_instructions' => 'nullable|string'
        ]);

        $ambulance = Ambulance::findOrFail($request->ambulance_id);
        $dispatch = $this->ambulanceService->dispatch($ambulance, $request->validated());

        return response()->json([
            'message' => 'Ambulance dispatched successfully',
            'dispatch' => $dispatch->load(['ambulance', 'referral'])
        ]);
    }

    public function updateLocation(Request $request, Ambulance $ambulance): JsonResponse
    {
        $request->validate([
            'current_location' => 'required|array',
            'current_location.lat' => 'required|numeric|between:-90,90',
            'current_location.lng' => 'required|numeric|between:-180,180',
            'metadata' => 'nullable|array',
            'metadata.accuracy' => 'nullable|numeric',
            'metadata.speed' => 'nullable|numeric',
            'metadata.heading' => 'nullable|numeric|between:0,360',
            'metadata.altitude' => 'nullable|numeric',
            'metadata.source' => 'nullable|string|in:gps,manual,estimated'
        ]);

        $gpsService = app(GpsTrackingService::class);
        $success = $gpsService->updateLocation(
            $ambulance,
            $request->input('current_location.lat'),
            $request->input('current_location.lng'),
            $request->input('metadata', [])
        );

        if (!$success) {
            return response()->json([
                'message' => 'Failed to update location'
            ], 500);
        }

        return response()->json([
            'message' => 'Location updated successfully',
            'ambulance' => $ambulance->fresh(['currentDispatch']),
            'timestamp' => now()->toISOString()
        ]);
    }

    public function updateDispatchStatus(Request $request, AmbulanceDispatch $dispatch): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:dispatched,en_route_pickup,at_pickup,en_route_destination,arrived,completed,cancelled',
            'notes' => 'nullable|string',
            'patient_condition' => 'nullable|array'
        ]);

        $dispatch = $this->ambulanceService->updateDispatchStatus($dispatch, $request->validated());

        return response()->json([
            'message' => 'Dispatch status updated successfully',
            'dispatch' => $dispatch
        ]);
    }

    public function nearbyAmbulances(Request $request): JsonResponse
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'radius' => 'nullable|numeric|min:1|max:100'
        ]);

        $ambulances = $this->ambulanceService->findNearby(
            $request->lat,
            $request->lng,
            $request->radius ?? 20
        );

        return response()->json($ambulances);
    }

    public function stats(Request $request): JsonResponse
    {
        $stats = Ambulance::query()
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
                SUM(CASE WHEN status = 'on_trip' THEN 1 ELSE 0 END) as on_trip,
                SUM(CASE WHEN status = 'out_of_service' THEN 1 ELSE 0 END) as out_of_service
            ")
            ->when($request->facility_id, fn($q, $id) => $q->where('facility_id', $id))
            ->first();

        return response()->json($stats);
    }

    /**
     * Get optimized route for ambulance dispatch
     */
    public function getOptimizedRoute(Request $request): JsonResponse
    {
        $request->validate([
            'from_lat' => 'required|numeric|between:-90,90',
            'from_lng' => 'required|numeric|between:-180,180',
            'to_lat' => 'required|numeric|between:-90,90',
            'to_lng' => 'required|numeric|between:-180,180',
            'avoid' => 'nullable|string',
            'departure_time' => 'nullable|string'
        ]);

        $routeService = app(\App\Services\RouteOptimizationService::class);
        $routes = $routeService->getOptimizedRoute(
            $request->from_lat,
            $request->from_lng,
            $request->to_lat,
            $request->to_lng,
            $request->only(['avoid', 'departure_time'])
        );

        return response()->json($routes);
    }

    /**
     * Find optimal ambulance for dispatch
     */
    public function findOptimalAmbulance(Request $request): JsonResponse
    {
        $request->validate([
            'pickup_lat' => 'required|numeric|between:-90,90',
            'pickup_lng' => 'required|numeric|between:-180,180',
            'required_equipment' => 'nullable|array',
            'urgency' => 'nullable|string|in:emergency,urgent,semi_urgent,routine'
        ]);

        $routeService = app(\App\Services\RouteOptimizationService::class);
        $ambulance = $routeService->findOptimalAmbulance(
            $request->pickup_lat,
            $request->pickup_lng,
            $request->only(['required_equipment', 'urgency'])
        );

        if (!$ambulance) {
            return response()->json([
                'message' => 'No suitable ambulance found',
                'ambulance' => null
            ], 404);
        }

        return response()->json([
            'message' => 'Optimal ambulance found',
            'ambulance' => $ambulance->load(['facility', 'currentDispatch'])
        ]);
    }

    /**
     * Get ambulance location history
     */
    public function getLocationHistory(Request $request, Ambulance $ambulance): JsonResponse
    {
        $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date',
            'limit' => 'nullable|integer|min:1|max:1000'
        ]);

        $gpsService = app(\App\Services\GpsTrackingService::class);
        $history = $gpsService->getLocationHistory(
            $ambulance,
            $request->from ? \Carbon\Carbon::parse($request->from) : null,
            $request->to ? \Carbon\Carbon::parse($request->to) : null
        );

        if ($request->limit) {
            $history = array_slice($history, 0, $request->limit);
        }

        return response()->json([
            'ambulance_id' => $ambulance->id,
            'location_history' => $history,
            'total_points' => count($history)
        ]);
    }

    /**
     * Get real-time tracking data for all ambulances
     */
    public function getTrackingData(Request $request): JsonResponse
    {
        $request->validate([
            'facility_id' => 'nullable|exists:facilities,id',
            'status' => 'nullable|string|in:available,dispatched,maintenance,out_of_service',
            'active_only' => 'nullable|boolean'
        ]);

        $query = Ambulance::with(['facility', 'currentDispatch.referral.patient']);

        if ($request->facility_id) {
            $query->where('facility_id', $request->facility_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->active_only) {
            $query->whereHas('currentDispatch');
        }

        $ambulances = $query->get()->map(function ($ambulance) {
            $data = $ambulance->toArray();

            // Add route progress if available
            if ($ambulance->currentDispatch) {
                $progress = \Cache::get("route_progress_{$ambulance->currentDispatch->id}");
                $data['route_progress'] = $progress;
            }

            return $data;
        });

        return response()->json([
            'ambulances' => $ambulances,
            'total_count' => $ambulances->count(),
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Update patient condition during transport
     */
    public function updatePatientCondition(Request $request, AmbulanceDispatch $dispatch): JsonResponse
    {
        $request->validate([
            'patient_condition' => 'required|array',
            'notes' => 'nullable|string',
            'vital_signs' => 'nullable|array',
            'medications_given' => 'nullable|array',
            'procedures_performed' => 'nullable|array'
        ]);

        $updateData = [
            'patient_condition_on_pickup' => $request->patient_condition,
            'notes' => $request->notes
        ];

        // Store additional medical data if provided
        if ($request->vital_signs || $request->medications_given || $request->procedures_performed) {
            $medicalData = array_filter([
                'vital_signs' => $request->vital_signs,
                'medications_given' => $request->medications_given,
                'procedures_performed' => $request->procedures_performed,
                'updated_at' => now()->toISOString()
            ]);

            $updateData['patient_condition_on_pickup'] = array_merge(
                $request->patient_condition,
                ['medical_data' => $medicalData]
            );
        }

        $dispatch->update($updateData);

        // Broadcast update to relevant channels
        broadcast(new \App\Events\PatientConditionUpdated($dispatch));

        return response()->json([
            'message' => 'Patient condition updated successfully',
            'dispatch' => $dispatch->fresh()
        ]);
    }
}


?>