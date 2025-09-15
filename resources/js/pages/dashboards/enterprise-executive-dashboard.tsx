import React, { useState, useEffect } from 'react'
import { Head, Link } from '@inertiajs/react'
import SuperAdminLayout from '@/layouts/SuperAdminLayout'
import NotificationCenter from '@/components/enterprise/NotificationCenter'
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Building2, 
  Activity, 
  DollarSign,
  Heart,
  Clock,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  Globe,
  Shield,
  Database,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Eye,
  PieChart,
  LineChart,
  MapPin,
  Truck,
  Brain,
  Stethoscope,
  FileText,
  Settings,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  BarChart3,
  Phone,
  Navigation,
  Radio,
  Fuel,
  Timer,
  UserCheck,
  Building,
  Bed,
  Siren,
  Thermometer
} from 'lucide-react'
import { 
  LineChart as RechartsLineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend
} from 'recharts'

interface ExecutiveDashboardProps {
  user: any
  dashboard_data: {
    executive_kpis: {
      total_revenue: number
      revenue_growth: number
      total_patients: number
      patient_growth: number
      total_facilities: number
      facility_growth: number
      patient_satisfaction: number
      satisfaction_trend: number
      operational_efficiency: number
      efficiency_trend: number
      cost_savings: number
      savings_trend: number
    }
    real_time_metrics: {
      active_emergencies: number
      ambulances_deployed: number
      bed_occupancy: number
      average_response_time: number
      critical_alerts: number
      system_uptime: number
    }
    performance_trends: {
      monthly_revenue: Array<{ month: string; revenue: number; target: number }>
      patient_volumes: Array<{ date: string; patients: number; emergency: number; routine: number }>
      response_times: Array<{ hour: string; avg_time: number; target: number }>
      satisfaction_scores: Array<{ month: string; score: number; benchmark: number }>
    }
    facility_overview: {
      top_facilities: Array<{
        id: string
        name: string
        patients_today: number
        bed_occupancy: number
        revenue_today: number
        satisfaction: number
        status: 'optimal' | 'busy' | 'critical'
      }>
      geographic_distribution: Array<{
        region: string
        facilities: number
        patients: number
        revenue: number
      }>
    }
    quality_indicators: {
      clinical_outcomes: Array<{ metric: string; score: number; benchmark: number; trend: number }>
      safety_metrics: Array<{ metric: string; incidents: number; target: number; trend: number }>
      compliance_status: Array<{ standard: string; score: number; required: number }>
    }
    operational_insights: {
      resource_utilization: Array<{ resource: string; current: number; optimal: number }>
      cost_centers: Array<{ center: string; budget: number; actual: number; variance: number }>
      efficiency_metrics: Array<{ process: string; efficiency: number; improvement: number }>
    }
  }
}

