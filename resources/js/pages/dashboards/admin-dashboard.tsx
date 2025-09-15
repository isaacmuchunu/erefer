import React from 'react'
import { Head, Link } from '@inertiajs/react'
import { Users, Building2, Activity, BarChart3, Shield, Settings, UserPlus, FileText, AlertTriangle, CheckCircle, TrendingUp, Server, Database, Wifi } from 'lucide-react'
import DashboardLayout from '@/layouts/dashboard-layout'
import { ProHealthCard, ProHealthStatCard, ProHealthButton } from '@/components/prohealth'

interface AdminDashboardProps {
  user: {
    id: number
    first_name: string
    last_name: string
    email: string
    role: string
  }
  stats: {
    total_users: number
    active_users: number
    total_facilities: number
    total_referrals: number
    pending_referrals: number
    system_alerts: number
    monthly_growth: number
    system_uptime: string
  }
  recent_activities: Array<{
    id: number
    type: string
    description: string
    user: string
    timestamp: string
    severity: 'info' | 'warning' | 'error' | 'success'
  }>
  system_health: {
    uptime: string
    response_time: string
    error_rate: string
    active_sessions: number
    database_status: 'healthy' | 'warning' | 'error'
    server_load: number
  }
  quick_stats: {
    users_today: number
    referrals_today: number
    facilities_online: number
    alerts_pending: number
  }
}

export default function AdminDashboard({ user, stats, recent_activities, system_health, quick_stats }: AdminDashboardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-100'
      case 'warning': return 'text-orange-600 bg-orange-100'
      case 'success': return 'text-green-600 bg-green-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  return (
    <DashboardLayout user={user}>
      <Head title="System Administration — eRefer Kenya" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="cs_fs_32 cs_primary_font cs_bold cs_heading_color">System Administration</h1>
              <p className="cs_body_color cs_secondary_font">Complete oversight and management of the eRefer healthcare system</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="inline-flex items-center gap-2 px-3 py-1 cs_radius_15 bg-green-100 text-green-800 text-sm cs_semibold">
                  <CheckCircle className="h-4 w-4" />
                  System Operational
                </span>
                <span className="text-sm cs_body_color">Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ProHealthButton variant="outline" icon={BarChart3} href="/admin/reports">
                View Reports
              </ProHealthButton>
              <ProHealthButton variant="outline" icon={Settings} href="/admin/settings">
                System Settings
              </ProHealthButton>
              <ProHealthButton variant="primary" icon={UserPlus} href="/admin/users/create">
                Add User
              </ProHealthButton>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ProHealthStatCard
              value={stats.total_users.toLocaleString()}
              label="Total Users"
              icon={Users}
              trend="+12% this month"
            />
            <ProHealthStatCard
              value={stats.total_facilities.toLocaleString()}
              label="Healthcare Facilities"
              icon={Building2}
              trend="+3 new facilities"
            />
            <ProHealthStatCard
              value={stats.total_referrals.toLocaleString()}
              label="Total Referrals"
              icon={FileText}
              trend="+8.3% vs last month"
            />
            <ProHealthStatCard
              value={stats.system_alerts.toString()}
              label="System Alerts"
              icon={AlertTriangle}
              trend={stats.system_alerts > 0 ? "Requires attention" : "All clear"}
            />
          </div>

          {/* System Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <ProHealthCard title="System Health Overview">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="cs_fs_24 cs_bold text-green-600 cs_primary_font">{system_health.uptime}</div>
                    <div className="text-sm cs_body_color cs_secondary_font mt-1">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="cs_fs_24 cs_bold cs_accent_color cs_primary_font">{system_health.response_time}</div>
                    <div className="text-sm cs_body_color cs_secondary_font mt-1">Response Time</div>
                  </div>
                  <div className="text-center">
                    <div className="cs_fs_24 cs_bold text-orange-600 cs_primary_font">{system_health.error_rate}</div>
                    <div className="text-sm cs_body_color cs_secondary_font mt-1">Error Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="cs_fs_24 cs_bold cs_accent_color cs_primary_font">{system_health.active_sessions}</div>
                    <div className="text-sm cs_body_color cs_secondary_font mt-1">Active Sessions</div>
                  </div>
                </div>
              </ProHealthCard>
            </div>

            <ProHealthCard title="Quick Actions">
              <div className="space-y-4">
                <ProHealthButton variant="outline" className="w-full justify-start" icon={Users}>
                  Manage Users
                </ProHealthButton>
                <ProHealthButton variant="outline" className="w-full justify-start" icon={Building2}>
                  Manage Facilities
                </ProHealthButton>
                <ProHealthButton variant="outline" className="w-full justify-start" icon={BarChart3}>
                  View Reports
                </ProHealthButton>
                <ProHealthButton variant="outline" className="w-full justify-start" icon={Shield}>
                  Security Settings
                </ProHealthButton>
              </div>
            </ProHealthCard>
          </div>

          {/* Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ProHealthCard title="Recent System Activities">
              <div className="space-y-4">
                {recent_activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-[#307BC4]/5 cs_radius_10 transition-colors">
                    <div className="w-8 h-8 cs_radius_10 bg-[#307BC4]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Activity className="h-4 w-4 cs_accent_color" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm cs_heading_color cs_secondary_font">{activity.description}</p>
                      <p className="text-xs cs_body_color cs_secondary_font mt-1">
                        by {activity.user} • {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ProHealthCard>

            <ProHealthCard title="User Activity Summary">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm cs_body_color cs_secondary_font">Active Users (24h)</span>
                  <span className="cs_fs_18 cs_semibold cs_accent_color cs_primary_font">{stats.active_users}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm cs_body_color cs_secondary_font">Pending Referrals</span>
                  <span className="cs_fs_18 cs_semibold text-orange-600 cs_primary_font">{stats.pending_referrals}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm cs_body_color cs_secondary_font">System Status</span>
                  <span className="inline-flex items-center gap-2 text-sm cs_semibold text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Operational
                  </span>
                </div>
              </div>
            </ProHealthCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
