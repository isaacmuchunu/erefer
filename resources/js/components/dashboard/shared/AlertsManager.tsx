import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  X, 
  Bell,
  Clock,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertItem {
  id: string;
  type: 'emergency' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  source?: string;
  urgent?: boolean;
  dismissed?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

interface AlertsManagerProps {
  alerts: AlertItem[];
  maxVisible?: number;
  showTimestamp?: boolean;
  className?: string;
}

const getAlertIcon = (type: AlertItem['type']) => {
  switch (type) {
    case 'emergency':
      return AlertTriangle;
    case 'warning':
      return AlertCircle;
    case 'info':
      return Info;
    case 'success':
      return CheckCircle;
    default:
      return Bell;
  }
};

const getAlertColor = (type: AlertItem['type']) => {
  switch (type) {
    case 'emergency':
      return 'border-red-200 bg-red-50 text-red-800';
    case 'warning':
      return 'border-yellow-200 bg-yellow-50 text-yellow-800';
    case 'info':
      return 'border-blue-200 bg-blue-50 text-blue-800';
    case 'success':
      return 'border-green-200 bg-green-50 text-green-800';
    default:
      return 'border-gray-200 bg-gray-50 text-gray-800';
  }
};

const AlertsManager: React.FC<AlertsManagerProps> = ({
  alerts,
  maxVisible = 5,
  showTimestamp = true,
  className,
}) => {
  const visibleAlerts = alerts
    .filter(alert => !alert.dismissed)
    .slice(0, maxVisible);

  if (visibleAlerts.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <p className="text-sm text-gray-600">No active alerts</p>
        <p className="text-xs text-gray-500 mt-1">All systems operating normally</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {visibleAlerts.map((alert) => {
        const Icon = getAlertIcon(alert.type);
        
        return (
          <Alert 
            key={alert.id} 
            className={cn(
              'relative transition-all duration-200',
              getAlertColor(alert.type),
              alert.urgent && 'ring-2 ring-red-400 ring-opacity-50'
            )}
          >
            <div className="flex items-start space-x-3">
              <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-sm">{alert.title}</span>
                      {alert.urgent && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                          URGENT
                        </Badge>
                      )}
                    </div>
                    <AlertDescription className="text-sm">
                      {alert.message}
                    </AlertDescription>
                    <div className="flex items-center space-x-4 mt-2 text-xs opacity-75">
                      {showTimestamp && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{alert.timestamp}</span>
                        </div>
                      )}
                      {alert.source && (
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{alert.source}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {alert.onDismiss && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-black/10"
                      onClick={alert.onDismiss}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                {alert.actionLabel && alert.onAction && (
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={alert.onAction}
                      className="text-xs"
                    >
                      {alert.actionLabel}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Alert>
        );
      })}
      
      {alerts.length > maxVisible && (
        <div className="text-center py-2">
          <p className="text-xs text-gray-500">
            {alerts.length - maxVisible} more alerts not shown
          </p>
        </div>
      )}
    </div>
  );
};

export default AlertsManager;