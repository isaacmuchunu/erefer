import React, { useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import SuperAdminLayout from '@/layouts/SuperAdminLayout'
import { 
  Shield, 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'

interface Permission {
  id: number
  name: string
  slug: string
  description: string
  category: string
  is_active: boolean
  created_at: string
  roles_count: number
}

interface Role {
  id: number
  name: string
  slug: string
  description: string
  level: number
  is_active: boolean
  color: string
  icon: string
  permissions_count: number
  users_count: number
}

interface PermissionsManagementProps {
  permissions: Permission[]
  roles: Role[]
  user: any
}

export default function PermissionsManagement({ permissions, roles, user }: PermissionsManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = []
    }
    acc[permission.category].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  // Filter permissions
  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || permission.category === selectedCategory
    const matchesActive = showInactive || permission.is_active
    
    return matchesSearch && matchesCategory && matchesActive
  })

  const categories = [...new Set(permissions.map(p => p.category))]

  const handleSelectPermission = (permissionId: number) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const handleSelectAll = () => {
    if (selectedPermissions.length === filteredPermissions.length) {
      setSelectedPermissions([])
    } else {
      setSelectedPermissions(filteredPermissions.map(p => p.id))
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      user_management: 'bg-blue-100 text-blue-800',
      patient_management: 'bg-green-100 text-green-800',
      referral_management: 'bg-purple-100 text-purple-800',
      facility_management: 'bg-indigo-100 text-indigo-800',
      ambulance_management: 'bg-orange-100 text-orange-800',
      emergency_management: 'bg-red-100 text-red-800',
      communication: 'bg-teal-100 text-teal-800',
      reporting: 'bg-yellow-100 text-yellow-800',
      system: 'bg-gray-100 text-gray-800',
      personal: 'bg-pink-100 text-pink-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getRoleColor = (role: Role) => {
    return role.color || '#6B7280'
  }

  return (
    <SuperAdminLayout user={user}>
      <Head title="Permissions Management" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Permissions Management</h1>
            <p className="text-gray-600 mt-1">
              Manage system permissions and role assignments
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="/admin/rbac/permissions/create"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Permission
            </Link>
            <Link
              href="/admin/rbac/roles/create"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Role
            </Link>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Permissions</p>
                <p className="text-3xl font-bold text-gray-900">{permissions.length}</p>
                <p className="text-sm text-green-600 mt-1">
                  {permissions.filter(p => p.is_active).length} active
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Roles</p>
                <p className="text-3xl font-bold text-gray-900">{roles.length}</p>
                <p className="text-sm text-blue-600 mt-1">
                  {roles.filter(r => r.is_active).length} active
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
                <p className="text-sm text-purple-600 mt-1">Permission groups</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Selected</p>
                <p className="text-3xl font-bold text-gray-900">{selectedPermissions.length}</p>
                <p className="text-sm text-orange-600 mt-1">Permissions</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search permissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => setShowInactive(!showInactive)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showInactive 
                    ? 'bg-red-50 border-red-200 text-red-700' 
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                {showInactive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showInactive ? 'Hide Inactive' : 'Show Inactive'}
              </button>
              
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                {selectedPermissions.length === filteredPermissions.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>
        </div>

        {/* Roles Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">System Roles</h3>
              <p className="text-sm text-gray-600">Role hierarchy and permissions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((role) => (
              <div key={role.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getRoleColor(role) }}
                    />
                    <span className="font-medium text-gray-900">{role.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {role.is_active ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{role.permissions_count} permissions</span>
                  <span>{role.users_count} users</span>
                </div>
                
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/admin/rbac/roles/${role.id}/edit`}
                    className="flex-1 text-center px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded hover:bg-blue-100 transition-colors"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/admin/rbac/roles/${role.id}`}
                    className="flex-1 text-center px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded hover:bg-gray-100 transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions by Category */}
        <div className="space-y-6">
          {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => {
            const filteredCategoryPermissions = categoryPermissions.filter(permission => {
              const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   permission.description.toLowerCase().includes(searchTerm.toLowerCase())
              const matchesActive = showInactive || permission.is_active
              
              return matchesSearch && matchesActive
            }).filter(permission => !selectedCategory || permission.category === selectedCategory)

            if (filteredCategoryPermissions.length === 0) return null

            return (
              <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(category)}`}>
                      {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className="text-sm text-gray-600">
                      {filteredCategoryPermissions.length} permissions
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCategoryPermissions.map((permission) => (
                    <div 
                      key={permission.id} 
                      className={`p-4 border rounded-lg transition-all cursor-pointer ${
                        selectedPermissions.includes(permission.id)
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!permission.is_active ? 'opacity-50' : ''}`}
                      onClick={() => handleSelectPermission(permission.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{permission.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{permission.description}</p>
                          <div className="flex items-center gap-2">
                            <code className="px-2 py-1 bg-gray-100 text-xs font-mono text-gray-700 rounded">
                              {permission.slug}
                            </code>
                            {!permission.is_active && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={() => handleSelectPermission(permission.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{permission.roles_count} roles</span>
                        <span>{new Date(permission.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bulk Actions */}
        {selectedPermissions.length > 0 && (
          <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                {selectedPermissions.length} selected
              </span>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded hover:bg-green-200 transition-colors">
                  Activate
                </button>
                <button className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded hover:bg-red-200 transition-colors">
                  Deactivate
                </button>
                <button className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded hover:bg-blue-200 transition-colors">
                  Assign to Role
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  )
}