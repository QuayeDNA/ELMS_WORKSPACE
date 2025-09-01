import { User } from './auth';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: ApiError;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
  errors?: Record<string, string[]>;
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
