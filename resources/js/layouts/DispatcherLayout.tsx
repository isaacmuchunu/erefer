import React, { useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { 
  Truck, Phone, Navigation, Building2, BarChart3, Settings, Bell, Search, Menu, X, User, LogOut,
  Activity, Clock, AlertTriangle, MapPin, Radio, Users, FileText, Plus, Zap,
  Compass, Route, Target, Shield, Siren, Headphones, Monitor, Globe,
  ChevronRight, ChevronDown, Gauge, Signal, Wifi, Battery, RefreshCw, TrendingUp
} from 'lucide-react'
import { type User as UserType } from '@/types'

interface DispatcherLayoutProps {
  children: React.ReactNode
  user: UserType
}

const dispatcherMenuItems = [
  {
    name: 'Emergency Operations',
    href: '/dispatcher/dashboard',
    icon: Siren,
    description: 'Real-time emergency coordination and dispatch control',
    badge: '3 active',
    badgeColor: 'bg-red-100 text-red-800',
    subItems: [
      { name: 'Live Dashboard', href: '/dispatcher/dashboard', icon: Monitor, description: 'Real-time operations overview', badge: '5 active' },
      { name: 'Emergency Calls', href: '/dispatcher/dashboard/calls', icon: Phone, description: 'Incoming emergency calls', badge: '3 urgent' },
      { name: 'Active Dispatches', href: '/dispatcher/dashboard/dispatches', icon: Truck, description: 'Currently active dispatches', badge: '8 active' },
      { name: 'System Status', href: '/dispatcher/dashboard/status', icon: Activity, description: 'Overall system health and status' },
    ]
  },
  {
    name: 'Ambulance Fleet',
    href: '/dispatcher/ambulances',
    icon: Truck,
    description: 'Fleet management and vehicle coordination',
    badge: '12 available',
    badgeColor: 'bg-green-100 text-green-800',
    subItems: [
      { name: 'Fleet Overview', href: '/dispatcher/ambulances', icon: Truck, description: 'All ambulances status and location', badge: '12 available' },
      { name: 'Vehicle Tracking', href: '/dispatcher/ambulances/tracking', icon: Navigation, description: 'Real-time GPS tracking' },
      { name: 'Deployment Strategy', href: '/dispatcher/ambulances/deployment', icon: Target, description: 'Strategic ambulance positioning' },
      { name: 'Maintenance Schedule', href: '/dispatcher/ambulances/maintenance', icon: Settings, description: 'Vehicle maintenance tracking' },
      { name: 'Resource Allocation', href: '/dispatcher/ambulances/allocation', icon: BarChart3, description: 'Optimize resource distribution' },
    ]
  },
  {
    name: 'Communication Center',
    href: '/dispatcher/communications',
    icon: Radio,
    description: 'Emergency communication and coordination hub',
    badge: '7 channels',
    badgeColor: 'bg-blue-100 text-blue-800',
    subItems: [
      { name: 'Radio Channels', href: '/dispatcher/communications/radio', icon: Radio, description: 'Multi-channel radio communication', badge: '7 active' },
      { name: 'Emergency Hotline', href: '/dispatcher/communications/hotline', icon: Phone, description: 'Emergency call management' },
      { name: 'Team Messaging', href: '/dispatcher/communications/messaging', icon: Users, description: 'Internal team coordination' },
      { name: 'Public Announcements', href: '/dispatcher/communications/announcements', icon: Bell, description: 'Emergency public alerts' },
      { name: 'Communication Logs', href: '/dispatcher/communications/logs', icon: FileText, description: 'Complete communication history' },
    ]
  },
  {
    name: 'Geographic Control',
    href: '/dispatcher/mapping',
    icon: MapPin,
    description: 'Geographic coordination and route optimization',
    badge: 'Live Map',
    badgeColor: 'bg-purple-100 text-purple-800',
    subItems: [
      { name: 'Live Map View', href: '/dispatcher/mapping/live', icon: Globe, description: 'Real-time geographic overview' },
      { name: 'Route Planning', href: '/dispatcher/mapping/routes', icon: Route, description: 'Optimal route calculation' },
      { name: 'Coverage Areas', href: '/dispatcher/mapping/coverage', icon: Target, description: 'Service area management' },
      { name: 'Traffic Monitoring', href: '/dispatcher/mapping/traffic', icon: Navigation, description: 'Real-time traffic conditions' },
      { name: 'Incident Mapping', href: '/dispatcher/mapping/incidents', icon: AlertTriangle, description: 'Incident location tracking' },
    ]
  },
  {
    name: 'Incident Management',
    href: '/dispatcher/incidents',
    icon: AlertTriangle,
    description: 'Emergency incident tracking and coordination',
    badge: '5 active',
    badgeColor: 'bg-orange-100 text-orange-800',
    subItems: [
      { name: 'Active Incidents', href: '/dispatcher/incidents/active', icon: Zap, description: 'Currently active emergencies', badge: '5' },
      { name: 'Create Incident', href: '/dispatcher/incidents/create', icon: Plus, description: 'Report new emergency incident' },
      { name: 'Incident History', href: '/dispatcher/incidents/history', icon: Clock, description: 'Past incident records' },
      { name: 'Priority Queue', href: '/dispatcher/incidents/priority', icon: AlertTriangle, description: 'Emergency priority management' },
      { name: 'Response Analysis', href: '/dispatcher/incidents/analysis', icon: TrendingUp, description: 'Response time analytics' },
    ]
  },
  {
    name: 'Resource Management',
    href: '/dispatcher/resources',
    icon: Building2,
    description: 'Emergency resources and facility coordination',
    badge: '24 facilities',
    badgeColor: 'bg-indigo-100 text-indigo-800',
    subItems: [
      { name: 'Hospital Capacity', href: '/dispatcher/resources/hospitals', icon: Building2, description: 'Hospital bed availability', badge: '24' },
      { name: 'Medical Personnel', href: '/dispatcher/resources/personnel', icon: Users, description: 'Available medical staff' },
      { name: 'Equipment Status', href: '/dispatcher/resources/equipment', icon: Activity, description: 'Medical equipment availability' },
      { name: 'Supply Levels', href: '/dispatcher/resources/supplies', icon: Plus, description: 'Emergency supply tracking' },
      { name: 'Facility Alerts', href: '/dispatcher/resources/alerts', icon: AlertTriangle, description: 'Facility status alerts' },
    ]
  },
  {
    name: 'Performance Analytics',
    href: '/dispatcher/analytics',
    icon: BarChart3,
    description: 'Operations analytics and performance metrics',
    badge: 'Updated',
    badgeColor: 'bg-teal-100 text-teal-800',
    subItems: [
      { name: 'Response Times', href: '/dispatcher/analytics/response', icon: Clock, description: 'Response time analysis' },
      { name: 'Fleet Performance', href: '/dispatcher/analytics/fleet', icon: Truck, description: 'Ambulance utilization metrics' },
      { name: 'Call Volume', href: '/dispatcher/analytics/calls', icon: Phone, description: 'Emergency call statistics' },
      { name: 'Coverage Analysis', href: '/dispatcher/analytics/coverage', icon: Target, description: 'Service coverage optimization' },
      { name: 'Custom Reports', href: '/dispatcher/analytics/reports', icon: FileText, description: 'Generate custom analytics' },
    ]
  },
  {
    name: 'System Configuration',
    href: '/dispatcher/settings',
    icon: Settings,
    description: 'Dispatch system configuration and preferences',
    subItems: [
      { name: 'Alert Settings', href: '/dispatcher/settings/alerts', icon: Bell, description: 'Configure system alerts and notifications' },
      { name: 'Communication Setup', href: '/dispatcher/settings/communication', icon: Radio, description: 'Radio and communication settings' },
      { name: 'Map Preferences', href: '/dispatcher/settings/maps', icon: MapPin, description: 'Geographic display preferences' },
      { name: 'User Permissions', href: '/dispatcher/settings/permissions', icon: Shield, description: 'Dispatch team access control' },
      { name: 'System Monitoring', href: '/dispatcher/settings/monitoring', icon: Monitor, description: 'System health monitoring' },
    ]
  },
]

export default function DispatcherLayout({ children, user }: DispatcherLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(['Emergency Operations'])
  const { url } = usePage()

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-sm flex-col bg-white shadow-2xl">
          <div className="flex h-16 items-center justify-between px-6 bg-gradient-to-r from-red-600 to-orange-600">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Siren className="h-5 w-5 text-white animate-pulse" />
              </div>
              <span className="text-xl font-bold text-white">Dispatch Center</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <DispatcherSidebarContent 
              menuItems={dispatcherMenuItems} 
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
          <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Siren className="h-6 w-6 text-white animate-pulse" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">Dispatch Center</span>
                <div className="text-xs text-red-100">Emergency Operations</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-4 border-b border-slate-200/60">
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dispatcher/incidents/create" className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                <AlertTriangle className="h-4 w-4" />
                New Incident
              </Link>
              <Link href="/dispatcher/communications/radio" className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <Radio className="h-4 w-4" />
                Radio Control
              </Link>
            </div>
          </div>

          {/* System Status */}
          <div className="px-6 py-4 border-b border-slate-200/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">System Status</span>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Operational
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1 text-slate-600">
                <Signal className="h-3 w-3 text-green-500" />
                Radio: OK
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <Wifi className="h-3 w-3 text-green-500" />
                Network: OK
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <Battery className="h-3 w-3 text-green-500" />
                Power: 100%
              </div>
            </div>
          </div>

          {/* Current Operations */}
          <div className="px-6 py-4 border-b border-slate-200/60">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Current Operations</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                <span className="text-red-700">Unit 12 - Emergency</span>
                <span className="text-red-600 font-medium">03:15</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                <span className="text-orange-700">Unit 7 - Transport</span>
                <span className="text-orange-600 font-medium">12:45</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-grow flex flex-col px-4 py-6 overflow-y-auto">
            <nav className="flex-1 space-y-2">
              <DispatcherSidebarContent 
                menuItems={dispatcherMenuItems} 
                currentUrl={url} 
                expandedItems={expandedItems}
                toggleExpanded={toggleExpanded}
              />
            </nav>

            {/* User Info */}
            <div className="mt-auto pt-6 border-t border-slate-200/60">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-100">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-xs text-red-600 font-medium flex items-center gap-1">
                    <Headphones className="h-3 w-3" />
                    Emergency Dispatcher
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
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/60 backdrop-blur-sm"
                  placeholder="Search incidents, units, locations..."
                  type="search"
                />
              </div>
            </div>
            
            {/* Emergency Controls */}
            <div className="ml-6 flex items-center gap-4">
              <button className="relative p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200">
                <Siren className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  3
                </span>
              </button>
              
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Radio className="h-5 w-5" />
              </button>
              
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <RefreshCw className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-lg">
                <Gauge className="h-4 w-4" />
                ACTIVE
              </div>
              
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
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

function DispatcherSidebarContent({ 
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
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg transform scale-[1.02]'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.name}</div>
                  <div className={`text-xs truncate ${isActive ? 'text-red-100' : 'text-slate-500'}`}>
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
                          ? 'bg-red-50 text-red-700 border-l-2 border-red-500'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <subItem.icon className={`h-4 w-4 ${isSubActive ? 'text-red-500' : 'text-slate-400'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{subItem.name}</div>
                        <div className={`text-xs truncate ${isSubActive ? 'text-red-600' : 'text-slate-500'}`}>
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