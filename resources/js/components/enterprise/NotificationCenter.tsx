import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Building2, 
  Truck, 
  Heart, 
  Shield, 
  Zap, 
  Settings,
  Filter,
  Search,
  MoreHorizontal,
  Archive,
  Trash2,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  MessageSquare,
  Phone,
  Globe,
  Eye,
  EyeOff,
  Star,
  Flag,
  Calendar,
  Users,
  Activity,
  Database,
  Wifi,
  WifiOff
} from 'lucide-react'

export interface Notification {
  id: string
  type: 'emergency' | 'alert' | 'warning' | 'info' | 'success'
  category: 'system' | 'clinical' | 'security' | 'compliance' | 'operational' | 'patient_care'
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  message: string
  details?: string
  timestamp: string
  read: boolean
  acknowledged: boolean
  starred: boolean
  archived: boolean
  source: string
  user?: {
    id: number
    name: string
    role: string
    avatar?: string
  }
  actions?: Array<{
    id: string
    label: string
    type: 'primary' | 'secondary' | 'danger'
    action: string
  }>
  metadata?: {
    patient_id?: string
    facility_id?: string
    ambulance_id?: string
    incident_id?: string
    referral_id?: string
    [key: string]: any
  }
  delivery_channels: Array<'push' | 'email' | 'sms' | 'voice' | 'in_app'>
  escalation_level: number
  auto_escalate_at?: string
  expires_at?: string
}

interface NotificationCenterProps {
  notifications: Notification[]
  currentUser: any
  onNotificationAction: (notificationId: string, action: string) => void
  onMarkAsRead: (notificationId: string) => void
  onMarkAllAsRead: () => void
  onAcknowledge: (notificationId: string) => void
  onStar: (notificationId: string) => void
  onArchive: (notificationId: string) => void
  onDelete: (notificationId: string) => void
  className?: string
}

export default function NotificationCenter({
  notifications,
  currentUser,
  onNotificationAction,
  onMarkAsRead,
  onMarkAllAsRead,
  onAcknowledge,
  onStar,
  onArchive,
  onDelete,
  className = ''
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'starred' | 'critical'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null)

  const unreadCount = notifications.filter(n => !n.read && !n.archived).length
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.read && !n.archived).length

  useEffect(() => {
    // Play notification sound for new critical notifications
    if (soundEnabled && criticalCount > 0) {
      // In a real implementation, you would play a sound file
      console.log('🔔 Critical notification sound')
    }
  }, [criticalCount, soundEnabled])

  const getNotificationIcon = (type: string, category: string) => {
    switch (category) {
      case 'emergency':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'clinical':
        return <Heart className="h-5 w-5 text-pink-500" />
      case 'security':
        return <Shield className="h-5 w-5 text-orange-500" />
      case 'system':
        return <Settings className="h-5 w-5 text-blue-500" />
      case 'operational':
        return <Activity className="h-5 w-5 text-green-500" />
      case 'patient_care':
        return <Users className="h-5 w-5 text-purple-500" />
      default:
        switch (type) {
          case 'emergency':
            return <AlertTriangle className="h-5 w-5 text-red-500" />
          case 'alert':
            return <Bell className="h-5 w-5 text-orange-500" />
          case 'warning':
            return <AlertTriangle className="h-5 w-5 text-yellow-500" />
          case 'success':
            return <CheckCircle className="h-5 w-5 text-green-500" />
          default:
            return <Info className="h-5 w-5 text-blue-500" />
        }
    }
  }

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'critical') {
      return 'border-red-500 bg-red-50'
    }
    switch (type) {
      case 'emergency':
        return 'border-red-400 bg-red-50'
      case 'alert':
        return 'border-orange-400 bg-orange-50'
      case 'warning':
        return 'border-yellow-400 bg-yellow-50'
      case 'success':
        return 'border-green-400 bg-green-50'
      default:
        return 'border-blue-400 bg-blue-50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const filteredNotifications = notifications.filter(notification => {
    if (notification.archived && selectedFilter !== 'all') return false
    
    const matchesFilter = 
      selectedFilter === 'all' ||
      (selectedFilter === 'unread' && !notification.read) ||
      (selectedFilter === 'starred' && notification.starred) ||
      (selectedFilter === 'critical' && notification.priority === 'critical')
    
    const matchesCategory = selectedCategory === 'all' || notification.category === selectedCategory
    
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.source.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesFilter && matchesCategory && matchesSearch
  })

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
    setExpandedNotification(
      expandedNotification === notification.id ? null : notification.id
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {criticalCount > 0 && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  title={soundEnabled ? 'Disable sound' : 'Enable sound'}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-2">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as any)}
                className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="starred">Starred</option>
                <option value="critical">Critical</option>
              </select>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="emergency">Emergency</option>
                <option value="clinical">Clinical</option>
                <option value="security">Security</option>
                <option value="system">System</option>
                <option value="operational">Operational</option>
                <option value="patient_care">Patient Care</option>
              </select>
            </div>

            {/* Quick Actions */}
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications found</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : 'bg-white'
                    } ${getNotificationColor(notification.type, notification.priority)}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type, notification.category)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                                {notification.priority}
                              </span>
                              <span className="text-xs text-gray-500">{notification.category}</span>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onStar(notification.id)
                              }}
                              className={`p-1 rounded hover:bg-gray-200 ${
                                notification.starred ? 'text-yellow-500' : 'text-gray-400'
                              }`}
                            >
                              <Star className="h-3 w-3" />
                            </button>
                            
                            <div className="relative group">
                              <button className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-200">
                                <MoreHorizontal className="h-3 w-3" />
                              </button>
                              
                              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                {!notification.acknowledged && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onAcknowledge(notification.id)
                                    }}
                                    className="w-full px-3 py-1 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                  >
                                    <Check className="h-3 w-3" />
                                    Acknowledge
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onArchive(notification.id)
                                  }}
                                  className="w-full px-3 py-1 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <Archive className="h-3 w-3" />
                                  Archive
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete(notification.id)
                                  }}
                                  className="w-full px-3 py-1 text-left text-xs text-red-700 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{notification.source}</span>
                            <span>•</span>
                            <span>{formatTimestamp(notification.timestamp)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {notification.delivery_channels.map((channel, index) => (
                              <div key={index} className="text-gray-400" title={channel}>
                                {channel === 'push' && <Smartphone className="h-3 w-3" />}
                                {channel === 'email' && <Mail className="h-3 w-3" />}
                                {channel === 'sms' && <MessageSquare className="h-3 w-3" />}
                                {channel === 'voice' && <Phone className="h-3 w-3" />}
                                {channel === 'in_app' && <Globe className="h-3 w-3" />}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Expanded Details */}
                        {expandedNotification === notification.id && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            {notification.details && (
                              <p className="text-xs text-gray-600 mb-3">{notification.details}</p>
                            )}
                            
                            {notification.metadata && (
                              <div className="mb-3">
                                <h5 className="text-xs font-medium text-gray-700 mb-1">Details:</h5>
                                <div className="text-xs text-gray-600 space-y-1">
                                  {Object.entries(notification.metadata).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="capitalize">{key.replace('_', ' ')}:</span>
                                      <span>{String(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {notification.actions && notification.actions.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {notification.actions.map((action) => (
                                  <button
                                    key={action.id}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onNotificationAction(notification.id, action.action)
                                    }}
                                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                      action.type === 'primary'
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : action.type === 'danger'
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                  >
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                setIsOpen(false)
                // Navigate to full notifications page
                window.location.href = '/admin/notifications'
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}