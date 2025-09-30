import React from 'react';
import { Navigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/types/auth';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackComponent?: React.ReactNode;
  redirectTo?: string;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackComponent,
  redirectTo = '/dashboard' 
}: Readonly<RoleGuardProps>) {
  const { user, isAuthenticated } = useAuthStore();

  // If not authenticated, redirect will be handled by AuthGuard
  if (!isAuthenticated || !user) {
    return null;
  }

  // Check if user's role is in the allowed roles
  const hasPermission = allowedRoles.includes(user.role);

  if (!hasPermission) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    // Default unauthorized message
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            You don't have permission to access this page. 
            Contact your administrator if you believe this is an error.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}



