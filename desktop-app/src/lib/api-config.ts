/**
 * Centralized API Configuration
 * Provides all API endpoints and configurations for the frontend
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
    PROFILE: '/auth/profile',
  },

  // SuperAdmin
  SUPERADMIN: {
    // Dashboard
    DASHBOARD: {
      OVERVIEW: '/superadmin/dashboard/overview',
      STATS: '/superadmin/dashboard/stats',
      METRICS: '/superadmin/dashboard/metrics',
    },

    // User Management
    USERS: {
      INSTITUTIONS: '/superadmin/users/institutions',
      INSTITUTION_BY_ID: (id: string) => `/superadmin/users/institutions/${id}`,
      USERS_BY_INSTITUTION: (institutionId: string) => `/superadmin/users/institutions/${institutionId}/users`,
      USER_STATUS: '/superadmin/users/status',
      USER_BULK: '/superadmin/users/bulk',
    },

    // Analytics
    ANALYTICS: {
      OVERVIEW: '/superadmin/analytics/overview',
      USERS: '/superadmin/analytics/users',
      INSTITUTIONS: '/superadmin/analytics/institutions',
      SYSTEM: '/superadmin/analytics/system',
    },

    // Audit Logs
    AUDIT: {
      LOGS: '/superadmin/audit/logs',
      EXPORT: '/superadmin/audit/export',
    },

    // Configuration
    CONFIG: {
      SYSTEM: '/superadmin/config/system',
      FEATURES: '/superadmin/config/features',
      SETTINGS: '/superadmin/config/settings',
    },

    // Health Monitoring
    HEALTH: {
      SYSTEM: '/superadmin/health/system',
      DATABASE: '/superadmin/health/database',
      CACHE: '/superadmin/health/cache',
    },
  },

  // Regular User APIs
  USER: {
    PROFILE: '/users/profile',
    SETTINGS: '/users/settings',
    PREFERENCES: '/users/preferences',
  },

  // Exam Management
  EXAMS: {
    LIST: '/exams',
    CREATE: '/exams',
    BY_ID: (id: string) => `/exams/${id}`,
    UPDATE: (id: string) => `/exams/${id}`,
    DELETE: (id: string) => `/exams/${id}`,
    SUBMIT: (id: string) => `/exams/${id}/submit`,
  },

  // File Management
  FILES: {
    UPLOAD: '/files/upload',
    DOWNLOAD: (id: string) => `/files/download/${id}`,
    DELETE: (id: string) => `/files/delete/${id}`,
    LIST: '/files',
  },

  // Incident Management
  INCIDENTS: {
    LIST: '/incidents',
    CREATE: '/incidents',
    BY_ID: (id: string) => `/incidents/${id}`,
    UPDATE: (id: string) => `/incidents/${id}`,
    RESOLVE: (id: string) => `/incidents/${id}/resolve`,
  },

  // Scripts
  SCRIPTS: {
    LIST: '/scripts',
    EXECUTE: '/scripts/execute',
    LOGS: '/scripts/logs',
  },
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * API Error Types
 */
export const API_ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * Request/Response Types
 */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, unknown>;
}

/**
 * Request Configuration
 */
export interface RequestConfig extends RequestInit {
  timeout?: number;
  retry?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Socket.IO Events
 */
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  // User Management
  INSTITUTION_CREATED: 'institution:created',
  INSTITUTION_UPDATED: 'institution:updated',
  INSTITUTION_DELETED: 'institution:deleted',
  USER_STATUS_UPDATED: 'user:status:updated',
  USERS_BULK_UPDATED: 'users:bulk:updated',
  USER_ACTIVITY_UPDATED: 'user:activity:updated',
  USER_MANAGEMENT_ERROR: 'user-management:error',
  USER_MANAGEMENT_NOTIFICATION: 'user-management:notification',

  // System
  SYSTEM_NOTIFICATION: 'system:notification',
  DASHBOARD_UPDATE: 'dashboard:update',
} as const;

/**
 * Socket Rooms
 */
export const SOCKET_ROOMS = {
  SUPERADMIN_DASHBOARD: 'superadmin:dashboard',
  INSTITUTION_ROOM: (institutionId: string) => `institution:${institutionId}`,
  SYSTEM_NOTIFICATIONS: 'system:notifications',
} as const;
