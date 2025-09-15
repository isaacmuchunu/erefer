import React, { useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { 
  Building2, Users, BarChart3, Settings, Bell, Search, Menu, X, User, LogOut,
  Activity, FileText, Calendar, Shield, Plus, TrendingUp, AlertTriangle,
  Stethoscope, UserCheck, Bed, MonitorSpeaker, Package, DollarSign,
  ChevronRight, ChevronDown, Clock, Award, Target, Zap, Crown
} from 'lucide-react'
import { type User as UserType } from '@/types'

interface HospitalAdminLayoutProps {
  children: React.ReactNode
  user: UserType
}

const hospitalAdminMenuItems = [
  {
    name: 'Facility Dashboard',
    href: '/hospital-admin/dashboard',
    icon: Building2,
    description: 'Hospital overview and management center',
    badge: 'Active',
    badgeColor: 'bg-blue-100 text-blue-800',
    subItems: [
      { name: 'Hospital Overview', href: '/hospital-admin/dashboard', icon: Building2, description: 'Overall facility status' },
      { name: 'Occupancy Status', href: '/hospital-admin/dashboard/occupancy', icon: Bed, description: 'Bed and room availability', badge: '85% occupied' },
      { name: 'Daily Operations', href: '/hospital-admin/dashboard/operations', icon: Activity, description: 'Current operational status' },
      { name: 'Key Metrics', href: '/hospital-admin/dashboard/metrics', icon: BarChart3, description: 'Performance indicators' },
    ]
  },
  {
    name: 'Staff Management',
    href: '/hospital-admin/staff',
    icon: Users,
    description: 'Healthcare personnel administration',
    badge: '247 staff',
    badgeColor: 'bg-green-100 text-green-800',
    subItems: [
      { name: 'All Staff', href: '/hospital-admin/staff', icon: Users, description: 'Complete staff directory', badge: '247' },
      { name: 'Add Staff Member', href: '/hospital-admin/staff/create', icon: Plus, description: 'Register new staff' },
      { name: 'Doctors', href: '/hospital-admin/staff/doctors', icon: Stethoscope, description: 'Medical doctors and specialists', badge: '45' },
      { name: 'Nurses', href: '/hospital-admin/staff/nurses', icon: UserCheck, description: 'Nursing staff', badge: '125' },
      { name: 'Support Staff', href: '/hospital-admin/staff/support', icon: Users, description: 'Administrative and support personnel' },
    ]
  },
  {
    name: 'Department Management',
    href: '/hospital-admin/departments',
    icon: Building2,
    description: 'Hospital department oversight',
    badge: '12 depts',
    badgeColor: 'bg-purple-100 text-purple-800',
    subItems: [
      { name: 'All Departments', href: '/hospital-admin/departments', icon: Building2, description: 'Hospital departments overview', badge: '12' },
      { name: 'Emergency Department', href: '/hospital-admin/departments/emergency', icon: AlertTriangle, description: 'Emergency services management' },
      { name: 'Intensive Care', href: '/hospital-admin/departments/icu', icon: Activity, description: 'ICU and critical care units' },
      { name: 'Operating Theaters', href: '/hospital-admin/departments/surgery', icon: Stethoscope, description: 'Surgical department management' },
      { name: 'Outpatient Services', href: '/hospital-admin/departments/outpatient', icon: Calendar, description: 'Outpatient clinics and services' },
    ]
  },
  {
    name: 'Resource Management',
    href: '/hospital-admin/resources',
    icon: Package,
    description: 'Hospital resources and inventory',
    badge: 'In Stock',
    badgeColor: 'bg-green-100 text-green-800',
    subItems: [
      { name: 'Medical Equipment', href: '/hospital-admin/resources/equipment', icon: MonitorSpeaker, description: 'Medical equipment inventory' },
      { name: 'Bed Management', href: '/hospital-admin/resources/beds', icon: Bed, description: 'Hospital bed allocation', badge: '342 beds' },
      { name: 'Supply Inventory', href: '/hospital-admin/resources/supplies', icon: Package, description: 'Medical supplies and materials' },
      { name: 'Procurement', href: '/hospital-admin/resources/procurement', icon: DollarSign, description: 'Purchase orders and procurement' },
      { name: 'Asset Tracking', href: '/hospital-admin/resources/assets', icon: BarChart3, description: 'Hospital asset management' },
    ]
  },
  {
    name: 'Quality & Compliance',
    href: '/hospital-admin/quality',
    icon: Shield,
    description: 'Quality assurance and regulatory compliance',
    badge: 'Compliant',
    badgeColor: 'bg-green-100 text-green-800',
    subItems: [
      { name: 'Quality Metrics', href: '/hospital-admin/quality/metrics', icon: Target, description: 'Quality performance indicators' },
      { name: 'Compliance Status', href: '/hospital-admin/quality/compliance', icon: Shield, description: 'Regulatory compliance tracking' },
      { name: 'Incident Reports', href: '/hospital-admin/quality/incidents', icon: AlertTriangle, description: 'Safety and quality incidents' },
      { name: 'Accreditation', href: '/hospital-admin/quality/accreditation', icon: Award, description: 'Hospital accreditation status' },
      { name: 'Audit Trail', href: '/hospital-admin/quality/audit', icon: FileText, description: 'Quality audit documentation' },
    ]
  },
  {
    name: 'Financial Management',
    href: '/hospital-admin/finance',
    icon: DollarSign,
    description: 'Financial oversight and budget management',
    badge: 'Budget OK',
    badgeColor: 'bg-blue-100 text-blue-800',
    subItems: [
      { name: 'Financial Dashboard', href: '/hospital-admin/finance/dashboard', icon: BarChart3, description: 'Financial performance overview' },
      { name: 'Budget Management', href: '/hospital-admin/finance/budget', icon: DollarSign, description: 'Department budget allocation' },
      { name: 'Revenue Tracking', href: '/hospital-admin/finance/revenue', icon: TrendingUp, description: 'Revenue and billing analytics' },
      { name: 'Cost Analysis', href: '/hospital-admin/finance/costs', icon: BarChart3, description: 'Operational cost breakdown' },
      { name: 'Financial Reports', href: '/hospital-admin/finance/reports', icon: FileText, description: 'Financial reporting and analytics' },
    ]
  },
  {
    name: 'Patient Services',
    href: '/hospital-admin/patients',
    icon: UserCheck,
    description: 'Patient care and service management',
    badge: '1,240 active',
    badgeColor: 'bg-teal-100 text-teal-800',
    subItems: [
      { name: 'Patient Overview', href: '/hospital-admin/patients', icon: UserCheck, description: 'Active patient status', badge: '1,240' },
      { name: 'Admission Management', href: '/hospital-admin/patients/admissions', icon: Plus, description: 'Patient admission processes' },
      { name: 'Discharge Planning', href: '/hospital-admin/patients/discharge', icon: Calendar, description: 'Discharge coordination' },
      { name: 'Patient Satisfaction', href: '/hospital-admin/patients/satisfaction', icon: Award, description: 'Patient feedback and satisfaction' },
      { name: 'Service Quality', href: '/hospital-admin/patients/quality', icon: Target, description: 'Patient care quality metrics' },
    ]
  },
  {
    name: 'Reports & Analytics',
    href: '/hospital-admin/reports',
    icon: FileText,
    description: 'Hospital performance and analytics',
    badge: 'Updated',
    badgeColor: 'bg-purple-100 text-purple-800',
    subItems: [
      { name: 'Executive Reports', href: '/hospital-admin/reports/executive', icon: Crown, description: 'High-level executive summaries' },
      { name: 'Operational Reports', href: '/hospital-admin/reports/operations', icon: Activity, description: 'Operational performance reports' },
      { name: 'Financial Reports', href: '/hospital-admin/reports/financial', icon: DollarSign, description: 'Financial performance analysis' },
      { name: 'Quality Reports', href: '/hospital-admin/reports/quality', icon: Shield, description: 'Quality and safety reports' },
      { name: 'Custom Analytics', href: '/hospital-admin/reports/custom', icon: BarChart3, description: 'Custom reporting and analytics' },
    ]
  },
]

export default function HospitalAdminLayout({ children, user }: HospitalAdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(['Facility Dashboard'])
  const { url } = usePage()

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-sm flex-col bg-white shadow-2xl">
          <div className="flex h-16 items-center justify-between px-6 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Hospital Admin</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <HospitalAdminSidebarContent 
              menuItems={hospitalAdminMenuItems} 
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
          <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">Hospital Admin</span>
                <div className="text-xs text-blue-100">Facility Management</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-4 border-b border-slate-200/60">
            <div className="grid grid-cols-2 gap-3">
              <Link href="/hospital-admin/staff/create" className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <Plus className="h-4 w-4" />
                Add Staff
              </Link>
              <Link href="/hospital-admin/reports/executive" className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <FileText className="h-4 w-4" />
                Reports
              </Link>
            </div>
          </div>

          {/* Hospital Status */}
          <div className="px-6 py-4 border-b border-slate-200/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">Hospital Status</span>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Operational
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-slate-600">
                <div className="font-medium">Occupancy</div>
                <div className="text-blue-600">85% (290/342)</div>
              </div>
              <div className="text-slate-600">
                <div className="font-medium">Staff</div>
                <div className="text-green-600">247 on duty</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-grow flex flex-col px-4 py-6 overflow-y-auto">
            <nav className="flex-1 space-y-2">
              <HospitalAdminSidebarContent 
                menuItems={hospitalAdminMenuItems} 
                currentUrl={url} 
                expandedItems={expandedItems}
                toggleExpanded={toggleExpanded}
              />
            </nav>

            {/* User Info */}
            <div className="mt-auto pt-6 border-t border-slate-200/60">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-xs text-blue-600 font-medium flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    Hospital Administrator
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
                  placeholder="Search staff, departments, resources..."
                  type="search"
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="ml-6 flex items-center gap-4">
              <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  4
                </span>
              </button>
              
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
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

function HospitalAdminSidebarContent({ 
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