/**
 * Advanced User Management Types
 * 
 * Type definitions for Super Admin user management operations including
 * cross-institutional search, analytics, impersonation, and bulk operations
 */

import { Institution } from "../institutions/institution.types";

// Base User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  institutionId: string;
  institution?: Institution;
  profileImage?: string;
  lastLoginAt?: Date;
  emailVerifiedAt?: Date;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  INSTITUTION_ADMIN = 'institution_admin',
  EXAM_COORDINATOR = 'exam_coordinator',
  PROCTOR = 'proctor',
  FACULTY = 'faculty',
  STUDENT = 'student',
  SUPPORT_STAFF = 'support_staff'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  LOCKED = 'locked',
  DELETED = 'deleted'
}

// Search and Filtering
export interface UserSearchFilters {
  query?: string; // Search in name, email
  institutionIds?: string[];
  roles?: UserRole[];
  status?: UserStatus[];
  lastLoginRange?: DateRange;
  createdRange?: DateRange;
  emailVerified?: boolean;
  hasProfileImage?: boolean;
  sortBy?: UserSortField;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRange {
  start: Date;
  end: Date;
}

export enum UserSortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  LAST_LOGIN = 'lastLoginAt',
  EMAIL = 'email',
  FIRST_NAME = 'firstName',
  LAST_NAME = 'lastName',
  INSTITUTION = 'institution'
}

export interface UserSearchResult {
  users: UserWithInstitution[];
  total: number;
  page: number;
  limit: number;
  aggregations: UserAggregations;
}

export interface UserWithInstitution extends Omit<User, 'institution'> {
  institution: {
    id: string;
    name: string;
    code: string;
    type: string;
    status: string;
  };
  lastActivity?: UserActivity;
  loginCount?: number;
  examCount?: number;
}

export interface UserAggregations {
  byInstitution: Record<string, { count: number; name: string }>;
  byRole: Record<UserRole, number>;
  byStatus: Record<UserStatus, number>;
  byEmailVerification: { verified: number; unverified: number };
  totalActiveUsers: number;
  totalInactiveUsers: number;
  newUsersThisMonth: number;
  usersWithRecentActivity: number;
}

// User Analytics
export interface UserAnalytics {
  userId: string;
  activityPatterns: ActivityPattern[];
  performanceMetrics: PerformanceMetrics;
  engagementScores: EngagementScore[];
  retentionMetrics: RetentionMetrics;
  institutionComparison: InstitutionComparison;
}

export interface ActivityPattern {
  date: Date;
  loginCount: number;
  sessionDuration: number; // in minutes
  featuresUsed: string[];
  peakHours: number[]; // hours of day (0-23)
  deviceInfo?: DeviceInfo;
}

export interface DeviceInfo {
  deviceType: 'desktop' | 'tablet' | 'mobile';
  browser: string;
  operatingSystem: string;
  screenResolution?: string;
}

export interface PerformanceMetrics {
  totalLogins: number;
  averageSessionDuration: number;
  totalExamsCreated: number;
  totalExamsTaken: number;
  averageExamScore: number;
  completionRate: number;
  responseTime: number; // average response time in ms
  errorRate: number; // percentage of errors encountered
}

export interface EngagementScore {
  date: Date;
  score: number; // 0-100
  factors: {
    loginFrequency: number;
    featureUsage: number;
    examParticipation: number;
    socialInteraction: number;
  };
}

export interface RetentionMetrics {
  firstLoginDate: Date;
  lastLoginDate: Date;
  totalDaysActive: number;
  streakDays: number;
  churnRisk: 'low' | 'medium' | 'high';
  retentionRate: number; // percentage
  lifecycleStage: 'new' | 'active' | 'at_risk' | 'dormant' | 'churned';
}

export interface InstitutionComparison {
  userInstitution: string;
  ranking: {
    activityRank: number;
    performanceRank: number;
    engagementRank: number;
  };
  benchmarks: {
    averageLoginFrequency: number;
    averageExamScore: number;
    averageEngagement: number;
  };
}

