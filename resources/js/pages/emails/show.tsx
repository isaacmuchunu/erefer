import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    Reply,
    ReplyAll,
    Forward,
    Archive,
    Trash2,
    Star,
    MoreVertical,
    Paperclip,
    Download,
    ArrowLeft,
    Calendar,
    User
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
    {
        title: 'View Email',
        href: '#',
    },
];

interface EmailShowProps {
    auth: {
        user: any;
    };
    email: any;
    canReply?: boolean;
}

export default function EmailShow(props: EmailShowProps) {
    const { user } = props.auth;
    const { email, canReply = true } = props;

    const [isReplying, setIsReplying] = useState(false);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleReply = () => {
        router.visit(`/emails/compose?reply_to=${email.id}`);
    };

    const handleForward = () => {
        router.visit(`/emails/compose?forward=${email.id}`);
    };

    return (
        <AppLayout
            user={user}
            breadcrumbs={breadcrumbs}
            notificationCount={5}
            messageCount={3}
        >
            <Head title={`Email: ${email.subject}`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-gray-50">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" onClick={() => router.visit('/emails')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Inbox
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{email.subject}</h1>
                            <p className="text-gray-600">Email Details</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                            <Star className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                            <Archive className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Email Content */}
                <Card className="flex-1">
                    <CardHeader className="p-6 border-b">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={email.sender?.avatar} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                                        {getInitials(email.sender_name || email.sender_email)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            {email.sender_name || email.sender_email}
                                        </h2>
                                        <Badge variant="secondary">
                                            {email.type === 'inbound' ? 'Received' : 'Sent'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        <User className="h-4 w-4 inline mr-1" />
                                        From: {email.sender_email}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <Calendar className="h-4 w-4 inline mr-1" />
                                        {formatDate(email.created_at)}
                                    </p>
                                    {email.recipients?.to && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            To: {email.recipients.to.join(', ')}
                                        </p>
                                    )}
                                    {email.recipients?.cc && email.recipients.cc.length > 0 && (
                                        <p className="text-sm text-gray-600">
                                            CC: {email.recipients.cc.join(', ')}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {canReply && (
                                    <>
                                        <Button variant="outline" size="sm" onClick={handleReply}>
                                            <Reply className="h-4 w-4 mr-2" />
                                            Reply
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <ReplyAll className="h-4 w-4 mr-2" />
                                            Reply All
                                        </Button>
                                    </>
                                )}
                                <Button variant="outline" size="sm" onClick={handleForward}>
                                    <Forward className="h-4 w-4 mr-2" />
                                    Forward
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        {/* Attachments */}
                        {email.emailAttachments && email.emailAttachments.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                    <Paperclip className="h-4 w-4 mr-2" />
                                    Attachments ({email.emailAttachments.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {email.emailAttachments.map((attachment: any) => (
                                        <div
                                            key={attachment.id}
                                            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                                        >
                                            <div className="p-2 bg-blue-100 rounded">
                                                <Paperclip className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {attachment.original_filename}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {attachment.human_readable_size || 'Unknown size'}
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Separator className="mt-6" />
                            </div>
                        )}

                        {/* Email Body */}
                        <div className="prose max-w-none">
                            {email.body_html ? (
                                <div 
                                    dangerouslySetInnerHTML={{ __html: email.body_html }}
                                    className="text-gray-900 leading-relaxed"
                                />
                            ) : (
                                <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                                    {email.body_text}
                                </div>
                            )}
                        </div>

                        {/* Tracking Information */}
                        {email.trackingEvents && email.trackingEvents.length > 0 && (
                            <div className="mt-8 pt-6 border-t">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Email Activity</h3>
                                <div className="space-y-2">
                                    {email.trackingEvents.map((event: any) => (
                                        <div key={event.id} className="flex items-center space-x-3 text-sm">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <span className="text-gray-600">{event.description}</span>
                                            <span className="text-gray-400">
                                                {formatDate(event.occurred_at)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Referral Information */}
                        {email.referral && (
                            <div className="mt-8 pt-6 border-t">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Related Referral</h3>
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm font-medium text-blue-900">
                                        Referral #{email.referral.id}
                                    </p>
                                    <p className="text-sm text-blue-700">
                                        Patient: {email.referral.patient_name}
                                    </p>
                                    <Button variant="outline" size="sm" className="mt-2">
                                        View Referral
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
