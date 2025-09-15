<?php
namespace App\Http\Controllers;

use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Patient;
use App\Services\PatientService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PatientController extends Controller
{
    public function __construct(
        private PatientService $patientService
    ) {}

    public function index(Request $request): JsonResponse
    {
        // Check authorization
        $this->authorize('viewAny', Patient::class);

        // Get accessible patients based on user role
        $patients = auth()->user()->getAccessiblePatients()
            ->when($request->search, fn($q, $search) => $q->search($search))
            ->when($request->gender, fn($q, $gender) => $q->byGender($gender))
            ->when($request->blood_group, fn($q, $bg) => $q->byBloodGroup($bg))
            ->when($request->age_range, function($q, $range) {
                [$min, $max] = explode('-', $range);
                if ($max === '+') {
                    $q->where('date_of_birth', '<=', now()->subYears($min));
                } else {
                    $q->byAgeRange((int)$min, (int)$max);
                }
            })
            ->when($request->high_risk === 'true', fn($q) => $q->highRisk())
            ->when($request->high_risk === 'false', fn($q) => $q->whereRaw("NOT EXISTS (
                SELECT 1 FROM JSON_TABLE(medical_history, '$[*]' COLUMNS (condition VARCHAR(255) PATH '$.condition')) AS jt 
                WHERE jt.condition IN ('diabetes', 'hypertension', 'heart disease', 'kidney disease', 'cancer')
            )"))
            ->when($request->has_allergies === 'true', fn($q) => $q->withAllergies())
            ->when($request->active_referrals === 'true', fn($q) => $q->withActiveReferrals())
            ->withCount(['referrals as active_referrals_count' => function($q) {
                $q->whereIn('status', ['pending', 'accepted', 'in_transit', 'arrived']);
            }])
            ->with(['referrals' => function($q) {
                $q->latest()->limit(1);
            }])
            ->latest()
            ->paginate($request->per_page ?? 15);

        // Add computed attributes to each patient
        $patients->getCollection()->transform(function ($patient) {
            $patient->append(['full_name', 'age', 'is_high_risk', 'has_allergies']);
            $patient->last_referral_date = $patient->referrals->first()?->created_at;
            return $patient;
        });

        return response()->json($patients);
    }

    public function store(StorePatientRequest $request): JsonResponse
    {
        $this->authorize('create', Patient::class);

        $patient = $this->patientService->create($request->validated());

        return response()->json([
            'message' => 'Patient created successfully',
            'patient' => $patient
        ], 201);
    }

    public function show(Patient $patient): JsonResponse
    {
        $this->authorize('view', $patient);

        return response()->json([
            'patient' => $patient->load([
                'referrals.referringFacility',
                'referrals.receivingFacility',
                'referrals.specialty',
                'bedReservations.bed'
            ])
        ]);
    }

    public function update(UpdatePatientRequest $request, Patient $patient): JsonResponse
    {
        $this->authorize('update', $patient);

        $patient = $this->patientService->update($patient, $request->validated());

        return response()->json([
            'message' => 'Patient updated successfully',
            'patient' => $patient
        ]);
    }

    public function destroy(Patient $patient): JsonResponse
    {
        $this->authorize('delete', $patient);

        $this->patientService->delete($patient);

        return response()->json([
            'message' => 'Patient deleted successfully'
        ]);
    }

    public function medicalHistory(Patient $patient): JsonResponse
    {
        $history = $this->patientService->getMedicalHistory($patient);

        return response()->json($history);
    }

    public function findByMRN(Request $request): JsonResponse
    {
        $request->validate([
            'mrn' => 'required|string'
        ]);

        $patient = Patient::where('medical_record_number', $request->mrn)->first();

        if (!$patient) {
            return response()->json([
                'message' => 'Patient not found'
            ], 404);
        }

        return response()->json(['patient' => $patient]);
    }

    public function stats(): JsonResponse
    {
        $stats = [
            'total_patients' => Patient::count(),
            'high_risk_patients' => Patient::highRisk()->count(),
            'patients_with_allergies' => Patient::withAllergies()->count(),
            'active_referrals' => Patient::withActiveReferrals()->count(),
        ];

        return response()->json($stats);
    }
}

?>