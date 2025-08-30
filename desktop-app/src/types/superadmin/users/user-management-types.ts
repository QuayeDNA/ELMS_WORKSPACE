// Type aliases - Updated to match backend enums
export type InstitutionType = 'UNIVERSITY' | 'COLLEGE' | 'POLYTECHNIC' | 'INSTITUTE';
export type InstitutionCategory = 'PUBLIC' | 'PRIVATE' | 'MISSION';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type BulkAction = 'ACTIVATE' | 'DEACTIVATE';

// Address Interface - Updated to match actual API response
export interface Address {
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
}

// Contact Info Interface
export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  emergencyContact?: string;
}

// Academic Calendar Interface - Updated to match actual API response
export interface AcademicCalendar {
  semesters?: number;
  examPeriods?: string[];
  academicYearStart?: string;
  academicYearEnd?: string;
  holidays?: string[];
}

// Institution Settings Interface - Updated for comprehensive config
export interface InstitutionSettings {
  timezone?: string;
  language?: string;
  currencies?: string[];
  academicCalendar?: AcademicCalendar;
  customFields?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

// User Statistics Interface
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  pendingUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  userGrowthRate: number;
  averageSessionDuration: number;
  topInstitutionByUsers: {
    name: string;
    userCount: number;
  };
  usersByRole: {
    admin: number;
    examiner: number;
    student: number;
    invigilator: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'login' | 'logout' | 'created' | 'updated' | 'deactivated';
    userEmail: string;
    timestamp: string;
    details?: string;
  }>;
}

// User Management Types for Frontend - Updated to match backend
export interface CreateInstitutionRequest {
  name: string;
  type: InstitutionType;
  category: InstitutionCategory;
  code?: string;
  address?: Address;
  contactInfo?: ContactInfo;
  logo?: string;
  motto?: string;
  description?: string;
  establishedYear?: number;
  charter?: string;
  accreditation?: string;
  affiliations?: string[];
  timezone?: string;
  language?: string;
  currencies?: string[];
  academicCalendar?: AcademicCalendar;
  customFields?: Record<string, unknown>;
  config?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  isActive?: boolean;
}

export interface UpdateInstitutionRequest {
  name?: string;
  type?: InstitutionType;
  category?: InstitutionCategory;
  code?: string;
  address?: Address;
  contactInfo?: ContactInfo;
  logo?: string;
  motto?: string;
  description?: string;
  establishedYear?: number;
  charter?: string;
  accreditation?: string;
  affiliations?: string[];
  timezone?: string;
  language?: string;
  currencies?: string[];
  academicCalendar?: AcademicCalendar;
  customFields?: Record<string, unknown>;
  config?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  isActive?: boolean;
}

export interface InstitutionResponse {
  id: string;
  name: string;
  type: InstitutionType;
  category: InstitutionCategory;
  code?: string;
  address?: Address;
  contactInfo?: ContactInfo;
  logo?: string;
  motto?: string;
  description?: string;
  establishedYear?: number;
  charter?: string;
  accreditation?: string;
  affiliations?: string[];
  timezone?: string;
  language?: string;
  currencies?: string[];
  academicCalendar?: AcademicCalendar;
  customFields?: Record<string, unknown> | null;
  config?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetUsersRequest {
  institutionId?: string;
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  department?: string;
  search?: string;
}

export interface UserSummary {
  id: string;
  email: string;
  role: string;
  status: UserStatus;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    department?: string;
  };
  lastActivityAt?: string;
}

export interface GetUsersResponse {
  users: UserSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateUserStatusRequest {
  userId: string;
  status: UserStatus;
}

export interface BulkUpdateUsersRequest {
  userIds: string[];
  action: BulkAction;
}

// Socket Event Types
export enum UserManagementEvents {
  INSTITUTION_CREATED = 'institution:created',
  INSTITUTION_UPDATED = 'institution:updated',
  INSTITUTION_DELETED = 'institution:deleted',
  USER_STATUS_UPDATED = 'user:status:updated',
  USERS_BULK_UPDATED = 'users:bulk:updated',
  USER_ACTIVITY_UPDATED = 'user:activity:updated',
  USER_MANAGEMENT_ERROR = 'user-management:error',
  USER_MANAGEMENT_NOTIFICATION = 'user-management:notification'
}

export interface SocketEventData {
  [UserManagementEvents.INSTITUTION_CREATED]: {
    institution: {
      id: string;
      name: string;
      type: InstitutionType;
      category: InstitutionCategory;
      code?: string;
    };
    timestamp: string;
    triggeredBy: string;
  };

  [UserManagementEvents.INSTITUTION_UPDATED]: {
    institution: {
      id: string;
      name: string;
      type: InstitutionType;
      category: InstitutionCategory;
      code?: string;
    };
    changes: Record<string, unknown>;
    timestamp: string;
    triggeredBy: string;
  };

  [UserManagementEvents.INSTITUTION_DELETED]: {
    institutionId: string;
    institutionName: string;
    timestamp: string;
    triggeredBy: string;
  };

  [UserManagementEvents.USER_STATUS_UPDATED]: {
    userId: string;
    email: string;
    oldStatus: string;
    newStatus: string;
    timestamp: string;
    triggeredBy: string;
  };

  [UserManagementEvents.USERS_BULK_UPDATED]: {
    userIds: string[];
    action: BulkAction;
    count: number;
    timestamp: string;
    triggeredBy: string;
  };

  [UserManagementEvents.USER_ACTIVITY_UPDATED]: {
    userId: string;
    email: string;
    lastActivityAt: string;
    timestamp: string;
  };

  [UserManagementEvents.USER_MANAGEMENT_ERROR]: {
    message: string;
    code: string;
    timestamp: string;
  };

  [UserManagementEvents.USER_MANAGEMENT_NOTIFICATION]: {
    type: 'success' | 'info' | 'warning';
    title: string;
    message: string;
    timestamp: string;
  };
}

// Form Types - Updated to match comprehensive institution data
export interface InstitutionFormData {
  name: string;
  type: InstitutionType;
  category: InstitutionCategory;
  code?: string;
  address?: Address;
  contactInfo?: ContactInfo;
  logo?: string;
  motto?: string;
  description?: string;
  establishedYear?: number;
  charter?: string;
  accreditation?: string;
  affiliations?: string[];
  timezone?: string;
  language?: string;
  currencies?: string[];
  academicCalendar?: AcademicCalendar;
  customFields?: Record<string, unknown>;
  config?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  isActive?: boolean;
  currency?: string;
}

export interface UserFilterData {
  role?: string;
  status?: string;
  department?: string;
  search?: string;
}

// UI State Types
export interface UserManagementState {
  institutions: InstitutionResponse[];
  selectedInstitution: InstitutionResponse | null;
  users: UserSummary[];
  loading: {
    institutions: boolean;
    users: boolean;
    createInstitution: boolean;
    updateInstitution: boolean;
    updateUserStatus: boolean;
    bulkUpdate: boolean;
  };
  error: {
    institutions?: string;
    users?: string;
    createInstitution?: string;
    updateInstitution?: string;
    updateUserStatus?: string;
    bulkUpdate?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: UserFilterData;
  selectedUsers: string[];
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
