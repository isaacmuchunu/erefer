import React from 'react'
import { Head, Link } from '@inertiajs/react'
import { UserPlus, Heart, Users, Clock, Calendar, Activity, Pill, FileText, AlertCircle, CheckCircle, TrendingUp, Plus } from 'lucide-react'
import DashboardLayout from '@/layouts/dashboard-layout'
import { ProHealthCard, ProHealthStatCard, ProHealthButton } from '@/components/prohealth'

interface NurseDashboardProps {
  user: {
    id: number
    first_name: string
    last_name: string
    email: string
    role: string
    department?: string
    shift?: string
  }
  stats: {
    patients_assigned: number
    care_plans_active: number
    medications_due: number
    referrals_supported: number
    shift_hours: number
    tasks_completed: number
  }
  assigned_patients: Array<{
    id: number
    name: string
    age: number
    room: string
    condition: string
    status: 'stable' | 'improving' | 'critical' | 'discharged'
    last_vitals: string
    medications_due: number
    care_plan_status: 'on_track' | 'needs_attention' | 'completed'
  }>
  care_plans: Array<{
    id: number
    patient_name: string
    plan_type: string
    status: 'active' | 'completed' | 'pending'
    next_review: string
    priority: 'low' | 'medium' | 'high'
  }>
  medication_schedule: Array<{
    id: number
    patient_name: string
    medication: string
    dosage: string
    time: string
    status: 'pending' | 'administered' | 'missed'
    room: string
  }>
  recent_activities: Array<{
    id: number
    type: string
    description: string
    timestamp: string
    patient?: string
  }>
}

