<?php

namespace App\Http\Controllers;

use App\Models\ChatRoom;
use App\Models\WhatsAppConversation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class MessagesController extends Controller
{
    /**
     * Display the messages page with all communication data
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        // Check if user has access to communication system
        if (!Gate::allows('access-communication-system')) {
            abort(403, 'Unauthorized to access communication system');
        }

        // Load chat rooms based on user role and permissions
        $chatRooms = $this->getChatRoomsForUser($user);

        // Load WhatsApp conversations based on user role and permissions
        $whatsappConversations = $this->getWhatsAppConversationsForUser($user);

        // Load email conversations (placeholder for future implementation)
        $emails = [];

        // Load email folders (placeholder for future implementation)
        $emailFolders = [
            ['id' => 'inbox', 'name' => 'Inbox', 'count' => 0],
            ['id' => 'sent', 'name' => 'Sent', 'count' => 0],
            ['id' => 'drafts', 'name' => 'Drafts', 'count' => 0],
            ['id' => 'trash', 'name' => 'Trash', 'count' => 0],
        ];

        return Inertia::render('messages/index', [
            'chatRooms' => $chatRooms,
            'whatsappConversations' => $whatsappConversations,
            'emails' => $emails,
            'emailFolders' => $emailFolders,
            'userPermissions' => [
                'canCreateChatRooms' => Gate::allows('create-chat-rooms'),
                'canSendWhatsApp' => Gate::allows('send-whatsapp-messages'),
                'canSendEmails' => Gate::allows('send-emails'),
                'canMakeVideoCalls' => Gate::allows('make-video-calls'),
                'canAccessEmergencyComms' => Gate::allows('access-emergency-communications'),
            ],
        ]);
    }

    /**
     * Get chat rooms for the authenticated user based on their role
     */
    private function getChatRoomsForUser(User $user): array
    {
        $query = ChatRoom::with(['participants.user', 'lastMessage.sender'])
            ->where('is_active', true);

        // Apply role-based filtering
        switch ($user->role) {
            case 'super_admin':
            case 'hospital_admin':
                // Admins can see all chat rooms
                break;

            case 'doctor':
            case 'nurse':
                // Medical staff can see rooms they participate in or department-wide rooms
                $query->where(function ($q) use ($user) {
                    $q->whereHas('participants', function ($p) use ($user) {
                        $p->where('user_id', $user->id);
                    })
                    ->orWhere('type', 'department')
                    ->orWhere('type', 'medical_team');
                });
                break;

            case 'dispatcher':
                // Dispatchers can see emergency and dispatch-related rooms
                $query->where(function ($q) use ($user) {
                    $q->whereHas('participants', function ($p) use ($user) {
                        $p->where('user_id', $user->id);
                    })
                    ->orWhere('type', 'emergency')
                    ->orWhere('type', 'dispatch');
                });
                break;

            case 'ambulance_driver':
            case 'ambulance_paramedic':
                // Ambulance staff can see rooms they participate in
                $query->whereHas('participants', function ($p) use ($user) {
                    $p->where('user_id', $user->id);
                });
                break;

            default:
                // Other roles can only see rooms they participate in
                $query->whereHas('participants', function ($p) use ($user) {
                    $p->where('user_id', $user->id);
                });
                break;
        }

        $chatRooms = $query->orderBy('last_activity_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($room) use ($user) {
                $lastMessage = $room->lastMessage;
                $unreadCount = $room->messages()
                    ->whereDoesntHave('readBy', function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                    })
                    ->count();

                return [
                    'id' => $room->id,
                    'name' => $room->name,
                    'type' => $room->type,
                    'description' => $room->description,
                    'is_private' => $room->is_private,
                    'participant_count' => $room->participants()->count(),
                    'participants' => $room->participants->map(function ($participant) {
                        return [
                            'id' => $participant->user->id,
                            'name' => $participant->user->full_name,
                            'role' => $participant->user->role,
                            'avatar' => $participant->user->avatar_url,
                            'is_online' => $participant->user->isOnline(),
                            'participant_role' => $participant->role,
                        ];
                    }),
                    'last_message' => $lastMessage ? [
                        'id' => $lastMessage->id,
                        'content' => $lastMessage->message,
                        'type' => $lastMessage->message_type,
                        'sender' => [
                            'id' => $lastMessage->sender->id,
                            'name' => $lastMessage->sender->full_name,
                            'role' => $lastMessage->sender->role,
                        ],
                        'created_at' => $lastMessage->created_at,
                        'time_ago' => $lastMessage->created_at->diffForHumans(),
                    ] : null,
                    'unread_count' => $unreadCount,
                    'last_activity_at' => $room->last_activity_at,
                    'created_at' => $room->created_at,
                ];
            });

        return $chatRooms->toArray();
    }

    /**
     * Get WhatsApp conversations for the authenticated user based on their role
     */
    private function getWhatsAppConversationsForUser(User $user): array
    {
        $query = WhatsAppConversation::with(['assignedUser', 'lastMessage'])
            ->where('status', '!=', 'archived');

        // Apply role-based filtering
        switch ($user->role) {
            case 'super_admin':
            case 'hospital_admin':
                // Admins can see all conversations
                break;

            case 'doctor':
            case 'nurse':
                // Medical staff can see conversations assigned to them or unassigned
                $query->where(function ($q) use ($user) {
                    $q->where('assigned_to', $user->id)
                      ->orWhereNull('assigned_to');
                });
                break;

            case 'dispatcher':
                // Dispatchers can see all conversations for coordination
                break;

            default:
                // Other roles can only see conversations assigned to them
                $query->where('assigned_to', $user->id);
                break;
        }

        $conversations = $query->orderBy('last_message_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($conversation) {
                return [
                    'id' => $conversation->id,
                    'contact_name' => $conversation->contact_name,
                    'contact_phone' => $conversation->contact_phone,
                    'status' => $conversation->status,
                    'assigned_to' => $conversation->assigned_to,
                    'assigned_user' => $conversation->assignedUser ? [
                        'id' => $conversation->assignedUser->id,
                        'name' => $conversation->assignedUser->full_name,
                        'role' => $conversation->assignedUser->role,
                    ] : null,
                    'last_message' => $conversation->lastMessage ? [
                        'id' => $conversation->lastMessage->id,
                        'content' => $conversation->lastMessage->content,
                        'type' => $conversation->lastMessage->message_type,
                        'direction' => $conversation->lastMessage->direction,
                        'created_at' => $conversation->lastMessage->created_at,
                        'time_ago' => $conversation->lastMessage->created_at->diffForHumans(),
                    ] : null,
                    'unread_count' => $conversation->unread_count,
                    'last_message_at' => $conversation->last_message_at,
                    'created_at' => $conversation->created_at,
                ];
            });

        return $conversations->toArray();
    }

    /**
     * Show a specific conversation
     */
    public function show(Request $request, $id): Response
    {
        $user = Auth::user();

        // Check if user has access to communication system
        if (!Gate::allows('access-communication-system')) {
            abort(403, 'Unauthorized to access communication system');
        }

        // Try to find the conversation in chat rooms first
        $chatRoom = ChatRoom::with(['participants.user', 'messages.sender'])
            ->where('id', $id)
            ->first();

        if ($chatRoom) {
            // Check if user has access to this chat room
            if (!$this->userCanAccessChatRoom($user, $chatRoom)) {
                abort(403, 'Unauthorized to access this chat room');
            }

            return Inertia::render('messages/chat', [
                'conversation' => $chatRoom,
                'type' => 'chat',
            ]);
        }

        // Try to find in WhatsApp conversations
        $whatsappConversation = WhatsAppConversation::with(['messages', 'assignedUser'])
            ->where('id', $id)
            ->first();

        if ($whatsappConversation) {
            // Check if user has access to this WhatsApp conversation
            if (!$this->userCanAccessWhatsAppConversation($user, $whatsappConversation)) {
                abort(403, 'Unauthorized to access this conversation');
            }

            return Inertia::render('messages/whatsapp', [
                'conversation' => $whatsappConversation,
                'type' => 'whatsapp',
            ]);
        }

        abort(404, 'Conversation not found');
    }

    /**
     * Check if user can access a chat room
     */
    private function userCanAccessChatRoom(User $user, ChatRoom $chatRoom): bool
    {
        // Super admins and hospital admins can access all rooms
        if (in_array($user->role, ['super_admin', 'hospital_admin'])) {
            return true;
        }

        // Check if user is a participant
        if ($chatRoom->participants()->where('user_id', $user->id)->exists()) {
            return true;
        }

        // Check if it's a department or public room that user's role can access
        if (in_array($chatRoom->type, ['department', 'medical_team']) && 
            in_array($user->role, ['doctor', 'nurse'])) {
            return true;
        }

        if (in_array($chatRoom->type, ['emergency', 'dispatch']) && 
            $user->role === 'dispatcher') {
            return true;
        }

        return false;
    }

    /**
     * Check if user can access a WhatsApp conversation
     */
    private function userCanAccessWhatsAppConversation(User $user, WhatsAppConversation $conversation): bool
    {
        // Super admins and hospital admins can access all conversations
        if (in_array($user->role, ['super_admin', 'hospital_admin'])) {
            return true;
        }

        // Dispatchers can access all conversations for coordination
        if ($user->role === 'dispatcher') {
            return true;
        }

        // Check if conversation is assigned to the user
        if ($conversation->assigned_to === $user->id) {
            return true;
        }

        // Medical staff can access unassigned conversations
        if (in_array($user->role, ['doctor', 'nurse']) && $conversation->assigned_to === null) {
            return true;
        }

        return false;
    }
}
