import { User } from './auth';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  totalPages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
  errors?: Record<string, string[]>;
}

// Base query interface
export interface BaseQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Status-based filtering
export interface StatusQuery extends BaseQuery {
  status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
}

// Entity-specific query interfaces
export interface UserQuery extends StatusQuery {
  role?: string;
  institutionId?: number;
}

export interface InstitutionQuery extends StatusQuery {
  type?: string;
}

export interface FacultyQuery extends StatusQuery {
  institutionId?: number;
}

export interface DepartmentQuery extends StatusQuery {
  facultyId?: number;
  institutionId?: number;
}

export interface CourseQuery extends StatusQuery {
  departmentId?: number;
  facultyId?: number;
  institutionId?: number;
  level?: string;
}

export interface ProgramQuery extends StatusQuery {
  departmentId?: number;
  facultyId?: number;
  institutionId?: number;
  degree?: string;
}

export interface StudentQuery extends StatusQuery {
  programId?: number;
  departmentId?: number;
  facultyId?: number;
  institutionId?: number;
  academicStatus?: string;
}

export interface InstructorQuery extends StatusQuery {
  departmentId?: number;
  facultyId?: number;
  institutionId?: number;
  specialization?: string;
}

export interface Institution {
  id: number;
  name: string;
  code: string;
  type: string;
  establishedYear?: number;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Faculty {
  id: number;
  name: string;
  code: string;
  description?: string;
  establishedYear?: number;
  institutionId: number;
  institution?: Institution;
  deanId?: number;
  dean?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  type: string;
  description?: string;
  officeLocation?: string;
  facultyId: number;
  faculty?: Faculty;
  hodId?: number;
  hod?: User;
  createdAt: string;
  updatedAt: string;
}
