import React from 'react'
import { useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Search, Menu } from 'lucide-react'
import NotificationCenter from '../notifications/NotificationCenter'
import { ConnectionStatus } from '../realtime/ConnectionStatus'
import ThemeToggle from '../ui/ThemeToggle'

interface HeaderProps {
  onMenuClick: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const location = useLocation()
  const { user } = useAuthStore()

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
    <header className="px-6 py-4" style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--outline)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            style={{ color: 'var(--on-surface)' }}
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <h2 className="text-xl font-semibold" style={{ color: 'var(--on-surface)' }}>
            {currentPageTitle}
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <ConnectionStatus />
          
          {/* Theme toggle */}
          <ThemeToggle />
          
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border rounded-lg w-64"
              style={{ borderColor: 'var(--outline)', backgroundColor: 'var(--surface)', color: 'var(--on-surface)' }}
            />
          </div>
          
          {/* Notifications */}
          <NotificationCenter />
        </div>
      </div>
    </header>
  )
}