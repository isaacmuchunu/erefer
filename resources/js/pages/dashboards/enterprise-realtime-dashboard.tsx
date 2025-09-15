import React, { useState, useEffect } from 'react'
import { Head, Link } from '@inertiajs/react'
import SuperAdminLayout from '@/layouts/SuperAdminLayout'
import { 
  Activity, 
  MapPin, 
  Truck, 
  Users, 
  Building2, 
  Heart, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Navigation, 
  Radio, 
  Fuel, 
  Thermometer, 
  Stethoscope, 
  Brain, 
  Phone, 
  MessageSquare, 
  Globe, 
  Wifi, 
  WifiOff, 
  Battery, 
  BatteryLow, 
  Signal, 
  Siren, 
  Target, 
  Route, 
  Timer, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Settings, 
  Filter, 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Monitor, 
  Smartphone, 
  Calendar, 
  Database, 
  Server, 
  Shield, 
  Lock, 
  Unlock,
  BarChart3,
  PieChart,
  LineChart,
  Layers,
  Map,
  Compass,
  Crosshair
} from 'lucide-react'

interface RealTimeEvent {
  id: string
  timestamp: string
  type: 'emergency' | 'dispatch' | 'arrival' | 'transport' | 'completion' | 'alert' | 'system'
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  location?: {
    lat: number
    lng: number
    address: string
  }
  entities: {
    ambulance_id?: string
    patient_id?: string
    facility_id?: string
    user_id?: string
  }
  status: 'active' | 'resolved' | 'pending'
  duration?: number
  metadata?: Record<string, any>
}

interface AmbulanceStatus {
  id: string
  call_sign: string
  status: 'available' | 'dispatched' | 'en_route' | 'at_scene' | 'transporting' | 'returning' | 'maintenance' | 'offline'
  location: {
    lat: number
    lng: number
    address: string
    heading: number
  }
  crew: {
    driver: string
    paramedic: string
  }
  equipment: {
    defibrillator: boolean
    oxygen: number
    medications: boolean
  }
  patient?: {
    id: string
    name: string
    condition: string
    vital_signs?: {
      heart_rate?: number
      blood_pressure?: string
      oxygen_saturation?: number
      temperature?: number
    }
  }
  destination?: {
    facility_id: string
    facility_name: string
    eta: string
  }
  fuel_level: number
  battery_level: number
  communication_status: 'online' | 'weak' | 'offline'
  last_update: string
  speed: number
  distance_traveled: number
}

interface FacilityStatus {
  id: string
  name: string
  type: 'hospital' | 'clinic' | 'emergency_center'
  location: {
    lat: number
    lng: number
    address: string
  }
  capacity: {
    total_beds: number
    available_beds: number
    icu_beds: number
    emergency_bays: number
  }
  specialties: string[]
  current_load: {
    emergency_patients: number
    admitted_patients: number
    waiting_patients: number
  }
  staff_on_duty: {
    doctors: number
    nurses: number
    specialists: number
  }
  alerts: Array<{
    type: string
    message: string
    severity: 'low' | 'medium' | 'high' | 'critical'
  }>
  last_update: string
  communication_status: 'online' | 'degraded' | 'offline'
}

interface SystemMetrics {
  response_times: {
    current_average: number
    target: number
    trend: number
  }
  system_health: {
    uptime: number
    cpu_usage: number
    memory_usage: number
    database_status: 'healthy' | 'slow' | 'error'
    network_latency: number
  }
  active_incidents: number
  total_dispatches_today: number
  patient_transports_completed: number
  average_transport_time: number
  fuel_consumption: number
  cost_per_dispatch: number
}

interface EnterpriseRealTimeDashboardProps {
  user: any
  real_time_data: {
    events: RealTimeEvent[]
    ambulances: AmbulanceStatus[]
    facilities: FacilityStatus[]
    metrics: SystemMetrics
  }
}

