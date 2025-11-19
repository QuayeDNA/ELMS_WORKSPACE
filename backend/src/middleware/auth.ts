import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole, JwtPayload, AccessContext, PermissionCheck, RolePermissions, UserStatus } from '../types/auth';
import { getRolePermissions, hasPermission, canManageRole } from '../config/roles';

// Extend Express Request to include user data
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      accessContext?: AccessContext;
    }
  }
}

// ========================================
// JWT AUTHENTICATION MIDDLEWARE
// ========================================

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
        code: 'MISSING_TOKEN'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Add user data to request
    req.user = decoded;

    // Create access context with flat properties matching AccessContext interface
    req.accessContext = {
      userId: decoded.userId,
      role: decoded.primaryRole, // Use primaryRole from new JWT structure
      permissions: decoded.permissions,
      resource: '',
      action: '',
      scope: {
        institutionId: decoded.institutionId,
        facultyId: decoded.facultyId,
        departmentId: decoded.departmentId
      }
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Token verification failed',
      code: 'TOKEN_VERIFICATION_FAILED'
    });
  }
};

// ========================================
// ROLE-BASED ACCESS CONTROL
// ========================================

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    if (!allowedRoles.includes(req.user.primaryRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient role privileges',
        code: 'INSUFFICIENT_ROLE',
        required: allowedRoles,
        current: req.user.primaryRole
      });
    }

    next();
  };
};

// ========================================
// PERMISSION-BASED ACCESS CONTROL
// ========================================

export const requirePermission = (resource: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    if (!hasPermission(req.user.primaryRole, resource, action)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: `${resource}:${action}`,
        role: req.user.primaryRole
      });
    }

    next();
  };
};

// ========================================
// SCOPE-BASED ACCESS CONTROL
// ========================================

export const requireScope = (scopeType: 'institution' | 'faculty' | 'department') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    const resourceId = parseInt(req.params[`${scopeType}Id`]) || req.body[`${scopeType}Id`];
    const userScopeId = req.user[`${scopeType}Id` as keyof JwtPayload] as number | undefined;

    // Super Admin and Admin can access any scope
    if (([UserRole.SUPER_ADMIN, UserRole.ADMIN] as UserRole[]).includes(req.user.primaryRole)) {
      return next();
    }

    // Check if user has access to the specific scope
    if (scopeType === 'institution' && userScopeId !== resourceId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Institution scope mismatch',
        code: 'SCOPE_MISMATCH'
      });
    }

    if (scopeType === 'faculty' && req.user.facultyId !== resourceId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Faculty scope mismatch',
        code: 'SCOPE_MISMATCH'
      });
    }

    if (scopeType === 'department' && req.user.departmentId !== resourceId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Department scope mismatch',
        code: 'SCOPE_MISMATCH'
      });
    }

    next();
  };
};

// ========================================
// RESOURCE OWNERSHIP CHECK
// ========================================

export const requireOwnership = (resourceType: 'script' | 'exam' | 'incident') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    // Super Admin and Admin can access any resource
    if (([UserRole.SUPER_ADMIN, UserRole.ADMIN] as UserRole[]).includes(req.user.primaryRole)) {
      return next();
    }

    try {
      const resourceId = parseInt(req.params.id);

      // This would typically involve a database check
      // For now, we'll implement basic logic

      switch (resourceType) {
        case 'script':
          // Students can only access their own scripts
          if (req.user.primaryRole === UserRole.STUDENT) {
            // Would check if script belongs to the student
            // const script = await prisma.script.findFirst({
            //   where: { id: resourceId, studentId: req.user.studentId }
            // });
            // if (!script) return res.status(403).json({ ... });
          }
          break;

        case 'exam':
          // Lecturers can only access exams for their courses
          if (req.user.primaryRole === UserRole.LECTURER) {
            // Would check if exam belongs to lecturer's courses
          }
          break;

        case 'incident':
          // Users can access incidents they reported or are assigned to
          break;
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Ownership verification failed',
        code: 'OWNERSHIP_CHECK_FAILED'
      });
    }
  };
};

// ========================================
// HIERARCHICAL ACCESS CONTROL
// ========================================

export const requireHierarchicalAccess = (targetRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    if (!canManageRole(req.user.primaryRole, targetRole)) {
      return res.status(403).json({
        success: false,
        message: 'Cannot manage users of this role level',
        code: 'HIERARCHICAL_ACCESS_DENIED',
        userRole: req.user.primaryRole,
        targetRole: targetRole
      });
    }

    next();
  };
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

export const checkPermission = (
  user: JwtPayload,
  resource: string,
  action: string,
  context?: any
): PermissionCheck => {
  const granted = hasPermission(user.primaryRole, resource, action);

  return {
    granted,
    reason: granted ? undefined : `Missing permission: ${resource}:${action}`,
    requiredPermission: `${resource}:${action}` as any,
  };
};

export const hasAnyRole = (user: JwtPayload, roles: UserRole[]): boolean => {
  return roles.includes(user.primaryRole);
};

export const isHigherOrEqualRole = (userRole: UserRole, targetRole: UserRole): boolean => {
  const roleHierarchy = [
    UserRole.STUDENT,
    UserRole.LECTURER,
    UserRole.INVIGILATOR,
    UserRole.SCRIPT_HANDLER,
    UserRole.EXAMS_OFFICER,
    UserRole.DEAN,
    UserRole.FACULTY_ADMIN,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ] as UserRole[];

  const userIndex = roleHierarchy.indexOf(userRole);
  const targetIndex = roleHierarchy.indexOf(targetRole);

  return userIndex >= targetIndex;
};
