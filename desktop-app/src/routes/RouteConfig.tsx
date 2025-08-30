import { lazy } from 'react';

// Lazy load components for better performance
const AuthPage = lazy(() => import('../components/auth/AuthPage').then(module => ({ default: module.AuthPage })));
const NotFoundPage = lazy(() => import('../components/NotFoundPage').then(module => ({ default: module.NotFoundPage })));

// Dashboard components
const Overview = lazy(() => import('../components/superadmin/Overview').then(module => ({ default: module.Overview })));

// User Management
const UserManagement = lazy(() => import('../components/superadmin/users/UserManagement').then(module => ({ default: module.UserManagement })));

// Analytics
const Analytics = lazy(() => import('../components/analytics/Analytics').then(module => ({ default: module.Analytics })));

// Exam Management
const ExamManagement = lazy(() => import('../components/exams/ExamManagement').then(module => ({ default: module.ExamManagement })));

// Incident Management
const IncidentManagement = lazy(() => import('../components/incidents/IncidentManagement').then(module => ({ default: module.IncidentManagement })));

// Script Management
const ScriptManagement = lazy(() => import('../components/scripts/ScriptManagement').then(module => ({ default: module.ScriptManagement })));

// Common components
const Profile = lazy(() => import('../components/common/Profile').then(module => ({ default: module.Profile })));
const Settings = lazy(() => import('../components/common/Settings').then(module => ({ default: module.Settings })));
const Help = lazy(() => import('../components/common/Help').then(module => ({ default: module.Help })));

// Role-based dashboard components (placeholder for now)
const createPlaceholderDashboard = (title: string, description: string) => () =>
  (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground mt-2">{description}</p>
    </div>
  );

export const DashboardComponents = {
  SUPER_ADMIN: Overview,
  INSTITUTION_ADMIN: createPlaceholderDashboard('Institution Admin Dashboard', 'Coming soon...'),
  DEPARTMENT_HEAD: createPlaceholderDashboard('Department Head Dashboard', 'Coming soon...'),
  REGISTRY_STAFF: createPlaceholderDashboard('Registry Staff Dashboard', 'Coming soon...'),
  ACADEMIC_STAFF: createPlaceholderDashboard('Academic Staff Dashboard', 'Coming soon...'),
  IT_SUPPORT: createPlaceholderDashboard('IT Support Dashboard', 'Coming soon...'),
  EXAM_OFFICER: createPlaceholderDashboard('Exam Officer Dashboard', 'Coming soon...'),
  INVIGILATOR: createPlaceholderDashboard('Invigilator Dashboard', 'Coming soon...'),
  STUDENT: createPlaceholderDashboard('Student Dashboard', 'Coming soon...'),
  EXTERNAL_EXAMINER: createPlaceholderDashboard('External Examiner Dashboard', 'Coming soon...'),
  VICE_CHANCELLOR: createPlaceholderDashboard('Vice Chancellor Dashboard', 'Coming soon...'),
  REGISTRAR: createPlaceholderDashboard('Registrar Dashboard', 'Coming soon...'),
  FINANCE_STAFF: createPlaceholderDashboard('Finance Staff Dashboard', 'Coming soon...'),
  AUDITOR: createPlaceholderDashboard('Auditor Dashboard', 'Coming soon...'),
  SECURITY_STAFF: createPlaceholderDashboard('Security Staff Dashboard', 'Coming soon...'),
  MAINTENANCE_STAFF: createPlaceholderDashboard('Maintenance Staff Dashboard', 'Coming soon...'),
  GUEST: createPlaceholderDashboard('Guest Dashboard', 'Limited access view...'),
};

