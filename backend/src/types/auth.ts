// ========================================
// USER ROLES & PERMISSIONS
// ========================================

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',      // System-wide control, manages all institutions
  ADMIN = 'ADMIN',                  // Institution-level admin, manages faculty admins
  FACULTY_ADMIN = 'FACULTY_ADMIN',  // Faculty-level admin, manages departments, exams, officers
  EXAMS_OFFICER = 'EXAMS_OFFICER',  // Handles exam logistics, incidents, scheduling
  SCRIPT_HANDLER = 'SCRIPT_HANDLER', // Manages script transit and handling
  INVIGILATOR = 'INVIGILATOR',      // Conducts exams, reports incidents
  LECTURER = 'LECTURER',            // Creates exams, grades scripts
  STUDENT = 'STUDENT'               // Takes exams
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION'
}

// ========================================
// ROLE-BASED PERMISSIONS
// ========================================

export interface RolePermissions {
  // User Management
  canManageUsers: boolean;
  canViewUsers: boolean;
  canCreateUsers: boolean;
  canUpdateUsers: boolean;
  canDeleteUsers: boolean;

  // Institution Management
  canManageInstitutions: boolean;
  canManageFaculties: boolean;
  canManageDepartments: boolean;

  // Exam Management
  canCreateExams: boolean;
  canScheduleExams: boolean;
  canManageExams: boolean;
  canViewExams: boolean;
  canConductExams: boolean;

  // Script Management
  canGenerateScripts: boolean;
  canTrackScripts: boolean;
  canHandleScripts: boolean;
  canScanQrCodes: boolean;
  canGradeScripts: boolean;

  // Incident Management
  canReportIncidents: boolean;
  canManageIncidents: boolean;
  canInvestigateIncidents: boolean;
  canResolveIncidents: boolean;

  // Venue Management
  canManageVenues: boolean;
  canViewVenues: boolean;

  // Analytics & Reporting
  canViewAnalytics: boolean;
  canExportData: boolean;
  canViewAuditLogs: boolean;

  // Administrative
  canManageSettings: boolean;
  canViewSystemLogs: boolean;
}

// ========================================
// ROLE HIERARCHY & SCOPE
// ========================================

export interface RoleHierarchy {
  role: UserRole;
  permissions: RolePermissions;
  scope: 'SYSTEM' | 'INSTITUTION' | 'FACULTY' | 'DEPARTMENT' | 'COURSE';
  description: string;
  managedRoles: UserRole[]; // Roles this role can manage
}

// ========================================
// AUTHENTICATION INTERFACES
// ========================================

export interface LoginRequest {
  email: string;
  password: string;
  institutionId?: number;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
  studentId?: string; // For students
  staffId?: string; // For lecturers and staff
  inviteToken?: string; // For invited users
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
  permissions: RolePermissions;
  lastLogin?: Date;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  id: number; // User ID for backward compatibility (same as userId)
  userId: number;
  email: string;
  role: UserRole;
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
  permissions: RolePermissions;
  iat?: number;
  exp?: number;
}

// ========================================
// ACCESS CONTROL INTERFACES
// ========================================

export interface AccessContext {
  user: User;
  resource: string;
  action: string;
  resourceId?: string | number;
  scope?: {
    institutionId?: number;
    facultyId?: number;
    departmentId?: number;
    courseId?: number;
  };
}

export interface PermissionCheck {
  granted: boolean;
  reason?: string;
  requiredRole?: UserRole;
  requiredPermission?: keyof RolePermissions;
}

// ========================================
// SESSION MANAGEMENT
// ========================================

export interface UserSession {
  id: string;
  userId: number;
  token: string;
  refreshToken: string;
  deviceInfo: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
}

// ========================================
// AUDIT & LOGGING
// ========================================

export interface AuditLogEntry {
  id: number;
  userId: number;
  action: string;
  entity: string;
  entityId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
