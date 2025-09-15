import React from 'react'
import { Head, Link } from '@inertiajs/react'
import { Stethoscope, FileText, Users, Clock, Send, CheckCircle, AlertCircle, Calendar, Plus, Heart, Activity, TrendingUp } from 'lucide-react'
import DashboardLayout from '@/layouts/dashboard-layout'
import { ProHealthCard, ProHealthStatCard, ProHealthButton } from '@/components/prohealth'

interface DoctorDashboardProps {
  user: {
    id: number
    first_name: string
    last_name: string
    email: string
    role: string
    specialization?: string
    license_number?: string
  }
  stats: {
    total_referrals: number
    pending_referrals: number
    completed_referrals: number
    patients_today: number
    upcoming_appointments: number
    success_rate: number
    avg_response_time: string
  }
  recent_referrals: Array<{
    id: number
    patient_name: string
    patient_age: number
    condition: string
    urgency: 'low' | 'medium' | 'high' | 'emergency'
    status: string
    created_at: string
    facility_to: string
    appointment_date?: string
  }>
  upcoming_appointments: Array<{
    id: number
    patient_name: string
    patient_age: number
    time: string
    type: string
    condition: string
    room?: string
  }>
  recent_patients: Array<{
    id: number
    name: string
    age: number
    last_visit: string
    condition: string
    status: 'stable' | 'improving' | 'critical' | 'discharged'
  }>
}

export default function DoctorDashboard({ user, stats, recent_referrals, upcoming_appointments, recent_patients }: DoctorDashboardProps) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-green-600 bg-green-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'stable': return 'text-green-600 bg-green-100'
      case 'improving': return 'text-blue-600 bg-blue-100'
      case 'critical': return 'text-red-600 bg-red-100'
      case 'discharged': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <DashboardLayout user={user}>
      <Head title="Doctor Dashboard — eRefer Kenya" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="cs_fs_32 cs_primary_font cs_bold cs_heading_color">Doctor Dashboard</h1>
              <p className="cs_body_color cs_secondary_font">Manage referrals and patient care</p>
            </div>
            <div className="flex items-center gap-4">
              <ProHealthButton variant="outline" icon={Calendar}>
                View Schedule
              </ProHealthButton>
              <ProHealthButton variant="primary" icon={Plus}>
                New Referral
              </ProHealthButton>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <ProHealthStatCard
              value={stats.total_referrals.toString()}
              label="Total Referrals"
              icon={FileText}
              trend="+5 this week"
            />
            <ProHealthStatCard
              value={stats.pending_referrals.toString()}
              label="Pending"
              icon={Clock}
              trend="Awaiting response"
            />
            <ProHealthStatCard
              value={stats.completed_referrals.toString()}
              label="Completed"
              icon={CheckCircle}
              trend="This month"
            />
            <ProHealthStatCard
              value={stats.patients_today.toString()}
              label="Patients Today"
              icon={Users}
              trend="Scheduled"
            />
            <ProHealthStatCard
              value={stats.upcoming_appointments.toString()}
              label="Upcoming"
              icon={Calendar}
              trend="Next 7 days"
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Referrals */}
            <div className="lg:col-span-2">
              <ProHealthCard title="Recent Referrals">
                <div className="space-y-4">
                  {recent_referrals.map((referral) => (
                    <div key={referral.id} className="p-4 border border-[#307BC4]/10 cs_radius_15 hover:cs_shadow_1 transition-all duration-300">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="cs_fs_16 cs_semibold cs_heading_color cs_primary_font">{referral.patient_name}</h4>
                          <p className="text-sm cs_body_color cs_secondary_font">{referral.condition}</p>
                        </div>
                        <span className={`px-3 py-1 cs_radius_15 text-xs cs_semibold ${getUrgencyColor(referral.urgency)}`}>
                          {referral.urgency.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm cs_body_color cs_secondary_font">
                        <span>To: {referral.facility_to}</span>
                        <span>{new Date(referral.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 cs_radius_15 text-xs cs_semibold ${
                          referral.status === 'completed' ? 'text-green-600 bg-green-100' :
                          referral.status === 'pending' ? 'text-yellow-600 bg-yellow-100' :
                          'text-blue-600 bg-blue-100'
                        }`}>
                          {referral.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                          {referral.status === 'pending' && <Clock className="h-3 w-3" />}
                          {referral.status === 'in_transit' && <Send className="h-3 w-3" />}
                          {referral.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <ProHealthButton variant="text" size="sm">
                          View Details
                        </ProHealthButton>
                      </div>
                    </div>
                  ))}
                </div>
              </ProHealthCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Upcoming Appointments */}
              <ProHealthCard title="Today's Appointments">
                <div className="space-y-3">
                  {upcoming_appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center gap-3 p-3 hover:bg-[#307BC4]/5 cs_radius_10 transition-colors">
                      <div className="w-10 h-10 cs_radius_10 bg-[#307BC4]/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-4 w-4 cs_accent_color" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm cs_semibold cs_heading_color cs_primary_font">{appointment.patient_name}</p>
                        <p className="text-xs cs_body_color cs_secondary_font">{appointment.time} • {appointment.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ProHealthCard>

              {/* Quick Actions */}
              <ProHealthCard title="Quick Actions">
                <div className="space-y-3">
                  <ProHealthButton variant="outline" className="w-full justify-start" icon={Plus}>
                    Create Referral
                  </ProHealthButton>
                  <ProHealthButton variant="outline" className="w-full justify-start" icon={Users}>
                    View Patients
                  </ProHealthButton>
                  <ProHealthButton variant="outline" className="w-full justify-start" icon={FileText}>
                    Medical Records
                  </ProHealthButton>
                  <ProHealthButton variant="outline" className="w-full justify-start" icon={Calendar}>
                    Schedule Appointment
                  </ProHealthButton>
                </div>
              </ProHealthCard>

              {/* Alerts */}
              <ProHealthCard title="Alerts & Notifications">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-orange-50 cs_radius_10">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm cs_semibold text-orange-800">Urgent Referral</p>
                      <p className="text-xs text-orange-700">Emergency case requires immediate attention</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 cs_radius_10">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm cs_semibold text-blue-800">Referral Accepted</p>
                      <p className="text-xs text-blue-700">Patient John Doe referral accepted by KNH</p>
                    </div>
                  </div>
                </div>
              </ProHealthCard>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
