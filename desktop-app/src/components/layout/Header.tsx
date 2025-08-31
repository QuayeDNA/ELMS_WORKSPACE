import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Search, Menu } from 'lucide-react'
import { NotificationDropdown } from '../notifications'
import { ConnectionStatus } from '../realtime/ConnectionStatus'
import ThemeToggle from '../ui/ThemeToggle'

interface HeaderProps {
  onMenuClick: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const location = useLocation()
  const { user } = useAuthStore()

  // Notification state and handlers
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'warning' as const,
      title: 'Script Movement Alert',
      message: 'Batch SCR-2025-001 has been moved to verification station. Requires immediate attention.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      category: 'script' as const,
      priority: 'high' as const,
      actionUrl: '/scripts?batch=SCR-2025-001'
    },
    {
      id: '2',
      type: 'success' as const,
      title: 'Exam Session Completed',
      message: 'COMP 101 Final Exam has been successfully completed. All scripts collected.',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      category: 'exam' as const,
      priority: 'medium' as const
    },
    {
      id: '3',
      type: 'error' as const,
      title: 'Critical Incident Reported',
      message: 'Security breach detected in Exam Hall A. Immediate investigation required.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true,
      category: 'incident' as const,
      priority: 'critical' as const,
      actionUrl: '/incidents'
    },
    {
      id: '4',
      type: 'info' as const,
      title: 'System Update',
      message: 'ELMS v2.1.0 has been deployed with enhanced security features.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
      category: 'system' as const,
      priority: 'low' as const
    },
    {
      id: '5',
      type: 'warning' as const,
      title: 'QR Code Scanner Issue',
      message: 'Scanner station 3 is reporting errors. Manual verification may be required.',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      read: false,
      category: 'script' as const,
      priority: 'medium' as const
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
    // Navigate to full notifications page or open modal
    console.log('Navigate to all notifications');
  };

  // Navigation items for getting current page title
  const getNavigationItems = () => {
    if (!user) return []

    // Super Admin specific navigation
    if (user.role === 'SUPER_ADMIN') {
      return [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
        { id: 'users', label: 'User Management', path: '/superadmin/users' },
        { id: 'institutions', label: 'Institutions', path: '/superadmin/institutions' },
        { id: 'audit', label: 'Audit Logs', path: '/superadmin/audit' },
        { id: 'analytics', label: 'Analytics', path: '/superadmin/analytics' },
        { id: 'health', label: 'System Health', path: '/superadmin/health' },
        { id: 'configuration', label: 'Configuration', path: '/superadmin/configuration' },
        { id: 'incidents', label: 'Incidents', path: '/incidents' },
        { id: 'scripts', label: 'Scripts', path: '/scripts' }
      ]
    }

    // Institution Admin navigation
    if (user.role === 'INSTITUTION_ADMIN') {
      return [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
        { id: 'departments', label: 'Departments', path: '/institution/departments' },
        { id: 'staff', label: 'Staff Management', path: '/institution/staff' },
        { id: 'students', label: 'Students', path: '/institution/students' },
        { id: 'exams', label: 'Exam Management', path: '/exams' },
        { id: 'scheduling', label: 'Exam Scheduling', path: '/exams/scheduling' },
        { id: 'analytics', label: 'Analytics', path: '/analytics' }
      ]
    }

    // Department Head navigation
    if (user.role === 'DEPARTMENT_HEAD') {
      return [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
        { id: 'courses', label: 'Course Management', path: '/department/courses' },
        { id: 'staff', label: 'Staff Management', path: '/department/staff' },
        { id: 'students', label: 'Students', path: '/department/students' },
        { id: 'exams', label: 'Exam Management', path: '/exams' }
      ]
    }

    // Student navigation
    if (user.role === 'STUDENT') {
      return [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
        { id: 'exams', label: 'My Exams', path: '/student/exams' },
        { id: 'results', label: 'My Results', path: '/student/results' }
      ]
    }

    // Exam Officer navigation
    if (user.role === 'EXAM_OFFICER') {
      return [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
        { id: 'exams', label: 'Exam Management', path: '/exams' },
        { id: 'scheduling', label: 'Exam Scheduling', path: '/exams/scheduling' },
        { id: 'supervision', label: 'Supervision', path: '/invigilator/exams' }
      ]
    }

    // Academic Staff navigation
    if (user.role === 'ACADEMIC_STAFF') {
      return [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
        { id: 'exams', label: 'Exam Management', path: '/exams' },
        { id: 'scripts', label: 'Scripts', path: '/scripts' }
      ]
    }

    // IT Support navigation
    if (user.role === 'IT_SUPPORT') {
      return [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
        { id: 'users', label: 'User Support', path: '/users' },
        { id: 'incidents', label: 'Incidents', path: '/incidents' },
        { id: 'scripts', label: 'Scripts', path: '/scripts' },
        { id: 'maintenance', label: 'System Maintenance', path: '/it/maintenance' }
      ]
    }

    // Default fallback
    return [
      { id: 'dashboard', label: 'Dashboard', path: '/dashboard' }
    ]
  }

  const navigationItems = getNavigationItems()
  const currentPageTitle = navigationItems.find(item => 
    item.path === location.pathname || location.pathname.startsWith(item.path + '/')
  )?.label || 'Dashboard'

  return (
    <header
      className="relative px-4 lg:px-6 py-4 backdrop-blur-xl"
      style={{
        borderBottom: `1px solid var(--color-outline-variant)`,
        background: `
          linear-gradient(90deg,
            var(--color-surface-container) 0%,
            var(--color-surface-variant) 100%
          )
        `,
        backdropFilter: 'blur(20px)'
      }}
    >
      {/* Subtle animated background */}
      <div
        className="absolute inset-0 animate-pulse"
        style={{
          background: `
            linear-gradient(90deg,
              var(--color-primary-container) 0%,
              transparent 50%,
              var(--color-secondary-container) 100%
            )
          `,
          opacity: 0.3
        }}
      />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button with enhanced styling */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-3 rounded-xl transition-all duration-200 hover:shadow-lg group"
            style={{
              color: 'var(--color-on-surface-variant)',
              backgroundColor: 'transparent',
              border: `1px solid transparent`,
              borderRadius: 'var(--radius)',
              boxShadow: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-foreground)';
              e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
              e.currentTarget.style.borderColor = 'var(--color-outline-variant)';
              e.currentTarget.style.boxShadow = 'var(--color-shadow)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-on-surface-variant)';
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Menu className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
          </button>

          {/* Page title with gradient text */}
          <div className="flex items-center space-x-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
              style={{
                background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
                boxShadow: 'var(--color-shadow)'
              }}
            >
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--color-on-primary)' }}
              />
            </div>
            <h2
              className="text-xl lg:text-2xl font-bold bg-clip-text text-transparent"
              style={{
                background: `linear-gradient(135deg, var(--color-foreground), var(--color-text-secondary))`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {currentPageTitle}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-3 lg:space-x-4">
          {/* Connection Status with enhanced styling */}
          <div className="hidden sm:block">
            <ConnectionStatus />
          </div>

          {/* Theme toggle with better positioning */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* Search bar with enhanced design */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search
                className="h-4 w-4"
                style={{ color: 'var(--color-on-surface-variant)' }}
              />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="pl-12 pr-4 py-2.5 w-64 rounded-xl border backdrop-blur-sm
                         focus:outline-none focus:ring-2 transition-all duration-200"
              style={{
                borderColor: 'var(--color-outline-variant)',
                backgroundColor: 'var(--color-surface-container)',
                color: 'var(--color-foreground)',
                borderRadius: 'var(--radius)',
                backdropFilter: 'blur(8px)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.boxShadow = `0 0 0 2px var(--color-primary-container)`;
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-outline-variant)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.backgroundColor = 'var(--color-surface-container)';
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface-container)';
              }}
            />
          </div>

          {/* Notifications with enhanced styling */}
          <div className="relative">
            <NotificationDropdown
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onDelete={handleDelete}
              onViewAll={handleViewAll}
            />
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="mt-4 md:hidden">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search
              className="h-4 w-4"
              style={{ color: 'var(--color-on-surface-variant)' }}
            />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="pl-12 pr-4 py-2.5 w-full rounded-xl border backdrop-blur-sm
                       focus:outline-none focus:ring-2 transition-all duration-200"
            style={{
              borderColor: 'var(--color-outline-variant)',
              backgroundColor: 'var(--color-surface-container)',
              color: 'var(--color-foreground)',
              borderRadius: 'var(--radius)',
              backdropFilter: 'blur(8px)'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.boxShadow = `0 0 0 2px var(--color-primary-container)`;
              e.currentTarget.style.backgroundColor = 'var(--color-surface)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-outline-variant)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.backgroundColor = 'var(--color-surface-container)';
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-container)';
            }}
          />
        </div>
      </div>
    </header>
  )
}