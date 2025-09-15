import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface Alert {
    id: number;
    type: string;
    message: string;
    priority: string;
    created_at: string;
}

interface AlertsProps {
    alerts: Alert[];
}

export function Alerts({ alerts }: AlertsProps) {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-500';
            case 'medium': return 'text-yellow-500';
            case 'low': return 'text-blue-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>Important notifications and system status</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {alerts?.length > 0 ? (
                        alerts.map(alert => (
                            <div key={alert.id} className="flex items-start space-x-4">
                                <AlertTriangle className={`h-5 w-5 ${getPriorityColor(alert.priority)}`} />
                                <div className="flex-1">
                                    <p className="font-semibold">{alert.message}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(alert.created_at).toLocaleString()} - Priority: {alert.priority}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground">
                            No current alerts
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}