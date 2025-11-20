import { UserRole } from '@/types/auth';

/**
 * Simple role-based redirect for existing users
 * Maps each user role to their appropriate dashboard
 */
export function getRedirectPath(role: UserRole): string {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return '/dashboard'; // Super admin dashboard

    case UserRole.ADMIN:
    case UserRole.FACULTY_ADMIN: // Faculty admins use the same admin interface
      return '/admin'; // Institution/Faculty admin dashboard

    case UserRole.STUDENT:
      return '/student'; // Student dashboard

    case UserRole.DEAN:
      return '/dean'; // Dean dashboard

    case UserRole.HOD:
      return '/hod'; // HOD dashboard

    case UserRole.EXAMS_OFFICER:
      return '/exams-officer'; // Exams officer dashboard

    case UserRole.LECTURER:
      return '/lecturer'; // Lecturer dashboard

    case UserRole.INVIGILATOR:
      return '/admin/logistics'; // Invigilators use logistics dashboard

    case UserRole.SCRIPT_HANDLER:
      return '/admin/scripts'; // Script handlers use scripts dashboard

    default:
      console.warn(`[RouteConfig] Unknown role: ${role}, redirecting to login`);
      return '/login'; // Fallback to login for unknown roles
  }
}

/**
 * Academic calendar navigation paths
 */
export const ACADEMIC_ROUTES = {
  YEARS: '/admin/academic/years',
  SEMESTERS: '/admin/academic/semesters',
  PERIODS: '/admin/academic/periods',
} as const;

/**
 * Check if user has access to academic calendar management
 */
export function canAccessAcademicCalendar(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
}

