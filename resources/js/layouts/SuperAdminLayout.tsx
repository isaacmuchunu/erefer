import React, { useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { 
  Users, Building2, FileText, BarChart3, Settings, Bell, Search, Menu, X, User, LogOut,
  Shield, Activity, Database, Server, AlertTriangle, TrendingUp, UserCheck, Plus,
  Lock, Eye, Globe, RefreshCw, Cpu, HardDrive, MonitorSpeaker, Zap, Crown,
  BadgeCheck, UserCog, Wrench, ChevronRight, ChevronDown, Calendar
} from 'lucide-react'
import { type User as UserType } from '@/types'

interface SuperAdminLayoutProps {
  children: React.ReactNode
  user: UserType
}

const superAdminMenuItems = [
  {
    name: 'System Overview',
    href: '/admin/dashboard',
    icon: BarChart3,
    description: 'Real-time system metrics and health monitoring',
    badge: '5 alerts',
    badgeColor: 'bg-red-100 text-red-800',
    subItems: [
      { name: 'System Health', href: '/admin/dashboard/health', icon: Activity, description: 'Monitor system performance' },
      { name: 'Live Analytics', href: '/admin/dashboard/analytics', icon: TrendingUp, description: 'Real-time data insights' },
      { name: 'System Logs', href: '/admin/dashboard/logs', icon: FileText, description: 'View system activity logs' },
      { name: 'Performance Metrics', href: '/admin/dashboard/metrics', icon: BarChart3, description: 'Detailed performance data' },
    ]
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: Users,
    description: 'Comprehensive user administration and access control',
    badge: '2,847 users',
    badgeColor: 'bg-blue-100 text-blue-800',
    subItems: [
      { name: 'All Users', href: '/admin/users', icon: Users, description: 'View and manage all system users', badge: '2,847' },
      { name: 'Create User', href: '/admin/users/create', icon: Plus, description: 'Add new system users' },
      { name: 'User Roles', href: '/admin/users/roles', icon: Shield, description: 'Manage user roles and permissions' },
      { name: 'Access Control', href: '/admin/users/permissions', icon: Lock, description: 'Configure user permissions' },
      { name: 'User Analytics', href: '/admin/users/analytics', icon: TrendingUp, description: 'User behavior insights' },
    ]
  },
  {
    name: 'Facility Management',
    href: '/admin/facilities',
    icon: Building2,
    description: 'Healthcare facility oversight and administration',
    badge: '147 facilities',
    badgeColor: 'bg-green-100 text-green-800',
    subItems: [
      { name: 'All Facilities', href: '/admin/facilities', icon: Building2, description: 'View all healthcare facilities', badge: '147' },
      { name: 'Add Facility', href: '/admin/facilities/create', icon: Plus, description: 'Register new facilities' },
      { name: 'Facility Types', href: '/admin/facilities/types', icon: Building2, description: 'Manage facility categories' },
      { name: 'Equipment Tracking', href: '/admin/facilities/equipment', icon: MonitorSpeaker, description: 'Monitor facility equipment' },
      { name: 'Capacity Management', href: '/admin/facilities/capacity', icon: BarChart3, description: 'Track bed and resource capacity' },
    ]
  },
  {
    name: 'System Infrastructure',
    href: '/admin/system',
    icon: Server,
    description: 'Core system infrastructure and technical operations',
    badge: 'Online',
    badgeColor: 'bg-green-100 text-green-800',
    subItems: [
      { name: 'Server Monitoring', href: '/admin/system/servers', icon: Server, description: 'Monitor server health and performance' },
      { name: 'Database Admin', href: '/admin/system/database', icon: Database, description: 'Database administration and optimization' },
      { name: 'System Resources', href: '/admin/system/resources', icon: Cpu, description: 'CPU, memory, and storage monitoring' },
      { name: 'Network Status', href: '/admin/system/network', icon: Globe, description: 'Network connectivity and performance' },
      { name: 'Backup & Recovery', href: '/admin/system/backup', icon: HardDrive, description: 'Data backup and disaster recovery' },
    ]
  },
  {
    name: 'Security Center',
    href: '/admin/security',
    icon: Shield,
    description: 'Security monitoring and threat management',
    badge: '12 alerts',
    badgeColor: 'bg-orange-100 text-orange-800',
    subItems: [
      { name: 'Security Dashboard', href: '/admin/security/dashboard', icon: Shield, description: 'Overall security status' },
      { name: 'Access Logs', href: '/admin/security/logs', icon: Eye, description: 'User access and activity logs' },
      { name: 'Threat Detection', href: '/admin/security/threats', icon: AlertTriangle, description: 'Security threat monitoring' },
      { name: 'Audit Trail', href: '/admin/security/audit', icon: FileText, description: 'Complete system audit trail' },
      { name: 'Security Policies', href: '/admin/security/policies', icon: Lock, description: 'Configure security policies' },
    ]
  },
  {
    name: 'Analytics & Reports',
    href: '/admin/reports',
    icon: FileText,
    description: 'Comprehensive reporting and business intelligence',
    badge: 'Updated',
    badgeColor: 'bg-purple-100 text-purple-800',
    subItems: [
      { name: 'Executive Dashboard', href: '/admin/reports/executive', icon: BarChart3, description: 'High-level executive insights' },
      { name: 'User Reports', href: '/admin/reports/users', icon: Users, description: 'User activity and engagement' },
      { name: 'System Reports', href: '/admin/reports/system', icon: Server, description: 'Technical system reports' },
      { name: 'Performance Analytics', href: '/admin/reports/performance', icon: TrendingUp, description: 'System performance analysis' },
      { name: 'Custom Reports', href: '/admin/reports/custom', icon: FileText, description: 'Build custom reports' },
    ]
  },
  {
    name: 'System Configuration',
    href: '/admin/settings',
    icon: Settings,
    description: 'Global system settings and configuration',
    subItems: [
      { name: 'General Settings', href: '/admin/settings/general', icon: Settings, description: 'Core system configuration' },
      { name: 'Email Configuration', href: '/admin/settings/email', icon: Bell, description: 'Email server and templates' },
      { name: 'API Management', href: '/admin/settings/api', icon: Globe, description: 'API keys and integration settings' },
      { name: 'Feature Flags', href: '/admin/settings/features', icon: Zap, description: 'Enable/disable system features' },
      { name: 'Maintenance Mode', href: '/admin/settings/maintenance', icon: Wrench, description: 'System maintenance controls' },
    ]
  },
]

export default function SuperAdminLayout({ children, user }: SuperAdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(['System Overview'])
  const { url } = usePage()

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-sm flex-col bg-white shadow-2xl">
          <div className="flex h-16 items-center justify-between px-6 bg-gradient-to-r from-purple-600 to-blue-600">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">System Admin</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <SuperAdminSidebarContent 
              menuItems={superAdminMenuItems} 
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
          <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">System Admin</span>
                <div className="text-xs text-purple-100">eRefer Healthcare Platform</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-4 border-b border-slate-200/60">
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/users/create" className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <Plus className="h-4 w-4" />
                Add User
              </Link>
              <Link href="/admin/system/health" className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <Activity className="h-4 w-4" />
                System Health
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-grow flex flex-col px-4 py-6 overflow-y-auto">
            <nav className="flex-1 space-y-2">
              <SuperAdminSidebarContent 
                menuItems={superAdminMenuItems} 
                currentUrl={url} 
                expandedItems={expandedItems}
                toggleExpanded={toggleExpanded}
              />
            </nav>

            {/* User Info */}
            <div className="mt-auto pt-6 border-t border-slate-200/60">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-xs text-purple-600 font-medium flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    System Administrator
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
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/60 backdrop-blur-sm"
                  placeholder="Search users, facilities, logs..."
                  type="search"
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="ml-6 flex items-center gap-4">
              <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  5
                </span>
              </button>
              
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                System Online
              </div>
              
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
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

function SuperAdminSidebarContent({ 
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
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-[1.02]'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.name}</div>
                  <div className={`text-xs truncate ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
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
                          ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <subItem.icon className={`h-4 w-4 ${isSubActive ? 'text-blue-500' : 'text-slate-400'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{subItem.name}</div>
                        <div className={`text-xs truncate ${isSubActive ? 'text-blue-600' : 'text-slate-500'}`}>
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