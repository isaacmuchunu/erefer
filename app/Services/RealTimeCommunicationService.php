<?php

namespace App\Services;

use App\Models\User;
use App\Models\Communication;
use App\Models\ChatRoom;
use App\Models\ChatMessage;
use App\Models\VideoCall;
use App\Events\MessageSent;
use App\Events\UserTyping;
use App\Events\UserOnlineStatusChanged;
use App\Events\CallInitiated;
use App\Events\CallEnded;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Pusher\Pusher;

class RealTimeCommunicationService
{
    private $pusher;
    
    public function __construct()
    {
        $this->pusher = new Pusher(
            config('broadcasting.connections.pusher.key'),
            config('broadcasting.connections.pusher.secret'),
            config('broadcasting.connections.pusher.app_id'),
            [
                'cluster' => config('broadcasting.connections.pusher.options.cluster'),
                'useTLS' => true,
            ]
        );
    }

    /**
     * Create or get existing chat room for referral case
     */
    public function createReferralChatRoom(int $referralId, array $participants = []): ChatRoom
    {
        $chatRoom = ChatRoom::firstOrCreate(
            [
                'referral_id' => $referralId,
                'type' => 'referral_case'
            ],
            [
                'name' => "Referral Case #$referralId",
                'description' => "Communication for referral case #$referralId",
                'created_by' => auth()->id(),
                'is_active' => true,
                'settings' => [
                    'allow_file_sharing' => true,
                    'allow_voice_messages' => true,
                    'auto_archive_after_days' => 30,
                    'notification_level' => 'all'
                ]
            ]
        );

        // Add participants if provided
        if (!empty($participants)) {
            $this->addParticipants($chatRoom, $participants);
        }

        return $chatRoom;
    }

    /**
     * Create emergency chat room for mass casualty incidents
     */
    public function createEmergencyChatRoom(string $incidentId, array $participants = []): ChatRoom
    {
        $chatRoom = ChatRoom::create([
            'name' => "Emergency Incident #$incidentId",
            'description' => "Emergency coordination for incident #$incidentId",
            'type' => 'emergency',
            'incident_id' => $incidentId,
            'created_by' => auth()->id(),
            'is_active' => true,
            'settings' => [
                'allow_file_sharing' => true,
                'allow_voice_messages' => true,
                'priority_notifications' => true,
                'auto_archive_after_days' => 90,
                'notification_level' => 'all'
            ]
        ]);

        if (!empty($participants)) {
            $this->addParticipants($chatRoom, $participants);
        }

        return $chatRoom;
    }

    /**
     * Send message to chat room
     */
    public function sendMessage(ChatRoom $chatRoom, array $messageData): ChatMessage
    {
        $message = $chatRoom->messages()->create([
            'sender_id' => auth()->id(),
            'message' => $messageData['message'] ?? null,
            'message_type' => $messageData['type'] ?? 'text',
            'attachments' => $messageData['attachments'] ?? null,
            'metadata' => $messageData['metadata'] ?? null,
            'reply_to_id' => $messageData['reply_to_id'] ?? null,
            'is_system_message' => $messageData['is_system_message'] ?? false,
            'priority' => $messageData['priority'] ?? 'normal',
        ]);

        // Broadcast message to all participants
        broadcast(new MessageSent($message, $chatRoom));

        // Send push notifications to offline participants
        $this->sendMessageNotifications($chatRoom, $message);

        // Update chat room last activity
        $chatRoom->update(['last_activity_at' => now()]);

        return $message->load(['sender', 'replyTo', 'reactions']);
    }

    /**
     * Send voice message
     */
    public function sendVoiceMessage(ChatRoom $chatRoom, $audioFile, int $duration): ChatMessage
    {
        // Store audio file
        $path = Storage::disk('public')->putFile('voice-messages', $audioFile);
        
        $message = $this->sendMessage($chatRoom, [
            'message' => 'Voice message',
            'type' => 'voice',
            'attachments' => [
                [
                    'type' => 'audio',
                    'path' => $path,
                    'duration' => $duration,
                    'size' => $audioFile->getSize(),
                    'mime_type' => $audioFile->getMimeType()
                ]
            ]
        ]);

        return $message;
    }

