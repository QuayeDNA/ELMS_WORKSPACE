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
  X
} from 'lucide-react'

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  requiredRoles?: string[]
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { logout, user } = useAuthStore()

  // Get navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    if (!user) return []

    // Super Admin specific navigation
    if (user.role === 'SUPER_ADMIN') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Monitor, path: '/dashboard' },
        { id: 'institutions', label: 'Institutions', icon: Building, path: '/superadmin/institutions' },
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
    onClose() // Close sidebar on mobile after logout
  }

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onClose()
            }
          }}
          tabIndex={-1}
          role="button"
          aria-label="Close sidebar"
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          w-64 flex flex-col bg-gradient-to-t from-[#0f172a] via-[#1e293b] to-[#334155]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ borderRight: '1px solid var(--outline)' }}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div>
            <h1 className="text-2xl font-bold text-white">ELMS</h1>
            <p className="text-sm text-gray-200">Exams Logistics Management</p>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white p-1"
          >
            <X className="h-5 w-5" />
          </button>
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
                onClick={onClose} // Close sidebar on mobile after navigation
                className={`w-full flex items-center justify-start px-3 py-2 rounded-lg text-sm font-medium transition-colors`}
                style={{
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? 'white' : 'var(--outline)'
                }}
              >
                <Icon className="mr-3 h-4 w-4 flex-shrink-0 text-current" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Profile & Settings */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)' }}>
              {user?.profile?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">
                {user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user?.email}
              </p>
              <p className="text-xs truncate text-gray-400">
                {user?.role ? getRoleDisplayName(user.role) : 'User'}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Link
              to="/profile"
              onClick={onClose}
              className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-gray-200 hover:bg-white/2 rounded-lg transition-colors"
            >
              <Settings className="h-4 w-4" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-red-400 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}