import React, { useState, useEffect } from 'react'
import { Head, Link } from '@inertiajs/react'
import SuperAdminLayout from '@/layouts/SuperAdminLayout'
import { 
  Users, 
  UserPlus, 
  Shield, 
  Settings, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Clock, 
  MapPin, 
  Smartphone, 
  Monitor, 
  Globe, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Key, 
  Mail, 
  Phone, 
  Calendar, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Plus,
  Minus,
  Star,
  Flag,
  Building2,
  Stethoscope,
  Truck,
  Heart,
  Brain,
  FileText,
  Database,
  Zap,
  Target,
  BarChart3,
  PieChart,
  Layers,
  UserCheck,
  UserX,
  Crown,
  Award,
  Briefcase
} from 'lucide-react'

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  role: {
    id: number
    name: string
    display_name: string
    level: number
    color: string
    icon: string
  }
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  last_login?: string
  created_at: string
  updated_at: string
  profile_picture?: string
  department?: string
  facility?: {
    id: number
    name: string
  }
  permissions: string[]
  security: {
    two_factor_enabled: boolean
    password_expires_at?: string
    failed_login_attempts: number
    locked_until?: string
    last_password_change?: string
  }
  activity: {
    total_logins: number
    last_activity?: string
    current_sessions: number
    devices: Array<{
      type: string
      last_used: string
      location: string
    }>
  }
  performance_metrics?: {
    patients_treated?: number
    satisfaction_score?: number
    response_time?: number
    completion_rate?: number
  }
}

interface Role {
  id: number
  name: string
  display_name: string
  description: string
  level: number
  color: string
  icon: string
  permissions: string[]
  users_count: number
  created_at: string
  is_system_role: boolean
}

interface Permission {
  id: number
  name: string
  display_name: string
  category: string
  description: string
  is_dangerous: boolean
}

interface UserManagementDashboardProps {
  user: any
  users: User[]
  roles: Role[]
  permissions: Permission[]
  stats: {
    total_users: number
    active_users: number
    inactive_users: number
    suspended_users: number
    new_users_today: number
    users_by_role: Record<string, number>
    security_stats: {
      users_with_2fa: number
      expired_passwords: number
      locked_accounts: number
      suspicious_activities: number
    }
    activity_stats: {
      daily_logins: Array<{ date: string; logins: number }>
      top_active_users: Array<{ user: string; activity_score: number }>
      device_breakdown: Array<{ device: string; count: number }>
    }
  }
}

