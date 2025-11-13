import { UserRole } from '@/types/auth';

/**
 * Simple role-based redirect for existing users
 */
export function getRedirectPath(role: UserRole): string {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return '/dashboard'; // Super admin manages institutions

    case UserRole.ADMIN:
      return '/admin'; // Institution admin dashboard

    case UserRole.STUDENT:
      return '/student'; // Student dashboard

    case UserRole.FACULTY_ADMIN:
      return '/faculty-admin'; // Faculty admin dashboard

    case UserRole.DEAN:
      return '/dean'; // Dean dashboard

    case UserRole.HOD:
      return '/hod'; // HOD dashboard

    case UserRole.EXAMS_OFFICER:
      return '/exams-officer'; // Exams officer dashboard

    case UserRole.LECTURER:
      return '/lecturer'; // Lecturer dashboard

    case UserRole.INVIGILATOR:
      return '/invigilator'; // Invigilator dashboard

    case UserRole.SCRIPT_HANDLER:
      return '/script-handler'; // Script handler dashboard

    default:
      return '/dashboard'; // Fallback to dashboard
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