// User Impersonation
export interface ImpersonationSession {
  id: string;
  superAdminId: string;
  superAdminEmail: string;
  targetUserId: string;
  targetUserEmail: string;
  reason: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  status: ImpersonationStatus;
  ipAddress: string;
  userAgent: string;
  actions: ImpersonationAction[];
  auditLog: AuditEntry[];
}

export enum ImpersonationStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  EXPIRED = 'expired',
  TERMINATED = 'terminated'
}

export interface ImpersonationAction {
  id: string;
  action: string;
  endpoint: string;
  method: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export interface StartImpersonationRequest {
  targetUserId: string;
  reason: string;
  duration?: number; // in minutes, default 60
}

export interface ImpersonationToken {
  token: string;
  expiresAt: Date;
  sessionId: string;
}

// Bulk Operations
export interface BulkUserOperation {
  operation: BulkOperationType;
  userIds: string[];
  data?: Record<string, any>;
  reason: string;
  scheduledFor?: Date;
  notifyUsers?: boolean;
}

export enum BulkOperationType {
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  SUSPEND = 'suspend',
  UNLOCK = 'unlock',
  CHANGE_ROLE = 'change_role',
  TRANSFER_INSTITUTION = 'transfer_institution',
  RESET_PASSWORD = 'reset_password',
  SEND_NOTIFICATION = 'send_notification',
  DELETE = 'delete',
  EXPORT_DATA = 'export_data'
}

export interface BulkOperationResult {
  operationId: string;
  operation: BulkOperationType;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'partial';
  totalUsers: number;
  processedUsers: number;
  successCount: number;
  failureCount: number;
  results: BulkOperationItemResult[];
  startTime: Date;
  endTime?: Date;
  errors?: string[];
}

export interface BulkOperationItemResult {
  userId: string;
  userEmail: string;
  status: 'success' | 'failed' | 'skipped';
  message?: string;
  error?: string;
}

// User Activity
export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  institutionId: string;
}

// Account Management
export interface UserAccountAction {
  action: AccountActionType;
  targetUserId: string;
  reason: string;
  data?: Record<string, any>;
}

export enum AccountActionType {
  RESET_PASSWORD = 'reset_password',
  UNLOCK_ACCOUNT = 'unlock_account',
  VERIFY_EMAIL = 'verify_email',
  MERGE_ACCOUNTS = 'merge_accounts',
  EXPORT_DATA = 'export_data',
  ANONYMIZE_DATA = 'anonymize_data'
}

// Request/Response Types
export interface GetUsersRequest {
  page?: number;
  limit?: number;
  filters?: UserSearchFilters;
}

export interface GetUsersResponse {
  success: boolean;
  data: UserSearchResult;
  timestamp: string;
}

export interface GetUserAnalyticsRequest {
  userId: string;
  dateRange?: DateRange;
  includeComparison?: boolean;
}

export interface GetUserAnalyticsResponse {
  success: boolean;
  data: UserAnalytics;
  timestamp: string;
}

export interface BulkOperationRequest {
  operation: BulkUserOperation;
  dryRun?: boolean;
}

export interface BulkOperationResponse {
  success: boolean;
  data: BulkOperationResult;
  timestamp: string;
}

// User Statistics
export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByRole: Record<UserRole, number>;
  usersByInstitution: Record<string, { count: number; institutionName: string }>;
  averageSessionDuration: number;
  totalLoginsSessions: number;
  mostActiveUsers: UserWithInstitution[];
  recentlyCreatedUsers: UserWithInstitution[];
  usersAtRisk: UserWithInstitution[];
}

// Audit and Compliance
export interface AuditEntry {
  id: string;
  action: string;
  performedBy: string;
  performedByEmail: string;
  targetUserId?: string;
  targetUserEmail?: string;
  details: Record<string, any>;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  institutionId?: string;
}

export interface ComplianceReport {
  reportId: string;
  type: 'gdpr' | 'data_retention' | 'access_audit';
  generatedAt: Date;
  dateRange: DateRange;
  findings: ComplianceFinding[];
  recommendations: string[];
}

export interface ComplianceFinding {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  affectedUsers: number;
  remediation: string;
}
