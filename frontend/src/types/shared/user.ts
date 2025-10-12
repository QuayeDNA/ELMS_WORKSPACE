// ========================================
// CENTRALIZED USER TYPES
// ========================================

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  FACULTY_ADMIN = "FACULTY_ADMIN",
  DEAN = "DEAN",
  HOD = "HOD",
  EXAMS_OFFICER = "EXAMS_OFFICER",
  SCRIPT_HANDLER = "SCRIPT_HANDLER",
  INVIGILATOR = "INVIGILATOR",
  LECTURER = "LECTURER",
  STUDENT = "STUDENT",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  title?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
  lastLogin?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// USER QUERY AND RESPONSE TYPES
// ========================================

export interface UserQuery {
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "firstName" | "lastName" | "email" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ========================================
// USER REQUEST TYPES
// ========================================

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  title?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  role: UserRole;
  phone?: string;
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  title?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  role?: UserRole;
  status?: UserStatus;
  phone?: string;
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
}

export interface UserFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  title?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  role: UserRole;
  status?: string;
  phone?: string;
  institutionId?: string;
  facultyId?: string;
  departmentId?: string;
  isActive?: boolean;
}

// ========================================
// USER CONSTANTS
// ========================================

export const USER_ROLES = [
  { value: UserRole.SUPER_ADMIN, label: "Super Admin" },
  { value: UserRole.ADMIN, label: "Admin" },
  { value: UserRole.FACULTY_ADMIN, label: "Faculty Admin" },
  { value: UserRole.DEAN, label: "Dean" },
  { value: UserRole.HOD, label: "Head of Department" },
  { value: UserRole.EXAMS_OFFICER, label: "Exams Officer" },
  { value: UserRole.SCRIPT_HANDLER, label: "Script Handler" },
  { value: UserRole.INVIGILATOR, label: "Invigilator" },
  { value: UserRole.LECTURER, label: "Lecturer" },
  { value: UserRole.STUDENT, label: "Student" },
];

export const USER_STATUSES = [
  { value: UserStatus.ACTIVE, label: "Active" },
  { value: UserStatus.INACTIVE, label: "Inactive" },
  { value: UserStatus.SUSPENDED, label: "Suspended" },
  { value: UserStatus.PENDING_VERIFICATION, label: "Pending Verification" },
];