export default function NurseDashboard({ 
  user, 
  stats, 
  assigned_patients, 
  care_plans, 
  medication_schedule, 
  recent_activities 
}: NurseDashboardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'stable': return 'text-green-600 bg-green-100'
      case 'improving': return 'text-blue-600 bg-blue-100'
      case 'critical': return 'text-red-600 bg-red-100'
      case 'discharged': return 'text-gray-600 bg-gray-100'
      case 'on_track': return 'text-green-600 bg-green-100'
      case 'needs_attention': return 'text-orange-600 bg-orange-100'
      case 'completed': return 'text-gray-600 bg-gray-100'
      case 'administered': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'missed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-orange-600 bg-orange-100'
      default: return 'text-green-600 bg-green-100'
    }
  }

  return (
    <DashboardLayout user={user}>
      <Head title="Nurse Dashboard — eRefer Kenya" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="cs_fs_32 cs_primary_font cs_bold cs_heading_color">Nursing Dashboard</h1>
              <p className="cs_body_color cs_secondary_font">Patient care coordination and clinical support</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm cs_body_color">
                  {user.department && `Department: ${user.department}`}
                </span>
                <span className="text-sm cs_body_color">
                  {user.shift && `Shift: ${user.shift}`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ProHealthButton variant="outline" icon={Calendar} href="/nurse/schedule">
                View Schedule
              </ProHealthButton>
              <ProHealthButton variant="outline" icon={FileText} href="/nurse/reports">
                Care Reports
              </ProHealthButton>
              <ProHealthButton variant="primary" icon={Plus} href="/nurse/care-plans/create">
                New Care Plan
              </ProHealthButton>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <ProHealthStatCard
              value={stats.patients_assigned.toString()}
              label="Assigned Patients"
              icon={Users}
              trend="Current shift"
            />
            <ProHealthStatCard
              value={stats.care_plans_active.toString()}
              label="Active Care Plans"
              icon={Heart}
              trend="In progress"
            />
            <ProHealthStatCard
              value={stats.medications_due.toString()}
              label="Medications Due"
              icon={Pill}
              trend="Next 2 hours"
            />
            <ProHealthStatCard
              value={stats.referrals_supported.toString()}
              label="Referrals Supported"
              icon={FileText}
              trend="This week"
            />
            <ProHealthStatCard
              value={`${stats.shift_hours}h`}
              label="Shift Hours"
              icon={Clock}
              trend="Today"
            />
            <ProHealthStatCard
              value={stats.tasks_completed.toString()}
              label="Tasks Completed"
              icon={CheckCircle}
              trend="Today"
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Assigned Patients */}
            <div className="lg:col-span-2">
              <ProHealthCard title="My Assigned Patients">
                <div className="space-y-4">
                  {assigned_patients.map((patient) => (
                    <div key={patient.id} className="p-4 border border-[#307BC4]/10 cs_radius_15 hover:cs_shadow_1 transition-all duration-300">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="cs_fs_16 cs_semibold cs_heading_color cs_primary_font">
                            {patient.name} ({patient.age}y)
                          </h4>
                          <p className="text-sm cs_body_color cs_secondary_font">
                            Room {patient.room} • {patient.condition}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className={`px-3 py-1 cs_radius_15 text-xs cs_semibold ${getStatusColor(patient.status)}`}>
                            {patient.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`px-3 py-1 cs_radius_15 text-xs cs_semibold ${getStatusColor(patient.care_plan_status)}`}>
                            {patient.care_plan_status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm cs_body_color cs_secondary_font">
                        <div>
                          <span className="cs_semibold">Last Vitals:</span> {patient.last_vitals}
                        </div>
                        <div>
                          <span className="cs_semibold">Medications Due:</span> {patient.medications_due}
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-3 gap-2">
                        <ProHealthButton variant="text" size="sm" href={`/nurse/patients/${patient.id}`}>
                          View Details
                        </ProHealthButton>
                        <ProHealthButton variant="text" size="sm" href={`/nurse/patients/${patient.id}/vitals`}>
                          Record Vitals
                        </ProHealthButton>
                      </div>
                    </div>
                  ))}
                </div>
              </ProHealthCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Medication Schedule */}
              <ProHealthCard title="Medication Schedule">
                <div className="space-y-3">
                  {medication_schedule.slice(0, 5).map((med) => (
                    <div key={med.id} className="flex items-center gap-3 p-3 hover:bg-[#307BC4]/5 cs_radius_10 transition-colors">
                      <div className="w-10 h-10 cs_radius_10 bg-[#307BC4]/10 flex items-center justify-center flex-shrink-0">
                        <Pill className="h-4 w-4 cs_accent_color" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm cs_semibold cs_heading_color cs_primary_font">{med.patient_name}</p>
                        <p className="text-xs cs_body_color cs_secondary_font">
                          {med.medication} - {med.dosage}
                        </p>
                        <p className="text-xs cs_accent_color cs_secondary_font">
                          {med.time} • Room {med.room}
                        </p>
                      </div>
                      <span className={`px-2 py-1 cs_radius_10 text-xs cs_semibold ${getStatusColor(med.status)}`}>
                        {med.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </ProHealthCard>

              {/* Care Plans */}
              <ProHealthCard title="Active Care Plans">
                <div className="space-y-3">
                  {care_plans.slice(0, 4).map((plan) => (
                    <div key={plan.id} className="p-3 border border-[#307BC4]/10 cs_radius_10 hover:bg-[#307BC4]/5 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm cs_semibold cs_heading_color cs_primary_font">{plan.patient_name}</p>
                          <p className="text-xs cs_body_color cs_secondary_font">{plan.plan_type}</p>
                        </div>
                        <span className={`px-2 py-1 cs_radius_10 text-xs cs_semibold ${getPriorityColor(plan.priority)}`}>
                          {plan.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 cs_radius_10 text-xs cs_semibold ${getStatusColor(plan.status)}`}>
                          {plan.status.toUpperCase()}
                        </span>
                        <span className="text-xs cs_body_color cs_secondary_font">
                          Review: {new Date(plan.next_review).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ProHealthCard>

              {/* Quick Actions */}
              <ProHealthCard title="Quick Actions">
                <div className="space-y-3">
                  <ProHealthButton variant="outline" className="w-full justify-start" icon={Users}>
                    Patient Handoff
                  </ProHealthButton>
                  <ProHealthButton variant="outline" className="w-full justify-start" icon={Heart}>
                    Update Care Plan
                  </ProHealthButton>
                  <ProHealthButton variant="outline" className="w-full justify-start" icon={Pill}>
                    Medication Admin
                  </ProHealthButton>
                  <ProHealthButton variant="outline" className="w-full justify-start" icon={Activity}>
                    Record Vitals
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
