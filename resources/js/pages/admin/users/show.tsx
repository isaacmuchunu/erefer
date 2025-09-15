import React, { useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, Edit, Shield, User, Mail, Phone, Building, Calendar, Activity, Trash2 } from 'lucide-react'
import SuperAdminLayout from '@/layouts/SuperAdminLayout'
import { ProHealthButton, ProHealthCard } from '@/components/prohealth'
import { toast } from 'react-hot-toast'

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  role: string
  status: string
  email_verified_at: string | null
  last_login_at: string | null
  created_at: string
  updated_at: string
  facility?: {
    id: number
    name: string
    address: string
  }
}

interface ShowUserProps {
  auth: {
    user: any
  }
  user: User
}

export default function ShowUser({ auth, user }: ShowUserProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  
  const roleColors = {
    super_admin: 'text-purple-600 bg-purple-100',
    hospital_admin: 'text-blue-600 bg-blue-100',
    doctor: 'text-green-600 bg-green-100',
    nurse: 'text-pink-600 bg-pink-100',
    ambulance_driver: 'text-orange-600 bg-orange-100',
    dispatcher: 'text-indigo-600 bg-indigo-100',
    patient: 'text-gray-600 bg-gray-100',
  }

  const statusColors = {
    active: 'text-green-600 bg-green-100',
    inactive: 'text-gray-600 bg-gray-100',
    suspended: 'text-red-600 bg-red-100',
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatRole = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const handleStatusUpdate = (newStatus: string) => {
    setIsUpdating(true)
    
    fetch(route('admin.users.update-status', user.id), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
      body: JSON.stringify({ status: newStatus })
    })
    .then(response => response.json())
    .then(data => {
      toast.success('User status updated successfully!')
      window.location.reload() // Refresh to show updated status
    })
    .catch(error => {
      toast.error('Failed to update user status')
      console.error('Status update error:', error)
    })
    .finally(() => {
      setIsUpdating(false)
    })
  }

  return (
    <SuperAdminLayout user={auth.user}>
      <Head title={`${user.first_name} ${user.last_name} — eRefer Kenya`} />

      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <ProHealthButton
                variant="outline"
                icon={ArrowLeft}
                onClick={() => window.history.back()}
              >
                Back
              </ProHealthButton>
              <div>
                <h1 className="cs_fs_32 cs_primary_font cs_bold cs_heading_color">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="cs_body_color cs_secondary_font">User Details and Information</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href={route('admin.users.edit', user.id)}>
                <ProHealthButton variant="outline" icon={Edit}>
                  Edit User
                </ProHealthButton>
              </Link>
              {auth.user.role === 'super_admin' && user.role !== 'super_admin' && (
                <ProHealthButton variant="outline" icon={Trash2} className="text-red-600 hover:text-red-700">
                  Delete User
                </ProHealthButton>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <ProHealthCard>
                <div className="p-6">
                  <h3 className="cs_fs_20 cs_primary_font cs_semibold cs_heading_color mb-6 flex items-center gap-2">
                    <User className="h-5 w-5 cs_accent_color" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm cs_semibold cs_body_color cs_secondary_font mb-1">
                        First Name
                      </label>
                      <p className="cs_fs_16 cs_heading_color cs_primary_font">{user.first_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm cs_semibold cs_body_color cs_secondary_font mb-1">
                        Last Name
                      </label>
                      <p className="cs_fs_16 cs_heading_color cs_primary_font">{user.last_name}</p>
                    </div>
                  </div>
                </div>
              </ProHealthCard>

              {/* Contact Information */}
              <ProHealthCard>
                <div className="p-6">
                  <h3 className="cs_fs_20 cs_primary_font cs_semibold cs_heading_color mb-6 flex items-center gap-2">
                    <Mail className="h-5 w-5 cs_accent_color" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm cs_semibold cs_body_color cs_secondary_font mb-1">
                        Email Address
                      </label>
                      <p className="cs_fs_16 cs_heading_color cs_primary_font">{user.email}</p>
                      <div className="mt-1">
                        <span className={`inline-flex px-2 py-1 cs_radius_10 text-xs cs_semibold ${
                          user.email_verified_at ? 'text-green-600 bg-green-100' : 'text-orange-600 bg-orange-100'
                        }`}>
                          {user.email_verified_at ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm cs_semibold cs_body_color cs_secondary_font mb-1">
                        Phone Number
                      </label>
                      <p className="cs_fs_16 cs_heading_color cs_primary_font">
                        {user.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </ProHealthCard>

              {/* Facility Information */}
              {user.facility && (
                <ProHealthCard>
                  <div className="p-6">
                    <h3 className="cs_fs_20 cs_primary_font cs_semibold cs_heading_color mb-6 flex items-center gap-2">
                      <Building className="h-5 w-5 cs_accent_color" />
                      Facility Assignment
                    </h3>
                    <div>
                      <label className="block text-sm cs_semibold cs_body_color cs_secondary_font mb-1">
                        Primary Facility
                      </label>
                      <p className="cs_fs_16 cs_heading_color cs_primary_font">{user.facility.name}</p>
                      {user.facility.address && (
                        <p className="text-sm cs_body_color cs_secondary_font mt-1">{user.facility.address}</p>
                      )}
                    </div>
                  </div>
                </ProHealthCard>
              )}

              {/* Activity Information */}
              <ProHealthCard>
                <div className="p-6">
                  <h3 className="cs_fs_20 cs_primary_font cs_semibold cs_heading_color mb-6 flex items-center gap-2">
                    <Activity className="h-5 w-5 cs_accent_color" />
                    Activity Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm cs_semibold cs_body_color cs_secondary_font mb-1">
                        Last Login
                      </label>
                      <p className="cs_fs_16 cs_heading_color cs_primary_font">
                        {formatDate(user.last_login_at)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm cs_semibold cs_body_color cs_secondary_font mb-1">
                        Account Created
                      </label>
                      <p className="cs_fs_16 cs_heading_color cs_primary_font">
                        {formatDate(user.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </ProHealthCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* User Avatar */}
              <ProHealthCard>
                <div className="p-6 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#274760] to-[#307BC4] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                  </div>
                  <h3 className="cs_fs_18 cs_primary_font cs_semibold cs_heading_color">
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="text-sm cs_body_color cs_secondary_font">{user.email}</p>
                </div>
              </ProHealthCard>

              {/* Role & Status */}
              <ProHealthCard>
                <div className="p-6">
                  <h3 className="cs_fs_18 cs_primary_font cs_semibold cs_heading_color mb-4 flex items-center gap-2">
                    <Shield className="h-4 w-4 cs_accent_color" />
                    Role & Status
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm cs_semibold cs_body_color cs_secondary_font mb-1">
                        Role
                      </label>
                      <span className={`inline-flex px-3 py-1 cs_radius_15 text-sm cs_semibold ${roleColors[user.role as keyof typeof roleColors]}`}>
                        {formatRole(user.role)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm cs_semibold cs_body_color cs_secondary_font mb-1">
                        Status
                      </label>
                      <span className={`inline-flex px-3 py-1 cs_radius_15 text-sm cs_semibold ${statusColors[user.status as keyof typeof statusColors]}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </ProHealthCard>

              {/* Quick Actions */}
              <ProHealthCard>
                <div className="p-6">
                  <h3 className="cs_fs_18 cs_primary_font cs_semibold cs_heading_color mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <Link href={route('admin.users.edit', user.id)} className="block">
                      <ProHealthButton variant="outline" icon={Edit} className="w-full justify-start">
                        Edit User
                      </ProHealthButton>
                    </Link>
                    <ProHealthButton variant="outline" icon={Mail} className="w-full justify-start">
                      Send Message
                    </ProHealthButton>
                    {user.status === 'active' ? (
                      <ProHealthButton 
                        variant="outline" 
                        className="w-full justify-start text-orange-600 hover:text-orange-700"
                        onClick={() => handleStatusUpdate('suspended')}
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Updating...' : 'Suspend User'}
                      </ProHealthButton>
                    ) : user.status === 'suspended' ? (
                      <ProHealthButton 
                        variant="outline" 
                        className="w-full justify-start text-green-600 hover:text-green-700"
                        onClick={() => handleStatusUpdate('active')}
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Updating...' : 'Activate User'}
                      </ProHealthButton>
                    ) : (
                      <ProHealthButton 
                        variant="outline" 
                        className="w-full justify-start text-green-600 hover:text-green-700"
                        onClick={() => handleStatusUpdate('active')}
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Updating...' : 'Activate User'}
                      </ProHealthButton>
                    )}
                  </div>
                </div>
              </ProHealthCard>

              {/* System Information */}
              <ProHealthCard>
                <div className="p-6">
                  <h3 className="cs_fs_18 cs_primary_font cs_semibold cs_heading_color mb-4 flex items-center gap-2">
                    <Calendar className="h-4 w-4 cs_accent_color" />
                    System Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <label className="block cs_semibold cs_body_color cs_secondary_font mb-1">
                        User ID
                      </label>
                      <p className="cs_heading_color cs_primary_font">#{user.id}</p>
                    </div>
                    <div>
                      <label className="block cs_semibold cs_body_color cs_secondary_font mb-1">
                        Last Updated
                      </label>
                      <p className="cs_heading_color cs_primary_font">{formatDate(user.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </ProHealthCard>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  )
}
