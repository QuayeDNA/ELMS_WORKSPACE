// ========================================
// USER TYPES - Updated for RoleProfile
// ========================================

import { UserRole, UserStatus } from './auth';
import { UserQuery } from './shared/query';
import { RolePermissions, RoleMetadata } from './roleProfile';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  title?: string;
  primaryRole: UserRole; // Primary role from active RoleProfile
  status: UserStatus;
  lastLogin?: Date;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  phone?: string;
  dateOfBirth?: Date;
  gender?: string;
  nationality?: string;
  address?: string;
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  institution?: {
    id: number;
    name: string;
    code: string;
  };
  faculty?: {
    id: number;
    name: string;
    code: string;
  };
  department?: {
    id: number;
    name: string;
    code: string;
  };
}

export interface UserWithRolesDTO extends User {
  roles: Array<{
    role: UserRole;
    isActive: boolean;
    isPrimary: boolean;
    permissions: RolePermissions;
    metadata: RoleMetadata;
  }>;
}

export interface UserListItemDTO {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  status: UserStatus;
  primaryRole: UserRole;
  roles: UserRole[]; // All active roles
  institutionName?: string;
  facultyName?: string;
  departmentName?: string;
  lastLogin?: Date;
  emailVerified: boolean;
  createdAt: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  title?: string;
  role: UserRole; // Primary role
  roleMetadata: RoleMetadata; // Role-specific metadata
  rolePermissions?: Partial<RolePermissions>; // Optional custom permissions
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
  phone?: string;
  dateOfBirth?: Date;
  gender?: string;
  nationality?: string;
  address?: string;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  title?: string;
  status?: UserStatus;
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
  phone?: string;
  dateOfBirth?: Date;
  gender?: string;
  nationality?: string;
  address?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  pendingUsers: number;
  usersByRole: Record<UserRole, number>;
  usersByInstitution: Array<{
    institutionId: number;
    institutionName: string;
    count: number;
  }>;
}
