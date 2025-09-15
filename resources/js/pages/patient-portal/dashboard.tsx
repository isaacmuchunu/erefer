import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PatientLayout from '@/layouts/PatientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    Calendar, 
    Clock, 
    MessageSquare, 
    FileText, 
    Pill, 
    Video, 
    Phone,
    Bell,
    Heart,
    Activity,
    AlertTriangle,
    CheckCircle,
    Plus,
    Download,
    Eye
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import axios from 'axios';
import { toast } from '@/lib/toast';

interface Appointment {
    id: number;
    appointment_number: string;
    doctor: {
        name: string;
        specialty: string;
    };
    facility: {
        name: string;
        address: string;
    };
    scheduled_at: string;
    duration_minutes: number;
    status: string;
    appointment_type: string;
    is_telemedicine: boolean;
    meeting_link?: string;
    preparation_instructions?: string;
    can_be_cancelled: boolean;
    can_be_rescheduled: boolean;
}

interface FollowUp {
    id: number;
    title: string;
    description: string;
    scheduled_date: string;
    status: string;
    priority: string;
    follow_up_type: string;
    questions: any[];
    is_overdue: boolean;
    needs_reminder: boolean;
}

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    priority: string;
    created_at: string;
    read_at?: string;
    channel: string;
}

interface PatientDashboardProps {
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        date_of_birth: string;
        medical_record_number: string;
    };
    upcomingAppointments: Appointment[];
    pendingFollowUps: FollowUp[];
    recentNotifications: Notification[];
    healthMetrics: {
        last_visit: string;
        next_appointment: string;
        active_prescriptions: number;
        pending_follow_ups: number;
        unread_messages: number;
    };
    quickActions: {
        can_book_appointment: boolean;
        can_message_doctor: boolean;
        can_view_records: boolean;
        can_manage_prescriptions: boolean;
    };
}

