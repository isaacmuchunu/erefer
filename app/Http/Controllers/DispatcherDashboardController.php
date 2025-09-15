<?php

namespace App\Http\Controllers;

use App\Models\Ambulance;
use App\Models\Dispatch;
use App\Models\EmergencyBroadcast;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DispatcherDashboardController extends Controller
{
    /**
     * Display the dispatcher dashboard
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        // Check if user is a dispatcher
        if ($user->role !== 'dispatcher') {
            abort(403, 'Access denied. Dispatcher role required.');
        }

        // Get dashboard data
        $dashboardData = $this->getDashboardData();

        return Inertia::render('dispatcher/dashboard', [
            'dashboardData' => $dashboardData,
            'userPermissions' => [
                'canDispatchAmbulances' => Gate::allows('dispatch-ambulances'),
                'canSendEmergencyAlerts' => Gate::allows('send-emergency-broadcasts'),
                'canManageAmbulances' => Gate::allows('manage-ambulances'),
                'canViewAllDispatches' => Gate::allows('view-all-dispatches'),
                'canAccessEmergencyComms' => Gate::allows('access-emergency-communications'),
            ],
        ]);
    }

    /**
     * Get comprehensive dashboard data for dispatchers
     */
    private function getDashboardData(): array
    {
        // Active dispatches
        $activeDispatches = Dispatch::with(['ambulance', 'patient', 'assignedBy'])
            ->whereIn('status', ['pending', 'assigned', 'en_route', 'on_scene'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($dispatch) {
                return [
                    'id' => $dispatch->id,
                    'priority' => $dispatch->priority,
                    'status' => $dispatch->status,
                    'patient' => [
                        'id' => $dispatch->patient->id ?? null,
                        'name' => $dispatch->patient->full_name ?? 'Unknown',
                        'age' => $dispatch->patient->age ?? null,
                        'condition' => $dispatch->medical_condition,
                    ],
                    'ambulance' => $dispatch->ambulance ? [
                        'id' => $dispatch->ambulance->id,
                        'call_sign' => $dispatch->ambulance->call_sign,
                        'type' => $dispatch->ambulance->type,
                        'current_location' => $dispatch->ambulance->current_location,
                    ] : null,
                    'location' => [
                        'pickup' => $dispatch->pickup_location,
                        'destination' => $dispatch->destination_location,
                    ],
                    'times' => [
                        'created' => $dispatch->created_at,
                        'assigned' => $dispatch->assigned_at,
                        'dispatched' => $dispatch->dispatched_at,
                        'eta' => $dispatch->estimated_arrival_time,
                    ],
                    'assigned_by' => $dispatch->assignedBy ? [
                        'id' => $dispatch->assignedBy->id,
                        'name' => $dispatch->assignedBy->full_name,
                    ] : null,
                ];
            });

        // Available ambulances
        $availableAmbulances = Ambulance::with(['currentCrew'])
            ->where('status', 'available')
            ->where('is_active', true)
            ->get()
            ->map(function ($ambulance) {
                return [
                    'id' => $ambulance->id,
                    'call_sign' => $ambulance->call_sign,
                    'type' => $ambulance->type,
                    'status' => $ambulance->status,
                    'current_location' => $ambulance->current_location,
                    'last_location_update' => $ambulance->last_location_update,
                    'crew' => $ambulance->currentCrew->map(function ($member) {
                        return [
                            'id' => $member->id,
                            'name' => $member->full_name,
                            'role' => $member->role,
                        ];
                    }),
                    'equipment_status' => $ambulance->equipment_status,
                    'fuel_level' => $ambulance->fuel_level,
                ];
            });

        // Emergency alerts (recent)
        $emergencyAlerts = EmergencyBroadcast::with(['sender'])
            ->where('severity', 'critical')
            ->where('created_at', '>=', now()->subHours(24))
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($alert) {
                return [
                    'id' => $alert->id,
                    'title' => $alert->title,
                    'message' => $alert->message,
                    'severity' => $alert->severity,
                    'type' => $alert->type,
                    'created_at' => $alert->created_at,
                    'sender' => [
                        'id' => $alert->sender->id,
                        'name' => $alert->sender->full_name,
                        'role' => $alert->sender->role,
                    ],
                    'is_active' => $alert->is_active,
                ];
            });

        // Performance metrics
        $metrics = $this->getPerformanceMetrics();

        // Recent activity
        $recentActivity = AuditLog::with(['user'])
            ->whereIn('action', [
                'dispatch.created',
                'dispatch.assigned',
                'ambulance.status.updated',
                'emergency.broadcast.sent'
            ])
            ->where('created_at', '>=', now()->subHours(12))
            ->orderBy('created_at', 'desc')
            ->limit(15)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'description' => $log->description,
                    'user' => $log->user ? [
                        'id' => $log->user->id,
                        'name' => $log->user->full_name,
                        'role' => $log->user->role,
                    ] : null,
                    'created_at' => $log->created_at,
                    'time_ago' => $log->created_at->diffForHumans(),
                ];
            });

        return [
            'active_dispatches' => $activeDispatches,
            'available_ambulances' => $availableAmbulances,
            'emergency_alerts' => $emergencyAlerts,
            'metrics' => $metrics,
            'recent_activity' => $recentActivity,
            'last_updated' => now(),
        ];
    }

    /**
     * Get performance metrics for the dashboard
     */
    private function getPerformanceMetrics(): array
    {
        $today = now()->startOfDay();
        $thisWeek = now()->startOfWeek();
        $thisMonth = now()->startOfMonth();

        return [
            'dispatches' => [
                'today' => Dispatch::whereDate('created_at', $today)->count(),
                'this_week' => Dispatch::where('created_at', '>=', $thisWeek)->count(),
                'this_month' => Dispatch::where('created_at', '>=', $thisMonth)->count(),
                'pending' => Dispatch::where('status', 'pending')->count(),
                'active' => Dispatch::whereIn('status', ['assigned', 'en_route', 'on_scene'])->count(),
            ],
            'ambulances' => [
                'total' => Ambulance::where('is_active', true)->count(),
                'available' => Ambulance::where('status', 'available')->where('is_active', true)->count(),
                'busy' => Ambulance::whereIn('status', ['dispatched', 'en_route', 'on_scene'])->count(),
                'maintenance' => Ambulance::where('status', 'maintenance')->count(),
                'out_of_service' => Ambulance::where('status', 'out_of_service')->count(),
            ],
            'response_times' => [
                'average_today' => $this->getAverageResponseTime($today),
                'average_week' => $this->getAverageResponseTime($thisWeek),
                'target' => 8, // 8 minutes target
            ],
            'emergency_alerts' => [
                'today' => EmergencyBroadcast::whereDate('created_at', $today)->count(),
                'active' => EmergencyBroadcast::active()->count(),
                'critical' => EmergencyBroadcast::where('severity', 'critical')
                    ->where('created_at', '>=', $today)
                    ->count(),
            ],
        ];
    }

    /**
     * Calculate average response time
     */
    private function getAverageResponseTime($since): float
    {
        $dispatches = Dispatch::where('created_at', '>=', $since)
            ->whereNotNull('assigned_at')
            ->whereNotNull('dispatched_at')
            ->get();

        if ($dispatches->isEmpty()) {
            return 0;
        }

        $totalMinutes = $dispatches->sum(function ($dispatch) {
            return $dispatch->created_at->diffInMinutes($dispatch->dispatched_at);
        });

        return round($totalMinutes / $dispatches->count(), 1);
    }

    /**
     * Get real-time dashboard updates via API
     */
    public function getUpdates(Request $request)
    {
        $user = Auth::user();

        // Check if user is a dispatcher
        if ($user->role !== 'dispatcher') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Dispatcher role required.'
            ], 403);
        }

        $dashboardData = $this->getDashboardData();

        return response()->json([
            'success' => true,
            'data' => $dashboardData,
            'timestamp' => now(),
        ]);
    }

    /**
     * Quick dispatch action
     */
    public function quickDispatch(Request $request)
    {
        $request->validate([
            'ambulance_id' => 'required|exists:ambulances,id',
            'priority' => 'required|in:low,normal,high,urgent',
            'pickup_location' => 'required|string|max:500',
            'destination_location' => 'required|string|max:500',
            'medical_condition' => 'required|string|max:1000',
            'patient_name' => 'nullable|string|max:255',
            'patient_age' => 'nullable|integer|min:0|max:150',
            'special_instructions' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();

        // Check permissions
        if (!Gate::allows('dispatch-ambulances')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to dispatch ambulances'
            ], 403);
        }

        try {
            DB::beginTransaction();

            // Create dispatch record
            $dispatch = Dispatch::create([
                'ambulance_id' => $request->ambulance_id,
                'priority' => $request->priority,
                'status' => 'assigned',
                'pickup_location' => $request->pickup_location,
                'destination_location' => $request->destination_location,
                'medical_condition' => $request->medical_condition,
                'patient_name' => $request->patient_name,
                'patient_age' => $request->patient_age,
                'special_instructions' => $request->special_instructions,
                'assigned_by' => $user->id,
                'assigned_at' => now(),
                'estimated_arrival_time' => now()->addMinutes(15), // Default 15 min ETA
            ]);

            // Update ambulance status
            $ambulance = Ambulance::findOrFail($request->ambulance_id);
            $ambulance->update([
                'status' => 'dispatched',
                'current_dispatch_id' => $dispatch->id,
            ]);

            // Log the dispatch
            AuditLog::logActivity(
                'dispatch.created',
                $dispatch,
                [],
                $dispatch->toArray(),
                "Emergency dispatch created for ambulance {$ambulance->call_sign}",
                'info',
                ['dispatch', 'emergency', 'ambulance']
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $dispatch->load(['ambulance']),
                'message' => 'Ambulance dispatched successfully'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error creating quick dispatch: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to dispatch ambulance',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
