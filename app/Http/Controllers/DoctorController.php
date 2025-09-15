<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreDoctorRequest;
use App\Http\Requests\UpdateDoctorRequest;
use App\Models\Doctor;
use App\Services\DoctorService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DoctorController extends Controller
{
    public function __construct(
        private DoctorService $doctorService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $doctors = Doctor::query()
            ->with(['user', 'facility', 'specialties'])
            ->when($request->facility_id, fn($q, $id) => $q->where('facility_id', $id))
            ->when($request->specialty_id, function($q, $id) {
                $q->whereHas('specialties', fn($q) => $q->where('specialty_id', $id));
            })
            ->when($request->available_now, fn($q) => 
                $q->where('status', 'active')
                  ->where('accepts_referrals', true)
            )
            ->when($request->search, function($q, $search) {
                $q->whereHas('user', function($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%");
                });
            })
            ->paginate($request->per_page ?? 15);

        return response()->json($doctors);
    }

    public function store(StoreDoctorRequest $request): JsonResponse
    {
        $doctor = $this->doctorService->create($request->validated());

        return response()->json([
            'message' => 'Doctor created successfully',
            'doctor' => $doctor->load(['user', 'facility', 'specialties'])
        ], 201);
    }

    public function show(Doctor $doctor): JsonResponse
    {
        return response()->json([
            'doctor' => $doctor->load([
                'user',
                'facility',
                'specialties',
                'referralsReceived' => fn($q) => $q->latest()->limit(10),
                'referralsMade' => fn($q) => $q->latest()->limit(10)
            ])
        ]);
    }

    public function update(UpdateDoctorRequest $request, Doctor $doctor): JsonResponse
    {
        $doctor = $this->doctorService->update($doctor, $request->validated());

        return response()->json([
            'message' => 'Doctor updated successfully',
            'doctor' => $doctor->load(['user', 'facility', 'specialties'])
        ]);
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'stats' => [
                'total_doctors' => Doctor::count(),
                'active_doctors' => Doctor::where('status', 'active')->count(),
                'on_duty_doctors' => Doctor::where('availability', 'on_duty')->count(),
                'accepting_referrals' => Doctor::where('accepts_referrals', true)->count(),
            ]
        ]);
    }

    public function destroy(Doctor $doctor): JsonResponse
    {
        $this->doctorService->delete($doctor);

        return response()->json([
            'message' => 'Doctor deleted successfully'
        ]);
    }

    public function availability(Doctor $doctor): JsonResponse
    {
        $availability = $this->doctorService->getAvailability($doctor);

        return response()->json($availability);
    }

    public function updateSchedule(Request $request, Doctor $doctor): JsonResponse
    {
        $request->validate([
            'availability_schedule' => 'required|array'
        ]);

        $doctor->update([
            'availability_schedule' => $request->availability_schedule
        ]);

        return response()->json([
            'message' => 'Schedule updated successfully',
            'doctor' => $doctor
        ]);
    }
}
?>