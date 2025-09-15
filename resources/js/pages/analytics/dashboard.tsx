import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { AdvancedAnalyticsDashboard } from '@/components/analytics/AdvancedAnalyticsDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    BarChart3, 
    TrendingUp, 
    Users, 
    Truck, 
    Clock, 
    Activity,
    AlertTriangle,
    CheckCircle,
    Brain,
    Target,
    Download,
    Settings,
    Filter,
    Calendar,
    RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface AnalyticsDashboardProps {
    analytics: any;
    filters: any;
    dashboards: any[];
    user: any;
}

export default function AnalyticsDashboard({ 
    analytics: initialAnalytics, 
    filters: initialFilters, 
    dashboards,
    user 
}: AnalyticsDashboardProps) {
    const [analytics, setAnalytics] = useState(initialAnalytics);
    const [filters, setFilters] = useState(initialFilters);
    const [loading, setLoading] = useState(false);
    const [selectedDashboard, setSelectedDashboard] = useState('default');
    const [activeView, setActiveView] = useState('overview');
    const [realTimeUpdates, setRealTimeUpdates] = useState(true);

    // Auto-refresh data every 5 minutes if real-time updates are enabled
    useEffect(() => {
        if (!realTimeUpdates) return;

        const interval = setInterval(() => {
            refreshData();
        }, 300000); // 5 minutes

        return () => clearInterval(interval);
    }, [realTimeUpdates, filters]);

    const refreshData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/v1/analytics', {
                params: filters
            });
            setAnalytics(response.data.data);
        } catch (error) {
            console.error('Failed to refresh analytics data:', error);
            toast.error('Failed to refresh data');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        
        // Refresh data with new filters
        refreshData();
    };

    const exportData = async (format: 'pdf' | 'excel' | 'csv') => {
        try {
            const response = await axios.post('/api/v1/analytics/generate-report', {
                report_type: 'dashboard_export',
                parameters: {
                    ...filters,
                    dashboard_type: selectedDashboard,
                    view: activeView
                },
                output_format: format
            });

            // Handle file download
            const blob = new Blob([response.data], { 
                type: format === 'pdf' ? 'application/pdf' : 'application/octet-stream' 
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `analytics-dashboard-${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(`Dashboard exported as ${format.toUpperCase()}`);
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export dashboard');
        }
    };

    const getSystemHealthStatus = () => {
        if (!analytics?.performance_metrics?.system_health_score) return 'unknown';
        
        const score = analytics.performance_metrics.system_health_score;
        if (score >= 90) return 'excellent';
        if (score >= 80) return 'good';
        if (score >= 70) return 'fair';
        if (score >= 60) return 'poor';
        return 'critical';
    };

    const getHealthStatusColor = (status: string) => {
        switch (status) {
            case 'excellent': return 'bg-green-500';
            case 'good': return 'bg-blue-500';
            case 'fair': return 'bg-yellow-500';
            case 'poor': return 'bg-orange-500';
            case 'critical': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const renderQuickStats = () => {
        if (!analytics?.overview) return null;

        const { overview } = analytics;
        const healthStatus = getSystemHealthStatus();

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Referrals</p>
                                <p className="text-xl font-bold">{overview.total_referrals}</p>
                            </div>
                            <Users className="h-6 w-6 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Response Time</p>
                                <p className="text-xl font-bold">{overview.average_response_time}min</p>
                            </div>
                            <Clock className="h-6 w-6 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Ambulances</p>
                                <p className="text-xl font-bold">{overview.active_ambulances}</p>
                            </div>
                            <Truck className="h-6 w-6 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Bed Utilization</p>
                                <p className="text-xl font-bold">{overview.bed_utilization_rate}%</p>
                            </div>
                            <Activity className="h-6 w-6 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">System Health</p>
                                <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${getHealthStatusColor(healthStatus)}`} />
                                    <span className="text-sm font-medium capitalize">{healthStatus}</span>
                                </div>
                            </div>
                            <Target className="h-6 w-6 text-indigo-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderAlerts = () => {
        const alerts = analytics?.anomalies || [];
        const criticalAlerts = alerts.filter((alert: any) => alert.severity === 'critical');
        
        if (criticalAlerts.length === 0) return null;

        return (
            <Card className="mb-6 border-red-200 bg-red-50">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-red-800">
                        <AlertTriangle className="h-5 w-5" />
                        Critical Alerts ({criticalAlerts.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {criticalAlerts.slice(0, 3).map((alert: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                <span className="text-sm">{alert.description}</span>
                                <Button size="sm" variant="outline">
                                    View Details
                                </Button>
                            </div>
                        ))}
                        {criticalAlerts.length > 3 && (
                            <div className="text-center">
                                <Button variant="link" size="sm">
                                    View {criticalAlerts.length - 3} more alerts
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <AppLayout title="Analytics Dashboard">
            <Head title="Analytics Dashboard" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                            <p className="text-gray-600">
                                Real-time insights and predictive analytics for healthcare operations
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            {/* Real-time toggle */}
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Real-time</span>
                                <button
                                    onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        realTimeUpdates ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            realTimeUpdates ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Filters */}
                            <Select value={filters.facility_id || 'all'} onValueChange={(value) => handleFilterChange('facility_id', value === 'all' ? null : value)}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="All Facilities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Facilities</SelectItem>
                                    {/* Add facility options here */}
                                </SelectContent>
                            </Select>

                            <Select value={selectedDashboard} onValueChange={setSelectedDashboard}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">Default View</SelectItem>
                                    <SelectItem value="executive">Executive</SelectItem>
                                    <SelectItem value="operational">Operational</SelectItem>
                                    <SelectItem value="clinical">Clinical</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Actions */}
                            <Button
                                variant="outline"
                                onClick={refreshData}
                                disabled={loading}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>

                            <Select onValueChange={(format) => exportData(format as 'pdf' | 'excel' | 'csv')}>
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Export" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pdf">PDF</SelectItem>
                                    <SelectItem value="excel">Excel</SelectItem>
                                    <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    {renderQuickStats()}

                    {/* Critical Alerts */}
                    {renderAlerts()}

                    {/* Main Dashboard */}
                    <Tabs value={activeView} onValueChange={setActiveView}>
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="predictive">Predictive</TabsTrigger>
                            <TabsTrigger value="performance">Performance</TabsTrigger>
                            <TabsTrigger value="quality">Quality</TabsTrigger>
                            <TabsTrigger value="operations">Operations</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="overview">
                            <AdvancedAnalyticsDashboard 
                                initialData={analytics}
                                facilityId={filters.facility_id}
                            />
                        </TabsContent>
                        
                        <TabsContent value="predictive">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Brain className="h-5 w-5" />
                                            Demand Forecasting
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                            <div className="text-center text-gray-500">
                                                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>Demand forecast chart</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Risk Assessment</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                            <div className="text-center text-gray-500">
                                                <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>Risk assessment matrix</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="performance">
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Performance Benchmarks</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                            <div className="text-center text-gray-500">
                                                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>Performance benchmarks chart</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="quality">
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quality Indicators</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                            <div className="text-center text-gray-500">
                                                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>Quality metrics dashboard</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="operations">
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Operational Metrics</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                            <div className="text-center text-gray-500">
                                                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>Operational dashboard</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}
