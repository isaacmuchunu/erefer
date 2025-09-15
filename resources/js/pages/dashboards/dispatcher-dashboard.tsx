import React from 'react'
import { Head, Link } from '@inertiajs/react'
import { Truck, Phone, Navigation, Building2, AlertTriangle, Clock, MapPin, Activity, Users, FileText, Plus, Radio } from 'lucide-react'
import DashboardLayout from '@/layouts/dashboard-layout'
import { ProHealthCard, ProHealthStatCard, ProHealthButton } from '@/components/prohealth'

interface DispatcherDashboardProps {
  user: {
    id: number
    first_name: string
    last_name: string
    email: string
    role: string
    dispatch_zone?: string
    shift?: string
  }
  stats: {
    active_ambulances: number
    pending_calls: number
    completed_dispatches: number
    average_response_time: string
    emergency_calls_today: number
    resources_allocated: number
  }
  active_ambulances: Array<{
    id: number
    vehicle_number: string
    driver_name: string
    status: 'available' | 'dispatched' | 'en_route' | 'at_scene' | 'transporting' | 'maintenance'
    location: string
    current_assignment?: string
    eta?: string
    fuel_level: number
  }>
  emergency_calls: Array<{
    id: number
    caller_name: string
    location: string
    emergency_type: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    status: 'pending' | 'dispatched' | 'en_route' | 'resolved'
    time_received: string
    assigned_ambulance?: string
  }>
  recent_dispatches: Array<{
    id: number
    ambulance: string
    destination: string
    patient_info: string
    dispatch_time: string
    completion_time?: string
    status: 'completed' | 'in_progress' | 'cancelled'
  }>
  resource_allocation: Array<{
    zone: string
    ambulances_available: number
    ambulances_busy: number
    pending_calls: number
    coverage_status: 'optimal' | 'adequate' | 'stretched' | 'critical'
  }>
}

