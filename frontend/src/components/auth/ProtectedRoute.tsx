import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermission?: string;
  requireActive?: boolean;
  redirectTo?: string;
}

/**
 * Component for protecting routes with authentication and authorization
 *
 * @example
 * <ProtectedRoute>
 *   <AdminDashboard />
 * </ProtectedRoute>
 *
 * @example
 * <ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}>
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
  const { isAuthenticated, isLoading, hasRole, hasPermission, isUserActive } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // Check if user is active
  if (requireActive && !isUserActive()) {
    return <Navigate to="/account-suspended" replace />;
  }

  // Check role requirements
  if (requiredRoles && requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check permission requirements
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
