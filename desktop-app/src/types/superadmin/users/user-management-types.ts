// Type aliases
export type InstitutionType = 'university' | 'college' | 'institute' | 'academy' | 'technical';
export type InstitutionCategory = 'public' | 'private';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type BulkAction = 'ACTIVATE' | 'DEACTIVATE';

// Institution Settings Interface
export interface InstitutionSettings {
  timezone?: string;
  currency?: string;
  language?: string;
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

// User Management Types for Frontend
export interface CreateInstitutionRequest {
  name: string;
  type: InstitutionType;
  category: InstitutionCategory;
  settings?: InstitutionSettings;
}

export interface UpdateInstitutionRequest {
  name?: string;
  type?: InstitutionType;
  category?: InstitutionCategory;
  settings?: InstitutionSettings;
}

export interface InstitutionResponse {
  id: string;
  name: string;
  type: string;
  category: string;
  settings?: InstitutionSettings;
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
      type: string;
      category: string;
    };
    timestamp: string;
    triggeredBy: string;
  };

  [UserManagementEvents.INSTITUTION_UPDATED]: {
    institution: {
      id: string;
      name: string;
      type: string;
      category: string;
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

// Form Types
export interface InstitutionFormData {
  name: string;
  type: InstitutionType;
  category: InstitutionCategory;
  timezone: string;
  currency: string;
  language: string;
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
