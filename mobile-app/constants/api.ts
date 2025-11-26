/**
 * API Configuration for ELMS Mobile App
 */

import Constants from 'expo-constants';

// API Base URL Configuration
export const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    PROFILE: '/api/auth/profile',
    HEALTH: '/api/auth/health',
  },

  // Exam Logistics endpoints
  EXAM_LOGISTICS: {
    MY_SESSIONS: '/api/exam-logistics/my-assigned-sessions',
    SESSION_DETAILS: (id: number) => `/api/exam-logistics/session-details/${id}`,
    INVIGILATOR_PRESENCE: '/api/exam-logistics/invigilator-presence',
    DASHBOARD: '/api/exam-logistics/invigilator-dashboard',
    SESSION_LOGS: (id: number) => `/api/exam-logistics/session-logs/${id}`,
    REPORT_INCIDENT: '/api/exam-logistics/report-incident',
    INCIDENTS: (id: number) => `/api/exam-logistics/incidents/${id}`,
  },

  // Script Submission endpoints
  SCRIPT_SUBMISSION: {
    SUBMIT: '/api/script-submissions/submit',
    BULK_SUBMIT: '/api/script-submissions/bulk-submit',
    SCAN_STUDENT: '/api/script-submissions/scan-student',
    VERIFY: (id: string) => `/api/script-submissions/${id}/verify`,
    STUDENT_STATUS: (studentId: number, examEntryId: number) =>
      `/api/script-submissions/student/${studentId}/exam/${examEntryId}`,
  },

  // Batch Script endpoints
  BATCH_SCRIPTS: {
    LIST: '/api/batch-scripts',
    DETAILS: (id: number) => `/api/batch-scripts/${id}`,
    FOR_EXAM: (examEntryId: number, courseId: number) =>
      `/api/batch-scripts/entry/${examEntryId}/course/${courseId}`,
    SEAL: (id: number) => `/api/batch-scripts/${id}/seal`,
    UPDATE_COUNTS: (id: number) => `/api/batch-scripts/${id}/update-counts`,
    STATISTICS: (id: number) => `/api/batch-scripts/${id}/statistics`,
  },

  // Incident endpoints
  INCIDENTS: {
    LIST: '/api/incidents',
    DETAILS: (id: number) => `/api/incidents/${id}`,
    CREATE: '/api/incidents',
    UPDATE: (id: number) => `/api/incidents/${id}`,
    RESOLVE: (id: number) => `/api/incidents/${id}/resolve`,
    BY_EXAM: (examId: number) => `/api/incidents/exam/${examId}`,
  },

  // Student Verification endpoints
  STUDENTS: {
    SESSION_STUDENTS: (sessionId: number) => `/api/students/session/${sessionId}`,
    VERIFICATION: '/api/exam-logistics/check-in-student',
  },
};

// HTTP Status Codes
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
};

// Request timeout (in milliseconds)
export const REQUEST_TIMEOUT = 30000;

// Retry configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  RETRY_MULTIPLIER: 2,
};

// API Response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp?: string;
  };
}

// Error types
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class ApiError extends Error {
  public type: ApiErrorType;
  public statusCode?: number;
  public details?: any;

  constructor(params: {
    type: ApiErrorType;
    message: string;
    statusCode?: number;
    details?: any;
  }) {
    super(params.message);
    this.type = params.type;
    this.statusCode = params.statusCode;
    this.details = params.details;
    this.name = 'ApiError';
  }
}
