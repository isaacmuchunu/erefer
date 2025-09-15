<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatRoom;
use App\Models\ChatMessage;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class ChatRoomController extends Controller
{
    /**
     * Get chat rooms for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Get chat rooms where user is a participant
            $chatRooms = ChatRoom::whereHas('participants', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with([
                'participants.user:id,first_name,last_name,role,avatar',
                'messages' => function ($query) {
                    $query->latest()->limit(1)->with('sender:id,first_name,last_name');
                }
            ])
            ->withCount('messages')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhereHas('participants.user', function ($q) use ($search) {
                          $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                      });
            })
            ->when($request->type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->orderBy('updated_at', 'desc')
            ->paginate($request->per_page ?? 20);

            // Transform the data for frontend consumption
            $chatRooms->getCollection()->transform(function ($room) use ($user) {
                $lastMessage = $room->messages->first();
                return [
                    'id' => $room->id,
                    'name' => $room->name,
                    'type' => $room->type,
                    'description' => $room->description,
                    'avatar' => $room->avatar ?? '/images/avatars/chat-default.png',
                    'participants' => $room->participants->map(function ($participant) {
                        return [
                            'id' => $participant->user->id,
                            'name' => $participant->user->full_name,
                            'role' => $participant->user->role,
                            'avatar' => $participant->user->avatar,
                            'status' => 'offline', // Will be updated with real-time status
                            'is_admin' => $participant->role === 'admin',
                        ];
                    }),
                    'lastMessage' => $lastMessage ? [
                        'id' => $lastMessage->id,
                        'content' => $lastMessage->content,
                        'type' => $lastMessage->type ?? 'text',
                        'sender' => $lastMessage->sender->full_name,
                        'timestamp' => $lastMessage->created_at->diffForHumans(),
                        'created_at' => $lastMessage->created_at,
                    ] : null,
                    'unreadCount' => $room->unread_message_count,
                    'messagesCount' => $room->messages_count,
                    'isActive' => $room->is_active,
                    'createdAt' => $room->created_at,
                    'updatedAt' => $room->updated_at,
                ];
            });

            // Log the access
            AuditLog::logActivity(
                'chat.rooms.accessed',
                null,
                [],
                [],
                "User accessed chat rooms list",
                'info',
                ['communication', 'chat']
            );

            return response()->json([
                'success' => true,
                'data' => $chatRooms->items(),
                'meta' => [
                    'current_page' => $chatRooms->currentPage(),
                    'last_page' => $chatRooms->lastPage(),
                    'per_page' => $chatRooms->perPage(),
                    'total' => $chatRooms->total(),
                ],
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching chat rooms: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch chat rooms',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Create a new chat room
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'type' => ['required', Rule::in(['individual', 'group', 'emergency', 'department'])],
                'description' => 'nullable|string|max:1000',
                'participants' => 'required|array|min:1',
                'participants.*' => 'exists:users,id',
            ]);

            $user = Auth::user();

            // Check if user can create chat rooms
            if (!Gate::allows('access-communication-system')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to create chat rooms'
                ], 403);
            }

            // For individual chats, check if room already exists
            if ($request->type === 'individual' && count($request->participants) === 1) {
                $existingRoom = ChatRoom::where('type', 'individual')
                    ->whereHas('participants', function ($query) use ($user) {
                        $query->where('user_id', $user->id);
                    })
                    ->whereHas('participants', function ($query) use ($request) {
                        $query->where('user_id', $request->participants[0]);
                    })
                    ->first();

                if ($existingRoom) {
                    return response()->json([
                        'success' => true,
                        'data' => $existingRoom,
                        'message' => 'Chat room already exists'
                    ]);
                }
            }

            $chatRoom = ChatRoom::create([
                'name' => $request->name,
                'type' => $request->type,
                'description' => $request->description,
                'created_by' => $user->id,
                'is_active' => true,
            ]);

            // Add creator as admin participant
            $chatRoom->participants()->create([
                'user_id' => $user->id,
                'is_admin' => true,
                'joined_at' => now(),
            ]);

            // Add other participants
            foreach ($request->participants as $participantId) {
                if ($participantId != $user->id) {
                    $chatRoom->participants()->create([
                        'user_id' => $participantId,
                        'is_admin' => false,
                        'joined_at' => now(),
                    ]);
                }
            }

            // Log the creation
            AuditLog::logActivity(
                'chat.room.created',
                $chatRoom,
                [],
                $chatRoom->toArray(),
                "Chat room '{$chatRoom->name}' created",
                'info',
                ['communication', 'chat', 'creation']
            );

            return response()->json([
                'success' => true,
                'data' => $chatRoom->load('participants.user'),
                'message' => 'Chat room created successfully'
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error creating chat room: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create chat room',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get a specific chat room with messages
     */
    public function show(Request $request, ChatRoom $chatRoom): JsonResponse
    {
        try {
            $user = Auth::user();

            // Check if user is a participant
            if (!$chatRoom->participants()->where('user_id', $user->id)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to access this chat room'
                ], 403);
            }

            // Load messages with pagination
            $messages = $chatRoom->messages()
                ->with(['sender:id,first_name,last_name,avatar', 'attachments'])
                ->latest()
                ->paginate($request->per_page ?? 50);

            // Mark messages as read
            $chatRoom->messages()
                ->whereDoesntHave('readBy', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->get()
                ->each(function ($message) use ($user) {
                    $message->readBy()->attach($user->id, ['read_at' => now()]);
                });

            // Log the access
            AuditLog::logActivity(
                'chat.room.accessed',
                $chatRoom,
                [],
                [],
                "User accessed chat room '{$chatRoom->name}'",
                'info',
                ['communication', 'chat', 'access']
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'room' => $chatRoom->load('participants.user'),
                    'messages' => $messages,
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching chat room: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch chat room',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Send a message to a chat room
     */
    public function sendMessage(Request $request, ChatRoom $chatRoom): JsonResponse
    {
        try {
            $request->validate([
                'content' => 'required|string|max:4096',
                'type' => 'in:text,image,file,voice,video,location',
                'reply_to_id' => 'nullable|exists:chat_messages,id',
                'priority' => 'in:low,normal,high,urgent',
                'attachments' => 'nullable|array',
                'attachments.*' => 'file|max:10240', // 10MB max
            ]);

            $user = Auth::user();

            // Check if user is a participant
            if (!$chatRoom->participants()->where('user_id', $user->id)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to send messages in this chat room'
                ], 403);
            }

            // Create the message
            $message = $chatRoom->messages()->create([
                'sender_id' => $user->id,
                'message' => $request->content,
                'message_type' => $request->type ?? 'text',
                'reply_to_id' => $request->reply_to_id,
                'priority' => $request->priority ?? 'normal',
                'is_system_message' => false,
                'metadata' => [
                    'user_agent' => $request->userAgent(),
                    'ip_address' => $request->ip(),
                ],
            ]);

            // Handle file attachments
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('chat/attachments', 'public');
                    $message->attachments()->create([
                        'filename' => $file->getClientOriginalName(),
                        'original_name' => $file->getClientOriginalName(),
                        'path' => $path,
                        'size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                        'type' => $this->getAttachmentType($file->getMimeType()),
                    ]);
                }
            }

            // Update chat room activity
            $chatRoom->update([
                'last_activity_at' => now(),
                'last_message_id' => $message->id,
            ]);

            // Broadcast the message
            broadcast(new \App\Events\MessageSent($message, $chatRoom))->toOthers();

            // Log the message
            AuditLog::logActivity(
                'chat.message.sent',
                $message,
                [],
                $message->toArray(),
                "Message sent in chat room '{$chatRoom->name}'",
                'info',
                ['communication', 'chat', 'message']
            );

            return response()->json([
                'success' => true,
                'data' => $message->load(['sender', 'attachments', 'replyTo.sender']),
                'message' => 'Message sent successfully'
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error sending message: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to send message',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Add participants to a chat room
     */
    public function addParticipants(Request $request, ChatRoom $chatRoom): JsonResponse
    {
        try {
            $request->validate([
                'user_ids' => 'required|array',
                'user_ids.*' => 'exists:users,id',
            ]);

            $user = Auth::user();

            // Check if user is an admin of the chat room
            if (!$chatRoom->participants()->where('user_id', $user->id)->where('role', 'admin')->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only chat room admins can add participants'
                ], 403);
            }

            $addedUsers = [];
            foreach ($request->user_ids as $userId) {
                // Check if user is already a participant
                if (!$chatRoom->participants()->where('user_id', $userId)->exists()) {
                    $chatRoom->participants()->create([
                        'user_id' => $userId,
                        'role' => 'member',
                        'joined_at' => now(),
                    ]);
                    $addedUsers[] = User::find($userId);
                }
            }

            // Send system message about new participants
            if (!empty($addedUsers)) {
                $userNames = collect($addedUsers)->pluck('full_name')->join(', ');
                $chatRoom->messages()->create([
                    'sender_id' => $user->id,
                    'message' => "Added {$userNames} to the chat",
                    'message_type' => 'system',
                    'is_system_message' => true,
                ]);
            }

            // Log the action
            AuditLog::logActivity(
                'chat.participants.added',
                $chatRoom,
                [],
                ['added_users' => $request->user_ids],
                "Participants added to chat room '{$chatRoom->name}'",
                'info',
                ['communication', 'chat', 'participants']
            );

            return response()->json([
                'success' => true,
                'data' => $chatRoom->load('participants.user'),
                'message' => 'Participants added successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error adding participants: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to add participants',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Remove participants from a chat room
     */
    public function removeParticipants(Request $request, ChatRoom $chatRoom): JsonResponse
    {
        try {
            $request->validate([
                'user_ids' => 'required|array',
                'user_ids.*' => 'exists:users,id',
            ]);

            $user = Auth::user();

            // Check if user is an admin of the chat room
            if (!$chatRoom->participants()->where('user_id', $user->id)->where('role', 'admin')->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only chat room admins can remove participants'
                ], 403);
            }

            $removedUsers = [];
            foreach ($request->user_ids as $userId) {
                // Don't allow removing the creator
                if ($userId !== $chatRoom->created_by) {
                    $participant = $chatRoom->participants()->where('user_id', $userId)->first();
                    if ($participant) {
                        $removedUsers[] = $participant->user->full_name;
                        $participant->delete();
                    }
                }
            }

            // Send system message about removed participants
            if (!empty($removedUsers)) {
                $userNames = collect($removedUsers)->join(', ');
                $chatRoom->messages()->create([
                    'sender_id' => $user->id,
                    'message' => "Removed {$userNames} from the chat",
                    'message_type' => 'system',
                    'is_system_message' => true,
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => $chatRoom->load('participants.user'),
                'message' => 'Participants removed successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error removing participants: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to remove participants',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Send typing indicator
     */
    public function sendTypingIndicator(Request $request, ChatRoom $chatRoom): JsonResponse
    {
        try {
            $request->validate([
                'is_typing' => 'required|boolean',
            ]);

            $user = Auth::user();

            // Check if user is a participant
            if (!$chatRoom->participants()->where('user_id', $user->id)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to send typing indicators in this chat room'
                ], 403);
            }

            // Broadcast typing indicator
            broadcast(new \App\Events\UserTyping($chatRoom, $user, $request->is_typing))->toOthers();

            return response()->json([
                'success' => true,
                'message' => 'Typing indicator sent'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error sending typing indicator: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to send typing indicator',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Mark messages as read
     */
    public function markAsRead(Request $request, ChatRoom $chatRoom): JsonResponse
    {
        try {
            $user = Auth::user();

            // Check if user is a participant
            if (!$chatRoom->participants()->where('user_id', $user->id)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to mark messages as read in this chat room'
                ], 403);
            }

            // Mark all unread messages as read
            $unreadMessages = $chatRoom->messages()
                ->whereDoesntHave('readBy', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->get();

            foreach ($unreadMessages as $message) {
                $message->readBy()->attach($user->id, ['read_at' => now()]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Messages marked as read',
                'data' => ['marked_count' => $unreadMessages->count()]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error marking messages as read: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to mark messages as read',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get attachment type from MIME type
     */
    private function getAttachmentType(string $mimeType): string
    {
        if (str_starts_with($mimeType, 'image/')) {
            return 'image';
        } elseif (str_starts_with($mimeType, 'video/')) {
            return 'video';
        } elseif (str_starts_with($mimeType, 'audio/')) {
            return 'audio';
        } elseif (in_array($mimeType, ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])) {
            return 'document';
        } else {
            return 'file';
        }
    }
}
