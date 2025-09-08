/**
 * ELMS Frontend Constants
 * Integrated with mobile app constants and backend endpoints
 */

// Import colors from mobile app constants
export const COLORS = {
  primary: '#0a7ea4',
  primaryDark: '#065d7f',
  primaryLight: '#3da0c7',
  secondary: '#f97316',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  light: {
    text: '#11181C',
    background: '#fff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    muted: '#64748b',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    surface: '#1e293b',
    border: '#334155',
    muted: '#94a3b8',
  },
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
} as const;

// Student Module Constants
export const STUDENT_CONSTANTS = {
  ENROLLMENT_STATUS: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    SUSPENDED: 'SUSPENDED',
    GRADUATED: 'GRADUATED',
    WITHDRAWN: 'WITHDRAWN',
    DEFERRED: 'DEFERRED',
  },
  ACADEMIC_STATUS: {
    GOOD_STANDING: 'GOOD_STANDING',
    PROBATION: 'PROBATION',
    DISMISSED: 'DISMISSED',
    HONORS: 'HONORS',
    DEAN_LIST: 'DEAN_LIST',
  },
  GENDER: {
    MALE: 'MALE',
    FEMALE: 'FEMALE',
    OTHER: 'OTHER',
    PREFER_NOT_TO_SAY: 'PREFER_NOT_TO_SAY',
  },
  LEVELS: [
    { value: '100', label: 'Level 100' },
    { value: '200', label: 'Level 200' },
    { value: '300', label: 'Level 300' },
    { value: '400', label: 'Level 400' },
    { value: '500', label: 'Level 500 (Masters)' },
    { value: '600', label: 'Level 600 (PhD)' },
  ],
  SEMESTERS: [
    { value: '1', label: 'First Semester' },
    { value: '2', label: 'Second Semester' },
    { value: '3', label: 'Third Semester (Summer)' },
  ],
} as const;

// API Endpoints - Centralized from backend routes
export const API_ENDPOINTS = {
  AUTH: {
    BASE: '/api/auth',
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    PROFILE: '/api/auth/profile',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
  },
  STUDENTS: {
    BASE: '/api/students',
    BY_ID: (id: number) => `/api/students/${id}`,
    STATS: '/api/students/stats',
    EXPORT: '/api/students/export',
    IMPORT: '/api/students/import',
    IMPORT_TEMPLATE: '/api/students/import-template',
    BULK_IMPORT: '/api/students/bulk-import',
    UPDATE_STATUS: (id: number) => `/api/students/${id}/status`,
    BY_PROGRAM: (programId: number) => `/api/programs/${programId}/students`,
    BY_DEPARTMENT: (departmentId: number) => `/api/departments/${departmentId}/students`,
    BY_FACULTY: (facultyId: number) => `/api/faculties/${facultyId}/students`,
    BY_INSTITUTION: (institutionId: number) => `/api/institutions/${institutionId}/students`,
  },
  PROGRAMS: {
    BASE: '/api/programs',
    BY_ID: (id: number) => `/api/programs/${id}`,
    BY_DEPARTMENT: (departmentId: number) => `/api/departments/${departmentId}/programs`,
    STATS: (id: number) => `/api/programs/${id}/stats`,
  },
  DEPARTMENTS: {
    BASE: '/api/departments',
    BY_ID: (id: number) => `/api/departments/${id}`,
    BY_FACULTY: (facultyId: number) => `/api/faculties/${facultyId}/departments`,
  },
  FACULTIES: {
    BASE: '/api/faculties',
    BY_ID: (id: number) => `/api/faculties/${id}`,
    BY_INSTITUTION: (institutionId: number) => `/api/institutions/${institutionId}/faculties`,
  },
  INSTITUTIONS: {
    BASE: '/api/institutions',
    BY_ID: (id: number) => `/api/institutions/${id}`,
    ANALYTICS: (id: number) => `/api/institutions/${id}/analytics`,
  },
  USERS: {
    BASE: '/api/users',
    BY_ID: (id: number) => `/api/users/${id}`,
    PROFILE: '/api/users/profile',
  },
} as const;

// UI Constants
export const UI_CONSTANTS = {
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
  ANIMATIONS: {
    DURATION: {
      FAST: '150ms',
      NORMAL: '300ms',
      SLOW: '500ms',
    },
    EASING: {
      DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      IN: 'cubic-bezier(0.4, 0, 1, 1)',
      OUT: 'cubic-bezier(0, 0, 0.2, 1)',
      IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  SPACING: {
    XS: '0.25rem',
    SM: '0.5rem',
    MD: '1rem',
    LG: '1.5rem',
    XL: '2rem',
    '2XL': '3rem',
  },
} as const;

// Form Validation Rules
export const VALIDATION_RULES = {
  REQUIRED: 'This field is required',
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address',
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    MESSAGE: 'Password must contain at least 8 characters with uppercase, lowercase, number, and special character',
  },
  PHONE: {
    PATTERN: /^[+]?[1-9]\d{0,15}$/,
    MESSAGE: 'Please enter a valid phone number',
  },
  STUDENT_ID: {
    PATTERN: /^[A-Z0-9]{6,12}$/,
    MESSAGE: 'Student ID must be 6-12 characters (letters and numbers only)',
  },
  INDEX_NUMBER: {
    PATTERN: /^[A-Z0-9/-]{8,15}$/,
    MESSAGE: 'Index number must be 8-15 characters',
  },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'elms_access_token',
  REFRESH_TOKEN: 'elms_refresh_token',
  USER: 'elms_user_data',
  THEME: 'elms_theme',
  LANGUAGE: 'elms_language',
  REMEMBER_ME: 'elms_remember_me',
  LAST_VISITED: 'elms_last_visited',
  STUDENTS_FILTERS: 'elms_students_filters',
  STUDENTS_VIEW_MODE: 'elms_students_view_mode',
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  STUDENTS: {
    BASE: '/admin/students',
    CREATE: '/admin/students/new',
    VIEW: (id: string) => `/admin/students/${id}`,
    EDIT: (id: string) => `/admin/students/${id}/edit`,
  },
  ADMIN: {
    BASE: '/admin',
    USERS: '/admin/users',
    FACULTIES: '/admin/faculty',
    DEPARTMENTS: '/admin/departments',
    PROGRAMS: '/admin/programs',
    COURSES: '/admin/courses',
    SETTINGS: '/admin/settings',
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. Please contact your administrator.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER: 'Server error. Please try again later.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  STUDENT: {
    CREATED: 'Student created successfully',
    UPDATED: 'Student updated successfully',
    DELETED: 'Student deleted successfully',
    STATUS_UPDATED: 'Student status updated successfully',
    IMPORTED: 'Students imported successfully',
    EXPORTED: 'Students exported successfully',
  },
  GENERAL: {
    SAVED: 'Changes saved successfully',
    DELETED: 'Item deleted successfully',
    UPLOADED: 'File uploaded successfully',
  },
} as const;
