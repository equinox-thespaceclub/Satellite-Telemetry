import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Satellite, X } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  timestamp: Date;
}

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Simulate notifications
  useEffect(() => {
    const timer = setTimeout(() => {
      const notification: Notification = {
        id: '1',
        title: 'ISS Pass Alert',
        message: 'ISS will be visible in 5 minutes at 78° elevation',
        type: 'info',
        timestamp: new Date(),
      };
      setNotifications([notification]);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-600';
      case 'warning': return 'bg-yellow-600';
      case 'info': 
      default: return 'bg-blue-600';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`max-w-sm transform transition-all duration-300 ease-in-out ${getNotificationColor(notification.type)} text-white border-none shadow-lg animate-slide-in-right`}
        >
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <Satellite className="w-5 h-5 text-white mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{notification.title}</p>
                <p className="text-xs opacity-90 mt-1">{notification.message}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => dismissNotification(notification.id)}
                className="p-0 h-auto text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
