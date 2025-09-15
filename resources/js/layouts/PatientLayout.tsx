import React, { useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { 
  User, Calendar, Heart, FileText, BarChart3, Settings, Bell, Search, Menu, X, LogOut,
  Activity, Clock, Pill, UserCheck, MessageCircle, Phone, Smile, Shield,
  Stethoscope, TestTube, Eye, ChevronRight, ChevronDown, Plus, Star,
  Thermometer, Clipboard, AlertTriangle, BookOpen, Baby, Target
} from 'lucide-react'
import { type User as UserType } from '@/types'

interface PatientLayoutProps {
  children: React.ReactNode
  user: UserType
}

const patientMenuItems = [
  {
    name: 'My Health Dashboard',
    href: '/patient/dashboard',
    icon: Heart,
    description: 'Your personal health overview and summary',
    badge: 'Healthy',
    badgeColor: 'bg-green-100 text-green-800',
    subItems: [
      { name: 'Health Summary', href: '/patient/dashboard', icon: Heart, description: 'Your overall health status' },
      { name: 'Recent Activity', href: '/patient/dashboard/activity', icon: Activity, description: 'Recent medical activities' },
      { name: 'Health Alerts', href: '/patient/dashboard/alerts', icon: AlertTriangle, description: 'Important health notifications' },
      { name: 'Quick Actions', href: '/patient/dashboard/actions', icon: Plus, description: 'Common tasks and shortcuts' },
    ]
  },
  {
    name: 'My Medical Records',
    href: '/patient/records',
    icon: FileText,
    description: 'Complete medical history and documentation',
    badge: 'Updated',
    badgeColor: 'bg-blue-100 text-blue-800',
    subItems: [
      { name: 'Medical History', href: '/patient/records/history', icon: FileText, description: 'Your complete medical history' },
      { name: 'Lab Results', href: '/patient/records/labs', icon: TestTube, description: 'Laboratory test results', badge: '2 new' },
      { name: 'Imaging Results', href: '/patient/records/imaging', icon: Eye, description: 'X-rays, MRI, and other scans' },
      { name: 'Prescriptions', href: '/patient/records/prescriptions', icon: Pill, description: 'Current and past medications' },
      { name: 'Allergies & Conditions', href: '/patient/records/conditions', icon: AlertTriangle, description: 'Medical conditions and allergies' },
    ]
  },
  {
    name: 'Appointments',
    href: '/patient/appointments',
    icon: Calendar,
    description: 'Schedule and manage your medical appointments',
    badge: 'Next: Today',
    badgeColor: 'bg-purple-100 text-purple-800',
    subItems: [
      { name: 'Upcoming Appointments', href: '/patient/appointments/upcoming', icon: Calendar, description: 'Your scheduled appointments' },
      { name: 'Book Appointment', href: '/patient/appointments/book', icon: Plus, description: 'Schedule a new appointment' },
      { name: 'Appointment History', href: '/patient/appointments/history', icon: Clock, description: 'Past appointment records' },
      { name: 'Video Consultations', href: '/patient/appointments/telehealth', icon: Phone, description: 'Virtual doctor visits' },
      { name: 'Appointment Reminders', href: '/patient/appointments/reminders', icon: Bell, description: 'Manage appointment notifications' },
    ]
  },
  {
    name: 'My Referrals',
    href: '/patient/referrals',
    icon: UserCheck,
    description: 'Specialist referrals and care coordination',
    badge: '1 pending',
    badgeColor: 'bg-orange-100 text-orange-800',
    subItems: [
      { name: 'Active Referrals', href: '/patient/referrals/active', icon: UserCheck, description: 'Current specialist referrals', badge: '1' },
      { name: 'Referral History', href: '/patient/referrals/history', icon: Clock, description: 'Past referral records' },
      { name: 'Specialist Directory', href: '/patient/referrals/specialists', icon: Stethoscope, description: 'Find specialist doctors' },
      { name: 'Referral Status', href: '/patient/referrals/status', icon: Activity, description: 'Track referral progress' },
    ]
  },
  {
    name: 'Health Monitoring',
    href: '/patient/monitoring',
    icon: Activity,
    description: 'Track your vital signs and health metrics',
    badge: 'Track Daily',
    badgeColor: 'bg-teal-100 text-teal-800',
    subItems: [
      { name: 'Vital Signs', href: '/patient/monitoring/vitals', icon: Thermometer, description: 'Blood pressure, heart rate, etc.' },
      { name: 'Symptom Tracker', href: '/patient/monitoring/symptoms', icon: Clipboard, description: 'Log symptoms and feelings' },
      { name: 'Medication Tracker', href: '/patient/monitoring/medications', icon: Pill, description: 'Track medication adherence' },
      { name: 'Health Goals', href: '/patient/monitoring/goals', icon: Target, description: 'Set and track health goals' },
      { name: 'Progress Reports', href: '/patient/monitoring/reports', icon: BarChart3, description: 'Health progress analytics' },
    ]
  },
  {
    name: 'Medications',
    href: '/patient/medications',
    icon: Pill,
    description: 'Manage your medications and prescriptions',
    badge: '3 active',
    badgeColor: 'bg-green-100 text-green-800',
    subItems: [
      { name: 'Current Medications', href: '/patient/medications/current', icon: Pill, description: 'Your active prescriptions', badge: '3' },
      { name: 'Medication Schedule', href: '/patient/medications/schedule', icon: Clock, description: 'Daily medication reminders' },
      { name: 'Prescription Refills', href: '/patient/medications/refills', icon: Plus, description: 'Request prescription refills' },
      { name: 'Medication History', href: '/patient/medications/history', icon: FileText, description: 'Past medications and dosages' },
      { name: 'Drug Information', href: '/patient/medications/info', icon: BookOpen, description: 'Learn about your medications' },
    ]
  },
  {
    name: 'Communication',
    href: '/patient/communication',
    icon: MessageCircle,
    description: 'Secure messaging with your healthcare team',
    badge: '2 new',
    badgeColor: 'bg-blue-100 text-blue-800',
    subItems: [
      { name: 'Messages', href: '/patient/communication/messages', icon: MessageCircle, description: 'Secure messaging with doctors', badge: '2' },
      { name: 'Care Team', href: '/patient/communication/team', icon: Stethoscope, description: 'Your healthcare providers' },
      { name: 'Ask a Question', href: '/patient/communication/questions', icon: Plus, description: 'Send questions to your doctor' },
      { name: 'Emergency Contact', href: '/patient/communication/emergency', icon: Phone, description: 'Emergency contact information' },
      { name: 'Family Access', href: '/patient/communication/family', icon: User, description: 'Share access with family members' },
    ]
  },
  {
    name: 'Health Education',
    href: '/patient/education',
    icon: BookOpen,
    description: 'Health resources and educational materials',
    subItems: [
      { name: 'Health Library', href: '/patient/education/library', icon: BookOpen, description: 'Medical information and articles' },
      { name: 'Condition Guides', href: '/patient/education/conditions', icon: Heart, description: 'Learn about your conditions' },
      { name: 'Wellness Tips', href: '/patient/education/wellness', icon: Smile, description: 'Health and wellness advice' },
      { name: 'Video Resources', href: '/patient/education/videos', icon: Eye, description: 'Educational videos and tutorials' },
    ]
  },
  {
    name: 'My Profile',
    href: '/patient/profile',
    icon: User,
    description: 'Personal information and account settings',
    subItems: [
      { name: 'Personal Info', href: '/patient/profile/personal', icon: User, description: 'Update your personal information' },
      { name: 'Insurance Information', href: '/patient/profile/insurance', icon: Shield, description: 'Insurance and coverage details' },
      { name: 'Emergency Contacts', href: '/patient/profile/emergency', icon: Phone, description: 'Emergency contact information' },
      { name: 'Privacy Settings', href: '/patient/profile/privacy', icon: Shield, description: 'Privacy and sharing preferences' },
      { name: 'Account Settings', href: '/patient/profile/settings', icon: Settings, description: 'Account and notification settings' },
    ]
  },
]

export default function PatientLayout({ children, user }: PatientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(['My Health Dashboard'])
  const { url } = usePage()

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-sm flex-col bg-white shadow-2xl">
          <div className="flex h-16 items-center justify-between px-6 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">My Health Portal</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <PatientSidebarContent 
              menuItems={patientMenuItems} 
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
          <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">My Health Portal</span>
                <div className="text-xs text-blue-100">Personal Health Dashboard</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-4 border-b border-slate-200/60">
            <div className="grid grid-cols-2 gap-3">
              <Link href="/patient/appointments/book" className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <Plus className="h-4 w-4" />
                Book Appointment
              </Link>
              <Link href="/patient/communication/messages" className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <MessageCircle className="h-4 w-4" />
                Message Doctor
              </Link>
            </div>
          </div>

          {/* Health Status */}
          <div className="px-6 py-4 border-b border-slate-200/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">Health Status</span>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Good Health
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-slate-600">
                <div className="font-medium">Next Appointment</div>
                <div className="text-blue-600">Today, 2:30 PM</div>
              </div>
              <div className="text-slate-600">
                <div className="font-medium">Messages</div>
                <div className="text-purple-600">2 new</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-grow flex flex-col px-4 py-6 overflow-y-auto">
            <nav className="flex-1 space-y-2">
              <PatientSidebarContent 
                menuItems={patientMenuItems} 
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
                    <Heart className="h-3 w-3" />
                    Patient
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
                  placeholder="Search health records, appointments..."
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
                <Heart className="h-5 w-5" />
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

function PatientSidebarContent({ 
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