// ========================================
// CENTRALIZED DEPARTMENT TYPES
// ========================================

import { User } from "./user";
import { Faculty } from "./faculty";

export interface Department {
  id: number;
  name: string;
  code: string;
  type: DepartmentType;
  description?: string;
  officeLocation?: string;
  contactInfo?: string; // JSON string
  facultyId: number;
  hodId?: number;
  createdAt: string;
  updatedAt: string;

  // Relations
  faculty?: Faculty;
  hod?: User;

  // Count fields (from Prisma _count)
  _count?: {
    users: number;
    courses: number;
    programs: number;
  };

  // Computed stats
  stats?: {
    totalUsers: number;
    totalCourses: number;
    totalLecturers: number;
    activePrograms: number;
  };
}

// ========================================
// DEPARTMENT ENUMS
// ========================================

export enum DepartmentType {
  DEPARTMENT = "department",
  SCHOOL = "school",
  INSTITUTE = "institute",
}

// ========================================
// DEPARTMENT QUERY AND RESPONSE TYPES
// ========================================

export interface DepartmentQuery {
  facultyId?: number;
  institutionId?: number;
  isActive?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "code" | "createdAt" | "type";
  sortOrder?: "asc" | "desc";
}

export interface DepartmentListResponse {
  departments: Department[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ========================================
// DEPARTMENT REQUEST TYPES
// ========================================

export interface CreateDepartmentRequest {
  name: string;
  code: string;
  type: DepartmentType;
  description?: string;
  officeLocation?: string;
  contactInfo?: string;
  facultyId: number;
  hodId?: number;
}

export interface UpdateDepartmentRequest {
  name?: string;
  code?: string;
  type?: DepartmentType;
  description?: string;
  officeLocation?: string;
  contactInfo?: string;
  hodId?: number;
}

export interface DepartmentFormData {
  name: string;
  code: string;
  type: DepartmentType;
  description?: string;
  officeLocation?: string;
  contactInfo?: string;
  facultyId: number;
  hodId?: number;
}

// ========================================
// DEPARTMENT ANALYTICS TYPES
// ========================================

export interface DepartmentAnalytics {
  totalDepartments: number;
  departmentsByType: {
    department: number;
    school: number;
    institute: number;
  };
  departmentsWithHODs: number;
  departmentsWithoutHODs: number;
  totalDepartmentMembers: number;
  averageMembersPerDepartment: number;
  totalCourses: number;
  totalPrograms: number;
  departmentDistribution: {
    minMembers: number;
    maxMembers: number;
    averageMembers: number;
  };
}

// ========================================
// COMPONENT PROPS INTERFACES
// ========================================

export interface DepartmentFormProps {
  mode: "create" | "edit";
  department?: Department; // Only required for edit mode
  onSuccess: () => void;
  onCancel: () => void;
}

export interface DepartmentViewProps {
  department: Department;
  onClose: () => void;
}
