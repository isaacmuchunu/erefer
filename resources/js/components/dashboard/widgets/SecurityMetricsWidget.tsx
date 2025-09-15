import React from 'react'
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye, 
  UserX, 
  Activity,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'

interface SecurityMetric {
  label: string
  value: number
  previousValue?: number
  status: 'safe' | 'warning' | 'critical'
  icon: React.ReactNode
}

interface SecurityMetricsData {
  failed_logins_today: number
  locked_accounts: number
  security_alerts: number
  audit_logs_today: number
  active_sessions: number
  suspicious_activities: number
  password_expires_soon: number
  two_factor_enabled: number
}

interface SecurityMetricsWidgetProps {
  data: SecurityMetricsData
  className?: string
}

export default function SecurityMetricsWidget({ data, className = '' }: SecurityMetricsWidgetProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'text-green-600 bg-green-100 border-green-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getTrendIcon = (current: number, previous?: number) => {
    if (!previous) return <Minus className="h-3 w-3" />
    if (current > previous) return <TrendingUp className="h-3 w-3 text-red-500" />
    if (current < previous) return <TrendingDown className="h-3 w-3 text-green-500" />
    return <Minus className="h-3 w-3 text-gray-500" />
  }

  const metrics: SecurityMetric[] = [
    {
      label: 'Failed Logins Today',
      value: data.failed_logins_today,
      status: data.failed_logins_today > 10 ? 'critical' : data.failed_logins_today > 5 ? 'warning' : 'safe',
      icon: <UserX className="h-4 w-4" />
    },
    {
      label: 'Locked Accounts',
      value: data.locked_accounts,
      status: data.locked_accounts > 5 ? 'critical' : data.locked_accounts > 0 ? 'warning' : 'safe',
      icon: <Lock className="h-4 w-4" />
    },
    {
      label: 'Security Alerts',
      value: data.security_alerts,
      status: data.security_alerts > 5 ? 'critical' : data.security_alerts > 0 ? 'warning' : 'safe',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      label: 'Audit Logs Today',
      value: data.audit_logs_today,
      status: 'safe',
      icon: <Eye className="h-4 w-4" />
    },
    {
      label: 'Active Sessions',
      value: data.active_sessions,
      status: 'safe',
      icon: <Activity className="h-4 w-4" />
    },
    {
      label: 'Suspicious Activities',
      value: data.suspicious_activities,
      status: data.suspicious_activities > 3 ? 'critical' : data.suspicious_activities > 0 ? 'warning' : 'safe',
      icon: <AlertTriangle className="h-4 w-4" />
    }
  ]

  const criticalCount = metrics.filter(m => m.status === 'critical').length
  const warningCount = metrics.filter(m => m.status === 'warning').length
  
  const overallStatus = criticalCount > 0 ? 'critical' : warningCount > 0 ? 'warning' : 'safe'

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Security Metrics</h3>
            <p className="text-sm text-gray-600">Real-time security monitoring</p>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(overallStatus)}`}>
          <Shield className="h-4 w-4" />
          {overallStatus === 'safe' ? 'Secure' : overallStatus === 'warning' ? 'Warning' : 'Critical'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <div 
            key={index} 
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${getStatusColor(metric.status)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {metric.icon}
                <span className="text-sm font-medium">{metric.label}</span>
              </div>
              {getTrendIcon(metric.value, metric.previousValue)}
            </div>
            
            <div className="text-2xl font-bold mb-1">
              {metric.value.toLocaleString()}
            </div>
            
            {metric.previousValue !== undefined && (
              <div className="text-xs text-gray-600">
                {metric.value > metric.previousValue ? '+' : ''}
                {metric.value - metric.previousValue} from yesterday
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Security Status Summary */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-lg font-bold text-green-600">
            {metrics.filter(m => m.status === 'safe').length}
          </div>
          <div className="text-xs text-green-600 font-medium">Safe</div>
        </div>
        
        <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-lg font-bold text-yellow-600">
            {warningCount}
          </div>
          <div className="text-xs text-yellow-600 font-medium">Warnings</div>
        </div>
        
        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-lg font-bold text-red-600">
            {criticalCount}
          </div>
          <div className="text-xs text-red-600 font-medium">Critical</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {data.security_alerts > 0 && (
          <button className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full hover:bg-red-200 transition-colors">
            View Alerts ({data.security_alerts})
          </button>
        )}
        
        {data.locked_accounts > 0 && (
          <button className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full hover:bg-yellow-200 transition-colors">
            Review Locked Accounts ({data.locked_accounts})
          </button>
        )}
        
        <button className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full hover:bg-blue-200 transition-colors">
          View Audit Logs
        </button>
        
        <button className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full hover:bg-gray-200 transition-colors">
          Security Settings
        </button>
      </div>
    </div>
  )
}