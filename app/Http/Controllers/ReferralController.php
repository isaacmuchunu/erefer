<?php 

namespace App\Http\Controllers;

use App\Http\Requests\StoreReferralRequest;
use App\Http\Requests\UpdateReferralRequest;
use App\Models\Referral;
use App\Services\ReferralService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReferralController extends Controller
{
    public function __construct(
        private ReferralService $referralService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Referral::class);

        $user = auth()->user();
        $query = Referral::query()
            ->with([
                'patient',
                'referringFacility',
                'receivingFacility',
                'referringDoctor.user',
                'receivingDoctor.user',
                'specialty'
            ]);

        // Apply role-based filtering
        if ($user->role === 'patient') {
            $query->where('patient_id', $user->patient?->id);
        } elseif ($user->role === 'doctor' && $user->doctor) {
            $query->where(function ($q) use ($user) {
                $q->where('referring_doctor_id', $user->doctor->id)
                  ->orWhere('receiving_doctor_id', $user->doctor->id);
            });
        } elseif ($user->role === 'nurse' && $user->facility_id) {
            $query->where(function ($q) use ($user) {
                $q->where('referring_facility_id', $user->facility_id)
                  ->orWhere('receiving_facility_id', $user->facility_id);
            });
        } elseif ($user->role === 'dispatcher') {
            $query->where('requires_ambulance', true)
                  ->orWhereHas('ambulanceDispatch');
        } elseif (in_array($user->role, ['ambulance_driver', 'ambulance_paramedic'])) {
            $query->whereHas('ambulanceDispatch.ambulance.crews', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        $referrals = $query
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->urgency, fn($q, $urgency) => $q->where('urgency', $urgency))
            ->when($request->facility_id, function($q, $id) {
                $q->where('referring_facility_id', $id)
                  ->orWhere('receiving_facility_id', $id);
            })
            ->when($request->doctor_id, function($q, $id) {
                $q->where('referring_doctor_id', $id)
                  ->orWhere('receiving_doctor_id', $id);
            })
            ->when($request->date_from, fn($q, $date) =>
                $q->whereDate('referred_at', '>=', $date)
            )
            ->when($request->date_to, fn($q, $date) =>
                $q->whereDate('referred_at', '<=', $date)
            )
            ->latest('referred_at')
            ->paginate($request->per_page ?? 15);

        return response()->json($referrals);
    }

    public function store(StoreReferralRequest $request): JsonResponse
    {
        $this->authorize('create', Referral::class);

        $referral = $this->referralService->create($request->validated());

        return response()->json([
            'message' => 'Referral created successfully',
            'referral' => $referral->load([
                'patient',
                'referringFacility',
                'receivingFacility',
                'specialty'
            ])
        ], 201);
    }

    public function show(Referral $referral): JsonResponse
    {
        $this->authorize('view', $referral);

        return response()->json([
            'referral' => $referral->load([
                'patient',
                'referringFacility',
                'receivingFacility',
                'referringDoctor.user',
                'receivingDoctor.user',
                'specialty',
                'documents',
                'communications',
                'ambulanceDispatch.ambulance',
                'feedback'
            ])
        ]);
    }

    public function update(UpdateReferralRequest $request, Referral $referral): JsonResponse
    {
        $this->authorize('update', $referral);

        $referral = $this->referralService->update($referral, $request->validated());

        return response()->json([
            'message' => 'Referral updated successfully',
            'referral' => $referral->load([
                'patient',
                'referringFacility',
                'receivingFacility',
                'specialty'
            ])
        ]);
    }

    public function accept(Request $request, Referral $referral): JsonResponse
    {
        $request->validate([
            'receiving_doctor_id' => 'required|exists:doctors,id',
            'notes' => 'nullable|string',
            'estimated_cost' => 'nullable|numeric'
        ]);

        $referral = $this->referralService->accept($referral, $request->validated());

        return response()->json([
            'message' => 'Referral accepted successfully',
            'referral' => $referral
        ]);
    }

    public function reject(Request $request, Referral $referral): JsonResponse
    {
        $request->validate([
            'rejection_reason' => 'required|string'
        ]);

        $referral = $this->referralService->reject($referral, $request->rejection_reason);

        return response()->json([
            'message' => 'Referral rejected',
            'referral' => $referral
        ]);
    }

    public function complete(Request $request, Referral $referral): JsonResponse
    {
        $request->validate([
            'outcome' => 'required|array',
            'notes' => 'nullable|string'
        ]);

        $referral = $this->referralService->complete($referral, $request->validated());

        return response()->json([
            'message' => 'Referral completed successfully',
            'referral' => $referral
        ]);
    }

    public function uploadDocument(Request $request, Referral $referral): JsonResponse
    {
        $request->validate([
            'document' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240',
            'document_type' => 'required|string',
            'description' => 'nullable|string'
        ]);

        $document = $this->referralService->uploadDocument($referral, $request->file('document'), $request->validated());

        return response()->json([
            'message' => 'Document uploaded successfully',
            'document' => $document
        ]);
    }

    public function findSuitableFacilities(Request $request): JsonResponse
    {
        $request->validate([
            'specialty_id' => 'required|exists:specialties,id',
            'urgency' => 'required|in:emergency,urgent,semi_urgent,routine',
            'location' => 'nullable|array',
            'bed_required' => 'boolean'
        ]);

        $facilities = $this->referralService->findSuitableFacilities($request->validated());

        return response()->json($facilities);
    }

    public function stats(Request $request): JsonResponse
    {
        $query = Referral::query();

        $query->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->urgency, fn($q, $urgency) => $q->where('urgency', $urgency))
            ->when($request->facility_id, function($q, $id) {
                $q->where('referring_facility_id', $id)
                  ->orWhere('receiving_facility_id', $id);
            })
            ->when($request->doctor_id, function($q, $id) {
                $q->where('referring_doctor_id', $id)
                  ->orWhere('receiving_doctor_id', $id);
            })
            ->when($request->date_from, fn($q, $date) => 
                $q->whereDate('referred_at', '>=', $date)
            )
            ->when($request->date_to, fn($q, $date) => 
                $q->whereDate('referred_at', '<=', $date)
            );

        $stats = [
            'total' => $query->count(),
            'pending' => (clone $query)->where('status', 'pending')->count(),
            'accepted' => (clone $query)->where('status', 'accepted')->count(),
            'rejected' => (clone $query)->where('status', 'rejected')->count(),
            'completed' => (clone $query)->where('status', 'completed')->count(),
            'in_transit' => (clone $query)->where('status', 'in_transit')->count(),
        ];

        return response()->json($stats);
    }
}


?>