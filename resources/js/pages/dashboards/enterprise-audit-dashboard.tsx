import React, { useState, useEffect } from 'react'
import { Head, Link } from '@inertiajs/react'
import SuperAdminLayout from '@/layouts/SuperAdminLayout'
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Clock, 
  User, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileText, 
  Database, 
  Lock, 
  Unlock, 
  Settings, 
  Globe, 
  Smartphone, 
  Monitor, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Users,
  Building2,
  Zap,
  Bell,
  Flag,
  Info,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  MapPin,
  Wifi,
  WifiOff
} from 'lucide-react'

interface AuditEvent {
  id: string
  timestamp: string
  user: {
    id: number
    name: string
    email: string
    role: string
  }
  action: string
  resource_type: string
  resource_id?: string
  details: string
  ip_address: string
  user_agent: string
  location?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'success' | 'failure' | 'warning'
  session_id: string
  changes?: {
    before: any
    after: any
  }
  compliance_flags: string[]
  risk_score: number
}

interface ComplianceMetric {
  standard: string
  score: number
  required: number
  last_audit: string
  next_audit: string
  status: 'compliant' | 'warning' | 'non_compliant'
  findings: number
  remediated: number
}

interface SecurityAlert {
  id: string
  type: 'authentication' | 'authorization' | 'data_access' | 'system' | 'compliance'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  timestamp: string
  status: 'open' | 'investigating' | 'resolved' | 'false_positive'
  affected_users: number
  affected_resources: string[]
  remediation_steps: string[]
}

interface EnterpriseAuditDashboardProps {
  user: any
  audit_data: {
    recent_events: AuditEvent[]
    compliance_metrics: ComplianceMetric[]
    security_alerts: SecurityAlert[]
    statistics: {
      total_events_today: number
      failed_logins_today: number
      data_access_events: number
      compliance_violations: number
      security_incidents: number
      active_sessions: number
      suspicious_activities: number
      automated_responses: number
    }
    trends: {
      daily_events: Array<{ date: string; events: number; violations: number }>
      user_activity: Array<{ user_type: string; events: number; violations: number }>
      resource_access: Array<{ resource: string; accesses: number; violations: number }>
    }
  }
}

