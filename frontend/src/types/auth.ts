export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  FACULTY_ADMIN = 'FACULTY_ADMIN',
  DEAN = 'DEAN',
  HOD = 'HOD',
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

// RoleProfile represents a user's role and associated permissions/metadata
export interface RoleProfile {
  id: number;
  userId: number;
  role: UserRole;
  permissions: Record<string, unknown>;
  metadata: Record<string, unknown>;
  isActive: boolean;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  title?: string;
  role: UserRole; // Primary role for backward compatibility
  status: UserStatus;
  phone?: string;
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
  lastLogin?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  roleProfiles?: RoleProfile[]; // New: Multiple role profiles
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  title?: string;
  role: UserRole;
  phone?: string;
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
  studentId?: string;
  staffId?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Helper types for role profile metadata
export interface StudentMetadata {
  studentId: string;
  indexNumber: string;
  programId: number;
  level: number;
  semester: number;
  admissionDate: string;
  enrollmentStatus: string;
  academicStatus: string;
}

export interface InstructorMetadata {
  staffId: string;
  employeeType: string;
  departmentId: number;
  specialization?: string;
  officeLocation?: string;
  officeHours?: string;
}

export type RoleMetadata = StudentMetadata | InstructorMetadata | Record<string, unknown>;
