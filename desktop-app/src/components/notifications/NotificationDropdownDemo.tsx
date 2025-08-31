import React, { useState } from 'react';
import NotificationDropdown from './NotificationDropdown';

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
  metadata?: Record<string, unknown>;
}

const NotificationDropdownDemo: React.FC = () => {
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

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleViewAll = () => {
    console.log('Navigate to all notifications page');
    // You can implement navigation logic here
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Notification Dropdown Demo</h1>

      <div className="flex items-center justify-between mb-8">
        <p className="text-slate-600 dark:text-slate-400">
          Click the bell icon to see the notification dropdown in action.
        </p>

        <NotificationDropdown
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDelete={handleDelete}
          onViewAll={handleViewAll}
        />
      </div>

      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Current Notifications State</h2>
        <div className="space-y-2">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Total notifications: <span className="font-medium">{notifications.length}</span>
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Unread notifications: <span className="font-medium">
              {notifications.filter(n => !n.read).length}
            </span>
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            High priority notifications: <span className="font-medium">
              {notifications.filter(n => n.priority === 'high' || n.priority === 'critical').length}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdownDemo;
