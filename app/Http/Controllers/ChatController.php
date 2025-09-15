<?php

namespace App\Http\Controllers;

use App\Models\ChatRoom;
use App\Models\ChatMessage;
use App\Models\VideoCall;
use App\Services\RealTimeCommunicationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    private $communicationService;

    public function __construct(RealTimeCommunicationService $communicationService)
    {
        $this->communicationService = $communicationService;
    }

    /**
     * Display chat interface
     */
    public function index(Request $request): Response
    {
        $chatRooms = ChatRoom::forUser(auth()->id())
            ->active()
            ->with(['participants.user', 'messages' => function ($query) {
                $query->latest()->limit(1);
            }])
            ->orderBy('last_activity_at', 'desc')
            ->get();

        return Inertia::render('Chat/Index', [
            'chatRooms' => $chatRooms,
            'currentUser' => auth()->user(),
        ]);
    }

    /**
     * Show specific chat room
     */
    public function show(ChatRoom $chatRoom): Response
    {
        // Check if user can access this chat room
        if (!$chatRoom->canUserAccess(auth()->user())) {
            abort(403, 'You do not have access to this chat room');
        }

        // Mark chat room as read for current user
        $chatRoom->markAsRead(auth()->user());

        // Load messages with pagination
        $messages = $chatRoom->messages()
            ->with(['sender', 'replyTo.sender', 'reactions.user'])
            ->latest()
            ->paginate(50);

        return Inertia::render('Chat/Room', [
            'chatRoom' => $chatRoom->load(['participants.user']),
            'messages' => $messages,
            'onlineUsers' => $chatRoom->getOnlineParticipants(),
            'typingUsers' => $chatRoom->getTypingUsers(),
            'stats' => $this->communicationService->getChatRoomStats($chatRoom),
        ]);
    }

    /**
     * Create new chat room
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:general,private,group,referral_case,emergency',
            'participants' => 'required|array|min:1',
            'participants.*' => 'exists:users,id',
            'referral_id' => 'nullable|exists:referrals,id',
            'is_private' => 'boolean',
        ]);

        $chatRoom = ChatRoom::create([
            'name' => $request->name,
            'description' => $request->description,
            'type' => $request->type,
            'referral_id' => $request->referral_id,
            'created_by' => auth()->id(),
            'is_private' => $request->is_private ?? false,
            'settings' => [
                'allow_file_sharing' => true,
                'allow_voice_messages' => true,
                'auto_archive_after_days' => 30,
                'notification_level' => 'all'
            ]
        ]);

        // Add creator as admin
        $chatRoom->addParticipant(auth()->user(), 'admin');

        // Add other participants
        foreach ($request->participants as $userId) {
            if ($userId != auth()->id()) {
                $chatRoom->addParticipant(\App\Models\User::find($userId));
            }
        }

        return response()->json([
            'message' => 'Chat room created successfully',
            'chat_room' => $chatRoom->load(['participants.user'])
        ], 201);
    }

    /**
     * Send message to chat room
     */
    public function sendMessage(Request $request, ChatRoom $chatRoom): JsonResponse
    {
        if (!$chatRoom->canUserAccess(auth()->user())) {
            abort(403, 'You do not have access to this chat room');
        }

        $request->validate([
            'message' => 'required_without:attachments|string',
            'type' => 'in:text,file,image,voice,video,location',
            'reply_to_id' => 'nullable|exists:chat_messages,id',
            'priority' => 'in:low,normal,high,urgent',
            'attachments' => 'nullable|array',
        ]);

        $message = $this->communicationService->sendMessage($chatRoom, [
            'message' => $request->message,
            'type' => $request->type ?? 'text',
            'reply_to_id' => $request->reply_to_id,
            'priority' => $request->priority ?? 'normal',
            'attachments' => $request->attachments,
        ]);

        return response()->json([
            'message' => 'Message sent successfully',
            'chat_message' => $message
        ]);
    }

    /**
     * Upload and share file
     */
    public function shareFile(Request $request, ChatRoom $chatRoom): JsonResponse
    {
        if (!$chatRoom->canUserAccess(auth()->user())) {
            abort(403, 'You do not have access to this chat room');
        }

        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'description' => 'nullable|string|max:255',
        ]);

        $message = $this->communicationService->shareFile(
            $chatRoom,
            $request->file('file'),
            $request->description
        );

        return response()->json([
            'message' => 'File shared successfully',
            'chat_message' => $message
        ]);
    }

    /**
     * Send voice message
     */
    public function sendVoiceMessage(Request $request, ChatRoom $chatRoom): JsonResponse
    {
        if (!$chatRoom->canUserAccess(auth()->user())) {
            abort(403, 'You do not have access to this chat room');
        }

        $request->validate([
            'audio' => 'required|file|mimes:mp3,wav,ogg,m4a|max:5120', // 5MB max
            'duration' => 'required|integer|min:1|max:300', // 5 minutes max
        ]);

        $message = $this->communicationService->sendVoiceMessage(
            $chatRoom,
            $request->file('audio'),
            $request->duration
        );

        return response()->json([
            'message' => 'Voice message sent successfully',
            'chat_message' => $message
        ]);
    }

    /**
     * Update typing status
     */
    public function updateTyping(Request $request, ChatRoom $chatRoom): JsonResponse
    {
        if (!$chatRoom->canUserAccess(auth()->user())) {
            abort(403, 'You do not have access to this chat room');
        }

        $request->validate([
            'is_typing' => 'required|boolean',
        ]);

        $this->communicationService->updateTypingStatus($chatRoom, $request->is_typing);

        return response()->json(['success' => true]);
    }

    /**
     * Add reaction to message
     */
    public function addReaction(Request $request, ChatMessage $message): JsonResponse
    {
        if (!$message->chatRoom->canUserAccess(auth()->user())) {
            abort(403, 'You do not have access to this chat room');
        }

        $request->validate([
            'emoji' => 'required|string|max:10',
        ]);

        $reaction = $message->addReaction(auth()->user(), $request->emoji);

        return response()->json([
            'message' => 'Reaction added successfully',
            'reaction' => $reaction
        ]);
    }

    /**
     * Remove reaction from message
     */
    public function removeReaction(ChatMessage $message): JsonResponse
    {
        if (!$message->chatRoom->canUserAccess(auth()->user())) {
            abort(403, 'You do not have access to this chat room');
        }

        $removed = $message->removeReaction(auth()->user());

        return response()->json([
            'message' => $removed ? 'Reaction removed successfully' : 'No reaction to remove',
            'removed' => $removed
        ]);
    }

    /**
     * Edit message
     */
    public function editMessage(Request $request, ChatMessage $message): JsonResponse
    {
        if (!$message->canBeEditedBy(auth()->user())) {
            abort(403, 'You cannot edit this message');
        }

        $request->validate([
            'message' => 'required|string',
        ]);

        $message->edit($request->message);

        return response()->json([
            'message' => 'Message edited successfully',
            'chat_message' => $message->fresh()
        ]);
    }

    /**
     * Delete message
     */
    public function deleteMessage(ChatMessage $message): JsonResponse
    {
        if (!$message->canBeDeletedBy(auth()->user())) {
            abort(403, 'You cannot delete this message');
        }

        $message->delete();

        return response()->json([
            'message' => 'Message deleted successfully'
        ]);
    }

    /**
     * Initiate video/voice call
     */
    public function initiateCall(Request $request, ChatRoom $chatRoom): JsonResponse
    {
        if (!$chatRoom->canUserAccess(auth()->user())) {
            abort(403, 'You do not have access to this chat room');
        }

        $request->validate([
            'type' => 'required|in:voice,video',
            'participants' => 'required|array|min:1|max:8',
            'participants.*' => 'exists:users,id',
        ]);

        $call = $this->communicationService->initiateCall(
            $chatRoom,
            $request->participants,
            $request->type
        );

        return response()->json([
            'message' => 'Call initiated successfully',
            'call' => $call
        ]);
    }

    /**
     * End video/voice call
     */
    public function endCall(VideoCall $call): JsonResponse
    {
        // Check if user can end this call
        if ($call->initiator_id !== auth()->id() && !in_array(auth()->id(), $call->participants)) {
            abort(403, 'You cannot end this call');
        }

        $this->communicationService->endCall($call);

        return response()->json([
            'message' => 'Call ended successfully'
        ]);
    }

    /**
     * Get chat room participants
     */
    public function getParticipants(ChatRoom $chatRoom): JsonResponse
    {
        if (!$chatRoom->canUserAccess(auth()->user())) {
            abort(403, 'You do not have access to this chat room');
        }

        $participants = $chatRoom->participants()
            ->with('user')
            ->get()
            ->map(function ($participant) {
                return [
                    'user' => $participant->user,
                    'role' => $participant->role,
                    'joined_at' => $participant->joined_at,
                    'last_read_at' => $participant->last_read_at,
                    'is_online' => $this->communicationService->isUserOnline($participant->user),
                ];
            });

        return response()->json([
            'participants' => $participants
        ]);
    }

    /**
     * Add participant to chat room
     */
    public function addParticipant(Request $request, ChatRoom $chatRoom): JsonResponse
    {
        if (!$chatRoom->canUserAccess(auth()->user())) {
            abort(403, 'You do not have access to this chat room');
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'in:admin,moderator,participant',
        ]);

        $user = \App\Models\User::find($request->user_id);
        $participant = $chatRoom->addParticipant($user, $request->role ?? 'participant');

        return response()->json([
            'message' => 'Participant added successfully',
            'participant' => $participant
        ]);
    }

    /**
     * Remove participant from chat room
     */
    public function removeParticipant(Request $request, ChatRoom $chatRoom): JsonResponse
    {
        if (!$chatRoom->canUserAccess(auth()->user())) {
            abort(403, 'You do not have access to this chat room');
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = \App\Models\User::find($request->user_id);
        $this->communicationService->removeParticipant($chatRoom, $user->id);

        return response()->json([
            'message' => 'Participant removed successfully'
        ]);
    }

    /**
     * Archive chat room
     */
    public function archive(ChatRoom $chatRoom): JsonResponse
    {
        if (!$chatRoom->canUserAccess(auth()->user())) {
            abort(403, 'You do not have access to this chat room');
        }

        $chatRoom->archive();

        return response()->json([
            'message' => 'Chat room archived successfully'
        ]);
    }

    /**
     * Get chat room statistics
     */
    public function getStats(ChatRoom $chatRoom): JsonResponse
    {
        if (!$chatRoom->canUserAccess(auth()->user())) {
            abort(403, 'You do not have access to this chat room');
        }

        $stats = $this->communicationService->getChatRoomStats($chatRoom);

        return response()->json([
            'stats' => $stats
        ]);
    }
}
