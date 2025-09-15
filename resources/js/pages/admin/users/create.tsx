import React, { useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import { ArrowLeft, Save, User, Mail, Phone, Shield, Building, Upload, Download } from 'lucide-react'
import AppLayout from '@/layouts/AppLayout'
import { ProHealthButton, ProHealthCard, ProHealthInput, ProHealthSelect } from '@/components/prohealth'
import { toast } from 'react-hot-toast'

interface Facility {
  id: number
  name: string
}

interface CreateUserProps {
  auth: {
    user: any
  }
  roles: Record<string, string>
  facilities: Facility[]
}

export default function CreateUser({ auth, roles, facilities }: CreateUserProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)

  const { data, setData, post, processing, errors, reset } = useForm({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    password_confirmation: '',
    facility_id: '',
    status: 'active',
  })

  const handleImport = () => {
    if (!importFile) {
      toast.error('Please select a file to import')
      return
    }

    const formData = new FormData()
    formData.append('file', importFile)

    fetch(route('admin.users.import'), {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
    })
    .then(response => response.json())
    .then(data => {
      if (data.errors && data.errors.length > 0) {
        toast.error(`Imported ${data.imported} users with ${data.errors.length} errors`)
        console.log('Import errors:', data.errors)
      } else {
        toast.success(`Successfully imported ${data.imported} users`)
      }
      setShowImportModal(false)
      setImportFile(null)
      window.location.reload()
    })
    .catch(error => {
      toast.error('Failed to import users')
      console.error('Import error:', error)
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    post(route('admin.users.store'), {
      onSuccess: () => {
        toast.success('User created successfully!')
        reset()
      },
      onError: () => {
        toast.error('Failed to create user. Please check the form.')
      },
      onFinish: () => {
        setIsSubmitting(false)
      }
    })
  }

  const downloadTemplate = () => {
    const csvContent = 'First Name,Last Name,Email,Phone,Role,Password,Facility ID,Status\n' +
                      'John,Doe,john.doe@example.com,+254700000000,doctor,password123,1,active\n' +
                      'Jane,Smith,jane.smith@example.com,+254700000001,nurse,password123,1,active'
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'user_import_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const roleIcons = {
    super_admin: <Shield className="h-4 w-4" />,
    hospital_admin: <Building className="h-4 w-4" />,
    doctor: <User className="h-4 w-4" />,
    nurse: <User className="h-4 w-4" />,
    dispatcher: <Phone className="h-4 w-4" />,
    ambulance_driver: <User className="h-4 w-4" />,
    ambulance_paramedic: <User className="h-4 w-4" />,
    patient: <User className="h-4 w-4" />,
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
      <Head title="Create User — eRefer Kenya" />

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
                <h1 className="cs_fs_32 cs_primary_font cs_bold cs_heading_color">Create New User</h1>
                <p className="cs_body_color cs_secondary_font">Add a new user to the healthcare system</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ProHealthButton
                variant="outline"
                icon={Download}
                onClick={downloadTemplate}
              >
                Download Template
              </ProHealthButton>
              <ProHealthButton
                variant="outline"
                icon={Upload}
                onClick={() => setShowImportModal(true)}
              >
                Bulk Import
              </ProHealthButton>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
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

                {/* Security */}
                <ProHealthCard>
                  <div className="p-6">
                    <h3 className="cs_fs_20 cs_primary_font cs_semibold cs_heading_color mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5 cs_accent_color" />
                      Security
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm cs_semibold cs_heading_color cs_primary_font mb-2">
                          Password *
                        </label>
                        <ProHealthInput
                          type="password"
                          value={data.password}
                          onChange={(e) => setData('password', e.target.value)}
                          placeholder="Enter password"
                          error={errors.password}
                        />
                      </div>
                      <div>
                        <label className="block text-sm cs_semibold cs_heading_color cs_primary_font mb-2">
                          Confirm Password *
                        </label>
                        <ProHealthInput
                          type="password"
                          value={data.password_confirmation}
                          onChange={(e) => setData('password_confirmation', e.target.value)}
                          placeholder="Confirm password"
                          error={errors.password_confirmation}
                        />
                      </div>
                    </div>
                  </div>
                </ProHealthCard>
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
                          <option value="">Select Role</option>
                          {Object.entries(roles).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </ProHealthSelect>
                        {data.role && (
                          <p className="text-sm cs_body_color cs_secondary_font mt-2">
                            {getRoleDescription(data.role)}
                          </p>
                        )}
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
                      <p className="text-xs cs_body_color cs_secondary_font mt-2">
                        Select the primary facility for this user
                      </p>
                    </div>
                  </div>
                </ProHealthCard>

                {/* Actions */}
                <ProHealthCard>
                  <div className="p-6">
                    <div className="space-y-3">
                      <ProHealthButton
                        type="submit"
                        variant="primary"
                        icon={Save}
                        disabled={processing || isSubmitting}
                        className="w-full"
                      >
                        {processing || isSubmitting ? 'Creating...' : 'Create User'}
                      </ProHealthButton>
                      <ProHealthButton
                        type="button"
                        variant="outline"
                        onClick={() => window.history.back()}
                        className="w-full"
                      >
                        Cancel
                      </ProHealthButton>
                    </div>
                  </div>
                </ProHealthCard>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="cs_fs_20 cs_primary_font cs_semibold cs_heading_color mb-4">
              Import Users from CSV
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm cs_semibold cs_body_color cs_secondary_font mb-2">
                  Select CSV File
                </label>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#307BC4]"
                />
                <p className="text-xs cs_body_color cs_secondary_font mt-1">
                  CSV format: First Name, Last Name, Email, Phone, Role, Password, Facility ID, Status
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ProHealthButton
                  variant="primary"
                  onClick={handleImport}
                  disabled={!importFile}
                >
                  Import Users
                </ProHealthButton>
                <ProHealthButton
                  variant="outline"
                  onClick={() => {
                    setShowImportModal(false)
                    setImportFile(null)
                  }}
                >
                  Cancel
                </ProHealthButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
