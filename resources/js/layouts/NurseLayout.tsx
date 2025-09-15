import React, { useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { 
  Users, FileText, Calendar, Heart, BarChart3, Settings, Bell, Search, Menu, X, User, LogOut,
  UserPlus, Activity, ClipboardList, Clock, Plus, AlertTriangle, Thermometer,
  Pill, Syringe, Bandage, Stethoscope, Eye, Clipboard, ChevronRight, ChevronDown,
  Baby, Shield, Target, Zap, Bed, CheckCircle, MessageCircle, Phone, Smile
} from 'lucide-react'
import { type User as UserType } from '@/types'

interface NurseLayoutProps {
  children: React.ReactNode
  user: UserType
}

const nurseMenuItems = [
  {
    name: 'Patient Care Dashboard',
    href: '/nurse/dashboard',
    icon: Heart,
    description: 'Your patient care overview and assignments',
    badge: '24 patients',
    badgeColor: 'bg-pink-100 text-pink-800',
    subItems: [
      { name: 'My Assignments', href: '/nurse/dashboard/assignments', icon: Users, description: 'Your assigned patients today', badge: '24' },
      { name: 'Care Tasks', href: '/nurse/dashboard/tasks', icon: CheckCircle, description: 'Nursing tasks and reminders', badge: '12 pending' },
      { name: 'Vital Signs Due', href: '/nurse/dashboard/vitals', icon: Thermometer, description: 'Patients needing vital checks', badge: '8 due' },
      { name: 'Urgent Alerts', href: '/nurse/dashboard/alerts', icon: AlertTriangle, description: 'Critical patient alerts', badge: '3 urgent' },
    ]
  },
  {
    name: 'Patient Care',
    href: '/nurse/patients',
    icon: Users,
    description: 'Comprehensive patient care management',
    badge: '24 active',
    badgeColor: 'bg-blue-100 text-blue-800',
    subItems: [
      { name: 'My Patients', href: '/nurse/patients', icon: Users, description: 'All patients under your care', badge: '24' },
      { name: 'Admit Patient', href: '/nurse/patients/admit', icon: Plus, description: 'Admit new patient to ward' },
      { name: 'Patient Assessments', href: '/nurse/patients/assessments', icon: Clipboard, description: 'Nursing assessments and evaluations' },
      { name: 'Discharge Planning', href: '/nurse/patients/discharge', icon: UserPlus, description: 'Prepare patients for discharge', badge: '5 ready' },
      { name: 'Ward Overview', href: '/nurse/patients/ward', icon: Bed, description: 'Complete ward status and occupancy' },
    ]
  },
  {
    name: 'Medication Management',
    href: '/nurse/medications',
    icon: Pill,
    description: 'Medication administration and tracking',
    badge: '18 due',
    badgeColor: 'bg-green-100 text-green-800',
    subItems: [
      { name: 'Medication Rounds', href: '/nurse/medications/rounds', icon: Clock, description: 'Scheduled medication administration', badge: '18 due' },
      { name: 'PRN Medications', href: '/nurse/medications/prn', icon: Pill, description: 'As-needed medication tracking' },
      { name: 'IV Management', href: '/nurse/medications/iv', icon: Syringe, description: 'Intravenous therapy monitoring', badge: '6 active' },
      { name: 'Medication Errors', href: '/nurse/medications/errors', icon: AlertTriangle, description: 'Report and track medication errors' },
      { name: 'Drug Reference', href: '/nurse/medications/reference', icon: FileText, description: 'Medication information and interactions' },
    ]
  },
  {
    name: 'Clinical Documentation',
    href: '/nurse/documentation',
    icon: FileText,
    description: 'Nursing notes and clinical documentation',
    badge: '6 pending',
    badgeColor: 'bg-purple-100 text-purple-800',
    subItems: [
      { name: 'Nursing Notes', href: '/nurse/documentation/notes', icon: FileText, description: 'Patient care documentation', badge: '6 pending' },
      { name: 'Care Plans', href: '/nurse/documentation/careplans', icon: Target, description: 'Individual patient care plans' },
      { name: 'Progress Notes', href: '/nurse/documentation/progress', icon: TrendingUp, description: 'Patient progress documentation' },
      { name: 'Incident Reports', href: '/nurse/documentation/incidents', icon: AlertTriangle, description: 'Safety incident reporting' },
      { name: 'Templates', href: '/nurse/documentation/templates', icon: Clipboard, description: 'Nursing documentation templates' },
    ]
  },
  {
    name: 'Vital Signs & Monitoring',
    href: '/nurse/vitals',
    icon: Thermometer,
    description: 'Patient monitoring and vital sign tracking',
    badge: '8 overdue',
    badgeColor: 'bg-red-100 text-red-800',
    subItems: [
      { name: 'Vital Signs Entry', href: '/nurse/vitals/entry', icon: Thermometer, description: 'Record patient vital signs' },
      { name: 'Monitoring Schedule', href: '/nurse/vitals/schedule', icon: Clock, description: 'Vital sign monitoring schedule', badge: '8 due' },
      { name: 'Critical Values', href: '/nurse/vitals/critical', icon: AlertTriangle, description: 'Abnormal vital sign alerts' },
      { name: 'Trending Charts', href: '/nurse/vitals/trends', icon: Activity, description: 'Vital sign trends and graphs' },
      { name: 'Monitoring Devices', href: '/nurse/vitals/devices', icon: Eye, description: 'Connected monitoring equipment' },
    ]
  },
  {
    name: 'Wound Care',
    href: '/nurse/wounds',
    icon: Bandage,
    description: 'Wound assessment and care management',
    badge: '12 active',
    badgeColor: 'bg-orange-100 text-orange-800',
    subItems: [
      { name: 'Active Wounds', href: '/nurse/wounds/active', icon: Bandage, description: 'Current wounds requiring care', badge: '12' },
      { name: 'Wound Assessment', href: '/nurse/wounds/assessment', icon: Eye, description: 'Comprehensive wound evaluation' },
      { name: 'Dressing Changes', href: '/nurse/wounds/dressings', icon: Clock, description: 'Scheduled dressing changes', badge: '5 due' },
      { name: 'Healing Progress', href: '/nurse/wounds/progress', icon: TrendingUp, description: 'Wound healing documentation' },
      { name: 'Supplies Inventory', href: '/nurse/wounds/supplies', icon: Plus, description: 'Wound care supplies management' },
    ]
  },
  {
    name: 'Schedule & Assignments',
    href: '/nurse/schedule',
    icon: Calendar,
    description: 'Work schedule and patient assignments',
    badge: 'Day Shift',
    badgeColor: 'bg-indigo-100 text-indigo-800',
    subItems: [
      { name: 'My Schedule', href: '/nurse/schedule/mine', icon: Calendar, description: 'Your work schedule and shifts' },
      { name: 'Shift Handoff', href: '/nurse/schedule/handoff', icon: Users, description: 'Shift change communication' },
      { name: 'Patient Assignments', href: '/nurse/schedule/assignments', icon: ClipboardList, description: 'Daily patient assignments' },
      { name: 'Coverage Requests', href: '/nurse/schedule/coverage', icon: MessageCircle, description: 'Request shift coverage' },
      { name: 'Time Tracking', href: '/nurse/schedule/time', icon: Clock, description: 'Track work hours and breaks' },
    ]
  },
  {
    name: 'Communication',
    href: '/nurse/communication',
    icon: MessageCircle,
    description: 'Team communication and collaboration',
    badge: '7 new',
    badgeColor: 'bg-teal-100 text-teal-800',
    subItems: [
      { name: 'Team Messages', href: '/nurse/communication/team', icon: MessageCircle, description: 'Nursing team communication', badge: '7' },
      { name: 'Doctor Consults', href: '/nurse/communication/doctors', icon: Stethoscope, description: 'Physician consultations' },
      { name: 'Family Updates', href: '/nurse/communication/family', icon: Users, description: 'Patient family communication' },
      { name: 'Emergency Calls', href: '/nurse/communication/emergency', icon: Phone, description: 'Emergency communication system' },
      { name: 'Announcements', href: '/nurse/communication/announcements', icon: Bell, description: 'Unit announcements and updates' },
    ]
  },
  {
    name: 'Professional Development',
    href: '/nurse/development',
    icon: Shield,
    description: 'Continuing education and skill development',
    subItems: [
      { name: 'Learning Modules', href: '/nurse/development/learning', icon: FileText, description: 'Nursing education modules' },
      { name: 'Certifications', href: '/nurse/development/certifications', icon: Shield, description: 'Professional certifications tracking' },
      { name: 'Competency Tracking', href: '/nurse/development/competency', icon: CheckCircle, description: 'Clinical competency assessments' },
      { name: 'Skills Assessment', href: '/nurse/development/skills', icon: Target, description: 'Nursing skills evaluation' },
    ]
  },
]

export default function NurseLayout({ children, user }: NurseLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(['Patient Care Dashboard'])
  const { url } = usePage()

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-sm flex-col bg-white shadow-2xl">
          <div className="flex h-16 items-center justify-between px-6 bg-gradient-to-r from-pink-600 to-purple-600">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Nursing Care</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <NurseSidebarContent 
              menuItems={nurseMenuItems} 
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
          <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">Nursing Care</span>
                <div className="text-xs text-pink-100">Patient Care Dashboard</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-4 border-b border-slate-200/60">
            <div className="grid grid-cols-2 gap-3">
              <Link href="/nurse/vitals/entry" className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors">
                <Thermometer className="h-4 w-4" />
                Record Vitals
              </Link>
              <Link href="/nurse/medications/rounds" className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <Pill className="h-4 w-4" />
                Med Rounds
              </Link>
            </div>
          </div>

          {/* Nurse Status */}
          <div className="px-6 py-4 border-b border-slate-200/60">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Shift Status</span>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                On Duty
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Day Shift: 7:00 AM - 7:00 PM • 24 patients assigned
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-grow flex flex-col px-4 py-6 overflow-y-auto">
            <nav className="flex-1 space-y-2">
              <NurseSidebarContent 
                menuItems={nurseMenuItems} 
                currentUrl={url} 
                expandedItems={expandedItems}
                toggleExpanded={toggleExpanded}
              />
            </nav>

            {/* User Info */}
            <div className="mt-auto pt-6 border-t border-slate-200/60">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {user.first_name} {user.last_name}, RN
                  </div>
                  <div className="text-xs text-pink-600 font-medium flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    Registered Nurse
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
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/60 backdrop-blur-sm"
                  placeholder="Search patients, medications, care plans..."
                  type="search"
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="ml-6 flex items-center gap-4">
              <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  8
                </span>
              </button>
              
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <MessageCircle className="h-5 w-5" />
              </button>
              
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <AlertTriangle className="h-5 w-5" />
              </button>
              
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
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

function NurseSidebarContent({ 
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
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg transform scale-[1.02]'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.name}</div>
                  <div className={`text-xs truncate ${isActive ? 'text-pink-100' : 'text-slate-500'}`}>
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
                          ? 'bg-pink-50 text-pink-700 border-l-2 border-pink-500'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <subItem.icon className={`h-4 w-4 ${isSubActive ? 'text-pink-500' : 'text-slate-400'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{subItem.name}</div>
                        <div className={`text-xs truncate ${isSubActive ? 'text-pink-600' : 'text-slate-500'}`}>
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