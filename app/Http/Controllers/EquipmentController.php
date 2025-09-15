<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreEquipmentRequest;
use App\Http\Requests\UpdateEquipmentRequest;
use App\Models\Equipment;
use App\Services\EquipmentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EquipmentController extends Controller
{
    public function __construct(
        private EquipmentService $equipmentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $equipment = Equipment::query()
            ->with(['facility', 'department'])
            ->when($request->facility_id, fn($q, $id) => $q->where('facility_id', $id))
            ->when($request->department_id, fn($q, $id) => $q->where('department_id', $id))
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->available_only, fn($q) => $q->where('status', 'available'))
            ->when($request->maintenance_due, function($q) {
                $q->where('next_maintenance_due', '<=', now()->addDays(30));
            })
            ->when($request->search, function($q, $search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('serial_number', 'like', "%{$search}%");
            })
            ->paginate($request->per_page ?? 20);

        return response()->json($equipment);
    }

    public function store(StoreEquipmentRequest $request): JsonResponse
    {
        $equipment = $this->equipmentService->create($request->validated());

        return response()->json([
            'message' => 'Equipment created successfully',
            'equipment' => $equipment->load(['facility', 'department'])
        ], 201);
    }

    public function show(Equipment $equipment): JsonResponse
    {
        return response()->json([
            'equipment' => $equipment->load([
                'facility',
                'department',
                'maintenanceHistory' => fn($q) => $q->latest()->limit(10)
            ])
        ]);
    }

    public function update(UpdateEquipmentRequest $request, Equipment $equipment): JsonResponse
    {
        $equipment = $this->equipmentService->update($equipment, $request->validated());

        return response()->json([
            'message' => 'Equipment updated successfully',
            'equipment' => $equipment->load(['facility', 'department'])
        ]);
    }
    
    public function edit(Equipment $equipment)
    {
        return inertia('equipment/edit', [
            'equipment' => $equipment->load(['facility', 'department'])
        ]);
    }

    public function destroy(Equipment $equipment): JsonResponse
    {
        $this->equipmentService->delete($equipment);

        return response()->json([
            'message' => 'Equipment deleted successfully'
        ]);
    }

    public function updateStatus(Request $request, Equipment $equipment): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:available,in_use,maintenance,out_of_order',
            'notes' => 'nullable|string'
        ]);

        $equipment = $this->equipmentService->updateStatus($equipment, $request->validated());

        return response()->json([
            'message' => 'Equipment status updated successfully',
            'equipment' => $equipment
        ]);
    }

    public function scheduleMaintenance(Request $request, Equipment $equipment): JsonResponse
    {
        $request->validate([
            'maintenance_date' => 'required|date|after:today',
            'maintenance_type' => 'required|string',
            'notes' => 'nullable|string'
        ]);

        $maintenance = $this->equipmentService->scheduleMaintenance($equipment, $request->validated());

        return response()->json([
            'message' => 'Maintenance scheduled successfully',
            'maintenance' => $maintenance
        ]);
    }

    public function maintenanceCalendar(Request $request): JsonResponse
    {
        $calendar = $this->equipmentService->getMaintenanceCalendar(
            $request->facility_id,
            $request->date_from,
            $request->date_to
        );

        return response()->json($calendar);
    }

    public function stats(Request $request): JsonResponse
    {
        $stats = Equipment::query()
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
                SUM(CASE WHEN status = 'in_use' THEN 1 ELSE 0 END) as in_use,
                SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
                SUM(CASE WHEN status = 'out_of_order' THEN 1 ELSE 0 END) as out_of_order
            ")
            ->when($request->facility_id, fn($q, $id) => $q->where('facility_id', $id))
            ->when($request->department_id, fn($q, $id) => $q->where('department_id', $id))
            ->first();

        return response()->json($stats);
    }
}

?>