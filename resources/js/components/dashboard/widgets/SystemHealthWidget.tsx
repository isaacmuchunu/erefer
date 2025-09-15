import React from 'react'
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  HardDrive, 
  Cpu,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface SystemHealthData {
  status: 'healthy' | 'warning' | 'critical'
  uptime: string
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  database_status: 'connected' | 'slow' | 'error'
  network_status: 'online' | 'degraded' | 'offline'
  last_backup: string
  active_users: number
  response_time: number
}

interface SystemHealthWidgetProps {
  data: SystemHealthData
  className?: string
}

export default function SystemHealthWidget({ data, className = '' }: SystemHealthWidgetProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'online':
        return 'text-green-600 bg-green-100'
      case 'warning':
      case 'slow':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100'
      case 'critical':
      case 'error':
      case 'offline':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'online':
        return <CheckCircle className="h-4 w-4" />
      case 'warning':
      case 'slow':
      case 'degraded':
      case 'critical':
      case 'error':
      case 'offline':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getUsageColor = (usage: number) => {
    if (usage >= 90) return 'bg-red-500'
    if (usage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Server className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
            <p className="text-sm text-gray-600">Real-time system monitoring</p>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(data.status)}`}>
          {getStatusIcon(data.status)}
          {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* CPU Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">CPU</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{data.cpu_usage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(data.cpu_usage)}`}
              style={{ width: `${data.cpu_usage}%` }}
            />
          </div>
        </div>

        {/* Memory Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Memory</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{data.memory_usage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(data.memory_usage)}`}
              style={{ width: `${data.memory_usage}%` }}
            />
          </div>
        </div>

        {/* Disk Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Disk</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{data.disk_usage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(data.disk_usage)}`}
              style={{ width: `${data.disk_usage}%` }}
            />
          </div>
        </div>

        {/* Response Time */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Response</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{data.response_time}ms</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                data.response_time > 500 ? 'bg-red-500' : 
                data.response_time > 200 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(data.response_time / 10, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Database Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Database</span>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(data.database_status)}`}>
            {getStatusIcon(data.database_status)}
            {data.database_status}
          </div>
        </div>

        {/* Network Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Network</span>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(data.network_status)}`}>
            {getStatusIcon(data.network_status)}
            {data.network_status}
          </div>
        </div>

        {/* Active Users */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Active Users</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">{data.active_users}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>System Uptime: {data.uptime}</span>
          <span>Last Backup: {data.last_backup}</span>
        </div>
      </div>
    </div>
  )
}