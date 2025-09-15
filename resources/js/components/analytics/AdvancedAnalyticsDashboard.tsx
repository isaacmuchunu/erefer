import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    TrendingUp, 
    TrendingDown, 
    AlertTriangle, 
    CheckCircle, 
    Clock, 
    Users, 
    Truck, 
    Activity,
    BarChart3,
    LineChart,
    PieChart,
    Brain,
    Target,
    Zap,
    RefreshCw,
    Download,
    Filter
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface AnalyticsData {
    overview: {
        total_referrals: number;
        completed_referrals: number;
        pending_referrals: number;
        urgent_referrals: number;
        total_dispatches: number;
        active_ambulances: number;
        average_response_time: number;
        bed_utilization_rate: number;
        patient_satisfaction_score: number;
        cost_per_referral: number;
    };
    referral_analytics: any;
    ambulance_analytics: any;
    patient_analytics: any;
    facility_analytics: any;
    predictive_insights: any;
    performance_metrics: any;
    quality_indicators: any;
}

interface PredictiveInsight {
    type: string;
    predictions: Array<{
        date: string;
        predicted_referrals: number;
        confidence_lower: number;
        confidence_upper: number;
        confidence_level: number;
    }>;
    model_accuracy: number;
    trend_direction: string;
}

interface AnomalyAlert {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    detected_at: string;
    recommendations: string[];
}

interface AdvancedAnalyticsDashboardProps {
    initialData?: AnalyticsData;
    facilityId?: number;
}

