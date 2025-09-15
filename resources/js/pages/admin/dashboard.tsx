import { useState } from 'react';
import { Head } from '@inertiajs/react';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    UserPlus,
    Stethoscope,
    Building,
    Activity,
    TrendingUp,
    Plus,
    Eye,
    Edit,
    Trash2,
    Search,
    Filter,
    Shield,
    Mail,
    MessageCircle,
    Phone,
    Settings,
    BarChart3
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { AddDoctorModal } from '@/components/modals/AddDoctorModal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

interface AdminDashboardProps {
    auth: {
        user: any;
    };
}

export default function AdminDashboard(props: AdminDashboardProps) {
    const { user } = props.auth;
    const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);

    // Mock data for demonstration
    const stats = {
        totalDoctors: 89,
        activeDoctors: 76,
        totalPatients: 15643,
        totalFacilities: 45,
        newDoctorsThisMonth: 8,
        pendingApprovals: 5,
    };

    const recentDoctors = [
        {
            id: 1,
            name: 'Dr. Sarah Johnson',
            specialty: 'Cardiology',
            email: 'sarah.johnson@hospital.com',
            phone: '+1 (555) 123-4567',
            facility: 'City General Hospital',
            status: 'active',
            joinDate: '2024-01-15',
            licenseNumber: 'MD-12345'
        },
        {
            id: 2,
            name: 'Dr. Michael Chen',
            specialty: 'Neurology',
            email: 'michael.chen@hospital.com',
            phone: '+1 (555) 234-5678',
            facility: 'Neurological Institute',
            status: 'pending',
            joinDate: '2024-01-20',
            licenseNumber: 'MD-12346'
        },
        {
            id: 3,
            name: 'Dr. Emily Rodriguez',
            specialty: 'Pediatrics',
            email: 'emily.rodriguez@hospital.com',
            phone: '+1 (555) 345-6789',
            facility: 'Children\'s Medical Center',
            status: 'active',
            joinDate: '2024-01-18',
            licenseNumber: 'MD-12347'
        },
    ];

    const handleAddDoctor = (doctorData: any) => {
        console.log('Adding new doctor:', doctorData);
        // Here you would typically send the data to your backend
        alert('Doctor added successfully!');
        setIsAddDoctorModalOpen(false);
    };

    return (
        <SuperAdminLayout
            user={user}
        >
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-gray-50">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden min-h-[200px]">
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                            <p className="text-blue-100 text-lg mb-6">Manage healthcare providers and system administration</p>
                            <button 
                                onClick={() => setIsAddDoctorModalOpen(true)}
                                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <UserPlus className="w-5 h-5 inline mr-2" />
                                Add New Doctor
                            </button>
                        </div>
                        <div className="hidden lg:block">
                            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                                <Users className="w-16 h-16 text-white" />
                            </div>
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Doctors</CardTitle>
                            <Stethoscope className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{stats.totalDoctors}</div>
                            <div className="flex items-center text-xs text-blue-600 mt-1">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +{stats.newDoctorsThisMonth} this month
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Active Doctors</CardTitle>
                            <Activity className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{stats.activeDoctors}</div>
                            <div className="text-xs text-green-600 mt-1">
                                {Math.round((stats.activeDoctors / stats.totalDoctors) * 100)}% active rate
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Patients</CardTitle>
                            <Users className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{stats.totalPatients.toLocaleString()}</div>
                            <div className="text-xs text-purple-600 mt-1">
                                Across all facilities
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Pending Approvals</CardTitle>
                            <Building className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</div>
                            <div className="text-xs text-amber-600 mt-1">
                                Require attention
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Doctors Table */}
                <Card className="shadow-sm">
                    <CardHeader className="p-6 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-semibold text-gray-900">Recent Doctors</CardTitle>
                                <p className="text-gray-600 text-sm">Manage healthcare providers and their information</p>
                            </div>
                            <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                    <Search className="h-4 w-4 mr-2" />
                                    Search
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filter
                                </Button>
                                <Button size="sm" onClick={() => setIsAddDoctorModalOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Doctor
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase tracking-wide">
                            <div className="col-span-3">Doctor</div>
                            <div className="col-span-2">Specialty</div>
                            <div className="col-span-2">Facility</div>
                            <div className="col-span-2">Contact</div>
                            <div className="col-span-1">Status</div>
                            <div className="col-span-2">Actions</div>
                        </div>

                        {/* Table Rows */}
                        <div className="divide-y divide-gray-100">
                            {recentDoctors.map((doctor) => (
                                <div key={doctor.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                                    <div className="col-span-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                {doctor.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{doctor.name}</p>
                                                <p className="text-sm text-gray-500">License: {doctor.licenseNumber}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="font-medium text-gray-900">{doctor.specialty}</p>
                                        <p className="text-sm text-gray-500">Specialist</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="font-medium text-gray-900">{doctor.facility}</p>
                                        <p className="text-sm text-gray-500">Primary location</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-900">{doctor.email}</p>
                                        <p className="text-sm text-gray-500">{doctor.phone}</p>
                                    </div>
                                    <div className="col-span-1">
                                        <Badge
                                            variant={doctor.status === 'active' ? 'default' : 'secondary'}
                                            className={doctor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}
                                        >
                                            {doctor.status}
                                        </Badge>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="flex items-center space-x-2">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add Doctor Modal */}
            <AddDoctorModal
                isOpen={isAddDoctorModalOpen}
                onClose={() => setIsAddDoctorModalOpen(false)}
                onSubmit={handleAddDoctor}
            />
        </SuperAdminLayout>
    );
}
