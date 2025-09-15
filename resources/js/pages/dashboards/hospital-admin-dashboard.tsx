import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { 
  Building2, 
  Users, 
  Bed, 
  Activity, 
  Calendar, 
  FileText, 
  UserPlus, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Stethoscope,
  Truck,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Plus,
  Eye,
  Edit,
  BarChart3,
  Heart,
  Zap,
  Package
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
  { title: 'Hospital Admin', href: '/dashboards/hospital-admin' },
];

interface HospitalAdminDashboardProps {
  auth: {
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      role: string;
      facility_id?: number;
      facility_name?: string;
    };
  };
}

export default function HospitalAdminDashboard({ auth }: HospitalAdminDashboardProps) {
  const { user } = auth;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    const mockStats = {
      facilityName: user.facility_name || 'Nairobi General Hospital',
      totalBeds: 250,
      occupiedBeds: 189,
      availableBeds: 61,
      bedUtilization: 75.6,
      totalStaff: 342,
      activeStaff: 298,
      onLeaveStaff: 44,
      totalDoctors: 45,
      activeDoctors: 38,
      totalNurses: 156,
      activeNurses: 142,
      incomingReferrals: 23,
      outgoingReferrals: 18,
      pendingReferrals: 12,
      completedReferrals: 187,
      emergencyAlerts: 2,
      maintenanceAlerts: 5,
      equipmentFunctional: 234,
      equipmentMaintenance: 12,
      totalEquipment: 246,
      patientSatisfaction: 94.2,
      averageStayDuration: 4.2,
      readmissionRate: 3.8,
      monthlyRevenue: 2450000,
      operatingCosts: 1890000,
    };
    
    setStats(mockStats);
    setLoading(false);
  }, []);

  const bedOccupancyData = [
    { name: 'ICU', value: 18, total: 20 },
    { name: 'General Ward', value: 85, total: 120 },
    { name: 'Private', value: 24, total: 30 },
    { name: 'Emergency', value: 8, total: 15 },
    { name: 'Maternity', value: 32, total: 40 },
    { name: 'Pediatrics', value: 22, total: 25 },
  ];

  const monthlyStatsData = [
    { name: 'Jan', referrals: 145, admissions: 89, discharges: 92 },
    { name: 'Feb', referrals: 158, admissions: 95, discharges: 88 },
    { name: 'Mar', referrals: 172, admissions: 102, discharges: 98 },
    { name: 'Apr', referrals: 165, admissions: 98, discharges: 105 },
    { name: 'May', referrals: 189, admissions: 115, discharges: 108 },
    { name: 'Jun', referrals: 205, admissions: 125, discharges: 118 },
  ];

  const departmentPerformanceData = [
    { name: 'Cardiology', value: 95 },
    { name: 'Emergency', value: 88 },
    { name: 'Surgery', value: 92 },
    { name: 'Pediatrics', value: 89 },
    { name: 'Maternity', value: 96 },
  ];

  const alerts = [
    {
      id: '1',
      type: 'warning' as const,
      title: 'ICU Near Capacity',
      message: 'ICU occupancy at 90%. Consider preparing overflow protocols.',
      timestamp: '15 min ago',
      source: 'Bed Management System',
      urgent: true,
    },
    {
      id: '2',
      type: 'info' as const,
      title: 'Equipment Maintenance',
      message: 'MRI machine scheduled for maintenance tomorrow at 9:00 AM.',
      timestamp: '1 hour ago',
      source: 'Maintenance Department',
    },
    {
      id: '3',
      type: 'warning' as const,
      title: 'Staff Shortage Alert',
      message: 'Emergency department understaffed for evening shift.',
      timestamp: '2 hours ago',
      source: 'Staffing Coordinator',
      urgent: true,
    },
  ];

  const quickActions = [
    {
      id: 'add-staff',
      label: 'Add Staff Member',
      description: 'Register new hospital staff',
      icon: UserPlus,
      href: '/admin/staff/create',
      color: 'blue' as const,
    },
    {
      id: 'bed-management',
      label: 'Bed Management',
      description: 'View and manage bed allocation',
      icon: Bed,
      href: '/admin/beds',
      color: 'green' as const,
    },
    {
      id: 'schedule-maintenance',
      label: 'Schedule Maintenance',
      description: 'Equipment maintenance scheduling',
      icon: Settings,
      href: '/admin/equipment/maintenance',
      color: 'orange' as const,
    },
    {
      id: 'view-referrals',
      label: 'Manage Referrals',
      description: 'Review incoming/outgoing referrals',
      icon: FileText,
      href: '/admin/referrals',
      color: 'purple' as const,
    },
    {
      id: 'emergency-protocols',
      label: 'Emergency Protocols',
      description: 'Activate emergency procedures',
      icon: AlertTriangle,
      href: '/admin/emergency',
      color: 'red' as const,
    },
    {
      id: 'reports',
      label: 'Generate Reports',
      description: 'Facility performance reports',
      icon: BarChart3,
      href: '/admin/reports',
      color: 'gray' as const,
    },
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'referral' as const,
      title: 'New Urgent Referral',
      description: 'Patient with chest pain from Kiambu Health Center',
      timestamp: '5 min ago',
      user: 'Dr. Mary Wanjiku',
      status: 'urgent' as const,
      priority: 'high' as const,
    },
    {
      id: '2',
      type: 'patient' as const,
      title: 'ICU Admission',
      description: 'Emergency patient admitted to ICU bed 12',
      timestamp: '12 min ago',
      user: 'Nurse Grace Muthoni',
      status: 'completed' as const,
    },
    {
      id: '3',
      type: 'system' as const,
      title: 'Equipment Alert Resolved',
      description: 'X-ray machine calibration completed successfully',
      timestamp: '25 min ago',
      user: 'Maintenance Team',
      status: 'completed' as const,
    },
    {
      id: '4',
      type: 'referral' as const,
      title: 'Referral Completed',
      description: 'Patient transferred to Kenyatta National Hospital',
      timestamp: '45 min ago',
      user: 'Transport Coordinator',
      status: 'completed' as const,
    },
    {
      id: '5',
      type: 'appointment' as const,
      title: 'Surgery Scheduled',
      description: 'Cardiac surgery scheduled for tomorrow 10:00 AM',
      timestamp: '1 hour ago',
      user: 'Dr. James Mwangi',
      status: 'pending' as const,
    },
  ];

  if (loading) {
    return (
      <AppLayout user={user} breadcrumbs={breadcrumbs}>
        <Head title="Hospital Admin Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user} breadcrumbs={breadcrumbs}>
      <Head title="Hospital Admin Dashboard - eRefer System" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{stats.facilityName}</h1>
            <p className="text-gray-600">Hospital administration and facility management</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                <CheckCircle className="h-4 w-4" />
                Operational
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                <MapPin className="h-4 w-4" />
                Nairobi, Kenya
              </span>
            </div>
          </div>
        </div>

        {/* Key Metrics Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Bed Occupancy"
            value={`${stats.occupiedBeds}/${stats.totalBeds}`}
            subtitle={`${stats.bedUtilization}% utilization`}
            icon={Bed}
            trend={{
              value: 5.2,
              period: 'vs last week',
              isPositive: true,
            }}
            color="blue"
          />
          <MetricCard
            title="Active Staff"
            value={stats.activeStaff}
            subtitle={`${stats.onLeaveStaff} on leave`}
            icon={Users}
            trend={{
              value: 2,
              period: 'new this week',
              isPositive: true,
            }}
            color="green"
          />
          <MetricCard
            title="Pending Referrals"
            value={stats.pendingReferrals}
            subtitle={`${stats.incomingReferrals} incoming today`}
            icon={FileText}
            color="orange"
          />
          <MetricCard
            title="Emergency Alerts"
            value={stats.emergencyAlerts}
            subtitle={`${stats.maintenanceAlerts} maintenance alerts`}
            icon={AlertTriangle}
            color={stats.emergencyAlerts > 0 ? 'red' : 'green'}
          />
        </div>

        {/* Bed Management and Department Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardWidget
            title="Bed Occupancy by Department"
            subtitle="Real-time bed utilization"
            icon={Bed}
          >
            <div className="space-y-3">
              {bedOccupancyData.map((dept) => (
                <div key={dept.name} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{dept.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(dept.value / dept.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 min-w-max">
                      {dept.value}/{dept.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </DashboardWidget>

          <ChartWidget
            title="Department Performance"
            subtitle="Quality scores by department"
            data={departmentPerformanceData}
            type="bar"
            height={250}
            showTrend={true}
            trendValue={3.2}
            trendPeriod="vs last month"
          />
        </div>

        {/* Monthly Trends */}
        <ChartWidget
          title="Monthly Statistics"
          subtitle="Referrals, admissions, and discharges"
          data={monthlyStatsData}
          type="line"
          height={300}
          showTrend={true}
          trendValue={12.5}
          trendPeriod="vs last month"
        />

        {/* Staff and Equipment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Doctors on Duty"
            value={`${stats.activeDoctors}/${stats.totalDoctors}`}
            subtitle="Available now"
            icon={Stethoscope}
            color="blue"
          />
          <MetricCard
            title="Nurses on Duty"
            value={`${stats.activeNurses}/${stats.totalNurses}`}
            subtitle="Current shift"
            icon={Heart}
            color="green"
          />
          <MetricCard
            title="Equipment Status"
            value={stats.equipmentFunctional}
            subtitle={`${stats.equipmentMaintenance} under maintenance`}
            icon={Package}
            color="purple"
          />
          <MetricCard
            title="Patient Satisfaction"
            value={`${stats.patientSatisfaction}%`}
            subtitle="Monthly average score"
            icon={CheckCircle}
            color="green"
          />
        </div>

        {/* Management Tools and Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <QuickActions
            title="Management Tools"
            actions={quickActions}
            columns={2}
          />
          
          <RecentActivity
            title="Recent Activities"
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

        {/* Financial and Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Monthly Revenue"
            value={`KSh ${(stats.monthlyRevenue / 1000000).toFixed(1)}M`}
            subtitle="Current month"
            icon={TrendingUp}
            trend={{
              value: 8.5,
              period: 'vs last month',
              isPositive: true,
            }}
            color="green"
          />
          <MetricCard
            title="Average Stay"
            value={`${stats.averageStayDuration} days`}
            subtitle="Patient length of stay"
            icon={Clock}
            color="blue"
          />
          <MetricCard
            title="Readmission Rate"
            value={`${stats.readmissionRate}%`}
            subtitle="30-day readmissions"
            icon={Activity}
            trend={{
              value: -1.2,
              period: 'improvement',
              isPositive: true,
            }}
            color="orange"
          />
          <MetricCard
            title="Completed Referrals"
            value={stats.completedReferrals}
            subtitle="This month"
            icon={CheckCircle}
            trend={{
              value: 15,
              period: 'vs last month',
              isPositive: true,
            }}
            color="purple"
          />
        </div>
      </div>
    </AppLayout>
  );
}