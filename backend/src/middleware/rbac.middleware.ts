import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

// Role hierarchy for access control
const ROLE_HIERARCHY: Record<string, number> = {
  GUEST: 1,
  STUDENT: 2,
  TEACHING_ASSISTANT: 3,
  LECTURER: 4,
  IT_SUPPORT: 5,
  SECURITY_OFFICER: 6,
  SCRIPT_HANDLER: 7,
  INVIGILATOR: 8,
  CHIEF_INVIGILATOR: 9,
  ACADEMIC_OFFICER: 10,
  EXAM_COORDINATOR: 11,
  PROGRAM_COORDINATOR: 12,
  DEPARTMENT_HEAD: 13,
  FACULTY_ADMIN: 14,
  INSTITUTIONAL_ADMIN: 15,
  SYSTEM_ADMIN: 16,
  SUPER_ADMIN: 17,
};

// Permissions mapping for each role
export const ROLE_PERMISSIONS: Record<string, string[]> = {
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
};

/**
 * Check if user has required permission
 */
export const hasPermission = (userRole: string, requiredPermission: string): boolean => {
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  return userPermissions.includes(requiredPermission);
};

/**
 * Check if user role has sufficient hierarchy level
 */
export const hasRoleLevel = (userRole: string, requiredRole: string): boolean => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
};

/**
 * Middleware to check if user has required permission
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!hasPermission(user.role, permission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission,
        userRole: user.role
      });
    }

    next();
  };
};

/**
 * Middleware to check if user has minimum role level
 */
export const requireRole = (minimumRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!hasRoleLevel(user.role, minimumRole)) {
      return res.status(403).json({ 
        error: 'Insufficient role level',
        required: minimumRole,
        userRole: user.role
      });
    }

    next();
  };
};

/**
 * Super Admin only middleware
 */
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as AuthenticatedRequest).user;
  
  if (!user || user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ 
      error: 'Super Admin access required',
      userRole: user?.role || 'none'
    });
  }

  next();
};
