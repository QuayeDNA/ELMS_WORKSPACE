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
    BY_DEPARTMENT: (departmentId: number) => `/api/departments/${departmentId}/programs`,
  },
  COURSES: {
    BASE: '/api/courses',
    BY_ID: (id: number) => `/api/courses/${id}`,
    BY_PROGRAM: (programId: number) => `/api/programs/${programId}/courses`,
    BY_DEPARTMENT: (departmentId: number) => `/api/departments/${departmentId}/courses`,
  },
  STUDENTS: {
    BASE: '/api/students',
    BY_ID: (id: number) => `/api/students/${id}`,
    BY_PROGRAM: (programId: number) => `/api/programs/${programId}/students`,
    BY_COURSE: (courseId: number) => `/api/courses/${courseId}/students`,
    BULK_IMPORT: '/api/students/bulk-import',
    UPDATE_STATUS: (id: number) => `/api/students/${id}/status`,
    STATS: '/api/students/stats',
    COURSE_ENROLLMENT_STATS: (courseId: number) => `/api/courses/${courseId}/students/stats`,
  },
  INSTRUCTORS: {
    BASE: '/api/instructors',
    BY_ID: (id: number) => `/api/instructors/${id}`,
    BY_DEPARTMENT: (departmentId: number) => `/api/departments/${departmentId}/instructors`,
    BULK_IMPORT: '/api/instructors/bulk-import',
    STATS: '/api/instructors/stats',
  },
  ACADEMIC_PERIODS: {
    // Academic Years
    ACADEMIC_YEARS: '/api/academic-periods/academic-years',
    ACADEMIC_YEAR_BY_ID: (id: number) => `/api/academic-periods/academic-years/${id}`,
    CURRENT_ACADEMIC_YEAR: '/api/academic-periods/academic-years/current',
    SET_CURRENT_ACADEMIC_YEAR: (id: number) => `/api/academic-periods/academic-years/${id}/set-current`,

    // Semesters
    SEMESTERS: '/api/academic-periods/semesters',
    SEMESTER_BY_ID: (id: number) => `/api/academic-periods/semesters/${id}`,
    CURRENT_SEMESTER: '/api/academic-periods/semesters/current',
    SET_CURRENT_SEMESTER: (id: number) => `/api/academic-periods/semesters/${id}/set-current`,

    // Academic Periods (detailed period configurations)
    PERIODS: '/api/academic-periods/periods',
    PERIOD_BY_ID: (id: number) => `/api/academic-periods/periods/${id}`,
    PERIOD_BY_SEMESTER: (semesterId: number) => `/api/academic-periods/periods/semester/${semesterId}`,
    CURRENT_PERIOD: '/api/academic-periods/periods/current',
    PERIOD_STATUS: (id: number) => `/api/academic-periods/periods/${id}/status`,
    OPEN_REGISTRATION: (id: number) => `/api/academic-periods/periods/${id}/open-registration`,
    CLOSE_REGISTRATION: (id: number) => `/api/academic-periods/periods/${id}/close-registration`,
    OPEN_ADD_DROP: (id: number) => `/api/academic-periods/periods/${id}/open-add-drop`,
    CLOSE_ADD_DROP: (id: number) => `/api/academic-periods/periods/${id}/close-add-drop`,

    // Statistics
    STATS: '/api/academic-periods/academic-years/stats',

    // Calendar Import (Future feature)
    CALENDAR_IMPORTS: '/api/academic-periods/calendar-imports',
    CALENDAR_IMPORT_BY_ID: (id: number) => `/api/academic-periods/calendar-imports/${id}`,
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
