import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
    MessageSquare,
    Search,
    Plus,
    Send,
    Paperclip,
    Phone,
    Video,
    MoreVertical,
    Mail,
    MessageCircle,
    Mic,
    Image,
    File,
    MapPin,
    Smile,
    Users,
    Clock,
    Check,
    CheckCheck,
    PhoneCall,
    VideoIcon,
    MicIcon,
    Settings
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Communications',
        href: '/communications',
    },
];

interface CommunicationsProps {
    auth: {
        user: any;
    };
    chatRooms?: any[];
    emails?: any[];
    whatsappConversations?: any[];
    emailFolders?: any[];
    activeCalls?: any[];
}

export default function Communications(props: CommunicationsProps) {
    const { user } = props.auth;
    const { 
        chatRooms = [], 
        emails = [], 
        whatsappConversations = [], 
        emailFolders = [],
        activeCalls = []
    } = props;
    
    const [activeTab, setActiveTab] = useState('chat');
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isComposingEmail, setIsComposingEmail] = useState(false);
    const [activeCall, setActiveCall] = useState<any>(null);
    const [isRecording, setIsRecording] = useState(false);

    // Mock data for demonstration
    const mockChatRooms = [
        {
            id: 1,
            name: 'Dr. Sarah Johnson',
            type: 'direct',
            lastMessage: 'Patient referral has been reviewed and approved.',
            timestamp: '2 min ago',
            unreadCount: 2,
            isOnline: true,
            avatar: null
        },
        {
            id: 2,
            name: 'Emergency Team',
            type: 'group',
            lastMessage: 'Ambulance ETA is 15 minutes.',
            timestamp: '5 min ago',
            unreadCount: 0,
            isOnline: false,
            avatar: null
        }
    ];

    const mockEmails = [
        {
            id: 1,
            from: 'dr.johnson@hospital.com',
            fromName: 'Dr. Sarah Johnson',
            subject: 'Patient Referral Update',
            preview: 'The patient referral for John Doe has been processed...',
            timestamp: '10 min ago',
            isRead: false,
            hasAttachments: true
        },
        {
            id: 2,
            from: 'admin@healthsystem.com',
            fromName: 'Health System Admin',
            subject: 'System Maintenance Notice',
            preview: 'Scheduled maintenance will occur tonight...',
            timestamp: '1 hour ago',
            isRead: true,
            hasAttachments: false
        }
    ];

    const mockWhatsAppConversations = [
        {
            id: 1,
            contactName: 'John Doe',
            contactPhone: '+1234567890',
            lastMessage: 'Thank you for the appointment confirmation',
            timestamp: '5 min ago',
            unreadCount: 1,
            status: 'active'
        }
    ];

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            const response = await fetch(`/api/chat/rooms/${selectedConversation.id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    message: newMessage,
                    type: 'text'
                })
            });

            if (response.ok) {
                setNewMessage('');
                // Refresh messages
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleStartCall = async (type: 'voice' | 'video') => {
        if (!selectedConversation) return;

        try {
            const response = await fetch(`/api/chat/rooms/${selectedConversation.id}/call`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    type,
                    participants: [selectedConversation.id]
                })
            });

            if (response.ok) {
                const callData = await response.json();
                setActiveCall(callData.call);
            }
        } catch (error) {
            console.error('Error starting call:', error);
        }
    };

    const handleComposeEmail = () => {
        router.visit('/emails/compose');
    };

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
            <Head title="Communications" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-gray-50">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Communications</h1>
                        <p className="text-gray-600">Unified messaging, email, WhatsApp, and video calls</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button onClick={handleComposeEmail}>
                            <Mail className="h-4 w-4 mr-2" />
                            Compose Email
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    New
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => router.visit('/chat/new')}>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    New Chat
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleComposeEmail}>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Compose Email
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.visit('/whatsapp/new')}>
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    WhatsApp Message
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Active Call Banner */}
                {activeCall && (
                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <div>
                                        <p className="font-medium text-green-800">
                                            {activeCall.type === 'video' ? 'Video Call' : 'Voice Call'} in Progress
                                        </p>
                                        <p className="text-sm text-green-600">
                                            {activeCall.participants?.length || 0} participants
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <Button size="sm" variant="outline">
                                        <MicIcon className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <VideoIcon className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => setActiveCall(null)}>
                                        End Call
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Communication Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="chat" className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4" />
                            <span>Chat</span>
                            {mockChatRooms.reduce((acc, room) => acc + room.unreadCount, 0) > 0 && (
                                <Badge className="ml-2 bg-blue-500 text-white text-xs">
                                    {mockChatRooms.reduce((acc, room) => acc + room.unreadCount, 0)}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="email" className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>Email</span>
                            {mockEmails.filter(email => !email.isRead).length > 0 && (
                                <Badge className="ml-2 bg-red-500 text-white text-xs">
                                    {mockEmails.filter(email => !email.isRead).length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="whatsapp" className="flex items-center space-x-2">
                            <MessageCircle className="h-4 w-4" />
                            <span>WhatsApp</span>
                            {mockWhatsAppConversations.reduce((acc, conv) => acc + conv.unreadCount, 0) > 0 && (
                                <Badge className="ml-2 bg-green-500 text-white text-xs">
                                    {mockWhatsAppConversations.reduce((acc, conv) => acc + conv.unreadCount, 0)}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="calls" className="flex items-center space-x-2">
                            <Video className="h-4 w-4" />
                            <span>Calls</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Chat Tab Content */}
                    <TabsContent value="chat" className="flex-1 mt-4">
                        <div className="grid grid-cols-12 gap-6 h-[600px]">
                            {/* Chat Rooms List */}
                            <div className="col-span-4">
                                <Card className="h-full flex flex-col">
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">Conversations</CardTitle>
                                            <Button variant="ghost" size="sm">
                                                <Settings className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                placeholder="Search conversations..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 p-0 overflow-y-auto">
                                        <div className="divide-y divide-gray-100">
                                            {mockChatRooms.map((room) => (
                                                <div
                                                    key={room.id}
                                                    onClick={() => setSelectedConversation(room)}
                                                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                                        selectedConversation?.id === room.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <div className="relative">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarImage src={room.avatar} />
                                                                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                                                                    {room.type === 'group' ? (
                                                                        <Users className="h-5 w-5" />
                                                                    ) : (
                                                                        getInitials(room.name)
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            {room.isOnline && room.type === 'direct' && (
                                                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <p className="font-medium text-gray-900 truncate">{room.name}</p>
                                                                <span className="text-xs text-gray-500">{room.timestamp}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-600 truncate mt-1">{room.lastMessage}</p>
                                                        </div>
                                                        {room.unreadCount > 0 && (
                                                            <Badge className="bg-blue-500 text-white text-xs">
                                                                {room.unreadCount}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Chat Area */}
                            <div className="col-span-8">
                                <Card className="h-full flex flex-col">
                                    {selectedConversation ? (
                                        <>
                                            {/* Chat Header */}
                                            <CardHeader className="p-4 border-b">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={selectedConversation.avatar} />
                                                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                                                                {selectedConversation.type === 'group' ? (
                                                                    <Users className="h-5 w-5" />
                                                                ) : (
                                                                    getInitials(selectedConversation.name)
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <h3 className="font-medium text-gray-900">{selectedConversation.name}</h3>
                                                            <p className="text-sm text-gray-500">
                                                                {selectedConversation.isOnline && selectedConversation.type === 'direct' ? 'Online' : 'Group Chat'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Button variant="ghost" size="sm" onClick={() => handleStartCall('voice')}>
                                                            <Phone className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleStartCall('video')}>
                                                            <Video className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            {/* Messages Area */}
                                            <CardContent className="flex-1 p-4 overflow-y-auto">
                                                <div className="space-y-4">
                                                    {/* Sample messages */}
                                                    <div className="flex justify-start">
                                                        <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
                                                            <p className="text-sm">{selectedConversation.lastMessage}</p>
                                                            <div className="flex items-center justify-between mt-1 text-gray-500">
                                                                <span className="text-xs">{selectedConversation.timestamp}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>

                                            {/* Message Input */}
                                            <div className="p-4 border-t">
                                                <div className="flex items-center space-x-2">
                                                    <Button variant="ghost" size="sm">
                                                        <Paperclip className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <Image className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <Mic className="h-4 w-4" />
                                                    </Button>
                                                    <Input
                                                        placeholder="Type a message..."
                                                        value={newMessage}
                                                        onChange={(e) => setNewMessage(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                        className="flex-1"
                                                    />
                                                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                                                        <Send className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center">
                                            <div className="text-center">
                                                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                                                <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Email Tab Content */}
                    <TabsContent value="email" className="flex-1 mt-4">
                        <div className="grid grid-cols-12 gap-6 h-[600px]">
                            {/* Email List */}
                            <div className="col-span-5">
                                <Card className="h-full flex flex-col">
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">Inbox</CardTitle>
                                            <Button size="sm" onClick={handleComposeEmail}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Compose
                                            </Button>
                                        </div>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                placeholder="Search emails..."
                                                className="pl-10"
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 p-0 overflow-y-auto">
                                        <div className="divide-y divide-gray-100">
                                            {mockEmails.map((email) => (
                                                <div
                                                    key={email.id}
                                                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                                        !email.isRead ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white text-sm">
                                                                {getInitials(email.fromName)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <p className={`font-medium truncate ${!email.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                                                    {email.fromName}
                                                                </p>
                                                                <div className="flex items-center space-x-1">
                                                                    {email.hasAttachments && (
                                                                        <Paperclip className="h-3 w-3 text-gray-400" />
                                                                    )}
                                                                    <span className="text-xs text-gray-500">{email.timestamp}</span>
                                                                </div>
                                                            </div>
                                                            <p className={`text-sm truncate ${!email.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                                                {email.subject}
                                                            </p>
                                                            <p className="text-sm text-gray-500 truncate mt-1">{email.preview}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Email Content */}
                            <div className="col-span-7">
                                <Card className="h-full flex flex-col">
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="text-center">
                                            <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Select an email</h3>
                                            <p className="text-gray-500">Choose an email from the list to read it</p>
                                            <Button className="mt-4" onClick={handleComposeEmail}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Compose New Email
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* WhatsApp Tab Content */}
                    <TabsContent value="whatsapp" className="flex-1 mt-4">
                        <div className="grid grid-cols-12 gap-6 h-[600px]">
                            {/* WhatsApp Conversations */}
                            <div className="col-span-4">
                                <Card className="h-full flex flex-col">
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">WhatsApp</CardTitle>
                                            <Button variant="ghost" size="sm">
                                                <Settings className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                placeholder="Search contacts..."
                                                className="pl-10"
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 p-0 overflow-y-auto">
                                        <div className="divide-y divide-gray-100">
                                            {mockWhatsAppConversations.map((conversation) => (
                                                <div
                                                    key={conversation.id}
                                                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white">
                                                                {getInitials(conversation.contactName)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <p className="font-medium text-gray-900 truncate">{conversation.contactName}</p>
                                                                <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-500 truncate">{conversation.contactPhone}</p>
                                                            <p className="text-sm text-gray-600 truncate mt-1">{conversation.lastMessage}</p>
                                                        </div>
                                                        {conversation.unreadCount > 0 && (
                                                            <Badge className="bg-green-500 text-white text-xs">
                                                                {conversation.unreadCount}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* WhatsApp Chat Area */}
                            <div className="col-span-8">
                                <Card className="h-full flex flex-col">
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="text-center">
                                            <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">WhatsApp Business</h3>
                                            <p className="text-gray-500">Select a conversation to start messaging</p>
                                            <Button className="mt-4">
                                                <Plus className="h-4 w-4 mr-2" />
                                                New WhatsApp Message
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Calls Tab Content */}
                    <TabsContent value="calls" className="flex-1 mt-4">
                        <div className="grid grid-cols-12 gap-6 h-[600px]">
                            <div className="col-span-12">
                                <Card className="h-full flex flex-col">
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-lg">Video & Voice Calls</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex items-center justify-center">
                                        <div className="text-center">
                                            <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Calls</h3>
                                            <p className="text-gray-500 mb-4">Start a video or voice call from any conversation</p>
                                            <div className="flex justify-center space-x-4">
                                                <Button>
                                                    <Video className="h-4 w-4 mr-2" />
                                                    Start Video Call
                                                </Button>
                                                <Button variant="outline">
                                                    <Phone className="h-4 w-4 mr-2" />
                                                    Start Voice Call
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
