import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Calendar,
  ArrowRight,
  MoreHorizontal 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'referral' | 'appointment' | 'emergency' | 'patient' | 'system';
  title: string;
  description: string;
  timestamp: string;
  status?: 'pending' | 'completed' | 'urgent' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  user?: string;
  location?: string;
  onClick?: () => void;
}

interface RecentActivityProps {
  title?: string;
  activities: ActivityItem[];
  maxItems?: number;
  showTimestamp?: boolean;
  showStatus?: boolean;
  showUser?: boolean;
  className?: string;
}

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'referral':
      return '📋';
    case 'appointment':
      return '📅';
    case 'emergency':
      return '🚨';
    case 'patient':
      return '👤';
    case 'system':
      return '⚙️';
    default:
      return '📝';
  }
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'urgent':
      return 'bg-red-100 text-red-800';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'critical':
      return 'border-l-red-500';
    case 'high':
      return 'border-l-orange-500';
    case 'medium':
      return 'border-l-yellow-500';
    case 'low':
      return 'border-l-green-500';
    default:
      return 'border-l-gray-300';
  }
};

const RecentActivity: React.FC<RecentActivityProps> = ({
  title = 'Recent Activity',
  activities,
  maxItems = 10,
  showTimestamp = true,
  showStatus = true,
  showUser = true,
  className,
}) => {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {displayedActivities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-600">No recent activity</p>
            <p className="text-xs text-gray-500 mt-1">Activity will appear here as it happens</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedActivities.map((activity, index) => (
              <div
                key={activity.id}
                className={cn(
                  'flex items-start space-x-3 p-3 rounded-lg border-l-4 bg-gray-50/50 hover:bg-gray-50 transition-colors duration-200',
                  getPriorityColor(activity.priority),
                  activity.onClick && 'cursor-pointer'
                )}
                onClick={activity.onClick}
              >
                <div className="text-lg flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        {showTimestamp && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{activity.timestamp}</span>
                          </div>
                        )}
                        {showUser && activity.user && (
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{activity.user}</span>
                          </div>
                        )}
                        {activity.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{activity.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-1">
                      {showStatus && activity.status && (
                        <Badge className={cn('text-xs', getStatusColor(activity.status))}>
                          {activity.status}
                        </Badge>
                      )}
                      {activity.onClick && (
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {activities.length > maxItems && (
              <div className="text-center pt-4 border-t">
                <Button variant="ghost" size="sm">
                  View All Activity ({activities.length - maxItems} more)
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;