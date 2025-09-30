// ========================================
// STUDENT TYPES FOR FRONTEND
// ========================================

export interface Student {
  id: number;
  userId: number;
  studentId: string;
  indexNumber?: string;
  level: number;
  semester: number;
  section?: string;
  credits?: number;
  cgpa?: number;
  academicYear?: string;
  programId?: number;
  admissionDate?: string;
  enrollmentDate?: string;
  expectedGraduation?: string;
  graduationDate?: string;
  enrollmentStatus: EnrollmentStatus;
  academicStatus: AcademicStatus;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  emergencyContact?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
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
    nationality?: string;
    address?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };

  program?: {
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
  user: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    title?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    address?: string;
  };
  profile: {
    studentId: string;
    indexNumber?: string;
    level: number;
    semester: number;
    academicYear: string;
    programId: number;
    admissionDate?: string;
    expectedGraduation?: string;
    guardianName?: string;
    guardianPhone?: string;
    guardianEmail?: string;
    emergencyContact?: string;
  };
}

export interface UpdateStudentRequest {
  user?: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    title?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    address?: string;
  };
  profile?: {
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
  };
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
