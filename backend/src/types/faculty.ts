// ========================================
// FACULTY TYPES FOR BACKEND
// ========================================

import { InstitutionalQuery } from './shared/query';

export interface Faculty {
  id: number;
  name: string;
  code: string;
  description?: string;
  establishedYear?: number;
  institutionId: number;
  deanId?: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  institution?: {
    id: number;
    name: string;
    code: string;
    type: string;
    status: string;
  };
  dean?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    title?: string;
  };
  departments?: Array<{
    id: number;
    name: string;
    code: string;
    hod?: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
    _count?: {
      users: number;
      courses: number;
    };
  }>;
  users?: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
  }>;
  _count?: {
    users: number;
    departments: number;
  };
}

export interface CreateFacultyRequest {
  name: string;
  code: string;
  institutionId: number;
  description?: string;
  establishedYear?: number;
  deanId?: number;
}

export interface UpdateFacultyRequest {
  name?: string;
  code?: string;
  description?: string;
  establishedYear?: number;
  deanId?: number;
}

export interface FacultyQuery extends InstitutionalQuery {
  sortBy?: 'name' | 'code' | 'createdAt';
}

export interface FacultyStats {
  totalFaculties: number;
  facultiesByInstitution: Array<{
    institutionId: number;
    institutionName: string;
    count: number;
  }>;
  averageDepartmentsPerFaculty: number;
  facultiesWithDeans: number;
  facultiesWithoutDeans: number;
}
