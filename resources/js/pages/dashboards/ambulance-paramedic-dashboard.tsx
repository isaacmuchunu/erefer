import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Zap, 
  Stethoscope, 
  Siren,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  MapPin,
  Package,
  Pill,
  FileText,
  Monitor,
  Timer,
  TrendingUp,
  TrendingDown,
  Minus,
  Gauge,
  ShieldCheck,
  RadioIcon,
  Truck,
  Navigation
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
  { title: 'Ambulance Paramedic', href: '/dashboards/ambulance-paramedic' },
];

interface AmbulanceParamedicDashboardProps {
  auth: {
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      role: string;
      license_number?: string;
      certification_level?: string;
      shift?: string;
      ambulance_id?: string;
    };
  };
}

export default function AmbulanceParamedicDashboard({ auth }: AmbulanceParamedicDashboardProps) {
  const { user } = auth;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    const mockStats = {
      paramedicName: `${user.first_name} ${user.last_name}`,
      licenseNumber: user.license_number || 'PMD789456',
      certificationLevel: user.certification_level || 'Advanced Life Support',
      shift: user.shift || 'Day Shift',
      ambulanceId: user.ambulance_id || 'AMB-015',
      currentStatus: 'en_route',
      currentPatient: {
        id: 'PT001',
        name: 'John Smith',
        age: 45,
        condition: 'Cardiac Emergency',
        vitals: {
          heartRate: 92,
          bloodPressure: { systolic: 140, diastolic: 90 },
          temperature: 98.6,
          oxygenSaturation: 96,
          respiratoryRate: 18,
          bloodGlucose: 110
        },
        consciousness: 'Alert',
        eta: '8 minutes'
      },
      todayStats: {
        patientsTransported: 3,
        emergencyCalls: 2,
        routineTransfers: 1,
        medicationsAdministered: 8,
        protocolsFollowed: 12,
        documentsCompleted: 3
      },
      equipmentStatus: {
        defibrillator: 'operational',
        oxygenTank: 85,
        medicalSupplies: 'stocked',
        medications: 'complete',
        communicationDevice: 'connected'
      },
      recentProtocols: [
        { name: 'Cardiac Protocol', used: '2 hours ago', outcome: 'successful' },
        { name: 'Respiratory Distress', used: '4 hours ago', outcome: 'successful' },
        { name: 'Trauma Assessment', used: '6 hours ago', outcome: 'transferred' }
      ],
      monthlyStats: {
        totalTransports: 89,
        emergencyResponses: 45,
        successfulResuscitations: 12,
        averageResponseTime: 7.5,
        protocolCompliance: 98,
        patientSatisfaction: 94
      }
    };
    
    setStats(mockStats);
    setLoading(false);
  }, []);

  const vitalsHistoryData = [
    { name: '14:00', heartRate: 88, bp_systolic: 135, oxygen: 98, value: 88 },
    { name: '14:15', heartRate: 92, bp_systolic: 140, oxygen: 96, value: 92 },
    { name: '14:30', heartRate: 95, bp_systolic: 145, oxygen: 94, value: 95 },
    { name: '14:45', heartRate: 92, bp_systolic: 140, oxygen: 96, value: 92 },
  ];

  const monthlyPerformanceData = [
    { name: 'Week 1', transports: 22, emergencies: 12, satisfaction: 95, value: 22 },
    { name: 'Week 2', transports: 25, emergencies: 14, satisfaction: 93, value: 25 },
    { name: 'Week 3', transports: 20, emergencies: 10, satisfaction: 96, value: 20 },
    { name: 'Week 4', transports: 22, emergencies: 9, satisfaction: 94, value: 22 },
  ];

  const alerts = [
    {
      id: '1',
      type: 'emergency' as const,
      title: 'Patient Vitals Alert',
      message: 'Heart rate elevated - 110 BPM. Blood pressure rising.',
      timestamp: 'Just now',
      source: 'Patient Monitor',
      urgent: true,
      actionLabel: 'Review Vitals',
    },
    {
      id: '2',
      type: 'warning' as const,
      title: 'Medication Inventory',
      message: 'Epinephrine supply low - 2 doses remaining.',
      timestamp: '5 min ago',
      source: 'Medical Equipment',
      actionLabel: 'Request Restock',
    },
    {
      id: '3',
      type: 'info' as const,
      title: 'Protocol Update',
      message: 'New cardiac emergency protocol v2.1 available.',
      timestamp: '30 min ago',
      source: 'Medical Director',
      actionLabel: 'Review Protocol',
    },
  ];

  const quickActions = [
    {
      id: 'vitals-monitor',
      label: 'Patient Vitals',
      description: 'Monitor current patient vitals',
      icon: Heart,
      color: 'red' as const,
      href: '/paramedic/vitals',
    },
    {
      id: 'protocols',
      label: 'Medical Protocols',
      description: 'Access emergency protocols',
      icon: FileText,
      color: 'blue' as const,
      href: '/paramedic/protocols',
    },
    {
      id: 'medication',
      label: 'Administer Medication',
      description: 'Drug administration log',
      icon: Pill,
      color: 'green' as const,
      href: '/paramedic/medications',
    },
    {
      id: 'equipment-check',
      label: 'Equipment Status',
      description: 'Check medical equipment',
      icon: Package,
      color: 'orange' as const,
      href: '/paramedic/equipment',
    },
    {
      id: 'contact-hospital',
      label: 'Contact Hospital',
      description: 'Direct line to receiving facility',
      icon: Phone,
      color: 'purple' as const,
      href: '/paramedic/communication',
    },
    {
      id: 'patient-report',
      label: 'Patient Report',
      description: 'Complete transport documentation',
      icon: FileText,
      color: 'blue' as const,
      href: '/paramedic/reports',
    },
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'emergency' as const,
      title: 'Cardiac Arrest Response',
      description: 'Successfully resuscitated 62-year-old male patient',
      timestamp: '2 hours ago',
      user: 'You',
      status: 'completed' as const,
      priority: 'critical' as const,
    },
    {
      id: '2',
      type: 'patient' as const,
      title: 'Medication Administered',
      description: 'Administered 0.4mg Nitroglycerin sublingual',
      timestamp: '2.5 hours ago',
      user: 'You',
      status: 'completed' as const,
    },
    {
      id: '3',
      type: 'system' as const,
      title: 'Equipment Check Completed',
      description: 'Pre-shift medical equipment inspection passed',
      timestamp: '8 hours ago',
      user: 'You',
      status: 'completed' as const,
    },
    {
      id: '4',
      type: 'emergency' as const,
      title: 'Trauma Assessment',
      description: 'Motor vehicle accident - multiple injuries assessed',
      timestamp: '6 hours ago',
      user: 'You',
      status: 'completed' as const,
      priority: 'high' as const,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'dispatched': return 'bg-blue-100 text-blue-800';
      case 'en_route': return 'bg-purple-100 text-purple-800';
      case 'at_scene': return 'bg-orange-100 text-orange-800';
      case 'transporting': return 'bg-indigo-100 text-indigo-800';
      case 'off_duty': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVitalStatus = (vital: string, value: number) => {
    switch (vital) {
      case 'heartRate':
        if (value < 60) return { status: 'low', color: 'text-blue-600', icon: TrendingDown };
        if (value > 100) return { status: 'high', color: 'text-red-600', icon: TrendingUp };
        return { status: 'normal', color: 'text-green-600', icon: Minus };
      case 'oxygen':
        if (value < 95) return { status: 'low', color: 'text-red-600', icon: TrendingDown };
        return { status: 'normal', color: 'text-green-600', icon: CheckCircle };
      case 'temperature':
        if (value > 100.4) return { status: 'high', color: 'text-red-600', icon: TrendingUp };
        if (value < 97) return { status: 'low', color: 'text-blue-600', icon: TrendingDown };
        return { status: 'normal', color: 'text-green-600', icon: Minus };
      default:
        return { status: 'normal', color: 'text-green-600', icon: CheckCircle };
    }
  };

  if (loading) {
    return (
      <AppLayout user={user} breadcrumbs={breadcrumbs}>
        <Head title="Ambulance Paramedic Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user} breadcrumbs={breadcrumbs}>
      <Head title="Ambulance Paramedic Dashboard - eRefer System" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{stats.paramedicName}</h1>
            <p className="text-gray-600">
              Paramedic • {stats.certificationLevel} • {stats.ambulanceId} • {stats.shift}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(stats.currentStatus)}`}>
                <Activity className="h-4 w-4" />
                {stats.currentStatus.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-sm text-gray-500">
                License: {stats.licenseNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Current Patient Vitals */}
        {stats.currentPatient && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Current Patient</h2>
                <p className="text-sm text-gray-600">
                  {stats.currentPatient.name} • {stats.currentPatient.age}y • {stats.currentPatient.condition}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-red-600">ETA: {stats.currentPatient.eta}</p>
                <p className="text-xs text-gray-500">To receiving hospital</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(stats.currentPatient.vitals).map(([key, value]) => {
                let displayValue = value;
                let unit = '';
                let vitalName = key;
                
                if (key === 'bloodPressure' && typeof value === 'object') {
                  displayValue = `${(value as any).systolic}/${(value as any).diastolic}`;
                  unit = 'mmHg';
                  vitalName = 'Blood Pressure';
                } else if (key === 'heartRate') {
                  unit = 'BPM';
                  vitalName = 'Heart Rate';
                } else if (key === 'temperature') {
                  unit = '°F';
                  vitalName = 'Temperature';
                } else if (key === 'oxygenSaturation') {
                  unit = '%';
                  vitalName = 'SpO2';
                } else if (key === 'respiratoryRate') {
                  unit = '/min';
                  vitalName = 'Respiratory Rate';
                } else if (key === 'bloodGlucose') {
                  unit = 'mg/dL';
                  vitalName = 'Blood Glucose';
                }
                
                const status = getVitalStatus(key, typeof value === 'number' ? value : 0);
                const StatusIcon = status.icon;
                
                return (
                  <div key={key} className="bg-white rounded-lg p-3 border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">{vitalName}</span>
                      <StatusIcon className={`h-3 w-3 ${status.color}`} />
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {String(displayValue)} <span className="text-sm font-normal text-gray-500">{unit}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Patients Today"
            value={stats.todayStats.patientsTransported}
            subtitle={`${stats.todayStats.emergencyCalls} emergency calls`}
            icon={User}
            trend={{
              value: 33,
              period: 'vs yesterday',
              isPositive: true,
            }}
            color="blue"
          />
          <MetricCard
            title="Medications Given"
            value={stats.todayStats.medicationsAdministered}
            subtitle="Drugs administered today"
            icon={Pill}
            color="green"
          />
          <MetricCard
            title="Protocols Used"
            value={stats.todayStats.protocolsFollowed}
            subtitle="Medical protocols followed"
            icon={FileText}
            color="purple"
          />
          <MetricCard
            title="Response Rate"
            value={`${stats.monthlyStats.protocolCompliance}%`}
            subtitle="Protocol compliance"
            icon={ShieldCheck}
            trend={{
              value: 2,
              period: 'improvement',
              isPositive: true,
            }}
            color="orange"
          />
        </div>

        {/* Patient Vitals Chart and Equipment Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartWidget
            title="Patient Vitals Trend"
            subtitle="Real-time vital signs monitoring"
            data={vitalsHistoryData}
            type="line"
            height={300}
            showTrend={true}
            trendValue={-5}
            trendPeriod="stable vitals"
          />
          
          <DashboardWidget
            title="Medical Equipment Status"
            subtitle="Current equipment and supply levels"
            icon={Package}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Defibrillator</p>
                      <p className="text-xs text-gray-500">Last tested: 2 hours ago</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Operational
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">Oxygen Tank</p>
                      <p className="text-xs text-gray-500">Pressure level</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-600">{stats.equipmentStatus.oxygenTank}%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-sm">Medical Supplies</p>
                      <p className="text-xs text-gray-500">Bandages, IV supplies</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Stocked
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Pill className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-sm">Medications</p>
                      <p className="text-xs text-gray-500">Emergency drugs</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Complete
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <RadioIcon className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium text-sm">Communication</p>
                      <p className="text-xs text-gray-500">Radio & cellular</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                </div>
              </div>
            </div>
          </DashboardWidget>
        </div>

        {/* Performance Chart */}
        <div className="grid grid-cols-1 gap-6">
          <ChartWidget
            title="Monthly Performance Metrics"
            subtitle="Transport volumes and patient satisfaction"
            data={monthlyPerformanceData}
            type="bar"
            height={350}
            showTrend={true}
            trendValue={8}
            trendPeriod="vs last month"
          />
        </div>

        {/* Quick Actions, Activity, and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <QuickActions
            title="Medical Actions"
            actions={quickActions}
            columns={2}
          />
          
          <RecentActivity
            title="Recent Medical Activities"
            activities={recentActivities}
            maxItems={6}
            showUser={false}
            showStatus={true}
          />
          
          <AlertsManager
            alerts={alerts}
            maxVisible={5}
            showTimestamp={true}
          />
        </div>

        {/* Monthly Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Transports"
            value={stats.monthlyStats.totalTransports}
            subtitle="This month"
            icon={Truck}
            trend={{
              value: 12,
              period: 'vs last month',
              isPositive: true,
            }}
            color="blue"
          />
          <MetricCard
            title="Emergency Responses"
            value={stats.monthlyStats.emergencyResponses}
            subtitle={`${stats.monthlyStats.successfulResuscitations} successful resuscitations`}
            icon={Siren}
            color="red"
          />
          <MetricCard
            title="Avg Response Time"
            value={`${stats.monthlyStats.averageResponseTime} min`}
            subtitle="Emergency calls"
            icon={Timer}
            trend={{
              value: -15,
              period: 'improvement',
              isPositive: true,
            }}
            color="green"
          />
          <MetricCard
            title="Patient Satisfaction"
            value={`${stats.monthlyStats.patientSatisfaction}%`}
            subtitle="Based on feedback"
            icon={Heart}
            trend={{
              value: 3,
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