import { ProgramType as PrismaProgramType, ProgramLevel as PrismaProgramLevel, CourseType as PrismaCourseType } from '@prisma/client';

export { PrismaProgramType as ProgramType };
export { PrismaProgramLevel as ProgramLevel };

export interface Program {
  id: number;
  name: string;
  code: string;
  type: PrismaProgramType;
  level: PrismaProgramLevel;
  durationYears: number;
  creditHours?: number | null;
  description?: string | null;
  admissionRequirements?: string | null;
  isActive: boolean;
  departmentId: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  department?: {
    id: number;
    name: string;
    code: string;
    faculty?: {
      id: number;
      name: string;
      code: string;
      institution?: {
        id: number;
        name: string;
        code: string;
      };
    };
  };

  students?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    studentId?: string;
    indexNumber?: string;
    level?: number;
  }[];

  programCourses?: {
    id: number;
    level: number;
    semester: number;
    isRequired: boolean;
    course: {
      id: number;
      name: string;
      code: string;
      creditHours: number;
      courseType: PrismaCourseType;
      level: number;
    };
  }[];

  // Computed stats
  stats?: {
    totalStudents: number;
    totalCourses: number;
    totalCreditHours: number;
  };
}

export interface ProgramQuery {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: number;
  facultyId?: number;
  institutionId?: number;
  type?: PrismaProgramType;
  level?: PrismaProgramLevel;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProgramCreateData {
  name: string;
  code: string;
  departmentId: number;
  type: PrismaProgramType;
  level: PrismaProgramLevel;
  durationYears: number;
  creditHours?: number | null;
  description?: string | null;
  admissionRequirements?: string | null;
  isActive?: boolean;
}

export interface ProgramUpdateData {
  name?: string;
  code?: string;
  type?: PrismaProgramType;
  level?: PrismaProgramLevel;
  durationYears?: number;
  creditHours?: number | null;
  description?: string | null;
  admissionRequirements?: string | null;
  isActive?: boolean;
}

export interface ProgramResponse {
  success: boolean;
  data?: {
    programs: Program[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  error?: string;
}
