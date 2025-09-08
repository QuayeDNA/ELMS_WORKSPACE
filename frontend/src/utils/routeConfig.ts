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
      
    default:
      return '/dashboard'; // Fallback to dashboard
  }
}
