<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreFeedbackRequest;
use App\Models\ReferralFeedback;
use App\Services\FeedbackService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FeedbackController extends Controller
{
    public function __construct(
        private FeedbackService $feedbackService
    ) {}

    public function store(StoreFeedbackRequest $request): JsonResponse
    {
        $feedback = $this->feedbackService->create($request->validated());

        return response()->json([
            'message' => 'Feedback submitted successfully',
            'feedback' => $feedback->load(['referral', 'feedbackBy'])
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $feedback = ReferralFeedback::query()
            ->with(['referral.patient', 'referral.receivingFacility', 'feedbackBy'])
            ->when($request->referral_id, fn($q, $id) => $q->where('referral_id', $id))
            ->when($request->type, fn($q, $type) => $q->where('type', $type))
            ->when($request->rating, fn($q, $rating) => $q->where('rating', $rating))
            ->when($request->facility_id, function($q, $id) {
                $q->whereHas('referral', fn($q) => 
                    $q->where('receiving_facility_id', $id)
                );
            })
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($feedback);
    }

    public function show(ReferralFeedback $feedback): JsonResponse
    {
        return response()->json([
            'feedback' => $feedback->load([
                'referral.patient',
                'referral.receivingFacility',
                'referral.receivingDoctor.user',
                'feedbackBy'
            ])
        ]);
    }

    public function facilityRatings(Request $request): JsonResponse
    {
        $ratings = $this->feedbackService->getFacilityRatings($request->facility_id);

        return response()->json($ratings);
    }

    public function doctorRatings(Request $request): JsonResponse
    {
        $ratings = $this->feedbackService->getDoctorRatings($request->doctor_id);

        return response()->json($ratings);
    }
}
?>