// Route configuration with role-based access
export const routeConfig = {
  // Public routes
  public: [
    {
      path: '/auth',
      element: AuthPage,
      title: 'Authentication'
    },
    {
      path: '/404',
      element: NotFoundPage,
      title: 'Page Not Found'
    }
  ],

  // Protected routes (require authentication)
  protected: {
    // Dashboard routes (role-based)
    dashboard: {
      path: '/dashboard',
      title: 'Dashboard',
      roles: ['*'], // All authenticated users
      element: Overview // Default to Overview component
    },

    // Super Admin routes
    superadmin: [
      {
        path: '/superadmin/overview',
        element: Overview,
        title: 'System Overview',
        roles: ['SUPER_ADMIN']
      },
      {
        path: '/superadmin/users',
        element: UserManagement,
        title: 'User Management',
        roles: ['SUPER_ADMIN']
      }
    ],

    // Institution Admin routes
    institution: [
      {
        path: '/institution/dashboard',
        element: createPlaceholderDashboard('Institution Admin Dashboard', 'Manage your institution'),
        title: 'Institution Dashboard',
        roles: ['SUPER_ADMIN', 'INSTITUTION_ADMIN']
      },
      {
        path: '/institution/departments',
        element: createPlaceholderDashboard('Department Management', 'Manage departments'),
        title: 'Departments',
        roles: ['SUPER_ADMIN', 'INSTITUTION_ADMIN']
      },
      {
        path: '/institution/staff',
        element: createPlaceholderDashboard('Staff Management', 'Manage staff members'),
        title: 'Staff',
        roles: ['SUPER_ADMIN', 'INSTITUTION_ADMIN']
      },
      {
        path: '/institution/students',
        element: createPlaceholderDashboard('Student Management', 'Manage students'),
        title: 'Students',
        roles: ['SUPER_ADMIN', 'INSTITUTION_ADMIN']
      }
    ],

    // Common routes (available to authenticated users)
    common: [
      {
        path: '/profile',
        element: Profile,
        title: 'Profile',
        roles: ['*']
      },
      {
        path: '/settings',
        element: Settings,
        title: 'Settings',
        roles: ['SUPER_ADMIN', 'INSTITUTION_ADMIN']
      },
      {
        path: '/help',
        element: Help,
        title: 'Help & Support',
        roles: ['*']
      }
    ],

    // Feature-specific routes
    features: [
      {
        path: '/analytics',
        element: Analytics,
        title: 'Analytics',
        roles: ['SUPER_ADMIN', 'INSTITUTION_ADMIN', 'VICE_CHANCELLOR', 'REGISTRAR']
      },
      {
        path: '/exams',
        element: ExamManagement,
        title: 'Exam Management',
        roles: ['SUPER_ADMIN', 'ACADEMIC_STAFF', 'EXAM_OFFICER', 'IT_SUPPORT']
      },
      {
        path: '/incidents',
        element: IncidentManagement,
        title: 'Incident Management',
        roles: ['SUPER_ADMIN', 'IT_SUPPORT', 'SECURITY_STAFF']
      },
      {
        path: '/scripts',
        element: ScriptManagement,
        title: 'Script Management',
        roles: ['SUPER_ADMIN', 'IT_SUPPORT']
      }
    ]
  }
};

// Helper function to get user role permissions
export const getUserPermissions = (userRole: string): string[] => {
  const rolePermissions: Record<string, string[]> = {
    SUPER_ADMIN: [
      'system:manage',
      'users:create', 'users:read', 'users:update', 'users:delete',
      'institutions:create', 'institutions:read', 'institutions:update', 'institutions:delete',
      'roles:assign', 'audit:view', 'settings:configure', 'backup:manage'
    ],
    INSTITUTION_ADMIN: [
      'institution:manage',
      'departments:create', 'departments:read', 'departments:update', 'departments:delete',
      'staff:create', 'staff:read', 'staff:update', 'staff:delete',
      'students:create', 'students:read', 'students:update', 'students:delete'
    ],
    ACADEMIC_STAFF: [
      'courses:create', 'courses:read', 'courses:update',
      'exams:create', 'exams:read', 'exams:update',
      'grades:create', 'grades:read', 'grades:update'
    ],
    STUDENT: [
      'courses:read', 'grades:read', 'exams:read', 'profile:update'
    ],
    // Add more roles as needed
  };

  return rolePermissions[userRole] || [];
};

// Helper function to check if user has required role
export const hasRequiredRole = (userRole: string, requiredRoles: string[]): boolean => {
  if (requiredRoles.includes('*')) return true;
  return requiredRoles.includes(userRole);
};

// Helper function to check if user has required permission
export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  return userPermissions.includes(requiredPermission);
};
