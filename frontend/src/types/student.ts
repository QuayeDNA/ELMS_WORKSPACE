// ========================================
// STUDENT TYPES FOR FRONTEND
// ========================================

export interface Student {
  id: number;
  userId: number;
  studentId: string;
  programId: number;
  academicYear: string;
  semester: number;
  level: number;
  section?: string;
  cgpa?: number;
  credits: number;
  enrollmentDate: string;
  graduationDate?: string;
  enrollmentStatus: EnrollmentStatus;
  academicStatus: AcademicStatus;
  emergencyContact?: string;
  parentGuardianName?: string;
  parentGuardianPhone?: string;
  parentGuardianEmail?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    address?: string;
  };
  
  program: {
    id: number;
    name: string;
    code: string;
    degree: string;
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
}

export enum EnrollmentStatus {
  ENROLLED = 'ENROLLED',
  WITHDRAWN = 'WITHDRAWN',
  GRADUATED = 'GRADUATED',
  SUSPENDED = 'SUSPENDED',
  DEFERRED = 'DEFERRED',
  TRANSFERRED = 'TRANSFERRED'
}

export enum AcademicStatus {
  GOOD_STANDING = 'GOOD_STANDING',
  PROBATION = 'PROBATION',
  WARNING = 'WARNING',
  DISMISSED = 'DISMISSED',
  HONORS = 'HONORS',
  DEAN_LIST = 'DEAN_LIST'
}

export interface CreateStudentRequest {
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  studentId: string;
  programId: number;
  academicYear: string;
  semester: number;
  level: number;
  section?: string;
  enrollmentDate: string;
  emergencyContact?: string;
  parentGuardianName?: string;
  parentGuardianPhone?: string;
  parentGuardianEmail?: string;
}

export interface UpdateStudentRequest {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  academicYear?: string;
  semester?: number;
  level?: number;
  section?: string;
  cgpa?: number;
  credits?: number;
  graduationDate?: string;
  enrollmentStatus?: EnrollmentStatus;
  academicStatus?: AcademicStatus;
  emergencyContact?: string;
  parentGuardianName?: string;
  parentGuardianPhone?: string;
  parentGuardianEmail?: string;
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
  sortOrder?: 'asc' | 'desc';
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
  filters: StudentFilters;
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
  totalStudents: number;
  activeStudents: number;
  graduatedStudents: number;
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
