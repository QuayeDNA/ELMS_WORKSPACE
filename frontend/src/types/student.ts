// ========================================
// STUDENT TYPES FOR FRONTEND
// ========================================

import { RoleProfile } from './auth';

export interface Student {
  id: number; // User ID
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  status: string;

  // Student-specific data from roleProfile metadata
  studentId: string;
  indexNumber?: string;
  level: number;
  semester: number;
  academicYear?: string;
  programId?: number;
  admissionDate?: string;
  expectedGraduation?: string;
  enrollmentStatus: EnrollmentStatus;
  academicStatus: AcademicStatus;

  // Guardian/Emergency info (stored in metadata)
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  emergencyContact?: string;

  // Computed properties
  section?: string;
  credits?: number;
  cgpa?: number;

  createdAt: string;
  updatedAt: string;

  // Relations
  program?: {
    id: number;
    name: string;
    code: string;
    type: string;
    level: string;
    durationYears: number;
    creditHours?: number;
    description?: string;
    admissionRequirements?: string;
    isActive: boolean;
    degree?: string;
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

  // Optional roleProfile for advanced use
  roleProfile?: RoleProfile;
}

export enum EnrollmentStatus {
  ACTIVE = "ACTIVE",
  ENROLLED = "ENROLLED",
  WITHDRAWN = "WITHDRAWN",
  GRADUATED = "GRADUATED",
  SUSPENDED = "SUSPENDED",
  DEFERRED = "DEFERRED",
  TRANSFERRED = "TRANSFERRED",
}

export enum AcademicStatus {
  GOOD_STANDING = "GOOD_STANDING",
  PROBATION = "PROBATION",
  WARNING = "WARNING",
  DISMISSED = "DISMISSED",
  HONORS = "HONORS",
  DEAN_LIST = "DEAN_LIST",
}

export interface CreateStudentRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;

  // Student-specific fields (will be stored in roleProfile metadata)
  studentId: string;
  indexNumber?: string;
  level: number;
  semester?: number;
  academicYear?: string;
  programId: number;
  admissionDate?: string;
  expectedGraduation?: string;
  enrollmentStatus?: EnrollmentStatus;
  academicStatus?: AcademicStatus;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  emergencyContact?: string;
}

export interface UpdateStudentRequest {
  // User fields
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;

  // Student metadata fields
  indexNumber?: string;
  level?: number;
  semester?: number;
  academicYear?: string;
  programId?: number;
  admissionDate?: string;
  expectedGraduation?: string;
  enrollmentStatus?: EnrollmentStatus;
  academicStatus?: AcademicStatus;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  emergencyContact?: string;
}

export interface StudentFilters {
  programId?: number;
  departmentId?: number;
  facultyId?: number;
  institutionId?: number;
  level?: number;
  semester?: number;
  academicYear?: string;
  enrollmentStatus?: EnrollmentStatus;
  academicStatus?: AcademicStatus;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface StudentsResponse {
  success: boolean;
  data: Student[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: StudentFilters; // Made optional since backend doesn't return it
}

export interface BulkStudentImport {
  students: CreateStudentRequest[];
}

export interface BulkStudentImportResponse {
  success: boolean;
  data: {
    imported: number;
    failed: number;
    errors: Array<{
      index: number;
      student: CreateStudentRequest;
      error: string;
    }>;
  };
}

export interface StudentStats {
  total: number;
  totalStudents: number;
  activeStudents: number;
  newThisYear: number;
  graduatedStudents: number;
  graduates: number;
  suspendedStudents: number;
  averageCgpa: number;
  enrollmentByProgram: Array<{
    programId: number;
    programName: string;
    count: number;
  }>;
  enrollmentByLevel: Array<{
    level: number;
    count: number;
  }>;
  enrollmentByAcademicYear: Array<{
    academicYear: string;
    count: number;
  }>;
}

/**
 * Backend Student Statistics Response Structure
 * Matches the actual API response from the backend
 */
export interface BackendStudentStats {
  overview: {
    total: number;
    active: number;
    graduated: number;
    suspended: number;
  };
  byLevel: Array<{
    _count: number;
    level: number;
  }>;
  byProgram: Array<{
    _count: number;
    programId: number;
  }>;
  byEnrollmentStatus: Array<{
    _count: number;
    enrollmentStatus: string;
  }>;
}
