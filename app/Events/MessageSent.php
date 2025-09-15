<?php

namespace App\Events;

use App\Models\ChatMessage;
use App\Models\ChatRoom;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $chatRoom;

    /**
     * Create a new event instance.
     */
    public function __construct(ChatMessage $message, ChatRoom $chatRoom)
    {
        $this->message = $message;
        $this->chatRoom = $chatRoom;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat-room.' . $this->chatRoom->id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'message' => [
                'id' => $this->message->id,
                'chat_room_id' => $this->message->chat_room_id,
                'sender_id' => $this->message->sender_id,
                'sender' => [
                    'id' => $this->message->sender->id,
                    'name' => $this->message->sender->full_name,
                    'avatar' => $this->message->sender->avatar_url ?? null,
                    'role' => $this->message->sender->role,
                ],
                'message' => $this->message->message,
                'message_type' => $this->message->message_type,
                'attachments' => $this->message->attachments,
                'reply_to_id' => $this->message->reply_to_id,
                'reply_to' => $this->message->replyTo ? [
                    'id' => $this->message->replyTo->id,
                    'message' => $this->message->replyTo->message,
                    'sender_name' => $this->message->replyTo->sender->full_name,
                ] : null,
                'is_system_message' => $this->message->is_system_message,
                'priority' => $this->message->priority,
                'created_at' => $this->message->created_at->toISOString(),
                'formatted_time' => $this->message->created_at->format('H:i'),
            ],
            'chat_room' => [
                'id' => $this->chatRoom->id,
                'name' => $this->chatRoom->name,
                'type' => $this->chatRoom->type,
                'last_activity_at' => $this->chatRoom->last_activity_at?->toISOString(),
            ],
            'timestamp' => now()->toISOString(),
        ];
    }
}
