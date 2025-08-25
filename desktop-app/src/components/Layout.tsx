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
  Shield,
  Building2,
  GraduationCap,
  Database,
  Server,
  ClipboardList,
  Eye,
  UserCheck,
  Building,
  CreditCard,
  Lock,
  Wrench,
} from 'lucide-react'
import NotificationCenter from './notifications/NotificationCenter'
import { ConnectionStatus } from './realtime/ConnectionStatus'

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  requiredRoles?: string[]
}

export const Layout = () => {
  const location = useLocation()
  const { logout, user, hasAnyRole } = useAuthStore()

  // Role-based navigation items
  const getAllNavigationItems = (): NavigationItem[] => [
    // Dashboard - always visible
    { id: 'dashboard', label: 'Dashboard', icon: Monitor, path: '/dashboard' },

    // Super Admin specific
    { 
      id: 'superadmin-users', 
      label: 'User Management', 
      icon: Shield, 
      path: '/superadmin/users',
      requiredRoles: ['SUPER_ADMIN']
    },
    { 
      id: 'superadmin-institutions', 
      label: 'Institution Management', 
      icon: Building2, 
      path: '/superadmin/institutions',
      requiredRoles: ['SUPER_ADMIN']
    },
    { 
      id: 'superadmin-audit', 
      label: 'Audit Logs', 
      icon: Database, 
      path: '/superadmin/audit',
      requiredRoles: ['SUPER_ADMIN']
    },

    // Institution Admin
    { 
      id: 'institution-departments', 
      label: 'Departments', 
      icon: Building, 
      path: '/institution/departments',
      requiredRoles: ['SUPER_ADMIN', 'INSTITUTION_ADMIN']
    },
    { 
      id: 'institution-staff', 
      label: 'Staff Management', 
      icon: Users, 
      path: '/institution/staff',
      requiredRoles: ['SUPER_ADMIN', 'INSTITUTION_ADMIN']
    },

    // Department Head
    { 
      id: 'department-courses', 
      label: 'Course Management', 
      icon: GraduationCap, 
      path: '/department/courses',
      requiredRoles: ['SUPER_ADMIN', 'INSTITUTION_ADMIN', 'DEPARTMENT_HEAD']
    },

    // Exam Management
    { 
      id: 'exams', 
      label: 'Exam Management', 
      icon: BookOpen, 
      path: '/exams',
      requiredRoles: ['SUPER_ADMIN', 'INSTITUTION_ADMIN', 'EXAM_OFFICER', 'ACADEMIC_STAFF']
    },
    { 
      id: 'exam-scheduling', 
      label: 'Exam Scheduling', 
      icon: ClipboardList, 
      path: '/exams/scheduling',
      requiredRoles: ['SUPER_ADMIN', 'INSTITUTION_ADMIN', 'EXAM_OFFICER']
    },

    // Student specific
    { 
      id: 'student-exams', 
      label: 'My Exams', 
      icon: BookOpen, 
      path: '/student/exams',
      requiredRoles: ['STUDENT']
    },
    { 
      id: 'student-results', 
      label: 'My Results', 
      icon: BarChart3, 
      path: '/student/results',
      requiredRoles: ['STUDENT']
    },

    // Invigilator
    { 
      id: 'supervision', 
      label: 'Exam Supervision', 
      icon: Eye, 
      path: '/invigilator/exams',
      requiredRoles: ['INVIGILATOR', 'EXAM_OFFICER']
    },

    // External Examiner
    { 
      id: 'evaluation', 
      label: 'Exam Evaluation', 
      icon: UserCheck, 
      path: '/examiner/evaluation',
      requiredRoles: ['EXTERNAL_EXAMINER']
    },

    // Finance
    { 
      id: 'finance', 
      label: 'Finance Management', 
      icon: CreditCard, 
      path: '/finance/management',
      requiredRoles: ['FINANCE_STAFF']
    },

    // Security
    { 
      id: 'security', 
      label: 'Security Monitoring', 
      icon: Lock, 
      path: '/security/monitoring',
      requiredRoles: ['SECURITY_STAFF']
    },

    // Maintenance
    { 
      id: 'maintenance', 
      label: 'Facility Maintenance', 
      icon: Wrench, 
      path: '/maintenance/facilities',
      requiredRoles: ['MAINTENANCE_STAFF']
    },

    // IT Support
    { 
      id: 'it-maintenance', 
      label: 'System Maintenance', 
      icon: Server, 
      path: '/it/maintenance',
      requiredRoles: ['SUPER_ADMIN', 'IT_SUPPORT']
    },

    // Legacy/Common routes
    { 
      id: 'scripts', 
      label: 'Scripts', 
      icon: FileText, 
      path: '/scripts',
      requiredRoles: ['SUPER_ADMIN', 'IT_SUPPORT', 'ACADEMIC_STAFF']
    },
    { 
      id: 'users', 
      label: 'Users', 
      icon: Users, 
      path: '/users',
      requiredRoles: ['SUPER_ADMIN', 'INSTITUTION_ADMIN', 'IT_SUPPORT']
    },
    { 
      id: 'incidents', 
      label: 'Incidents', 
      icon: AlertTriangle, 
      path: '/incidents',
      requiredRoles: ['SUPER_ADMIN', 'IT_SUPPORT', 'SECURITY_STAFF']
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3, 
      path: '/analytics',
      requiredRoles: ['SUPER_ADMIN', 'INSTITUTION_ADMIN', 'VICE_CHANCELLOR', 'REGISTRAR']
    }
  ]

  // Filter navigation items based on user role
  const navigationItems = getAllNavigationItems().filter(item => {
    if (!item.requiredRoles) return true // No role requirement, show to all
    return hasAnyRole(item.requiredRoles)
  })

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
