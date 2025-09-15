import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import {
  Stethoscope,
  FileText,
  Users,
  Clock,
  Calendar,
  Send,
  CheckCircle,
  AlertCircle,
  Plus,
  Heart,
  Activity,
  TrendingUp,
  Phone,
  Video,
  MessageSquare,
  Clipboard,
  Pill,
  Eye,
  Edit,
  UserCheck,
  AlertTriangle,
  ThermometerSun,
  Zap,
  BookOpen,
  Award
} from 'lucide-react';
import {
  MetricCard,
  DashboardWidget,
  AlertsManager,
  QuickActions,
  RecentActivity,
  ChartWidget
} from '@/components/dashboard/shared';
import { ProHealthCard, ProHealthStatCard, ProHealthButton } from '@/components/prohealth';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Doctor', href: '/dashboards/doctor' },
];

interface DoctorDashboardProps {
  auth: {
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      role: string;
      specialty?: string;
      license_number?: string;
      facility_name?: string;
    };
  };
}

export default function DoctorDashboard({ auth }: DoctorDashboardProps) {
  const { user } = auth;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    const mockStats = {
      doctorName: `Dr. ${user.first_name} ${user.last_name}`,
      specialty: user.specialty || 'Internal Medicine',
      licenseNumber: user.license_number || 'MD12345',
      facilityName: user.facility_name || 'Nairobi General Hospital',
      totalReferrals: 145,
      pendingReferrals: 8,
      completedReferrals: 128,
      urgentReferrals: 3,
      todayAppointments: 12,
      upcomingAppointments: 25,
      totalPatients: 342,
      activePrescriptions: 67,
      consultationsToday: 8,
      consultationsCompleted: 6,
      averageConsultationTime: 18,
      patientSatisfactionScore: 4.8,
      responseTime: '15 min',
      successRate: 94.2,
      monthlyConsultations: 189,
      referralAcceptanceRate: 89.5,
    };

    setStats(mockStats);
    setLoading(false);
  }, []);

  const weeklyScheduleData = [
    { name: 'Mon', consultations: 8, surgeries: 2 },
    { name: 'Tue', consultations: 12, surgeries: 1 },
    { name: 'Wed', consultations: 10, surgeries: 3 },
    { name: 'Thu', consultations: 15, surgeries: 1 },
    { name: 'Fri', consultations: 11, surgeries: 2 },
    { name: 'Sat', consultations: 6, surgeries: 0 },
  ];

  const referralTrendsData = [
    { name: 'Jan', incoming: 12, outgoing: 18 },
    { name: 'Feb', incoming: 15, outgoing: 22 },
    { name: 'Mar', incoming: 18, outgoing: 25 },
    { name: 'Apr', incoming: 14, outgoing: 20 },
    { name: 'May', incoming: 20, outgoing: 28 },
    { name: 'Jun', incoming: 16, outgoing: 24 },
  ];

  const patientConditionsData = [
    { name: 'Hypertension', value: 35 },
    { name: 'Diabetes', value: 28 },
    { name: 'Cardiac Issues', value: 22 },
    { name: 'Respiratory', value: 18 },
    { name: 'Other', value: 45 },
  ];

  const alerts = [
    {
      id: '1',
      type: 'warning' as const,
      title: 'Urgent Referral Pending',
      message: 'Chest pain patient awaiting cardiac consultation approval.',
      timestamp: '5 min ago',
      source: 'Emergency Department',
      urgent: true,
      actionLabel: 'Review Referral',
    },
    {
      id: '2',
      type: 'info' as const,
      title: 'Lab Results Available',
      message: 'Blood work results for Patient #4521 are ready for review.',
      timestamp: '20 min ago',
      source: 'Laboratory',
      actionLabel: 'View Results',
    },
    {
      id: '3',
      type: 'warning' as const,
      title: 'Medication Alert',
      message: 'Drug interaction warning for Patient #3892.',
      timestamp: '45 min ago',
      source: 'Pharmacy System',
      urgent: true,
      actionLabel: 'Review Prescription',
    },
  ];

  const quickActions = [
    {
      id: 'new-referral',
      label: 'Create Referral',
      description: 'Refer patient to specialist',
      icon: Send,
      href: '/doctor/referrals/create',
      color: 'blue' as const,
    },
    {
      id: 'view-schedule',
      label: 'View Schedule',
      description: 'Check appointments & availability',
      icon: Calendar,
      href: '/doctor/schedule',
      color: 'green' as const,
    },
    {
      id: 'patient-records',
      label: 'Patient Records',
      description: 'Access medical histories',
      icon: Clipboard,
      href: '/doctor/patients',
      color: 'purple' as const,
    },
    {
      id: 'prescriptions',
      label: 'Prescriptions',
      description: 'Manage medications',
      icon: Pill,
      href: '/doctor/prescriptions',
      color: 'orange' as const,
    },
    {
      id: 'video-consult',
      label: 'Video Consultation',
      description: 'Start remote consultation',
      icon: Video,
      href: '/doctor/telemedicine',
      color: 'red' as const,
    },
    {
      id: 'clinical-notes',
      label: 'Clinical Notes',
      description: 'Review and update notes',
      icon: BookOpen,
      href: '/doctor/notes',
      color: 'gray' as const,
    },
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'referral' as const,
      title: 'Referral Approved',
      description: 'Cardiac consultation for John Doe approved and scheduled',
      timestamp: '10 min ago',
      user: 'Dr. Sarah Kamau',
      status: 'completed' as const,
    },
    {
      id: '2',
      type: 'appointment' as const,
      title: 'Consultation Completed',
      description: 'Follow-up appointment with Mary Wanjiku completed',
      timestamp: '25 min ago',
      user: 'You',
      status: 'completed' as const,
    },
    {
      id: '3',
      type: 'patient' as const,
      title: 'Lab Results Reviewed',
      description: 'Blood work results for Patient #3456 reviewed and documented',
      timestamp: '45 min ago',
      user: 'You',
      status: 'completed' as const,
    },
    {
      id: '4',
      type: 'referral' as const,
      title: 'New Referral Request',
      description: 'Orthopedic consultation requested for sports injury',
      timestamp: '1 hour ago',
      user: 'Dr. James Mwangi',
      status: 'pending' as const,
      priority: 'medium' as const,
    },
    {
      id: '5',
      type: 'appointment' as const,
      title: 'Prescription Updated',
      description: 'Medication dosage adjusted for diabetes patient',
      timestamp: '2 hours ago',
      user: 'You',
      status: 'completed' as const,
    },
  ];

  const todayAppointments = [
    {
      time: '09:00',
      patient: 'Alice Njeri',
      type: 'Follow-up',
      condition: 'Hypertension',
      duration: '30 min',
      status: 'completed',
    },
    {
      time: '09:30',
      patient: 'Peter Kamau',
      type: 'Consultation',
      condition: 'Diabetes',
      duration: '45 min',
      status: 'completed',
    },
    {
      time: '10:30',
      patient: 'Grace Wanjiku',
      type: 'New Patient',
      condition: 'Chest Pain',
      duration: '60 min',
      status: 'in-progress',
    },
    {
      time: '11:30',
      patient: 'David Mwangi',
      type: 'Follow-up',
      condition: 'Post-surgery',
      duration: '30 min',
      status: 'scheduled',
    },
    {
      time: '14:00',
      patient: 'Sarah Akinyi',
      type: 'Consultation',
      condition: 'Respiratory',
      duration: '45 min',
      status: 'scheduled',
    },
  ];

  if (loading) {
    return (
      <AppLayout user={user} breadcrumbs={breadcrumbs}>
        <Head title="Doctor Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user} breadcrumbs={breadcrumbs}>
      <Head title="Doctor Dashboard - eRefer System" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="cs_fs_32 cs_primary_font cs_bold cs_heading_color">{stats.doctorName}</h1>
            <p className="cs_body_color cs_secondary_font cs_fs_16">{stats.specialty} • {stats.facilityName}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 cs_radius_15 bg-green-100 text-green-800 cs_fs_14 cs_semibold">
                <UserCheck className="h-4 w-4" />
                On Duty
              </span>
              <span className="cs_fs_14 cs_body_color cs_secondary_font">
                License: {stats.licenseNumber}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ProHealthButton variant="outline" icon={Calendar}>
              View Schedule
            </ProHealthButton>
            <ProHealthButton variant="primary" icon={Plus}>
              New Referral
            </ProHealthButton>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProHealthStatCard
            value={stats.todayAppointments.toString()}
            label="Today's Appointments"
            trend={`${stats.consultationsCompleted} completed`}
            icon={Calendar}
          />
          <ProHealthStatCard
            value={stats.pendingReferrals.toString()}
            label="Pending Referrals"
            trend={stats.urgentReferrals > 0 ? `${stats.urgentReferrals} urgent` : 'All up to date'}
            icon={FileText}
          />
          <ProHealthStatCard
            value={stats.totalPatients.toString()}
            label="Active Patients"
            trend={`${stats.activePrescriptions} prescriptions`}
            icon={Users}
          />
          <ProHealthStatCard
            value={stats.responseTime}
            label="Avg Response Time"
            trend="Within target"
            icon={Clock}
          />
          <ProHealthStatCard
            value={`${stats.patientSatisfactionScore}/5.0`}
            label="Patient Satisfaction"
            trend={`${stats.successRate}% success rate`}
            icon={Heart}
          />
        </div>

        {/* Schedule and Referral Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartWidget
            title="Weekly Schedule"
            subtitle="Consultations and procedures"
            data={weeklyScheduleData}
            type="bar"
            height={300}
            showTrend={true}
            trendValue={15}
            trendPeriod="vs last week"
          />

          <ChartWidget
            title="Referral Trends"
            subtitle="Incoming vs outgoing referrals"
            data={referralTrendsData}
            type="line"
            height={300}
            showTrend={true}
            trendValue={12}
            trendPeriod="this month"
          />
        </div>

        {/* Today's Schedule and Patient Conditions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProHealthCard
            title="Today's Schedule"
            subtitle="Upcoming appointments and consultations"
            icon={Clock}
            className="p-6"
          >
            <div className="space-y-4">
              {todayAppointments.map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 cs_radius_15 hover:cs_shadow_1 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="cs_fs_14 cs_semibold cs_accent_color min-w-max">
                      {appointment.time}
                    </div>
                    <div>
                      <p className="cs_fs_14 cs_semibold cs_heading_color">{appointment.patient}</p>
                      <p className="cs_fs_12 cs_body_color cs_secondary_font">
                        {appointment.type} • {appointment.condition}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="cs_fs_12 cs_body_color">{appointment.duration}</span>
                    <span className={`px-3 py-1 cs_radius_15 cs_fs_12 cs_semibold ${
                      appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ProHealthCard>

          <ChartWidget
            title="Patient Conditions"
            subtitle="Distribution of treated conditions"
            data={patientConditionsData}
            type="pie"
            height={300}
          />
        </div>

        {/* Quick Actions and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <QuickActions
            title="Clinical Tools"
            actions={quickActions}
            columns={2}
          />

          <RecentActivity
            title="Recent Activity"
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

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProHealthStatCard
            value={`${stats.averageConsultationTime} min`}
            label="Avg Consultation Time"
            trend="2 min improvement"
            icon={Clock}
          />
          <ProHealthStatCard
            value={stats.responseTime}
            label="Response Time"
            trend="Average referral response"
            icon={Zap}
          />
          <ProHealthStatCard
            value={stats.monthlyConsultations.toString()}
            label="Monthly Consultations"
            trend="+18% vs last month"
            icon={Activity}
          />
          <ProHealthStatCard
            value={`${stats.referralAcceptanceRate}%`}
            label="Referral Acceptance"
            trend="+3.2% vs last month"
            icon={Award}
          />
        </div>
      </div>
    </AppLayout>
  );
}
