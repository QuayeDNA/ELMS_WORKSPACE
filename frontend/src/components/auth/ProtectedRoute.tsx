import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { UserRole } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requiredPermission?: string;
  requireActive?: boolean;
  redirectTo?: string;
}

/**
 * Component for protecting routes with authentication and authorization
 *
 * Features:
 * - Authentication check
 * - Role-based access control using roleProfiles
 * - Permission-based access control
 * - Account status validation
 * - Proper redirects with state preservation
 *
 * @example
 * <ProtectedRoute>
 *   <AdminDashboard />
 * </ProtectedRoute>
 *
 * @example
 * <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
 *   <UserManagement />
 * </ProtectedRoute>
 *
 * @example
 * <ProtectedRoute requiredPermission="manage_exams">
 *   <ExamManagement />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  requiredRoles,
  requiredPermission,
  requireActive = true,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const {
    user,
    isAuthenticated,
    isLoading,
    hasRole,
    hasPermission,
    isUserActive
  } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated || !user) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to login');
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // Check if user is active
  if (requireActive && !isUserActive()) {
    console.log('[ProtectedRoute] User account not active:', user.status);
    return <Navigate to="/account-suspended" state={{ from: location.pathname }} replace />;
  }

  // Check role requirements
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = hasRole(requiredRoles);

    if (!hasRequiredRole) {
      console.log('[ProtectedRoute] Access denied - Required roles:', requiredRoles);
      console.log('[ProtectedRoute] User role:', user.role);
      console.log('[ProtectedRoute] User roleProfiles:', user.roleProfiles);
      return <Navigate to="/unauthorized" state={{ from: location.pathname, reason: 'insufficient_role' }} replace />;
    }
  }

  // Check permission requirements
  if (requiredPermission) {
    const hasRequiredPermission = hasPermission(requiredPermission);

    if (!hasRequiredPermission) {
      console.log('[ProtectedRoute] Access denied - Required permission:', requiredPermission);
      console.log('[ProtectedRoute] User role:', user.role);
      return <Navigate to="/unauthorized" state={{ from: location.pathname, reason: 'insufficient_permission' }} replace />;
    }
  }

  // All checks passed, render protected content
  return <>{children}</>;
}
