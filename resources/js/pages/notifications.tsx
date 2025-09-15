import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import Pusher from 'pusher-js';

type Notification = {
  id: number;
  title: string;
  description: string;
  created_at: string;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        setUserId(data.id);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/v1/notifications');
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const pusher = new Pusher('your-pusher-app-key', {
      cluster: 'your-pusher-cluster',
    });

    const channel = pusher.subscribe(`user-${userId}`);
    channel.bind('new-notification', (data) => {
      setNotifications((prev) => [data.notification, ...prev]);
    });

    return () => {
      pusher.unsubscribe(`user-${userId}`);
    };
  }, [userId]);

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p>No notifications available.</p>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2" />
                  {notification.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{notification.description}</p>
                <p className="text-sm text-gray-500">{notification.created_at}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}