export default function EnterpriseExecutiveDashboard({ user, dashboard_data }: ExecutiveDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('last_30_days')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [selectedView, setSelectedView] = useState<'overview' | 'performance' | 'quality' | 'financial'>('overview')

  // Mock data for demonstration - inspired by the provided dashboard designs
  const mockDashboardData = {
    executive_kpis: {
      total_revenue: 550000000, // 550M KES
      revenue_growth: 15.2,
      total_patients: 125000,
      patient_growth: 8.7,
      total_facilities: 89,
      facility_growth: 12.1,
      patient_satisfaction: 94.2,
      satisfaction_trend: 2.1,
      operational_efficiency: 87.5,
      efficiency_trend: 5.3,
      cost_savings: 45000000, // 45M KES
      savings_trend: 18.9
    },
    real_time_metrics: {
      active_emergencies: 12,
      ambulances_deployed: 28,
      bed_occupancy: 78.5,
      average_response_time: 8.2,
      critical_alerts: 3,
      system_uptime: 99.7
    },
    performance_trends: {
      monthly_revenue: [
        { month: 'Jan', revenue: 42000000, target: 40000000 },
        { month: 'Feb', revenue: 45000000, target: 42000000 },
        { month: 'Mar', revenue: 48000000, target: 45000000 },
        { month: 'Apr', revenue: 52000000, target: 48000000 },
        { month: 'May', revenue: 55000000, target: 50000000 },
        { month: 'Jun', revenue: 58000000, target: 52000000 }
      ],
      patient_volumes: [
        { date: '2024-01-01', patients: 1250, emergency: 180, routine: 1070 },
        { date: '2024-01-02', patients: 1320, emergency: 210, routine: 1110 },
        { date: '2024-01-03', patients: 1180, emergency: 165, routine: 1015 },
        { date: '2024-01-04', patients: 1400, emergency: 245, routine: 1155 },
        { date: '2024-01-05', patients: 1350, emergency: 198, routine: 1152 },
        { date: '2024-01-06', patients: 1280, emergency: 175, routine: 1105 }
      ],
      response_times: [
        { hour: '00:00', avg_time: 7.2, target: 10 },
        { hour: '04:00', avg_time: 6.8, target: 10 },
        { hour: '08:00', avg_time: 9.5, target: 10 },
        { hour: '12:00', avg_time: 11.2, target: 10 },
        { hour: '16:00', avg_time: 10.8, target: 10 },
        { hour: '20:00', avg_time: 8.9, target: 10 }
      ],
      satisfaction_scores: [
        { month: 'Jan', score: 92.1, benchmark: 90 },
        { month: 'Feb', score: 93.5, benchmark: 90 },
        { month: 'Mar', score: 91.8, benchmark: 90 },
        { month: 'Apr', score: 94.2, benchmark: 90 },
        { month: 'May', score: 95.1, benchmark: 90 },
        { month: 'Jun', score: 94.8, benchmark: 90 }
      ]
    },
    facility_overview: {
      top_facilities: [
        {
          id: 'knh',
          name: 'Kenyatta National Hospital',
          patients_today: 450,
          bed_occupancy: 89,
          revenue_today: 2500000,
          satisfaction: 96.2,
          status: 'busy' as const
        },
        {
          id: 'aga_khan',
          name: 'Aga Khan University Hospital',
          patients_today: 320,
          bed_occupancy: 76,
          revenue_today: 3200000,
          satisfaction: 97.8,
          status: 'optimal' as const
        },
        {
          id: 'nairobi_hospital',
          name: 'The Nairobi Hospital',
          patients_today: 280,
          bed_occupancy: 82,
          revenue_today: 2800000,
          satisfaction: 95.4,
          status: 'optimal' as const
        },
        {
          id: 'mp_shah',
          name: 'MP Shah Hospital',
          patients_today: 195,
          bed_occupancy: 71,
          revenue_today: 1850000,
          satisfaction: 94.1,
          status: 'optimal' as const
        },
        {
          id: 'gertrudes',
          name: "Gertrude's Children's Hospital",
          patients_today: 180,
          bed_occupancy: 85,
          revenue_today: 1200000,
          satisfaction: 98.5,
          status: 'busy' as const
        }
      ],
      geographic_distribution: [
        { region: 'Nairobi', facilities: 35, patients: 15420, revenue: 180000000 },
        { region: 'Mombasa', facilities: 18, patients: 8750, revenue: 95000000 },
        { region: 'Kisumu', facilities: 12, patients: 5680, revenue: 62000000 },
        { region: 'Nakuru', facilities: 15, patients: 6890, revenue: 75000000 },
        { region: 'Eldoret', facilities: 9, patients: 4250, revenue: 48000000 }
      ]
    },
    quality_indicators: {
      clinical_outcomes: [
        { metric: 'Patient Safety Score', score: 96.8, benchmark: 95, trend: 1.2 },
        { metric: 'Clinical Excellence', score: 94.2, benchmark: 92, trend: 0.8 },
        { metric: 'Treatment Effectiveness', score: 97.1, benchmark: 94, trend: 2.1 },
        { metric: 'Recovery Rate', score: 95.6, benchmark: 93, trend: 1.5 }
      ],
      safety_metrics: [
        { metric: 'Medication Errors', incidents: 3, target: 5, trend: -2 },
        { metric: 'Hospital Infections', incidents: 8, target: 12, trend: -4 },
        { metric: 'Patient Falls', incidents: 2, target: 6, trend: -1 },
        { metric: 'Adverse Events', incidents: 5, target: 10, trend: -3 }
      ],
      compliance_status: [
        { standard: 'HIPAA Compliance', score: 98, required: 95 },
        { standard: 'Joint Commission', score: 96, required: 90 },
        { standard: 'ISO 27001', score: 94, required: 85 },
        { standard: 'MOH Standards', score: 97, required: 90 }
      ]
    },
    operational_insights: {
      resource_utilization: [
        { resource: 'Medical Staff', current: 85, optimal: 80 },
        { resource: 'Equipment', current: 78, optimal: 75 },
        { resource: 'Facilities', current: 82, optimal: 80 },
        { resource: 'Ambulances', current: 74, optimal: 70 },
        { resource: 'Technology', current: 91, optimal: 85 }
      ],
      cost_centers: [
        { center: 'Emergency Services', budget: 120000000, actual: 115000000, variance: -4.2 },
        { center: 'Inpatient Care', budget: 200000000, actual: 205000000, variance: 2.5 },
        { center: 'Outpatient Services', budget: 80000000, actual: 78000000, variance: -2.5 },
        { center: 'Diagnostics', budget: 60000000, actual: 62000000, variance: 3.3 },
        { center: 'Administration', budget: 40000000, actual: 38000000, variance: -5.0 }
      ],
      efficiency_metrics: [
        { process: 'Patient Registration', efficiency: 92, improvement: 8 },
        { process: 'Emergency Response', efficiency: 88, improvement: 12 },
        { process: 'Discharge Process', efficiency: 76, improvement: 24 },
        { process: 'Billing & Payment', efficiency: 85, improvement: 15 }
      ]
    }
  }

  const data = dashboard_data || mockDashboardData

  const refreshDashboard = async () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      setLastUpdated(new Date())
    }, 2000)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return new Intl.NumberFormat().format(num)
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return null
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600'
    if (trend < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-100 text-green-800'
      case 'busy': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Chart colors matching the design examples
  const colors = ['#14B8A6', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  return (
    <SuperAdminLayout user={user}>
      <Head title="Executive Dashboard - eRefer Healthcare" />
      
      <div className="space-y-6">
        {/* Dashboard Header - Inspired by the clean header design */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Real-time healthcare system performance and business intelligence
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['overview', 'performance', 'quality', 'financial'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setSelectedView(view)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                    selectedView === view
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
            
            <NotificationCenter
              notifications={[]}
              currentUser={user}
              onNotificationAction={() => {}}
              onMarkAsRead={() => {}}
              onMarkAllAsRead={() => {}}
              onAcknowledge={() => {}}
              onStar={() => {}}
              onArchive={() => {}}
              onDelete={() => {}}
            />
            
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_90_days">Last 90 Days</option>
              <option value="last_year">Last Year</option>
            </select>
            
            <button
              onClick={refreshDashboard}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Executive KPIs - Inspired by the vitals cards design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-teal-400 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(data.executive_kpis.revenue_growth)}
                <span className="text-teal-100 text-sm font-medium">
                  {data.executive_kpis.revenue_growth > 0 ? '+' : ''}{data.executive_kpis.revenue_growth}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-teal-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold">{formatCurrency(data.executive_kpis.total_revenue)}</p>
              <p className="text-teal-200 text-sm mt-1">YTD Performance</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-400 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(data.executive_kpis.patient_growth)}
                <span className="text-blue-100 text-sm font-medium">
                  {data.executive_kpis.patient_growth > 0 ? '+' : ''}{data.executive_kpis.patient_growth}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Patients</p>
              <p className="text-3xl font-bold">{formatNumber(data.executive_kpis.total_patients)}</p>
              <p className="text-blue-200 text-sm mt-1">Active Patients</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-400 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(data.executive_kpis.satisfaction_trend)}
                <span className="text-purple-100 text-sm font-medium">
                  {data.executive_kpis.satisfaction_trend > 0 ? '+' : ''}{data.executive_kpis.satisfaction_trend}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-purple-100 text-sm font-medium">Patient Satisfaction</p>
              <p className="text-3xl font-bold">{data.executive_kpis.patient_satisfaction}%</p>
              <p className="text-purple-200 text-sm mt-1">Average Rating</p>
            </div>
          </div>
        </div>

        {/* Real-time Operational Metrics - Similar to vitals monitoring */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Real-time Operations</h3>
              <p className="text-sm text-gray-600">Live system status and critical metrics</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <div className="flex items-center gap-3 mb-2">
                <Siren className="h-6 w-6 text-red-600" />
                <span className="text-sm font-medium text-red-900">Active Emergencies</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{data.real_time_metrics.active_emergencies}</div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Truck className="h-6 w-6 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Ambulances</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{data.real_time_metrics.ambulances_deployed}</div>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <Bed className="h-6 w-6 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Bed Occupancy</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{data.real_time_metrics.bed_occupancy}%</div>
            </div>

            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <Timer className="h-6 w-6 text-green-600" />
                <span className="text-sm font-medium text-green-900">Response Time</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{data.real_time_metrics.average_response_time}m</div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Critical Alerts</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{data.real_time_metrics.critical_alerts}</div>
            </div>

            <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="h-6 w-6 text-teal-600" />
                <span className="text-sm font-medium text-teal-900">System Uptime</span>
              </div>
              <div className="text-2xl font-bold text-teal-600">{data.real_time_metrics.system_uptime}%</div>
            </div>
          </div>
        </div>

        {/* Performance Charts - Based on the analytics sections */}
        {selectedView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Performance</h3>
                  <p className="text-sm text-gray-600">Monthly revenue vs targets</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.performance_trends.monthly_revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="revenue" stroke="#14B8A6" fill="#14B8A6" fillOpacity={0.1} strokeWidth={3} />
                  <Area type="monotone" dataKey="target" stroke="#6B7280" fill="transparent" strokeDasharray="5 5" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Patient Volume Trends</h3>
                  <p className="text-sm text-gray-600">Daily patient admissions</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.performance_trends.patient_volumes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="emergency" stackId="a" fill="#EF4444" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="routine" stackId="a" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top Facilities - Inspired by the patient list design */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Top Performing Facilities</h3>
              <p className="text-sm text-gray-600">Today's performance metrics</p>
            </div>
            <Link
              href="/admin/facilities"
              className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center gap-1"
            >
              View All Facilities
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Facility</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Patients Today</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Bed Occupancy</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Satisfaction</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.facility_overview.top_facilities.map((facility) => (
                  <tr key={facility.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-teal-600" />
                        </div>
                        <span className="font-medium text-gray-900">{facility.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-900 font-medium">{facility.patients_today}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${facility.bed_occupancy > 85 ? 'bg-red-500' : facility.bed_occupancy > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${facility.bed_occupancy}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{facility.bed_occupancy}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-900 font-medium">{formatCurrency(facility.revenue_today)}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-pink-500" />
                        <span className="text-gray-900 font-medium">{facility.satisfaction}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(facility.status)}`}>
                        {facility.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quality & Compliance Metrics */}
        {selectedView === 'quality' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Clinical Quality Scores</h3>
                  <p className="text-sm text-gray-600">Performance vs industry benchmarks</p>
                </div>
              </div>
              <div className="space-y-4">
                {data.quality_indicators.clinical_outcomes.map((outcome, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{outcome.metric}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">{outcome.score}%</span>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(outcome.trend)}
                            <span className={`text-sm font-medium ${getTrendColor(outcome.trend)}`}>
                              {outcome.trend > 0 ? '+' : ''}{outcome.trend}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 bg-teal-500 rounded-full"
                          style={{ width: `${(outcome.score / 100) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Benchmark: {outcome.benchmark}%</span>
                        <span>{outcome.score >= outcome.benchmark ? 'Above Benchmark' : 'Below Benchmark'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Safety Incidents</h3>
                  <p className="text-sm text-gray-600">Monthly safety metrics</p>
                </div>
              </div>
              <div className="space-y-4">
                {data.quality_indicators.safety_metrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        metric.incidents <= metric.target ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {metric.incidents <= metric.target ? 
                          <CheckCircle className="h-5 w-5 text-green-600" /> : 
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        }
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{metric.metric}</span>
                        <p className="text-sm text-gray-600">Target: ≤{metric.target} incidents</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{metric.incidents}</div>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(metric.trend)}
                        <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                          {metric.trend > 0 ? '+' : ''}{metric.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  )
}