export const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({
    initialData,
    facilityId
}) => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(initialData || null);
    const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight | null>(null);
    const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
    const [decisionSupport, setDecisionSupport] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
    const [selectedMetrics, setSelectedMetrics] = useState(['referrals', 'ambulances', 'performance']);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!initialData) {
            fetchAnalyticsData();
        }
        fetchPredictiveInsights();
        fetchAnomalies();
        fetchDecisionSupport();
    }, [selectedTimeRange, facilityId]);

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            const params: any = {};
            
            if (facilityId) params.facility_id = facilityId;
            
            // Calculate date range based on selection
            const endDate = new Date();
            const startDate = new Date();
            switch (selectedTimeRange) {
                case '7d':
                    startDate.setDate(endDate.getDate() - 7);
                    break;
                case '30d':
                    startDate.setDate(endDate.getDate() - 30);
                    break;
                case '90d':
                    startDate.setDate(endDate.getDate() - 90);
                    break;
                case '1y':
                    startDate.setFullYear(endDate.getFullYear() - 1);
                    break;
            }
            
            params.start_date = startDate.toISOString().split('T')[0];
            params.end_date = endDate.toISOString().split('T')[0];

            const response = await axios.get('/api/v1/analytics', { params });
            setAnalyticsData(response.data.data);
        } catch (error) {
            console.error('Failed to fetch analytics data:', error);
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    const fetchPredictiveInsights = async () => {
        try {
            const response = await axios.get('/api/v1/analytics/predictive-insights', {
                params: {
                    type: 'demand_forecast',
                    facility_id: facilityId,
                    parameters: { forecast_days: 30 }
                }
            });
            setPredictiveInsights(response.data.insights);
        } catch (error) {
            console.error('Failed to fetch predictive insights:', error);
        }
    };

    const fetchAnomalies = async () => {
        try {
            const response = await axios.post('/api/v1/analytics/detect-anomalies', {
                metrics: selectedMetrics,
                threshold: 2.0,
                window_size: 30
            });
            setAnomalies(response.data.anomalies.anomalies || []);
        } catch (error) {
            console.error('Failed to fetch anomalies:', error);
        }
    };

    const fetchDecisionSupport = async () => {
        try {
            const response = await axios.get('/api/v1/analytics/decision-support', {
                params: { facility_id: facilityId }
            });
            setDecisionSupport(response.data.recommendations);
        } catch (error) {
            console.error('Failed to fetch decision support:', error);
        }
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const formatPercentage = (num: number): string => {
        return `${num.toFixed(1)}%`;
    };

    const getSeverityColor = (severity: string): string => {
        switch (severity) {
            case 'critical': return 'bg-red-500';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    const renderOverviewCards = () => {
        if (!analyticsData) return null;

        const { overview } = analyticsData;

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                                <p className="text-2xl font-bold">{formatNumber(overview.total_referrals)}</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-500" />
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-green-600">+12% from last period</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                                <p className="text-2xl font-bold">{overview.average_response_time}min</p>
                            </div>
                            <Clock className="h-8 w-8 text-orange-500" />
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-green-600">-8% improvement</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Ambulances</p>
                                <p className="text-2xl font-bold">{overview.active_ambulances}</p>
                            </div>
                            <Truck className="h-8 w-8 text-green-500" />
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-green-600">All operational</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Bed Utilization</p>
                                <p className="text-2xl font-bold">{formatPercentage(overview.bed_utilization_rate)}</p>
                            </div>
                            <Activity className="h-8 w-8 text-purple-500" />
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                            <Target className="h-4 w-4 text-blue-500 mr-1" />
                            <span className="text-blue-600">Target: 85%</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderPredictiveInsights = () => {
        if (!predictiveInsights) return null;

        return (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        Predictive Insights - Demand Forecast
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div>
                            <h4 className="font-semibold mb-2">Model Performance</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Accuracy:</span>
                                    <Badge variant="outline">{predictiveInsights.model_accuracy}%</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>Trend:</span>
                                    <Badge className={predictiveInsights.trend_direction === 'increasing' ? 'bg-green-500' : 'bg-red-500'}>
                                        {predictiveInsights.trend_direction}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        
                        <div className="lg:col-span-2">
                            <h4 className="font-semibold mb-2">30-Day Forecast</h4>
                            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                <div className="text-center text-gray-500">
                                    <LineChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Forecast Chart</p>
                                    <p className="text-sm">Chart component would be rendered here</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderAnomalies = () => {
        if (anomalies.length === 0) return null;

        return (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Anomaly Detection
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {anomalies.map((anomaly, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                                <div className={`w-3 h-3 rounded-full mt-1 ${getSeverityColor(anomaly.severity)}`} />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium">{anomaly.type}</h4>
                                        <Badge variant="outline" className={`${getSeverityColor(anomaly.severity)} text-white border-0`}>
                                            {anomaly.severity}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{anomaly.description}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Detected: {new Date(anomaly.detected_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderDecisionSupport = () => {
        if (!decisionSupport || !decisionSupport.recommendations) return null;

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Real-time Decision Support
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {decisionSupport.recommendations.map((rec: any, index: number) => (
                            <div key={index} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium">{rec.type.replace('_', ' ').toUpperCase()}</h4>
                                    <Badge className={getSeverityColor(rec.priority)}>
                                        {rec.priority}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{rec.message}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Impact: {rec.estimated_impact}</span>
                                    <Button size="sm" variant="outline">
                                        Take Action
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">System Health Score</span>
                            <Badge className="bg-blue-500">{decisionSupport.system_health_score}%</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Advanced Analytics Dashboard</h1>
                
                <div className="flex items-center space-x-4">
                    <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                            <SelectItem value="1y">Last year</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    <Button
                        variant="outline"
                        onClick={fetchAnalyticsData}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Overview Cards */}
            {renderOverviewCards()}

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="predictive">Predictive</TabsTrigger>
                    <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
                    <TabsTrigger value="decisions">Decisions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Referral Trends</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <div className="text-center text-gray-500">
                                        <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>Referral trends chart</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Metrics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <div className="text-center text-gray-500">
                                        <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>Performance metrics chart</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                
                <TabsContent value="predictive">
                    {renderPredictiveInsights()}
                </TabsContent>
                
                <TabsContent value="anomalies">
                    {renderAnomalies()}
                </TabsContent>
                
                <TabsContent value="decisions">
                    {renderDecisionSupport()}
                </TabsContent>
            </Tabs>
        </div>
    );
};
