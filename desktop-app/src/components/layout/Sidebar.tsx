import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import {
  Monitor,
  Users,
  BookOpen,
  AlertTriangle,
  BarChart3,
  Settings,
  LogOut,
  FileText,
  GraduationCap,
  Database,
  Server,
  ClipboardList,
  Eye,
  Building,
  Activity,
  X,
  Bell
} from 'lucide-react'

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  requiredRoles?: string[]
}

interface SidebarProps {
  onClose: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation()
  const { logout, user } = useAuthStore()

  // Get navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    if (!user) return []

    // Super Admin specific navigation
    if (user.role === 'SUPER_ADMIN') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Monitor, path: '/dashboard' },
        { id: 'users', label: 'Users', icon: Building, path: '/users' },
        { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
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
        { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
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
        { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
        { id: 'exams', label: 'Exam Management', icon: BookOpen, path: '/exams' }
      ]
    }

    // Student navigation
    if (user.role === 'STUDENT') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Monitor, path: '/dashboard' },
        { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
        { id: 'exams', label: 'My Exams', icon: BookOpen, path: '/student/exams' },
        { id: 'results', label: 'My Results', icon: BarChart3, path: '/student/results' }
      ]
    }

    // Exam Officer navigation
    if (user.role === 'EXAM_OFFICER') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Monitor, path: '/dashboard' },
        { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
        { id: 'exams', label: 'Exam Management', icon: BookOpen, path: '/exams' },
        { id: 'scheduling', label: 'Exam Scheduling', icon: ClipboardList, path: '/exams/scheduling' },
        { id: 'supervision', label: 'Supervision', icon: Eye, path: '/invigilator/exams' }
      ]
    }

    // Academic Staff navigation
    if (user.role === 'ACADEMIC_STAFF') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Monitor, path: '/dashboard' },
        { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
        { id: 'exams', label: 'Exam Management', icon: BookOpen, path: '/exams' },
        { id: 'scripts', label: 'Scripts', icon: FileText, path: '/scripts' }
      ]
    }

    // IT Support navigation
    if (user.role === 'IT_SUPPORT') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Monitor, path: '/dashboard' },
        { id: 'users', label: 'User Support', icon: Users, path: '/users' },
        { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
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
    onClose() // Close sidebar on mobile after logout
  }

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <>
      {/* Sidebar Container with slide animations */}
      <div className="w-72 h-full flex flex-col relative overflow-hidden bg-slate-900 border-r border-slate-700/50 shadow-2xl dark:bg-slate-900 dark:border-slate-700/50 animate-in slide-in-from-left-4 duration-300">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-500/5 animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-purple-500/5 animate-pulse delay-1000" />
        </div>

        {/* Logo Section */}
        <div className="relative p-6 flex items-center justify-between border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg">
                <Monitor className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                ELMS
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Exam Management System
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200 group"
          >
            <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Navigation with enhanced styling */}
        <nav className="relative flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {navigationItems.map((item, index) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={onClose}
                className={`
                  group relative w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98]
                  animate-in slide-in-from-left-4 fade-in
                  ${isActive
                    ? 'bg-blue-600 text-white border border-blue-500 shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50 border border-transparent hover:border-slate-600'
                  }
                `}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full animate-pulse" />
                )}

                {/* Icon with hover effects */}
                <div
                  className={`
                    relative mr-3 p-1.5 rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-slate-700/50 text-slate-400 group-hover:bg-slate-600 group-hover:text-slate-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Label */}
                <span className="truncate font-medium">{item.label}</span>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-sm" />
              </Link>
            )
          })}
        </nav>

        {/* User Profile Section with enhanced design */}
        <div className="relative p-4 border-t border-slate-700/50 bg-gradient-to-t from-slate-800/20 to-transparent">
          <div className="flex items-center space-x-3 mb-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-blue-500/25">
                {user?.profile?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">
                {user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user?.email}
              </p>
              <p className="text-xs font-medium text-slate-400">
                {user?.role ? getRoleDisplayName(user.role) : 'User'}
              </p>
            </div>
          </div>

          {/* Action buttons with enhanced styling */}
          <div className="flex space-x-2">
            <Link
              to="/profile"
              onClick={onClose}
              className="flex-1 flex items-center justify-center p-3 text-slate-300 hover:text-white rounded-xl
                         hover:bg-white/10 border border-transparent hover:border-white/20
                         transition-all duration-200 group"
            >
              <Settings className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center p-3 text-red-400 hover:text-white rounded-xl
                         hover:bg-red-500/20 border border-transparent hover:border-red-500/30
                         transition-all duration-200 group"
            >
              <LogOut className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}