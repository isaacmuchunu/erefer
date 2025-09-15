import React, { useState, useEffect } from 'react'
import { Head, Link } from '@inertiajs/react'
import DoctorLayout from '@/layouts/DoctorLayout'
import { 
  Users, 
  Calendar, 
  FileText, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Activity,
  Stethoscope,
  Heart,
  Brain,
  Plus,
  ArrowRight,
  TrendingUp,
  UserCheck
} from 'lucide-react'

interface PatientQueueItem {
  id: number
  name: string
  age: number
  condition: string
  priority: 'urgent' | 'high' | 'normal' | 'low'
  appointment_time: string
  status: 'waiting' | 'in_progress' | 'completed'
}

interface Appointment {
  id: number
  patient_name: string
  time: string
  type: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
}

interface Referral {
  id: number
  patient_name: string
  specialty: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  urgency: 'urgent' | 'routine'
}

interface DoctorDashboardStats {
  patient_queue: PatientQueueItem[]
  appointments_today: Appointment[]
  pending_referrals: Referral[]
  clinical_metrics: {
    patients_seen_today: number
    patients_seen_week: number
    avg_consultation_time: number
    patient_satisfaction: number
    pending_lab_results: number
    follow_ups_due: number
  }
  recent_patients: Array<{
    id: number
    name: string
    last_visit: string
    diagnosis: string
    status: string
  }>
}

interface EnhancedDoctorDashboardProps {
  stats: DoctorDashboardStats
  user: any
  doctor: any
}

export default function EnhancedDoctorDashboard({ stats, user, doctor }: EnhancedDoctorDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getTimeStatus = (appointmentTime: string) => {
    const now = new Date()
    const appointment = new Date(appointmentTime)
    const diffMinutes = Math.floor((appointment.getTime() - now.getTime()) / 60000)

    if (diffMinutes < -15) return { status: 'overdue', color: 'text-red-600' }
    if (diffMinutes < 0) return { status: 'current', color: 'text-green-600' }
    if (diffMinutes < 15) return { status: 'upcoming', color: 'text-orange-600' }
    return { status: 'scheduled', color: 'text-gray-600' }
  }

  return (
    <DoctorLayout user={user}>
      <Head title="Doctor Dashboard" />
      
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'}, Dr. {user.last_name}
            </h1>
            <p className="text-gray-600 mt-1">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="/admin/patients/create"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Patient
            </Link>
            <Link
              href="/admin/referrals/create"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="h-4 w-4" />
              New Referral
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Patients Today</p>
                <p className="text-3xl font-bold text-gray-900">{stats.clinical_metrics.patients_seen_today}</p>
                <p className="text-sm text-green-600 mt-1">
                  {stats.patient_queue.filter(p => p.status === 'waiting').length} waiting
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Appointments</p>
                <p className="text-3xl font-bold text-gray-900">{stats.appointments_today.length}</p>
                <p className="text-sm text-blue-600 mt-1">
                  {stats.appointments_today.filter(a => a.status === 'scheduled').length} scheduled
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Referrals</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pending_referrals.length}</p>
                <p className="text-sm text-orange-600 mt-1">
                  {stats.pending_referrals.filter(r => r.urgency === 'urgent').length} urgent
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                <p className="text-3xl font-bold text-gray-900">{stats.clinical_metrics.patient_satisfaction}%</p>
                <p className="text-sm text-green-600 mt-1">Patient rating</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Patient Queue and Today's Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Queue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Patient Queue</h3>
                  <p className="text-sm text-gray-600">Current waiting patients</p>
                </div>
              </div>
              <Link
                href="/admin/patients"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto">
              {stats.patient_queue.map((patient) => {
                const timeStatus = getTimeStatus(patient.appointment_time)
                return (
                  <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-600">Age {patient.age} • {patient.condition}</p>
                        <p className={`text-xs font-medium ${timeStatus.color}`}>
                          {formatTime(patient.appointment_time)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(patient.priority)}`}>
                        {patient.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                        {patient.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                )
              })}

              {stats.patient_queue.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No patients in queue</p>
                </div>
              )}
            </div>
          </div>

          {/* Today's Appointments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Today's Appointments</h3>
                  <p className="text-sm text-gray-600">Scheduled consultations</p>
                </div>
              </div>
              <Link
                href="/admin/appointments"
                className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto">
              {stats.appointments_today.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div>
                      <p className="font-medium text-gray-900">{appointment.patient_name}</p>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatTime(appointment.time)}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}

              {stats.appointments_today.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No appointments scheduled</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Clinical Performance and Pending Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clinical Performance */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Clinical Performance</h3>
                <p className="text-sm text-gray-600">Your practice metrics</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <UserCheck className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.clinical_metrics.patients_seen_week}
                </div>
                <div className="text-sm text-gray-600">Patients This Week</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.clinical_metrics.avg_consultation_time}m
                </div>
                <div className="text-sm text-gray-600">Avg Consultation</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Heart className="h-6 w-6 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.clinical_metrics.patient_satisfaction}%
                </div>
                <div className="text-sm text-gray-600">Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pending Tasks</h3>
                <p className="text-sm text-gray-600">Items requiring attention</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-900">Lab Results</span>
                </div>
                <span className="text-lg font-bold text-red-600">
                  {stats.clinical_metrics.pending_lab_results}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">Follow-ups Due</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">
                  {stats.clinical_metrics.follow_ups_due}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">Referrals</span>
                </div>
                <span className="text-lg font-bold text-orange-600">
                  {stats.pending_referrals.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
                <p className="text-sm text-gray-600">Latest consultations and follow-ups</p>
              </div>
            </div>
            <Link
              href="/admin/patients"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
            >
              View All Patients
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Patient</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Last Visit</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Diagnosis</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_patients.map((patient) => (
                  <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {patient.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{patient.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(patient.last_visit).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{patient.diagnosis}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/patients/${patient.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DoctorLayout>
  )
}