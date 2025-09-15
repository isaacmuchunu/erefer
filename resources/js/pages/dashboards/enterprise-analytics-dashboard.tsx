import React, { useState, useEffect } from 'react'
import { Head, Link } from '@inertiajs/react'
import SuperAdminLayout from '@/layouts/SuperAdminLayout'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Building2, 
  Activity, 
  DollarSign,
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
  Heart,
  Brain,
  Stethoscope,
  FileText,
  Settings,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
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
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'

interface EnterpriseAnalyticsDashboardProps {
  user: any
  analytics: {
    kpis: {
      total_revenue: number
      total_patients: number
      total_facilities: number
      total_staff: number
      patient_satisfaction: number
      operational_efficiency: number
      cost_per_patient: number
      revenue_growth: number
    }
    performance_metrics: {
      response_times: Array<{ date: string; avg_time: number; target: number }>
      patient_outcomes: Array<{ month: string; success_rate: number; complications: number }>
      facility_utilization: Array<{ facility: string; utilization: number; capacity: number }>
      staff_productivity: Array<{ department: string; productivity: number; target: number }>
    }
    financial_analytics: {
      revenue_by_service: Array<{ service: string; revenue: number; growth: number }>
      cost_breakdown: Array<{ category: string; amount: number; percentage: number }>
      roi_metrics: Array<{ metric: string; value: number; benchmark: number }>
    }
    quality_metrics: {
      patient_safety: Array<{ indicator: string; score: number; benchmark: number }>
      clinical_outcomes: Array<{ specialty: string; outcome_score: number; industry_avg: number }>
      compliance_scores: Array<{ standard: string; score: number; required: number }>
    }
    operational_insights: {
      resource_utilization: Array<{ resource: string; utilization: number; optimal: number }>
      workflow_efficiency: Array<{ process: string; efficiency: number; improvement_potential: number }>
      technology_adoption: Array<{ system: string; adoption_rate: number; target: number }>
    }
    predictive_analytics: {
      demand_forecast: Array<{ month: string; predicted_demand: number; actual_demand?: number }>
      risk_indicators: Array<{ risk_type: string; probability: number; impact: number }>
      capacity_planning: Array<{ resource: string; current_capacity: number; predicted_need: number }>
    }
  }
}

