import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import {
  Truck,
  Navigation,
  MapPin,
  Clock,
  Route,
  Fuel,
  Phone,
  Radio,
  AlertTriangle,
  CheckCircle,
  Activity,
  Users,
  Calendar,
  Target,
  Shield,
  Settings,
  Zap,
  Timer,
  Building2,
  Gauge,
  Battery,
  MessageSquare,
  Eye,
  RefreshCw
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
  { title: 'Ambulance Driver', href: '/dashboards/ambulance-driver' },
];

interface AmbulanceDriverDashboardProps {
  auth: {
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      role: string;
      ambulance_id?: string;
      license_number?: string;
      shift?: string;
    };
  };
}

export default function AmbulanceDriverDashboard({ auth }: AmbulanceDriverDashboardProps) {
  const { user } = auth;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    const mockStats = {
      driverName: `${user.first_name} ${user.last_name}`,
      ambulanceId: user.ambulance_id || 'AMB-015',
      licenseNumber: user.license_number || 'DL789123',
      shift: user.shift || 'Day Shift',
      currentStatus: 'available',
      currentLocation: 'Central Station',
      fuelLevel: 85,
      mileageToday: 127,
      totalMileage: 15420,
      tripsToday: 4,
      completedTrips: 3,
      activeTrip: null,
      averageResponseTime: 8.2,
      nextMaintenance: '2024-07-15',
      lastInspection: '2024-06-01',
      safetyScore: 94,
      speedingIncidents: 0,
      patientTransports: 15,
      emergencyRuns: 8,
      routineTransfers: 7,
      distanceToDestination: null,
      estimatedArrival: null,
      batteryLevel: 92,
      gpsSignal: 'Strong',
    };

    setStats(mockStats);
    setLoading(false);
  }, []);

  const dailyTripsData = [
    { name: '08:00', trips: 1, distance: 25 },
    { name: '10:00', trips: 1, distance: 18 },
    { name: '12:00', trips: 1, distance: 32 },
    { name: '14:00', trips: 1, distance: 28 },
    { name: '16:00', trips: 0, distance: 0 },
    { name: '18:00', trips: 0, distance: 0 },
  ];

  const weeklyPerformanceData = [
    { name: 'Mon', response_time: 7.5, trips: 6 },
    { name: 'Tue', response_time: 8.2, trips: 5 },
    { name: 'Wed', response_time: 9.1, trips: 7 },
    { name: 'Thu', response_time: 7.8, trips: 4 },
    { name: 'Fri', response_time: 8.5, trips: 6 },
    { name: 'Sat', response_time: 8.0, trips: 3 },
  ];

  const fuelConsumptionData = [
    { name: 'Week 1', consumption: 120 },
    { name: 'Week 2', consumption: 135 },
    { name: 'Week 3', consumption: 118 },
    { name: 'Week 4', consumption: 142 },
  ];

  const alerts = [
    {
      id: '1',
      type: 'info' as const,
      title: 'New Dispatch Assignment',
      message: 'Emergency call at Industrial Area - chest pain patient.',
      timestamp: 'Just now',
      source: 'Dispatch Center',
      actionLabel: 'Accept Call',
    },
    {
      id: '2',
      type: 'warning' as const,
      title: 'Fuel Level Alert',
      message: 'Fuel level at 15% - consider refueling after current trip.',
      timestamp: '5 min ago',
      source: 'Vehicle Monitor',
      actionLabel: 'Find Station',
    },
    {
      id: '3',
      type: 'info' as const,
      title: 'Route Update',
      message: 'Traffic detected on Uhuru Highway - alternative route suggested.',
      timestamp: '10 min ago',
      source: 'Navigation System',
      actionLabel: 'View Route',
    },
  ];

  const quickActions = [
    {
      id: 'update-status',
      label: 'Update Status',
      description: 'Change availability status',
      icon: Activity,
      color: 'blue' as const,
      onClick: () => console.log('Update status'),
    },
    {
      id: 'contact-dispatch',
      label: 'Contact Dispatch',
      description: 'Radio dispatch center',
      icon: Radio,
      href: '/driver/communication',
      color: 'green' as const,
    },
    {
      id: 'navigation',
      label: 'Navigation',
      description: 'Open GPS navigation',
      icon: Navigation,
      href: '/driver/navigation',
      color: 'purple' as const,
    },
    {
      id: 'vehicle-check',
      label: 'Vehicle Inspection',
      description: 'Pre-trip safety check',
      icon: CheckCircle,
      href: '/driver/inspection',
      color: 'orange' as const,
    },
    {
      id: 'emergency-protocol',
      label: 'Emergency Protocols',
      description: 'Access emergency procedures',
      icon: Shield,
      href: '/driver/protocols',
      color: 'red' as const,
    },
    {
      id: 'trip-log',
      label: 'Trip Log',
      description: 'View trip history',
      icon: Calendar,
      href: '/driver/trips',
      color: 'gray' as const,
    },
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'emergency' as const,
      title: 'Emergency Response Completed',
      description: 'Cardiac patient transported to KNH in 18 minutes',
      timestamp: '25 min ago',
      user: 'You',
      status: 'completed' as const,
      priority: 'high' as const,
    },
    {
      id: '2',
      type: 'system' as const,
      title: 'Vehicle Inspection Passed',
      description: 'Pre-shift safety inspection completed successfully',
      timestamp: '2 hours ago',
      user: 'You',
      status: 'completed' as const,
    },
    {
      id: '3',
      type: 'patient' as const,
      title: 'Routine Transfer',
      description: 'Dialysis patient transferred to clinic',
      timestamp: '3 hours ago',
      user: 'You',
      status: 'completed' as const,
    },
    {
      id: '4',
      type: 'system' as const,
      title: 'Fuel Refill',
      description: 'Vehicle refueled at Central Station',
      timestamp: '4 hours ago',
      user: 'You',
      status: 'completed' as const,
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

  if (loading) {
    return (
      <AppLayout user={user} breadcrumbs={breadcrumbs}>
        <Head title="Ambulance Driver Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user} breadcrumbs={breadcrumbs}>
      <Head title="Ambulance Driver Dashboard - eRefer System" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{stats.driverName}</h1>
            <p className="text-gray-600">Ambulance Driver • {stats.ambulanceId} • {stats.shift}</p>
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Today's Trips"
            value={`${stats.completedTrips}/${stats.tripsToday}`}
            subtitle={`${stats.mileageToday} km driven`}
            icon={Route}
            trend={{
              value: 25,
              period: 'vs yesterday',
              isPositive: true,
            }}
            color="blue"
          />
          <MetricCard
            title="Fuel Level"
            value={`${stats.fuelLevel}%`}
            subtitle="Current fuel status"
            icon={Fuel}
            color={stats.fuelLevel < 25 ? 'red' : stats.fuelLevel < 50 ? 'orange' : 'green'}
          />
          <MetricCard
            title="Response Time"
            value={`${stats.averageResponseTime} min`}
            subtitle="Average today"
            icon={Timer}
            trend={{
              value: -12,
              period: 'improvement',
              isPositive: true,
            }}
            color="green"
          />
          <MetricCard
            title="Safety Score"
            value={`${stats.safetyScore}%`}
            subtitle={`${stats.speedingIncidents} incidents`}
            icon={Shield}
            trend={{
              value: 2,
              period: 'vs last month',
              isPositive: true,
            }}
            color="purple"
          />
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartWidget
            title="Daily Trip Performance"
            subtitle="Trips completed and distance covered"
            data={dailyTripsData}
            type="bar"
            height={300}
            showTrend={true}
            trendValue={15}
            trendPeriod="vs yesterday"
          />

          <ChartWidget
            title="Weekly Response Times"
            subtitle="Average response time per day"
            data={weeklyPerformanceData}
            type="line"
            height={300}
            showTrend={true}
            trendValue={-8}
            trendPeriod="improvement"
          />
        </div>

        {/* Vehicle Status and Current Location */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardWidget
            title="Vehicle Status"
            subtitle="Real-time vehicle monitoring"
            icon={Truck}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Fuel className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Fuel Level</span>
                  </div>
                  <span className={`text-sm font-bold ${stats.fuelLevel < 25 ? 'text-red-600' : 'text-green-600'}`}>
                    {stats.fuelLevel}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Battery className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Battery</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">{stats.batteryLevel}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">GPS Signal</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">{stats.gpsSignal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Gauge className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Mileage</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{stats.totalMileage.toLocaleString()} km</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Current Location</span>
                  <Eye className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">{stats.currentLocation}</p>
              </div>
            </div>
          </DashboardWidget>

          <ChartWidget
            title="Monthly Fuel Consumption"
            subtitle="Fuel usage trends"
            data={fuelConsumptionData}
            type="bar"
            height={300}
            showTrend={true}
            trendValue={-8}
            trendPeriod="efficiency improvement"
          />
        </div>

        {/* Quick Actions and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <QuickActions
            title="Driver Controls"
            actions={quickActions}
            columns={2}
          />

          <RecentActivity
            title="Recent Activities"
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

        {/* Performance and Maintenance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Patient Transports"
            value={stats.patientTransports}
            subtitle="This month"
            icon={Users}
            trend={{
              value: 18,
              period: 'vs last month',
              isPositive: true,
            }}
            color="blue"
          />
          <MetricCard
            title="Emergency Runs"
            value={stats.emergencyRuns}
            subtitle={`${stats.routineTransfers} routine transfers`}
            icon={Zap}
            color="red"
          />
          <MetricCard
            title="Next Maintenance"
            value="12 days"
            subtitle={stats.nextMaintenance}
            icon={Settings}
            color="orange"
          />
          <MetricCard
            title="Last Inspection"
            value="30 days ago"
            subtitle={stats.lastInspection}
            icon={CheckCircle}
            color="green"
          />
        </div>
      </div>
    </AppLayout>
  );
}
