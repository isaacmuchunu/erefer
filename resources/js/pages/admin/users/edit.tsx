import React, { useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import { ArrowLeft, Save, User, Mail, Phone, Shield, Building, Key, Activity } from 'lucide-react'
import AppLayout from '@/layouts/AppLayout'
import { ProHealthButton, ProHealthCard, ProHealthInput, ProHealthSelect } from '@/components/prohealth'
import { toast } from 'react-hot-toast'

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  role: string
  status: string
  facility_id: number | null
  facility?: {
    id: number
    name: string
  }
}

interface Facility {
  id: number
  name: string
}

interface EditUserProps {
  auth: {
    user: any
  }
  user: User
  roles: Record<string, string>
  facilities: Facility[]
}

export default function EditUser({ auth, user, roles, facilities }: EditUserProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)

  const { data, setData, put, processing, errors } = useForm({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    facility_id: user.facility_id?.toString() || '',
    status: user.status,
  })

  const { data: passwordData, setData: setPasswordData, post: postPassword, processing: passwordProcessing, errors: passwordErrors, reset: resetPassword } = useForm({
    password: '',
    password_confirmation: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    put(route('admin.users.update', user.id), {
      onSuccess: () => {
        toast.success('User updated successfully!')
      },
      onError: () => {
        toast.error('Failed to update user. Please check the form.')
      },
      onFinish: () => {
        setIsSubmitting(false)
      }
    })
  }

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault()

    postPassword(route('admin.users.reset-password', user.id), {
      onSuccess: () => {
        toast.success('Password reset successfully!')
        resetPassword()
        setShowPasswordReset(false)
      },
      onError: () => {
        toast.error('Failed to reset password. Please check the form.')
      }
    })
  }

  const handleStatusUpdate = (newStatus: string) => {
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
      setData('status', newStatus)
      setShowStatusUpdate(false)
    })
    .catch(error => {
      toast.error('Failed to update user status')
      console.error('Status update error:', error)
    })
  }

  const getRoleDescription = (role: string) => {
    const descriptions = {
      super_admin: 'Full system access and administrative privileges',
      hospital_admin: 'Manage hospital operations and staff',
      doctor: 'Medical professional with patient care access',
      nurse: 'Healthcare provider with patient care duties',
      dispatcher: 'Emergency response coordination',
      ambulance_driver: 'Emergency transport services',
      ambulance_paramedic: 'Advanced emergency medical care',
      patient: 'Healthcare service recipient',
    }
    return descriptions[role as keyof typeof descriptions] || ''
  }

  return (
    <AppLayout user={auth.user}>
      <Head title={`Edit User: ${user.first_name} ${user.last_name} — eRefer Kenya`} />

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
                <h1 className="cs_fs_32 cs_primary_font cs_bold cs_heading_color">Edit User</h1>
                <p className="cs_body_color cs_secondary_font">Update user information and settings</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <ProHealthCard>
                  <div className="p-6">
                    <h3 className="cs_fs_20 cs_primary_font cs_semibold cs_heading_color mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 cs_accent_color" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm cs_semibold cs_heading_color cs_primary_font mb-2">
                          First Name *
                        </label>
                        <ProHealthInput
                          value={data.first_name}
                          onChange={(e) => setData('first_name', e.target.value)}
                          placeholder="Enter first name"
                          error={errors.first_name}
                        />
                      </div>
                      <div>
                        <label className="block text-sm cs_semibold cs_heading_color cs_primary_font mb-2">
                          Last Name *
                        </label>
                        <ProHealthInput
                          value={data.last_name}
                          onChange={(e) => setData('last_name', e.target.value)}
                          placeholder="Enter last name"
                          error={errors.last_name}
                        />
                      </div>
                    </div>
                  </div>
                </ProHealthCard>

                {/* Contact Information */}
                <ProHealthCard>
                  <div className="p-6">
                    <h3 className="cs_fs_20 cs_primary_font cs_semibold cs_heading_color mb-4 flex items-center gap-2">
                      <Mail className="h-5 w-5 cs_accent_color" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm cs_semibold cs_heading_color cs_primary_font mb-2">
                          Email Address *
                        </label>
                        <ProHealthInput
                          type="email"
                          value={data.email}
                          onChange={(e) => setData('email', e.target.value)}
                          placeholder="Enter email address"
                          error={errors.email}
                        />
                      </div>
                      <div>
                        <label className="block text-sm cs_semibold cs_heading_color cs_primary_font mb-2">
                          Phone Number
                        </label>
                        <ProHealthInput
                          type="tel"
                          value={data.phone}
                          onChange={(e) => setData('phone', e.target.value)}
                          placeholder="Enter phone number"
                          error={errors.phone}
                        />
                      </div>
                    </div>
                  </div>
                </ProHealthCard>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <ProHealthButton
                    type="submit"
                    variant="primary"
                    icon={Save}
                    disabled={processing || isSubmitting}
                  >
                    {processing || isSubmitting ? 'Updating...' : 'Update User'}
                  </ProHealthButton>
                  <ProHealthButton
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                  >
                    Cancel
                  </ProHealthButton>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Role & Status */}
              <ProHealthCard>
                <div className="p-6">
                  <h3 className="cs_fs_20 cs_primary_font cs_semibold cs_heading_color mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 cs_accent_color" />
                    Role & Access
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm cs_semibold cs_heading_color cs_primary_font mb-2">
                        Role *
                      </label>
                      <ProHealthSelect
                        value={data.role}
                        onChange={(e) => setData('role', e.target.value)}
                        error={errors.role}
                      >
                        {Object.entries(roles).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </ProHealthSelect>
                    </div>
                    <div>
                      <label className="block text-sm cs_semibold cs_heading_color cs_primary_font mb-2">
                        Status *
                      </label>
                      <ProHealthSelect
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                        error={errors.status}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </ProHealthSelect>
                    </div>
                  </div>
                </div>
              </ProHealthCard>

              {/* Facility Assignment */}
              <ProHealthCard>
                <div className="p-6">
                  <h3 className="cs_fs_20 cs_primary_font cs_semibold cs_heading_color mb-4 flex items-center gap-2">
                    <Building className="h-5 w-5 cs_accent_color" />
                    Facility Assignment
                  </h3>
                  <div>
                    <label className="block text-sm cs_semibold cs_heading_color cs_primary_font mb-2">
                      Facility
                    </label>
                    <ProHealthSelect
                      value={data.facility_id}
                      onChange={(e) => setData('facility_id', e.target.value)}
                      error={errors.facility_id}
                    >
                      <option value="">No Facility</option>
                      {facilities.map((facility) => (
                        <option key={facility.id} value={facility.id}>
                          {facility.name}
                        </option>
                      ))}
                    </ProHealthSelect>
                  </div>
                </div>
              </ProHealthCard>

              {/* Password Reset */}
              <ProHealthCard>
                <div className="p-6">
                  <h3 className="cs_fs_20 cs_primary_font cs_semibold cs_heading_color mb-4 flex items-center gap-2">
                    <Key className="h-5 w-5 cs_accent_color" />
                    Password Reset
                  </h3>
                  {!showPasswordReset ? (
                    <ProHealthButton
                      variant="outline"
                      icon={Key}
                      onClick={() => setShowPasswordReset(true)}
                      className="w-full"
                    >
                      Reset Password
                    </ProHealthButton>
                  ) : (
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                      <div>
                        <label className="block text-sm cs_semibold cs_heading_color cs_primary_font mb-2">
                          New Password *
                        </label>
                        <ProHealthInput
                          type="password"
                          value={passwordData.password}
                          onChange={(e) => setPasswordData('password', e.target.value)}
                          placeholder="Enter new password"
                          error={passwordErrors.password}
                        />
                      </div>
                      <div>
                        <label className="block text-sm cs_semibold cs_heading_color cs_primary_font mb-2">
                          Confirm Password *
                        </label>
                        <ProHealthInput
                          type="password"
                          value={passwordData.password_confirmation}
                          onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                          placeholder="Confirm new password"
                          error={passwordErrors.password_confirmation}
                        />
                      </div>
                      <div className="flex gap-2">
                        <ProHealthButton
                          type="submit"
                          variant="primary"
                          disabled={passwordProcessing}
                          className="flex-1"
                        >
                          {passwordProcessing ? 'Resetting...' : 'Reset'}
                        </ProHealthButton>
                        <ProHealthButton
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowPasswordReset(false)
                            resetPassword()
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </ProHealthButton>
                      </div>
                    </form>
                  )}
                </div>
              </ProHealthCard>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
