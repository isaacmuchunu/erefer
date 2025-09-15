import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    MessageCircle, 
    Send, 
    Paperclip, 
    Mic, 
    Video, 
    Phone,
    Users,
    Settings,
    Search,
    MoreVertical,
    Smile,
    Reply,
    Edit,
    Trash2,
    Download
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface User {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
    role: string;
    is_online?: boolean;
}

interface ChatMessage {
    id: number;
    chat_room_id: number;
    sender_id: number;
    sender: User;
    message: string;
    message_type: 'text' | 'file' | 'image' | 'voice' | 'video' | 'system';
    attachments?: Array<{
        type: string;
        path: string;
        original_name?: string;
        size?: number;
        duration?: number;
    }>;
    reply_to_id?: number;
    reply_to?: {
        id: number;
        message: string;
        sender_name: string;
    };
    is_system_message: boolean;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    created_at: string;
    formatted_time: string;
    reactions?: Array<{
        emoji: string;
        count: number;
        users: User[];
    }>;
}

interface ChatRoom {
    id: number;
    name: string;
    type: string;
    description?: string;
    participants: Array<{
        user: User;
        role: string;
        joined_at: string;
    }>;
    last_activity_at?: string;
    unread_count?: number;
}

interface ChatInterfaceProps {
    chatRoom: ChatRoom;
    messages: ChatMessage[];
    currentUser: User;
    onlineUsers: User[];
    typingUsers: User[];
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    chatRoom,
    messages: initialMessages,
    currentUser,
    onlineUsers: initialOnlineUsers,
    typingUsers: initialTypingUsers
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<User[]>(initialOnlineUsers);
    const [typingUsers, setTypingUsers] = useState<User[]>(initialTypingUsers);
    const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
    const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Set up WebSocket listeners
    useEffect(() => {
        const channel = window.Echo.private(`chat-room.${chatRoom.id}`);
        
        channel.listen('message.sent', (e: any) => {
            setMessages(prev => [e.message, ...prev]);
        });

        channel.listen('user.typing', (e: any) => {
            if (e.user_id !== currentUser.id) {
                if (e.is_typing) {
                    setTypingUsers(prev => [...prev.filter(u => u.id !== e.user_id), { id: e.user_id, name: e.user_name }]);
                } else {
                    setTypingUsers(prev => prev.filter(u => u.id !== e.user_id));
                }
            }
        });

        return () => {
            channel.stopListening('message.sent');
            channel.stopListening('user.typing');
        };
    }, [chatRoom.id, currentUser.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() && !replyTo) return;

        try {
            const messageData: any = {
                message: newMessage.trim(),
                type: 'text',
                priority: 'normal'
            };

            if (replyTo) {
                messageData.reply_to_id = replyTo.id;
            }

            await axios.post(`/api/v1/chat/${chatRoom.id}/messages`, messageData);
            
            setNewMessage('');
            setReplyTo(null);
            handleStopTyping();
            
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
        }
    };

