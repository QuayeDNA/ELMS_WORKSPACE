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
  INSTITUTIONS: {
    BASE: '/api/institutions',
    BY_ID: (id: number) => `/api/institutions/${id}`,
    WITH_ADMIN: '/api/institutions/with-admin',
    ANALYTICS: (id: number) => `/api/institutions/${id}/analytics`,
    OVERVIEW_ANALYTICS: '/api/institutions/analytics/overview',
  },
  FACULTIES: {
    BASE: '/api/faculties',
    BY_ID: (id: number) => `/api/faculties/${id}`,
    BY_INSTITUTION: (institutionId: number) => `/api/institutions/${institutionId}/faculties`,
  },
  DEPARTMENTS: {
    BASE: '/api/departments',
    BY_ID: (id: number) => `/api/departments/${id}`,
    BY_FACULTY: (facultyId: number) => `/api/faculties/${facultyId}/departments`,
  },
  PROGRAMS: {
    BASE: '/api/programs',
    BY_ID: (id: number) => `/api/programs/${id}`,
    BY_DEPARTMENT: (departmentId: number) => `/api/programs/departments/${departmentId}/programs`,
  },
  COURSES: {
    BASE: '/api/courses',
    BY_ID: (id: number) => `/api/courses/${id}`,
    BY_PROGRAM: (programId: number) => `/api/programs/${programId}/courses`,
    BY_DEPARTMENT: (departmentId: number) => `/api/courses/department/${departmentId}`,
  },
  STUDENTS: {
    BASE: '/api/students',
    BY_ID: (id: number) => `/api/students/${id}`,
    BY_PROGRAM: (programId: number) => `/api/programs/${programId}/students`,
    BY_COURSE: (courseId: number) => `/api/courses/${courseId}/students`,
    BY_DEPARTMENT: (departmentId: number) => `/api/students/department/${departmentId}`,
    BULK_IMPORT: '/api/students/bulk-import',
    UPDATE_STATUS: (id: number) => `/api/students/${id}/status`,
    STATS: '/api/students/stats',
    COURSE_ENROLLMENT_STATS: (courseId: number) => `/api/courses/${courseId}/students/stats`,
  },
  INSTRUCTORS: {
    BASE: '/api/instructors',
    BY_ID: (id: number) => `/api/instructors/${id}`,
    BY_DEPARTMENT: (departmentId: number) => `/api/instructors/department/${departmentId}`,
    BULK_IMPORT: '/api/instructors/bulk-import',
    STATS: '/api/instructors/stats',
  },
  ACADEMIC_PERIODS: {
    BASE: '/api/academic-periods',
    BY_ID: (id: number) => `/api/academic-periods/${id}`,
    CURRENT: '/api/academic-periods/current',
  },
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
  PHONE_PATTERN: /^\+?[\d\s\\()-]+$/,
} as const;
