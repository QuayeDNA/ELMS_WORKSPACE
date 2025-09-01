export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
    PROFILE: '/api/auth/profile',
  },
  USERS: '/api/users',
  INSTITUTIONS: '/api/institutions',
  FACULTIES: '/api/faculties',
  DEPARTMENTS: '/api/departments',
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'elms_token',
  REFRESH_TOKEN: 'elms_refresh_token',
  USER: 'elms_user',
  REMEMBER_ME: 'elms_remember_me',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  PROFILE: '/profile',
} as const;

export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['*'],
  ADMIN: ['manage_institution', 'manage_users', 'view_analytics'],
  FACULTY_ADMIN: ['manage_faculty', 'manage_departments', 'create_exams'],
  DEAN: ['manage_faculty', 'view_faculty_data'],
  HOD: ['manage_department', 'view_department_data'],
  EXAMS_OFFICER: ['schedule_exams', 'manage_incidents', 'assign_invigilators'],
  SCRIPT_HANDLER: ['handle_scripts', 'scan_qr_codes', 'report_incidents'],
  INVIGILATOR: ['conduct_exams', 'report_incidents', 'manage_scripts'],
  LECTURER: ['create_exams', 'grade_scripts', 'view_results', 'teach_courses'],
  STUDENT: ['take_exams', 'view_results'],
} as const;

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^\+?[\d\s\-\(\)]+$/,
} as const;
