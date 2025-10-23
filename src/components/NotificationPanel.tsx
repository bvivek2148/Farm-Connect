import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  User,
  ShoppingBag,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/context/SocketContext';

interface Notification {
  id: string;
  type: 'user_registration' | 'farmer_application' | 'new_order' | 'system_alert' | 'user_activity';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

// Sample notifications data
const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'farmer_application',
    title: 'New Farmer Application',
    message: 'John Smith has applied to become a farmer. Farm: Green Valley Organic',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    read: false,
    priority: 'high',
    data: { userId: 'user_123', farmName: 'Green Valley Organic' }
  },
  {
    id: '2',
    type: 'user_registration',
    title: 'New User Registration',
    message: 'Sarah Johnson has registered as a new customer',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    priority: 'medium',
    data: { userId: 'user_124', email: 'sarah@example.com' }
  },
  {
    id: '3',
    type: 'new_order',
    title: 'New Order Placed',
    message: 'Order #12459 placed by Mike Wilson - $67.50',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    read: true,
    priority: 'medium',
    data: { orderId: '12459', amount: 67.50 }
  },
  {
    id: '4',
    type: 'farmer_application',
    title: 'New Farmer Application',
    message: 'Emma Davis has applied to become a farmer. Farm: Sunshine Vegetables',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    read: false,
    priority: 'high',
    data: { userId: 'user_125', farmName: 'Sunshine Vegetables' }
  },
  {
    id: '5',
    type: 'system_alert',
    title: 'System Maintenance',
    message: 'Scheduled maintenance completed successfully',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    priority: 'low',
    data: {}
  }
];

interface NotificationPanelProps {
  children: React.ReactNode;
  onNotificationCountChange?: (count: number) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ 
  children, 
  onNotificationCountChange 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { socket, isConnected } = useSocket();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Listen for real-time admin notifications
  useEffect(() => {
    if (!socket) return;

    // Listen for new user registrations
    socket.on('admin:new-user', (data: any) => {
      console.log('🔔 New user notification:', data);
      const newNotification: Notification = {
        id: `user-${data.id}-${Date.now()}`,
        type: 'user_registration',
        title: 'New User Registration',
        message: `${data.email} registered via ${data.provider}`,
        timestamp: new Date(data.timestamp || Date.now()),
        read: false,
        priority: 'medium',
        data: { userId: data.id, email: data.email, provider: data.provider }
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      
      // Show toast
      toast({
        title: '🎉 New User Registered',
        description: `${data.email} just joined!`,
      });
    });

    // Listen for new orders
    socket.on('admin:new-order', (data: any) => {
      console.log('🔔 New order notification:', data);
      const newNotification: Notification = {
        id: `order-${data.orderId}-${Date.now()}`,
        type: 'new_order',
        title: 'New Order Placed',
        message: `Order #${data.orderId} - $${data.total}`,
        timestamp: new Date(data.timestamp || Date.now()),
        read: false,
        priority: 'medium',
        data: { orderId: data.orderId, amount: data.total }
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      
      toast({
        title: '🛒 New Order',
        description: `Order #${data.orderId} received!`,
      });
    });

    // Listen for farmer applications
    socket.on('admin:farmer-application', (data: any) => {
      console.log('🔔 Farmer application notification:', data);
      const newNotification: Notification = {
        id: `farmer-${data.userId}-${Date.now()}`,
        type: 'farmer_application',
        title: 'New Farmer Application',
        message: `${data.name} applied for farmer role`,
        timestamp: new Date(data.timestamp || Date.now()),
        read: false,
        priority: 'high',
        data: { userId: data.userId, name: data.name }
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      
      toast({
        title: '🌾 New Farmer Application',
        description: `${data.name} wants to become a farmer`,
      });
    });

    return () => {
      socket.off('admin:new-user');
      socket.off('admin:new-order');
      socket.off('admin:farmer-application');
    };
  }, [socket, toast]);

  useEffect(() => {
    onNotificationCountChange?.(unreadCount);
  }, [unreadCount, onNotificationCountChange]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'user_registration':
        return <UserPlus className="h-4 w-4" />;
      case 'farmer_application':
        return <User className="h-4 w-4" />;
      case 'new_order':
        return <ShoppingBag className="h-4 w-4" />;
      case 'system_alert':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
    if (priority === 'high') return 'bg-red-100 border-red-200 text-red-800';
    if (priority === 'medium') return 'bg-yellow-100 border-yellow-200 text-yellow-800';
    
    switch (type) {
      case 'farmer_application':
        return 'bg-green-100 border-green-200 text-green-800';
      case 'user_registration':
        return 'bg-blue-100 border-blue-200 text-blue-800';
      case 'new_order':
        return 'bg-purple-100 border-purple-200 text-purple-800';
      case 'system_alert':
        return 'bg-orange-100 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    toast({
      title: 'All notifications marked as read',
      description: 'All notifications have been marked as read',
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    toast({
      title: 'Notification deleted',
      description: 'Notification has been removed',
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast({
      title: 'All notifications cleared',
      description: 'All notifications have been removed',
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Handle different notification types
    switch (notification.type) {
      case 'farmer_application':
        toast({
          title: 'Farmer Application',
          description: `Review application from ${notification.data?.farmName}`,
        });
        break;
      case 'user_registration':
        toast({
          title: 'New User',
          description: `Welcome new user: ${notification.data?.email}`,
        });
        break;
      case 'new_order':
        toast({
          title: 'Order Details',
          description: `Order #${notification.data?.orderId} - $${notification.data?.amount}`,
        });
        break;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={clearAllNotifications}>
                <Trash2 className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            </div>
          </SheetTitle>
          <SheetDescription>
            Stay updated with the latest activities and alerts
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      notification.read 
                        ? 'bg-gray-50 border-gray-200' 
                        : getNotificationColor(notification.type, notification.priority)
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`p-2 rounded-full ${
                          notification.read ? 'bg-gray-200' : 'bg-white'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium ${
                              notification.read ? 'text-gray-600' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${
                            notification.read ? 'text-gray-500' : 'text-gray-700'
                          }`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            <Badge variant={notification.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                              {notification.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {index < notifications.length - 1 && <Separator className="my-2" />}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationPanel;
