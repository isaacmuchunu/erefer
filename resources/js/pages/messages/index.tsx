import { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealTimeChat } from '@/hooks/useRealTimeChat';
import {
    MessageSquare,
    Search,
    Plus,
    Send,
    Paperclip,
    Phone,
    Video,
    MoreVertical,
    Star,
    Archive,
    Trash2,
    Users,
    Clock,
    Check,
    CheckCheck,
    Mail,
    MessageCircle,
    Mic,
    Image,
    File,
    MapPin,
    Smile,
    Settings,
    AlertCircle,
    CheckCircle,
    Building2,
    Stethoscope,
    HeartPulse,
    Filter,
    Loader2
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Messages',
        href: '/messages',
    },
];

interface MessagesProps {
    auth: {
        user: any;
    };
    chatRooms?: any[];
    emails?: any[];
    whatsappConversations?: any[];
    emailFolders?: any[];
}

export default function Messages(props: MessagesProps) {
    const { user } = props.auth;
    const { chatRooms = [], emails = [], whatsappConversations = [], emailFolders = [] } = props;

    const [activeTab, setActiveTab] = useState('chat');
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isComposingEmail, setIsComposingEmail] = useState(false);
    const [activeCall, setActiveCall] = useState<any>(null);
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Real-time chat functionality
    const {
        messages: realTimeMessages,
        setMessages: setRealTimeMessages,
        typingUsers,
        onlineUsers,
        isConnected,
        sendMessage: sendRealTimeMessage,
        sendTypingIndicator,
        markAsRead,
    } = useRealTimeChat(selectedConversation?.id, user);

    // Load data based on active tab
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                switch (activeTab) {
                    case 'chat':
                        // Use chat rooms from props or load from API
                        if (chatRooms.length > 0) {
                            setConversations(chatRooms);
                        } else {
                            const chatResponse = await fetch('/api/chat/rooms');
                            if (chatResponse.ok) {
                                const chatData = await chatResponse.json();
                                setConversations(chatData.data || []);
                            }
                        }
                        break;
                    case 'email':
                        // Use emails from props or load from API
                        if (emails.length > 0) {
                            setConversations(emails);
                        } else {
                            const emailResponse = await fetch('/api/emails');
                            if (emailResponse.ok) {
                                const emailData = await emailResponse.json();
                                setConversations(emailData.data || []);
                            }
                        }
                        break;
                    case 'whatsapp':
                        // Use WhatsApp conversations from props or load from API
                        if (whatsappConversations.length > 0) {
                            setConversations(whatsappConversations);
                        } else {
                            const whatsappResponse = await fetch('/api/whatsapp/conversations');
                            if (whatsappResponse.ok) {
                                const whatsappData = await whatsappResponse.json();
                                setConversations(whatsappData.data || []);
                            }
                        }
                        break;
                    case 'calls':
                        // Load call history
                        const callResponse = await fetch('/api/calls/history');
                        if (callResponse.ok) {
                            const callData = await callResponse.json();
                            setConversations(callData.data || []);
                        }
                        break;
                }
            } catch (error) {
                console.error('Error loading data:', error);
                setConversations([]);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [activeTab, chatRooms, emails, whatsappConversations]);

    // Initialize with mock data if no conversations are available
    useEffect(() => {
        if (conversations.length === 0 && !loading) {
            const mockConversations = [
                {
                    id: 1,
                    name: 'Dr. Sarah Johnson',
                    role: 'Doctor',
                    lastMessage: 'Patient referral completed successfully',
                    timestamp: '2 min ago',
                    unreadCount: 2,
                    avatar: '/avatars/doctor1.jpg',
                    status: 'online',
                    type: 'individual'
                },
                {
                    id: 2,
                    name: 'Emergency Dispatch',
                    role: 'Dispatcher',
                    lastMessage: 'Ambulance dispatched to location',
                    timestamp: '5 min ago',
                    unreadCount: 0,
                    avatar: '/avatars/dispatch.jpg',
                    status: 'online',
                    type: 'individual'
                },
                {
                    id: 3,
                    name: 'Nurse Station A',
                    role: 'Nurse',
                    lastMessage: 'Patient vitals updated',
                    timestamp: '10 min ago',
                    unreadCount: 1,
                    avatar: '/avatars/nurse1.jpg',
                    status: 'away',
                    type: 'individual'
                }
            ];
            setConversations(mockConversations);
        }
    }, [conversations.length, loading]);

    // Mock data for messages
    const messages = selectedConversation ? [
        {
            id: 1,
            senderId: selectedConversation.id === 1 ? 2 : 1,
            senderName: selectedConversation.name,
            message: 'Hello, I need to discuss the patient referral for John Doe.',
            timestamp: '10:30 AM',
            isRead: true,
            isOwn: false
        },
        {
            id: 2,
            senderId: user.id,
            senderName: user.name,
            message: 'Sure, I have reviewed the case. The patient needs immediate cardiac evaluation.',
            timestamp: '10:32 AM',
            isRead: true,
            isOwn: true
        },
        {
            id: 3,
            senderId: selectedConversation.id === 1 ? 2 : 1,
            senderName: selectedConversation.name,
            message: selectedConversation.lastMessage,
            timestamp: '10:35 AM',
            isRead: false,
            isOwn: false
        }
    ] : [];

    const handleSendMessage = async () => {
        if (newMessage.trim() && selectedConversation) {
            try {
                // Send message via real-time system
                await sendRealTimeMessage(newMessage, 'text');
                setNewMessage('');

                // Stop typing indicator
                if (typingTimeout) {
                    clearTimeout(typingTimeout);
                    setTypingTimeout(null);
                }
                sendTypingIndicator(false);

                // Scroll to bottom
                scrollToBottom();
            } catch (error) {
                console.error('Failed to send message:', error);
                // Fallback behavior for demo
                console.log('Sending message:', newMessage);
                setNewMessage('');
            }
        }
    };

    // Handle typing indicator
    const handleTyping = (value: string) => {
        setNewMessage(value);

        // Send typing indicator
        sendTypingIndicator(true);

        // Clear existing timeout
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        // Set new timeout to stop typing indicator
        const timeout = setTimeout(() => {
            sendTypingIndicator(false);
        }, 2000);

        setTypingTimeout(timeout);
    };

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Auto-scroll when new messages arrive
    useEffect(() => {
        if (realTimeMessages.length > 0) {
            scrollToBottom();
        }
    }, [realTimeMessages]);

    // Mark messages as read when conversation is selected
    useEffect(() => {
        if (selectedConversation && isConnected) {
            markAsRead();
        }
    }, [selectedConversation, isConnected, markAsRead]);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <AppLayout
            user={user}
            breadcrumbs={breadcrumbs}
            notificationCount={5}
            messageCount={3}
        >
            <Head title="Messages" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-white">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Communications</h1>
                        <p className="text-gray-600 mt-1">Secure messaging across the healthcare network</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            onClick={() => setIsComposingEmail(true)}
                        >
                            <Mail className="h-4 w-4 mr-2" />
                            Compose Email
                        </Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                            <Plus className="h-4 w-4 mr-2" />
                            New Chat
                        </Button>
                    </div>
                </div>

                {/* Communication Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <TabsList className="grid w-full grid-cols-4 bg-emerald-50 border border-emerald-100">
                        <TabsTrigger
                            value="chat"
                            className="flex items-center space-x-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                        >
                            <MessageSquare className="h-4 w-4" />
                            <span>Chat</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="email"
                            className="flex items-center space-x-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                        >
                            <Mail className="h-4 w-4" />
                            <span>Email</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="whatsapp"
                            className="flex items-center space-x-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                        >
                            <MessageCircle className="h-4 w-4" />
                            <span>WhatsApp</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="calls"
                            className="flex items-center space-x-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                        >
                            <Video className="h-4 w-4" />
                            <span>Calls</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Chat Tab */}
                    <TabsContent value="chat" className="flex-1 mt-0">
                        <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 h-[600px]">
                    {/* Conversations List */}
                    <div className="col-span-4">
                        <Card className="h-full flex flex-col border-emerald-100 shadow-sm">
                            <CardHeader className="p-4 pb-2 border-b border-emerald-50">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-semibold text-gray-900">Conversations</CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <Button variant="ghost" size="sm" className="text-emerald-700 hover:bg-emerald-50">
                                            <Filter className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-emerald-700 hover:bg-emerald-50">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
                                    <Input
                                        placeholder="Search conversations..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 p-0 overflow-y-auto">
                                <div className="divide-y divide-gray-100">
                                    {loading ? (
                                        <div className="flex items-center justify-center h-32">
                                            <div className="text-center">
                                                <Loader2 className="animate-spin h-8 w-8 text-emerald-600 mx-auto" />
                                                <p className="text-sm text-gray-500 mt-2">Loading conversations...</p>
                                            </div>
                                        </div>
                                    ) : conversations.length === 0 ? (
                                        <div className="flex items-center justify-center h-32">
                                            <div className="text-center">
                                                <MessageSquare className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                                                <p className="text-sm text-gray-500">No conversations yet</p>
                                                <p className="text-xs text-gray-400 mt-1">Start a new conversation to get started</p>
                                            </div>
                                        </div>
                                    ) : (
                                        conversations.map((conversation) => (
                                        <div
                                            key={conversation.id}
                                            onClick={() => setSelectedConversation(conversation)}
                                            className={`p-4 hover:bg-emerald-25 cursor-pointer transition-colors border-b border-emerald-50 ${
                                                selectedConversation?.id === conversation.id ? 'bg-emerald-50 border-r-2 border-emerald-500' : ''
                                            }`}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className="relative">
                                                    <Avatar className="h-10 w-10 border-2 border-emerald-100">
                                                        <AvatarImage src={conversation.avatar} />
                                                        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-medium">
                                                            {conversation.type === 'group' ? (
                                                                <Users className="h-5 w-5" />
                                                            ) : (
                                                                getInitials(conversation.name)
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {conversation.status === 'online' && (
                                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-semibold text-gray-900 truncate">{conversation.name}</p>
                                                        <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                                                    </div>
                                                    {conversation.role && (
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700">
                                                                {conversation.role}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                    <p className="text-sm text-gray-600 truncate mt-1">{conversation.lastMessage}</p>
                                                </div>
                                                {conversation.unreadCount > 0 && (
                                                    <Badge className="bg-emerald-600 text-white text-xs">
                                                        {conversation.unreadCount}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chat Area */}
                    <div className="col-span-8">
                        <Card className="h-full flex flex-col border-emerald-100 shadow-sm">
                            {selectedConversation ? (
                                <>
                                    {/* Chat Header */}
                                    <CardHeader className="p-4 border-b border-emerald-50 bg-emerald-25">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="relative">
                                                    <Avatar className="h-10 w-10 border-2 border-emerald-200">
                                                        <AvatarImage src={selectedConversation.avatar} />
                                                        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-medium">
                                                            {selectedConversation.type === 'group' ? (
                                                                <Users className="h-5 w-5" />
                                                            ) : (
                                                                getInitials(selectedConversation.name)
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {selectedConversation.status === 'online' && (
                                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{selectedConversation.name}</h3>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex items-center space-x-1">
                                                            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                                            <p className="text-sm text-emerald-600">
                                                                {selectedConversation.status === 'online' ? 'Online' : 'Offline'}
                                                            </p>
                                                        </div>
                                                        {selectedConversation.role && (
                                                            <>
                                                                <span className="text-gray-400">•</span>
                                                                <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700">
                                                                    {selectedConversation.role}
                                                                </Badge>
                                                            </>
                                                        )}
                                                        {typingUsers.length > 0 && (
                                                            <>
                                                                <span className="text-gray-400">•</span>
                                                                <p className="text-xs text-emerald-600 animate-pulse">
                                                                    {typingUsers.length === 1
                                                                        ? `${typingUsers[0].name} is typing...`
                                                                        : `${typingUsers.length} people are typing...`
                                                                    }
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button variant="ghost" size="sm" className="text-emerald-700 hover:bg-emerald-100">
                                                    <Phone className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-emerald-700 hover:bg-emerald-100">
                                                    <Video className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-emerald-700 hover:bg-emerald-100">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    {/* Messages */}
                                    <CardContent className="flex-1 p-4 overflow-y-auto">
                                        <div className="space-y-4">
                                            {messages.map((message) => (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                        message.isOwn 
                                                            ? 'bg-blue-500 text-white' 
                                                            : 'bg-gray-100 text-gray-900'
                                                    }`}>
                                                        <p className="text-sm">{message.message}</p>
                                                        <div className={`flex items-center justify-between mt-1 ${
                                                            message.isOwn ? 'text-blue-100' : 'text-gray-500'
                                                        }`}>
                                                            <span className="text-xs">{message.timestamp}</span>
                                                            {message.isOwn && (
                                                                <div className="ml-2">
                                                                    {message.isRead ? (
                                                                        <CheckCheck className="h-3 w-3" />
                                                                    ) : (
                                                                        <Check className="h-3 w-3" />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    </CardContent>

                                    {/* Message Input */}
                                    <div className="p-4 border-t border-emerald-50 bg-emerald-25">
                                        <div className="flex items-center space-x-3">
                                            <Button variant="ghost" size="sm" className="text-emerald-700 hover:bg-emerald-100">
                                                <Paperclip className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-emerald-700 hover:bg-emerald-100">
                                                <Image className="h-4 w-4" />
                                            </Button>
                                            <Input
                                                placeholder="Type a secure message..."
                                                value={newMessage}
                                                onChange={(e) => handleTyping(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                className="flex-1 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                            <Button variant="ghost" size="sm" className="text-emerald-700 hover:bg-emerald-100">
                                                <Smile className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                onClick={handleSendMessage}
                                                disabled={!newMessage.trim()}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                            >
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center bg-emerald-25">
                                    <div className="text-center">
                                        <div className="bg-emerald-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                                            <MessageSquare className="h-12 w-12 text-emerald-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                                        <p className="text-gray-600 mb-4">Choose a conversation from the list to start secure messaging</p>
                                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Start New Conversation
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