export default function DispatcherDashboard({ 
  user, 
  stats, 
  active_ambulances, 
  emergency_calls, 
  recent_dispatches, 
  resource_allocation 
}: DispatcherDashboardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return 'text-green-600 bg-green-100'
      case 'dispatched': return 'text-blue-600 bg-blue-100'
      case 'en_route': return 'text-purple-600 bg-purple-100'
      case 'at_scene': return 'text-orange-600 bg-orange-100'
      case 'transporting': return 'text-indigo-600 bg-indigo-100'
      case 'maintenance': return 'text-red-600 bg-red-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'cancelled': return 'text-gray-600 bg-gray-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'resolved': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-green-600 bg-green-100'
    }
  }

  const getCoverageColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'optimal': return 'text-green-600 bg-green-100'
      case 'adequate': return 'text-blue-600 bg-blue-100'
      case 'stretched': return 'text-orange-600 bg-orange-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <DashboardLayout user={user}>
      <Head title="Dispatch Center — eRefer Kenya" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="cs_fs_32 cs_primary_font cs_bold cs_heading_color">Dispatch Center</h1>
              <p className="cs_body_color cs_secondary_font">Emergency response coordination and ambulance management</p>
              <div className="flex items-center gap-4 mt-2">
                {user.dispatch_zone && (
                  <span className="text-sm cs_body_color">Zone: {user.dispatch_zone}</span>
                )}
                {user.shift && (
                  <span className="text-sm cs_body_color">Shift: {user.shift}</span>
                )}
                <span className="inline-flex items-center gap-2 px-3 py-1 cs_radius_15 bg-green-100 text-green-800 text-sm cs_semibold">
                  <Radio className="h-4 w-4" />
                  Radio Active
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ProHealthButton variant="outline" icon={MapPin} href="/dispatcher/map">
                Live Map
              </ProHealthButton>
              <ProHealthButton variant="outline" icon={FileText} href="/dispatcher/reports">
                Dispatch Reports
              </ProHealthButton>
              <ProHealthButton variant="primary" icon={Phone} href="/dispatcher/emergency-call">
                New Emergency Call
              </ProHealthButton>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <ProHealthStatCard
              value={stats.active_ambulances.toString()}
              label="Active Ambulances"
              icon={Truck}
              trend="Currently deployed"
            />
            <ProHealthStatCard
              value={stats.pending_calls.toString()}
              label="Pending Calls"
              icon={Phone}
              trend="Awaiting dispatch"
            />
            <ProHealthStatCard
              value={stats.completed_dispatches.toString()}
              label="Completed Today"
              icon={Activity}
              trend="Successful dispatches"
            />
            <ProHealthStatCard
              value={stats.average_response_time}
              label="Avg Response Time"
              icon={Clock}
              trend="Last 24 hours"
            />
            <ProHealthStatCard
              value={stats.emergency_calls_today.toString()}
              label="Emergency Calls"
              icon={AlertTriangle}
              trend="Today"
            />
            <ProHealthStatCard
              value={stats.resources_allocated.toString()}
              label="Resources Allocated"
              icon={Building2}
              trend="Current deployment"
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Active Ambulances */}
            <div className="lg:col-span-2">
              <ProHealthCard title="Active Ambulance Fleet">
                <div className="space-y-4">
                  {active_ambulances.map((ambulance) => (
                    <div key={ambulance.id} className="p-4 border border-[#307BC4]/10 cs_radius_15 hover:cs_shadow_1 transition-all duration-300">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="cs_fs_16 cs_semibold cs_heading_color cs_primary_font">
                            {ambulance.vehicle_number}
                          </h4>
                          <p className="text-sm cs_body_color cs_secondary_font">
                            Driver: {ambulance.driver_name}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className={`px-3 py-1 cs_radius_15 text-xs cs_semibold ${getStatusColor(ambulance.status)}`}>
                            {ambulance.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-12 bg-gray-200 cs_radius_10 h-2">
                              <div 
                                className={`h-2 cs_radius_10 ${ambulance.fuel_level > 50 ? 'bg-green-500' : ambulance.fuel_level > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${ambulance.fuel_level}%` }}
                              />
                            </div>
                            <span className="text-xs cs_body_color">{ambulance.fuel_level}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm cs_body_color cs_secondary_font">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>Location: {ambulance.location}</span>
                        </div>
                        {ambulance.current_assignment && (
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            <span>Assignment: {ambulance.current_assignment}</span>
                          </div>
                        )}
                        {ambulance.eta && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>ETA: {ambulance.eta}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-end mt-3 gap-2">
                        <ProHealthButton variant="text" size="sm" href={`/dispatcher/ambulances/${ambulance.id}/track`}>
                          Track
                        </ProHealthButton>
                        <ProHealthButton variant="text" size="sm" href={`/dispatcher/ambulances/${ambulance.id}/contact`}>
                          Contact
                        </ProHealthButton>
                      </div>
                    </div>
                  ))}
                </div>
              </ProHealthCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Emergency Calls */}
              <ProHealthCard title="Emergency Calls Queue">
                <div className="space-y-3">
                  {emergency_calls.slice(0, 5).map((call) => (
                    <div key={call.id} className="p-3 border border-[#307BC4]/10 cs_radius_10 hover:bg-[#307BC4]/5 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm cs_semibold cs_heading_color cs_primary_font">{call.caller_name}</p>
                          <p className="text-xs cs_body_color cs_secondary_font">{call.emergency_type}</p>
                        </div>
                        <span className={`px-2 py-1 cs_radius_10 text-xs cs_semibold ${getPriorityColor(call.priority)}`}>
                          {call.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs cs_body_color cs_secondary_font">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>{call.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>{call.time_received}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`px-2 py-1 cs_radius_10 text-xs cs_semibold ${getStatusColor(call.status)}`}>
                          {call.status.toUpperCase()}
                        </span>
                        {call.status === 'pending' && (
                          <ProHealthButton variant="text" size="sm" href={`/dispatcher/calls/${call.id}/dispatch`}>
                            Dispatch
                          </ProHealthButton>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ProHealthCard>

              {/* Resource Allocation */}
              <ProHealthCard title="Zone Coverage">
                <div className="space-y-3">
                  {resource_allocation.map((zone, index) => (
                    <div key={index} className="p-3 border border-[#307BC4]/10 cs_radius_10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm cs_semibold cs_heading_color cs_primary_font">{zone.zone}</span>
                        <span className={`px-2 py-1 cs_radius_10 text-xs cs_semibold ${getCoverageColor(zone.coverage_status)}`}>
                          {zone.coverage_status.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs cs_body_color cs_secondary_font">
                        <div>Available: {zone.ambulances_available}</div>
                        <div>Busy: {zone.ambulances_busy}</div>
                        <div>Calls: {zone.pending_calls}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ProHealthCard>

              {/* Quick Actions */}
              <ProHealthCard title="Quick Actions">
                <div className="space-y-3">
                  <ProHealthButton variant="outline" className="w-full justify-start" icon={Phone}>
                    Emergency Hotline
                  </ProHealthButton>
                  <ProHealthButton variant="outline" className="w-full justify-start" icon={Truck}>
                    Fleet Status
                  </ProHealthButton>
                  <ProHealthButton variant="outline" className="w-full justify-start" icon={Navigation}>
                    Route Optimization
                  </ProHealthButton>
                  <ProHealthButton variant="outline" className="w-full justify-start" icon={Building2}>
                    Resource Reallocation
                  </ProHealthButton>
                </div>
              </ProHealthCard>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