export default function UserManagementDashboard({ 
  user, 
  users: initialUsers, 
  roles, 
  permissions, 
  stats 
}: UserManagementDashboardProps) {
  const [users, setUsers] = useState(initialUsers)
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'last_login' | 'created_at'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [showInactive, setShowInactive] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Mock data for demonstration
  const mockUsers: User[] = [
    {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@hospital.com',
      phone: '+254712345678',
      role: {
        id: 1,
        name: 'super_admin',
        display_name: 'Super Administrator',
        level: 100,
        color: 'purple',
        icon: 'crown'
      },
      status: 'active',
      last_login: '2024-01-15T14:30:00Z',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2024-01-15T14:30:00Z',
      department: 'Administration',
      facility: { id: 1, name: 'Kenyatta National Hospital' },
      permissions: ['users.create', 'users.edit', 'users.delete', 'system.settings'],
      security: {
        two_factor_enabled: true,
        password_expires_at: '2024-04-15T00:00:00Z',
        failed_login_attempts: 0,
        last_password_change: '2024-01-01T00:00:00Z'
      },
      activity: {
        total_logins: 1250,
        last_activity: '2024-01-15T14:30:00Z',
        current_sessions: 2,
        devices: [
          { type: 'desktop', last_used: '2024-01-15T14:30:00Z', location: 'Nairobi, Kenya' },
          { type: 'mobile', last_used: '2024-01-15T10:15:00Z', location: 'Nairobi, Kenya' }
        ]
      }
    },
    {
      id: 2,
      first_name: 'Dr. Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@hospital.com',
      phone: '+254723456789',
      role: {
        id: 2,
        name: 'doctor',
        display_name: 'Doctor',
        level: 60,
        color: 'green',
        icon: 'stethoscope'
      },
      status: 'active',
      last_login: '2024-01-15T13:45:00Z',
      created_at: '2023-03-15T00:00:00Z',
      updated_at: '2024-01-15T13:45:00Z',
      department: 'Cardiology',
      facility: { id: 1, name: 'Kenyatta National Hospital' },
      permissions: ['patients.view', 'patients.edit', 'referrals.create'],
      security: {
        two_factor_enabled: true,
        password_expires_at: '2024-03-15T00:00:00Z',
        failed_login_attempts: 0,
        last_password_change: '2023-12-01T00:00:00Z'
      },
      activity: {
        total_logins: 890,
        last_activity: '2024-01-15T13:45:00Z',
        current_sessions: 1,
        devices: [
          { type: 'mobile', last_used: '2024-01-15T13:45:00Z', location: 'Nairobi, Kenya' }
        ]
      },
      performance_metrics: {
        patients_treated: 156,
        satisfaction_score: 96.8,
        response_time: 8.5,
        completion_rate: 94.2
      }
    },
    {
      id: 3,
      first_name: 'Nurse Mary',
      last_name: 'Wanjiku',
      email: 'mary.wanjiku@hospital.com',
      phone: '+254734567890',
      role: {
        id: 3,
        name: 'nurse',
        display_name: 'Nurse',
        level: 50,
        color: 'pink',
        icon: 'heart'
      },
      status: 'active',
      last_login: '2024-01-15T12:20:00Z',
      created_at: '2023-06-01T00:00:00Z',
      updated_at: '2024-01-15T12:20:00Z',
      department: 'Emergency',
      facility: { id: 1, name: 'Kenyatta National Hospital' },
      permissions: ['patients.view', 'patients.edit'],
      security: {
        two_factor_enabled: false,
        password_expires_at: '2024-06-01T00:00:00Z',
        failed_login_attempts: 1,
        last_password_change: '2023-12-15T00:00:00Z'
      },
      activity: {
        total_logins: 645,
        last_activity: '2024-01-15T12:20:00Z',
        current_sessions: 1,
        devices: [
          { type: 'tablet', last_used: '2024-01-15T12:20:00Z', location: 'Nairobi, Kenya' }
        ]
      },
      performance_metrics: {
        patients_treated: 89,
        satisfaction_score: 92.4,
        completion_rate: 88.7
      }
    },
    {
      id: 4,
      first_name: 'James',
      last_name: 'Mwangi',
      email: 'james.mwangi@dispatch.com',
      phone: '+254745678901',
      role: {
        id: 4,
        name: 'dispatcher',
        display_name: 'Emergency Dispatcher',
        level: 55,
        color: 'orange',
        icon: 'radio'
      },
      status: 'active',
      last_login: '2024-01-15T14:00:00Z',
      created_at: '2023-04-20T00:00:00Z',
      updated_at: '2024-01-15T14:00:00Z',
      department: 'Emergency Services',
      facility: { id: 2, name: 'Central Dispatch Center' },
      permissions: ['ambulances.dispatch', 'emergency.handle'],
      security: {
        two_factor_enabled: true,
        password_expires_at: '2024-04-20T00:00:00Z',
        failed_login_attempts: 0,
        last_password_change: '2024-01-10T00:00:00Z'
      },
      activity: {
        total_logins: 1100,
        last_activity: '2024-01-15T14:00:00Z',
        current_sessions: 1,
        devices: [
          { type: 'desktop', last_used: '2024-01-15T14:00:00Z', location: 'Nairobi, Kenya' }
        ]
      },
      performance_metrics: {
        response_time: 7.2,
        completion_rate: 96.5
      }
    },
    {
      id: 5,
      first_name: 'Peter',
      last_name: 'Kamau',
      email: 'peter.kamau@ambulance.com',
      phone: '+254756789012',
      role: {
        id: 5,
        name: 'ambulance_paramedic',
        display_name: 'Ambulance Paramedic',
        level: 35,
        color: 'red',
        icon: 'truck'
      },
      status: 'suspended',
      last_login: '2024-01-10T08:30:00Z',
      created_at: '2023-08-10T00:00:00Z',
      updated_at: '2024-01-12T00:00:00Z',
      department: 'Emergency Medical Services',
      facility: { id: 3, name: 'Mobile Unit 12' },
      permissions: ['ambulances.track', 'emergency.respond'],
      security: {
        two_factor_enabled: false,
        password_expires_at: '2024-08-10T00:00:00Z',
        failed_login_attempts: 5,
        locked_until: '2024-01-16T00:00:00Z',
        last_password_change: '2023-11-01T00:00:00Z'
      },
      activity: {
        total_logins: 420,
        last_activity: '2024-01-10T08:30:00Z',
        current_sessions: 0,
        devices: [
          { type: 'mobile', last_used: '2024-01-10T08:30:00Z', location: 'Mombasa, Kenya' }
        ]
      }
    }
  ]

  const mockStats = {
    total_users: 2341,
    active_users: 2156,
    inactive_users: 125,
    suspended_users: 60,
    new_users_today: 12,
    users_by_role: {
      super_admin: 5,
      hospital_admin: 45,
      doctor: 890,
      nurse: 1245,
      dispatcher: 78,
      ambulance_paramedic: 156,
      ambulance_driver: 89,
      patient: 15683
    },
    security_stats: {
      users_with_2fa: 1850,
      expired_passwords: 89,
      locked_accounts: 12,
      suspicious_activities: 5
    },
    activity_stats: {
      daily_logins: [
        { date: '2024-01-09', logins: 1580 },
        { date: '2024-01-10', logins: 1620 },
        { date: '2024-01-11', logins: 1490 },
        { date: '2024-01-12', logins: 1680 },
        { date: '2024-01-13', logins: 1550 },
        { date: '2024-01-14', logins: 1720 },
        { date: '2024-01-15', logins: 1650 }
      ],
      top_active_users: [
        { user: 'Dr. Sarah Johnson', activity_score: 95 },
        { user: 'John Doe', activity_score: 92 },
        { user: 'James Mwangi', activity_score: 88 },
        { user: 'Nurse Mary Wanjiku', activity_score: 85 }
      ],
      device_breakdown: [
        { device: 'Desktop', count: 1200 },
        { device: 'Mobile', count: 890 },
        { device: 'Tablet', count: 456 }
      ]
    }
  }

  const data = {
    users: users.length > 0 ? users : mockUsers,
    stats: stats || mockStats
  }

  const refreshDashboard = async () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
    }, 2000)
  }

  const getRoleIcon = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      crown: <Crown className="h-4 w-4" />,
      stethoscope: <Stethoscope className="h-4 w-4" />,
      heart: <Heart className="h-4 w-4" />,
      radio: <Activity className="h-4 w-4" />,
      truck: <Truck className="h-4 w-4" />,
      building: <Building2 className="h-4 w-4" />,
      users: <Users className="h-4 w-4" />
    }
    return iconMap[iconName] || <Users className="h-4 w-4" />
  }

  const getRoleColor = (color: string) => {
    const colorMap: Record<string, string> = {
      purple: 'bg-purple-100 text-purple-800',
      green: 'bg-green-100 text-green-800',
      pink: 'bg-pink-100 text-pink-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800',
      blue: 'bg-blue-100 text-blue-800',
      gray: 'bg-gray-100 text-gray-800'
    }
    return colorMap[color] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'inactive': return <XCircle className="h-4 w-4 text-gray-600" />
      case 'suspended': return <Lock className="h-4 w-4 text-red-600" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      default: return <XCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString()
  }

  const filteredUsers = data.users.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole = selectedRole === 'all' || user.role.name === selectedRole
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    const matchesDepartment = selectedDepartment === 'all' || user.department === selectedDepartment
    const matchesActiveFilter = showInactive || user.status === 'active'
    
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment && matchesActiveFilter
  })

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue: any, bValue: any
    
    switch (sortBy) {
      case 'name':
        aValue = `${a.first_name} ${a.last_name}`
        bValue = `${b.first_name} ${b.last_name}`
        break
      case 'role':
        aValue = a.role.display_name
        bValue = b.role.display_name
        break
      case 'last_login':
        aValue = a.last_login ? new Date(a.last_login).getTime() : 0
        bValue = b.last_login ? new Date(b.last_login).getTime() : 0
        break
      case 'created_at':
        aValue = new Date(a.created_at).getTime()
        bValue = new Date(b.created_at).getTime()
        break
      default:
        aValue = a.id
        bValue = b.id
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === sortedUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(sortedUsers.map(user => user.id))
    }
  }

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on users:`, selectedUsers)
    // Implement bulk actions
    setSelectedUsers([])
  }

  return (
    <SuperAdminLayout user={user}>
      <Head title="Enterprise User Management" />
      
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive user administration and role management system
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={refreshDashboard}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <Link
              href="/admin/users/create"
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Add User
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{data.stats.total_users.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">+{data.stats.new_users_today} today</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900">{data.stats.active_users.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-1">{((data.stats.active_users / data.stats.total_users) * 100).toFixed(1)}% active</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">2FA Enabled</p>
                <p className="text-3xl font-bold text-gray-900">{data.stats.security_stats.users_with_2fa.toLocaleString()}</p>
                <p className="text-sm text-blue-600 mt-1">{((data.stats.security_stats.users_with_2fa / data.stats.total_users) * 100).toFixed(1)}% secured</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Issues</p>
                <p className="text-3xl font-bold text-gray-900">
                  {data.stats.security_stats.expired_passwords + data.stats.security_stats.locked_accounts}
                </p>
                <p className="text-sm text-orange-600 mt-1">Require attention</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                {roles?.map(role => (
                  <option key={role.id} value={role.name}>{role.display_name}</option>
                ))}
              </select>
              
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">Show Inactive</span>
              </label>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-4 mb-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-900">
                {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction('suspend')}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Suspend
                </button>
                <button
                  onClick={() => handleBulkAction('reset_password')}
                  className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                >
                  Reset Password
                </button>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === sortedUsers.length && sortedUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:text-gray-900"
                    onClick={() => {
                      if (sortBy === 'name') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortBy('name')
                        setSortOrder('asc')
                      }
                    }}
                  >
                    User
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:text-gray-900"
                    onClick={() => {
                      if (sortBy === 'role') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortBy('role')
                        setSortOrder('asc')
                      }
                    }}
                  >
                    Role
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Security</th>
                  <th 
                    className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:text-gray-900"
                    onClick={() => {
                      if (sortBy === 'last_login') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortBy('last_login')
                        setSortOrder('desc')
                      }
                    }}
                  >
                    Last Login
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Performance</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role.color)}`}>
                          {getRoleIcon(user.role.icon)}
                          {user.role.display_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm text-gray-900">{user.department || 'N/A'}</p>
                        {user.facility && <p className="text-xs text-gray-500">{user.facility.name}</p>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(user.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {user.security.two_factor_enabled ? (
                          <Shield className="h-4 w-4 text-green-600" title="2FA Enabled" />
                        ) : (
                          <Shield className="h-4 w-4 text-gray-400" title="2FA Disabled" />
                        )}
                        {user.security.locked_until && new Date(user.security.locked_until) > new Date() && (
                          <Lock className="h-4 w-4 text-red-600" title="Account Locked" />
                        )}
                        {user.security.failed_login_attempts > 0 && (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" title={`${user.security.failed_login_attempts} failed attempts`} />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm text-gray-900">{formatDateTime(user.last_login)}</p>
                        <p className="text-xs text-gray-500">{user.activity.current_sessions} active session{user.activity.current_sessions !== 1 ? 's' : ''}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {user.performance_metrics && (
                        <div className="text-sm">
                          {user.performance_metrics.satisfaction_score && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span>{user.performance_metrics.satisfaction_score}%</span>
                            </div>
                          )}
                          {user.performance_metrics.patients_treated && (
                            <div className="text-xs text-gray-500">
                              {user.performance_metrics.patients_treated} patients
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="p-1 text-blue-600 hover:text-blue-700 rounded"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/users/${user.id}/edit`}
                          className="p-1 text-gray-600 hover:text-gray-700 rounded"
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          className="p-1 text-red-600 hover:text-red-700 rounded"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {sortedUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No users found matching your criteria</p>
              </div>
            )}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">User Distribution by Role</h3>
              <p className="text-sm text-gray-600">Current role assignments across the system</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(data.stats.users_by_role).map(([role, count]) => (
              <div key={role} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {role.replace('_', ' ')}
                  </span>
                  <span className="text-lg font-bold text-gray-900">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 bg-teal-500 rounded-full"
                    style={{ width: `${(count / data.stats.total_users) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {((count / data.stats.total_users) * 100).toFixed(1)}% of total users
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  )
}