export default function EnterpriseAuditDashboard({ user, audit_data }: EnterpriseAuditDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('last_24_hours')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [selectedEventType, setSelectedEventType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Mock data for demonstration
  const mockAuditData = {
    recent_events: [
      {
        id: '1',
        timestamp: '2024-01-15T14:30:25Z',
        user: { id: 1, name: 'John Doe', email: 'john@example.com', role: 'super_admin' },
        action: 'LOGIN_SUCCESS',
        resource_type: 'authentication',
        details: 'Successful login from new device',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'Nairobi, Kenya',
        severity: 'low' as const,
        status: 'success' as const,
        session_id: 'sess_abc123',
        compliance_flags: [],
        risk_score: 15
      },
      {
        id: '2',
        timestamp: '2024-01-15T14:25:10Z',
        user: { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'doctor' },
        action: 'PATIENT_DATA_ACCESS',
        resource_type: 'patient',
        resource_id: 'patient_456',
        details: 'Accessed patient medical records outside normal hours',
        ip_address: '10.0.1.50',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        location: 'Mombasa, Kenya',
        severity: 'medium' as const,
        status: 'warning' as const,
        session_id: 'sess_def456',
        compliance_flags: ['HIPAA_AFTER_HOURS'],
        risk_score: 65,
        changes: {
          before: { access_time: null },
          after: { access_time: '2024-01-15T14:25:10Z', accessed_sections: ['medical_history', 'medications'] }
        }
      },
      {
        id: '3',
        timestamp: '2024-01-15T14:20:45Z',
        user: { id: 3, name: 'Unknown User', email: 'unknown@suspicious.com', role: 'unknown' },
        action: 'LOGIN_FAILED',
        resource_type: 'authentication',
        details: 'Multiple failed login attempts from suspicious IP',
        ip_address: '45.123.45.67',
        user_agent: 'curl/7.68.0',
        location: 'Unknown',
        severity: 'high' as const,
        status: 'failure' as const,
        session_id: 'sess_failed',
        compliance_flags: ['BRUTE_FORCE_ATTEMPT'],
        risk_score: 85
      },
      {
        id: '4',
        timestamp: '2024-01-15T14:15:30Z',
        user: { id: 4, name: 'Admin User', email: 'admin@hospital.com', role: 'hospital_admin' },
        action: 'USER_ROLE_CHANGE',
        resource_type: 'user',
        resource_id: 'user_789',
        details: 'Changed user role from nurse to doctor without approval workflow',
        ip_address: '192.168.1.200',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        location: 'Nairobi, Kenya',
        severity: 'critical' as const,
        status: 'warning' as const,
        session_id: 'sess_ghi789',
        compliance_flags: ['PRIVILEGE_ESCALATION', 'APPROVAL_BYPASS'],
        risk_score: 95,
        changes: {
          before: { role: 'nurse', permissions: ['patient_view', 'patient_edit'] },
          after: { role: 'doctor', permissions: ['patient_view', 'patient_edit', 'patient_create', 'referral_create'] }
        }
      },
      {
        id: '5',
        timestamp: '2024-01-15T14:10:15Z',
        user: { id: 5, name: 'System Backup', email: 'system@hospital.com', role: 'system' },
        action: 'DATA_EXPORT',
        resource_type: 'database',
        details: 'Automated daily backup completed successfully',
        ip_address: '127.0.0.1',
        user_agent: 'System Process',
        location: 'Server Room',
        severity: 'low' as const,
        status: 'success' as const,
        session_id: 'sys_backup',
        compliance_flags: [],
        risk_score: 5
      }
    ],
    compliance_metrics: [
      {
        standard: 'HIPAA Compliance',
        score: 96,
        required: 95,
        last_audit: '2024-01-01',
        next_audit: '2024-04-01',
        status: 'compliant' as const,
        findings: 8,
        remediated: 7
      },
      {
        standard: 'ISO 27001',
        score: 92,
        required: 90,
        last_audit: '2023-12-15',
        next_audit: '2024-03-15',
        status: 'compliant' as const,
        findings: 12,
        remediated: 10
      },
      {
        standard: 'SOX Compliance',
        score: 87,
        required: 85,
        last_audit: '2024-01-10',
        next_audit: '2024-04-10',
        status: 'warning' as const,
        findings: 15,
        remediated: 12
      },
      {
        standard: 'GDPR Compliance',
        score: 94,
        required: 90,
        last_audit: '2023-12-20',
        next_audit: '2024-03-20',
        status: 'compliant' as const,
        findings: 6,
        remediated: 6
      }
    ],
    security_alerts: [
      {
        id: 'alert_1',
        type: 'authentication' as const,
        severity: 'high' as const,
        title: 'Brute Force Attack Detected',
        description: 'Multiple failed login attempts from IP 45.123.45.67 targeting admin accounts',
        timestamp: '2024-01-15T14:20:45Z',
        status: 'investigating' as const,
        affected_users: 3,
        affected_resources: ['login_system', 'admin_panel'],
        remediation_steps: [
          'IP address has been temporarily blocked',
          'Affected accounts have been notified',
          'Additional monitoring enabled'
        ]
      },
      {
        id: 'alert_2',
        type: 'data_access' as const,
        severity: 'medium' as const,
        title: 'Unusual Data Access Pattern',
        description: 'Doctor accessing patient records outside normal working hours',
        timestamp: '2024-01-15T14:25:10Z',
        status: 'open' as const,
        affected_users: 1,
        affected_resources: ['patient_records'],
        remediation_steps: [
          'Manager notification sent',
          'Access pattern being reviewed',
          'User will be contacted for verification'
        ]
      },
      {
        id: 'alert_3',
        type: 'compliance' as const,
        severity: 'critical' as const,
        title: 'Privilege Escalation Without Approval',
        description: 'User role changed from nurse to doctor bypassing approval workflow',
        timestamp: '2024-01-15T14:15:30Z',
        status: 'open' as const,
        affected_users: 1,
        affected_resources: ['user_management', 'role_system'],
        remediation_steps: [
          'Role change has been reverted',
          'Approval workflow investigation initiated',
          'Security team has been notified'
        ]
      }
    ],
    statistics: {
      total_events_today: 1247,
      failed_logins_today: 23,
      data_access_events: 456,
      compliance_violations: 7,
      security_incidents: 3,
      active_sessions: 89,
      suspicious_activities: 12,
      automated_responses: 5
    },
    trends: {
      daily_events: [
        { date: '2024-01-09', events: 980, violations: 3 },
        { date: '2024-01-10', events: 1120, violations: 5 },
        { date: '2024-01-11', events: 1050, violations: 2 },
        { date: '2024-01-12', events: 1180, violations: 8 },
        { date: '2024-01-13', events: 1090, violations: 4 },
        { date: '2024-01-14', events: 1200, violations: 6 },
        { date: '2024-01-15', events: 1247, violations: 7 }
      ],
      user_activity: [
        { user_type: 'doctor', events: 450, violations: 2 },
        { user_type: 'nurse', events: 320, violations: 1 },
        { user_type: 'admin', events: 180, violations: 3 },
        { user_type: 'dispatcher', events: 150, violations: 0 },
        { user_type: 'patient', events: 90, violations: 1 }
      ],
      resource_access: [
        { resource: 'patient_records', accesses: 890, violations: 4 },
        { resource: 'user_management', accesses: 120, violations: 2 },
        { resource: 'system_settings', accesses: 80, violations: 1 },
        { resource: 'reports', accesses: 200, violations: 0 },
        { resource: 'audit_logs', accesses: 45, violations: 0 }
      ]
    }
  }

  const data = audit_data || mockAuditData

  const refreshDashboard = async () => {
    setRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false)
    }, 2000)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'failure': return 'bg-red-100 text-red-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'non_compliant': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAlertStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'investigating': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'false_positive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600'
    if (score >= 60) return 'text-orange-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const filteredEvents = data.recent_events.filter(event => {
    const matchesSearch = event.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.action.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSeverity = selectedSeverity === 'all' || event.severity === selectedSeverity
    const matchesType = selectedEventType === 'all' || event.resource_type === selectedEventType
    
    return matchesSearch && matchesSeverity && matchesType
  })

  return (
    <SuperAdminLayout user={user}>
      <Head title="Enterprise Audit & Compliance Dashboard" />
      
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit & Compliance Center</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive security monitoring, audit logging, and compliance tracking
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="last_1_hour">Last Hour</option>
              <option value="last_24_hours">Last 24 Hours</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
            </select>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="h-4 w-4" />
              Export Audit Log
            </button>
            
            <button
              onClick={refreshDashboard}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Security Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events Today</p>
                <p className="text-3xl font-bold text-gray-900">{data.statistics.total_events_today.toLocaleString()}</p>
                <p className="text-sm text-blue-600 mt-1">{data.statistics.active_sessions} active sessions</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Incidents</p>
                <p className="text-3xl font-bold text-gray-900">{data.statistics.security_incidents}</p>
                <p className="text-sm text-red-600 mt-1">{data.statistics.suspicious_activities} suspicious activities</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Violations</p>
                <p className="text-3xl font-bold text-gray-900">{data.statistics.compliance_violations}</p>
                <p className="text-sm text-orange-600 mt-1">{data.statistics.failed_logins_today} failed logins</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Automated Responses</p>
                <p className="text-3xl font-bold text-gray-900">{data.statistics.automated_responses}</p>
                <p className="text-sm text-green-600 mt-1">{data.statistics.data_access_events} data accesses</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Security Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Active Security Alerts</h3>
                <p className="text-sm text-gray-600">Critical security incidents requiring attention</p>
              </div>
            </div>
            <Link
              href="/admin/security/alerts"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              View All Alerts
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {data.security_alerts.map((alert) => (
              <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertStatusColor(alert.status)}`}>
                        {alert.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{formatDateTime(alert.timestamp)}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{alert.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span>Affected Users: {alert.affected_users}</span>
                      <span>Resources: {alert.affected_resources.join(', ')}</span>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs font-medium text-gray-700 mb-2">Remediation Steps:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {alert.remediation_steps.map((step, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Compliance Status</h3>
                <p className="text-sm text-gray-600">Regulatory compliance monitoring</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.compliance_metrics.map((metric, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{metric.standard}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplianceStatusColor(metric.status)}`}>
                    {metric.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Score</span>
                    <span className="text-sm font-semibold text-gray-900">{metric.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${metric.score >= metric.required ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">Required: {metric.required}%</span>
                    <span className={`text-xs font-medium ${metric.score >= metric.required ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.score >= metric.required ? 'Compliant' : 'Non-Compliant'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Findings:</span>
                    <span>{metric.findings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remediated:</span>
                    <span className="text-green-600">{metric.remediated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Audit:</span>
                    <span>{new Date(metric.next_audit).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Event Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search audit events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <select 
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              
              <select 
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Event Types</option>
                <option value="authentication">Authentication</option>
                <option value="patient">Patient Data</option>
                <option value="user">User Management</option>
                <option value="system">System</option>
                <option value="database">Database</option>
              </select>
            </div>
          </div>

          {/* Recent Audit Events */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Audit Events</h3>
              <span className="text-sm text-gray-500">({filteredEvents.length} events)</span>
            </div>
            
            {filteredEvents.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(event.severity)}`}>
                        {event.severity.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{formatDateTime(event.timestamp)}</span>
                      <span className={`text-xs font-medium ${getRiskScoreColor(event.risk_score)}`}>
                        Risk: {event.risk_score}/100
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{event.user.name}</span>
                        <span className="text-xs text-gray-500">({event.user.role})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-600">{event.ip_address}</span>
                        {event.location && <span className="text-xs text-gray-500">• {event.location}</span>}
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-900">{event.action}</span>
                      {event.resource_type && (
                        <span className="text-sm text-gray-600 ml-2">on {event.resource_type}</span>
                      )}
                      {event.resource_id && (
                        <span className="text-sm text-gray-500 ml-1">({event.resource_id})</span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{event.details}</p>
                    
                    {event.compliance_flags.length > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <Flag className="h-4 w-4 text-red-500" />
                        <div className="flex flex-wrap gap-1">
                          {event.compliance_flags.map((flag, index) => (
                            <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                              {flag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {event.changes && (
                      <button
                        onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        {expandedEvent === event.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        View Changes
                      </button>
                    )}
                    
                    {expandedEvent === event.id && event.changes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-xs font-medium text-gray-700 mb-2">Before:</h5>
                            <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                              {JSON.stringify(event.changes.before, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <h5 className="text-xs font-medium text-gray-700 mb-2">After:</h5>
                            <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                              {JSON.stringify(event.changes.after, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  )
}