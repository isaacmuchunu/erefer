import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    FileText,
    Heart,
    Activity,
    Clock,
    User,
    Phone,
    MapPin,
    Plus,
    Eye
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Patient',
        href: '/patient',
    },
    {
        title: 'Dashboard',
        href: '/patient/dashboard',
    },
];

interface PatientDashboardProps {
    auth: {
        user: any;
    };
}

export default function PatientDashboard(props: PatientDashboardProps) {
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
        upcomingAppointments: 2,
        activeReferrals: 1,
        healthRecords: 15,
        lastVisit: '2024-01-15',
    };

    const upcomingAppointments = [
        {
            id: 1,
            date: '2024-01-25',
            time: '10:30 AM',
            doctor: 'Dr. Sarah Johnson',
            specialty: 'Cardiology',
            facility: 'City General Hospital',
            type: 'Follow-up',
            status: 'confirmed'
        },
        {
            id: 2,
            date: '2024-02-02',
            time: '02:00 PM',
            doctor: 'Dr. Michael Chen',
            specialty: 'Neurology',
            facility: 'Neurological Institute',
            type: 'Consultation',
            status: 'pending'
        },
    ];

    const healthMetrics = [
        { label: 'Blood Pressure', value: '120/80', status: 'normal', color: 'green' },
        { label: 'Heart Rate', value: '72 bpm', status: 'normal', color: 'green' },
        { label: 'Weight', value: '70 kg', status: 'stable', color: 'blue' },
        { label: 'Temperature', value: '98.6°F', status: 'normal', color: 'green' },
    ];

    return (
        <AppLayout
            user={user}
            breadcrumbs={breadcrumbs}
            notificationCount={5}
            messageCount={3}
        >
            <Head title="Patient Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-gray-50">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden min-h-[200px]">
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold mb-2">{getTimeBasedGreeting()}, {user?.name || user?.first_name || 'John Doe'}</h1>
                            <p className="text-purple-100 text-lg mb-6">Your next appointment is on January 25th at 10:30 AM</p>
                            <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm">
                                <Calendar className="w-5 h-5 inline mr-2" />
                                Book Appointment
                            </button>
                        </div>
                        <div className="hidden lg:block">
                            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                                <User className="w-16 h-16 text-white" />
                            </div>
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Upcoming Appointments</CardTitle>
                            <Calendar className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{stats.upcomingAppointments}</div>
                            <div className="text-xs text-purple-600 mt-1">
                                Next: Jan 25th
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Active Referrals</CardTitle>
                            <FileText className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{stats.activeReferrals}</div>
                            <div className="text-xs text-blue-600 mt-1">
                                In progress
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Health Records</CardTitle>
                            <Activity className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{stats.healthRecords}</div>
                            <div className="text-xs text-green-600 mt-1">
                                Total records
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Last Visit</CardTitle>
                            <Clock className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-gray-900">Jan 15</div>
                            <div className="text-xs text-amber-600 mt-1">
                                10 days ago
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Upcoming Appointments */}
                    <Card className="shadow-sm">
                        <CardHeader className="p-6 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-semibold text-gray-900">Upcoming Appointments</CardTitle>
                                    <p className="text-gray-600 text-sm">Your scheduled medical appointments</p>
                                </div>
                                <Button size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Book New
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-100">
                                {upcomingAppointments.map((appointment) => (
                                    <div key={appointment.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3">
                                                <div className="flex flex-col items-center">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900">{appointment.date}</span>
                                                    <span className="text-xs text-gray-500">{appointment.time}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{appointment.doctor}</p>
                                                    <p className="text-sm text-gray-600">{appointment.specialty}</p>
                                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                                        <MapPin className="h-3 w-3 mr-1" />
                                                        {appointment.facility}
                                                    </div>
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

                    {/* Health Metrics */}
                    <Card className="shadow-sm">
                        <CardHeader className="p-6 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-semibold text-gray-900">Health Metrics</CardTitle>
                                    <p className="text-gray-600 text-sm">Your latest vital signs and measurements</p>
                                </div>
                                <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View History
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <div className="grid gap-4">
                                {healthMetrics.map((metric, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-3 h-3 rounded-full bg-${metric.color}-500`}></div>
                                            <span className="font-medium text-gray-900">{metric.label}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-gray-900">{metric.value}</div>
                                            <div className={`text-xs text-${metric.color}-600`}>{metric.status}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card className="shadow-sm">
                    <CardHeader className="p-6 pb-4">
                        <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
                        <p className="text-gray-600 text-sm">Common tasks and services</p>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                            <Button variant="outline" className="justify-start h-12">
                                <Calendar className="h-5 w-5 mr-3" />
                                Book Appointment
                            </Button>
                            <Button variant="outline" className="justify-start h-12">
                                <FileText className="h-5 w-5 mr-3" />
                                View Records
                            </Button>
                            <Button variant="outline" className="justify-start h-12">
                                <Heart className="h-5 w-5 mr-3" />
                                Health Summary
                            </Button>
                            <Button variant="outline" className="justify-start h-12">
                                <Phone className="h-5 w-5 mr-3" />
                                Contact Doctor
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