    /**
     * Share file in chat room
     */
    public function shareFile(ChatRoom $chatRoom, $file, string $description = null): ChatMessage
    {
        // Store file
        $path = Storage::disk('public')->putFile('chat-files', $file);
        
        $message = $this->sendMessage($chatRoom, [
            'message' => $description ?? 'File shared',
            'type' => 'file',
            'attachments' => [
                [
                    'type' => 'file',
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType()
                ]
            ]
        ]);

        return $message;
    }

    /**
     * Add participants to chat room
     */
    public function addParticipants(ChatRoom $chatRoom, array $userIds): void
    {
        foreach ($userIds as $userId) {
            $chatRoom->participants()->firstOrCreate(
                ['user_id' => $userId],
                [
                    'joined_at' => now(),
                    'role' => 'participant',
                    'notification_settings' => [
                        'muted' => false,
                        'notification_level' => 'all'
                    ]
                ]
            );
        }

        // Broadcast participant updates
        broadcast(new \App\Events\ChatRoomParticipantsUpdated($chatRoom));
    }

    /**
     * Remove participant from chat room
     */
    public function removeParticipant(ChatRoom $chatRoom, int $userId): void
    {
        $chatRoom->participants()->where('user_id', $userId)->delete();
        
        // Send system message
        $user = User::find($userId);
        $this->sendMessage($chatRoom, [
            'message' => "{$user->full_name} left the conversation",
            'type' => 'system',
            'is_system_message' => true
        ]);

        broadcast(new \App\Events\ChatRoomParticipantsUpdated($chatRoom));
    }

    /**
     * Update user typing status
     */
    public function updateTypingStatus(ChatRoom $chatRoom, bool $isTyping): void
    {
        $cacheKey = "typing_{$chatRoom->id}_{auth()->id()}";
        
        if ($isTyping) {
            Cache::put($cacheKey, true, 10); // 10 seconds
        } else {
            Cache::forget($cacheKey);
        }

        broadcast(new UserTyping($chatRoom, auth()->user(), $isTyping));
    }

    /**
     * Get typing users for chat room
     */
    public function getTypingUsers(ChatRoom $chatRoom): array
    {
        $typingUsers = [];
        
        foreach ($chatRoom->participants as $participant) {
            $cacheKey = "typing_{$chatRoom->id}_{$participant->user_id}";
            if (Cache::has($cacheKey) && $participant->user_id !== auth()->id()) {
                $typingUsers[] = $participant->user;
            }
        }

        return $typingUsers;
    }

    /**
     * Update user online status
     */
    public function updateOnlineStatus(User $user, bool $isOnline): void
    {
        $cacheKey = "user_online_{$user->id}";
        
        if ($isOnline) {
            Cache::put($cacheKey, now()->toISOString(), 300); // 5 minutes
        } else {
            Cache::forget($cacheKey);
        }

        // Update last seen
        $user->update(['last_seen_at' => now()]);

        broadcast(new UserOnlineStatusChanged($user, $isOnline));
    }

    /**
     * Check if user is online
     */
    public function isUserOnline(User $user): bool
    {
        return Cache::has("user_online_{$user->id}");
    }

    /**
     * Get online users
     */
    public function getOnlineUsers(array $userIds = null): array
    {
        $onlineUsers = [];
        $userIds = $userIds ?? User::pluck('id')->toArray();

        foreach ($userIds as $userId) {
            if (Cache::has("user_online_{$userId}")) {
                $onlineUsers[] = $userId;
            }
        }

        return $onlineUsers;
    }

    /**
     * Initiate video/voice call
     */
    public function initiateCall(ChatRoom $chatRoom, array $participants, string $type = 'video'): VideoCall
    {
        $call = VideoCall::create([
            'chat_room_id' => $chatRoom->id,
            'initiator_id' => auth()->id(),
            'type' => $type,
            'status' => 'initiated',
            'participants' => $participants,
            'call_id' => \Str::uuid(),
            'started_at' => now(),
            'settings' => [
                'video_enabled' => $type === 'video',
                'audio_enabled' => true,
                'screen_sharing_enabled' => true,
                'recording_enabled' => false,
                'max_participants' => 8
            ]
        ]);

        // Broadcast call initiation
        broadcast(new CallInitiated($call, $chatRoom));

        // Send notifications to participants
        $this->sendCallNotifications($call);

        return $call;
    }

