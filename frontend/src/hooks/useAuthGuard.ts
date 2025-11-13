import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface UseAuthGuardOptions {
  requiredRoles?: string[];
  requiredPermission?: string;
  redirectTo?: string;
  requireActive?: boolean;
}

/**
 * Hook for protecting routes with authentication and authorization checks
 *
 * @example
 * // Require authentication only
 * useAuthGuard();
 *
 * @example
 * // Require specific role
 * useAuthGuard({ requiredRoles: ['ADMIN', 'SUPER_ADMIN'] });
 *
 * @example
 * // Require specific permission
 * useAuthGuard({ requiredPermission: 'manage_users' });
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const {
    requiredRoles,
    requiredPermission,
    redirectTo = '/login',
    requireActive = true,
  } = options;

  const { isAuthenticated, isLoading, hasRole, hasPermission, isUserActive } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait for auth initialization
    if (isLoading) return;

    // Check authentication
    if (!isAuthenticated) {
      navigate(redirectTo, {
        replace: true,
        state: { from: location.pathname },
      });
      return;
    }

    // Check if user is active
    if (requireActive && !isUserActive()) {
      navigate('/account-suspended', { replace: true });
      return;
    }

    // Check role requirements
    if (requiredRoles && requiredRoles.length > 0) {
      if (!hasRole(requiredRoles)) {
        navigate('/unauthorized', { replace: true });
        return;
      }
    }

    // Check permission requirements
    if (requiredPermission && !hasPermission(requiredPermission)) {
      navigate('/unauthorized', { replace: true });
      return;
    }
  }, [
    isAuthenticated,
    isLoading,
    requiredRoles,
    requiredPermission,
    redirectTo,
    requireActive,
    navigate,
    location.pathname,
    hasRole,
    hasPermission,
    isUserActive,
  ]);

  return {
    isAuthenticated,
    isLoading,
    hasRole,
    hasPermission,
    isUserActive,
  };
}
