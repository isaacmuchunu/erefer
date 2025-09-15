import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    Calendar,
    ClipboardList,
    Stethoscope,
    Clock,
    TrendingUp,
    Plus,
    Eye,
    FileText,
    Activity
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Doctor',
        href: '/doctor',
    },
    {
        title: 'Dashboard',
        href: '/doctor/dashboard',
    },
];

interface DoctorDashboardProps {
    auth: {
        user: any;
    };
}

export default function DoctorDashboard(props: DoctorDashboardProps) {
    const { user } = props.auth;

    // Get time-based greeting
    const getTimeBasedGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Mock data for demonstration
    const stats = {
        todayAppointments: 12,
        totalPatients: 156,
        pendingReferrals: 8,
        completedConsultations: 45,
    };

    const todayAppointments = [
        {
            id: 1,
            time: '09:00 AM',
            patient: 'Sarah Johnson',
            type: 'Consultation',
            status: 'confirmed',
            duration: '30 min'
        },
        {
            id: 2,
            time: '10:30 AM',
            patient: 'Michael Chen',
            type: 'Follow-up',
            status: 'confirmed',
            duration: '15 min'
        },
        {
            id: 3,
            time: '02:00 PM',
            patient: 'Emily Rodriguez',
            type: 'New Patient',
            status: 'pending',
            duration: '45 min'
        },
    ];

    return (
        <AppLayout
            user={user}
            breadcrumbs={breadcrumbs}
            notificationCount={5}
            messageCount={3}
        >
            <Head title="Doctor Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-gray-50">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden min-h-[200px]">
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold mb-2">{getTimeBasedGreeting()}, Dr. {user?.name || user?.last_name || 'Smith'}</h1>
                            <p className="text-emerald-100 text-lg mb-6">You have {stats.todayAppointments} appointments scheduled for today</p>
                            <button className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm">
                                <Plus className="w-5 h-5 inline mr-2" />
                                New Consultation
                            </button>
                        </div>
                        <div className="hidden lg:block">
                            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                                <Stethoscope className="w-16 h-16 text-white" />
                            </div>
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Today's Appointments</CardTitle>
                            <Calendar className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</div>
                            <div className="text-xs text-emerald-600 mt-1">
                                3 pending confirmation
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Patients</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{stats.totalPatients}</div>
                            <div className="flex items-center text-xs text-blue-600 mt-1">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +12 this month
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Pending Referrals</CardTitle>
                            <ClipboardList className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{stats.pendingReferrals}</div>
                            <div className="text-xs text-amber-600 mt-1">
                                Require review
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Consultations</CardTitle>
                            <Activity className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{stats.completedConsultations}</div>
                            <div className="text-xs text-purple-600 mt-1">
                                This week
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Today's Schedule */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="shadow-sm">
                        <CardHeader className="p-6 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-semibold text-gray-900">Today's Schedule</CardTitle>
                                    <p className="text-gray-600 text-sm">Your appointments for today</p>
                                </div>
                                <Button size="sm">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View All
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-100">
                                {todayAppointments.map((appointment) => (
                                    <div key={appointment.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex flex-col items-center">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900">{appointment.time}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{appointment.patient}</p>
                                                    <p className="text-sm text-gray-500">{appointment.type} • {appointment.duration}</p>
                                                </div>
                                            </div>
                                            <Badge
                                                variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}
                                                className={appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}
                                            >
                                                {appointment.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="p-6 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
                                    <p className="text-gray-600 text-sm">Common tasks and shortcuts</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <div className="grid gap-3">
                                <Button variant="outline" className="justify-start h-12">
                                    <FileText className="h-5 w-5 mr-3" />
                                    Create New Referral
                                </Button>
                                <Button variant="outline" className="justify-start h-12">
                                    <Users className="h-5 w-5 mr-3" />
                                    View Patient Records
                                </Button>
                                <Button variant="outline" className="justify-start h-12">
                                    <Calendar className="h-5 w-5 mr-3" />
                                    Schedule Appointment
                                </Button>
                                <Button variant="outline" className="justify-start h-12">
                                    <ClipboardList className="h-5 w-5 mr-3" />
                                    Review Referrals
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
