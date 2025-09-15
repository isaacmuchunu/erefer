import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { 
  Truck, 
  Phone, 
  Navigation, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  Activity, 
  Radio,
  Zap,
  Route,
  Target,
  Users,
  Building2,
  Calendar,
  Plus,
  Eye,
  Edit,
  PhoneCall,
  MessageSquare,
  RefreshCw,
  Signal,
  Fuel,
  Settings,
  Shield,
  TrendingUp,
  CheckCircle,
  XCircle,
  Timer
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
  { title: 'Dispatcher', href: '/dashboards/dispatcher' },
];

interface DispatcherDashboardProps {
  auth: {
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      role: string;
      dispatch_zone?: string;
      shift?: string;
      license_number?: string;
    };
  };
}

export default function EnhancedDispatcherDashboard({ auth }: DispatcherDashboardProps) {
  const { user } = auth;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    const mockStats = {
      dispatcherName: `${user.first_name} ${user.last_name}`,
      dispatchZone: user.dispatch_zone || 'Central Nairobi',
      shift: user.shift || 'Day Shift',
      totalAmbulances: 24,
      availableAmbulances: 8,
      dispatchedAmbulances: 12,
      maintenanceAmbulances: 4,
      emergencyCalls: 6,
      completedDispatches: 18,
      averageResponseTime: 8.5,
      averageTransportTime: 22,
      fuelAlerts: 3,
      communicationIssues: 1,
      activeIncidents: 4,
      resolvedIncidents: 15,
      criticalCalls: 2,
      routineTransfers: 8,
      hospitalAlerts: 2,
      coverageZones: 12,
      optimalCoverage: 9,
      resourceUtilization: 78.5,
      dispatchAccuracy: 96.2,
    };
    
    setStats(mockStats);
    setLoading(false);
  }, []);

  const responseTimeData = [
    { name: '00:00', target: 10, actual: 8.5 },
    { name: '04:00', target: 10, actual: 9.2 },
    { name: '08:00', target: 10, actual: 12.1 },
    { name: '12:00', target: 10, actual: 11.8 },
    { name: '16:00', target: 10, actual: 9.7 },
    { name: '20:00', target: 10, actual: 8.9 },
  ];

  const fleetUtilizationData = [
    { name: 'Mon', dispatched: 15, available: 9 },
    { name: 'Tue', dispatched: 18, available: 6 },
    { name: 'Wed', dispatched: 14, available: 10 },
    { name: 'Thu', dispatched: 20, available: 4 },
    { name: 'Fri', dispatched: 16, available: 8 },
    { name: 'Sat', dispatched: 12, available: 12 },
    { name: 'Sun', dispatched: 10, available: 14 },
  ];

  const emergencyTypesData = [
    { name: 'Cardiac', value: 25 },
    { name: 'Trauma', value: 35 },
    { name: 'Respiratory', value: 15 },
    { name: 'Neurological', value: 12 },
    { name: 'Other', value: 13 },
  ];

  const alerts = [
    {
      id: '1',
      type: 'emergency' as const,
      title: 'Critical Emergency Call',
      message: 'Cardiac arrest at Uhuru Park - multiple units required immediately.',
      timestamp: '1 min ago',
      source: 'Emergency Services',
      urgent: true,
      actionLabel: 'Dispatch Now',
    },
    {
      id: '2',
      type: 'warning' as const,
      title: 'Ambulance Low Fuel',
      message: 'AMB-024 reporting fuel level below 20% - needs refueling.',
      timestamp: '8 min ago',
      source: 'Fleet Monitor',
      urgent: true,
      actionLabel: 'Send to Station',
    },
    {
      id: '3',
      type: 'warning' as const,
      title: 'Communication Issue',
      message: 'Lost radio contact with AMB-012 - last known location Westlands.',
      timestamp: '15 min ago',
      source: 'Communication Center',
      urgent: true,
      actionLabel: 'Reestablish Contact',
    },
    {
      id: '4',
      type: 'info' as const,
      title: 'Transport Complete',
      message: 'AMB-018 completed transport to KNH - returning to service.',
      timestamp: '20 min ago',
      source: 'Fleet Tracking',
      actionLabel: 'Update Status',
    },
  ];

  const quickActions = [
    {
      id: 'emergency-dispatch',
      label: 'Emergency Dispatch',
      description: 'Dispatch ambulance for emergency',
      icon: Phone,
      href: '/dispatcher/emergency',
      color: 'red' as const,
    },
    {
      id: 'routine-transport',
      label: 'Schedule Transport',
      description: 'Plan routine patient transfer',
      icon: Calendar,
      href: '/dispatcher/transport',
      color: 'blue' as const,
    },
    {
      id: 'fleet-status',
      label: 'Fleet Status',
      description: 'View all ambulance locations',
      icon: MapPin,
      href: '/dispatcher/fleet',
      color: 'green' as const,
    },
    {
      id: 'route-optimize',
      label: 'Route Optimization',
      description: 'Calculate optimal routes',
      icon: Route,
      href: '/dispatcher/routes',
      color: 'purple' as const,
    },
    {
      id: 'communication',
      label: 'Radio Communication',
      description: 'Contact ambulance crews',
      icon: Radio,
      href: '/dispatcher/radio',
      color: 'orange' as const,
    },
    {
      id: 'incident-report',
      label: 'Incident Report',
      description: 'Create incident documentation',
      icon: FileText,
      href: '/dispatcher/incidents',
      color: 'gray' as const,
    },
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'emergency' as const,
      title: 'Critical Dispatch Completed',
      description: 'AMB-015 reached accident scene in 7 minutes - patient transported to KNH',
      timestamp: '5 min ago',
      user: 'You',
      status: 'completed' as const,
      priority: 'critical' as const,
    },
    {
      id: '2',
      type: 'system' as const,
      title: 'Ambulance Status Update',
      description: 'AMB-022 completed maintenance check - returned to active service',
      timestamp: '12 min ago',
      user: 'Maintenance Team',
      status: 'completed' as const,
    },
    {
      id: '3',
      type: 'emergency' as const,
      title: 'Multi-Unit Response',
      description: 'Dispatched 3 ambulances to road traffic accident on Thika Road',
      timestamp: '25 min ago',
      user: 'You',
      status: 'completed' as const,
      priority: 'high' as const,
    },
    {
      id: '4',
      type: 'system' as const,
      title: 'Route Optimization',
      description: 'Updated optimal routes for Westlands coverage zone',
      timestamp: '45 min ago',
      user: 'Route Algorithm',
      status: 'completed' as const,
    },
    {
      id: '5',
      type: 'emergency' as const,
      title: 'Hospital Diversion',
      description: 'Redirected AMB-009 from KNH to Aga Khan due to capacity',
      timestamp: '1 hour ago',
      user: 'You',
      status: 'completed' as const,
      priority: 'medium' as const,
    },
  ];

  const activeAmbulances = [
    {
      id: 'AMB-012',
      status: 'en_route',
      location: 'Westlands → KNH',
      crew: 'Team Alpha',
      eta: '12 min',
      patient: 'Cardiac emergency',
      fuelLevel: 85,
    },
    {
      id: 'AMB-018',
      status: 'at_scene',
      location: 'Industrial Area',
      crew: 'Team Bravo',
      eta: 'On scene',
      patient: 'Traffic accident',
      fuelLevel: 67,
    },
    {
      id: 'AMB-024',
      status: 'returning',
      location: 'Returning to base',
      crew: 'Team Charlie',
      eta: '8 min',
      patient: 'Transport complete',
      fuelLevel: 18,
    },
    {
      id: 'AMB-007',
      status: 'available',
      location: 'Central Station',
      crew: 'Team Delta',
      eta: 'Standby',
      patient: 'Available',
      fuelLevel: 92,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'dispatched': return 'bg-blue-100 text-blue-800';
      case 'en_route': return 'bg-purple-100 text-purple-800';
      case 'at_scene': return 'bg-orange-100 text-orange-800';
      case 'returning': return 'bg-indigo-100 text-indigo-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AppLayout user={user} breadcrumbs={breadcrumbs}>
        <Head title="Dispatcher Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user} breadcrumbs={breadcrumbs}>
      <Head title="Enhanced Dispatcher Dashboard - eRefer System" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dispatch Center</h1>
            <p className="text-gray-600">Emergency response coordination and ambulance fleet management</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                <Radio className="h-4 w-4" />
                Radio Active
              </span>
              <span className="text-sm text-gray-500">
                Zone: {stats.dispatchZone} • {stats.shift}
              </span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Active Ambulances"
            value={`${stats.dispatchedAmbulances}/${stats.totalAmbulances}`}
            subtitle={`${stats.availableAmbulances} available now`}
            icon={Truck}
            trend={{
              value: stats.resourceUtilization,
              period: 'utilization rate',
              isPositive: true,
            }}
            color="blue"
          />
          <MetricCard
            title="Emergency Calls"
            value={stats.emergencyCalls}
            subtitle={`${stats.criticalCalls} critical priority`}
            icon={Phone}
            color={stats.criticalCalls > 0 ? 'red' : 'green'}
          />
          <MetricCard
            title="Avg Response Time"
            value={`${stats.averageResponseTime} min`}
            subtitle="Target: 10 minutes"
            icon={Clock}
            trend={{
              value: -15,
              period: 'vs target',
              isPositive: true,
            }}
            color="green"
          />
          <MetricCard
            title="Active Incidents"
            value={stats.activeIncidents}
            subtitle={`${stats.resolvedIncidents} resolved today`}
            icon={AlertTriangle}
            color={stats.activeIncidents > 2 ? 'orange' : 'green'}
          />
        </div>

        {/* Response Time and Fleet Utilization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartWidget
            title="Response Time Performance"
            subtitle="Actual vs target response times"
            data={responseTimeData}
            type="line"
            height={300}
            showTrend={true}
            trendValue={15}
            trendPeriod="improvement vs target"
          />
          
          <ChartWidget
            title="Fleet Utilization"
            subtitle="Dispatched vs available ambulances"
            data={fleetUtilizationData}
            type="bar"
            height={300}
            showTrend={true}
            trendValue={stats.resourceUtilization}
            trendPeriod="utilization rate"
          />
        </div>

        {/* Active Fleet Status and Emergency Types */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardWidget
            title="Active Fleet Status"
            subtitle="Real-time ambulance monitoring"
            icon={Activity}
          >
            <div className="space-y-3">
              {activeAmbulances.map((ambulance) => (
                <div key={ambulance.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col items-center">
                      <Truck className="h-5 w-5 text-blue-600" />
                      <span className="text-xs font-bold">{ambulance.id}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{ambulance.location}</p>
                      <p className="text-xs text-gray-500">
                        {ambulance.crew} • {ambulance.patient}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ambulance.status)}`}>
                      {ambulance.status.replace('_', ' ')}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Fuel className="h-3 w-3 text-gray-400" />
                      <span className={`text-xs ${ambulance.fuelLevel < 25 ? 'text-red-600' : 'text-gray-600'}`}>
                        {ambulance.fuelLevel}%
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{ambulance.eta}</span>
                  </div>
                </div>
              ))}
            </div>
          </DashboardWidget>

          <ChartWidget
            title="Emergency Call Types"
            subtitle="Distribution of emergency calls"
            data={emergencyTypesData}
            type="pie"
            height={300}
          />
        </div>

        {/* Quick Actions and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <QuickActions
            title="Dispatch Control"
            actions={quickActions}
            columns={2}
          />
          
          <RecentActivity
            title="Recent Dispatches"
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
            title="Dispatch Accuracy"
            value={`${stats.dispatchAccuracy}%`}
            subtitle="Correct unit assignments"
            icon={Target}
            trend={{
              value: 2.3,
              period: 'vs last month',
              isPositive: true,
            }}
            color="blue"
          />
          <MetricCard
            title="Coverage Zones"
            value={`${stats.optimalCoverage}/${stats.coverageZones}`}
            subtitle="Optimal coverage achieved"
            icon={MapPin}
            color="green"
          />
          <MetricCard
            title="Avg Transport Time"
            value={`${stats.averageTransportTime} min`}
            subtitle="Scene to hospital"
            icon={Timer}
            trend={{
              value: -8,
              period: 'improvement',
              isPositive: true,
            }}
            color="purple"
          />
          <MetricCard
            title="Communication Issues"
            value={stats.communicationIssues}
            subtitle={`${stats.fuelAlerts} fuel alerts`}
            icon={Signal}
            color={stats.communicationIssues > 0 ? 'red' : 'green'}
          />
        </div>

        {/* Fleet Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Available Units"
            value={stats.availableAmbulances}
            subtitle="Ready for dispatch"
            icon={CheckCircle}
            color="green"
          />
          <MetricCard
            title="In Maintenance"
            value={stats.maintenanceAmbulances}
            subtitle="Undergoing service"
            icon={Settings}
            color="orange"
          />
          <MetricCard
            title="Completed Dispatches"
            value={stats.completedDispatches}
            subtitle="Today"
            icon={Activity}
            trend={{
              value: 12,
              period: 'vs yesterday',
              isPositive: true,
            }}
            color="blue"
          />
          <MetricCard
            title="Hospital Alerts"
            value={stats.hospitalAlerts}
            subtitle="Capacity warnings"
            icon={Building2}
            color={stats.hospitalAlerts > 0 ? 'red' : 'green'}
          />
        </div>
      </div>
    </AppLayout>
  );
}