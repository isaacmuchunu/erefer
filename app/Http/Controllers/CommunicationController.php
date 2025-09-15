<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreCommunicationRequest;
use App\Models\Communication;
use App\Services\CommunicationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CommunicationController extends Controller
{
    public function __construct(
        private CommunicationService $communicationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $communications = Communication::query()
            ->with(['sender', 'receiver', 'senderFacility', 'receiverFacility', 'referral'])
            ->when($request->referral_id, fn($q, $id) => $q->where('referral_id', $id))
            ->when($request->type, fn($q, $type) => $q->where('type', $type))
            ->when($request->priority, fn($q, $priority) => $q->where('priority', $priority))
            ->when($request->unread_only, fn($q) => $q->where('is_read', false))
            ->when($request->facility_id, function($q, $id) {
                $q->where('sender_facility_id', $id)
                  ->orWhere('receiver_facility_id', $id);
            })
            ->latest()
            ->paginate($request->per_page ?? 20);

        return response()->json($communications);
    }

    public function store(StoreCommunicationRequest $request): JsonResponse
    {
        $communication = $this->communicationService->create($request->validated());

        return response()->json([
            'message' => 'Message sent successfully',
            'communication' => $communication->load(['sender', 'receiver', 'referral'])
        ], 201);
    }

    public function show(Communication $communication): JsonResponse
    {
        // Mark as read when viewing
        if (!$communication->is_read && $communication->receiver_id === auth()->id()) {
            $communication->update([
                'is_read' => true,
                'read_at' => now()
            ]);
        }

        return response()->json([
            'communication' => $communication->load([
                'sender',
                'receiver',
                'senderFacility',
                'receiverFacility',
                'referral'
            ])
        ]);
    }

    public function markAsRead(Communication $communication): JsonResponse
    {
        $communication->update([
            'is_read' => true,
            'read_at' => now()
        ]);

        return response()->json([
            'message' => 'Message marked as read'
        ]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $count = Communication::where('receiver_id', auth()->id())
            ->where('is_read', false)
            ->when($request->facility_id, fn($q, $id) => 
                $q->where('receiver_facility_id', $id)
            )
            ->update([
                'is_read' => true,
                'read_at' => now()
            ]);

        return response()->json([
            'message' => "Marked {$count} messages as read"
        ]);
    }

    public function broadcast(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:emergency_alert,system_notification',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'priority' => 'required|in:low,normal,high,urgent',
            'target_facilities' => 'nullable|array',
            'target_roles' => 'nullable|array'
        ]);

        $broadcast = $this->communicationService->broadcast($request->validated());

        return response()->json([
            'message' => 'Broadcast sent successfully',
            'recipients_count' => $broadcast['recipients_count']
        ]);
    }

    public function getConversation(Request $request): JsonResponse
    {
        $request->validate([
            'referral_id' => 'nullable|exists:referrals,id',
            'facility_id' => 'nullable|exists:facilities,id'
        ]);

        $conversation = $this->communicationService->getConversation($request->validated());

        return response()->json($conversation);
    }
}

?>