export default function EnterpriseAnalyticsDashboard({ user, analytics }: EnterpriseAnalyticsDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('last_30_days')
  const [selectedMetric, setSelectedMetric] = useState('revenue')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const refreshDashboard = async () => {
    setRefreshing(true)
    // Simulate API call
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
    return new Intl.NumberFormat().format(num)
  }

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`
  }

  const getTrendColor = (value: number, isPositive: boolean = true) => {
    if (value === 0) return 'text-gray-500'
    const positive = value > 0
    if ((positive && isPositive) || (!positive && !isPositive)) {
      return 'text-green-600'
    }
    return 'text-red-600'
  }

  const getTrendIcon = (value: number, isPositive: boolean = true) => {
    if (value === 0) return null
    const positive = value > 0
    if ((positive && isPositive) || (!positive && !isPositive)) {
      return <ArrowUpRight className="h-4 w-4" />
    }
    return <ArrowDownRight className="h-4 w-4" />
  }

  // Chart colors
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

  // Mock data for demonstration
  const mockAnalytics = {
    kpis: {
      total_revenue: 125000000,
      total_patients: 45678,
      total_facilities: 156,
      total_staff: 2341,
      patient_satisfaction: 94.2,
      operational_efficiency: 87.5,
      cost_per_patient: 2750,
      revenue_growth: 12.5
    },
    performance_metrics: {
      response_times: [
        { date: '2024-01', avg_time: 8.5, target: 10 },
        { date: '2024-02', avg_time: 9.2, target: 10 },
        { date: '2024-03', avg_time: 7.8, target: 10 },
        { date: '2024-04', avg_time: 8.1, target: 10 },
        { date: '2024-05', avg_time: 7.5, target: 10 },
        { date: '2024-06', avg_time: 8.3, target: 10 }
      ],
      patient_outcomes: [
        { month: 'Jan', success_rate: 94.2, complications: 5.8 },
        { month: 'Feb', success_rate: 95.1, complications: 4.9 },
        { month: 'Mar', success_rate: 93.8, complications: 6.2 },
        { month: 'Apr', success_rate: 96.2, complications: 3.8 },
        { month: 'May', success_rate: 95.7, complications: 4.3 },
        { month: 'Jun', success_rate: 97.1, complications: 2.9 }
      ],
      facility_utilization: [
        { facility: 'KNH', utilization: 89, capacity: 100 },
        { facility: 'Aga Khan', utilization: 76, capacity: 100 },
        { facility: 'Nairobi Hospital', utilization: 82, capacity: 100 },
        { facility: 'MP Shah', utilization: 71, capacity: 100 },
        { facility: 'Gertrudes', utilization: 85, capacity: 100 }
      ],
      staff_productivity: [
        { department: 'Emergency', productivity: 92, target: 85 },
        { department: 'Cardiology', productivity: 88, target: 85 },
        { department: 'Neurology', productivity: 91, target: 85 },
        { department: 'Pediatrics', productivity: 86, target: 85 },
        { department: 'Surgery', productivity: 94, target: 85 }
      ]
    },
    financial_analytics: {
      revenue_by_service: [
        { service: 'Emergency Services', revenue: 45000000, growth: 15.2 },
        { service: 'Specialist Consultations', revenue: 32000000, growth: 8.7 },
        { service: 'Surgical Procedures', revenue: 28000000, growth: 12.1 },
        { service: 'Diagnostic Services', revenue: 15000000, growth: 22.5 },
        { service: 'Patient Transport', revenue: 5000000, growth: -3.2 }
      ],
      cost_breakdown: [
        { category: 'Personnel', amount: 65000000, percentage: 52 },
        { category: 'Medical Supplies', amount: 25000000, percentage: 20 },
        { category: 'Equipment', amount: 18000000, percentage: 14.4 },
        { category: 'Facilities', amount: 12000000, percentage: 9.6 },
        { category: 'Technology', amount: 5000000, percentage: 4 }
      ],
      roi_metrics: [
        { metric: 'Technology ROI', value: 245, benchmark: 200 },
        { metric: 'Staff Training ROI', value: 180, benchmark: 150 },
        { metric: 'Equipment ROI', value: 165, benchmark: 175 },
        { metric: 'Process Improvement ROI', value: 220, benchmark: 185 }
      ]
    },
    quality_metrics: {
      patient_safety: [
        { indicator: 'Medication Errors', score: 0.2, benchmark: 0.5 },
        { indicator: 'Hospital Infections', score: 1.8, benchmark: 2.5 },
        { indicator: 'Patient Falls', score: 0.8, benchmark: 1.2 },
        { indicator: 'Readmission Rate', score: 4.5, benchmark: 6.0 }
      ],
      clinical_outcomes: [
        { specialty: 'Cardiology', outcome_score: 96.2, industry_avg: 94.1 },
        { specialty: 'Emergency Medicine', outcome_score: 94.8, industry_avg: 92.5 },
        { specialty: 'Surgery', outcome_score: 97.5, industry_avg: 95.2 },
        { specialty: 'Pediatrics', outcome_score: 98.1, industry_avg: 96.8 },
        { specialty: 'Neurology', outcome_score: 95.3, industry_avg: 93.7 }
      ],
      compliance_scores: [
        { standard: 'HIPAA Compliance', score: 98, required: 95 },
        { standard: 'Joint Commission', score: 96, required: 90 },
        { standard: 'ISO 27001', score: 94, required: 85 },
        { standard: 'MOH Standards', score: 97, required: 90 }
      ]
    },
    operational_insights: {
      resource_utilization: [
        { resource: 'Ambulances', utilization: 78, optimal: 75 },
        { resource: 'Hospital Beds', utilization: 85, optimal: 80 },
        { resource: 'Operating Rooms', utilization: 72, optimal: 70 },
        { resource: 'Diagnostic Equipment', utilization: 68, optimal: 65 },
        { resource: 'Staff', utilization: 82, optimal: 75 }
      ],
      workflow_efficiency: [
        { process: 'Patient Admission', efficiency: 88, improvement_potential: 12 },
        { process: 'Emergency Response', efficiency: 92, improvement_potential: 8 },
        { process: 'Discharge Process', efficiency: 75, improvement_potential: 25 },
        { process: 'Referral Management', efficiency: 85, improvement_potential: 15 }
      ],
      technology_adoption: [
        { system: 'Electronic Health Records', adoption_rate: 95, target: 100 },
        { system: 'Mobile Applications', adoption_rate: 78, target: 85 },
        { system: 'Telemedicine Platform', adoption_rate: 62, target: 75 },
        { system: 'AI Diagnostics', adoption_rate: 45, target: 60 }
      ]
    },
    predictive_analytics: {
      demand_forecast: [
        { month: 'Jul 2024', predicted_demand: 4200, actual_demand: 4150 },
        { month: 'Aug 2024', predicted_demand: 4350, actual_demand: 4280 },
        { month: 'Sep 2024', predicted_demand: 4180, actual_demand: 4220 },
        { month: 'Oct 2024', predicted_demand: 4420 },
        { month: 'Nov 2024', predicted_demand: 4580 },
        { month: 'Dec 2024', predicted_demand: 4750 }
      ],
      risk_indicators: [
        { risk_type: 'Staff Shortage', probability: 25, impact: 85 },
        { risk_type: 'Equipment Failure', probability: 15, impact: 70 },
        { risk_type: 'Capacity Overload', probability: 35, impact: 90 },
        { risk_type: 'Budget Overrun', probability: 20, impact: 60 }
      ],
      capacity_planning: [
        { resource: 'ICU Beds', current_capacity: 120, predicted_need: 145 },
        { resource: 'Emergency Bays', current_capacity: 45, predicted_need: 52 },
        { resource: 'Ambulances', current_capacity: 24, predicted_need: 28 },
        { resource: 'Specialists', current_capacity: 85, predicted_need: 98 }
      ]
    }
  }

  const data = analytics || mockAnalytics

  return (
    <SuperAdminLayout user={user}>
      <Head title="Enterprise Analytics Dashboard" />
      
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enterprise Analytics</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive business intelligence and performance insights
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_90_days">Last 90 Days</option>
              <option value="last_year">Last Year</option>
            </select>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="h-4 w-4" />
              Export Report
            </button>
            
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <button
              onClick={refreshDashboard}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Executive KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold">{formatCurrency(data.kpis.total_revenue)}</p>
                <div className="flex items-center gap-1 mt-2">
                  {getTrendIcon(data.kpis.revenue_growth)}
                  <span className="text-blue-100 text-sm">
                    {formatPercentage(data.kpis.revenue_growth)} growth
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Patients</p>
                <p className="text-3xl font-bold">{formatNumber(data.kpis.total_patients)}</p>
                <p className="text-green-100 text-sm mt-2">Active patients</p>
              </div>
              <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Patient Satisfaction</p>
                <p className="text-3xl font-bold">{formatPercentage(data.kpis.patient_satisfaction)}</p>
                <p className="text-purple-100 text-sm mt-2">Average rating</p>
              </div>
              <div className="w-12 h-12 bg-purple-400 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Operational Efficiency</p>
                <p className="text-3xl font-bold">{formatPercentage(data.kpis.operational_efficiency)}</p>
                <p className="text-orange-100 text-sm mt-2">System-wide efficiency</p>
              </div>
              <div className="w-12 h-12 bg-orange-400 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Response Time Performance</h3>
                <p className="text-sm text-gray-600">Average emergency response times vs targets</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Actual</span>
                <div className="w-3 h-3 bg-red-500 rounded-full ml-2"></div>
                <span className="text-sm text-gray-600">Target</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={data.performance_metrics.response_times}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="avg_time" stroke="#3B82F6" strokeWidth={3} />
                <Line type="monotone" dataKey="target" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Patient Outcomes Trend</h3>
                <p className="text-sm text-gray-600">Success rates and complication trends</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.performance_metrics.patient_outcomes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="success_rate" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="complications" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue by Service Line</h3>
                <p className="text-sm text-gray-600">Revenue breakdown and growth rates</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.financial_analytics.revenue_by_service}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="service" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cost Breakdown</h3>
                <p className="text-sm text-gray-600">Operational cost distribution</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={data.financial_analytics.cost_breakdown}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ percentage }) => `${percentage}%`}
                >
                  {data.financial_analytics.cost_breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quality and Compliance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Clinical Quality Scores</h3>
                <p className="text-sm text-gray-600">Performance vs industry benchmarks</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={data.quality_metrics.clinical_outcomes}>
                <PolarGrid />
                <PolarAngleAxis dataKey="specialty" />
                <PolarRadiusAxis angle={90} domain={[85, 100]} />
                <Radar name="Our Performance" dataKey="outcome_score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                <Radar name="Industry Average" dataKey="industry_avg" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Compliance Scores</h3>
                <p className="text-sm text-gray-600">Regulatory compliance status</p>
              </div>
            </div>
            <div className="space-y-4">
              {data.quality_metrics.compliance_scores.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{item.standard}</span>
                      <span className="text-sm text-gray-600">{item.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.score >= item.required ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">Required: {item.required}%</span>
                      <span className={`text-xs font-medium ${item.score >= item.required ? 'text-green-600' : 'text-red-600'}`}>
                        {item.score >= item.required ? 'Compliant' : 'Needs Attention'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Predictive Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Demand Forecasting</h3>
                <p className="text-sm text-gray-600">Predicted vs actual patient demand</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={data.predictive_analytics.demand_forecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="predicted_demand" stroke="#8B5CF6" strokeWidth={3} />
                <Line type="monotone" dataKey="actual_demand" stroke="#10B981" strokeWidth={2} />
                <Legend />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Risk Assessment Matrix</h3>
                <p className="text-sm text-gray-600">Probability vs impact analysis</p>
              </div>
            </div>
            <div className="space-y-4">
              {data.predictive_analytics.risk_indicators.map((risk, index) => (
                <div key={index} className="p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{risk.risk_type}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        risk.probability * risk.impact > 2000 ? 'bg-red-100 text-red-800' :
                        risk.probability * risk.impact > 1000 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {risk.probability * risk.impact > 2000 ? 'High Risk' :
                         risk.probability * risk.impact > 1000 ? 'Medium Risk' : 'Low Risk'}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Probability: </span>
                      <span className="font-medium">{risk.probability}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Impact: </span>
                      <span className="font-medium">{risk.impact}/100</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Operational Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Resource Utilization Analysis</h3>
              <p className="text-sm text-gray-600">Current utilization vs optimal levels</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {data.operational_insights.resource_utilization.map((resource, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="mb-3">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                    resource.utilization > resource.optimal ? 'bg-red-100' : 
                    resource.utilization > resource.optimal * 0.9 ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    {resource.resource === 'Ambulances' && <Truck className="h-8 w-8 text-blue-600" />}
                    {resource.resource === 'Hospital Beds' && <Building2 className="h-8 w-8 text-green-600" />}
                    {resource.resource === 'Operating Rooms' && <Heart className="h-8 w-8 text-red-600" />}
                    {resource.resource === 'Diagnostic Equipment' && <Activity className="h-8 w-8 text-purple-600" />}
                    {resource.resource === 'Staff' && <Users className="h-8 w-8 text-orange-600" />}
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {resource.utilization}%
                </div>
                <div className="text-sm text-gray-600 mb-2">{resource.resource}</div>
                <div className="text-xs text-gray-500">
                  Optimal: {resource.optimal}%
                </div>
                <div className={`text-xs font-medium mt-1 ${
                  resource.utilization > resource.optimal ? 'text-red-600' : 
                  resource.utilization > resource.optimal * 0.9 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {resource.utilization > resource.optimal ? 'Over-utilized' : 
                   resource.utilization > resource.optimal * 0.9 ? 'Near Capacity' : 'Optimal'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  )
}