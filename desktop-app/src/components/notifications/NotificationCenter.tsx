import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, Clock, Filter, MoreVertical } from 'lucide-react';
import { realTimeService, useConnectionStatus } from '../../services/realTimeService';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category: 'script' | 'exam' | 'incident' | 'system' | 'user';
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  metadata?: Record<string, any>;
}

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Script Movement Alert',
      message: 'Batch SCR-2025-001 has been moved to verification station. Requires immediate attention.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      category: 'script',
      priority: 'high',
      actionUrl: '/scripts?batch=SCR-2025-001'
    },
    {
      id: '2',
      type: 'success',
      title: 'Exam Session Completed',
      message: 'COMP 101 Final Exam has been successfully completed. All scripts collected.',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      category: 'exam',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'error',
      title: 'Critical Incident Reported',
      message: 'Security breach detected in Exam Hall A. Immediate investigation required.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true,
      category: 'incident',
      priority: 'critical',
      actionUrl: '/incidents'
    },
    {
      id: '4',
      type: 'info',
      title: 'System Update',
      message: 'ELMS v2.1.0 has been deployed with enhanced security features.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
      category: 'system',
      priority: 'low'
    },
    {
      id: '5',
      type: 'warning',
      title: 'QR Code Scanner Issue',
      message: 'Scanner station 3 is reporting errors. Manual verification may be required.',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      read: false,
      category: 'script',
      priority: 'medium'
    }
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high-priority'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high' || n.priority === 'critical').length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'high-priority' && !['high', 'critical'].includes(notification.priority)) return false;
    if (selectedCategory !== 'all' && notification.category !== selectedCategory) return false;
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const randomTypes: Notification['type'][] = ['info', 'success', 'warning', 'error'];
      const randomCategories: Notification['category'][] = ['script', 'exam', 'incident', 'system'];
      const randomPriorities: Notification['priority'][] = ['low', 'medium', 'high'];
      
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: randomTypes[Math.floor(Math.random() * randomTypes.length)],
        title: 'Real-time Update',
        message: 'This is a simulated real-time notification from the ELMS system.',
        timestamp: new Date(),
        read: false,
        category: randomCategories[Math.floor(Math.random() * randomCategories.length)],
        priority: randomPriorities[Math.floor(Math.random() * randomPriorities.length)]
      };

      if (Math.random() > 0.7) { // 30% chance every 10 seconds
        setNotifications(prev => [newNotification, ...prev]);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-500">
                {unreadCount} unread, {highPriorityCount} high priority
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="high-priority">High Priority</option>
              </select>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All Categories</option>
                <option value="script">Scripts</option>
                <option value="exam">Exams</option>
                <option value="incident">Incidents</option>
                <option value="system">System</option>
              </select>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No notifications found</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    getPriorityColor(notification.priority)
                  } ${!notification.read ? 'bg-blue-50' : 'bg-white'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              notification.priority === 'critical' ? 'bg-red-100 text-red-800' :
                              notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {notification.priority}
                            </span>
                            <div className="relative">
                              <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimestamp(notification.timestamp)}</span>
                            <span className="capitalize px-2 py-1 bg-gray-100 rounded">
                              {notification.category}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Mark read
                              </button>
                            )}
                            {notification.actionUrl && (
                              <button className="text-xs text-blue-600 hover:text-blue-800">
                                View Details
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 text-center">
            <button className="text-sm text-blue-600 hover:text-blue-800">
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