export default function PatientDashboard({ 
    patient, 
    upcomingAppointments, 
    pendingFollowUps, 
    recentNotifications,
    healthMetrics,
    quickActions
}: PatientDashboardProps) {
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState(recentNotifications);

    useEffect(() => {
        // Mark notifications as read when viewed
        const unreadNotifications = notifications.filter(n => !n.read_at);
        if (unreadNotifications.length > 0) {
            markNotificationsAsRead(unreadNotifications.map(n => n.id));
        }
    }, []);

    const markNotificationsAsRead = async (notificationIds: number[]) => {
        try {
            await axios.post('/patient/notifications/mark-read', {
                notification_ids: notificationIds
            });
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
        }
    };

    const confirmAppointment = async (appointmentId: number) => {
        try {
            setLoading(true);
            await axios.post(`/appointments/${appointmentId}/confirm`);
            toast.success('Appointment confirmed successfully');
            router.reload();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to confirm appointment');
        } finally {
            setLoading(false);
        }
    };

    const cancelAppointment = async (appointmentId: number, reason: string) => {
        try {
            setLoading(true);
            await axios.post(`/appointments/${appointmentId}/cancel`, { reason });
            toast.success('Appointment cancelled successfully');
            router.reload();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to cancel appointment');
        } finally {
            setLoading(false);
        }
    };

    const joinTelemedicine = (meetingLink: string) => {
        window.open(meetingLink, '_blank');
    };

    const getAppointmentStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-500';
            case 'confirmed': return 'bg-green-500';
            case 'in_progress': return 'bg-purple-500';
            case 'completed': return 'bg-emerald-500';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getFollowUpPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500';
            case 'high': return 'bg-orange-500';
            case 'normal': return 'bg-blue-500';
            case 'low': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    const renderHealthMetricsCard = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Health Overview
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {healthMetrics.active_prescriptions}
                        </div>
                        <div className="text-sm text-gray-600">Active Prescriptions</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                            {healthMetrics.pending_follow_ups}
                        </div>
                        <div className="text-sm text-gray-600">Pending Follow-ups</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {healthMetrics.unread_messages}
                        </div>
                        <div className="text-sm text-gray-600">Unread Messages</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-gray-600">Last Visit</div>
                        <div className="font-medium">
                            {healthMetrics.last_visit ? 
                                format(new Date(healthMetrics.last_visit), 'MMM d, yyyy') : 
                                'No recent visits'
                            }
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderQuickActionsCard = () => (
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3">
                    {quickActions.can_book_appointment && (
                        <Link href="/patient/appointments">
                            <Button className="w-full" variant="outline">
                                <Calendar className="h-4 w-4 mr-2" />
                                Book Appointment
                            </Button>
                        </Link>
                    )}
                    
                    {quickActions.can_message_doctor && (
                        <Link href="/patient/messages">
                            <Button className="w-full" variant="outline">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Message Doctor
                            </Button>
                        </Link>
                    )}
                    
                    {quickActions.can_view_records && (
                        <Link href="/patient/medical-records">
                            <Button className="w-full" variant="outline">
                                <FileText className="h-4 w-4 mr-2" />
                                Medical Records
                            </Button>
                        </Link>
                    )}
                    
                    {quickActions.can_manage_prescriptions && (
                        <Link href="/patient/prescriptions">
                            <Button className="w-full" variant="outline">
                                <Pill className="h-4 w-4 mr-2" />
                                Prescriptions
                            </Button>
                        </Link>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    const renderUpcomingAppointments = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Upcoming Appointments
                    </span>
                    <Link href="/patient/appointments">
                        <Button variant="ghost" size="sm">View All</Button>
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {upcomingAppointments.length > 0 ? (
                    <div className="space-y-4">
                        {upcomingAppointments.slice(0, 3).map((appointment) => (
                            <div key={appointment.id} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-medium">Dr. {appointment.doctor.name}</h4>
                                            <Badge className={getAppointmentStatusColor(appointment.status)}>
                                                {appointment.status}
                                            </Badge>
                                            {appointment.is_telemedicine && (
                                                <Badge variant="outline">
                                                    <Video className="h-3 w-3 mr-1" />
                                                    Telemedicine
                                                </Badge>
                                            )}
                                        </div>
                                        
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                {format(new Date(appointment.scheduled_at), 'PPP p')}
                                            </div>
                                            <div>{appointment.facility.name}</div>
                                            <div className="capitalize">{appointment.appointment_type.replace('_', ' ')}</div>
                                        </div>

                                        {appointment.preparation_instructions && (
                                            <Alert className="mt-3">
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertDescription>
                                                    {appointment.preparation_instructions}
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2 ml-4">
                                        {appointment.status === 'scheduled' && (
                                            <Button 
                                                size="sm" 
                                                onClick={() => confirmAppointment(appointment.id)}
                                                disabled={loading}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Confirm
                                            </Button>
                                        )}

                                        {appointment.is_telemedicine && appointment.meeting_link && (
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => joinTelemedicine(appointment.meeting_link!)}
                                            >
                                                <Video className="h-4 w-4 mr-1" />
                                                Join Call
                                            </Button>
                                        )}

                                        {appointment.can_be_cancelled && (
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => {
                                                    const reason = prompt('Please provide a reason for cancellation:');
                                                    if (reason) {
                                                        cancelAppointment(appointment.id, reason);
                                                    }
                                                }}
                                                disabled={loading}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No upcoming appointments</p>
                        {quickActions.can_book_appointment && (
                            <Link href="/patient/appointments/book">
                                <Button className="mt-4">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Book Your First Appointment
                                </Button>
                            </Link>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );

    const renderPendingFollowUps = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        Follow-up Care
                    </span>
                    <Link href="/patient/follow-ups">
                        <Button variant="ghost" size="sm">View All</Button>
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {pendingFollowUps.length > 0 ? (
                    <div className="space-y-3">
                        {pendingFollowUps.slice(0, 3).map((followUp) => (
                            <div key={followUp.id} className="border rounded-lg p-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium">{followUp.title}</h4>
                                            <Badge className={getFollowUpPriorityColor(followUp.priority)}>
                                                {followUp.priority}
                                            </Badge>
                                            {followUp.is_overdue && (
                                                <Badge variant="destructive">Overdue</Badge>
                                            )}
                                        </div>
                                        
                                        <p className="text-sm text-gray-600 mb-2">
                                            {followUp.description}
                                        </p>
                                        
                                        <div className="text-xs text-gray-500">
                                            Due: {format(new Date(followUp.scheduled_date), 'PPP')}
                                        </div>
                                    </div>

                                    <Link href={`/patient/follow-ups/${followUp.id}`}>
                                        <Button size="sm" variant="outline">
                                            Complete
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-gray-500">
                        <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No pending follow-ups</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    const renderRecentNotifications = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Recent Notifications
                    </span>
                    <Link href="/patient/notifications">
                        <Button variant="ghost" size="sm">View All</Button>
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {notifications.length > 0 ? (
                    <div className="space-y-3">
                        {notifications.slice(0, 5).map((notification) => (
                            <div 
                                key={notification.id} 
                                className={`border rounded-lg p-3 ${!notification.read_at ? 'bg-blue-50 border-blue-200' : ''}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-sm">{notification.title}</h4>
                                            <Badge variant="outline" className="text-xs">
                                                {notification.channel}
                                            </Badge>
                                        </div>
                                        
                                        <p className="text-sm text-gray-600 mb-1">
                                            {notification.message}
                                        </p>
                                        
                                        <div className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </div>
                                    </div>

                                    {!notification.read_at && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-gray-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No recent notifications</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <PatientLayout title="Dashboard">
            <Head title="Patient Dashboard" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Welcome Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome back, {patient.first_name}!
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Here's an overview of your healthcare information and upcoming activities.
                        </p>
                    </div>

                    {/* Top Row - Health Metrics and Quick Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {renderHealthMetricsCard()}
                        {renderQuickActionsCard()}
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            {renderUpcomingAppointments()}
                            {renderPendingFollowUps()}
                        </div>
                        
                        <div className="space-y-6">
                            {renderRecentNotifications()}
                        </div>
                    </div>
                </div>
            </div>
        </PatientLayout>
    );
}
