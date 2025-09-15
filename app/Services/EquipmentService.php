<?php
namespace App\Services;

use App\Models\Equipment;
use App\Models\EquipmentMaintenanceRecord;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class EquipmentService
{
    /**
     * Create a new equipment record
     *
     * @param array $data
     * @return Equipment
     */
    public function create(array $data): Equipment
    {
        return Equipment::create($data);
    }

    /**
     * Update an existing equipment record
     *
     * @param Equipment $equipment
     * @param array $data
     * @return Equipment
     */
    public function update(Equipment $equipment, array $data): Equipment
    {
        $equipment->update($data);
        return $equipment->fresh();
    }

    /**
     * Delete an equipment record
     *
     * @param Equipment $equipment
     * @return bool
     */
    public function delete(Equipment $equipment): bool
    {
        return $equipment->delete();
    }

    /**
     * Update equipment status
     *
     * @param Equipment $equipment
     * @param array $data
     * @return Equipment
     */
    public function updateStatus(Equipment $equipment, array $data): Equipment
    {
        $equipment->update([
            'status' => $data['status'],
            'notes' => $data['notes'] ?? null,
        ]);

        return $equipment->fresh();
    }

    /**
     * Schedule maintenance for equipment
     *
     * @param Equipment $equipment
     * @param array $data
     * @return EquipmentMaintenanceRecord
     */
    public function scheduleMaintenance(Equipment $equipment, array $data): EquipmentMaintenanceRecord
    {
        $maintenance = $equipment->scheduleMaintenance(
            new \DateTime($data['maintenance_date']),
            $data['maintenance_type'],
            $data['notes'] ?? null
        );

        // Update next maintenance due date if this is scheduled for earlier
        if (!$equipment->next_maintenance_due || Carbon::parse($data['maintenance_date'])->lt($equipment->next_maintenance_due)) {
            $equipment->update([
                'next_maintenance_due' => $data['maintenance_date']
            ]);
        }

        return $maintenance;
    }

    /**
     * Get maintenance calendar for equipment
     *
     * @param int|null $facilityId
     * @param string|null $dateFrom
     * @param string|null $dateTo
     * @return array
     */
    public function getMaintenanceCalendar(?int $facilityId = null, ?string $dateFrom = null, ?string $dateTo = null): array
    {
        $query = EquipmentMaintenanceRecord::query()
            ->with(['equipment' => function($q) {
                $q->with(['facility', 'department']);
            }])
            ->where('status', 'scheduled');

        if ($facilityId) {
            $query->whereHas('equipment', function($q) use ($facilityId) {
                $q->where('facility_id', $facilityId);
            });
        }

        if ($dateFrom) {
            $query->where('maintenance_date', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->where('maintenance_date', '<=', $dateTo);
        }

        return $query->orderBy('maintenance_date')->get()->toArray();
    }

    /**
     * Get equipment dashboard data
     */
    public function getDashboardData(array $filters = []): array
    {
        $query = Equipment::query();

        // Apply filters
        if (isset($filters['facility_id'])) {
            $query->where('facility_id', $filters['facility_id']);
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $totalEquipment = $query->count();
        $operationalEquipment = (clone $query)->where('status', 'operational')->count();
        $underMaintenanceEquipment = (clone $query)->where('status', 'under_maintenance')->count();
        $outOfServiceEquipment = (clone $query)->where('status', 'out_of_service')->count();

        // Equipment needing maintenance
        $needingMaintenance = Equipment::needingMaintenance()->count();
        $overdueMaintenance = Equipment::overdueMaintenance()->count();

        // Certification expiring
        $certificationExpiring = Equipment::certificationExpiring()->count();

        // Equipment by type
        $equipmentByType = Equipment::selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->pluck('count', 'type');

        // Equipment by condition
        $equipmentByCondition = Equipment::selectRaw('condition, COUNT(*) as count')
            ->groupBy('condition')
            ->pluck('count', 'condition');

        // Recent maintenance activities
        $recentMaintenance = EquipmentMaintenanceRecord::with(['equipment', 'performedBy'])
            ->where('status', 'completed')
            ->orderBy('actual_completion_time', 'desc')
            ->limit(10)
            ->get();

        return [
            'stats' => [
                'total_equipment' => $totalEquipment,
                'operational' => $operationalEquipment,
                'under_maintenance' => $underMaintenanceEquipment,
                'out_of_service' => $outOfServiceEquipment,
                'needing_maintenance' => $needingMaintenance,
                'overdue_maintenance' => $overdueMaintenance,
                'certification_expiring' => $certificationExpiring,
                'operational_rate' => $totalEquipment > 0 ? ($operationalEquipment / $totalEquipment) * 100 : 0,
            ],
            'charts' => [
                'equipment_by_type' => $equipmentByType,
                'equipment_by_condition' => $equipmentByCondition,
            ],
            'recent_maintenance' => $recentMaintenance,
        ];
    }

    /**
     * Generate maintenance report
     */
    public function generateMaintenanceReport(array $parameters): array
    {
        $startDate = Carbon::parse($parameters['start_date']);
        $endDate = Carbon::parse($parameters['end_date']);

        $query = EquipmentMaintenanceRecord::with(['equipment', 'performedBy'])
            ->whereBetween('actual_completion_time', [$startDate, $endDate])
            ->where('status', 'completed');

        // Apply filters
        if (isset($parameters['facility_id'])) {
            $query->whereHas('equipment', function ($q) use ($parameters) {
                $q->where('facility_id', $parameters['facility_id']);
            });
        }

        if (isset($parameters['equipment_type'])) {
            $query->whereHas('equipment', function ($q) use ($parameters) {
                $q->where('type', $parameters['equipment_type']);
            });
        }

        if (isset($parameters['maintenance_type'])) {
            $query->where('type', $parameters['maintenance_type']);
        }

        $maintenanceRecords = $query->get();

        // Calculate metrics
        $totalMaintenance = $maintenanceRecords->count();
        $totalCost = $maintenanceRecords->sum('cost');
        $averageCost = $totalMaintenance > 0 ? $totalCost / $totalMaintenance : 0;
        $averageDuration = $maintenanceRecords->avg('actual_duration_hours');

        // Maintenance by type
        $maintenanceByType = $maintenanceRecords->groupBy('type')
            ->map(function ($records) {
                return [
                    'count' => $records->count(),
                    'cost' => $records->sum('cost'),
                    'avg_duration' => $records->avg('actual_duration_hours'),
                ];
            });

        return [
            'period' => [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'days' => $startDate->diffInDays($endDate) + 1,
            ],
            'summary' => [
                'total_maintenance' => $totalMaintenance,
                'total_cost' => $totalCost,
                'average_cost' => $averageCost,
                'average_duration_hours' => $averageDuration,
            ],
            'breakdowns' => [
                'by_type' => $maintenanceByType,
            ],
            'records' => $maintenanceRecords->map(function ($record) {
                return [
                    'id' => $record->id,
                    'equipment_name' => $record->equipment->name,
                    'type' => $record->type,
                    'completion_date' => $record->actual_completion_time,
                    'duration_hours' => $record->actual_duration_hours,
                    'cost' => $record->cost,
                    'performed_by' => $record->performedBy?->name,
                ];
            }),
        ];
    }
}