import React, { useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { 
  Users, Building2, FileText, Truck, Stethoscope, UserPlus, 
  BarChart3, Settings, Bell, Search, Menu, X, User, LogOut,
  Shield, Activity, Calendar, Heart, Navigation, Phone
} from 'lucide-react'

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
  avatar?: string
}

interface DashboardLayoutProps {
  children: React.ReactNode
  user: User
}

const roleMenuItems = {
  super_admin: [
    { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Facilities', href: '/admin/facilities', icon: Building2 },
    { name: 'System Health', href: '/admin/system', icon: Activity },
    { name: 'Reports', href: '/admin/reports', icon: FileText },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ],
  doctor: [
    { name: 'Dashboard', href: '/doctor/dashboard', icon: BarChart3 },
    { name: 'My Referrals', href: '/doctor/referrals', icon: FileText },
    { name: 'Patients', href: '/doctor/patients', icon: Users },
    { name: 'Appointments', href: '/doctor/appointments', icon: Calendar },
    { name: 'Medical Records', href: '/doctor/records', icon: Heart },
    { name: 'Profile', href: '/doctor/profile', icon: User },
  ],
  nurse: [
    { name: 'Dashboard', href: '/nurse/dashboard', icon: BarChart3 },
    { name: 'Patient Care', href: '/nurse/patients', icon: Users },
    { name: 'Referrals', href: '/nurse/referrals', icon: FileText },
    { name: 'Care Plans', href: '/nurse/care-plans', icon: Heart },
    { name: 'Medications', href: '/nurse/medications', icon: UserPlus },
    { name: 'Schedule', href: '/nurse/schedule', icon: Calendar },
  ],
  dispatcher: [
    { name: 'Dashboard', href: '/dispatcher/dashboard', icon: BarChart3 },
    { name: 'Ambulances', href: '/dispatcher/ambulances', icon: Truck },
    { name: 'Emergency Calls', href: '/dispatcher/emergencies', icon: Phone },
    { name: 'Resource Allocation', href: '/dispatcher/resources', icon: Building2 },
    { name: 'Logistics', href: '/dispatcher/logistics', icon: Navigation },
    { name: 'Reports', href: '/dispatcher/reports', icon: FileText },
  ],
  ambulance_driver: [
    { name: 'Dashboard', href: '/driver/dashboard', icon: BarChart3 },
    { name: 'My Trips', href: '/driver/trips', icon: Truck },
    { name: 'Navigation', href: '/driver/navigation', icon: Navigation },
    { name: 'Patient Transport', href: '/driver/transport', icon: Users },
    { name: 'Vehicle Status', href: '/driver/vehicle', icon: Settings },
    { name: 'Schedule', href: '/driver/schedule', icon: Calendar },
  ],
  patient: [
    { name: 'Dashboard', href: '/patient/dashboard', icon: BarChart3 },
    { name: 'My Referrals', href: '/patient/referrals', icon: FileText },
    { name: 'Appointments', href: '/patient/appointments', icon: Calendar },
    { name: 'Medical History', href: '/patient/history', icon: Heart },
    { name: 'Health Records', href: '/patient/records', icon: User },
    { name: 'Profile', href: '/patient/profile', icon: Settings },
  ],
}

const roleColors = {
  super_admin: 'text-purple-600 bg-purple-100',
  doctor: 'text-green-600 bg-green-100',
  nurse: 'text-pink-600 bg-pink-100',
  dispatcher: 'text-indigo-600 bg-indigo-100',
  ambulance_driver: 'text-orange-600 bg-orange-100',
  patient: 'text-gray-600 bg-gray-100',
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { url } = usePage()
  
  const menuItems = roleMenuItems[user.role as keyof typeof roleMenuItems] || []
  const roleColor = roleColors[user.role as keyof typeof roleColors] || 'text-gray-600 bg-gray-100'

  return (
    <div className="min-h-screen bg-gray-50 cs_primary_font">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 cs_accent_color" />
              <span className="cs_fs_20 cs_bold cs_heading_color">eRefer</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 cs_radius_10">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 px-4 pb-4">
            <SidebarContent menuItems={menuItems} currentUrl={url} />
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Building2 className="h-8 w-8 cs_accent_color" />
            <span className="ml-2 cs_fs_20 cs_bold cs_heading_color">eRefer Kenya</span>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              <SidebarContent menuItems={menuItems} currentUrl={url} />
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#307BC4] lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    className="block w-full h-full pl-10 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent"
                    placeholder="Search..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6">
              <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#307BC4]">
                <Bell className="h-6 w-6" />
              </button>
              
              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 cs_radius_10 bg-gradient-to-br from-[#307BC4] to-[#274760] flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm cs_semibold cs_heading_color">{user.first_name} {user.last_name}</div>
                    <div className={`text-xs px-2 py-1 cs_radius_10 ${roleColor} inline-block`}>
                      {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ menuItems, currentUrl }: { menuItems: any[], currentUrl: string }) {
  return (
    <>
      {menuItems.map((item) => {
        const isActive = currentUrl.startsWith(item.href)
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`group flex items-center px-2 py-2 text-sm cs_medium cs_radius_10 transition-colors ${
              isActive
                ? 'bg-[#307BC4]/10 cs_accent_color'
                : 'cs_body_color hover:bg-gray-50 hover:cs_accent_color'
            }`}
          >
            <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'cs_accent_color' : 'cs_body_color group-hover:cs_accent_color'}`} />
            {item.name}
          </Link>
        )
      })}
      
      <div className="mt-8 pt-4 border-t border-gray-200">
        <Link
          href="/logout"
          method="post"
          as="button"
          className="group flex items-center px-2 py-2 text-sm cs_medium cs_radius_10 text-red-600 hover:bg-red-50 w-full text-left transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Link>
      </div>
    </>
  )
}
