// ========================================
// ROLE PROFILE DTOs - Phase 1 Refactoring
// ========================================

import { UserRole } from './auth';

// ========================================
// METADATA INTERFACES (Type-safe)
// ========================================

export interface StudentMetadata {
  studentId: string;
  indexNumber?: string;
  level: number;
  semester: number;
  programId?: number;
  academicYear?: string;
  admissionDate?: string;
  expectedGraduation?: string;
  enrollmentStatus: 'ACTIVE' | 'DEFERRED' | 'GRADUATED' | 'WITHDRAWN' | 'SUSPENDED';
  academicStatus: 'GOOD_STANDING' | 'PROBATION' | 'SUSPENDED';
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  emergencyContact?: string;
}

export interface LecturerMetadata {
  staffId: string;
  academicRank?: 'GRADUATE_ASSISTANT' | 'ASSISTANT_LECTURER' | 'LECTURER' | 'SENIOR_LECTURER' | 'PRINCIPAL_LECTURER' | 'ASSOCIATE_PROFESSOR' | 'PROFESSOR';
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'VISITING';
  employmentStatus: 'ACTIVE' | 'ON_LEAVE' | 'RETIRED' | 'TERMINATED';
  hireDate?: string;
  highestQualification?: string;
  specialization?: string;
  researchInterests?: string;
  officeLocation?: string;
  officeHours?: string;
  biography?: string;
  profileImageUrl?: string;
}

export interface AdminMetadata {
  adminLevel?: 'SYSTEM' | 'INSTITUTION' | 'FACULTY';
  responsibilities?: string[];
  [key: string]: any;
}

export interface ExamOfficerMetadata {
  officeLocation?: string;
  contactExtension?: string;
  specializations?: string[];
  [key: string]: any;
}

export interface ScriptHandlerMetadata {
  handlerCode?: string;
  assignedFaculties?: number[];
  [key: string]: any;
}

export interface InvigilatorMetadata {
  certificationDate?: string;
  certificationExpiry?: string;
  maxSessionsPerDay?: number;
  [key: string]: any;
}

export type RoleMetadata =
  | StudentMetadata
  | LecturerMetadata
  | AdminMetadata
  | ExamOfficerMetadata
  | ScriptHandlerMetadata
  | InvigilatorMetadata
  | Record<string, any>;

// ========================================
// PERMISSION INTERFACES
// ========================================

export interface ResourcePermissions {
  create?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
  manage?: boolean;
  view?: boolean;
  assign?: boolean;
  approve?: boolean;
  grade?: boolean;
  schedule?: boolean;
  report?: boolean;
  [action: string]: boolean | undefined;
}

export interface RolePermissions {
  all?: ResourcePermissions;
  users?: ResourcePermissions;
  faculties?: ResourcePermissions;
  departments?: ResourcePermissions;
  programs?: ResourcePermissions;
  courses?: ResourcePermissions;
  exams?: ResourcePermissions;
  scripts?: ResourcePermissions;
  incidents?: ResourcePermissions;
  venues?: ResourcePermissions;
  analytics?: ResourcePermissions;
  reports?: ResourcePermissions;
  students?: ResourcePermissions;
  lecturers?: ResourcePermissions;
  [resource: string]: ResourcePermissions | undefined;
}

// ========================================
// ROLE PROFILE DTOs (Frontend-friendly)
// ========================================

export interface RoleProfileDTO {
  id: number;
  userId: number;
  role: UserRole;
  permissions: RolePermissions;
  metadata: RoleMetadata;
  isActive: boolean;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleProfileWithUserDTO extends RoleProfileDTO {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    title?: string;
    status: string;
    phone?: string;
    institutionId?: number;
    facultyId?: number;
    departmentId?: number;
  };
}

// ========================================
// CREATE/UPDATE DTOs
// ========================================

export interface CreateRoleProfileRequest {
  userId: number;
  role: UserRole;
  permissions: RolePermissions;
  metadata: RoleMetadata;
  isPrimary?: boolean;
  isActive?: boolean;
}

export interface UpdateRoleProfileRequest {
  permissions?: Partial<RolePermissions>;
  metadata?: Partial<RoleMetadata>;
  isPrimary?: boolean;
  isActive?: boolean;
}

export interface UpdateProfileMetadataRequest {
  metadata: Partial<RoleMetadata>;
}

export interface UpdateProfilePermissionsRequest {
  permissions: Partial<RolePermissions>;
}

// ========================================
// STUDENT PROFILE DTOs
// ========================================

export interface StudentProfileDTO {
  userId: number;
  role: 'STUDENT';
  metadata: StudentMetadata;
  permissions: RolePermissions;
  isActive: boolean;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
  };
  program?: {
    id: number;
    name: string;
    code: string;
    level: string;
    department: {
      id: number;
      name: string;
      code: string;
      faculty: {
        id: number;
        name: string;
        code: string;
        institution: {
          id: number;
          name: string;
          code: string;
        };
      };
    };
  };
}

export interface CreateStudentProfileRequest {
  user: {
    email: string;
    password: string;
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
  };
  metadata: StudentMetadata;
  permissions?: Partial<RolePermissions>;
}

export interface UpdateStudentProfileRequest {
  user?: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    phone?: string;
    dateOfBirth?: Date;
    gender?: string;
    nationality?: string;
    address?: string;
  };
  metadata?: Partial<StudentMetadata>;
}

// ========================================
// LECTURER PROFILE DTOs
// ========================================

export interface LecturerProfileDTO {
  userId: number;
  role: 'LECTURER';
  metadata: LecturerMetadata;
  permissions: RolePermissions;
  isActive: boolean;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    title?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
  };
  departments: Array<{
    id: number;
    departmentId: number;
    isPrimary: boolean;
    department: {
      id: number;
      name: string;
      code: string;
      faculty: {
        id: number;
        name: string;
        code: string;
        institution: {
          id: number;
          name: string;
          code: string;
        };
      };
    };
  }>;
}

export interface CreateLecturerProfileRequest {
  user: {
    email: string;
    password: string;
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
  };
  metadata: LecturerMetadata;
  permissions?: Partial<RolePermissions>;
  departments?: Array<{
    departmentId: number;
    isPrimary?: boolean;
  }>;
}

export interface UpdateLecturerProfileRequest {
  user?: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    title?: string;
    phone?: string;
    dateOfBirth?: Date;
    gender?: string;
    nationality?: string;
    address?: string;
  };
  metadata?: Partial<LecturerMetadata>;
}

// ========================================
// MULTI-ROLE USER DTOs
// ========================================

export interface MultiRoleUserDTO {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  title?: string;
  status: string;
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
  createdAt: string;
  updatedAt: string;
}

// ========================================
// PERMISSION CHECK DTOs
// ========================================

export interface PermissionCheckRequest {
  userId: number;
  resource: string;
  action: string;
}

export interface PermissionCheckResponse {
  granted: boolean;
  reason?: string;
  matchedRole?: UserRole;
}

export interface HasRoleRequest {
  userId: number;
  roles: UserRole | UserRole[];
}

export interface HasRoleResponse {
  hasRole: boolean;
  matchedRoles: UserRole[];
}

// ========================================
// QUERY & FILTER DTOs
// ========================================

export interface RoleProfileQueryParams {
  userId?: number;
  role?: UserRole;
  isActive?: boolean;
  isPrimary?: boolean;
  page?: number;
  limit?: number;
}

export interface RoleProfileStatsDTO {
  totalProfiles: number;
  activeProfiles: number;
  inactiveProfiles: number;
  profilesByRole: Record<UserRole, number>;
  multiRoleUsers: number;
}
