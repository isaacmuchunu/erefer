<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use App\Models\EquipmentMaintenanceRecord;
use App\Services\EquipmentService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class EquipmentMaintenanceController extends Controller
{
    private $equipmentService;
    private $notificationService;

    public function __construct(EquipmentService $equipmentService, NotificationService $notificationService)
    {
        $this->equipmentService = $equipmentService;
        $this->notificationService = $notificationService;
    }

    /**
     * Display maintenance dashboard
     */
    public function index(Request $request): Response
    {
        $maintenanceRecords = EquipmentMaintenanceRecord::with(['equipment', 'scheduledBy', 'performedBy'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->when($request->equipment_id, fn($q) => $q->where('equipment_id', $request->equipment_id))
            ->orderBy('scheduled_date', 'desc')
            ->paginate(20);

        $stats = [
            'scheduled_maintenance' => EquipmentMaintenanceRecord::where('status', 'scheduled')->count(),
            'overdue_maintenance' => Equipment::overdueMaintenance()->count(),
            'in_progress_maintenance' => EquipmentMaintenanceRecord::where('status', 'in_progress')->count(),
            'equipment_out_of_service' => Equipment::outOfService()->count(),
        ];

        return Inertia::render('Equipment/Maintenance/Index', [
            'maintenanceRecords' => $maintenanceRecords,
            'stats' => $stats,
            'filters' => $request->only(['status', 'type', 'equipment_id']),
        ]);
    }

    /**
     * Show maintenance schedule
     */
    public function schedule(Request $request): Response
    {
        $equipmentNeedingMaintenance = Equipment::needingMaintenance()
            ->with(['facility', 'ambulance'])
            ->get();

        $overdueEquipment = Equipment::overdueMaintenance()
            ->with(['facility', 'ambulance'])
            ->get();

        $upcomingMaintenance = EquipmentMaintenanceRecord::where('status', 'scheduled')
            ->whereBetween('scheduled_date', [now(), now()->addDays(30)])
            ->with(['equipment'])
            ->orderBy('scheduled_date')
            ->get();

        return Inertia::render('Equipment/Maintenance/Schedule', [
            'equipmentNeedingMaintenance' => $equipmentNeedingMaintenance,
            'overdueEquipment' => $overdueEquipment,
            'upcomingMaintenance' => $upcomingMaintenance,
        ]);
    }

    /**
     * Schedule maintenance for equipment
     */
    public function scheduleMaintenance(Request $request): JsonResponse
    {
        $request->validate([
            'equipment_id' => 'required|exists:equipment,id',
            'type' => 'required|in:preventive,corrective,emergency,calibration,inspection',
            'scheduled_date' => 'required|date|after:now',
            'description' => 'required|string|max:1000',
            'estimated_duration_hours' => 'nullable|numeric|min:0.5|max:168',
            'assigned_technician' => 'nullable|exists:users,id',
            'priority' => 'required|in:low,normal,high,critical',
            'parts_required' => 'nullable|array',
            'tools_required' => 'nullable|array',
            'safety_requirements' => 'nullable|array',
        ]);

        try {
            DB::beginTransaction();

            $equipment = Equipment::findOrFail($request->equipment_id);

            $maintenanceRecord = $equipment->scheduleMaintenance(
                \DateTime::createFromFormat('Y-m-d H:i:s', $request->scheduled_date),
                $request->type,
                $request->description
            );

            $maintenanceRecord->update([
                'estimated_duration_hours' => $request->estimated_duration_hours,
                'assigned_technician' => $request->assigned_technician,
                'priority' => $request->priority,
                'parts_required' => $request->parts_required,
                'tools_required' => $request->tools_required,
                'safety_requirements' => $request->safety_requirements,
            ]);

            // Send notification to assigned technician
            if ($request->assigned_technician) {
                $this->notificationService->sendMaintenanceScheduledNotification($maintenanceRecord);
            }

            DB::commit();

            Log::info('Maintenance scheduled', [
                'equipment_id' => $equipment->id,
                'maintenance_id' => $maintenanceRecord->id,
                'scheduled_by' => auth()->id(),
            ]);

            return response()->json([
                'message' => 'Maintenance scheduled successfully',
                'maintenance_record' => $maintenanceRecord->load(['equipment', 'assignedTechnician']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to schedule maintenance', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Failed to schedule maintenance',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Start maintenance work
     */
    public function startMaintenance(Request $request, EquipmentMaintenanceRecord $maintenanceRecord): JsonResponse
    {
        $request->validate([
            'notes' => 'nullable|string',
            'actual_start_time' => 'nullable|date',
        ]);

        try {
            if ($maintenanceRecord->status !== 'scheduled') {
                return response()->json([
                    'message' => 'Maintenance can only be started from scheduled status',
                ], 422);
            }

            $maintenanceRecord->update([
                'status' => 'in_progress',
                'actual_start_time' => $request->actual_start_time ?? now(),
                'performed_by' => auth()->id(),
                'notes' => $request->notes,
            ]);

            // Update equipment status
            $maintenanceRecord->equipment->update(['status' => 'under_maintenance']);

            return response()->json([
                'message' => 'Maintenance started successfully',
                'maintenance_record' => $maintenanceRecord->fresh(['equipment', 'performedBy']),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to start maintenance', [
                'maintenance_id' => $maintenanceRecord->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to start maintenance',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Complete maintenance work
     */
    public function completeMaintenance(Request $request, EquipmentMaintenanceRecord $maintenanceRecord): JsonResponse
    {
        $request->validate([
            'completion_notes' => 'required|string',
            'parts_used' => 'nullable|array',
            'cost' => 'nullable|numeric|min:0',
            'next_maintenance_due' => 'nullable|date|after:now',
            'equipment_condition' => 'required|in:excellent,good,fair,poor',
            'work_performed' => 'required|array',
            'issues_found' => 'nullable|array',
            'recommendations' => 'nullable|string',
            'return_to_service' => 'required|boolean',
        ]);

        try {
            DB::beginTransaction();

            if ($maintenanceRecord->status !== 'in_progress') {
                return response()->json([
                    'message' => 'Maintenance can only be completed from in-progress status',
                ], 422);
            }

            $maintenanceRecord->update([
                'status' => 'completed',
                'actual_completion_time' => now(),
                'completion_notes' => $request->completion_notes,
                'parts_used' => $request->parts_used,
                'cost' => $request->cost,
                'work_performed' => $request->work_performed,
                'issues_found' => $request->issues_found,
                'recommendations' => $request->recommendations,
            ]);

            // Update equipment
            $equipment = $maintenanceRecord->equipment;
            $equipment->update([
                'condition' => $request->equipment_condition,
                'last_maintenance' => now(),
            ]);

            if ($request->next_maintenance_due) {
                $equipment->update(['next_maintenance_due' => $request->next_maintenance_due]);
            }

            // Return equipment to service if requested
            if ($request->return_to_service) {
                $equipment->returnToService();
            }

            // Send completion notification
            $this->notificationService->sendMaintenanceCompletedNotification($maintenanceRecord);

            DB::commit();

            Log::info('Maintenance completed', [
                'maintenance_id' => $maintenanceRecord->id,
                'equipment_id' => $equipment->id,
                'completed_by' => auth()->id(),
            ]);

            return response()->json([
                'message' => 'Maintenance completed successfully',
                'maintenance_record' => $maintenanceRecord->fresh(['equipment', 'performedBy']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to complete maintenance', [
                'maintenance_id' => $maintenanceRecord->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to complete maintenance',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel scheduled maintenance
     */
    public function cancelMaintenance(Request $request, EquipmentMaintenanceRecord $maintenanceRecord): JsonResponse
    {
        $request->validate([
            'cancellation_reason' => 'required|string|max:500',
        ]);

        try {
            if (!in_array($maintenanceRecord->status, ['scheduled', 'in_progress'])) {
                return response()->json([
                    'message' => 'Only scheduled or in-progress maintenance can be cancelled',
                ], 422);
            }

            $maintenanceRecord->update([
                'status' => 'cancelled',
                'cancellation_reason' => $request->cancellation_reason,
                'cancelled_by' => auth()->id(),
                'cancelled_at' => now(),
            ]);

            // If equipment was under maintenance, return it to operational status
            if ($maintenanceRecord->equipment->status === 'under_maintenance') {
                $maintenanceRecord->equipment->returnToService();
            }

            return response()->json([
                'message' => 'Maintenance cancelled successfully',
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to cancel maintenance', [
                'maintenance_id' => $maintenanceRecord->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to cancel maintenance',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get maintenance history for equipment
     */
    public function getMaintenanceHistory(Equipment $equipment): JsonResponse
    {
        $history = $equipment->getMaintenanceHistory(50);
        
        return response()->json([
            'maintenance_history' => $history,
            'statistics' => $equipment->getMaintenanceCosts(),
        ]);
    }

    /**
     * Generate maintenance report
     */
    public function generateReport(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'facility_id' => 'nullable|exists:facilities,id',
            'equipment_type' => 'nullable|string',
            'maintenance_type' => 'nullable|string',
        ]);

        try {
            $report = $this->equipmentService->generateMaintenanceReport([
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'facility_id' => $request->facility_id,
                'equipment_type' => $request->equipment_type,
                'maintenance_type' => $request->maintenance_type,
            ]);

            return response()->json([
                'report' => $report,
                'generated_at' => now()->toISOString(),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to generate maintenance report', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Failed to generate report',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get maintenance alerts
     */
    public function getMaintenanceAlerts(): JsonResponse
    {
        $overdueEquipment = Equipment::overdueMaintenance()
            ->with(['facility', 'ambulance'])
            ->get()
            ->map(function ($equipment) {
                return [
                    'id' => $equipment->id,
                    'name' => $equipment->name,
                    'type' => 'overdue_maintenance',
                    'severity' => 'critical',
                    'message' => "Maintenance overdue for {$equipment->name}",
                    'due_date' => $equipment->next_maintenance_due,
                    'facility' => $equipment->facility?->name,
                    'ambulance' => $equipment->ambulance?->vehicle_number,
                ];
            });

        $upcomingMaintenance = Equipment::needingMaintenance()
            ->with(['facility', 'ambulance'])
            ->get()
            ->map(function ($equipment) {
                return [
                    'id' => $equipment->id,
                    'name' => $equipment->name,
                    'type' => 'upcoming_maintenance',
                    'severity' => 'warning',
                    'message' => "Maintenance due soon for {$equipment->name}",
                    'due_date' => $equipment->next_maintenance_due,
                    'facility' => $equipment->facility?->name,
                    'ambulance' => $equipment->ambulance?->vehicle_number,
                ];
            });

        $certificationExpiring = Equipment::certificationExpiring()
            ->with(['facility', 'ambulance'])
            ->get()
            ->map(function ($equipment) {
                return [
                    'id' => $equipment->id,
                    'name' => $equipment->name,
                    'type' => 'certification_expiring',
                    'severity' => 'warning',
                    'message' => "Certification expiring for {$equipment->name}",
                    'expiry_date' => $equipment->certification_expiry,
                    'facility' => $equipment->facility?->name,
                    'ambulance' => $equipment->ambulance?->vehicle_number,
                ];
            });

        $alerts = $overdueEquipment
            ->concat($upcomingMaintenance)
            ->concat($certificationExpiring)
            ->sortBy('due_date')
            ->values();

        return response()->json([
            'alerts' => $alerts,
            'summary' => [
                'overdue_count' => $overdueEquipment->count(),
                'upcoming_count' => $upcomingMaintenance->count(),
                'certification_expiring_count' => $certificationExpiring->count(),
            ],
        ]);
    }
}
