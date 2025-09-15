import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Truck, 
    MapPin, 
    Clock, 
    AlertTriangle, 
    CheckCircle, 
    Navigation, 
    Phone,
    Plus,
    RefreshCw,
    Users,
    Activity,
    Timer,
    Route
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface AmbulanceDispatch {
    id: number;
    dispatch_number: string;
    ambulance: {
        id: number;
        vehicle_number: string;
        type: string;
        current_location: {
            latitude: number;
            longitude: number;
            address?: string;
        };
    };
    referral?: {
        id: number;
        patient: {
            first_name: string;
            last_name: string;
            phone?: string;
        };
    };
    pickup_location: {
        latitude: number;
        longitude: number;
        address: string;
    };
    destination_location: {
        latitude: number;
        longitude: number;
        address: string;
    };
    priority: 'routine' | 'urgent' | 'emergency';
    status: string;
    dispatched_at: string;
    estimated_arrival_time?: string;
    actual_pickup_time?: string;
    actual_delivery_time?: string;
    crew_members?: string[];
    special_instructions?: string;
}

interface DispatchStats {
    active_dispatches: number;
    available_ambulances: number;
    emergency_dispatches: number;
    average_response_time: number;
    completed_today: number;
    total_distance_today: number;
}

interface DispatchDashboardProps {
    dispatches: {
        data: AmbulanceDispatch[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: DispatchStats;
    filters: {
        status?: string;
        priority?: string;
        ambulance_id?: string;
    };
    ambulances: Array<{
        id: number;
        vehicle_number: string;
        status: string;
        type: string;
    }>;
    user: any;
}

export default function DispatchDashboard({ 
    dispatches: initialDispatches, 
    stats, 
    filters: initialFilters, 
    ambulances,
    user 
}: DispatchDashboardProps) {
    const [dispatches, setDispatches] = useState(initialDispatches);
    const [filters, setFilters] = useState(initialFilters);
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState('active');

    useEffect(() => {
        const interval = setInterval(() => {
            refreshData();
        }, 15000); // Refresh every 15 seconds for real-time updates

        return () => clearInterval(interval);
    }, []);

    const refreshData = async () => {
        try {
            const response = await axios.get('/ambulances/dispatch', {
                params: { ...filters, tab: selectedTab }
            });
            setDispatches(response.data.dispatches);
        } catch (error) {
            console.error('Failed to refresh data:', error);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        
        router.get('/ambulances/dispatch', newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleTabChange = (tab: string) => {
        setSelectedTab(tab);
        const newFilters = { ...filters, status: tab === 'all' ? undefined : tab };
        
        router.get('/ambulances/dispatch', newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'emergency': return 'bg-red-500 text-white';
            case 'urgent': return 'bg-orange-500 text-white';
            case 'routine': return 'bg-blue-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'dispatched': return 'bg-yellow-500 text-white';
            case 'acknowledged': return 'bg-blue-500 text-white';
            case 'en_route_pickup': return 'bg-purple-500 text-white';
            case 'at_pickup': return 'bg-indigo-500 text-white';
            case 'patient_loaded': return 'bg-cyan-500 text-white';
            case 'en_route_destination': return 'bg-teal-500 text-white';
            case 'at_destination': return 'bg-green-500 text-white';
            case 'completed': return 'bg-green-600 text-white';
            case 'cancelled': return 'bg-red-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const handleUpdateStatus = async (dispatchId: number, newStatus: string) => {
        try {
            setLoading(true);
            await axios.patch(`/ambulances/dispatch/${dispatchId}/status`, {
                status: newStatus
            });
            toast.success('Status updated successfully');
            refreshData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    const renderStatsCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Dispatches</p>
                            <p className="text-2xl font-bold">{stats.active_dispatches}</p>
                        </div>
                        <Activity className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                        <span className="text-blue-600">Currently in progress</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Available Ambulances</p>
                            <p className="text-2xl font-bold">{stats.available_ambulances}</p>
                        </div>
                        <Truck className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                        <span className="text-green-600">Ready for dispatch</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Emergency Calls</p>
                            <p className="text-2xl font-bold">{stats.emergency_dispatches}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                        <span className="text-red-600">High priority</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                            <p className="text-2xl font-bold">{stats.average_response_time}min</p>
                        </div>
                        <Timer className="h-8 w-8 text-purple-500" />
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                        <span className="text-purple-600">Target: 8min</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderFilters = () => (
        <Card className="mb-6">
            <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-4">
                    <Select value={filters.priority || 'all'} onValueChange={(value) => handleFilterChange('priority', value === 'all' ? '' : value)}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priority</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="routine">Routine</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filters.ambulance_id || 'all'} onValueChange={(value) => handleFilterChange('ambulance_id', value === 'all' ? '' : value)}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Ambulance" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Ambulances</SelectItem>
                            {ambulances.map((ambulance) => (
                                <SelectItem key={ambulance.id} value={ambulance.id.toString()}>
                                    {ambulance.vehicle_number} ({ambulance.type})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={refreshData} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>

                    {user.can?.create_dispatches && (
                        <Link href="/ambulances/dispatch/create">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                New Dispatch
                            </Button>
                        </Link>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    const renderDispatchCard = (dispatch: AmbulanceDispatch) => (
        <Card key={dispatch.id} className="mb-4 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold">
                                {dispatch.ambulance.vehicle_number}
                            </h3>
                            <Badge className={getPriorityColor(dispatch.priority)}>
                                {dispatch.priority}
                            </Badge>
                            <Badge className={getStatusColor(dispatch.status)}>
                                {dispatch.status.replace('_', ' ')}
                            </Badge>
                        </div>

                        {dispatch.referral && (
                            <div className="mb-3">
                                <p className="text-sm text-gray-600">Patient:</p>
                                <p className="font-medium">
                                    {dispatch.referral.patient.first_name} {dispatch.referral.patient.last_name}
                                </p>
                                {dispatch.referral.patient.phone && (
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <Phone className="h-4 w-4" />
                                        {dispatch.referral.patient.phone}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-600">Pickup Location:</p>
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                    <p className="text-sm">{dispatch.pickup_location.address}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Destination:</p>
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                    <p className="text-sm">{dispatch.destination_location.address}</p>
                                </div>
                            </div>
                        </div>

                        {dispatch.special_instructions && (
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-1">Special Instructions:</p>
                                <p className="text-sm bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                                    {dispatch.special_instructions}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Dispatched {formatDistanceToNow(new Date(dispatch.dispatched_at), { addSuffix: true })}
                            </div>
                            {dispatch.estimated_arrival_time && (
                                <div className="flex items-center gap-1">
                                    <Timer className="h-4 w-4" />
                                    ETA: {new Date(dispatch.estimated_arrival_time).toLocaleTimeString()}
                                </div>
                            )}
                            {dispatch.crew_members && dispatch.crew_members.length > 0 && (
                                <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    {dispatch.crew_members.length} crew members
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                        <Link href={`/ambulances/dispatch/${dispatch.id}`}>
                            <Button variant="outline" size="sm">
                                <Navigation className="h-4 w-4 mr-2" />
                                Track
                            </Button>
                        </Link>
                        
                        {dispatch.status === 'dispatched' && user.can?.update_dispatches && (
                            <Button 
                                size="sm" 
                                onClick={() => handleUpdateStatus(dispatch.id, 'acknowledged')}
                                disabled={loading}
                            >
                                Acknowledge
                            </Button>
                        )}

                        {dispatch.status === 'acknowledged' && user.can?.update_dispatches && (
                            <Button 
                                size="sm" 
                                onClick={() => handleUpdateStatus(dispatch.id, 'en_route_pickup')}
                                disabled={loading}
                            >
                                En Route
                            </Button>
                        )}

                        {dispatch.status === 'en_route_pickup' && user.can?.update_dispatches && (
                            <Button 
                                size="sm" 
                                onClick={() => handleUpdateStatus(dispatch.id, 'at_pickup')}
                                disabled={loading}
                            >
                                At Pickup
                            </Button>
                        )}

                        {dispatch.status === 'at_pickup' && user.can?.update_dispatches && (
                            <Button 
                                size="sm" 
                                onClick={() => handleUpdateStatus(dispatch.id, 'patient_loaded')}
                                disabled={loading}
                            >
                                Patient Loaded
                            </Button>
                        )}

                        {dispatch.status === 'patient_loaded' && user.can?.update_dispatches && (
                            <Button 
                                size="sm" 
                                onClick={() => handleUpdateStatus(dispatch.id, 'en_route_destination')}
                                disabled={loading}
                            >
                                To Destination
                            </Button>
                        )}

                        {dispatch.status === 'en_route_destination' && user.can?.update_dispatches && (
                            <Button 
                                size="sm" 
                                onClick={() => handleUpdateStatus(dispatch.id, 'at_destination')}
                                disabled={loading}
                            >
                                At Destination
                            </Button>
                        )}

                        {dispatch.status === 'at_destination' && user.can?.update_dispatches && (
                            <Button 
                                size="sm" 
                                onClick={() => handleUpdateStatus(dispatch.id, 'completed')}
                                disabled={loading}
                            >
                                Complete
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <AppLayout title="Ambulance Dispatch Dashboard">
            <Head title="Ambulance Dispatch Dashboard" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Ambulance Dispatch Dashboard</h1>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                Live Updates
                            </div>
                        </div>
                    </div>

                    {renderStatsCards()}
                    {renderFilters()}

                    <Tabs value={selectedTab} onValueChange={handleTabChange}>
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="active">Active</TabsTrigger>
                            <TabsTrigger value="dispatched">Dispatched</TabsTrigger>
                            <TabsTrigger value="en_route">En Route</TabsTrigger>
                            <TabsTrigger value="completed">Completed</TabsTrigger>
                            <TabsTrigger value="emergency">Emergency</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value={selectedTab} className="mt-6">
                            {dispatches.data.length > 0 ? (
                                <div>
                                    {dispatches.data.map(renderDispatchCard)}
                                    
                                    {/* Pagination */}
                                    {dispatches.last_page > 1 && (
                                        <div className="flex items-center justify-between mt-6">
                                            <p className="text-sm text-gray-700">
                                                Showing {((dispatches.current_page - 1) * dispatches.per_page) + 1} to{' '}
                                                {Math.min(dispatches.current_page * dispatches.per_page, dispatches.total)} of{' '}
                                                {dispatches.total} results
                                            </p>
                                            
                                            <div className="flex gap-2">
                                                {dispatches.current_page > 1 && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => router.get('/ambulances/dispatch', { ...filters, page: dispatches.current_page - 1 })}
                                                    >
                                                        Previous
                                                    </Button>
                                                )}
                                                {dispatches.current_page < dispatches.last_page && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => router.get('/ambulances/dispatch', { ...filters, page: dispatches.current_page + 1 })}
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
                                        <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No dispatches found</h3>
                                        <p className="text-gray-500 mb-4">
                                            {selectedTab === 'active' 
                                                ? 'No active dispatches at the moment.' 
                                                : `No ${selectedTab} dispatches found.`
                                            }
                                        </p>
                                        {user.can?.create_dispatches && (
                                            <Link href="/ambulances/dispatch/create">
                                                <Button>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Create New Dispatch
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
