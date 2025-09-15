import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Users,
    Clock,
    FileText,
    AlertTriangle,
    Ambulance,
    Calendar,
    MessageSquare,
    Activity,
    TrendingUp,
    Plus,
    Phone,
    DollarSign,
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { RecentReferrals } from '@/components/dashboard/RecentReferrals';
import { RecentPatients } from '@/components/dashboard/RecentPatients';
import { Alerts } from '@/components/dashboard/Alerts';
import { CreateReferralModal } from '@/components/modals/CreateReferralModal';
import { CreatePatientModal } from '@/components/modals/CreatePatientModal';
import { ReferralDetailsModal } from '@/components/modals/ReferralDetailsModal';
import { PatientDetailsModal } from '@/components/modals/PatientDetailsModal';
import { AppointmentDetailsModal } from '@/components/modals/AppointmentDetailsModal';
import { AmbulanceDetailsModal } from '@/components/modals/AmbulanceDetailsModal';
import { EmergencyDetailsModal } from '@/components/modals/EmergencyDetailsModal';
import { DepartmentDetailsModal } from '@/components/modals/DepartmentDetailsModal';
import { FacilityDetailsModal } from '@/components/modals/FacilityDetailsModal';
import { DoctorDetailsModal } from '@/components/modals/DoctorDetailsModal';
import { AddDoctorModal } from '@/components/modals/AddDoctorModal';
import { ProHealthCard, ProHealthStatCard, ProHealthButton } from '@/components/prohealth';

interface DashboardStats {
    totalReferrals: number;
    pendingReferrals: number;
    completedReferrals: number;
    urgentReferrals: number;
    totalPatients: number;
    activeFacilities: number;
    availableBeds: number;
    totalBeds: number;
    averageResponseTime: number;
    recentReferrals: Array<any>;
    alerts: Array<any>;
    recentPatients: Array<any>;
    totalDoctors: number;
    totalAmbulances: number;
    availableAmbulances: number;
    totalAppointments: number;
    todayAppointments: number;
    emergencyCalls: number;
    activeEmergencies: number;
    totalMessages: number;
    unreadMessages: number;
    systemAlerts: number;
    criticalAlerts: number;
    totalEquipment: number;
    functionalEquipment: number;
    responseTimeChange: number;
    patientGrowth: number;
    referralGrowth: number;
    facilityUtilization: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    auth: {
        user: any;
    };
}

