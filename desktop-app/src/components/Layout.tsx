import React from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { 
  Monitor, 
  Users, 
  BookOpen, 
  AlertTriangle, 
  BarChart3, 
  Settings,
  LogOut,
  Search,
  FileText,
  Building2,
  GraduationCap,
  Database,
  Server,
  ClipboardList,
  Eye,
  Building,
  Activity,
} from 'lucide-react'
import NotificationCenter from './notifications/NotificationCenter'
import { ConnectionStatus } from './realtime/ConnectionStatus'
import ThemeToggle from './ui/ThemeToggle'

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  requiredRoles?: string[]
}

export const Layout = () => {
  const location = useLocation()
  const { logout, user } = useAuthStore()

  // Get navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    if (!user) return []

    // Super Admin specific navigation
    if (user.role === 'SUPER_ADMIN') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Monitor, path: '/dashboard' },
        { id: 'overview', label: 'System Overview', icon: BarChart3, path: '/superadmin/overview' },
        { id: 'users', label: 'User Management', icon: Users, path: '/superadmin/users' },
        { id: 'institutions', label: 'Institutions', icon: Building2, path: '/superadmin/institutions' },
        { id: 'audit', label: 'Audit Logs', icon: Database, path: '/superadmin/audit' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/superadmin/analytics' },
        { id: 'health', label: 'System Health', icon: Activity, path: '/superadmin/health' },
        { id: 'configuration', label: 'Configuration', icon: Settings, path: '/superadmin/configuration' },
        { id: 'incidents', label: 'Incidents', icon: AlertTriangle, path: '/incidents' },
        { id: 'scripts', label: 'Scripts', icon: FileText, path: '/scripts' }
      ]
    }

    // Institution Admin navigation
    if (user.role === 'INSTITUTION_ADMIN') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Monitor, path: '/dashboard' },
        { id: 'departments', label: 'Departments', icon: Building, path: '/institution/departments' },
        { id: 'staff', label: 'Staff Management', icon: Users, path: '/institution/staff' },
        { id: 'students', label: 'Students', icon: GraduationCap, path: '/institution/students' },
        { id: 'exams', label: 'Exam Management', icon: BookOpen, path: '/exams' },
        { id: 'scheduling', label: 'Exam Scheduling', icon: ClipboardList, path: '/exams/scheduling' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' }
      ]
    }

    // Department Head navigation
    if (user.role === 'DEPARTMENT_HEAD') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Monitor, path: '/dashboard' },
        { id: 'courses', label: 'Course Management', icon: GraduationCap, path: '/department/courses' },
        { id: 'staff', label: 'Staff Management', icon: Users, path: '/department/staff' },
        { id: 'students', label: 'Students', icon: GraduationCap, path: '/department/students' },
        { id: 'exams', label: 'Exam Management', icon: BookOpen, path: '/exams' }
      ]
    }

    // Student navigation
    if (user.role === 'STUDENT') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Monitor, path: '/dashboard' },
        { id: 'exams', label: 'My Exams', icon: BookOpen, path: '/student/exams' },
        { id: 'results', label: 'My Results', icon: BarChart3, path: '/student/results' }
      ]
    }

    // Exam Officer navigation
    if (user.role === 'EXAM_OFFICER') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Monitor, path: '/dashboard' },
        { id: 'exams', label: 'Exam Management', icon: BookOpen, path: '/exams' },
        { id: 'scheduling', label: 'Exam Scheduling', icon: ClipboardList, path: '/exams/scheduling' },
        { id: 'supervision', label: 'Supervision', icon: Eye, path: '/invigilator/exams' }
      ]
    }

    // Academic Staff navigation
    if (user.role === 'ACADEMIC_STAFF') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Monitor, path: '/dashboard' },
        { id: 'exams', label: 'Exam Management', icon: BookOpen, path: '/exams' },
        { id: 'scripts', label: 'Scripts', icon: FileText, path: '/scripts' }
      ]
    }

    // IT Support navigation
    if (user.role === 'IT_SUPPORT') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Monitor, path: '/dashboard' },
        { id: 'users', label: 'User Support', icon: Users, path: '/users' },
        { id: 'incidents', label: 'Incidents', icon: AlertTriangle, path: '/incidents' },
        { id: 'scripts', label: 'Scripts', icon: FileText, path: '/scripts' },
        { id: 'maintenance', label: 'System Maintenance', icon: Server, path: '/it/maintenance' }
      ]
    }

    // Default fallback
    return [
      { id: 'dashboard', label: 'Dashboard', icon: Monitor, path: '/dashboard' }
    ]
  }

  const navigationItems = getNavigationItems()

  const handleLogout = () => {
    logout()
  }

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ELMS</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Exams Logistics Management</p>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`w-full flex items-center justify-start px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Profile & Settings */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
              {user?.profile?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user?.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.role ? getRoleDisplayName(user.role) : 'User'}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Link 
              to="/profile"
              className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Settings className="h-4 w-4" />
            </Link>
            <button 
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {navigationItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <ConnectionStatus />
              {/* Theme toggle */}
              <ThemeToggle />
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
              </div>
              
              {/* Notifications */}
              <NotificationCenter />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
