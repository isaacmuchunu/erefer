import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Phone, 
  MapPin, 
  Heart,
  Pill,
  Hospital,
  MessageSquare,
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Download,
  Upload,
  Video,
  Mail,
  UserCheck,
  Activity,
  Thermometer,
  Monitor,
  CreditCard,
  Shield,
  Star,
  TrendingUp,
  Eye,
  Edit
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
  { title: 'Patient Portal', href: '/dashboards/patient' },
];

interface PatientDashboardProps {
  auth: {
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      role: string;
      patient_id?: string;
      date_of_birth?: string;
      phone_number?: string;
      emergency_contact?: string;
    };
  };
}

export default function PatientDashboard({ auth }: PatientDashboardProps) {
  const { user } = auth;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    const mockStats = {
      patientName: `${user.first_name} ${user.last_name}`,
      patientId: user.patient_id || 'PT789456',
      dateOfBirth: user.date_of_birth || '1985-03-15',
      phoneNumber: user.phone_number || '+254 712 345 678',
      emergencyContact: user.emergency_contact || '+254 722 987 654',
      membershipStatus: 'Active',
      insuranceProvider: 'NHIF',
      primaryDoctor: 'Dr. Sarah Johnson',
      upcomingAppointments: [
        {
          id: 'APT001',
          type: 'Consultation',
          doctor: 'Dr. Sarah Johnson',
          specialization: 'Cardiology',
          date: '2024-07-15',
          time: '10:00 AM',
          location: 'Kenyatta National Hospital',
          status: 'confirmed'
        },
        {
          id: 'APT002',
          type: 'Follow-up',
          doctor: 'Dr. Michael Ochieng',
          specialization: 'Internal Medicine',
          date: '2024-07-22',
          time: '2:30 PM',
          location: 'Nairobi Hospital',
          status: 'pending'
        }
      ],
      recentAppointments: [
        {
          date: '2024-06-30',
          doctor: 'Dr. Sarah Johnson',
          type: 'Consultation',
          diagnosis: 'Hypertension monitoring',
          status: 'completed'
        },
        {
          date: '2024-06-15',
          doctor: 'Dr. Michael Ochieng',
          type: 'Lab Results Review',
          diagnosis: 'Normal blood work',
          status: 'completed'
        }
      ],
      healthMetrics: {
        lastVisit: '2024-06-30',
        nextAppointment: '2024-07-15',
        activePrescriptions: 3,
        pendingTests: 1,
        healthScore: 85,
        bmi: 24.5,
        lastBloodPressure: '120/80',
        lastWeightCheck: '75 kg'
      },
      prescriptions: [
        {
          id: 'RX001',
          medication: 'Lisinopril 10mg',
          dosage: 'Once daily',
          prescribedBy: 'Dr. Sarah Johnson',
          startDate: '2024-06-30',
          endDate: '2024-12-30',
          refillsRemaining: 3,
          status: 'active'
        },
        {
          id: 'RX002',
          medication: 'Metformin 500mg',
          dosage: 'Twice daily with meals',
          prescribedBy: 'Dr. Michael Ochieng',
          startDate: '2024-05-15',
          endDate: '2024-11-15',
          refillsRemaining: 1,
          status: 'active'
        }
      ],
      labResults: [
        {
          date: '2024-06-15',
          test: 'Complete Blood Count',
          status: 'Normal',
          doctor: 'Dr. Michael Ochieng'
        },
        {
          date: '2024-06-15',
          test: 'Lipid Panel',
          status: 'Normal',
          doctor: 'Dr. Michael Ochieng'
        }
      ],
      monthlyStats: {
        appointmentsAttended: 4,
        missedAppointments: 0,
        prescriptionRefills: 2,
        healthScoreTrend: 5,
        doctorRating: 4.8
      }
    };
    
    setStats(mockStats);
    setLoading(false);
  }, []);

  const appointmentTrendsData = [
    { name: 'Jan', appointments: 2, completed: 2, value: 2 },
    { name: 'Feb', appointments: 1, completed: 1, value: 1 },
    { name: 'Mar', appointments: 3, completed: 2, value: 3 },
    { name: 'Apr', appointments: 2, completed: 2, value: 2 },
    { name: 'May', appointments: 4, completed: 4, value: 4 },
    { name: 'Jun', appointments: 3, completed: 3, value: 3 },
  ];

  const healthScoreData = [
    { name: 'Week 1', score: 82, value: 82 },
    { name: 'Week 2', score: 84, value: 84 },
    { name: 'Week 3', score: 86, value: 86 },
    { name: 'Week 4', score: 85, value: 85 },
  ];

  const alerts = [
    {
      id: '1',
      type: 'warning' as const,
      title: 'Appointment Reminder',
      message: 'Cardiology consultation with Dr. Sarah Johnson tomorrow at 10:00 AM.',
      timestamp: 'Just now',
      source: 'Appointment System',
      actionLabel: 'View Details',
    },
    {
      id: '2',
      type: 'info' as const,
      title: 'Prescription Refill Due',
      message: 'Metformin prescription needs refill in 7 days.',
      timestamp: '2 hours ago',
      source: 'Pharmacy System',
      actionLabel: 'Request Refill',
    },
    {
      id: '3',
      type: 'info' as const,
      title: 'Lab Results Ready',
      message: 'Blood work results from June 15th are now available.',
      timestamp: '1 day ago',
      source: 'Laboratory',
      actionLabel: 'View Results',
    },
  ];

  const quickActions = [
    {
      id: 'book-appointment',
      label: 'Book Appointment',
      description: 'Schedule a new appointment',
      icon: Calendar,
      color: 'blue' as const,
      href: '/patient/appointments/book',
    },
    {
      id: 'view-records',
      label: 'Medical Records',
      description: 'Access your health records',
      icon: FileText,
      color: 'green' as const,
      href: '/patient/records',
    },
    {
      id: 'prescriptions',
      label: 'Prescriptions',
      description: 'Manage your medications',
      icon: Pill,
      color: 'purple' as const,
      href: '/patient/prescriptions',
    },
    {
      id: 'lab-results',
      label: 'Lab Results',
      description: 'View test results',
      icon: Monitor,
      color: 'orange' as const,
      href: '/patient/lab-results',
    },
    {
      id: 'message-doctor',
      label: 'Message Doctor',
      description: 'Secure messaging',
      icon: MessageSquare,
      color: 'blue' as const,
      href: '/patient/messages',
    },
    {
      id: 'telemedicine',
      label: 'Video Consultation',
      description: 'Online appointment',
      icon: Video,
      color: 'red' as const,
      href: '/patient/telemedicine',
    },
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'appointment' as const,
      title: 'Cardiology Consultation',
      description: 'Completed consultation with Dr. Sarah Johnson',
      timestamp: '2 days ago',
      user: 'Dr. Sarah Johnson',
      status: 'completed' as const,
    },
    {
      id: '2',
      type: 'patient' as const,
      title: 'Prescription Filled',
      description: 'Lisinopril prescription filled at City Pharmacy',
      timestamp: '5 days ago',
      user: 'City Pharmacy',
      status: 'completed' as const,
    },
    {
      id: '3',
      type: 'patient' as const,
      title: 'Lab Tests Completed',
      description: 'Blood work and lipid panel tests completed',
      timestamp: '1 week ago',
      user: 'Quest Laboratory',
      status: 'completed' as const,
    },
    {
      id: '4',
      type: 'appointment' as const,
      title: 'Follow-up Scheduled',
      description: 'Next appointment booked for July 22nd',
      timestamp: '1 week ago',
      user: 'Appointment System',
      status: 'completed' as const,
    },
  ];

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <AppLayout user={user} breadcrumbs={breadcrumbs}>
        <Head title="Patient Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user} breadcrumbs={breadcrumbs}>
      <Head title="Patient Portal - eRefer System" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {stats.patientName}</h1>
            <p className="text-gray-600">
              Patient ID: {stats.patientId} • Age: {calculateAge(stats.dateOfBirth)} • {stats.membershipStatus} Member
            </p>
            <div className="flex items-center gap-4 mt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <Shield className="h-4 w-4" />
                {stats.insuranceProvider} Covered
              </span>
              <span className="text-sm text-gray-500">
                Primary Doctor: {stats.primaryDoctor}
              </span>
            </div>
          </div>
        </div>

        {/* Key Health Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Health Score"
            value={`${stats.healthMetrics.healthScore}%`}
            subtitle="Overall wellness indicator"
            icon={Heart}
            trend={{
              value: stats.monthlyStats.healthScoreTrend,
              period: 'this month',
              isPositive: true,
            }}
            color="red"
          />
          <MetricCard
            title="Next Appointment"
            value="Tomorrow"
            subtitle={stats.healthMetrics.nextAppointment}
            icon={Calendar}
            color="blue"
          />
          <MetricCard
            title="Active Prescriptions"
            value={stats.healthMetrics.activePrescriptions}
            subtitle={`${stats.monthlyStats.prescriptionRefills} refills this month`}
            icon={Pill}
            color="green"
          />
          <MetricCard
            title="Doctor Rating"
            value={`${stats.monthlyStats.doctorRating}/5`}
            subtitle="Your feedback average"
            icon={Star}
            trend={{
              value: 0.2,
              period: 'improvement',
              isPositive: true,
            }}
            color="purple"
          />
        </div>

        {/* Upcoming Appointments */}
        <DashboardWidget
          title="Upcoming Appointments"
          subtitle="Your scheduled medical appointments"
          icon={Calendar}
        >
          <div className="space-y-4">
            {stats.upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-gray-600">No upcoming appointments</p>
                <p className="text-xs text-gray-500 mt-1">Schedule your next appointment</p>
              </div>
            ) : (
              stats.upcomingAppointments.map((appointment: any) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{appointment.type}</h4>
                      <p className="text-sm text-gray-600">{appointment.doctor} • {appointment.specialization}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {appointment.date} at {appointment.time} • {appointment.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAppointmentStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                    <div className="mt-2">
                      <button className="text-blue-600 hover:text-blue-800 text-xs">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DashboardWidget>

        {/* Health Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartWidget
            title="Health Score Trend"
            subtitle="Weekly health score progression"
            data={healthScoreData}
            type="line"
            height={300}
            showTrend={true}
            trendValue={5}
            trendPeriod="this month"
          />
          
          <ChartWidget
            title="Appointment History"
            subtitle="Monthly appointment attendance"
            data={appointmentTrendsData}
            type="bar"
            height={300}
            showTrend={true}
            trendValue={100}
            trendPeriod="attendance rate"
          />
        </div>

        {/* Current Prescriptions */}
        <DashboardWidget
          title="Active Prescriptions"
          subtitle="Your current medications"
          icon={Pill}
        >
          <div className="space-y-4">
            {stats.prescriptions.map((prescription: any) => (
              <div key={prescription.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Pill className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{prescription.medication}</h4>
                    <p className="text-sm text-gray-600">{prescription.dosage}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Prescribed by {prescription.prescribedBy} • {prescription.refillsRemaining} refills remaining
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                  <div className="mt-2">
                    <button className="text-blue-600 hover:text-blue-800 text-xs">
                      Request Refill
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DashboardWidget>

        {/* Quick Actions, Activity, and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <QuickActions
            title="Patient Services"
            actions={quickActions}
            columns={2}
          />
          
          <RecentActivity
            title="Recent Medical Activity"
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

        {/* Health Summary and Lab Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardWidget
            title="Health Summary"
            subtitle="Key health indicators"
            icon={Activity}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Heart className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Blood Pressure</p>
                  <p className="text-lg font-bold text-blue-600">{stats.healthMetrics.lastBloodPressure}</p>
                  <p className="text-xs text-gray-500">Normal</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Monitor className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">BMI</p>
                  <p className="text-lg font-bold text-green-600">{stats.healthMetrics.bmi}</p>
                  <p className="text-xs text-gray-500">Healthy</p>
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-2">Last Weight Check</p>
                <p className="text-lg font-bold text-gray-900">{stats.healthMetrics.lastWeightCheck}</p>
                <p className="text-xs text-gray-500">2 weeks ago</p>
              </div>
            </div>
          </DashboardWidget>
          
          <DashboardWidget
            title="Recent Lab Results"
            subtitle="Latest test results"
            icon={Monitor}
          >
            <div className="space-y-3">
              {stats.labResults.map((result: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{result.test}</p>
                    <p className="text-xs text-gray-500">{result.date} • {result.doctor}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {result.status}
                    </span>
                    <div className="mt-1">
                      <button className="text-blue-600 hover:text-blue-800 text-xs flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DashboardWidget>
        </div>

        {/* Contact Information */}
        <DashboardWidget
          title="Contact Information"
          subtitle="Your healthcare contacts"
          icon={Phone}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Phone className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Primary Phone</p>
              <p className="text-sm text-gray-600">{stats.phoneNumber}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Emergency Contact</p>
              <p className="text-sm text-gray-600">{stats.emergencyContact}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Mail className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
        </DashboardWidget>
      </div>
    </AppLayout>
  );
}