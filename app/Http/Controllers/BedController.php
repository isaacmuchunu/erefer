<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreBedRequest;
use App\Http\Requests\UpdateBedRequest;
use App\Http\Resources\BedResource;
use App\Models\Bed;
use App\Models\BedReservation;
use App\Services\BedService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;

class BedController extends Controller
{
    public function __construct(
        private BedService $bedService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $beds = Bed::query()
            ->with(['facility', 'department', 'bedType'])
            ->when($request->facility_id, fn($q, $id) => $q->where('facility_id', $id))
            ->when($request->department_id, fn($q, $id) => $q->where('department_id', $id))
            ->when($request->bed_type_id, fn($q, $id) => $q->where('bed_type_id', $id))
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->available_only, fn($q) => $q->where('status', 'available'))
            ->paginate($request->per_page ?? 20);

        return response()->json($beds);
    }

    public function store(StoreBedRequest $request): JsonResponse
    {
        $bed = $this->bedService->create($request->validated());

        return response()->json([
            'message' => 'Bed created successfully',
            'bed' => $bed->load(['facility', 'department', 'bedType'])
        ], 201);
    }

    public function show(Bed $bed): JsonResponse
    {
        return response()->json([
            'bed' => $bed->load([
                'facility',
                'department',
                'bedType',
                'currentReservation.patient',
                'reservationHistory' => fn($q) => $q->latest()->limit(10)
            ])
        ]);
    }

    public function edit(Bed $bed)
    {
        return Inertia::render('beds/edit', [
            'bed' => new BedResource($bed->load(['facility', 'department', 'bedType']))
        ]);
    }

    public function update(UpdateBedRequest $request, Bed $bed): JsonResponse
    {
        $bed = $this->bedService->update($bed, $request->validated());

        return response()->json([
            'message' => 'Bed updated successfully',
            'bed' => $bed->load(['facility', 'department', 'bedType'])
        ]);
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'stats' => [
                'total_beds' => Bed::count(),
                'available_beds' => Bed::where('status', 'available')->count(),
                'occupied_beds' => Bed::where('status', 'occupied')->count(),
                'maintenance_beds' => Bed::where('status', 'maintenance')->count(),
            ]
        ]);
    }

    public function destroy(Bed $bed): JsonResponse
    {
        $this->bedService->delete($bed);

        return response()->json([
            'message' => 'Bed deleted successfully'
        ]);
    }

    public function reserve(Request $request, Bed $bed): JsonResponse
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'reserved_until' => 'required|date|after:now',
            'reason' => 'nullable|string'
        ]);

        $reservation = $this->bedService->reserve($bed, $request->validated());

        return response()->json([
            'message' => 'Bed reserved successfully',
            'reservation' => $reservation->load('patient')
        ]);
    }

    public function cancelReservation(BedReservation $reservation): JsonResponse
    {
        $this->bedService->cancelReservation($reservation);

        return response()->json([
            'message' => 'Reservation cancelled successfully'
        ]);
    }

    public function availability(Request $request): JsonResponse
    {
        $availability = $this->bedService->getAvailability($request->all());

        return response()->json($availability);
    }
}


?>