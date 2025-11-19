// ========================================
// INSTRUCTOR/LECTURER TYPES - Updated for RoleProfile
// ========================================

import { UserRole } from './auth';
import { LecturerMetadata, RolePermissions } from './roleProfile';

// ========================================
// ENUMS & TYPE ALIASES
// ========================================

export type AcademicRankLevel = 'GRADUATE_ASSISTANT' | 'ASSISTANT_LECTURER' | 'LECTURER' | 'SENIOR_LECTURER' | 'PRINCIPAL_LECTURER' | 'ASSOCIATE_PROFESSOR' | 'PROFESSOR';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'VISITING';
export type EmploymentStatus = 'ACTIVE' | 'ON_LEAVE' | 'RETIRED' | 'TERMINATED';

// ========================================
// INSTRUCTOR PROFILE DTOs (Frontend-friendly)
// ========================================

export interface InstructorProfileResponse {
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
    dateOfBirth?: Date;
    gender?: string;
    nationality?: string;
    address?: string;
    status: string;
    createdAt: Date;
    updatedAt?: Date;
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

export interface InstructorListItemDTO {
  userId: number;
  staffId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  title?: string;
  email: string;
  phone?: string;
  academicRank?: AcademicRankLevel;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  specialization?: string;
  departmentNames: string[];
  isActive: boolean;
}

// ========================================
// CREATE/UPDATE INSTRUCTOR DTOs
// ========================================

export interface CreateInstructorData {
  // User data
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
  };

  // Lecturer profile/metadata
  profile: {
    staffId: string;
    academicRank?: AcademicRankLevel;
    employmentType: EmploymentType;
    employmentStatus?: EmploymentStatus;
    hireDate?: Date;
    highestQualification?: string;
    specialization?: string;
    researchInterests?: string;
    officeLocation?: string;
    officeHours?: string;
    biography?: string;
    profileImageUrl?: string;
  };

  // Department assignments
  departments?: Array<{
    departmentId: number;
    isPrimary?: boolean;
  }>;

  // Optional custom permissions
  permissions?: Partial<RolePermissions>;

  // Optional organizational assignment
  institutionId?: number;
  facultyId?: number;
}

export interface UpdateInstructorData {
  // User updates
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
    status?: string;
  };

  // Profile/metadata updates (partial)
  profile?: {
    academicRank?: AcademicRankLevel;
    employmentType?: EmploymentType;
    employmentStatus?: EmploymentStatus;
    hireDate?: Date;
    highestQualification?: string;
    specialization?: string;
    researchInterests?: string;
    officeLocation?: string;
    officeHours?: string;
    biography?: string;
    profileImageUrl?: string;
  };

  // Permission updates
  permissions?: Partial<RolePermissions>;

  // Profile status
  isActive?: boolean;
}

// ========================================
// INSTRUCTOR QUERY & FILTER DTOs
// ========================================

export interface InstructorQueryParams {
  page?: number;
  limit?: number;
  search?: string; // Search by name, email, staffId
  departmentId?: number;
  facultyId?: number;
  institutionId?: number;
  academicRank?: AcademicRankLevel;
  employmentType?: EmploymentType;
  employmentStatus?: EmploymentStatus;
  specialization?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InstructorStatsParams {
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
}

export interface InstructorStatsDTO {
  totalInstructors: number;
  activeInstructors: number;
  byAcademicRank: Record<string, number>;
  byEmploymentType: Record<string, number>;
  byEmploymentStatus: Record<string, number>;
  byDepartment: Array<{
    departmentId: number;
    departmentName: string;
    count: number;
  }>;
}

// ========================================
// COURSE ASSIGNMENT DTOs
// ========================================

export interface InstructorCourseAssignmentDTO {
  id: number;
  courseId: number;
  lecturerId: number;
  academicPeriodId: number;
  role: 'PRIMARY' | 'ASSISTANT' | 'LAB_INSTRUCTOR';
  isActive: boolean;
  course: {
    id: number;
    code: string;
    title: string;
    credits: number;
    level: number;
    semester: number;
  };
  academicPeriod: {
    id: number;
    name: string;
    startDate: Date;
    endDate: Date;
  };
}

export interface InstructorWorkloadDTO {
  instructorId: number;
  instructorName: string;
  staffId: string;
  totalCourses: number;
  totalCredits: number;
  courseAssignments: InstructorCourseAssignmentDTO[];
  academicPeriod: {
    id: number;
    name: string;
  };
}

// ========================================
// DEPARTMENT ASSIGNMENT DTOs
// ========================================

export interface DepartmentAssignmentDTO {
  id: number;
  lecturerId: number;
  departmentId: number;
  isPrimary: boolean;
  assignedDate: Date;
  department: {
    id: number;
    name: string;
    code: string;
    faculty: {
      id: number;
      name: string;
      code: string;
    };
  };
}

export interface AddDepartmentAssignmentRequest {
  departmentId: number;
  isPrimary?: boolean;
}

export interface UpdateDepartmentAssignmentRequest {
  isPrimary?: boolean;
}
