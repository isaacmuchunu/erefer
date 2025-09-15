import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Mail,
    Search,
    Plus,
    Paperclip,
    Star,
    Archive,
    Trash2,
    MoreVertical,
    Inbox,
    Send,
    FileText,
    AlertCircle
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Communications',
        href: '/communications',
    },
    {
        title: 'Email',
        href: '/emails',
    },
];

interface EmailsIndexProps {
    auth: {
        user: any;
    };
    folders?: any[];
    currentFolder?: any;
    emails?: any;
    folderCounts?: any;
}

export default function EmailsIndex(props: EmailsIndexProps) {
    const { user } = props.auth;
    const { folders = [], currentFolder, emails, folderCounts = {} } = props;

    const [searchQuery, setSearchQuery] = useState('');

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    return (
        <AppLayout
            user={user}
            breadcrumbs={breadcrumbs}
            notificationCount={5}
            messageCount={3}
        >
            <Head title="Email" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-gray-50">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Email</h1>
                        <p className="text-gray-600">Manage your email communications</p>
                    </div>
                    <Button onClick={() => router.visit('/emails/compose')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Compose Email
                    </Button>
                </div>

                {/* Email Interface */}
                <div className="grid grid-cols-12 gap-6 h-[600px]">
                    {/* Sidebar - Folders */}
                    <div className="col-span-3">
                        <Card className="h-full flex flex-col">
                            <CardHeader className="p-4">
                                <CardTitle className="text-lg">Folders</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 p-0">
                                <div className="space-y-1">
                                    {folders.map((folder) => (
                                        <div
                                            key={folder.id}
                                            onClick={() => router.visit(`/emails?folder=${folder.id}`)}
                                            className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                                                currentFolder?.id === folder.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                {folder.type === 'inbox' && <Inbox className="h-4 w-4 text-blue-600" />}
                                                {folder.type === 'sent' && <Send className="h-4 w-4 text-green-600" />}
                                                {folder.type === 'drafts' && <FileText className="h-4 w-4 text-yellow-600" />}
                                                {folder.type === 'trash' && <Trash2 className="h-4 w-4 text-red-600" />}
                                                {folder.type === 'spam' && <AlertCircle className="h-4 w-4 text-orange-600" />}
                                                <span className="font-medium text-gray-900">{folder.name}</span>
                                            </div>
                                            {folderCounts[folder.id] > 0 && (
                                                <Badge className="bg-blue-500 text-white text-xs">
                                                    {folderCounts[folder.id]}
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content - Email List */}
                    <div className="col-span-9">
                        <Card className="h-full flex flex-col">
                            <CardHeader className="p-4 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <h2 className="text-lg font-semibold">
                                            {currentFolder?.name || 'Inbox'}
                                        </h2>
                                        <Badge variant="secondary">
                                            {emails?.data?.length || 0} emails
                                        </Badge>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                placeholder="Search emails..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10 w-64"
                                            />
                                        </div>
                                        <Button variant="outline" size="sm">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 p-0 overflow-y-auto">
                                {emails?.data?.length > 0 ? (
                                    <div className="divide-y divide-gray-100">
                                        {emails.data.map((email: any) => (
                                            <div
                                                key={email.id}
                                                onClick={() => router.visit(`/emails/${email.id}`)}
                                                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                            >
                                                <div className="flex items-start space-x-4">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={email.sender?.avatar} />
                                                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                                                            {getInitials(email.sender_name || email.sender_email)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p className={`font-medium truncate ${
                                                                email.status === 'read' ? 'text-gray-700' : 'text-gray-900'
                                                            }`}>
                                                                {email.sender_name || email.sender_email}
                                                            </p>
                                                            <div className="flex items-center space-x-2">
                                                                {email.emailAttachments?.length > 0 && (
                                                                    <Paperclip className="h-4 w-4 text-gray-400" />
                                                                )}
                                                                <span className="text-sm text-gray-500">
                                                                    {formatDate(email.created_at)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className={`text-sm truncate mt-1 ${
                                                            email.status === 'read' ? 'text-gray-600' : 'font-medium text-gray-900'
                                                        }`}>
                                                            {email.subject}
                                                        </p>
                                                        <p className="text-sm text-gray-500 truncate mt-1">
                                                            {email.body_text?.substring(0, 100)}...
                                                        </p>
                                                    </div>
                                                    {email.status !== 'read' && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="text-center">
                                            <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No emails</h3>
                                            <p className="text-gray-500 mb-4">
                                                {currentFolder?.name === 'Inbox' 
                                                    ? "You don't have any emails in your inbox yet."
                                                    : `No emails in ${currentFolder?.name || 'this folder'}.`
                                                }
                                            </p>
                                            <Button onClick={() => router.visit('/emails/compose')}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Compose Email
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
