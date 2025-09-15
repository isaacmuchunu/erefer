import React from 'react'
import { Head, Link } from '@inertiajs/react'
import { Truck, Navigation, MapPin, Clock, Users, Fuel, Settings, Activity, Phone, AlertTriangle, CheckCircle, Calendar } from 'lucide-react'
import DashboardLayout from '@/layouts/dashboard-layout'
import { ProHealthCard, ProHealthStatCard, ProHealthButton } from '@/components/prohealth'

interface DriverDashboardProps {
  user: {
    id: number
    first_name: string
    last_name: string
    email: string
    role: string
    license_number?: string
    vehicle_assigned?: string
  }
  stats: {
    trips_completed: number
    trips_today: number
    total_distance: string
    average_response_time: string
    fuel_efficiency: string
    safety_score: number
  }
  current_assignment?: {
    id: number
    type: 'pickup' | 'transport' | 'emergency'
    patient_name: string
    pickup_location: string
    destination: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    estimated_time: string
    special_instructions?: string
  }
  vehicle_status: {
    vehicle_number: string
    fuel_level: number
    mileage: number
    last_maintenance: string
    next_maintenance: string
    status: 'operational' | 'maintenance_due' | 'maintenance_required'
    equipment_status: Array<{
      item: string
      status: 'ok' | 'warning' | 'critical'
    }>
  }
  recent_trips: Array<{
    id: number
    patient_name: string
    pickup_location: string
    destination: string
    trip_date: string
    duration: string
    distance: string
    status: 'completed' | 'cancelled' | 'in_progress'
  }>
  upcoming_schedule: Array<{
    id: number
    time: string
    type: string
    location: string
    notes?: string
  }>
  navigation_info?: {
    current_location: string
    destination: string
    eta: string
    distance_remaining: string
    traffic_status: 'light' | 'moderate' | 'heavy'
  }
}

