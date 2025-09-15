import { useEffect, useState, useCallback } from 'react';
import Echo from '../echo';

export const useRealTimeChat = (chatRoomId, user) => {
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    // Join chat room channel
    useEffect(() => {
        if (!chatRoomId || !user) return;

        const channel = Echo.private(`chat-room.${chatRoomId}`);

        // Connection status
        channel.subscribed(() => {
            setIsConnected(true);
            console.log(`Connected to chat room ${chatRoomId}`);
        });

        channel.error((error) => {
            setIsConnected(false);
            console.error('Echo connection error:', error);
        });

        // Listen for new messages
        channel.listen('.message.sent', (event) => {
            console.log('New message received:', event);
            setMessages(prevMessages => {
                // Avoid duplicates
                if (prevMessages.some(msg => msg.id === event.message.id)) {
                    return prevMessages;
                }
                return [...prevMessages, event.message];
            });
        });

        // Listen for typing indicators
        channel.listen('.user.typing', (event) => {
            console.log('User typing event:', event);
            if (event.user_id !== user.id) {
                setTypingUsers(prevTyping => {
                    if (event.is_typing) {
                        // Add user to typing list if not already there
                        if (!prevTyping.some(u => u.id === event.user_id)) {
                            return [...prevTyping, {
                                id: event.user_id,
                                name: event.user_name,
                                timestamp: event.timestamp
                            }];
                        }
                        return prevTyping;
                    } else {
                        // Remove user from typing list
                        return prevTyping.filter(u => u.id !== event.user_id);
                    }
                });
            }
        });

        // Listen for user status changes
        channel.listen('.user.status.changed', (event) => {
            console.log('User status changed:', event);
            setOnlineUsers(prevUsers => {
                const updatedUsers = prevUsers.filter(u => u.id !== event.user_id);
                if (event.status === 'online') {
                    return [...updatedUsers, {
                        id: event.user_id,
                        name: event.user_name,
                        status: event.status,
                        last_seen: event.timestamp
                    }];
                }
                return updatedUsers;
            });
        });

        // Cleanup on unmount
        return () => {
            channel.stopListening('.message.sent');
            channel.stopListening('.user.typing');
            channel.stopListening('.user.status.changed');
            Echo.leaveChannel(`private-chat-room.${chatRoomId}`);
            setIsConnected(false);
        };
    }, [chatRoomId, user]);

    // Send typing indicator
    const sendTypingIndicator = useCallback((isTyping) => {
        if (!chatRoomId || !user) return;

        fetch(`/api/chat/rooms/${chatRoomId}/typing`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
            },
            body: JSON.stringify({
                is_typing: isTyping,
            }),
        }).catch(error => {
            console.error('Error sending typing indicator:', error);
        });
    }, [chatRoomId, user]);

    // Send message
    const sendMessage = useCallback(async (content, type = 'text', attachments = []) => {
        if (!chatRoomId || !user || !content.trim()) return;

        try {
            const response = await fetch(`/api/chat/rooms/${chatRoomId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
                body: JSON.stringify({
                    content,
                    type,
                    attachments,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }, [chatRoomId, user]);

    // Mark messages as read
    const markAsRead = useCallback(async () => {
        if (!chatRoomId || !user) return;

        try {
            await fetch(`/api/chat/rooms/${chatRoomId}/mark-read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
            });
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    }, [chatRoomId, user]);

    // Clean up typing indicators older than 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setTypingUsers(prevTyping => {
                const now = new Date();
                return prevTyping.filter(user => {
                    const userTime = new Date(user.timestamp);
                    return (now - userTime) < 5000; // 5 seconds
                });
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return {
        messages,
        setMessages,
        typingUsers,
        onlineUsers,
        isConnected,
        sendMessage,
        sendTypingIndicator,
        markAsRead,
    };
};
