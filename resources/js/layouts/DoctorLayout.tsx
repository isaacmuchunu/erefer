import React, { useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { 
  Users, FileText, Calendar, Heart, BarChart3, Settings, Bell, Search, Menu, X, User, LogOut,
  Stethoscope, Activity, ClipboardList, UserCheck, Plus, Clock, AlertTriangle, Star,
  Pill, TestTube, Microscope, Brain, Eye, Ear, ChevronRight, ChevronDown, Badge,
  MessageCircle, Phone, Video, BookOpen, Award, TrendingUp
} from 'lucide-react'
import { type User as UserType } from '@/types'

interface DoctorLayoutProps {
  children: React.ReactNode
  user: UserType
}

const doctorMenuItems = [
  {
    name: 'Clinical Dashboard',
    href: '/doctor/dashboard',
    icon: Stethoscope,
    description: 'Your clinical overview and daily summary',
    badge: '12 patients',
    badgeColor: 'bg-blue-100 text-blue-800',
    subItems: [
      { name: 'Today\'s Schedule', href: '/doctor/dashboard/schedule', icon: Clock, description: 'Your appointments and tasks for today', badge: '8 appointments' },
      { name: 'Patient Queue', href: '/doctor/dashboard/queue', icon: Users, description: 'Patients waiting for consultation', badge: '4 waiting' },
      { name: 'Urgent Cases', href: '/doctor/dashboard/urgent', icon: AlertTriangle, description: 'High priority patient cases', badge: '2 urgent' },
      { name: 'Clinical Notes', href: '/doctor/dashboard/notes', icon: FileText, description: 'Recent clinical documentation' },
    ]
  },
  {
    name: 'Patient Management',
    href: '/doctor/patients',
    icon: Users,
    description: 'Comprehensive patient care and records',
    badge: '147 patients',
    badgeColor: 'bg-green-100 text-green-800',
    subItems: [
      { name: 'All Patients', href: '/doctor/patients', icon: Users, description: 'View all assigned patients', badge: '147' },
      { name: 'Add Patient', href: '/doctor/patients/create', icon: Plus, description: 'Register new patient' },
      { name: 'Follow-up Required', href: '/doctor/patients/followup', icon: Clock, description: 'Patients needing follow-up', badge: '23' },
      { name: 'Chronic Care', href: '/doctor/patients/chronic', icon: Heart, description: 'Long-term care patients', badge: '45' },
      { name: 'Recent Admissions', href: '/doctor/patients/admissions', icon: UserCheck, description: 'Recently admitted patients' },
    ]
  },
  {
    name: 'Medical Records',
    href: '/doctor/records',
    icon: FileText,
    description: 'Electronic health records and documentation',
    badge: 'Updated',
    badgeColor: 'bg-purple-100 text-purple-800',
    subItems: [
      { name: 'Patient Records', href: '/doctor/records/patients', icon: FileText, description: 'Access patient medical histories' },
      { name: 'Lab Results', href: '/doctor/records/labs', icon: TestTube, description: 'Laboratory test results', badge: '12 new' },
      { name: 'Imaging Studies', href: '/doctor/records/imaging', icon: Eye, description: 'Radiology and imaging reports' },
      { name: 'Prescriptions', href: '/doctor/records/prescriptions', icon: Pill, description: 'Medication history and prescriptions' },
      { name: 'Clinical Templates', href: '/doctor/records/templates', icon: BookOpen, description: 'Medical documentation templates' },
    ]
  },
  {
    name: 'Referral System',
    href: '/doctor/referrals',
    icon: ClipboardList,
    description: 'Patient referrals and specialist consultations',
    badge: '8 pending',
    badgeColor: 'bg-orange-100 text-orange-800',
    subItems: [
      { name: 'Create Referral', href: '/doctor/referrals/create', icon: Plus, description: 'Refer patient to specialist' },
      { name: 'Outgoing Referrals', href: '/doctor/referrals/outgoing', icon: ClipboardList, description: 'Referrals you\'ve made', badge: '15' },
      { name: 'Incoming Referrals', href: '/doctor/referrals/incoming', icon: UserCheck, description: 'Patients referred to you', badge: '8' },
      { name: 'Referral History', href: '/doctor/referrals/history', icon: Clock, description: 'Complete referral history' },
      { name: 'Specialist Network', href: '/doctor/referrals/specialists', icon: Star, description: 'Available specialists and consultants' },
    ]
  },
  {
    name: 'Appointments',
    href: '/doctor/appointments',
    icon: Calendar,
    description: 'Schedule management and patient appointments',
    badge: 'Today: 8',
    badgeColor: 'bg-indigo-100 text-indigo-800',
    subItems: [
      { name: 'Today\'s Appointments', href: '/doctor/appointments/today', icon: Calendar, description: 'Your schedule for today', badge: '8' },
      { name: 'Schedule Appointment', href: '/doctor/appointments/create', icon: Plus, description: 'Book new appointment' },
      { name: 'Weekly View', href: '/doctor/appointments/week', icon: Calendar, description: 'Week schedule overview' },
      { name: 'Monthly View', href: '/doctor/appointments/month', icon: Calendar, description: 'Monthly calendar view' },
      { name: 'Appointment History', href: '/doctor/appointments/history', icon: Clock, description: 'Past appointments and notes' },
    ]
  },
  {
    name: 'Clinical Tools',
    href: '/doctor/tools',
    icon: Activity,
    description: 'Medical calculators and clinical decision support',
    subItems: [
      { name: 'Drug Interactions', href: '/doctor/tools/drugs', icon: Pill, description: 'Check medication interactions' },
      { name: 'Medical Calculator', href: '/doctor/tools/calculator', icon: Activity, description: 'Clinical calculators and tools' },
      { name: 'Diagnostic Support', href: '/doctor/tools/diagnosis', icon: Brain, description: 'Differential diagnosis aids' },
      { name: 'Guidelines', href: '/doctor/tools/guidelines', icon: BookOpen, description: 'Clinical practice guidelines' },
      { name: 'Lab Reference', href: '/doctor/tools/reference', icon: Microscope, description: 'Laboratory reference ranges' },
    ]
  },
  {
    name: 'Communication',
    href: '/doctor/communication',
    icon: MessageCircle,
    description: 'Secure messaging and consultation platform',
    badge: '5 new',
    badgeColor: 'bg-red-100 text-red-800',
    subItems: [
      { name: 'Messages', href: '/doctor/communication/messages', icon: MessageCircle, description: 'Secure messaging system', badge: '5' },
      { name: 'Consultations', href: '/doctor/communication/consultations', icon: Video, description: 'Virtual consultations' },
      { name: 'Team Chat', href: '/doctor/communication/team', icon: Users, description: 'Communicate with medical team' },
      { name: 'Patient Portal', href: '/doctor/communication/portal', icon: User, description: 'Patient communication portal' },
    ]
  },
  {
    name: 'Professional Development',
    href: '/doctor/development',
    icon: Award,
    description: 'Continuing education and professional growth',
    subItems: [
      { name: 'CME Credits', href: '/doctor/development/cme', icon: Award, description: 'Continuing medical education tracking' },
      { name: 'Medical Literature', href: '/doctor/development/literature', icon: BookOpen, description: 'Latest medical research' },
      { name: 'Training Modules', href: '/doctor/development/training', icon: Star, description: 'Online training and certification' },
      { name: 'Performance Analytics', href: '/doctor/development/analytics', icon: TrendingUp, description: 'Your clinical performance metrics' },
    ]
  },
]

export default function DoctorLayout({ children, user }: DoctorLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(['Clinical Dashboard'])
  const { url } = usePage()

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-sm flex-col bg-white shadow-2xl">
          <div className="flex h-16 items-center justify-between px-6 bg-gradient-to-r from-green-600 to-teal-600">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Medical Portal</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <DoctorSidebarContent 
              menuItems={doctorMenuItems} 
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
          <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-green-600 via-teal-600 to-blue-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">Medical Portal</span>
                <div className="text-xs text-green-100">Clinical Dashboard</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-4 border-b border-slate-200/60">
            <div className="grid grid-cols-2 gap-3">
              <Link href="/doctor/patients/create" className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <Plus className="h-4 w-4" />
                Add Patient
              </Link>
              <Link href="/doctor/referrals/create" className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <ClipboardList className="h-4 w-4" />
                New Referral
              </Link>
            </div>
          </div>

          {/* Doctor Status */}
          <div className="px-6 py-4 border-b border-slate-200/60">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Clinical Status</span>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Available
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Next appointment: 2:30 PM with Patient #12845
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-grow flex flex-col px-4 py-6 overflow-y-auto">
            <nav className="flex-1 space-y-2">
              <DoctorSidebarContent 
                menuItems={doctorMenuItems} 
                currentUrl={url} 
                expandedItems={expandedItems}
                toggleExpanded={toggleExpanded}
              />
            </nav>

            {/* User Info */}
            <div className="mt-auto pt-6 border-t border-slate-200/60">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-teal-50 border border-green-100">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    Dr. {user.first_name} {user.last_name}
                  </div>
                  <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <Stethoscope className="h-3 w-3" />
                    Medical Doctor
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
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/60 backdrop-blur-sm"
                  placeholder="Search patients, records, medications..."
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
              
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <MessageCircle className="h-5 w-5" />
              </button>
              
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Phone className="h-5 w-5" />
              </button>
              
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
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

function DoctorSidebarContent({ 
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
                    ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg transform scale-[1.02]'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.name}</div>
                  <div className={`text-xs truncate ${isActive ? 'text-green-100' : 'text-slate-500'}`}>
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
                          ? 'bg-green-50 text-green-700 border-l-2 border-green-500'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <subItem.icon className={`h-4 w-4 ${isSubActive ? 'text-green-500' : 'text-slate-400'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{subItem.name}</div>
                        <div className={`text-xs truncate ${isSubActive ? 'text-green-600' : 'text-slate-500'}`}>
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