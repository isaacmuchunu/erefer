import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { 
  Users, 
  Building2, 
  Activity, 
  BarChart3, 
  Shield, 
  Settings, 
  UserPlus, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Server, 
  Database, 
  Wifi,
  Globe,
  Lock,
  Eye,
  UserX,
  HardDrive,
  Cpu,
  MonitorSpeaker,
  RefreshCw,
  Download,
  Plus
} from 'lucide-react';
import { 
  MetricCard, 
  DashboardWidget, 
  AlertsManager, 
  QuickActions, 
  RecentActivity, 
  ChartWidget 
} from '@/components/dashboard/shared';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Super Admin', href: '/dashboards/super-admin' },
];

interface SuperAdminDashboardProps {
  auth: {
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      role: string;
    };
  };
}

export default function SuperAdminDashboard({ auth }: SuperAdminDashboardProps) {
  const { user } = auth;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    const mockStats = {
      totalUsers: 15643,
      activeUsers: 8429,
      totalFacilities: 127,
      activeFacilities: 98,
      totalReferrals: 124750,
      monthlyReferrals: 3240,
      systemAlerts: 4,
      criticalAlerts: 1,
      systemUptime: '99.8%',
      responseTime: '125ms',
      errorRate: '0.02%',
      activeSessions: 842,
      dataStorageUsed: '2.4TB',
      backupStatus: 'Healthy',
      securityScore: 95,
      complianceScore: 98,
    };
    
    setStats(mockStats);
    setLoading(false);
  }, []);

  const systemHealthData = [
    { name: 'Jan', value: 99.9 },
    { name: 'Feb', value: 99.8 },
    { name: 'Mar', value: 99.7 },
    { name: 'Apr', value: 99.9 },
    { name: 'May', value: 99.8 },
    { name: 'Jun', value: 99.8 },
  ];

  const userGrowthData = [
    { name: 'Jan', value: 12450 },
    { name: 'Feb', value: 13200 },
    { name: 'Mar', value: 13890 },
    { name: 'Apr', value: 14560 },
    { name: 'May', value: 15120 },
    { name: 'Jun', value: 15643 },
  ];

  const facilityDistributionData = [
    { name: 'Hospitals', value: 45 },
    { name: 'Clinics', value: 52 },
    { name: 'Health Centers', value: 30 },
  ];

  const alerts = [
    {
      id: '1',
      type: 'warning' as const,
      title: 'High CPU Usage',
      message: 'Server CPU usage at 87%. Consider scaling resources.',
      timestamp: '5 min ago',
      source: 'Infrastructure Monitor',
      urgent: false,
    },
    {
      id: '2',
      type: 'info' as const,
      title: 'Scheduled Maintenance',
      message: 'System maintenance scheduled for tonight at 2:00 AM.',
      timestamp: '1 hour ago',
      source: 'Operations Team',
    },
    {
      id: '3',
      type: 'success' as const,
      title: 'Backup Completed',
      message: 'Daily database backup completed successfully.',
      timestamp: '2 hours ago',
      source: 'Backup Service',
    },
  ];

  const quickActions = [
    {
      id: 'add-user',
      label: 'Add User',
      description: 'Create new system user',
      icon: UserPlus,
      href: '/admin/users/create',
      color: 'blue' as const,
    },
    {
      id: 'add-facility',
      label: 'Add Facility',
      description: 'Register new healthcare facility',
      icon: Building2,
      href: '/admin/facilities/create',
      color: 'green' as const,
    },
    {
      id: 'system-settings',
      label: 'System Settings',
      description: 'Configure system parameters',
      icon: Settings,
      href: '/admin/settings',
      color: 'purple' as const,
    },
    {
      id: 'security-audit',
      label: 'Security Audit',
      description: 'Run security compliance check',
      icon: Shield,
      href: '/admin/security/audit',
      color: 'red' as const,
    },
    {
      id: 'reports',
      label: 'Generate Reports',
      description: 'Create system reports',
      icon: BarChart3,
      href: '/admin/reports',
      color: 'orange' as const,
    },
    {
      id: 'backup',
      label: 'Manual Backup',
      description: 'Trigger system backup',
      icon: Download,
      color: 'gray' as const,
      onClick: () => console.log('Backup initiated'),
    },
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'system' as const,
      title: 'New Facility Registered',
      description: 'Nairobi General Hospital completed registration',
      timestamp: '10 min ago',
      user: 'Registration Service',
      status: 'completed' as const,
    },
    {
      id: '2',
      type: 'system' as const,
      title: 'User Account Created',
      description: 'Dr. Sarah Johnson (Cardiologist) account activated',
      timestamp: '25 min ago',
      user: 'Admin Panel',
      status: 'completed' as const,
    },
    {
      id: '3',
      type: 'system' as const,
      title: 'Security Update Applied',
      description: 'Critical security patch deployed successfully',
      timestamp: '1 hour ago',
      user: 'Auto Deployment',
      status: 'completed' as const,
    },
    {
      id: '4',
      type: 'system' as const,
      title: 'Database Optimization',
      description: 'Scheduled database maintenance completed',
      timestamp: '2 hours ago',
      user: 'System Scheduler',
      status: 'completed' as const,
    },
  ];

  if (loading) {
    return (
      <AppLayout user={user} breadcrumbs={breadcrumbs}>
        <Head title="Super Admin Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user} breadcrumbs={breadcrumbs}>
      <Head title="Super Admin Dashboard - eRefer System" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
            <p className="text-gray-600">Complete oversight and management of the eRefer healthcare system</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                <CheckCircle className="h-4 w-4" />
                System Operational
              </span>
              <span className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Users"
            value={stats.totalUsers}
            subtitle={`${stats.activeUsers} active users`}
            icon={Users}
            trend={{
              value: 12,
              period: 'this month',
              isPositive: true,
            }}
            color="blue"
          />
          <MetricCard
            title="Healthcare Facilities"
            value={stats.totalFacilities}
            subtitle={`${stats.activeFacilities} active facilities`}
            icon={Building2}
            trend={{
              value: 3,
              period: 'new this month',
              isPositive: true,
            }}
            color="green"
          />
          <MetricCard
            title="Total Referrals"
            value={stats.totalReferrals}
            subtitle={`${stats.monthlyReferrals} this month`}
            icon={FileText}
            trend={{
              value: 8,
              period: 'vs last month',
              isPositive: true,
            }}
            color="purple"
          />
          <MetricCard
            title="System Alerts"
            value={stats.systemAlerts}
            subtitle={`${stats.criticalAlerts} critical alert`}
            icon={AlertTriangle}
            color={stats.criticalAlerts > 0 ? 'red' : 'green'}
          />
        </div>

        {/* System Health and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartWidget
              title="System Uptime"
              subtitle="Monthly uptime percentage"
              data={systemHealthData}
              type="line"
              height={300}
              showTrend={true}
              trendValue={0.1}
              trendPeriod="vs last month"
            />
          </div>
          
          <DashboardWidget
            title="System Health"
            subtitle="Real-time performance metrics"
            icon={Activity}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Uptime</span>
                </div>
                <span className="text-sm font-bold text-green-600">{stats.systemUptime}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cpu className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Response Time</span>
                </div>
                <span className="text-sm font-bold text-blue-600">{stats.responseTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Error Rate</span>
                </div>
                <span className="text-sm font-bold text-orange-600">{stats.errorRate}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Active Sessions</span>
                </div>
                <span className="text-sm font-bold text-purple-600">{stats.activeSessions}</span>
              </div>
            </div>
          </DashboardWidget>
        </div>

        {/* Analytics and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartWidget
            title="User Growth"
            subtitle="Total registered users over time"
            data={userGrowthData}
            type="bar"
            height={300}
            showTrend={true}
            trendValue={12}
            trendPeriod="this month"
          />
          
          <ChartWidget
            title="Facility Distribution"
            subtitle="Types of healthcare facilities"
            data={facilityDistributionData}
            type="pie"
            height={300}
          />
        </div>

        {/* Management Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <QuickActions
            title="Quick Actions"
            actions={quickActions}
            columns={2}
          />
          
          <RecentActivity
            title="System Activity"
            activities={recentActivities}
            maxItems={6}
            showUser={true}
            showStatus={true}
          />
          
          <AlertsManager
            alerts={alerts}
            maxVisible={5}
            showTimestamp={true}
          />
        </div>

        {/* Additional System Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Data Storage"
            value={stats.dataStorageUsed}
            subtitle="of 5TB capacity used"
            icon={HardDrive}
            color="blue"
          />
          <MetricCard
            title="Backup Status"
            value={stats.backupStatus}
            subtitle="Last backup: 2 hours ago"
            icon={Database}
            color="green"
          />
          <MetricCard
            title="Security Score"
            value={`${stats.securityScore}%`}
            subtitle="Security compliance rating"
            icon={Shield}
            color="purple"
          />
          <MetricCard
            title="Compliance Score"
            value={`${stats.complianceScore}%`}
            subtitle="HIPAA compliance rating"
            icon={CheckCircle}
            color="green"
          />
        </div>
      </div>
    </AppLayout>
  );
}