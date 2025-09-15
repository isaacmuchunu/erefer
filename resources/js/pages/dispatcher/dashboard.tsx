import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Truck, 
    AlertTriangle, 
    Clock, 
    MapPin, 
    Phone, 
    Radio,
    Activity,
    Users,
    TrendingUp,
    RefreshCw,
    Plus,
    Bell
} from 'lucide-react';

interface DispatcherDashboardProps {
    auth: {
        user: any;
    };
    dashboardData: {
        active_dispatches: any[];
        available_ambulances: any[];
        emergency_alerts: any[];
        metrics: any;
        recent_activity: any[];
        last_updated: string;
    };
    userPermissions: {
        canDispatchAmbulances: boolean;
        canSendEmergencyAlerts: boolean;
        canManageAmbulances: boolean;
        canViewAllDispatches: boolean;
        canAccessEmergencyComms: boolean;
    };
}

export default function DispatcherDashboard({ auth, dashboardData, userPermissions }: DispatcherDashboardProps) {
    const { user } = auth;
    const [data, setData] = useState(dashboardData);
    const [loading, setLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date(dashboardData.last_updated));

    // Auto-refresh dashboard data every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            refreshData();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const refreshData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/dispatcher/dashboard/updates');
            if (response.ok) {
                const result = await response.json();
                setData(result.data);
                setLastUpdate(new Date(result.timestamp));
            }
        } catch (error) {
            console.error('Error refreshing dashboard data:', error);
        } finally {
            setLoading(false);
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800 border-green-200';
            case 'dispatched': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'en_route': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'on_scene': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'maintenance': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'out_of_service': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const timeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    return (
        <AppLayout user={user}>
            <Head title="Dispatcher Dashboard - CareLink" />
            
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dispatcher Dashboard</h1>
                            <p className="text-gray-600 mt-1">
                                Real-time emergency dispatch and ambulance management
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-500">
                                Last updated: {lastUpdate.toLocaleTimeString()}
                            </div>
                            <Button 
                                onClick={refreshData} 
                                disabled={loading}
                                variant="outline"
                                size="sm"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            {userPermissions.canDispatchAmbulances && (
                                <Button className="bg-emerald-600 hover:bg-emerald-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Quick Dispatch
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Active Dispatches</p>
                                        <p className="text-3xl font-bold text-emerald-600">
                                            {data.metrics.dispatches.active}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {data.metrics.dispatches.pending} pending
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                        <Truck className="h-6 w-6 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Available Ambulances</p>
                                        <p className="text-3xl font-bold text-blue-600">
                                            {data.metrics.ambulances.available}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            of {data.metrics.ambulances.total} total
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Activity className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                                        <p className="text-3xl font-bold text-orange-600">
                                            {data.metrics.response_times.average_today}m
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Target: {data.metrics.response_times.target}m
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Clock className="h-6 w-6 text-orange-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Emergency Alerts</p>
                                        <p className="text-3xl font-bold text-red-600">
                                            {data.metrics.emergency_alerts.active}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {data.metrics.emergency_alerts.critical} critical today
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Tabs */}
                    <Tabs defaultValue="dispatches" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="dispatches">Active Dispatches</TabsTrigger>
                            <TabsTrigger value="ambulances">Available Ambulances</TabsTrigger>
                            <TabsTrigger value="alerts">Emergency Alerts</TabsTrigger>
                            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                        </TabsList>

                        {/* Active Dispatches Tab */}
                        <TabsContent value="dispatches">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Truck className="h-5 w-5 mr-2 text-emerald-600" />
                                        Active Dispatches ({data.active_dispatches.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {data.active_dispatches.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                                <p>No active dispatches at the moment</p>
                                            </div>
                                        ) : (
                                            data.active_dispatches.map((dispatch: any) => (
                                                <div key={dispatch.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                <Badge className={getPriorityColor(dispatch.priority)}>
                                                                    {dispatch.priority.toUpperCase()}
                                                                </Badge>
                                                                <Badge className={getStatusColor(dispatch.status)}>
                                                                    {dispatch.status.replace('_', ' ').toUpperCase()}
                                                                </Badge>
                                                                {dispatch.ambulance && (
                                                                    <span className="text-sm font-medium text-gray-600">
                                                                        {dispatch.ambulance.call_sign}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        Patient: {dispatch.patient.name}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600">
                                                                        Age: {dispatch.patient.age || 'Unknown'}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600">
                                                                        Condition: {dispatch.patient.condition}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center text-sm text-gray-600 mb-1">
                                                                        <MapPin className="h-4 w-4 mr-1" />
                                                                        From: {dispatch.location.pickup}
                                                                    </div>
                                                                    <div className="flex items-center text-sm text-gray-600">
                                                                        <MapPin className="h-4 w-4 mr-1" />
                                                                        To: {dispatch.location.destination}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right text-sm text-gray-500">
                                                            <p>Created: {formatTime(dispatch.times.created)}</p>
                                                            {dispatch.times.eta && (
                                                                <p>ETA: {formatTime(dispatch.times.eta)}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Available Ambulances Tab */}
                        <TabsContent value="ambulances">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Activity className="h-5 w-5 mr-2 text-blue-600" />
                                        Available Ambulances ({data.available_ambulances.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {data.available_ambulances.map((ambulance: any) => (
                                            <div key={ambulance.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {ambulance.call_sign}
                                                    </h3>
                                                    <Badge className={getStatusColor(ambulance.status)}>
                                                        {ambulance.status.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <p className="text-gray-600">
                                                        Type: {ambulance.type}
                                                    </p>
                                                    <p className="text-gray-600">
                                                        Location: {ambulance.current_location || 'Unknown'}
                                                    </p>
                                                    <p className="text-gray-600">
                                                        Crew: {ambulance.crew.length} members
                                                    </p>
                                                    {ambulance.fuel_level && (
                                                        <p className="text-gray-600">
                                                            Fuel: {ambulance.fuel_level}%
                                                        </p>
                                                    )}
                                                </div>
                                                {userPermissions.canDispatchAmbulances && (
                                                    <Button 
                                                        size="sm" 
                                                        className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700"
                                                    >
                                                        Dispatch
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Emergency Alerts Tab */}
                        <TabsContent value="alerts">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                                        Emergency Alerts ({data.emergency_alerts.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {data.emergency_alerts.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                                <p>No emergency alerts in the last 24 hours</p>
                                            </div>
                                        ) : (
                                            data.emergency_alerts.map((alert: any) => (
                                                <div key={alert.id} className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                <Badge className="bg-red-100 text-red-800 border-red-200">
                                                                    {alert.severity.toUpperCase()}
                                                                </Badge>
                                                                <Badge variant="outline">
                                                                    {alert.type.replace('_', ' ').toUpperCase()}
                                                                </Badge>
                                                            </div>
                                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                                {alert.title}
                                                            </h3>
                                                            <p className="text-gray-700 mb-2">
                                                                {alert.message}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                Sent by: {alert.sender.name} ({alert.sender.role})
                                                            </p>
                                                        </div>
                                                        <div className="text-right text-sm text-gray-500">
                                                            <p>{timeAgo(alert.created_at)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Recent Activity Tab */}
                        <TabsContent value="activity">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                                        Recent Activity ({data.recent_activity.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {data.recent_activity.map((activity: any) => (
                                            <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                                                <div className="h-2 w-2 bg-emerald-500 rounded-full mt-2"></div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-900">
                                                        {activity.description}
                                                    </p>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        {activity.user && (
                                                            <span className="text-xs text-gray-600">
                                                                by {activity.user.name}
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-gray-500">
                                                            {activity.time_ago}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}
