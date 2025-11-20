// ========================================
// STUDENT TYPES - Updated for RoleProfile
// ========================================

import { UserRole } from './auth';
import { StudentMetadata, RolePermissions } from './roleProfile';

// ========================================
// ENUMS & TYPE ALIASES
// ========================================

export type EnrollmentStatus = 'ACTIVE' | 'DEFERRED' | 'GRADUATED' | 'WITHDRAWN' | 'SUSPENDED';
export type AcademicStatus = 'GOOD_STANDING' | 'PROBATION' | 'SUSPENDED';

// ========================================
// STUDENT PROFILE DTOs (Frontend-friendly)
// ========================================

export interface StudentProfileResponse {
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
    dateOfBirth?: Date;
    gender?: string;
    nationality?: string;
    address?: string;
    status: string;
    createdAt: Date;
    updatedAt?: Date;
  };
  program?: {
    id: number;
    name: string;
    code: string;
    level: string;
    type: string;
    duration: number;
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
  enrollments?: Array<{
    id: number;
    courseId: number;
    status: string;
    enrollmentDate: Date;
    course: {
      id: number;
      code: string;
      title: string;
      credits: number;
    };
  }>;
}

export interface StudentListItemDTO {
  userId: number;
  studentId: string;
  indexNumber?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  level: number;
  semester: number;
  enrollmentStatus: EnrollmentStatus;
  academicStatus: AcademicStatus;
  programName?: string;
  programCode?: string;
  departmentName?: string;
  isActive: boolean;
}

// ========================================
// CREATE/UPDATE STUDENT DTOs
// ========================================

export interface CreateStudentData {
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

  // Student profile/metadata
  profile: {
    studentId: string;
    indexNumber?: string;
    level: number;
    semester?: number;
    programId?: number;
    academicYear?: string;
    admissionDate?: Date;
    expectedGraduation?: Date;
    enrollmentStatus?: EnrollmentStatus;
    academicStatus?: AcademicStatus;
    guardianName?: string;
    guardianPhone?: string;
    guardianEmail?: string;
    emergencyContact?: string;
  };

  // Optional custom permissions
  permissions?: Partial<RolePermissions>;

  // Optional organizational assignment
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
}

export interface UpdateStudentData {
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
    indexNumber?: string;
    level?: number;
    semester?: number;
    programId?: number;
    academicYear?: string;
    admissionDate?: Date;
    expectedGraduation?: Date;
    enrollmentStatus?: EnrollmentStatus;
    academicStatus?: AcademicStatus;
    guardianName?: string;
    guardianPhone?: string;
    guardianEmail?: string;
    emergencyContact?: string;
  };

  // Permission updates
  permissions?: Partial<RolePermissions>;

  // Profile status
  isActive?: boolean;
}

// ========================================
// STUDENT QUERY & FILTER DTOs
// ========================================

export interface StudentQueryParams {
  page?: number;
  limit?: number;
  search?: string; // Search by name, email, studentId, indexNumber
  level?: number;
  semester?: number;
  programId?: number;
  departmentId?: number;
  facultyId?: number;
  institutionId?: number;
  academicYear?: string;
  enrollmentStatus?: EnrollmentStatus;
  academicStatus?: AcademicStatus;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StudentStatsParams {
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
}

export interface StudentStatsDTO {
  totalStudents: number;
  activeStudents: number;
  byLevel: Record<number, number>;
  byEnrollmentStatus: Record<string, number>;
  byAcademicStatus: Record<string, number>;
  byProgram: Array<{
    programId: number;
    programName: string;
    count: number;
  }>;
}

// ========================================
// STUDENT ENROLLMENT DTOs
// ========================================

export interface StudentEnrollmentDTO {
  id: number;
  studentId: number;
  courseId: number;
  academicPeriodId: number;
  status: string;
  enrollmentDate: Date;
  completionDate?: Date;
  finalGrade?: string;
  gradePoints?: number;
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

// ========================================
// STUDENT ACADEMIC RECORD DTOs
// ========================================

export interface StudentAcademicRecord {
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  indexNumber?: string;
  program: {
    name: string;
    code: string;
    level: string;
  };
  currentLevel: number;
  currentSemester: number;
  enrollmentStatus: EnrollmentStatus;
  academicStatus: AcademicStatus;
  enrollments: StudentEnrollmentDTO[];
  gpa?: number;
  cgpa?: number;
  totalCreditsEarned?: number;
  totalCreditsAttempted?: number;
}