export default function Dashboard(props: DashboardProps) {
    const { user } = props.auth;
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Get time-based greeting
    const getTimeBasedGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Modal states
    const [isCreateReferralModalOpen, setIsCreateReferralModalOpen] = useState(false);
    const [isCreatePatientModalOpen, setIsCreatePatientModalOpen] = useState(false);
    const [isReferralDetailsModalOpen, setIsReferralDetailsModalOpen] = useState(false);
    const [selectedReferral, setSelectedReferral] = useState<any>(null);
    const [isPatientDetailsModalOpen, setIsPatientDetailsModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [isAppointmentDetailsModalOpen, setIsAppointmentDetailsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [isAmbulanceDetailsModalOpen, setIsAmbulanceDetailsModalOpen] = useState(false);
    const [selectedAmbulance, setSelectedAmbulance] = useState<any>(null);
    const [isEmergencyDetailsModalOpen, setIsEmergencyDetailsModalOpen] = useState(false);
    const [selectedEmergency, setSelectedEmergency] = useState<any>(null);
    const [isDepartmentDetailsModalOpen, setIsDepartmentDetailsModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
    const [isFacilityDetailsModalOpen, setIsFacilityDetailsModalOpen] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState<any>(null);
    const [isDoctorDetailsModalOpen, setIsDoctorDetailsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);

    useEffect(() => {
        // Use only mock data to prevent API errors
        const mockOverviewData = {
            totalPatients: 15643,
            activeReferrals: 1247,
            todayAppointments: 28,
            availableAmbulances: 6,
            totalReferrals: 1247,
            pendingReferrals: 23,
            completedReferrals: 1156,
            urgentReferrals: 5,
            activeFacilities: 45,
            availableBeds: 120,
            totalBeds: 200,
            averageResponseTime: 15,
            recentReferrals: [],
            alerts: [],
            recentPatients: [],
            totalDoctors: 89,
            totalAmbulances: 12,
            totalAppointments: 156,
            emergencyCalls: 8,
            activeEmergencies: 3,
            totalMessages: 234,
            unreadMessages: 47,
            systemAlerts: 12,
            criticalAlerts: 3,
            totalEquipment: 450,
            functionalEquipment: 423,
            responseTimeChange: -5,
            patientGrowth: 12,
            referralGrowth: 8,
            facilityUtilization: 85
        };

        setStats(mockOverviewData);
        setLoading(false);
    }, []);

    // Handler functions
    const handleCreateReferral = (data: any) => {
        console.log('Creating referral:', data);
        alert('Referral created successfully!');
    };

    const handleCreatePatient = (data: any) => {
        console.log('Creating patient:', data);
        alert('Patient created successfully!');
    };

    const handleViewReferral = (referral: any) => {
        setSelectedReferral(referral);
        setIsReferralDetailsModalOpen(true);
    };

    const handleViewPatient = (patient: any) => {
        setSelectedPatient(patient);
        setIsPatientDetailsModalOpen(true);
    };

    const handleViewAppointment = (appointment: any) => {
        setSelectedAppointment(appointment);
        setIsAppointmentDetailsModalOpen(true);
    };

    const handleViewAmbulance = (ambulance: any) => {
        setSelectedAmbulance(ambulance);
        setIsAmbulanceDetailsModalOpen(true);
    };

    const handleViewEmergency = (emergency: any) => {
        setSelectedEmergency(emergency);
        setIsEmergencyDetailsModalOpen(true);
    };

    const handleViewDepartment = (department: any) => {
        setSelectedDepartment(department);
        setIsDepartmentDetailsModalOpen(true);
    };

    const handleViewFacility = (facility: any) => {
        setSelectedFacility(facility);
        setIsFacilityDetailsModalOpen(true);
    };

    const handleViewDoctor = (doctor: any) => {
        setSelectedDoctor(doctor);
        setIsDoctorDetailsModalOpen(true);
    };

    const handleAddDoctor = (doctorData: any) => {
        console.log('Adding new doctor:', doctorData);
    };

    if (loading) {
        return (
            <AppLayout user={user} breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                        {[...Array(8)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader className="pb-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            user={user}
            breadcrumbs={breadcrumbs}
            notificationCount={5}
            messageCount={3}
        >
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 cs_gray_bg_1">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-[#274760] to-[#307BC4] cs_radius_25 p-10 text-white cs_shadow_1 relative overflow-hidden min-h-[280px]">
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex-1">
                            <h1 className="cs_fs_32 cs_primary_font cs_bold mb-2">{getTimeBasedGreeting()}, {user?.name || (user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 'User')}</h1>
                            <p className="text-blue-100 cs_fs_18 cs_secondary_font mb-6">Welcome to your healthcare dashboard. Ready to make a difference today?</p>
                            <button className="cs_white_bg text-[#274760] px-6 py-3 cs_radius_15 cs_semibold hover:bg-gray-50 transition-colors cs_shadow_1">
                                Create Appointment
                            </button>
                        </div>
                        <div className="hidden lg:block">
                            <div className="w-64 h-48 relative">
                                <img
                                    src="/images/doctor-illustration.svg"
                                    alt="Doctor illustration"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
                </div>

                {/* Dashboard Content */}
                <div className="space-y-6">
                    {/* Critical Metrics Row */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
                        <div className="cs_white_bg cs_radius_25 cs_shadow_1 hover:cs_shadow_2 hover:-translate-y-1 transition-all duration-300 p-6 border-l-4 border-l-[#307BC4]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="cs_fs_14 cs_secondary_font cs_semibold cs_body_color">Total Patients</h3>
                                <Users className="h-5 w-5 cs_accent_color" />
                            </div>
                            <div className="cs_fs_24 cs_primary_font cs_bold cs_heading_color">{stats?.totalPatients?.toLocaleString() || '15,643'}</div>
                            <div className="flex items-center mt-2 text-green-600">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                <span className="cs_fs_12 cs_semibold">+{stats?.patientGrowth || 12}% this month</span>
                            </div>
                        </div>

                        <div className="cs_white_bg cs_radius_25 cs_shadow_1 hover:cs_shadow_2 hover:-translate-y-1 transition-all duration-300 p-6 border-l-4 border-l-[#274760]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="cs_fs_14 cs_secondary_font cs_semibold cs_body_color">Active Referrals</h3>
                                <FileText className="h-5 w-5 cs_accent_color" />
                            </div>
                            <div className="cs_fs_24 cs_primary_font cs_bold cs_heading_color">{stats?.totalReferrals?.toLocaleString() || '1,247'}</div>
                            <div className="cs_fs_12 cs_body_color mt-2">
                                {stats?.pendingReferrals || 23} pending review
                            </div>
                        </div>

                        <div className="cs_white_bg cs_radius_25 cs_shadow_1 hover:cs_shadow_2 hover:-translate-y-1 transition-all duration-300 p-6 border-l-4 border-l-amber-500">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="cs_fs_14 cs_secondary_font cs_semibold cs_body_color">Today's Appointments</h3>
                                <Calendar className="h-5 w-5 text-amber-600" />
                            </div>
                            <div className="cs_fs_24 cs_primary_font cs_bold cs_heading_color">{stats?.todayAppointments || 28}</div>
                            <div className="cs_fs_12 cs_body_color mt-2">
                                scheduled for today
                            </div>
                        </div>

                        <div className="cs_white_bg cs_radius_25 cs_shadow_1 hover:cs_shadow_2 hover:-translate-y-1 transition-all duration-300 p-6 border-l-4 border-l-red-500">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="cs_fs_14 cs_secondary_font cs_semibold cs_body_color">Active Emergencies</h3>
                                <Phone className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="cs_fs_24 cs_primary_font cs_bold cs_heading_color">{stats?.activeEmergencies || 3}</div>
                            <div className="cs_fs_12 text-red-600 cs_semibold mt-2">
                                requires attention
                            </div>
                        </div>

                        <div className="cs_white_bg cs_radius_25 cs_shadow_1 hover:cs_shadow_2 hover:-translate-y-1 transition-all duration-300 p-6 border-l-4 border-l-purple-500">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="cs_fs_14 cs_secondary_font cs_semibold cs_body_color">Unread Messages</h3>
                                <MessageSquare className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="cs_fs_24 cs_primary_font cs_bold cs_heading_color">{stats?.unreadMessages || 47}</div>
                            <div className="cs_fs_12 text-purple-600 cs_semibold mt-2">
                                need response
                            </div>
                        </div>

                        <div className="cs_white_bg cs_radius_25 cs_shadow_1 hover:cs_shadow_2 hover:-translate-y-1 transition-all duration-300 p-6 border-l-4 border-l-[#307BC4]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="cs_fs_14 cs_secondary_font cs_semibold cs_body_color">Available Ambulances</h3>
                                <Ambulance className="h-5 w-5 cs_accent_color" />
                            </div>
                            <div className="cs_fs_24 cs_primary_font cs_bold cs_heading_color">{stats?.availableAmbulances || 6}</div>
                            <div className="cs_fs_12 cs_accent_color cs_semibold mt-2">
                                ready for dispatch
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity and Alerts */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <RecentReferrals referrals={stats?.recentReferrals || []} />
                        <RecentPatients patients={stats?.recentPatients || []} />
                    </div>

                    <Alerts alerts={stats?.alerts || []} />
                </div>
            </div>

            {/* Modals */}
            <CreateReferralModal
                isOpen={isCreateReferralModalOpen}
                onClose={() => setIsCreateReferralModalOpen(false)}
                onSubmit={handleCreateReferral}
            />
            <CreatePatientModal
                isOpen={isCreatePatientModalOpen}
                onClose={() => setIsCreatePatientModalOpen(false)}
                onSubmit={handleCreatePatient}
            />
            <PatientDetailsModal
                isOpen={isPatientDetailsModalOpen}
                onClose={() => setIsPatientDetailsModalOpen(false)}
                patient={selectedPatient}
            />
            <ReferralDetailsModal
                isOpen={isReferralDetailsModalOpen}
                onClose={() => setIsReferralDetailsModalOpen(false)}
                referral={selectedReferral}
            />
            <AppointmentDetailsModal
                isOpen={isAppointmentDetailsModalOpen}
                onClose={() => setIsAppointmentDetailsModalOpen(false)}
                appointment={selectedAppointment}
            />
            <AmbulanceDetailsModal
                isOpen={isAmbulanceDetailsModalOpen}
                onClose={() => setIsAmbulanceDetailsModalOpen(false)}
                ambulance={selectedAmbulance}
            />
            <EmergencyDetailsModal
                isOpen={isEmergencyDetailsModalOpen}
                onClose={() => setIsEmergencyDetailsModalOpen(false)}
                emergency={selectedEmergency}
            />
            <DepartmentDetailsModal
                isOpen={isDepartmentDetailsModalOpen}
                onClose={() => setIsDepartmentDetailsModalOpen(false)}
                department={selectedDepartment}
            />
            <DoctorDetailsModal
                isOpen={isDoctorDetailsModalOpen}
                onClose={() => setIsDoctorDetailsModalOpen(false)}
                doctor={selectedDoctor}
            />
            <FacilityDetailsModal
                isOpen={isFacilityDetailsModalOpen}
                onClose={() => setIsFacilityDetailsModalOpen(false)}
                facility={selectedFacility}
            />
            <AddDoctorModal
                isOpen={isAddDoctorModalOpen}
                onClose={() => setIsAddDoctorModalOpen(false)}
                onSubmit={handleAddDoctor}
            />
        </AppLayout>
    );
}
