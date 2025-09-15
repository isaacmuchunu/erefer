<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreSpecialtyRequest;
use App\Http\Requests\UpdateSpecialtyRequest;
use App\Models\Specialty;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SpecialtyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $specialties = Specialty::query()
            ->when($request->category, fn($q, $category) => $q->where('category', $category))
            ->when($request->emergency_only, fn($q) => $q->where('emergency_specialty', true))
            ->when($request->search, function($q, $search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->paginate($request->per_page ?? 20);

        return response()->json($specialties);
    }

    public function store(StoreSpecialtyRequest $request): JsonResponse
    {
        $specialty = Specialty::create($request->validated());

        return response()->json([
            'message' => 'Specialty created successfully',
            'specialty' => $specialty
        ], 201);
    }

    public function show(Specialty $specialty): JsonResponse
    {
        return response()->json([
            'specialty' => $specialty->load([
                'facilities.facility',
                'doctors.doctor.user',
                'referrals' => fn($q) => $q->latest()->limit(10)
            ])
        ]);
    }

    public function update(UpdateSpecialtyRequest $request, Specialty $specialty): JsonResponse
    {
        $specialty->update($request->validated());

        return response()->json([
            'message' => 'Specialty updated successfully',
            'specialty' => $specialty
        ]);
    }

    public function destroy(Specialty $specialty): JsonResponse
    {
        if ($specialty->referrals()->exists()) {
            return response()->json([
                'message' => 'Cannot delete specialty with existing referrals'
            ], 422);
        }

        $specialty->delete();

        return response()->json([
            'message' => 'Specialty deleted successfully'
        ]);
    }

    public function availableFacilities(Specialty $specialty, Request $request): JsonResponse
    {
        $facilities = $specialty->facilities()
            ->with('facility')
            ->when($request->available_24_7, fn($q) => $q->where('available_24_7', true))
            ->when($request->location, function($q, $location) {
                // Add geographic filtering based on location
                $q->whereHas('facility', function($q) use ($location) {
                    $q->whereRaw("
                        ST_Distance_Sphere(
                            POINT(JSON_EXTRACT(address, '$.coordinates.lng'), JSON_EXTRACT(address, '$.coordinates.lat')),
                            POINT(?, ?)
                        ) <= ?
                    ", [$location['lng'], $location['lat'], $location['radius'] ?? 50000]);
                });
            })
            ->get();

        return response()->json($facilities);
    }
}

?>