    const handleTyping = () => {
        if (!isTyping) {
            setIsTyping(true);
            axios.post(`/api/v1/chat/${chatRoom.id}/typing`, { is_typing: true });
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
            handleStopTyping();
        }, 3000);
    };

    const handleStopTyping = () => {
        if (isTyping) {
            setIsTyping(false);
            axios.post(`/api/v1/chat/${chatRoom.id}/typing`, { is_typing: false });
        }
        
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', `Shared ${file.name}`);

        try {
            await axios.post(`/api/v1/chat/${chatRoom.id}/share-file`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('File shared successfully');
        } catch (error) {
            console.error('Failed to share file:', error);
            toast.error('Failed to share file');
        }
    };

    const handleReaction = async (messageId: number, emoji: string) => {
        try {
            await axios.post(`/api/v1/chat/messages/${messageId}/reactions`, { emoji });
            setShowEmojiPicker(null);
        } catch (error) {
            console.error('Failed to add reaction:', error);
            toast.error('Failed to add reaction');
        }
    };

    const handleEditMessage = async (message: ChatMessage, newText: string) => {
        try {
            await axios.put(`/api/v1/chat/messages/${message.id}`, { message: newText });
            setEditingMessage(null);
            toast.success('Message edited successfully');
        } catch (error) {
            console.error('Failed to edit message:', error);
            toast.error('Failed to edit message');
        }
    };

    const handleDeleteMessage = async (messageId: number) => {
        if (!confirm('Are you sure you want to delete this message?')) return;

        try {
            await axios.delete(`/api/v1/chat/messages/${messageId}`);
            toast.success('Message deleted successfully');
        } catch (error) {
            console.error('Failed to delete message:', error);
            toast.error('Failed to delete message');
        }
    };

    const initiateCall = async (type: 'voice' | 'video') => {
        try {
            const participantIds = chatRoom.participants.map(p => p.user.id);
            await axios.post(`/api/v1/chat/${chatRoom.id}/calls`, {
                type,
                participants: participantIds
            });
            toast.success(`${type} call initiated`);
        } catch (error) {
            console.error('Failed to initiate call:', error);
            toast.error('Failed to initiate call');
        }
    };

    const formatMessageTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString();
        }
    };

    const renderMessage = (message: ChatMessage) => {
        const isOwnMessage = message.sender_id === currentUser.id;
        const isSystemMessage = message.is_system_message;

        if (isSystemMessage) {
            return (
                <div key={message.id} className="flex justify-center my-2">
                    <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                        {message.message}
                    </div>
                </div>
            );
        }

        return (
            <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                    {!isOwnMessage && (
                        <div className="flex items-center mb-1">
                            <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src={message.sender.avatar_url} />
                                <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-gray-700">{message.sender.name}</span>
                        </div>
                    )}
                    
                    <div className={`relative px-4 py-2 rounded-lg ${
                        isOwnMessage 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-900'
                    }`}>
                        {message.reply_to && (
                            <div className="mb-2 p-2 bg-black bg-opacity-10 rounded text-sm">
                                <div className="font-medium">{message.reply_to.sender_name}</div>
                                <div className="truncate">{message.reply_to.message}</div>
                            </div>
                        )}
                        
                        <div className="break-words">{message.message}</div>
                        
                        {message.attachments && message.attachments.map((attachment, index) => (
                            <div key={index} className="mt-2">
                                {attachment.type === 'image' && (
                                    <img 
                                        src={`/storage/${attachment.path}`} 
                                        alt="Shared image" 
                                        className="max-w-full rounded"
                                    />
                                )}
                                {attachment.type === 'file' && (
                                    <div className="flex items-center p-2 bg-black bg-opacity-10 rounded">
                                        <Paperclip className="h-4 w-4 mr-2" />
                                        <span className="flex-1 truncate">{attachment.original_name}</span>
                                        <Button size="sm" variant="ghost">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                                {attachment.type === 'audio' && (
                                    <audio controls className="max-w-full">
                                        <source src={`/storage/${attachment.path}`} type="audio/mpeg" />
                                    </audio>
                                )}
                            </div>
                        ))}
                        
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-xs opacity-70">
                                {formatMessageTime(message.created_at)}
                            </span>
                            
                            {!isSystemMessage && (
                                <div className="flex items-center space-x-1">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setReplyTo(message)}
                                        className="h-6 w-6 p-0"
                                    >
                                        <Reply className="h-3 w-3" />
                                    </Button>
                                    
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                                        className="h-6 w-6 p-0"
                                    >
                                        <Smile className="h-3 w-3" />
                                    </Button>
                                    
                                    {isOwnMessage && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setEditingMessage(message)}
                                                className="h-6 w-6 p-0"
                                            >
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                            
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDeleteMessage(message.id)}
                                                className="h-6 w-6 p-0"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* Emoji picker */}
                        {showEmojiPicker === message.id && (
                            <div className="absolute bottom-full mb-2 bg-white border rounded-lg shadow-lg p-2 z-10">
                                <div className="flex space-x-1">
                                    {['👍', '❤️', '😂', '😮', '😢', '😡'].map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleReaction(message.id, emoji)}
                                            className="hover:bg-gray-100 p-1 rounded"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Reactions */}
                        {message.reactions && message.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {message.reactions.map((reaction, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                        {reaction.emoji} {reaction.count}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center">
                    <div className="flex -space-x-2 mr-3">
                        {chatRoom.participants.slice(0, 3).map((participant, index) => (
                            <Avatar key={participant.user.id} className="h-8 w-8 border-2 border-white">
                                <AvatarImage src={participant.user.avatar_url} />
                                <AvatarFallback>{participant.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                    <div>
                        <h3 className="font-semibold">{chatRoom.name}</h3>
                        <p className="text-sm text-gray-500">
                            {onlineUsers.length} online • {chatRoom.participants.length} members
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => initiateCall('voice')}
                    >
                        <Phone className="h-4 w-4" />
                    </Button>
                    
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => initiateCall('video')}
                    >
                        <Video className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="outline" size="sm">
                        <Users className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(renderMessage)}
                
                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                    <div className="flex items-center text-sm text-gray-500">
                        <div className="flex space-x-1 mr-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        {typingUsers.map(user => user.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Reply Preview */}
            {replyTo && (
                <div className="px-4 py-2 bg-gray-50 border-t border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium">Replying to {replyTo.sender.name}</div>
                            <div className="text-sm text-gray-600 truncate">{replyTo.message}</div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyTo(null)}
                        >
                            ×
                        </Button>
                    </div>
                </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Paperclip className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex-1">
                        <Input
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleTyping();
                            }}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Type a message..."
                            className="w-full"
                        />
                    </div>
                    
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsRecording(!isRecording)}
                        className={isRecording ? 'bg-red-500 text-white' : ''}
                    >
                        <Mic className="h-4 w-4" />
                    </Button>
                    
                    <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        size="sm"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                multiple
            />
        </div>
    );
};
