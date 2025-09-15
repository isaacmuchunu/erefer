import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Bell,
    AlertTriangle,
    Info,
    CheckCircle,
    Clock,
    Trash2,
    CheckCircle,
    Settings,
    Filter,
    Search,
    Calendar,
    User,
    FileText,
    Ambulance,
    Heart
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notifications',
        href: '/notifications',
    },
];

interface NotificationsProps {
    auth: {
        user: any;
    };
    notifications?: any[];
    pagination?: any;
    stats?: any;
    filterOptions?: any;
    currentFilters?: any;
    userPermissions?: any;
}

export default function Notifications(props: NotificationsProps) {
    const { user } = props.auth;
    const {
        notifications = [],
        pagination = {},
        stats = {},
        filterOptions = {},
        currentFilters = {},
        userPermissions = {}
    } = props;

    const [activeTab, setActiveTab] = useState(currentFilters.status || 'all');
    const [loading, setLoading] = useState(false);

    // Load notifications from API if not provided in props
    const [notificationsList, setNotificationsList] = useState(notifications);

    useEffect(() => {
        if (notifications.length === 0) {
            loadNotifications();
        } else {
            setNotificationsList(notifications);
        }
    }, [notifications]);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (activeTab !== 'all') {
                params.append('status', activeTab);
            }

            const response = await fetch(`/api/notifications?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setNotificationsList(data.data || []);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mock notifications data (fallback)
    const mockNotifications = [
        {
            id: 1,
            type: 'emergency',
            title: 'Emergency Alert',
            message: 'New ambulance dispatch request for cardiac emergency',
            timestamp: '2 minutes ago',
            isRead: false,
            priority: 'urgent',
            icon: AlertTriangle,
            color: 'red',
            actionUrl: '/emergency/123'
        },
        {
            id: 2,
            type: 'referral',
            title: 'Referral Approved',
            message: 'Patient referral for John Doe has been approved by Dr. Sarah Johnson',
            timestamp: '15 minutes ago',
            isRead: false,
            priority: 'high',
            icon: FileText,
            color: 'blue',
            actionUrl: '/referrals/456'
        },
        {
            id: 3,
            type: 'appointment',
            title: 'Appointment Reminder',
            message: 'Upcoming appointment with Dr. Michael Chen at 2:00 PM',
            timestamp: '1 hour ago',
            isRead: true,
            priority: 'normal',
            icon: Calendar,
            color: 'green',
            actionUrl: '/appointments/789'
        },
        {
            id: 4,
            type: 'system',
            title: 'System Update',
            message: 'System maintenance scheduled for tonight at 11:00 PM',
            timestamp: '2 hours ago',
            isRead: true,
            priority: 'low',
            icon: Settings,
            color: 'gray',
            actionUrl: null
        },
        {
            id: 5,
            type: 'patient',
            title: 'Patient Update',
            message: 'New patient registration completed for Emily Rodriguez',
            timestamp: '3 hours ago',
            isRead: false,
            priority: 'normal',
            icon: User,
            color: 'purple',
            actionUrl: '/patients/101'
        },
        {
            id: 6,
            type: 'ambulance',
            title: 'Ambulance Status',
            message: 'Ambulance AMB-001 has completed transport and is available',
            timestamp: '4 hours ago',
            isRead: true,
            priority: 'normal',
            icon: Ambulance,
            color: 'teal',
            actionUrl: '/ambulances/001'
        }
    ];

    const getFilteredNotifications = () => {
        const dataToFilter = notificationsList.length > 0 ? notificationsList : mockNotifications;

        switch (activeTab) {
            case 'unread':
                return dataToFilter.filter(n => !n.is_read);
            case 'emergency':
                return dataToFilter.filter(n => n.type === 'emergency' || n.category === 'emergency');
            case 'referrals':
                return dataToFilter.filter(n => n.type === 'referral' || n.category === 'referral');
            case 'appointments':
                return dataToFilter.filter(n => n.type === 'appointment' || n.category === 'appointment');
            default:
                return dataToFilter;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getIconColor = (color: string) => {
        switch (color) {
            case 'red': return 'text-red-500';
            case 'blue': return 'text-blue-500';
            case 'green': return 'text-green-500';
            case 'purple': return 'text-purple-500';
            case 'teal': return 'text-teal-500';
            case 'gray': return 'text-gray-500';
            default: return 'text-gray-500';
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                // Update local state
                setNotificationsList(prev =>
                    prev.map(n => n.id === notificationId ? { ...n, is_read: true, read_at: new Date() } : n)
                );
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                // Update local state
                setNotificationsList(prev =>
                    prev.map(n => ({ ...n, is_read: true, read_at: new Date() }))
                );
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                // Remove from local state
                setNotificationsList(prev => prev.filter(n => n.id !== notificationId));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const unreadCount = stats.unread || notificationsList.filter(n => !n.is_read).length;

    return (
        <AppLayout
            user={user}
            breadcrumbs={breadcrumbs}
            notificationCount={5}
            messageCount={3}
        >
            <Head title="Notifications" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-gray-50">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                        <p className="text-gray-600">Stay updated with important alerts and messages</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" onClick={markAllAsRead}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark All Read
                        </Button>
                        <Button variant="outline">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total || notificationsList.length}</p>
                                </div>
                                <Bell className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Unread</p>
                                    <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
                                </div>
                                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-red-600 font-bold text-sm">{unreadCount}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Emergency</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.by_priority?.urgent || notificationsList.filter(n => n.priority === 'urgent' || n.type === 'emergency').length}
                                    </p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Today</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.today || notificationsList.filter(n => {
                                            const today = new Date().toDateString();
                                            const notifDate = new Date(n.created_at).toDateString();
                                            return today === notifDate;
                                        }).length}
                                    </p>
                                </div>
                                <Clock className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Notifications List */}
                <Card className="flex-1">
                    <CardHeader>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
                                <TabsTrigger value="emergency">Emergency</TabsTrigger>
                                <TabsTrigger value="referrals">Referrals</TabsTrigger>
                                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-100">
                            {getFilteredNotifications().map((notification) => {
                                const IconComponent = notification.icon;
                                return (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-gray-50 transition-colors ${
                                            !notification.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                        }`}
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className={`p-2 rounded-full bg-gray-100 ${getIconColor(notification.color)}`}>
                                                <IconComponent className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <h3 className="font-medium text-gray-900">{notification.title}</h3>
                                                            <Badge className={getPriorityColor(notification.priority)}>
                                                                {notification.priority}
                                                            </Badge>
                                                            {!notification.isRead && (
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                                                        <p className="text-xs text-gray-500">{notification.timestamp}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2 ml-4">
                                                        {!notification.isRead && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => markAsRead(notification.id)}
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => deleteNotification(notification.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {getFilteredNotifications().length === 0 && (
                            <div className="p-8 text-center">
                                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                                <p className="text-gray-500">You're all caught up! No notifications to show.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
