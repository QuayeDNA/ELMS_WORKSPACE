/* eslint-disable @typescript-eslint/no-explicit-any */
// ========================================
// INSTRUCTOR TYPES FOR FRONTEND
// ========================================

export interface Instructor {
  id: number;
  userId: number;
  staffId: string;
  academicRank: AcademicRank | null;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  hireDate?: string;
  specialization?: string;
  researchInterests?: string;
  officeLocation?: string;
  officeHours?: string;
  biography?: string;
  profileImageUrl?: string;
  highestQualification?: string;
  permissions: Record<string, any>;
  canCreateExams: boolean;
  canGradeScripts: boolean;
  canViewResults: boolean;
  canTeachCourses: boolean;
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
    departmentId?: number;
    facultyId?: number;
    institutionId?: number;
    department?: {
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

export enum AcademicRank {
  GRADUATE_ASSISTANT = "GRADUATE_ASSISTANT",
  ASSISTANT_LECTURER = "ASSISTANT_LECTURER",
  LECTURER = "LECTURER",
  SENIOR_LECTURER = "SENIOR_LECTURER",
  PRINCIPAL_LECTURER = "PRINCIPAL_LECTURER",
  ASSOCIATE_PROFESSOR = "ASSOCIATE_PROFESSOR",
  PROFESSOR = "PROFESSOR",
}

export enum EmploymentType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  CONTRACT = "CONTRACT",
  VISITING = "VISITING",
  ADJUNCT = "ADJUNCT",
  EMERITUS = "EMERITUS",
}

export enum EmploymentStatus {
  ACTIVE = "ACTIVE",
  ON_LEAVE = "ON_LEAVE",
  SABBATICAL = "SABBATICAL",
  RETIRED = "RETIRED",
  TERMINATED = "TERMINATED",
  PROBATION = "PROBATION",
}

export interface CreateInstructorRequest {
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
    staffId: string;
    academicRank?: AcademicRank;
    employmentType?: EmploymentType;
    employmentStatus?: EmploymentStatus;
    hireDate?: string;
    highestQualification?: string;
    specialization?: string;
    researchInterests?: string;
    officeLocation?: string;
    officeHours?: string;
    biography?: string;
    profileImageUrl?: string;
    canCreateExams?: boolean;
    canGradeScripts?: boolean;
    canViewResults?: boolean;
    canTeachCourses?: boolean;
  };
  departments?: Array<{
    departmentId: number;
    isPrimary?: boolean;
  }>;
}

export interface UpdateInstructorRequest {
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
    academicRank?: AcademicRank;
    employmentType?: EmploymentType;
    employmentStatus?: EmploymentStatus;
    hireDate?: string;
    highestQualification?: string;
    specialization?: string;
    researchInterests?: string;
    officeLocation?: string;
    officeHours?: string;
    biography?: string;
    profileImageUrl?: string;
    canCreateExams?: boolean;
    canGradeScripts?: boolean;
    canViewResults?: boolean;
    canTeachCourses?: boolean;
  };
}

export interface InstructorFilters {
  departmentId?: number;
  facultyId?: number;
  institutionId?: number;
  academicRank?: AcademicRank;
  employmentType?: EmploymentType;
  employmentStatus?: EmploymentStatus;
  specialization?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface InstructorsResponse {
  success: boolean;
  data: Instructor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: InstructorFilters;
}

export interface DepartmentAssignment {
  departmentId: number;
  isPrimary: boolean;
}

export interface InstructorStats {
  totalInstructors: number;
  activeInstructors: number;
  onLeaveInstructors: number;
  retiredInstructors: number;
  averageExperience: number;
  instructorsByRank: Array<{
    rank: AcademicRank | null;
    count: number;
  }>;
  instructorsByDepartment: Array<{
    departmentId: number;
    departmentName: string;
    count: number;
  }>;
  instructorsByEmploymentType: Array<{
    type: EmploymentType;
    count: number;
  }>;
}

export interface InstructorWorkload {
  instructorId: number;
  coursesAssigned: number;
  studentsEnrolled: number;
  contactHours: number;
  researchProjects: number;
  administrativeRoles: number;
}

export interface BulkInstructorImportRequest {
  instructors: CreateInstructorRequest[];
}

export interface BulkInstructorImportResponse {
  success: boolean;
  data: {
    imported: number;
    failed: number;
    errors: Array<{
      index: number;
      instructor: CreateInstructorRequest;
      error: string;
    }>;
  };
}
