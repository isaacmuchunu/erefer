import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Plus, 
    Search, 
    Filter, 
    Clock, 
    AlertTriangle, 
    CheckCircle, 
    Users, 
    TrendingUp,
    Calendar,
    MapPin,
    Phone,
    FileText,
    Download,
    RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Referral {
    id: number;
    referral_number: string;
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        date_of_birth: string;
        phone: string;
    };
    referring_facility: {
        id: number;
        name: string;
        type: string;
    };
    receiving_facility: {
        id: number;
        name: string;
        type: string;
    };
    referring_doctor: {
        id: number;
        name: string;
        specialty: string;
    };
    specialty: {
        id: number;
        name: string;
    };
    urgency: 'routine' | 'urgent' | 'emergency';
    status: string;
    reason: string;
    clinical_notes: string;
    created_at: string;
    updated_at: string;
    estimated_transfer_time?: string;
    actual_transfer_time?: string;
}

interface DashboardStats {
    total_referrals: number;
    pending_referrals: number;
    accepted_referrals: number;
    completed_referrals: number;
    emergency_referrals: number;
    average_response_time: number;
    completion_rate: number;
    referrals_today: number;
}

interface ReferralDashboardProps {
    referrals: {
        data: Referral[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: DashboardStats;
    filters: {
        search?: string;
        status?: string;
        urgency?: string;
        facility_id?: string;
        date_range?: string;
    };
    facilities: Array<{
        id: number;
        name: string;
        type: string;
    }>;
    user: any;
}

export default function ReferralDashboard({ 
    referrals: initialReferrals, 
    stats, 
    filters: initialFilters, 
    facilities,
    user 
}: ReferralDashboardProps) {
    const [referrals, setReferrals] = useState(initialReferrals);
    const [filters, setFilters] = useState(initialFilters);
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState('all');

    useEffect(() => {
        const interval = setInterval(() => {
            refreshData();
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const refreshData = async () => {
        try {
            const response = await axios.get('/referrals', {
                params: { ...filters, tab: selectedTab }
            });
            setReferrals(response.data.referrals);
        } catch (error) {
            console.error('Failed to refresh data:', error);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        
        router.get('/referrals', newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleTabChange = (tab: string) => {
        setSelectedTab(tab);
        const newFilters = { ...filters, status: tab === 'all' ? undefined : tab };
        
        router.get('/referrals', newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'emergency': return 'bg-red-500';
            case 'urgent': return 'bg-orange-500';
            case 'routine': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500';
            case 'accepted': return 'bg-blue-500';
            case 'in_progress': return 'bg-purple-500';
            case 'completed': return 'bg-green-500';
            case 'cancelled': return 'bg-red-500';
            case 'rejected': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    const handleAcceptReferral = async (referralId: number) => {
        try {
            setLoading(true);
            await axios.post(`/referrals/${referralId}/accept`);
            toast.success('Referral accepted successfully');
            refreshData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to accept referral');
        } finally {
            setLoading(false);
        }
    };

    const handleRejectReferral = async (referralId: number, reason: string) => {
        try {
            setLoading(true);
            await axios.post(`/referrals/${referralId}/reject`, { reason });
            toast.success('Referral rejected');
            refreshData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reject referral');
        } finally {
            setLoading(false);
        }
    };

    const exportReferrals = async () => {
        try {
            const response = await axios.get('/referrals/export', {
                params: filters,
                responseType: 'blob',
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `referrals-${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success('Referrals exported successfully');
        } catch (error) {
            toast.error('Failed to export referrals');
        }
    };

    const renderStatsCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                            <p className="text-2xl font-bold">{stats.total_referrals}</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">+12% from last month</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-2xl font-bold">{stats.pending_referrals}</p>
                        </div>
                        <Clock className="h-8 w-8 text-orange-500" />
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                        <span className="text-gray-600">Avg response: {stats.average_response_time}min</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Emergency</p>
                            <p className="text-2xl font-bold">{stats.emergency_referrals}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                        <span className="text-red-600">Requires immediate attention</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                            <p className="text-2xl font-bold">{stats.completion_rate}%</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                        <span className="text-green-600">Target: 95%</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderFilters = () => (
        <Card className="mb-6">
            <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-64">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search referrals..."
                                value={filters.search || ''}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <Select value={filters.urgency || 'all'} onValueChange={(value) => handleFilterChange('urgency', value === 'all' ? '' : value)}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Urgency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Urgency</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="routine">Routine</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filters.facility_id || 'all'} onValueChange={(value) => handleFilterChange('facility_id', value === 'all' ? '' : value)}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Facility" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Facilities</SelectItem>
                            {facilities.map((facility) => (
                                <SelectItem key={facility.id} value={facility.id.toString()}>
                                    {facility.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={refreshData} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>

                    <Button variant="outline" onClick={exportReferrals}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>

                    {user.can?.create_referrals && (
                        <Link href="/referrals/create">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                New Referral
                            </Button>
                        </Link>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    const renderReferralCard = (referral: Referral) => (
        <Card key={referral.id} className="mb-4 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                                {referral.patient.first_name} {referral.patient.last_name}
                            </h3>
                            <Badge className={getUrgencyColor(referral.urgency)}>
                                {referral.urgency}
                            </Badge>
                            <Badge variant="outline" className={getStatusColor(referral.status)}>
                                {referral.status}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-600">From:</p>
                                <p className="font-medium">{referral.referring_facility.name}</p>
                                <p className="text-sm text-gray-500">Dr. {referral.referring_doctor.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">To:</p>
                                <p className="font-medium">{referral.receiving_facility.name}</p>
                                <p className="text-sm text-gray-500">{referral.specialty.name}</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-1">Reason:</p>
                            <p className="text-sm">{referral.reason}</p>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDistanceToNow(new Date(referral.created_at), { addSuffix: true })}
                            </div>
                            <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                #{referral.referral_number}
                            </div>
                            {referral.patient.phone && (
                                <div className="flex items-center gap-1">
                                    <Phone className="h-4 w-4" />
                                    {referral.patient.phone}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                        <Link href={`/referrals/${referral.id}`}>
                            <Button variant="outline" size="sm">
                                View Details
                            </Button>
                        </Link>
                        
                        {referral.status === 'pending' && user.can?.accept_referrals && (
                            <>
                                <Button 
                                    size="sm" 
                                    onClick={() => handleAcceptReferral(referral.id)}
                                    disabled={loading}
                                >
                                    Accept
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                        const reason = prompt('Please provide a reason for rejection:');
                                        if (reason) {
                                            handleRejectReferral(referral.id, reason);
                                        }
                                    }}
                                    disabled={loading}
                                >
                                    Reject
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <AppLayout title="Referral Dashboard">
            <Head title="Referral Dashboard" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Referral Dashboard</h1>
                    </div>

                    {renderStatsCards()}
                    {renderFilters()}

                    <Tabs value={selectedTab} onValueChange={handleTabChange}>
                        <TabsList className="grid w-full grid-cols-6">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="accepted">Accepted</TabsTrigger>
                            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                            <TabsTrigger value="completed">Completed</TabsTrigger>
                            <TabsTrigger value="emergency">Emergency</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value={selectedTab} className="mt-6">
                            {referrals.data.length > 0 ? (
                                <div>
                                    {referrals.data.map(renderReferralCard)}
                                    
                                    {/* Pagination */}
                                    {referrals.last_page > 1 && (
                                        <div className="flex items-center justify-between mt-6">
                                            <p className="text-sm text-gray-700">
                                                Showing {((referrals.current_page - 1) * referrals.per_page) + 1} to{' '}
                                                {Math.min(referrals.current_page * referrals.per_page, referrals.total)} of{' '}
                                                {referrals.total} results
                                            </p>
                                            
                                            <div className="flex gap-2">
                                                {referrals.current_page > 1 && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => router.get('/referrals', { ...filters, page: referrals.current_page - 1 })}
                                                    >
                                                        Previous
                                                    </Button>
                                                )}
                                                {referrals.current_page < referrals.last_page && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => router.get('/referrals', { ...filters, page: referrals.current_page + 1 })}
                                                    >
                                                        Next
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="p-12 text-center">
                                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No referrals found</h3>
                                        <p className="text-gray-500 mb-4">
                                            {selectedTab === 'all' 
                                                ? 'No referrals match your current filters.' 
                                                : `No ${selectedTab} referrals found.`
                                            }
                                        </p>
                                        {user.can?.create_referrals && (
                                            <Link href="/referrals/create">
                                                <Button>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Create First Referral
                                                </Button>
                                            </Link>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}
