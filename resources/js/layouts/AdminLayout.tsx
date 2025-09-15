import React, { useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { 
  Users, Building2, FileText, BarChart3, Settings, Bell, Search, Menu, X, User, LogOut,
  Shield, Activity, Database, Server, AlertTriangle, TrendingUp, UserCheck, Plus,
  HardDrive, Cpu, MonitorSpeaker, Lock, Eye, Globe, RefreshCw
} from 'lucide-react'
import { type User as UserType } from '@/types'

interface AdminLayoutProps {
  children: React.ReactNode
  user: UserType
}

const adminMenuItems = [
  {
    name: 'Overview',
    href: '/admin/dashboard',
    icon: BarChart3,
    description: 'System overview and metrics'
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: Users,
    description: 'Manage healthcare professionals',
    badge: '15,643',
    subItems: [
      { name: 'All Users', href: '/admin/users', icon: Users },
      { name: 'Add User', href: '/admin/users/create', icon: Plus },
      { name: 'User Roles', href: '/admin/users/roles', icon: Shield },
      { name: 'Permissions', href: '/admin/users/permissions', icon: Lock },
    ]
  },
  {
    name: 'Facility Management',
    href: '/admin/facilities',
    icon: Building2,
    description: 'Healthcare facilities',
    badge: '1,248',
    subItems: [
      { name: 'All Facilities', href: '/admin/facilities', icon: Building2 },
      { name: 'Add Facility', href: '/admin/facilities/create', icon: Plus },
      { name: 'Facility Types', href: '/admin/facilities/types', icon: Building2 },
      { name: 'Equipment', href: '/admin/facilities/equipment', icon: Activity },
    ]
  },
  {
    name: 'System Health',
    href: '/admin/system',
    icon: Activity,
    description: 'Monitor system performance',
    status: 'healthy',
    subItems: [
      { name: 'Performance', href: '/admin/system/performance', icon: TrendingUp },
      { name: 'Database', href: '/admin/system/database', icon: Database },
      { name: 'Servers', href: '/admin/system/servers', icon: Server },
      { name: 'Security', href: '/admin/system/security', icon: Shield },
    ]
  },
  {
    name: 'Analytics & Reports',
    href: '/admin/reports',
    icon: FileText,
    description: 'System reports and analytics',
    subItems: [
      { name: 'User Analytics', href: '/admin/reports/users', icon: Users },
      { name: 'System Reports', href: '/admin/reports/system', icon: BarChart3 },
      { name: 'Performance', href: '/admin/reports/performance', icon: TrendingUp },
      { name: 'Export Data', href: '/admin/reports/export', icon: FileText },
    ]
  },
  {
    name: 'Configuration',
    href: '/admin/settings',
    icon: Settings,
    description: 'System configuration',
    subItems: [
      { name: 'General Settings', href: '/admin/settings/general', icon: Settings },
      { name: 'Email Settings', href: '/admin/settings/email', icon: Bell },
      { name: 'Security Settings', href: '/admin/settings/security', icon: Lock },
      { name: 'API Configuration', href: '/admin/settings/api', icon: Globe },
    ]
  },
]

export default function AdminLayout({ children, user }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const { url } = usePage()

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-sm flex-col bg-white shadow-2xl">
          <div className="flex h-16 items-center justify-between px-6 bg-gradient-to-r from-purple-600 to-blue-600">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Admin Panel</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <AdminSidebarContent 
              menuItems={adminMenuItems} 
              currentUrl={url} 
              expandedItems={expandedItems}
              toggleExpanded={toggleExpanded}
            />
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white/80 backdrop-blur-lg border-r border-slate-200/60 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-purple-600 to-blue-600">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">Admin Panel</span>
                <div className="text-xs text-purple-100">System Administration</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-6 flex-grow flex flex-col px-4">
            <nav className="flex-1 space-y-2">
              <AdminSidebarContent 
                menuItems={adminMenuItems} 
                currentUrl={url} 
                expandedItems={expandedItems}
                toggleExpanded={toggleExpanded}
              />
            </nav>

            {/* User Info */}
            <div className="mt-auto pt-6 pb-4 border-t border-slate-200">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-xs text-purple-600 font-medium">Super Administrator</div>
                </div>
              </div>
              
              <Link
                href="/logout"
                method="post"
                as="button"
                className="mt-3 w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex-shrink-0 flex h-16 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 border-r border-slate-200 text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-6 flex justify-between items-center">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-white/50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Search users, facilities, reports..."
                  type="search"
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="ml-6 flex items-center gap-4">
              <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              
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

function AdminSidebarContent({ 
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
          <div key={item.name} className="space-y-1">
            <div
              onClick={hasSubItems ? () => toggleExpanded(item.name) : undefined}
              className={`group flex items-center justify-between px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}`} />
                <div className="flex-1">
                  {hasSubItems ? (
                    <span>{item.name}</span>
                  ) : (
                    <Link href={item.href} className="block">
                      {item.name}
                    </Link>
                  )}
                  {item.description && (
                    <div className={`text-xs mt-0.5 ${isActive ? 'text-purple-100' : 'text-slate-500'}`}>
                      {item.description}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.status && (
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === 'healthy' ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                )}
                {hasSubItems && (
                  <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Sub-items */}
            {hasSubItems && isExpanded && (
              <div className="ml-8 space-y-1">
                {item.subItems.map((subItem: any) => {
                  const isSubActive = currentUrl === subItem.href
                  return (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      className={`group flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                        isSubActive
                          ? 'bg-purple-100 text-purple-700 font-medium'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <subItem.icon className="h-4 w-4" />
                      {subItem.name}
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