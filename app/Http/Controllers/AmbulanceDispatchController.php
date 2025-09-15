<?php

namespace App\Http\Controllers;

use App\Models\AmbulanceDispatch;
use App\Models\Ambulance;
use App\Models\Referral;
use App\Services\AmbulanceService;
use App\Services\NotificationService;
use App\Services\RouteOptimizationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AmbulanceDispatchController extends Controller
{
    private $ambulanceService;
    private $notificationService;
    private $routeOptimizationService;

    public function __construct(
        AmbulanceService $ambulanceService,
        NotificationService $notificationService,
        RouteOptimizationService $routeOptimizationService
    ) {
        $this->ambulanceService = $ambulanceService;
        $this->notificationService = $notificationService;
        $this->routeOptimizationService = $routeOptimizationService;
    }

    /**
     * Display dispatch dashboard
     */
    public function index(Request $request): Response
    {
        $dispatches = AmbulanceDispatch::with(['ambulance', 'referral.patient', 'dispatcher'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->priority, fn($q) => $q->where('priority', $request->priority))
            ->when($request->ambulance_id, fn($q) => $q->where('ambulance_id', $request->ambulance_id))
            ->orderBy('dispatched_at', 'desc')
            ->paginate(20);

        $activeDispatches = AmbulanceDispatch::active()->count();
        $availableAmbulances = Ambulance::available()->count();
        $emergencyDispatches = AmbulanceDispatch::where('priority', 'emergency')->active()->count();

        return Inertia::render('Ambulances/Dispatch/Index', [
            'dispatches' => $dispatches,
            'stats' => [
                'active_dispatches' => $activeDispatches,
                'available_ambulances' => $availableAmbulances,
                'emergency_dispatches' => $emergencyDispatches,
            ],
            'filters' => $request->only(['status', 'priority', 'ambulance_id']),
        ]);
    }

    /**
     * Show dispatch creation form
     */
    public function create(Request $request): Response
    {
        $referral = null;
        if ($request->referral_id) {
            $referral = Referral::with(['patient', 'referringFacility', 'receivingFacility'])
                ->findOrFail($request->referral_id);
        }

        $availableAmbulances = Ambulance::available()
            ->with(['facility', 'activeCrew'])
            ->get();

        return Inertia::render('Ambulances/Dispatch/Create', [
            'referral' => $referral,
            'availableAmbulances' => $availableAmbulances,
        ]);
    }

    /**
     * Create new dispatch
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'ambulance_id' => 'required|exists:ambulances,id',
            'referral_id' => 'nullable|exists:referrals,id',
            'pickup_location' => 'required|array',
            'pickup_location.latitude' => 'required|numeric|between:-90,90',
            'pickup_location.longitude' => 'required|numeric|between:-180,180',
            'pickup_location.address' => 'required|string',
            'destination_location' => 'required|array',
            'destination_location.latitude' => 'required|numeric|between:-90,90',
            'destination_location.longitude' => 'required|numeric|between:-180,180',
            'destination_location.address' => 'required|string',
            'priority' => 'required|in:routine,urgent,emergency',
            'patient_condition' => 'nullable|string',
            'special_instructions' => 'nullable|string',
            'crew_members' => 'nullable|array',
            'estimated_arrival_time' => 'nullable|date|after:now',
        ]);

        try {
            DB::beginTransaction();

            $ambulance = Ambulance::findOrFail($request->ambulance_id);

            // Check if ambulance is available
            if (!$ambulance->is_available) {
                return response()->json([
                    'message' => 'Selected ambulance is not available',
                    'errors' => ['ambulance_id' => ['Ambulance is not available']]
                ], 422);
            }

            // Generate dispatch number
            $dispatchNumber = $this->generateDispatchNumber();

            // Calculate estimated arrival time if not provided
            $estimatedArrival = $request->estimated_arrival_time;
            if (!$estimatedArrival) {
                $estimatedArrival = $ambulance->getEstimatedArrivalTime(
                    $request->pickup_location['latitude'],
                    $request->pickup_location['longitude']
                );
            }

            // Create dispatch
            $dispatch = AmbulanceDispatch::create([
                'dispatch_number' => $dispatchNumber,
                'ambulance_id' => $request->ambulance_id,
                'referral_id' => $request->referral_id,
                'dispatcher_id' => auth()->id(),
                'pickup_location' => $request->pickup_location,
                'destination_location' => $request->destination_location,
                'priority' => $request->priority,
                'patient_condition' => $request->patient_condition,
                'special_instructions' => $request->special_instructions,
                'crew_members' => $request->crew_members,
                'estimated_arrival_time' => $estimatedArrival,
                'dispatched_at' => now(),
                'status' => 'dispatched',
            ]);

            // Update ambulance status
            $ambulance->update(['status' => 'dispatched']);

            // Update referral status if applicable
            if ($request->referral_id) {
                Referral::where('id', $request->referral_id)
                    ->update(['status' => 'ambulance_dispatched']);
            }

            // Send notifications to crew
            $this->notificationService->sendDispatchNotification($dispatch);

            // Generate optimized route
            $route = $this->routeOptimizationService->generateRoute(
                $ambulance->current_location,
                $request->pickup_location,
                $request->destination_location
            );

            DB::commit();

            Log::info('Ambulance dispatch created', [
                'dispatch_id' => $dispatch->id,
                'ambulance_id' => $ambulance->id,
                'dispatcher_id' => auth()->id(),
            ]);

            return response()->json([
                'message' => 'Dispatch created successfully',
                'dispatch' => $dispatch->load(['ambulance', 'referral']),
                'route' => $route,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create dispatch', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Failed to create dispatch',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show dispatch details
     */
    public function show(AmbulanceDispatch $dispatch): Response
    {
        $dispatch->load([
            'ambulance.facility',
            'referral.patient',
            'referral.referringFacility',
            'referral.receivingFacility',
            'dispatcher',
            'locationUpdates' => fn($q) => $q->orderBy('recorded_at', 'desc')->limit(50),
            'statusUpdates' => fn($q) => $q->orderBy('created_at', 'desc'),
        ]);

        return Inertia::render('Ambulances/Dispatch/Show', [
            'dispatch' => $dispatch,
            'statusHistory' => $dispatch->getStatusHistory(),
            'performanceMetrics' => $dispatch->getPerformanceMetrics(),
        ]);
    }

    /**
     * Update dispatch status
     */
    public function updateStatus(Request $request, AmbulanceDispatch $dispatch): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:acknowledged,en_route_pickup,at_pickup,patient_loaded,en_route_destination,at_destination,patient_delivered,completed,cancelled',
            'notes' => 'nullable|string',
            'location' => 'nullable|array',
            'location.latitude' => 'required_with:location|numeric|between:-90,90',
            'location.longitude' => 'required_with:location|numeric|between:-180,180',
        ]);

        try {
            DB::beginTransaction();

            $oldStatus = $dispatch->status;
            $newStatus = $request->status;

            // Update status based on the new status
            $result = match($newStatus) {
                'acknowledged' => $dispatch->acknowledge(),
                'en_route_pickup' => $dispatch->startEnRouteToPickup(),
                'at_pickup' => $dispatch->arriveAtPickup(),
                'patient_loaded' => $dispatch->loadPatient(),
                'en_route_destination' => $dispatch->startEnRouteToDestination(),
                'at_destination' => $dispatch->arriveAtDestination(),
                'patient_delivered' => $dispatch->deliverPatient($request->only(['handover_notes', 'receiving_staff'])),
                'completed' => $dispatch->complete($request->only(['distance_traveled', 'fuel_consumed', 'crew_notes'])),
                'cancelled' => $dispatch->cancel($request->notes ?? 'No reason provided'),
                default => false,
            };

            if (!$result) {
                return response()->json([
                    'message' => 'Failed to update dispatch status',
                ], 422);
            }

            // Update location if provided
            if ($request->location) {
                $dispatch->updateLocation(
                    $request->location['latitude'],
                    $request->location['longitude'],
                    $request->location
                );
            }

            // Record status update
            $dispatch->statusUpdates()->create([
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'updated_by' => auth()->id(),
                'notes' => $request->notes,
                'location' => $request->location,
            ]);

            // Send notifications for important status changes
            if (in_array($newStatus, ['acknowledged', 'at_pickup', 'patient_delivered', 'completed'])) {
                $this->notificationService->sendDispatchStatusUpdate($dispatch, $oldStatus, $newStatus);
            }

            DB::commit();

            return response()->json([
                'message' => 'Dispatch status updated successfully',
                'dispatch' => $dispatch->fresh(['ambulance', 'referral']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update dispatch status', [
                'dispatch_id' => $dispatch->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to update dispatch status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update dispatch location
     */
    public function updateLocation(Request $request, AmbulanceDispatch $dispatch): JsonResponse
    {
        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'speed' => 'nullable|numeric|min:0',
            'heading' => 'nullable|numeric|min:0|max:360',
            'accuracy' => 'nullable|numeric|min:0',
        ]);

        try {
            $dispatch->updateLocation(
                $request->latitude,
                $request->longitude,
                $request->only(['speed', 'heading', 'accuracy'])
            );

            return response()->json([
                'message' => 'Location updated successfully',
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update dispatch location', [
                'dispatch_id' => $dispatch->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to update location',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Record patient care data
     */
    public function recordPatientCare(Request $request, AmbulanceDispatch $dispatch): JsonResponse
    {
        $request->validate([
            'vital_signs' => 'nullable|array',
            'medications' => 'nullable|array',
            'procedures' => 'nullable|array',
            'complications' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        try {
            if ($request->vital_signs) {
                $dispatch->recordVitalSigns($request->vital_signs);
            }

            if ($request->medications) {
                foreach ($request->medications as $medication) {
                    $dispatch->recordMedicationAdministered($medication);
                }
            }

            if ($request->procedures) {
                foreach ($request->procedures as $procedure) {
                    $dispatch->recordProcedurePerformed($procedure);
                }
            }

            if ($request->complications) {
                foreach ($request->complications as $complication) {
                    $dispatch->recordComplication($complication);
                }
            }

            if ($request->notes) {
                $dispatch->update(['patient_care_notes' => $request->notes]);
            }

            return response()->json([
                'message' => 'Patient care data recorded successfully',
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to record patient care data', [
                'dispatch_id' => $dispatch->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to record patient care data',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get active dispatches for map view
     */
    public function getActiveDispatches(): JsonResponse
    {
        $dispatches = AmbulanceDispatch::active()
            ->with(['ambulance', 'referral.patient'])
            ->get()
            ->map(function ($dispatch) {
                return [
                    'id' => $dispatch->id,
                    'dispatch_number' => $dispatch->dispatch_number,
                    'ambulance' => [
                        'id' => $dispatch->ambulance->id,
                        'vehicle_number' => $dispatch->ambulance->vehicle_number,
                        'current_location' => $dispatch->ambulance->current_location,
                    ],
                    'status' => $dispatch->status,
                    'priority' => $dispatch->priority,
                    'pickup_location' => $dispatch->pickup_location,
                    'destination_location' => $dispatch->destination_location,
                    'patient_name' => $dispatch->referral?->patient?->full_name,
                    'dispatched_at' => $dispatch->dispatched_at,
                    'estimated_arrival_time' => $dispatch->estimated_arrival_time,
                ];
            });

        return response()->json($dispatches);
    }

    /**
     * Generate unique dispatch number
     */
    private function generateDispatchNumber(): string
    {
        $prefix = 'DISP';
        $date = now()->format('Ymd');
        $sequence = AmbulanceDispatch::whereDate('created_at', today())->count() + 1;
        
        return sprintf('%s-%s-%04d', $prefix, $date, $sequence);
    }

    /**
     * Get dispatch analytics
     */
    public function analytics(Request $request): JsonResponse
    {
        $startDate = $request->start_date ? \Carbon\Carbon::parse($request->start_date) : now()->subDays(30);
        $endDate = $request->end_date ? \Carbon\Carbon::parse($request->end_date) : now();

        $analytics = [
            'total_dispatches' => AmbulanceDispatch::whereBetween('dispatched_at', [$startDate, $endDate])->count(),
            'completed_dispatches' => AmbulanceDispatch::whereBetween('dispatched_at', [$startDate, $endDate])->where('status', 'completed')->count(),
            'cancelled_dispatches' => AmbulanceDispatch::whereBetween('dispatched_at', [$startDate, $endDate])->where('status', 'cancelled')->count(),
            'average_response_time' => AmbulanceDispatch::whereBetween('dispatched_at', [$startDate, $endDate])
                ->whereNotNull('acknowledged_at')
                ->selectRaw('AVG(TIMESTAMPDIFF(MINUTE, dispatched_at, acknowledged_at)) as avg_time')
                ->value('avg_time'),
            'average_transport_time' => AmbulanceDispatch::whereBetween('dispatched_at', [$startDate, $endDate])
                ->whereNotNull('patient_loaded_at')
                ->whereNotNull('patient_delivered_at')
                ->selectRaw('AVG(TIMESTAMPDIFF(MINUTE, patient_loaded_at, patient_delivered_at)) as avg_time')
                ->value('avg_time'),
            'dispatches_by_priority' => AmbulanceDispatch::whereBetween('dispatched_at', [$startDate, $endDate])
                ->selectRaw('priority, COUNT(*) as count')
                ->groupBy('priority')
                ->pluck('count', 'priority'),
            'dispatches_by_status' => AmbulanceDispatch::whereBetween('dispatched_at', [$startDate, $endDate])
                ->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
        ];

        return response()->json($analytics);
    }
}
