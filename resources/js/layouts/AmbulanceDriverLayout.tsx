import React, { useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { 
  Truck, Navigation, BarChart3, Settings, Bell, Search, Menu, X, User, LogOut,
  Route, MapPin, Clock, Activity, Shield, Phone, Calendar, FileText,
  Fuel, Wrench, Gauge, Compass, Radio, AlertTriangle, CheckCircle,
  ChevronRight, ChevronDown, Plus, Target, Zap
} from 'lucide-react'
import { type User as UserType } from '@/types'

interface AmbulanceDriverLayoutProps {
  children: React.ReactNode
  user: UserType
}

const ambulanceDriverMenuItems = [
  {
    name: 'Driver Dashboard',
    href: '/driver/dashboard',
    icon: Truck,
    description: 'Your vehicle status and assignment overview',
    badge: 'On Duty',
    badgeColor: 'bg-green-100 text-green-800',
    subItems: [
      { name: 'Current Assignment', href: '/driver/dashboard/assignment', icon: Target, description: 'Your current transport assignment' },
      { name: 'Vehicle Status', href: '/driver/dashboard/vehicle', icon: Truck, description: 'Ambulance condition and readiness' },
      { name: 'Today\'s Schedule', href: '/driver/dashboard/schedule', icon: Clock, description: 'Your shifts and assignments today' },
      { name: 'Performance Metrics', href: '/driver/dashboard/metrics', icon: BarChart3, description: 'Your driving and response metrics' },
    ]
  },
  {
    name: 'Trip Management',
    href: '/driver/trips',
    icon: Route,
    description: 'Transport assignments and trip coordination',
    badge: '3 active',
    badgeColor: 'bg-blue-100 text-blue-800',
    subItems: [
      { name: 'Active Trips', href: '/driver/trips/active', icon: Activity, description: 'Currently active transport assignments', badge: '3' },
      { name: 'Trip History', href: '/driver/trips/history', icon: Clock, description: 'Completed transport records' },
      { name: 'Emergency Calls', href: '/driver/trips/emergency', icon: AlertTriangle, description: 'Emergency response assignments' },
      { name: 'Scheduled Transports', href: '/driver/trips/scheduled', icon: Calendar, description: 'Pre-scheduled patient transports' },
      { name: 'Trip Reports', href: '/driver/trips/reports', icon: FileText, description: 'Complete trip documentation' },
    ]
  },
  {
    name: 'Navigation & Routing',
    href: '/driver/navigation',
    icon: Navigation,
    description: 'GPS navigation and route optimization',
    badge: 'Live GPS',
    badgeColor: 'bg-purple-100 text-purple-800',
    subItems: [
      { name: 'Live Navigation', href: '/driver/navigation/live', icon: Compass, description: 'Real-time GPS navigation' },
      { name: 'Route Optimization', href: '/driver/navigation/routes', icon: Route, description: 'Optimal route suggestions' },
      { name: 'Traffic Updates', href: '/driver/navigation/traffic', icon: MapPin, description: 'Real-time traffic conditions' },
      { name: 'Destination History', href: '/driver/navigation/history', icon: Clock, description: 'Recent destinations and routes' },
      { name: 'Emergency Routes', href: '/driver/navigation/emergency', icon: Zap, description: 'Emergency route protocols' },
    ]
  },
  {
    name: 'Vehicle Operations',
    href: '/driver/vehicle',
    icon: Truck,
    description: 'Ambulance maintenance and operational status',
    badge: 'Good Condition',
    badgeColor: 'bg-green-100 text-green-800',
    subItems: [
      { name: 'Vehicle Inspection', href: '/driver/vehicle/inspection', icon: CheckCircle, description: 'Pre-shift vehicle inspection' },
      { name: 'Fuel Management', href: '/driver/vehicle/fuel', icon: Fuel, description: 'Fuel levels and refueling', badge: '75%' },
      { name: 'Maintenance Alerts', href: '/driver/vehicle/maintenance', icon: Wrench, description: 'Vehicle maintenance notifications' },
      { name: 'Equipment Check', href: '/driver/vehicle/equipment', icon: Shield, description: 'Medical equipment verification' },
      { name: 'Performance Monitor', href: '/driver/vehicle/performance', icon: Gauge, description: 'Vehicle performance metrics' },
    ]
  },
  {
    name: 'Patient Transport',
    href: '/driver/transport',
    icon: User,
    description: 'Patient care during transport',
    badge: '2 patients',
    badgeColor: 'bg-teal-100 text-teal-800',
    subItems: [
      { name: 'Current Patients', href: '/driver/transport/current', icon: User, description: 'Patients currently on board', badge: '2' },
      { name: 'Transport Protocols', href: '/driver/transport/protocols', icon: FileText, description: 'Patient transport procedures' },
      { name: 'Vital Monitoring', href: '/driver/transport/vitals', icon: Activity, description: 'Patient vital signs monitoring' },
      { name: 'Medical Equipment', href: '/driver/transport/equipment', icon: Shield, description: 'Available medical equipment' },
      { name: 'Emergency Procedures', href: '/driver/transport/emergency', icon: AlertTriangle, description: 'Emergency medical protocols' },
    ]
  },
  {
    name: 'Communication',
    href: '/driver/communication',
    icon: Radio,
    description: 'Dispatch and team communication',
    badge: 'Channel 2',
    badgeColor: 'bg-orange-100 text-orange-800',
    subItems: [
      { name: 'Dispatch Radio', href: '/driver/communication/dispatch', icon: Radio, description: 'Direct communication with dispatch' },
      { name: 'Medical Team', href: '/driver/communication/medical', icon: Phone, description: 'Communication with medical personnel' },
      { name: 'Emergency Alerts', href: '/driver/communication/alerts', icon: AlertTriangle, description: 'Emergency communication system' },
      { name: 'Status Updates', href: '/driver/communication/status', icon: Bell, description: 'Send status updates to dispatch' },
      { name: 'Message History', href: '/driver/communication/history', icon: FileText, description: 'Communication log and history' },
    ]
  },
  {
    name: 'Work Schedule',
    href: '/driver/schedule',
    icon: Calendar,
    description: 'Shift management and scheduling',
    badge: 'Day Shift',
    badgeColor: 'bg-indigo-100 text-indigo-800',
    subItems: [
      { name: 'My Schedule', href: '/driver/schedule/mine', icon: Calendar, description: 'Your work schedule and shifts' },
      { name: 'Shift Changes', href: '/driver/schedule/changes', icon: Clock, description: 'Request shift changes or swaps' },
      { name: 'Overtime', href: '/driver/schedule/overtime', icon: Plus, description: 'Overtime opportunities and tracking' },
      { name: 'Time Tracking', href: '/driver/schedule/time', icon: Activity, description: 'Work hours and break tracking' },
      { name: 'Leave Requests', href: '/driver/schedule/leave', icon: Calendar, description: 'Submit leave and vacation requests' },
    ]
  },
  {
    name: 'Safety & Training',
    href: '/driver/safety',
    icon: Shield,
    description: 'Safety protocols and continuing education',
    subItems: [
      { name: 'Safety Protocols', href: '/driver/safety/protocols', icon: Shield, description: 'Emergency safety procedures' },
      { name: 'Training Modules', href: '/driver/safety/training', icon: FileText, description: 'Continuing education and training' },
      { name: 'Incident Reporting', href: '/driver/safety/incidents', icon: AlertTriangle, description: 'Report safety incidents' },
      { name: 'Certification Status', href: '/driver/safety/certification', icon: CheckCircle, description: 'Driver certifications and renewals' },
    ]
  },
]

export default function AmbulanceDriverLayout({ children, user }: AmbulanceDriverLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(['Driver Dashboard'])
  const { url } = usePage()

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-sm flex-col bg-white shadow-2xl">
          <div className="flex h-16 items-center justify-between px-6 bg-gradient-to-r from-orange-600 to-yellow-600">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Driver Portal</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <AmbulanceDriverSidebarContent 
              menuItems={ambulanceDriverMenuItems} 
              currentUrl={url} 
              expandedItems={expandedItems}
              toggleExpanded={toggleExpanded}
            />
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white/90 backdrop-blur-xl border-r border-slate-200/60 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-orange-600 via-yellow-600 to-green-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">Driver Portal</span>
                <div className="text-xs text-orange-100">Emergency Transport</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-4 border-b border-slate-200/60">
            <div className="grid grid-cols-2 gap-3">
              <Link href="/driver/vehicle/inspection" className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <CheckCircle className="h-4 w-4" />
                Vehicle Check
              </Link>
              <Link href="/driver/navigation/live" className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <Navigation className="h-4 w-4" />
                Navigation
              </Link>
            </div>
          </div>

          {/* Driver Status */}
          <div className="px-6 py-4 border-b border-slate-200/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">Duty Status</span>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                On Duty
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-slate-600">
                <div className="font-medium">Unit</div>
                <div className="text-orange-600">AMB-12</div>
              </div>
              <div className="text-slate-600">
                <div className="font-medium">Fuel</div>
                <div className="text-green-600">75%</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-grow flex flex-col px-4 py-6 overflow-y-auto">
            <nav className="flex-1 space-y-2">
              <AmbulanceDriverSidebarContent 
                menuItems={ambulanceDriverMenuItems} 
                currentUrl={url} 
                expandedItems={expandedItems}
                toggleExpanded={toggleExpanded}
              />
            </nav>

            {/* User Info */}
            <div className="mt-auto pt-6 border-t border-slate-200/60">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-xs text-orange-600 font-medium flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    Ambulance Driver
                  </div>
                </div>
              </div>
              
              <Link
                href="/logout"
                method="post"
                as="button"
                className="mt-3 w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex-shrink-0 flex h-16 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 border-r border-slate-200 text-slate-500 hover:text-slate-700 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-6 flex justify-between items-center">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/60 backdrop-blur-sm"
                  placeholder="Search destinations, patients, routes..."
                  type="search"
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="ml-6 flex items-center gap-4">
              <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  2
                </span>
              </button>
              
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Radio className="h-5 w-5" />
              </button>
              
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Navigation className="h-5 w-5" />
              </button>
              
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

function AmbulanceDriverSidebarContent({ 
  menuItems, 
  currentUrl, 
  expandedItems, 
  toggleExpanded 
}: { 
  menuItems: any[], 
  currentUrl: string,
  expandedItems: string[],
  toggleExpanded: (itemName: string) => void
}) {
  return (
    <>
      {menuItems.map((item) => {
        const isActive = currentUrl.startsWith(item.href)
        const isExpanded = expandedItems.includes(item.name)
        const hasSubItems = item.subItems && item.subItems.length > 0

        return (
          <div key={item.name} className="mb-2">
            <div className="flex items-center">
              <Link
                href={item.href}
                className={`flex-1 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg transform scale-[1.02]'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.name}</div>
                  <div className={`text-xs truncate ${isActive ? 'text-orange-100' : 'text-slate-500'}`}>
                    {item.description}
                  </div>
                </div>
                {item.badge && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
              {hasSubItems && (
                <button
                  onClick={() => toggleExpanded(item.name)}
                  className={`p-2 ml-2 rounded-lg transition-colors ${
                    isActive ? 'text-white hover:bg-white/10' : 'text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
            
            {hasSubItems && isExpanded && (
              <div className="mt-2 ml-6 space-y-1">
                {item.subItems.map((subItem: any) => {
                  const isSubActive = currentUrl === subItem.href
                  return (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors ${
                        isSubActive
                          ? 'bg-orange-50 text-orange-700 border-l-2 border-orange-500'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <subItem.icon className={`h-4 w-4 ${isSubActive ? 'text-orange-500' : 'text-slate-400'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{subItem.name}</div>
                        <div className={`text-xs truncate ${isSubActive ? 'text-orange-600' : 'text-slate-500'}`}>
                          {subItem.description}
                        </div>
                      </div>
                      {subItem.badge && (
                        <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                          {subItem.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}