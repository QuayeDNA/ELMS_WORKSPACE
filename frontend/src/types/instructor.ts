/* eslint-disable @typescript-eslint/no-explicit-any */
// ========================================
// INSTRUCTOR TYPES FOR FRONTEND
// ========================================

export interface Instructor {
  id: number;
  userId: number;
  employeeId: string;
  academicRank: AcademicRank;
  specialization?: string;
  qualifications?: string;
  experience: number;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  joiningDate: string;
  contractEndDate?: string;
  salary?: number;
  officeLocation?: string;
  phoneExtension?: string;
  consultationHours?: string;
  researchInterests?: string;
  publications?: string;
  permissions?: Record<string, any>;
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
  
  assignments?: Array<{
    id: number;
    departmentId: number;
    isPrimary: boolean;
    assignedAt: string;
    department: {
      id: number;
      name: string;
      code: string;
    };
  }>;
}

export enum AcademicRank {
  PROFESSOR = 'PROFESSOR',
  ASSOCIATE_PROFESSOR = 'ASSOCIATE_PROFESSOR',
  ASSISTANT_PROFESSOR = 'ASSISTANT_PROFESSOR',
  SENIOR_LECTURER = 'SENIOR_LECTURER',
  LECTURER = 'LECTURER',
  ASSISTANT_LECTURER = 'ASSISTANT_LECTURER',
  TEACHING_ASSISTANT = 'TEACHING_ASSISTANT',
  ADJUNCT_FACULTY = 'ADJUNCT_FACULTY',
  VISITING_FACULTY = 'VISITING_FACULTY',
  EMERITUS = 'EMERITUS'
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  VISITING = 'VISITING',
  ADJUNCT = 'ADJUNCT',
  EMERITUS = 'EMERITUS'
}

export enum EmploymentStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SABBATICAL = 'SABBATICAL',
  RETIRED = 'RETIRED',
  TERMINATED = 'TERMINATED',
  PROBATION = 'PROBATION'
}

export interface CreateInstructorRequest {
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
  departmentId?: number;
  employeeId: string;
  academicRank: AcademicRank;
  specialization?: string;
  qualifications?: string;
  experience: number;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  joiningDate: string;
  contractEndDate?: string;
  salary?: number;
  officeLocation?: string;
  phoneExtension?: string;
  consultationHours?: string;
  researchInterests?: string;
  publications?: string;
  permissions?: Record<string, any>;
}

export interface UpdateInstructorRequest {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  title?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  academicRank?: AcademicRank;
  specialization?: string;
  qualifications?: string;
  experience?: number;
  employmentType?: EmploymentType;
  employmentStatus?: EmploymentStatus;
  contractEndDate?: string;
  salary?: number;
  officeLocation?: string;
  phoneExtension?: string;
  consultationHours?: string;
  researchInterests?: string;
  publications?: string;
  permissions?: Record<string, any>;
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
  sortOrder?: 'asc' | 'desc';
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
    rank: AcademicRank;
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
