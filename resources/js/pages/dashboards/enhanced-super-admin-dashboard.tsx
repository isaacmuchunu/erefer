import React, { useState, useEffect } from 'react'
import { Head } from '@inertiajs/react'
import SuperAdminLayout from '@/layouts/SuperAdminLayout'
import SystemHealthWidget from '@/components/dashboard/widgets/SystemHealthWidget'
import SecurityMetricsWidget from '@/components/dashboard/widgets/SecurityMetricsWidget'
import { 
  Users, 
  Building2, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Server,
  Shield,
  BarChart3,
  RefreshCw
} from 'lucide-react'

interface DashboardStats {
  system_overview: {
    total_users: number
    active_users: number
    total_facilities: number
    total_ambulances: number
    total_referrals: number
    pending_referrals: number
    system_uptime: string
    database_size: string
  }
  user_analytics: {
    users_by_role: Record<string, number>
    active_sessions: number
    new_users_today: number
    login_activity: Record<string, number>
  }
  security_metrics: {
    failed_logins_today: number
    locked_accounts: number
    security_alerts: number
    audit_logs_today: number
    active_sessions: number
    suspicious_activities: number
    password_expires_soon: number
    two_factor_enabled: number
  }
  performance_data: {
    avg_response_time: number
    database_queries: number
    memory_usage: number
    cpu_usage: number
  }
  recent_activities: Array<{
    id: number
    user: string
    action: string
    description: string
    created_at: string
    severity: string
  }>
}

interface EnhancedSuperAdminDashboardProps {
  stats: DashboardStats
  user: any
  realTimeData: any
}

export default function EnhancedSuperAdminDashboard({ stats, user, realTimeData }: EnhancedSuperAdminDashboardProps) {
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

  const systemHealthData = {
    status: realTimeData.system_status === 'online' ? 'healthy' : 'critical' as 'healthy' | 'warning' | 'critical',
    uptime: stats.system_overview.system_uptime,
    cpu_usage: stats.performance_data.cpu_usage,
    memory_usage: stats.performance_data.memory_usage,
    disk_usage: 65, // This would come from actual system metrics
    database_status: 'connected' as 'connected' | 'slow' | 'error',
    network_status: 'online' as 'online' | 'degraded' | 'offline',
    last_backup: realTimeData.last_backup,
    active_users: stats.user_analytics.active_sessions,
    response_time: stats.performance_data.avg_response_time
  }

  const getStatusIcon = (value: number, threshold: number, reverse = false) => {
    const isGood = reverse ? value < threshold : value > threshold
    return isGood ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <AlertTriangle className="h-5 w-5 text-red-500" />
    )
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'medium':
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
      case 'info':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <SuperAdminLayout user={user}>
      <Head title="Super Admin Dashboard" />
      
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive system overview and management dashboard
            </p>
          </div>
          
          <div className="flex items-center gap-4">
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

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.system_overview.total_users)}</p>
                <p className="text-sm text-green-600 mt-1">
                  {stats.user_analytics.new_users_today} new today
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.system_overview.active_users)}</p>
                <p className="text-sm text-blue-600 mt-1">
                  {stats.user_analytics.active_sessions} sessions
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Facilities</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.system_overview.total_facilities)}</p>
                <p className="text-sm text-gray-600 mt-1">Healthcare facilities</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Referrals</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.system_overview.pending_referrals)}</p>
                <p className="text-sm text-orange-600 mt-1">Require attention</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* System Health and Security Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SystemHealthWidget data={systemHealthData} />
          <SecurityMetricsWidget data={stats.security_metrics} />
        </div>

        {/* User Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">User Distribution</h3>
                  <p className="text-sm text-gray-600">Users by role breakdown</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(stats.user_analytics.users_by_role).map(([role, count]) => {
                const percentage = (count / stats.system_overview.total_users) * 100
                const roleColors: Record<string, string> = {
                  super_admin: 'bg-purple-500',
                  hospital_admin: 'bg-blue-500',
                  doctor: 'bg-green-500',
                  nurse: 'bg-pink-500',
                  dispatcher: 'bg-orange-500',
                  ambulance_driver: 'bg-yellow-500',
                  ambulance_paramedic: 'bg-red-500',
                  patient: 'bg-indigo-500'
                }

                return (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${roleColors[role] || 'bg-gray-500'}`} />
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {role.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${roleColors[role] || 'bg-gray-500'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                <p className="text-sm text-gray-600">Latest system events</p>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {stats.recent_activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(activity.severity)}`}>
                    {activity.severity}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.user}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
              <p className="text-sm text-gray-600">System performance indicators</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {getStatusIcon(stats.performance_data.avg_response_time, 200, true)}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.performance_data.avg_response_time}ms
              </div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Database className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(stats.performance_data.database_queries)}
              </div>
              <div className="text-sm text-gray-600">DB Queries Today</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Server className="h-5 w-5 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.performance_data.memory_usage}%
              </div>
              <div className="text-sm text-gray-600">Memory Usage</div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Activity className="h-5 w-5 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.performance_data.cpu_usage}%
              </div>
              <div className="text-sm text-gray-600">CPU Usage</div>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  )
}