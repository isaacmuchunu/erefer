import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { 
  Heart, 
  Pill, 
  Users, 
  Clock, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  ThermometerSun,
  Stethoscope,
  Bed,
  Clipboard,
  Bell,
  Plus,
  Eye,
  Edit,
  FileText,
  Zap,
  TrendingUp,
  UserCheck,
  Shield,
  Syringe,
  Monitor,
  ClipboardList,
  Timer,
  Target
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
  { title: 'Nurse', href: '/dashboards/nurse' },
];

interface NurseDashboardProps {
  auth: {
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      role: string;
      ward?: string;
      shift?: string;
      license_number?: string;
      facility_name?: string;
    };
  };
}

export default function NurseDashboard({ auth }: NurseDashboardProps) {
  const { user } = auth;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    const mockStats = {
      nurseName: `${user.first_name} ${user.last_name}`,
      ward: user.ward || 'General Ward',
      shift: user.shift || 'Day Shift',
      licenseNumber: user.license_number || 'RN12345',
      facilityName: user.facility_name || 'Nairobi General Hospital',
      assignedPatients: 12,
      criticalPatients: 2,
      stablePatients: 8,
      dischargesToday: 3,
      admissionsToday: 4,
      medicationsDue: 8,
      medicationsAdministered: 15,
      vitalsOverdue: 3,
      vitalsCompleted: 18,
      nurseCalls: 6,
      handoverNotes: 4,
      todayTasks: 23,
      completedTasks: 19,
      pendingOrders: 5,
      emergencyAlerts: 1,
      patientSatisfaction: 4.7,
      shiftHours: 8,
      patientTurnover: 85.5,
      averageResponseTime: 12,
    };
    
    setStats(mockStats);
    setLoading(false);
  }, []);

  const shiftVitalsData = [
    { name: '06:00', blood_pressure: 18, temperature: 18, pulse: 18 },
    { name: '10:00', blood_pressure: 15, temperature: 15, pulse: 15 },
    { name: '14:00', blood_pressure: 12, temperature: 12, pulse: 12 },
    { name: '18:00', blood_pressure: 8, temperature: 8, pulse: 8 },
    { name: '22:00', blood_pressure: 0, temperature: 0, pulse: 0 },
  ];

  const medicationScheduleData = [
    { name: '08:00', administered: 8, scheduled: 10 },
    { name: '12:00', administered: 6, scheduled: 8 },
    { name: '16:00', administered: 5, scheduled: 7 },
    { name: '20:00', administered: 3, scheduled: 6 },
    { name: '24:00', administered: 0, scheduled: 4 },
  ];

  const patientConditionsData = [
    { name: 'Stable', value: 8 },
    { name: 'Critical', value: 2 },
    { name: 'Recovery', value: 1 },
    { name: 'Pre-Op', value: 1 },
  ];

  const alerts = [
    {
      id: '1',
      type: 'emergency' as const,
      title: 'Critical Patient Alert',
      message: 'Patient in Bed 12 showing irregular vitals - immediate attention required.',
      timestamp: '2 min ago',
      source: 'Monitoring System',
      urgent: true,
      actionLabel: 'View Patient',
    },
    {
      id: '2',
      type: 'warning' as const,
      title: 'Medication Overdue',
      message: 'Pain medication for Patient #4523 is 30 minutes overdue.',
      timestamp: '8 min ago',
      source: 'Medication System',
      urgent: true,
      actionLabel: 'Administer Now',
    },
    {
      id: '3',
      type: 'info' as const,
      title: 'Nurse Call',
      message: 'Patient in Room 205 requesting assistance.',
      timestamp: '15 min ago',
      source: 'Nurse Call System',
      actionLabel: 'Respond',
    },
    {
      id: '4',
      type: 'warning' as const,
      title: 'Vitals Check Due',
      message: '3 patients have vitals checks overdue by more than 1 hour.',
      timestamp: '25 min ago',
      source: 'Vitals Monitoring',
      actionLabel: 'Check Vitals',
    },
  ];

  const quickActions = [
    {
      id: 'patient-assessment',
      label: 'Patient Assessment',
      description: 'Conduct patient evaluation',
      icon: Clipboard,
      href: '/nurse/assessments/new',
      color: 'blue' as const,
    },
    {
      id: 'medication-admin',
      label: 'Medication Round',
      description: 'Administer scheduled medications',
      icon: Pill,
      href: '/nurse/medications',
      color: 'green' as const,
    },
    {
      id: 'vitals-check',
      label: 'Vitals Check',
      description: 'Record patient vital signs',
      icon: ThermometerSun,
      href: '/nurse/vitals',
      color: 'red' as const,
    },
    {
      id: 'nurse-notes',
      label: 'Nursing Notes',
      description: 'Update patient care notes',
      icon: FileText,
      href: '/nurse/notes',
      color: 'purple' as const,
    },
    {
      id: 'shift-handover',
      label: 'Shift Handover',
      description: 'Prepare handover report',
      icon: UserCheck,
      href: '/nurse/handover',
      color: 'orange' as const,
    },
    {
      id: 'emergency-protocols',
      label: 'Emergency Protocols',
      description: 'Access emergency procedures',
      icon: AlertTriangle,
      href: '/nurse/emergency',
      color: 'red' as const,
    },
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'patient' as const,
      title: 'Critical Patient Stabilized',
      description: 'Patient in Bed 8 vitals normalized after intervention',
      timestamp: '15 min ago',
      user: 'You',
      status: 'completed' as const,
      priority: 'high' as const,
    },
    {
      id: '2',
      type: 'system' as const,
      title: 'Medication Administered',
      description: 'Pain medication given to Patient #4521 as scheduled',
      timestamp: '30 min ago',
      user: 'You',
      status: 'completed' as const,
    },
    {
      id: '3',
      type: 'patient' as const,
      title: 'Vitals Recorded',
      description: 'Morning vitals completed for all assigned patients',
      timestamp: '45 min ago',
      user: 'You',
      status: 'completed' as const,
    },
    {
      id: '4',
      type: 'system' as const,
      title: 'Nurse Call Responded',
      description: 'Assisted patient in Room 203 with mobility',
      timestamp: '1 hour ago',
      user: 'You',
      status: 'completed' as const,
    },
    {
      id: '5',
      type: 'patient' as const,
      title: 'Patient Admitted',
      description: 'New admission to Bed 15 - post-operative care',
      timestamp: '2 hours ago',
      user: 'Admissions',
      status: 'pending' as const,
      priority: 'medium' as const,
    },
  ];

  const todayTasks = [
    {
      time: '08:00',
      task: 'Morning Medication Round',
      patients: '8 patients',
      status: 'completed',
      priority: 'high',
    },
    {
      time: '09:30',
      task: 'Vitals Check - Critical Patients',
      patients: '2 patients',
      status: 'completed',
      priority: 'critical',
    },
    {
      time: '10:00',
      task: 'Wound Dressing Change',
      patients: 'Room 205',
      status: 'in-progress',
      priority: 'medium',
    },
    {
      time: '11:00',
      task: 'Pre-operative Preparation',
      patients: 'Bed 12',
      status: 'scheduled',
      priority: 'high',
    },
    {
      time: '12:00',
      task: 'Lunch Medication Round',
      patients: '6 patients',
      status: 'scheduled',
      priority: 'high',
    },
    {
      time: '14:00',
      task: 'Patient Education Session',
      patients: 'Room 201',
      status: 'scheduled',
      priority: 'low',
    },
  ];

  if (loading) {
    return (
      <AppLayout user={user} breadcrumbs={breadcrumbs}>
        <Head title="Nurse Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user} breadcrumbs={breadcrumbs}>
      <Head title="Nurse Dashboard - eRefer System" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nurse {stats.nurseName}</h1>
            <p className="text-gray-600">{stats.ward} • {stats.shift} • {stats.facilityName}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                <Heart className="h-4 w-4" />
                On Duty
              </span>
              <span className="text-sm text-gray-500">
                License: {stats.licenseNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Assigned Patients"
            value={stats.assignedPatients}
            subtitle={`${stats.criticalPatients} critical, ${stats.stablePatients} stable`}
            icon={Users}
            color="blue"
          />
          <MetricCard
            title="Medications Due"
            value={stats.medicationsDue}
            subtitle={`${stats.medicationsAdministered} administered today`}
            icon={Pill}
            trend={{
              value: -2,
              period: 'vs yesterday',
              isPositive: true,
            }}
            color="green"
          />
          <MetricCard
            title="Vitals Overdue"
            value={stats.vitalsOverdue}
            subtitle={`${stats.vitalsCompleted} completed today`}
            icon={ThermometerSun}
            color={stats.vitalsOverdue > 0 ? 'red' : 'green'}
          />
          <MetricCard
            title="Active Alerts"
            value={stats.emergencyAlerts}
            subtitle={`${stats.nurseCalls} nurse calls pending`}
            icon={Bell}
            color={stats.emergencyAlerts > 0 ? 'red' : 'green'}
          />
        </div>

        {/* Vitals and Medication Tracking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartWidget
            title="Vitals Monitoring"
            subtitle="Vital signs checks throughout shift"
            data={shiftVitalsData}
            type="bar"
            height={300}
            showTrend={true}
            trendValue={95}
            trendPeriod="completion rate"
          />
          
          <ChartWidget
            title="Medication Schedule"
            subtitle="Scheduled vs administered medications"
            data={medicationScheduleData}
            type="line"
            height={300}
            showTrend={true}
            trendValue={92}
            trendPeriod="adherence rate"
          />
        </div>

        {/* Patient Status and Today's Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardWidget
            title="Today's Task Schedule"
            subtitle="Patient care tasks and rounds"
            icon={ClipboardList}
          >
            <div className="space-y-3">
              {todayTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-bold text-blue-600 min-w-max">
                      {task.time}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{task.task}</p>
                      <p className="text-xs text-gray-500">{task.patients}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </DashboardWidget>

          <ChartWidget
            title="Patient Status Distribution"
            subtitle="Current patient conditions"
            data={patientConditionsData}
            type="pie"
            height={300}
          />
        </div>

        {/* Quick Actions and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <QuickActions
            title="Nursing Tools"
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

        {/* Performance and Quality Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Today's Tasks"
            value={`${stats.completedTasks}/${stats.todayTasks}`}
            subtitle={`${Math.round((stats.completedTasks / stats.todayTasks) * 100)}% completion rate`}
            icon={Target}
            trend={{
              value: 8,
              period: 'vs yesterday',
              isPositive: true,
            }}
            color="blue"
          />
          <MetricCard
            title="Avg Response Time"
            value={`${stats.averageResponseTime} min`}
            subtitle="To nurse calls"
            icon={Timer}
            trend={{
              value: -3,
              period: 'improvement',
              isPositive: true,
            }}
            color="green"
          />
          <MetricCard
            title="Patient Satisfaction"
            value={`${stats.patientSatisfaction}/5.0`}
            subtitle="Average rating"
            icon={Heart}
            trend={{
              value: 0.3,
              period: 'vs last month',
              isPositive: true,
            }}
            color="purple"
          />
          <MetricCard
            title="Shift Progress"
            value={`${Math.round((new Date().getHours() - 6) / 12 * 100)}%`}
            subtitle={`${12 - (new Date().getHours() - 6)} hours remaining`}
            icon={Clock}
            color="orange"
          />
        </div>

        {/* Ward Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Admissions Today"
            value={stats.admissionsToday}
            subtitle="New patients"
            icon={UserCheck}
            color="blue"
          />
          <MetricCard
            title="Discharges Today"
            value={stats.dischargesToday}
            subtitle="Patients discharged"
            icon={CheckCircle}
            color="green"
          />
          <MetricCard
            title="Pending Orders"
            value={stats.pendingOrders}
            subtitle="Doctor orders to process"
            icon={FileText}
            color="orange"
          />
          <MetricCard
            title="Handover Notes"
            value={stats.handoverNotes}
            subtitle="For next shift"
            icon={Clipboard}
            color="purple"
          />
        </div>
      </div>
    </AppLayout>
  );
}