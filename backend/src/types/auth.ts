// ========================================
// IMPORTS - Using new RoleProfile types
// ========================================

import { UserRole, UserStatus } from "@prisma/client";
import { RolePermissions, RoleMetadata } from './roleProfile';

// Re-export for convenience
export { UserRole, UserStatus } from "@prisma/client";
export type { RolePermissions } from './roleProfile';

// ========================================
// ROLE HIERARCHY & SCOPE
// ========================================

export interface RoleHierarchy {
  role: UserRole;
  permissions: RolePermissions;
  scope: 'SYSTEM' | 'INSTITUTION' | 'FACULTY' | 'DEPARTMENT' | 'COURSE';
  description: string;
  managedRoles: UserRole[]; // Roles this role can manage
}

// ========================================
// AUTHENTICATION REQUEST DTOs
// ========================================

export interface LoginRequest {
  email: string;
  password: string;
  institutionId?: number;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  title?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: string;
  nationality?: string;
  address?: string;
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
  role?: UserRole;
  // Role-specific metadata - flexible JSON structure
  metadata?: Partial<RoleMetadata>;
  // Student-specific fields for convenience (will be mapped to metadata)
  studentId?: string;
  indexNumber?: string;
  level?: number;
  semester?: number;
  programId?: number;
  // Staff fields for convenience (will be mapped to metadata)
  staffId?: string;
  inviteToken?: string; // For invited users
}

// ========================================
// USER DTOs
// ========================================

export interface UserDTO {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  title?: string;
  status: UserStatus;
  primaryRole: UserRole;
  roles: Array<{
    role: UserRole;
    isActive: boolean;
    isPrimary: boolean;
    permissions: RolePermissions;
    metadata: RoleMetadata;
  }>;
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
  lastLogin?: Date;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    title?: string;
    role: UserRole; // Primary role for backward compatibility
    status: UserStatus;
    institutionId?: number;
    facultyId?: number;
    departmentId?: number;
    emailVerified: boolean;
    roleProfiles?: Array<{
      role: UserRole;
      isActive: boolean;
      isPrimary: boolean;
      permissions: RolePermissions;
      metadata: RoleMetadata;
    }>;
  };
  primaryRole: UserRole;
  roles: Array<{
    role: UserRole;
    isActive: boolean;
    isPrimary: boolean;
    permissions: RolePermissions;
    metadata: RoleMetadata;
  }>;
  permissions: RolePermissions; // Primary role permissions for quick access
}

export interface JwtPayload {
  id: number; // User ID for backward compatibility (same as userId)
  userId: number;
  email: string;
  primaryRole: UserRole;
  roles: UserRole[]; // All active roles
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
  permissions: RolePermissions; // Primary role permissions
  iat?: number;
  exp?: number;
}

// ========================================
// ACCESS CONTROL INTERFACES
// ========================================

export interface AccessContext {
  userId: number;
  role: UserRole;
  permissions: RolePermissions;
  resource: string;
  action: string;
  resourceId?: string | number;
  scope?: {
    institutionId?: number;
    facultyId?: number;
    departmentId?: number;
    courseId?: number;
  };
}

export interface PermissionCheck {
  granted: boolean;
  reason?: string;
  requiredRole?: UserRole;
  requiredPermission?: string;
  matchedRole?: UserRole;
}

// ========================================
// PASSWORD MANAGEMENT
// ========================================

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirmRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// ========================================
// TOKEN MANAGEMENT
// ========================================

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// ========================================
// SESSION MANAGEMENT
// ========================================

export interface UserSession {
  id: string;
  userId: number;
  token: string;
  refreshToken: string;
  deviceInfo: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
}

// ========================================
// AUDIT & LOGGING
// ========================================

export interface AuditLogEntry {
  id: number;
  userId: number;
  action: string;
  entity: string;
  entityId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