    /**
     * End video/voice call
     */
    public function endCall(VideoCall $call): void
    {
        $call->update([
            'status' => 'ended',
            'ended_at' => now(),
            'duration_minutes' => $call->started_at->diffInMinutes(now())
        ]);

        broadcast(new CallEnded($call));

        // Send system message about call end
        if ($call->chatRoom) {
            $this->sendMessage($call->chatRoom, [
                'message' => "Call ended (Duration: {$call->duration_minutes} minutes)",
                'type' => 'system',
                'is_system_message' => true,
                'metadata' => [
                    'call_id' => $call->call_id,
                    'duration' => $call->duration_minutes,
                    'participants_count' => count($call->participants)
                ]
            ]);
        }
    }

    /**
     * Send message notifications to offline participants
     */
    private function sendMessageNotifications(ChatRoom $chatRoom, ChatMessage $message): void
    {
        $offlineParticipants = $chatRoom->participants()
            ->whereNotIn('user_id', $this->getOnlineUsers())
            ->where('user_id', '!=', $message->sender_id)
            ->with('user')
            ->get();

        foreach ($offlineParticipants as $participant) {
            if (!$participant->notification_settings['muted'] ?? false) {
                $notificationService = app(NotificationService::class);
                $notificationService->sendNotification($participant->user, [
                    'title' => "New message in {$chatRoom->name}",
                    'message' => $message->message,
                    'type' => 'chat_message',
                    'data' => [
                        'chat_room_id' => $chatRoom->id,
                        'message_id' => $message->id,
                        'sender_name' => $message->sender->full_name
                    ],
                    'action_url' => "/chat/{$chatRoom->id}"
                ]);
            }
        }
    }

    /**
     * Send call notifications
     */
    private function sendCallNotifications(VideoCall $call): void
    {
        $participants = User::whereIn('id', $call->participants)
            ->where('id', '!=', $call->initiator_id)
            ->get();

        foreach ($participants as $participant) {
            $notificationService = app(NotificationService::class);
            $notificationService->sendNotification($participant, [
                'title' => 'Incoming Call',
                'message' => "{$call->initiator->full_name} is calling you",
                'type' => 'incoming_call',
                'priority' => 'high',
                'data' => [
                    'call_id' => $call->call_id,
                    'chat_room_id' => $call->chat_room_id,
                    'call_type' => $call->type,
                    'initiator_name' => $call->initiator->full_name
                ],
                'action_url' => "/call/{$call->call_id}"
            ]);
        }
    }

    /**
     * Archive old chat rooms
     */
    public function archiveOldChatRooms(): int
    {
        $archivedCount = 0;
        
        $chatRooms = ChatRoom::where('is_active', true)
            ->where('last_activity_at', '<', now()->subDays(30))
            ->get();

        foreach ($chatRooms as $chatRoom) {
            $autoArchiveDays = $chatRoom->settings['auto_archive_after_days'] ?? 30;
            
            if ($chatRoom->last_activity_at < now()->subDays($autoArchiveDays)) {
                $chatRoom->update(['is_active' => false, 'archived_at' => now()]);
                $archivedCount++;
            }
        }

        return $archivedCount;
    }

    /**
     * Get chat room statistics
     */
    public function getChatRoomStats(ChatRoom $chatRoom): array
    {
        return [
            'total_messages' => $chatRoom->messages()->count(),
            'total_participants' => $chatRoom->participants()->count(),
            'active_participants' => $chatRoom->participants()
                ->whereIn('user_id', $this->getOnlineUsers())
                ->count(),
            'files_shared' => $chatRoom->messages()
                ->where('message_type', 'file')
                ->count(),
            'voice_messages' => $chatRoom->messages()
                ->where('message_type', 'voice')
                ->count(),
            'total_calls' => $chatRoom->videoCalls()->count(),
            'last_activity' => $chatRoom->last_activity_at,
            'created_at' => $chatRoom->created_at,
        ];
    }
}
