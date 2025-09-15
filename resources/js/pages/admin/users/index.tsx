import React, { useState } from 'react'
import { Head, Link, useForm, router } from '@inertiajs/react'
import { Plus, Search, Download, Upload, Edit, Trash2, Eye, UserPlus, Users, Shield, Stethoscope, Truck, Phone } from 'lucide-react'
import SuperAdminLayout from '@/layouts/SuperAdminLayout'
import { ProHealthButton, ProHealthCard, ProHealthInput, ProHealthSelect } from '@/components/prohealth'
import { toast } from 'react-hot-toast'

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  role: 'super_admin' | 'hospital_admin' | 'doctor' | 'nurse' | 'ambulance_driver' | 'dispatcher' | 'patient'
  status: 'active' | 'inactive' | 'suspended'
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

interface UsersIndexProps {
  auth: {
    user: any
  }
  users: {
    data: User[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  filters: {
    search?: string
    role?: string
    status?: string
  }
  stats: {
    total: number
    active: number
    inactive: number
    by_role: Record<string, number>
  }
}

export default function UsersIndex({ auth, users, filters, stats }: UsersIndexProps) {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)

  const { data, setData, get, processing } = useForm({
    search: filters.search || '',
    role: filters.role || '',
    status: filters.status || '',
  })

  const handleFilter = () => {
    get(route('admin.users.index'), {
      preserveState: true,
      preserveScroll: true,
    })
  }

  const handleDeleteUser = (userId: number) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      router.delete(route('admin.users.destroy', userId), {
        onSuccess: () => {
          toast.success('User deleted successfully!')
        },
        onError: () => {
          toast.error('Failed to delete user.')
        }
      })
    }
  }

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first.')
      return
    }

    const actionText = action === 'activate' ? 'activate' : action === 'deactivate' ? 'deactivate' : action === 'suspend' ? 'suspend' : 'delete'
    
    if (confirm(`Are you sure you want to ${actionText} ${selectedUsers.length} user(s)?`)) {
      router.post(route('admin.users.bulk-action'), {
        action,
        user_ids: selectedUsers
      }, {
        onSuccess: () => {
          toast.success(`Users ${actionText}d successfully!`)
          setSelectedUsers([])
          setShowBulkActions(false)
        },
        onError: () => {
          toast.error(`Failed to ${actionText} users.`)
        }
      })
    }
  }

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

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const toggleAllUsers = () => {
    if (selectedUsers.length === users.data.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.data.map(user => user.id))
    }
  }

  const roleIcons = {
    super_admin: <Shield className="h-4 w-4" />,
    hospital_admin: <Users className="h-4 w-4" />,
    doctor: <Stethoscope className="h-4 w-4" />,
    nurse: <UserPlus className="h-4 w-4" />,
    ambulance_driver: <Truck className="h-4 w-4" />,
    dispatcher: <Phone className="h-4 w-4" />,
    patient: <Users className="h-4 w-4" />,
  }

  const roleColors = {
    super_admin: 'text-purple-600 bg-purple-100',
    hospital_admin: 'text-blue-600 bg-blue-100',
    doctor: 'text-green-600 bg-green-100',
    nurse: 'text-pink-600 bg-pink-100',
    ambulance_driver: 'text-orange-600 bg-orange-100',
    dispatcher: 'text-indigo-600 bg-indigo-100',
    patient: 'text-gray-600 bg-gray-100',
  }

  return (
    <SuperAdminLayout user={auth.user}>
      <Head title="User Management — eRefer Kenya" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="cs_fs_32 cs_primary_font cs_bold cs_heading_color">User Management</h1>
              <p className="cs_body_color cs_secondary_font">Manage healthcare professionals and system users</p>
            </div>
            <div className="flex items-center gap-4">
              <ProHealthButton
                variant="outline"
                icon={Download}
                onClick={() => window.open(route('admin.users.export'))}
              >
                Export Users
              </ProHealthButton>
              <ProHealthButton
                variant="outline"
                icon={Upload}
                onClick={() => setShowImportModal(true)}
              >
                Bulk Import
              </ProHealthButton>
              <Link href={route('admin.users.create')}>
                <ProHealthButton
                  variant="primary"
                  icon={Plus}
                >
                  Add User
                </ProHealthButton>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ProHealthCard variant="stat" className="text-center">
              <div className="cs_fs_32 cs_bold cs_accent_color cs_primary_font">{stats.total}</div>
              <div className="text-sm cs_body_color cs_secondary_font mt-2">Total Users</div>
            </ProHealthCard>
            <ProHealthCard variant="stat" className="text-center">
              <div className="cs_fs_32 cs_bold text-green-600 cs_primary_font">{stats.active}</div>
              <div className="text-sm cs_body_color cs_secondary_font mt-2">Active Users</div>
            </ProHealthCard>
            <ProHealthCard variant="stat" className="text-center">
              <div className="cs_fs_32 cs_bold text-orange-600 cs_primary_font">{stats.by_role.doctor || 0}</div>
              <div className="text-sm cs_body_color cs_secondary_font mt-2">Doctors</div>
            </ProHealthCard>
            <ProHealthCard variant="stat" className="text-center">
              <div className="cs_fs_32 cs_bold text-pink-600 cs_primary_font">{stats.by_role.nurse || 0}</div>
              <div className="text-sm cs_body_color cs_secondary_font mt-2">Nurses</div>
            </ProHealthCard>
          </div>

          {/* Filters and Bulk Actions */}
          <ProHealthCard className="mb-8">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <ProHealthInput
                  placeholder="Search users..."
                  value={data.search}
                  onChange={(e) => setData('search', e.target.value)}
                  icon={Search}
                />
                <ProHealthSelect
                  value={data.role}
                  onChange={(e) => setData('role', e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="hospital_admin">Hospital Admin</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="ambulance_driver">Ambulance Driver</option>
                  <option value="dispatcher">Dispatcher</option>
                  <option value="patient">Patient</option>
                </ProHealthSelect>
                <ProHealthSelect
                  value={data.status}
                  onChange={(e) => setData('status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </ProHealthSelect>
                <ProHealthButton
                  variant="primary"
                  onClick={handleFilter}
                  disabled={processing}
                >
                  Filter
                </ProHealthButton>
              </div>

              {/* Bulk Actions */}
              {selectedUsers.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-[#307BC4]/5 cs_radius_15">
                  <span className="text-sm cs_semibold cs_heading_color cs_primary_font">
                    {selectedUsers.length} user(s) selected
                  </span>
                  <div className="flex items-center gap-2">
                    <ProHealthButton
                      variant="outline"
                      onClick={() => handleBulkAction('activate')}
                      className="text-green-600 hover:text-green-700"
                    >
                      Activate
                    </ProHealthButton>
                    <ProHealthButton
                      variant="outline"
                      onClick={() => handleBulkAction('deactivate')}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      Deactivate
                    </ProHealthButton>
                    <ProHealthButton
                      variant="outline"
                      onClick={() => handleBulkAction('suspend')}
                      className="text-red-600 hover:text-red-700"
                    >
                      Suspend
                    </ProHealthButton>
                    {auth.user.role === 'super_admin' && (
                      <ProHealthButton
                        variant="outline"
                        onClick={() => handleBulkAction('delete')}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </ProHealthButton>
                    )}
                    <ProHealthButton
                      variant="outline"
                      onClick={() => setSelectedUsers([])}
                    >
                      Clear Selection
                    </ProHealthButton>
                  </div>
                </div>
              )}
            </div>
          </ProHealthCard>

          {/* Users Table */}
          <ProHealthCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#307BC4]/10">
                    <th className="text-left py-4 px-4 cs_fs_14 cs_semibold cs_heading_color cs_primary_font w-12">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users.data.length && users.data.length > 0}
                        onChange={toggleAllUsers}
                        className="cs_radius_5"
                      />
                    </th>
                    <th className="text-left py-4 px-4 cs_fs_14 cs_semibold cs_heading_color cs_primary_font">User</th>
                    <th className="text-left py-4 px-4 cs_fs_14 cs_semibold cs_heading_color cs_primary_font">Role</th>
                    <th className="text-left py-4 px-4 cs_fs_14 cs_semibold cs_heading_color cs_primary_font">Status</th>
                    <th className="text-left py-4 px-4 cs_fs_14 cs_semibold cs_heading_color cs_primary_font">Contact</th>
                    <th className="text-left py-4 px-4 cs_fs_14 cs_semibold cs_heading_color cs_primary_font">Joined</th>
                    <th className="text-right py-4 px-4 cs_fs_14 cs_semibold cs_heading_color cs_primary_font">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.data.map((user) => (
                    <tr key={user.id} className="border-b border-[#307BC4]/5 hover:bg-[#307BC4]/5 transition-colors">
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="cs_radius_5"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="cs_fs_16 cs_semibold cs_heading_color cs_primary_font">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm cs_body_color cs_secondary_font">{user.email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 cs_radius_15 text-sm cs_semibold ${roleColors[user.role]}`}>
                          {roleIcons[user.role]}
                          {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-3 py-1 cs_radius_15 text-sm cs_semibold ${
                          user.status === 'active' ? 'text-green-600 bg-green-100' :
                          user.status === 'inactive' ? 'text-gray-600 bg-gray-100' :
                          'text-red-600 bg-red-100'
                        }`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm cs_body_color cs_secondary_font">
                          <div>{user.phone}</div>
                          <div className={user.email_verified_at ? 'text-green-600' : 'text-orange-600'}>
                            {user.email_verified_at ? 'Verified' : 'Unverified'}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm cs_body_color cs_secondary_font">
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={route('admin.users.show', user.id)}>
                            <button className="p-2 hover:bg-[#307BC4]/10 cs_radius_10 cs_accent_color transition-colors" title="View User">
                              <Eye className="h-4 w-4" />
                            </button>
                          </Link>
                          <Link href={route('admin.users.edit', user.id)}>
                            <button className="p-2 hover:bg-[#307BC4]/10 cs_radius_10 cs_accent_color transition-colors" title="Edit User">
                              <Edit className="h-4 w-4" />
                            </button>
                          </Link>
                          {auth.user.role === 'super_admin' && user.role !== 'super_admin' && user.id !== auth.user.id && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 hover:bg-red-100 cs_radius_10 text-red-600 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {users.last_page > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#307BC4]/10">
                <div className="text-sm cs_body_color cs_secondary_font">
                  Showing {((users.current_page - 1) * users.per_page) + 1} to {Math.min(users.current_page * users.per_page, users.total)} of {users.total} users
                </div>
                <div className="flex items-center gap-2">
                  {/* Pagination buttons would go here */}
                </div>
              </div>
            )}
          </ProHealthCard>
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
    </SuperAdminLayout>
  )
}
