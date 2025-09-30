// ========================================
// CENTRALIZED FACULTY TYPES
// ========================================

import { User } from "./user";
import { Institution } from "./institution";

export interface Faculty {
  id: number;
  name: string;
  code: string;
  description?: string;
  establishedYear?: number;
  institutionId: number;
  deanId?: number;
  createdAt: string;
  updatedAt: string;
  institution?: Institution;
  dean?: User;
  departments?: Array<{
    id: number;
    name: string;
    code: string;
    hod?: User;
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
    exams?: number;
  };
}

// ========================================
// FACULTY QUERY AND RESPONSE TYPES
// ========================================

export interface FacultyQuery {
  institutionId?: number;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "code" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface FacultyListResponse {
  faculties: Faculty[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ========================================
// FACULTY REQUEST TYPES
// ========================================

export interface CreateFacultyRequest {
  name: string;
  code: string;
  institutionId: number;
  description?: string;
}

export interface UpdateFacultyRequest {
  name?: string;
  code?: string;
  description?: string;
}

export interface FacultyFormData {
  name: string;
  code: string;
  institutionId: number;
  description?: string;
}

// ========================================
// FACULTY ANALYTICS TYPES
// ========================================

export interface FacultyAnalytics {
  totalFaculties: number;
  totalDepartments: number;
  totalFacultyMembers: number;
  averageMembersPerFaculty: number;
  facultiesWithDeans: number;
  facultiesWithoutDeans: number;
  departmentDistribution: {
    minDepartments: number;
    maxDepartments: number;
    averageDepartments: number;
  };
  memberDistribution: {
    minMembers: number;
    maxMembers: number;
    averageMembers: number;
  };
  facultyStatusBreakdown: {
    active: number;
    inactive: number;
  };
}

// ========================================
// COMPONENT PROPS INTERFACES
// ========================================

export interface FacultyCreateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export interface FacultyEditProps {
  faculty: Faculty;
  onSuccess: () => void;
  onCancel: () => void;
}

export interface FacultyFormProps {
  mode: "create" | "edit";
  faculty?: Faculty; // Only required for edit mode
  onSuccess: () => void;
  onCancel: () => void;
}

export interface FacultyViewProps {
  faculty: Faculty;
  onClose: () => void;
}
