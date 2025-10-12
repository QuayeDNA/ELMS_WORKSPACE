// ========================================
// USER TYPES FOR BACKEND
// ========================================

import { UserRole, UserStatus } from './auth';
import { UserQuery } from './shared/query';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  title?: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: Date;
  emailVerified?: boolean;
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

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  title?: string;
  role: UserRole;
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
  role?: UserRole;
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
