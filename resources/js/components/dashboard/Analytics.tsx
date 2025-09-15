import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Download,
  Calendar,
  Heart,
  Building2,
  Ambulance,
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  PieChart,
  LineChart,
  Brain,
  Target,
  Zap,
  Globe,
  Award,
  Shield,
  Settings
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale,
  Filler
);

interface ReferralStats {
    by_day: Record<string, number>;
    by_urgency: Record<string, number>;
    by_specialty: Array<{ specialty_name: string; count: number }>;
}

interface AnalyticsProps {
    analytics: ReferralStats | null;
}

export function Analytics({ analytics }: AnalyticsProps) {
  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  // Sample data for charts
  const referralTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Referrals',
        data: [65, 78, 90, 81, 95, 105, 110, 125, 140, 155, 170, 185],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Completed',
        data: [60, 72, 85, 76, 88, 98, 102, 115, 128, 142, 158, 172],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const departmentPerformanceData = {
    labels: ['Emergency', 'Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology', 'Radiology'],
    datasets: [
      {
        label: 'Patient Volume',
        data: [78, 45, 56, 32, 28, 95],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(14, 165, 233, 0.8)',
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(14, 165, 233, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const facilityUtilizationData = {
    labels: ['Operational', 'Under Maintenance', 'At Capacity', 'Available'],
    datasets: [
      {
        data: [16, 2, 8, 6],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const ambulanceResponseData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Response Time (minutes)',
        data: [8.5, 7.2, 9.1, 6.8, 8.9, 10.2, 9.5],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
      },
      {
        label: 'Target Time',
        data: [10, 10, 10, 10, 10, 10, 10],
        backgroundColor: 'rgba(34, 197, 94, 0.3)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        type: 'line' as const,
      },
    ],
  };

  // Download functions
  const downloadReport = (type: string) => {
    // Simulate report generation and download
    const data = {
      type,
      timestamp: new Date().toISOString(),
      summary: {
        totalReferrals: 2847,
        activePatients: 1456,
        completedAppointments: 3892,
        successRate: 94.7,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">📊 Healthcare Analytics & Intelligence Center</h2>
            <p className="text-blue-100">Advanced analytics, AI insights, and comprehensive reporting for data-driven healthcare decisions</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={() => downloadReport('comprehensive')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Insights
            </Button>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Referrals</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-gray-900">2,847</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-gray-600 uppercase tracking-wide">Active Patients</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-gray-900">1,456</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.2% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-gray-600 uppercase tracking-wide">Appointments</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-gray-900">3,892</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15.7% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-gray-600 uppercase tracking-wide">Success Rate</CardTitle>
              <div className="p-2 bg-amber-100 rounded-lg">
                <Target className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-gray-900">94.7%</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2.1% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-gray-600 uppercase tracking-wide">Avg Response</CardTitle>
              <div className="p-2 bg-red-100 rounded-lg">
                <Clock className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-gray-900">8.4 min</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingDown className="h-3 w-3 mr-1" />
              -1.2 min improvement
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-gray-600 uppercase tracking-wide">AI Accuracy</CardTitle>
              <div className="p-2 bg-teal-100 rounded-lg">
                <Brain className="h-4 w-4 text-teal-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-gray-900">97.3%</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +0.8% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Referral Trends */}
        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <LineChart className="h-5 w-5 text-blue-600 mr-2" />
                Referral Trends & Completion Rates
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCSV([
                  { month: 'Jan', referrals: 65, completed: 60 },
                  { month: 'Feb', referrals: 78, completed: 72 },
                  { month: 'Mar', referrals: 90, completed: 85 },
                  { month: 'Apr', referrals: 81, completed: 76 },
                  { month: 'May', referrals: 95, completed: 88 },
                  { month: 'Jun', referrals: 105, completed: 98 },
                  { month: 'Jul', referrals: 110, completed: 102 },
                  { month: 'Aug', referrals: 125, completed: 115 },
                  { month: 'Sep', referrals: 140, completed: 128 },
                  { month: 'Oct', referrals: 155, completed: 142 },
                  { month: 'Nov', referrals: 170, completed: 158 },
                  { month: 'Dec', referrals: 185, completed: 172 }
                ], 'referral-trends')}
              >
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div style={{ height: '300px' }}>
              <Line data={referralTrendsData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
                Department Patient Volume
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCSV([
                  { department: 'Emergency', volume: 78 },
                  { department: 'Cardiology', volume: 45 },
                  { department: 'Pediatrics', volume: 56 },
                  { department: 'Orthopedics', volume: 32 },
                  { department: 'Neurology', volume: 28 },
                  { department: 'Radiology', volume: 95 }
                ], 'department-performance')}
              >
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div style={{ height: '300px' }}>
              <Bar data={departmentPerformanceData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Analytics */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Facility Utilization */}
        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Building2 className="h-5 w-5 text-purple-600 mr-2" />
                Facility Status
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCSV([
                  { status: 'Operational', count: 16 },
                  { status: 'Under Maintenance', count: 2 },
                  { status: 'At Capacity', count: 8 },
                  { status: 'Available', count: 6 }
                ], 'facility-utilization')}
              >
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div style={{ height: '250px' }}>
              <Doughnut data={facilityUtilizationData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Ambulance Response Times */}
        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Ambulance className="h-5 w-5 text-red-600 mr-2" />
                Response Times
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCSV([
                  { day: 'Monday', responseTime: 8.5, target: 10 },
                  { day: 'Tuesday', responseTime: 7.2, target: 10 },
                  { day: 'Wednesday', responseTime: 9.1, target: 10 },
                  { day: 'Thursday', responseTime: 6.8, target: 10 },
                  { day: 'Friday', responseTime: 8.9, target: 10 },
                  { day: 'Saturday', responseTime: 10.2, target: 10 },
                  { day: 'Sunday', responseTime: 9.5, target: 10 }
                ], 'ambulance-response')}
              >
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div style={{ height: '250px' }}>
              <Bar data={ambulanceResponseData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* AI & ML Insights */}
        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Brain className="h-5 w-5 text-indigo-600 mr-2" />
              AI & ML Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Predictive Analytics */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Predictive Analytics</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-900">Peak Hours Prediction</p>
                        <p className="text-sm text-blue-700">2:00 PM - 6:00 PM today</p>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">High Confidence</Badge>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-lg border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-amber-900">Resource Shortage Alert</p>
                        <p className="text-sm text-amber-700">ICU beds may reach capacity</p>
                      </div>
                      <Badge variant="outline" className="border-amber-500 text-amber-700">Medium Risk</Badge>
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-900">Efficiency Optimization</p>
                        <p className="text-sm text-green-700">Suggested staff reallocation</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Recommended</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* ML Model Performance */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">ML Model Performance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Diagnosis Accuracy</span>
                    <span className="font-medium text-green-600">97.3%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '97.3%'}}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Risk Assessment</span>
                    <span className="font-medium text-blue-600">94.8%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '94.8%'}}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Treatment Recommendation</span>
                    <span className="font-medium text-purple-600">92.1%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: '92.1%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comprehensive Analytics Dashboard */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Performance Metrics */}
        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="h-5 w-5 text-emerald-600 mr-2" />
              System Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-6">
              {/* Real-time Metrics */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Real-time System Health</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-lg font-bold text-green-600">99.8%</span>
                    </div>
                    <p className="text-xs text-green-600">System Uptime</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <span className="text-lg font-bold text-blue-600">1.2s</span>
                    </div>
                    <p className="text-xs text-blue-600">Avg Response</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span className="text-lg font-bold text-purple-600">847</span>
                    </div>
                    <p className="text-xs text-purple-600">Active Users</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Globe className="h-4 w-4 text-amber-600" />
                      <span className="text-lg font-bold text-amber-600">12</span>
                    </div>
                    <p className="text-xs text-amber-600">Connected Sites</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Quality Metrics */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Quality Assurance Metrics</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-600">Patient Satisfaction</span>
                      <span className="text-sm font-bold text-green-600">4.8/5.0</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '96%'}}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-600">Treatment Success Rate</span>
                      <span className="text-sm font-bold text-blue-600">94.7%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '94.7%'}}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-600">Readmission Rate</span>
                      <span className="text-sm font-bold text-amber-600">3.2%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{width: '3.2%'}}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-600">Compliance Score</span>
                      <span className="text-sm font-bold text-purple-600">98.5%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: '98.5%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Analytics & Reporting */}
        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 text-indigo-600 mr-2" />
              Advanced Analytics & Reporting
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-6">
              {/* Downloadable Reports */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Downloadable Reports</h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-3"
                    onClick={() => downloadReport('comprehensive')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Comprehensive Analytics Report</p>
                        <p className="text-xs text-gray-500">Complete system overview with all metrics</p>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto p-3"
                    onClick={() => downloadReport('performance')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Performance Analysis</p>
                        <p className="text-xs text-gray-500">Department and facility performance metrics</p>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto p-3"
                    onClick={() => downloadReport('financial')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded">
                        <PieChart className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Financial Analytics</p>
                        <p className="text-xs text-gray-500">Revenue, costs, and financial performance</p>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto p-3"
                    onClick={() => downloadReport('quality')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-amber-100 rounded">
                        <Award className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Quality Assurance Report</p>
                        <p className="text-xs text-gray-500">Patient satisfaction and quality metrics</p>
                      </div>
                    </div>
                  </Button>
                </div>
              </div>

              <Separator />

              {/* AI-Powered Insights */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">AI-Powered Insights</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Predictive Analysis</p>
                        <p className="text-sm text-blue-700">Emergency department will reach 85% capacity by 3:00 PM today. Consider staff reallocation.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-start space-x-3">
                      <Target className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Optimization Opportunity</p>
                        <p className="text-sm text-green-700">Implementing suggested workflow changes could reduce patient wait times by 15%.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-purple-900">Risk Assessment</p>
                        <p className="text-sm text-purple-700">Low risk detected for patient safety incidents. Current protocols are effective.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Center */}
      <Card className="shadow-sm">
        <CardHeader className="p-4 pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Settings className="h-5 w-5 text-gray-600 mr-2" />
            Analytics Action Center
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => downloadReport('executive-summary')}
            >
              <Download className="h-4 w-4 mr-2" />
              Executive Summary
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadReport('operational-metrics')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Operational Metrics
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadReport('patient-outcomes')}
            >
              <Heart className="h-4 w-4 mr-2" />
              Patient Outcomes
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadReport('resource-utilization')}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Resource Utilization
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadReport('ai-insights')}
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Insights Report
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadReport('compliance')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Compliance Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}