export default function DriverDashboard({ 
  user, 
  stats, 
  current_assignment, 
  vehicle_status, 
  recent_trips, 
  upcoming_schedule,
  navigation_info 
}: DriverDashboardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational': return 'text-green-600 bg-green-100'
      case 'maintenance_due': return 'text-orange-600 bg-orange-100'
      case 'maintenance_required': return 'text-red-600 bg-red-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'cancelled': return 'text-gray-600 bg-gray-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'ok': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-orange-600 bg-orange-100'
      case 'critical': return 'text-red-600 bg-red-100'
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

  const getTrafficColor = (traffic: string) => {
    switch (traffic.toLowerCase()) {
      case 'light': return 'text-green-600'
      case 'moderate': return 'text-yellow-600'
      case 'heavy': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <DashboardLayout user={user}>
      <Head title="Driver Dashboard — eRefer Kenya" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="cs_fs_32 cs_primary_font cs_bold cs_heading_color">Driver Dashboard</h1>
              <p className="cs_body_color cs_secondary_font">Trip management and vehicle operations</p>
              <div className="flex items-center gap-4 mt-2">
                {user.vehicle_assigned && (
                  <span className="text-sm cs_body_color">Vehicle: {user.vehicle_assigned}</span>
                )}
                {user.license_number && (
                  <span className="text-sm cs_body_color">License: {user.license_number}</span>
                )}
                <span className={`inline-flex items-center gap-2 px-3 py-1 cs_radius_15 text-sm cs_semibold ${getStatusColor(vehicle_status.status)}`}>
                  <Truck className="h-4 w-4" />
                  {vehicle_status.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ProHealthButton variant="outline" icon={Navigation} href="/driver/navigation">
                Navigation
              </ProHealthButton>
              <ProHealthButton variant="outline" icon={Settings} href="/driver/vehicle">
                Vehicle Check
              </ProHealthButton>
              <ProHealthButton variant="primary" icon={Phone} href="/driver/contact-dispatch">
                Contact Dispatch
              </ProHealthButton>
            </div>
          </div>

          {/* Current Assignment Alert */}
          {current_assignment && (
            <div className="mb-8">
              <ProHealthCard className="border-l-4 border-l-[#307BC4]">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="cs_fs_20 cs_primary_font cs_bold cs_heading_color mb-2">Current Assignment</h3>
                    <div className="space-y-2">
                      <p className="cs_fs_16 cs_semibold cs_heading_color">
                        {current_assignment.type.toUpperCase()}: {current_assignment.patient_name}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm cs_body_color cs_secondary_font">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>From: {current_assignment.pickup_location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Navigation className="h-4 w-4" />
                          <span>To: {current_assignment.destination}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>ETA: {current_assignment.estimated_time}</span>
                        </div>
                        <div>
                          <span className={`px-3 py-1 cs_radius_15 text-xs cs_semibold ${getPriorityColor(current_assignment.priority)}`}>
                            {current_assignment.priority.toUpperCase()} PRIORITY
                          </span>
                        </div>
                      </div>
                      {current_assignment.special_instructions && (
                        <div className="mt-3 p-3 bg-yellow-50 cs_radius_10">
                          <p className="text-sm cs_semibold text-yellow-800">Special Instructions:</p>
                          <p className="text-sm text-yellow-700">{current_assignment.special_instructions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <ProHealthButton variant="primary" size="sm" href={`/driver/trips/${current_assignment.id}/navigate`}>
                      Start Navigation
                    </ProHealthButton>
                    <ProHealthButton variant="outline" size="sm" href={`/driver/trips/${current_assignment.id}/update`}>
                      Update Status
                    </ProHealthButton>
                  </div>
                </div>
              </ProHealthCard>
            </div>
          )}

          {/* Navigation Info */}
          {navigation_info && (
            <div className="mb-8">
              <ProHealthCard title="Navigation Status">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="cs_fs_24 cs_bold cs_accent_color cs_primary_font">{navigation_info.eta}</div>
                    <div className="text-sm cs_body_color cs_secondary_font mt-1">ETA</div>
                  </div>
                  <div className="text-center">
                    <div className="cs_fs_24 cs_bold cs_accent_color cs_primary_font">{navigation_info.distance_remaining}</div>
                    <div className="text-sm cs_body_color cs_secondary_font mt-1">Distance</div>
                  </div>
                  <div className="text-center">
                    <div className={`cs_fs_24 cs_bold cs_primary_font ${getTrafficColor(navigation_info.traffic_status)}`}>
                      {navigation_info.traffic_status.toUpperCase()}
                    </div>
                    <div className="text-sm cs_body_color cs_secondary_font mt-1">Traffic</div>
                  </div>
                  <div className="text-center">
                    <ProHealthButton variant="primary" icon={Navigation} href="/driver/navigation/live">
                      Live Navigation
                    </ProHealthButton>
                  </div>
                </div>
              </ProHealthCard>
            </div>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <ProHealthStatCard
              value={stats.trips_completed.toString()}
              label="Total Trips"
              icon={Truck}
              trend="All time"
            />
            <ProHealthStatCard
              value={stats.trips_today.toString()}
              label="Trips Today"
              icon={Activity}
              trend="Current shift"
            />
            <ProHealthStatCard
              value={stats.total_distance}
              label="Total Distance"
              icon={Navigation}
              trend="This month"
            />
            <ProHealthStatCard
              value={stats.average_response_time}
              label="Avg Response"
              icon={Clock}
              trend="Last 30 days"
            />
            <ProHealthStatCard
              value={stats.fuel_efficiency}
              label="Fuel Efficiency"
              icon={Fuel}
              trend="L/100km"
            />
            <ProHealthStatCard
              value={`${stats.safety_score}%`}
              label="Safety Score"
              icon={CheckCircle}
              trend="Excellent"
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Vehicle Status */}
            <div className="lg:col-span-2">
              <ProHealthCard title={`Vehicle Status - ${vehicle_status.vehicle_number}`}>
                <div className="space-y-6">
                  {/* Fuel and Mileage */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm cs_semibold cs_heading_color">Fuel Level</span>
                        <span className="text-sm cs_body_color">{vehicle_status.fuel_level}%</span>
                      </div>
                      <div className="w-full bg-gray-200 cs_radius_10 h-3">
                        <div 
                          className={`h-3 cs_radius_10 ${vehicle_status.fuel_level > 50 ? 'bg-green-500' : vehicle_status.fuel_level > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${vehicle_status.fuel_level}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm cs_semibold cs_heading_color mb-2">Mileage</div>
                      <div className="cs_fs_20 cs_bold cs_accent_color cs_primary_font">{vehicle_status.mileage.toLocaleString()} km</div>
                    </div>
                  </div>

                  {/* Maintenance Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm cs_semibold cs_heading_color mb-2">Last Maintenance</div>
                      <div className="text-sm cs_body_color">{vehicle_status.last_maintenance}</div>
                    </div>
                    <div>
                      <div className="text-sm cs_semibold cs_heading_color mb-2">Next Maintenance</div>
                      <div className="text-sm cs_body_color">{vehicle_status.next_maintenance}</div>
                    </div>
                  </div>

                  {/* Equipment Status */}
                  <div>
                    <h4 className="text-sm cs_semibold cs_heading_color mb-3">Equipment Status</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {vehicle_status.equipment_status.map((equipment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-[#307BC4]/10 cs_radius_10">
                          <span className="text-sm cs_secondary_font">{equipment.item}</span>
                          <span className={`px-2 py-1 cs_radius_10 text-xs cs_semibold ${getStatusColor(equipment.status)}`}>
                            {equipment.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ProHealthCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Recent Trips */}
              <ProHealthCard title="Recent Trips">
                <div className="space-y-3">
                  {recent_trips.slice(0, 4).map((trip) => (
                    <div key={trip.id} className="p-3 border border-[#307BC4]/10 cs_radius_10 hover:bg-[#307BC4]/5 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm cs_semibold cs_heading_color cs_primary_font">{trip.patient_name}</p>
                          <p className="text-xs cs_body_color cs_secondary_font">
                            {trip.pickup_location} → {trip.destination}
                          </p>
                        </div>
                        <span className={`px-2 py-1 cs_radius_10 text-xs cs_semibold ${getStatusColor(trip.status)}`}>
                          {trip.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs cs_body_color cs_secondary_font">
                        <span>{new Date(trip.trip_date).toLocaleDateString()}</span>
                        <span>{trip.duration} • {trip.distance}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ProHealthCard>

              {/* Upcoming Schedule */}
              <ProHealthCard title="Upcoming Schedule">
                <div className="space-y-3">
                  {upcoming_schedule.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-[#307BC4]/5 cs_radius_10 transition-colors">
                      <div className="w-10 h-10 cs_radius_10 bg-[#307BC4]/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-4 w-4 cs_accent_color" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm cs_semibold cs_heading_color cs_primary_font">{item.type}</p>
                        <p className="text-xs cs_body_color cs_secondary_font">{item.location}</p>
                        <p className="text-xs cs_accent_color cs_secondary_font">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ProHealthCard>

              {/* Quick Actions */}
              <ProHealthCard title="Quick Actions">
                <div className="space-y-3">
                  <ProHealthButton variant="outline" className="w-full justify-start" icon={Phone}>
                    Emergency Contact
                  </ProHealthButton>
                  <ProHealthButton variant="outline" className="w-full justify-start" icon={Fuel}>
                    Fuel Report
                  </ProHealthButton>
                  <ProHealthButton variant="outline" className="w-full justify-start" icon={Settings}>
                    Vehicle Inspection
                  </ProHealthButton>
                  <ProHealthButton variant="outline" className="w-full justify-start" icon={AlertTriangle}>
                    Report Issue
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
