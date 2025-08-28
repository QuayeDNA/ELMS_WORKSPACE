import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  role: string
  profile: {
    firstName: string
    lastName: string
    department?: string
    faculty?: string
    phoneNumber?: string
    dateOfBirth?: string
    nationality?: string
    emergencyContact?: any
  }
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  permissions: string[]
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => void
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
}

// role hierarchy removed; not currently used

// Permissions mapping for each role (mirrored from backend)
const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: [
    'system:manage',
    'users:create',
    'users:read',
    'users:update',
    'users:delete',
    'institutions:create',
    'institutions:read',
    'institutions:update',
    'institutions:delete',
    'roles:assign',
    'audit:view',
    'settings:configure',
    'backup:manage',
    'monitoring:access',
    'reports:generate',
    'data:export',
    'data:import',
    'security:configure'
  ],
  SYSTEM_ADMIN: [
    'users:read',
    'users:update',
    'system:configure',
    'monitoring:access',
    'backup:view',
    'audit:view'
  ],
  INSTITUTIONAL_ADMIN: [
    'institution:manage',
    'faculties:manage',
    'departments:read',
    'users:read',
    'users:update',
    'reports:view'
  ],
  FACULTY_ADMIN: [
    'faculty:manage',
    'departments:manage',
    'courses:read',
    'users:read',
    'reports:view'
  ],
  DEPARTMENT_HEAD: [
    'department:manage',
    'courses:manage',
    'lecturers:read',
    'students:read'
  ],
  PROGRAM_COORDINATOR: [
    'programs:manage',
    'courses:read',
    'students:read'
  ],
  ACADEMIC_OFFICER: [
    'academics:manage',
    'courses:read',
    'students:read'
  ],
  EXAM_COORDINATOR: [
    'exams:manage',
    'schedules:create',
    'venues:assign',
    'invigilators:assign'
  ],
  CHIEF_INVIGILATOR: [
    'invigilation:supervise',
    'incidents:manage',
    'invigilators:coordinate'
  ],
  INVIGILATOR: [
    'invigilation:conduct',
    'incidents:report',
    'attendance:mark'
  ],
  SCRIPT_HANDLER: [
    'scripts:collect',
    'scripts:track',
    'scripts:deliver'
  ],
  SECURITY_OFFICER: [
    'security:monitor',
    'incidents:investigate',
    'access:control'
  ],
  IT_SUPPORT: [
    'technical:support',
    'systems:troubleshoot'
  ],
  LECTURER: [
    'courses:read',
    'students:read',
    'grades:manage'
  ],
  TEACHING_ASSISTANT: [
    'courses:assist',
    'students:read'
  ],
  STUDENT: [
    'profile:read',
    'exams:view',
    'results:view'
  ],
  GUEST: [
    'public:read'
  ]
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      permissions: [],

      login: async (email: string, password: string) => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Login failed')
          }

          const data = await response.json()

          // Get user permissions based on role
          const userPermissions = ROLE_PERMISSIONS[data.user.role] || []

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            permissions: userPermissions,
          })

          return data;
        } catch (error) {
          console.error('Login error:', error)
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          permissions: [],
        })
      },

      checkAuth: () => {
        const { token, user } = get()
        if (token && user) {
          // Verify token with backend if needed
          const userPermissions = ROLE_PERMISSIONS[user.role] || []
          set({ 
            isAuthenticated: true,
            permissions: userPermissions
          })
        }
      },

      hasPermission: (permission: string) => {
        const { permissions } = get()
        return permissions.includes(permission)
      },

      hasRole: (role: string) => {
        const { user } = get()
        return user?.role === role
      },

      hasAnyRole: (roles: string[]) => {
        const { user } = get()
        return user ? roles.includes(user.role) : false
      },
    }),
    {
      name: 'elms-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
      }),
    }
  )
)
