// ========================================
// USER TYPES FOR FRONTEND
// ========================================

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  title?: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
  createdAt: string;
  updatedAt: string;
  institution?: {
    id: number;
    name: string;
    code: string;
  };
  faculty?: {
    id: number;
    name: string;
    code: string;
  };
  department?: {
    id: number;
    name: string;
    code: string;
  };
  _count?: {
    examsCreated: number;
    scriptsGraded: number;
  };
}

// ========================================
// USER ROLES & STATUS
// ========================================

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  FACULTY_ADMIN = 'FACULTY_ADMIN',
  EXAMS_OFFICER = 'EXAMS_OFFICER',
  SCRIPT_HANDLER = 'SCRIPT_HANDLER',
  INVIGILATOR = 'INVIGILATOR',
  LECTURER = 'LECTURER',
  STUDENT = 'STUDENT'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION'
}

// ========================================
// REQUEST/RESPONSE INTERFACES
// ========================================

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
  phone?: string;
  middleName?: string;
  title?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  title?: string;
  role?: UserRole;
  status?: UserStatus;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserQuery {
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ========================================
// FORM DATA INTERFACES
// ========================================

export interface UserFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
  middleName: string;
  title: string;
  role: string;
  status: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  address: string;
  institutionId: string;
  facultyId: string;
  departmentId: string;
}

// ========================================
// UTILITY TYPES
// ========================================

export interface UserTableColumn {
  key: keyof User;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, user: User) => React.ReactNode;
}

export const USER_ROLES = [
  { value: UserRole.SUPER_ADMIN, label: 'Super Admin' },
  { value: UserRole.ADMIN, label: 'Institution Admin' },
  { value: UserRole.FACULTY_ADMIN, label: 'Faculty Admin' },
  { value: UserRole.EXAMS_OFFICER, label: 'Exams Officer' },
  { value: UserRole.SCRIPT_HANDLER, label: 'Script Handler' },
  { value: UserRole.INVIGILATOR, label: 'Invigilator' },
  { value: UserRole.LECTURER, label: 'Lecturer' },
  { value: UserRole.STUDENT, label: 'Student' },
];

export const USER_STATUSES = [
  { value: UserStatus.ACTIVE, label: 'Active' },
  { value: UserStatus.INACTIVE, label: 'Inactive' },
  { value: UserStatus.SUSPENDED, label: 'Suspended' },
  { value: UserStatus.PENDING_VERIFICATION, label: 'Pending Verification' },
];

export const GENDERS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];
