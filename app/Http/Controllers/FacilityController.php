<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFacilityRequest;
use App\Http\Requests\UpdateFacilityRequest;
use App\Models\Facility;
use App\Services\FacilityService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class FacilityController extends Controller
{
    public function __construct(
        private FacilityService $facilityService
    ) {}

    public function index(Request $request): JsonResponse|Response
    {
        $facilities = Facility::query()
            ->with(['departments', 'specialties', 'beds'])
            ->when($request->search, fn($q, $search) => $q->search($search))
            ->when($request->type, fn($q, $type) => $q->byType($type))
            ->when($request->level, fn($q, $level) => $q->where('level', $level))
            ->when($request->city, fn($q, $city) => $q->byCity($city))
            ->when($request->state, fn($q, $state) => $q->byState($state))
            ->when($request->verified_only, fn($q) => $q->verified())
            ->when($request->active_only, fn($q) => $q->active())
            ->when($request->emergency_services, fn($q) => $q->withEmergencyServices())
            ->when($request->ambulance_services, fn($q) => $q->withAmbulanceServices())
            ->when($request->accepts_referrals, fn($q) => $q->acceptingReferrals())
            ->when($request->available_beds, fn($q) => $q->withAvailableBeds())
            ->when($request->high_capacity, fn($q) => $q->highCapacity())
            ->when($request->low_occupancy, fn($q) => $q->lowOccupancy())
            ->when($request->specialty, fn($q, $specialty) => $q->withSpecialty($specialty))
            ->when($request->latitude && $request->longitude, function($q) use ($request) {
                return $q->nearby($request->latitude, $request->longitude, $request->radius ?? 50);
            })
            ->orderBy($request->sort_by ?? 'name', $request->sort_direction ?? 'asc')
            ->paginate($request->per_page ?? 15);

        // Append computed attributes
        $facilities->getCollection()->transform(function ($facility) {
            $facility->append([
                'is_verified',
                'occupancy_rate',
                'coordinates'
            ]);
            return $facility;
        });

        if ($request->wantsJson()) {
            return response()->json($facilities);
        }

        return Inertia::render('facilities/index', [
            'facilities' => $facilities,
            'filters' => $request->only([
                'search', 'type', 'level', 'city', 'state', 'verified_only',
                'active_only', 'emergency_services', 'ambulance_services',
                'accepts_referrals', 'available_beds', 'high_capacity',
                'low_occupancy', 'specialty', 'sort_by', 'sort_direction'
            ]),
            'stats' => [
                'total_facilities' => Facility::count(),
                'verified_facilities' => Facility::verified()->count(),
                'emergency_ready' => Facility::withEmergencyServices()->count(),
                'accepting_referrals' => Facility::acceptingReferrals()->count(),
                'total_beds' => Facility::sum('total_beds'),
                'available_beds' => Facility::sum('available_beds'),
                'average_occupancy' => Facility::avg('occupancy_rate') ?? 0,
            ]
        ]);
    }

    public function store(StoreFacilityRequest $request): JsonResponse
    {
        $facility = $this->facilityService->createFacility($request->validated());

        return response()->json([
            'message' => 'Facility created successfully',
            'facility' => $facility->load(['departments', 'specialties'])
        ], 201);
    }

    public function show(Facility $facility): JsonResponse
    {
        $facility->load([
            'departments',
            'specialties',
            'doctors',
            'beds',
            'ambulances',
            'equipment',
            'referralsReceived' => fn($q) => $q->latest()->limit(10),
            'referralsSent' => fn($q) => $q->latest()->limit(10)
        ]);

        $facility->append([
            'is_verified',
            'occupancy_rate',
            'coordinates'
        ]);

        return response()->json([
            'facility' => $facility,
            'stats' => [
                'total_referrals_received' => $facility->referralsReceived()->count(),
                'total_referrals_sent' => $facility->referralsSent()->count(),
                'pending_referrals' => $facility->referralsReceived()->where('status', 'pending')->count(),
                'accepted_referrals' => $facility->referralsReceived()->where('status', 'accepted')->count(),
                'bed_utilization' => $facility->occupancy_rate,
                'departments_count' => $facility->departments()->count(),
                'doctors_count' => $facility->doctors()->count(),
                'equipment_count' => $facility->equipment()->count(),
            ]
        ]);
    }

    public function update(UpdateFacilityRequest $request, Facility $facility): JsonResponse
    {
        $facility = $this->facilityService->updateFacility($facility, $request->validated());

        return response()->json([
            'message' => 'Facility updated successfully',
            'facility' => $facility->load(['departments', 'specialties'])
        ]);
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'stats' => [
                'total_facilities' => Facility::count(),
                'verified_facilities' => Facility::verified()->count(),
                'emergency_ready' => Facility::withEmergencyServices()->count(),
                'accepting_referrals' => Facility::acceptingReferrals()->count(),
                'total_beds' => Facility::sum('total_beds'),
                'available_beds' => Facility::sum('available_beds'),
                'average_occupancy' => Facility::avg('occupancy_rate') ?? 0,
            ]
        ]);
    }

    public function destroy(Facility $facility): JsonResponse
    {
        $this->facilityService->deleteFacility($facility);

        return response()->json([
            'message' => 'Facility deleted successfully'
        ]);
    }

    public function nearby(Request $request): JsonResponse
    {
        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius' => 'nullable|numeric|min:1|max:500',
            'specialty' => 'nullable|string',
            'emergency_only' => 'nullable|boolean',
            'accepts_referrals' => 'nullable|boolean'
        ]);

        $facilities = Facility::query()
            ->with(['specialties', 'beds'])
            ->verified()
            ->active()
            ->nearby($request->latitude, $request->longitude, $request->radius ?? 50)
            ->when($request->specialty, fn($q, $specialty) => $q->withSpecialty($specialty))
            ->when($request->emergency_only, fn($q) => $q->withEmergencyServices())
            ->when($request->accepts_referrals, fn($q) => $q->acceptingReferrals())
            ->get();

        $facilities->each(function ($facility) use ($request) {
            $facility->distance = $facility->getDistanceFrom($request->latitude, $request->longitude);
            $facility->append(['is_verified', 'occupancy_rate']);
        });

        return response()->json($facilities->sortBy('distance')->values());
    }

    public function capacity(Request $request): JsonResponse
    {
        $facilities = Facility::query()
            ->with(['beds'])
            ->when($request->facility_ids, fn($q, $ids) => $q->whereIn('id', $ids))
            ->when($request->type, fn($q, $type) => $q->byType($type))
            ->when($request->city, fn($q, $city) => $q->byCity($city))
            ->verified()
            ->active()
            ->get();

        $capacity_data = $facilities->map(function ($facility) {
            return [
                'id' => $facility->id,
                'name' => $facility->name,
                'type' => $facility->type,
                'total_beds' => $facility->total_beds,
                'available_beds' => $facility->available_beds,
                'occupied_beds' => $facility->total_beds - $facility->available_beds,
                'occupancy_rate' => $facility->occupancy_rate,
                'emergency_beds' => $facility->beds()->where('type', 'emergency')->count(),
                'icu_beds' => $facility->beds()->where('type', 'icu')->count(),
                'general_beds' => $facility->beds()->where('type', 'general')->count(),
                'accepts_referrals' => $facility->accepts_referrals,
                'emergency_services' => $facility->emergency_services,
            ];
        });

        return response()->json([
            'facilities' => $capacity_data,
            'summary' => [
                'total_facilities' => $capacity_data->count(),
                'total_beds' => $capacity_data->sum('total_beds'),
                'available_beds' => $capacity_data->sum('available_beds'),
                'occupied_beds' => $capacity_data->sum('occupied_beds'),
                'average_occupancy' => $capacity_data->avg('occupancy_rate'),
                'facilities_accepting_referrals' => $capacity_data->where('accepts_referrals', true)->count(),
                'emergency_ready_facilities' => $capacity_data->where('emergency_services', true)->count(),
            ]
        ]);
    }

    public function specialties(Facility $facility): JsonResponse
    {
        $specialties = $facility->specialties()
            ->withCount(['doctors', 'referrals'])
            ->get();

        return response()->json($specialties);
    }

    public function updateBedCount(Request $request, Facility $facility): JsonResponse
    {
        $request->validate([
            'total_beds' => 'required|integer|min:0',
            'available_beds' => 'required|integer|min:0',
        ]);

        $facility->updateBedCount($request->total_beds, $request->available_beds);

        return response()->json([
            'message' => 'Bed count updated successfully',
            'facility' => $facility->fresh(['beds'])
        ]);
    }
}