export default function EnterpriseRealTimeDashboard({ user, real_time_data }: EnterpriseRealTimeDashboardProps) {
  const [isLive, setIsLive] = useState(true)
  const [selectedView, setSelectedView] = useState<'map' | 'list' | 'metrics'>('map')
  const [selectedFilters, setSelectedFilters] = useState({
    ambulances: true,
    facilities: true,
    events: true,
    alerts: true
  })
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5) // seconds
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Mock real-time data
  const mockRealTimeData = {
    events: [
      {
        id: '1',
        timestamp: '2024-01-15T14:35:00Z',
        type: 'emergency' as const,
        priority: 'critical' as const,
        title: 'Cardiac Emergency Dispatch',
        description: 'AMB-012 dispatched to cardiac arrest at Uhuru Park',
        location: { lat: -1.2921, lng: 36.8219, address: 'Uhuru Park, Nairobi' },
        entities: { ambulance_id: 'AMB-012', patient_id: 'P-789' },
        status: 'active' as const,
        duration: 180
      },
      {
        id: '2',
        timestamp: '2024-01-15T14:32:00Z',
        type: 'arrival' as const,
        priority: 'high' as const,
        title: 'Ambulance Arrived at Scene',
        description: 'AMB-018 arrived at traffic accident scene',
        location: { lat: -1.3167, lng: 36.8167, address: 'Thika Road, Nairobi' },
        entities: { ambulance_id: 'AMB-018' },
        status: 'resolved' as const,
        duration: 420
      },
      {
        id: '3',
        timestamp: '2024-01-15T14:30:00Z',
        type: 'transport' as const,
        priority: 'medium' as const,
        title: 'Patient Transport Started',
        description: 'AMB-024 transporting patient to KNH',
        location: { lat: -1.2985, lng: 36.8078, address: 'Kenyatta National Hospital' },
        entities: { ambulance_id: 'AMB-024', facility_id: 'KNH-001' },
        status: 'active' as const,
        duration: 900
      }
    ],
    ambulances: [
      {
        id: 'AMB-012',
        call_sign: 'Rescue 12',
        status: 'en_route' as const,
        location: {
          lat: -1.2900,
          lng: 36.8200,
          address: 'Kenyatta Avenue, Nairobi',
          heading: 45
        },
        crew: {
          driver: 'John Kamau',
          paramedic: 'Sarah Wanjiku'
        },
        equipment: {
          defibrillator: true,
          oxygen: 85,
          medications: true
        },
        patient: {
          id: 'P-789',
          name: 'Anonymous Patient',
          condition: 'Cardiac Emergency',
          vital_signs: {
            heart_rate: 45,
            blood_pressure: '90/60',
            oxygen_saturation: 88,
            temperature: 36.8
          }
        },
        destination: {
          facility_id: 'KNH-001',
          facility_name: 'Kenyatta National Hospital',
          eta: '8 minutes'
        },
        fuel_level: 78,
        battery_level: 92,
        communication_status: 'online' as const,
        last_update: '2024-01-15T14:35:00Z',
        speed: 65,
        distance_traveled: 12.5
      },
      {
        id: 'AMB-018',
        call_sign: 'Rescue 18',
        status: 'at_scene' as const,
        location: {
          lat: -1.3167,
          lng: 36.8167,
          address: 'Thika Road Junction',
          heading: 0
        },
        crew: {
          driver: 'Peter Mwangi',
          paramedic: 'Mary Njeri'
        },
        equipment: {
          defibrillator: true,
          oxygen: 95,
          medications: true
        },
        fuel_level: 65,
        battery_level: 88,
        communication_status: 'online' as const,
        last_update: '2024-01-15T14:34:00Z',
        speed: 0,
        distance_traveled: 8.2
      },
      {
        id: 'AMB-024',
        call_sign: 'Rescue 24',
        status: 'transporting' as const,
        location: {
          lat: -1.2950,
          lng: 36.8100,
          address: 'Hospital Road, Nairobi',
          heading: 180
        },
        crew: {
          driver: 'James Ochieng',
          paramedic: 'Grace Akinyi'
        },
        equipment: {
          defibrillator: true,
          oxygen: 70,
          medications: true
        },
        patient: {
          id: 'P-890',
          name: 'Anonymous Patient',
          condition: 'Trauma - Stable',
          vital_signs: {
            heart_rate: 72,
            blood_pressure: '120/80',
            oxygen_saturation: 96,
            temperature: 37.1
          }
        },
        destination: {
          facility_id: 'KNH-001',
          facility_name: 'Kenyatta National Hospital',
          eta: '5 minutes'
        },
        fuel_level: 42,
        battery_level: 75,
        communication_status: 'online' as const,
        last_update: '2024-01-15T14:35:00Z',
        speed: 45,
        distance_traveled: 15.8
      },
      {
        id: 'AMB-007',
        call_sign: 'Rescue 07',
        status: 'available' as const,
        location: {
          lat: -1.2864,
          lng: 36.8230,
          address: 'Central Fire Station',
          heading: 0
        },
        crew: {
          driver: 'David Kiprotich',
          paramedic: 'Nancy Wambui'
        },
        equipment: {
          defibrillator: true,
          oxygen: 100,
          medications: true
        },
        fuel_level: 95,
        battery_level: 100,
        communication_status: 'online' as const,
        last_update: '2024-01-15T14:35:00Z',
        speed: 0,
        distance_traveled: 0
      }
    ],
    facilities: [
      {
        id: 'KNH-001',
        name: 'Kenyatta National Hospital',
        type: 'hospital' as const,
        location: {
          lat: -1.2985,
          lng: 36.8078,
          address: 'Hospital Road, Nairobi'
        },
        capacity: {
          total_beds: 1800,
          available_beds: 156,
          icu_beds: 45,
          emergency_bays: 12
        },
        specialties: ['Emergency Medicine', 'Cardiology', 'Neurology', 'Trauma Surgery'],
        current_load: {
          emergency_patients: 28,
          admitted_patients: 1644,
          waiting_patients: 45
        },
        staff_on_duty: {
          doctors: 89,
          nurses: 234,
          specialists: 45
        },
        alerts: [
          {
            type: 'capacity',
            message: 'Emergency department at 85% capacity',
            severity: 'medium' as const
          }
        ],
        last_update: '2024-01-15T14:35:00Z',
        communication_status: 'online' as const
      },
      {
        id: 'AK-001',
        name: 'Aga Khan University Hospital',
        type: 'hospital' as const,
        location: {
          lat: -1.2743,
          lng: 36.8062,
          address: 'Third Parklands Avenue'
        },
        capacity: {
          total_beds: 254,
          available_beds: 45,
          icu_beds: 12,
          emergency_bays: 8
        },
        specialties: ['Cardiology', 'Oncology', 'Pediatrics', 'Emergency Medicine'],
        current_load: {
          emergency_patients: 12,
          admitted_patients: 209,
          waiting_patients: 18
        },
        staff_on_duty: {
          doctors: 34,
          nurses: 78,
          specialists: 23
        },
        alerts: [],
        last_update: '2024-01-15T14:34:00Z',
        communication_status: 'online' as const
      }
    ],
    metrics: {
      response_times: {
        current_average: 8.2,
        target: 10,
        trend: -12
      },
      system_health: {
        uptime: 99.8,
        cpu_usage: 45,
        memory_usage: 67,
        database_status: 'healthy' as const,
        network_latency: 45
      },
      active_incidents: 5,
      total_dispatches_today: 89,
      patient_transports_completed: 76,
      average_transport_time: 22,
      fuel_consumption: 450,
      cost_per_dispatch: 2850
    }
  }

  const data = real_time_data || mockRealTimeData

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (autoRefresh && isLive) {
      interval = setInterval(() => {
        setLastUpdate(new Date())
        // In a real implementation, this would trigger a data refresh
      }, refreshInterval * 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, isLive, refreshInterval])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'dispatched': return 'bg-blue-100 text-blue-800'
      case 'en_route': return 'bg-purple-100 text-purple-800'
      case 'at_scene': return 'bg-orange-100 text-orange-800'
      case 'transporting': return 'bg-indigo-100 text-indigo-800'
      case 'returning': return 'bg-teal-100 text-teal-800'
      case 'maintenance': return 'bg-red-100 text-red-800'
      case 'offline': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getVitalSignsStatus = (vital_signs: any) => {
    if (!vital_signs) return 'unknown'
    
    const hr = vital_signs.heart_rate
    const o2 = vital_signs.oxygen_saturation
    
    if (hr < 60 || hr > 100 || o2 < 95) return 'critical'
    if (hr < 70 || hr > 90 || o2 < 98) return 'warning'
    return 'normal'
  }

  const getVitalSignsColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'normal': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <SuperAdminLayout user={user}>
      <Head title="Real-Time Operations Dashboard" />
      
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">Real-Time Operations</h1>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">{isLive ? 'Live' : 'Paused'}</span>
              </div>
            </div>
            <p className="text-gray-600 mt-1">
              Real-time emergency response monitoring and fleet management
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['map', 'list', 'metrics'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setSelectedView(view)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                    selectedView === view
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  soundEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}
                title={soundEnabled ? 'Disable sound alerts' : 'Enable sound alerts'}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              
              <button
                onClick={() => setIsLive(!isLive)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isLive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isLive ? 'Pause' : 'Resume'}
              </button>
            </div>
            
            <div className="text-xs text-gray-500">
              Last update: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Key Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Siren className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-gray-700">Active Incidents</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{data.metrics.active_incidents}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Timer className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Avg Response</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{data.metrics.response_times.current_average}m</div>
            <div className="flex items-center gap-1 text-xs">
              {data.metrics.response_times.trend < 0 ? (
                <TrendingDown className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingUp className="h-3 w-3 text-red-500" />
              )}
              <span className={data.metrics.response_times.trend < 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(data.metrics.response_times.trend)}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Truck className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Ambulances</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {data.ambulances.filter(a => a.status !== 'offline' && a.status !== 'maintenance').length}
            </div>
            <div className="text-xs text-gray-500">
              {data.ambulances.filter(a => a.status === 'available').length} available
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Facilities</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{data.facilities.length}</div>
            <div className="text-xs text-gray-500">
              {data.facilities.filter(f => f.communication_status === 'online').length} online
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-teal-600" />
              <span className="text-sm font-medium text-gray-700">System Health</span>
            </div>
            <div className="text-2xl font-bold text-teal-600">{data.metrics.system_health.uptime}%</div>
            <div className="text-xs text-gray-500">Uptime</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Dispatches</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{data.metrics.total_dispatches_today}</div>
            <div className="text-xs text-gray-500">Today</div>
          </div>
        </div>

        {/* Main Content Area */}
        {selectedView === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Placeholder */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Live Operations Map</h3>
                  <p className="text-sm text-gray-600">Real-time ambulance and facility locations</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <Layers className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <Filter className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
              
              {/* Map would be integrated here - showing placeholder */}
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Interactive Map</p>
                  <p className="text-sm text-gray-400">Real-time ambulance tracking</p>
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">En Route</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">At Scene</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">Transporting</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Events Feed */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Live Events</h3>
                  <p className="text-sm text-gray-600">Real-time activity feed</p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {data.events.map((event) => (
                  <div key={event.id} className={`p-4 rounded-lg border ${getPriorityColor(event.priority)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-2 py-1 bg-white rounded">
                          {event.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">{formatTimestamp(event.timestamp)}</span>
                      </div>
                      {event.duration && (
                        <span className="text-xs font-mono text-gray-600">
                          {formatDuration(event.duration)}
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{event.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                    {event.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {event.location.address}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'list' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ambulance Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Ambulance Fleet</h3>
                  <p className="text-sm text-gray-600">Real-time fleet status and locations</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {data.ambulances.map((ambulance) => (
                  <div key={ambulance.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Truck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{ambulance.call_sign}</p>
                          <p className="text-sm text-gray-600">{ambulance.id}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ambulance.status)}`}>
                        {ambulance.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="text-sm">
                        <span className="text-gray-600">Crew:</span>
                        <p className="font-medium">{ambulance.crew.driver}</p>
                        <p className="text-xs text-gray-500">{ambulance.crew.paramedic}</p>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Location:</span>
                        <p className="font-medium">{ambulance.location.address}</p>
                        <p className="text-xs text-gray-500">Speed: {ambulance.speed} km/h</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Fuel className="h-4 w-4 text-gray-400" />
                          <span className={ambulance.fuel_level < 25 ? 'text-red-600' : 'text-gray-600'}>
                            {ambulance.fuel_level}%
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Battery className="h-4 w-4 text-gray-400" />
                          <span className={ambulance.battery_level < 20 ? 'text-red-600' : 'text-gray-600'}>
                            {ambulance.battery_level}%
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {ambulance.communication_status === 'online' ? (
                            <Signal className="h-4 w-4 text-green-500" />
                          ) : (
                            <WifiOff className="h-4 w-4 text-red-500" />
                          )}
                          <span className={ambulance.communication_status === 'online' ? 'text-green-600' : 'text-red-600'}>
                            {ambulance.communication_status}
                          </span>
                        </div>
                      </div>
                      {ambulance.destination && (
                        <span className="text-blue-600 font-medium">ETA: {ambulance.destination.eta}</span>
                      )}
                    </div>
                    
                    {ambulance.patient && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">Patient: {ambulance.patient.condition}</span>
                          {ambulance.patient.vital_signs && (
                            <span className={`text-xs px-2 py-1 rounded ${getVitalSignsColor(getVitalSignsStatus(ambulance.patient.vital_signs))}`}>
                              {getVitalSignsStatus(ambulance.patient.vital_signs)}
                            </span>
                          )}
                        </div>
                        {ambulance.patient.vital_signs && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>HR: {ambulance.patient.vital_signs.heart_rate} bpm</div>
                            <div>SpO₂: {ambulance.patient.vital_signs.oxygen_saturation}%</div>
                            <div>BP: {ambulance.patient.vital_signs.blood_pressure}</div>
                            <div>Temp: {ambulance.patient.vital_signs.temperature}°C</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Facility Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Healthcare Facilities</h3>
                  <p className="text-sm text-gray-600">Real-time capacity and status</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {data.facilities.map((facility) => (
                  <div key={facility.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{facility.name}</p>
                          <p className="text-sm text-gray-600 capitalize">{facility.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {facility.communication_status === 'online' ? (
                          <Wifi className="h-4 w-4 text-green-500" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-xs ${facility.communication_status === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                          {facility.communication_status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Bed Capacity</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                (facility.capacity.total_beds - facility.capacity.available_beds) / facility.capacity.total_beds > 0.8 
                                  ? 'bg-red-500' 
                                  : (facility.capacity.total_beds - facility.capacity.available_beds) / facility.capacity.total_beds > 0.6
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              }`}
                              style={{ 
                                width: `${((facility.capacity.total_beds - facility.capacity.available_beds) / facility.capacity.total_beds) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {facility.capacity.available_beds}/{facility.capacity.total_beds}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Emergency Bays</div>
                        <div className="text-sm font-medium">{facility.capacity.emergency_bays} available</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="font-medium text-blue-600">{facility.current_load.emergency_patients}</div>
                        <div className="text-xs text-blue-700">Emergency</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="font-medium text-green-600">{facility.current_load.admitted_patients}</div>
                        <div className="text-xs text-green-700">Admitted</div>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 rounded">
                        <div className="font-medium text-yellow-600">{facility.current_load.waiting_patients}</div>
                        <div className="text-xs text-yellow-700">Waiting</div>
                      </div>
                    </div>
                    
                    {facility.alerts.length > 0 && (
                      <div className="space-y-1">
                        {facility.alerts.map((alert, index) => (
                          <div key={index} className={`p-2 rounded text-xs ${getPriorityColor(alert.severity)}`}>
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {alert.message}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'metrics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">System Performance</h3>
                  <p className="text-sm text-gray-600">Real-time system health metrics</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-teal-600" />
                    <span className="font-medium">System Uptime</span>
                  </div>
                  <span className="text-lg font-bold text-teal-600">{data.metrics.system_health.uptime}%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">CPU Usage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${data.metrics.system_health.cpu_usage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{data.metrics.system_health.cpu_usage}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Memory Usage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-purple-500 rounded-full"
                        style={{ width: `${data.metrics.system_health.memory_usage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{data.metrics.system_health.memory_usage}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Database Status</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    data.metrics.system_health.database_status === 'healthy' ? 'bg-green-100 text-green-800' :
                    data.metrics.system_health.database_status === 'slow' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {data.metrics.system_health.database_status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">Network Latency</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">{data.metrics.system_health.network_latency}ms</span>
                </div>
              </div>
            </div>

            {/* Operational Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Operational Metrics</h3>
                  <p className="text-sm text-gray-600">Today's performance indicators</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Total Dispatches</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{data.metrics.total_dispatches_today}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Transports Completed</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{data.metrics.patient_transports_completed}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Avg Transport Time</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">{data.metrics.average_transport_time}m</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Fuel className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">Fuel Consumption</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">{data.metrics.fuel_consumption}L</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-teal-600" />
                    <span className="font-medium">Cost per Dispatch</span>
                  </div>
                  <span className="text-lg font-bold text-teal-600">KES {data.metrics.cost_per_dispatch.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  )
}