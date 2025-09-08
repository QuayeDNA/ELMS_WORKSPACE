// Enums for better type safety
export type EnrollmentStatus = 'ACTIVE' | 'DEFERRED' | 'GRADUATED' | 'WITHDRAWN' | 'SUSPENDED';
export type AcademicStatus = 'GOOD_STANDING' | 'PROBATION' | 'SUSPENDED';

export interface CreateStudentData {
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
  profile: {
    studentId: string;
    indexNumber?: string;
    level: number;
    semester?: number;
    academicYear?: string;
    programId?: number;
    admissionDate?: Date;
    expectedGraduation?: Date;
    guardianName?: string;
    guardianPhone?: string;
    guardianEmail?: string;
    emergencyContact?: string;
  };
}

export interface UpdateStudentData {
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
  profile?: {
    indexNumber?: string;
    level?: number;
    semester?: number;
    academicYear?: string;
    programId?: number;
    admissionDate?: Date;
    expectedGraduation?: Date;
    enrollmentStatus?: EnrollmentStatus;
    academicStatus?: AcademicStatus;
    guardianName?: string;
    guardianPhone?: string;
    guardianEmail?: string;
    emergencyContact?: string;
  };
}

export interface StudentQueryParams {
  programId?: number;
  departmentId?: number;
  facultyId?: number;
  institutionId?: number;
  level?: number;
  semester?: number;
  academicYear?: string;
  enrollmentStatus?: EnrollmentStatus;
  academicStatus?: AcademicStatus;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StudentStatsParams {
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
}

// Student profile response type
export interface StudentProfileResponse {
  id: number;
  userId: number;
  studentId: string;
  indexNumber?: string;
  level: number;
  semester: number;
  academicYear?: string;
  programId?: number;
  admissionDate?: Date;
  expectedGraduation?: Date;
  enrollmentStatus: EnrollmentStatus;
  academicStatus: AcademicStatus;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  emergencyContact?: string;
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
  program?: {
    id: number;
    name: string;
    code: string;
    level: string;
    type: string;
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
