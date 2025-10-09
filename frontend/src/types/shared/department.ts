// ========================================
// CENTRALIZED DEPARTMENT TYPES
// ========================================

import { User } from "./user";
import { Faculty } from "./faculty";
import { Program } from "./program";
import { Student } from "../student";

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

// ========================================
// DEPARTMENT DETAILS TYPES
// ========================================

export interface DepartmentDetails extends Department {
  // Programs offered by this department
  programs: Program[];

  // Courses offered by this department
  courses: {
    id: number;
    name: string;
    code: string;
    level: number;
    courseType: string;
    creditHours: number;
    isActive: boolean;
    programCourses?: {
      program: {
        id: number;
        name: string;
        code: string;
      };
      level: number;
      semester: number;
      isRequired: boolean;
    }[];
  }[];

  // Instructors in this department
  instructors: {
    id: number;
    staffId: string;
    academicRank: string | null;
    specialization?: string;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
    coursesCount?: number;
  }[];

  // Students in programs offered by this department (aggregated)
  students: {
    id: number;
    studentId: string;
    indexNumber?: string;
    level: number;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
    program: {
      id: number;
      name: string;
      code: string;
    };
    enrollmentStatus: string;
  }[];
}

// Response types for department details API calls
export interface DepartmentProgramsResponse {
  programs: Program[];
  total: number;
}

export interface DepartmentCoursesResponse {
  courses: DepartmentDetails["courses"];
  total: number;
}

export interface DepartmentInstructorsResponse {
  instructors: DepartmentDetails["instructors"];
  total: number;
}

export interface DepartmentStudentsResponse {
  students: Student[];
  total: number;
}
