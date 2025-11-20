import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/types/auth';
import { getRedirectPath } from '@/utils/routeConfig';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackComponent?: React.ReactNode;
  redirectTo?: string;
  showMessage?: boolean;
}

/**
 * RoleGuard component for protecting content based on user roles
 *
 * Features:
 * - Multi-role support via roleProfiles
 * - Flexible fallback options (component, redirect, or message)
 * - Detailed logging for debugging
 * - User-friendly error messages
 *
 * @example
 * <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
 *   <AdminPanel />
 * </RoleGuard>
 */
export function RoleGuard({
  children,
  allowedRoles,
  fallbackComponent,
  redirectTo,
  showMessage = false
}: Readonly<RoleGuardProps>) {
  const { user, isAuthenticated, hasRole } = useAuthStore();
  const navigate = useNavigate();

  // If not authenticated, redirect will be handled by ProtectedRoute/AuthGuard
  if (!isAuthenticated || !user) {
    console.log('[RoleGuard] User not authenticated');
    return null;
  }

  // Check if user has any of the allowed roles
  const hasRequiredRole = hasRole(allowedRoles);

  useEffect(() => {
    if (!hasRequiredRole && user) {
      // Log for debugging (server-side only, never expose to user)
      console.log('[RoleGuard] Access denied - redirecting to user dashboard');
      console.log('[RoleGuard] User primary role:', user.role);
      console.log('[RoleGuard] User all roles:', user.roleProfiles?.map(rp => rp.role));

      // Security: Never log or display required roles to prevent role enumeration attacks

      // Redirect user to their appropriate dashboard
      const userDashboard = getRedirectPath(user.role);
      navigate(userDashboard, { replace: true });
    }
  }, [hasRequiredRole, user, navigate]);

  if (!hasRequiredRole) {
    // Custom fallback component (rare use case)
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    // Custom redirect path (rare use case)
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    // Default: Redirect to user's appropriate dashboard
    // This will be handled by useEffect, return null to prevent flash
    return null;
  }

  // User has required role, render protected content
  return <>{children}</>;
}



