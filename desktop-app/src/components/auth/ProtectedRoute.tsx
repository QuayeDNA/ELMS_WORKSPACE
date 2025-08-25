import React from 'react'
import { useAuthStore } from '../../stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: string
  requiredRole?: string
  requiredRoles?: string[]
  fallback?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission,
  requiredRole,
  requiredRoles,
  fallback = <div className="p-4 text-center text-red-600">Access Denied</div>
}) => {
  const { hasPermission, hasRole, hasAnyRole } = useAuthStore()

  // Check permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>
  }

  // Check specific role
  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>
  }

  // Check any of the required roles
  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

interface ConditionalRenderProps {
  children: React.ReactNode
  requiredPermission?: string
  requiredRole?: string
  requiredRoles?: string[]
}

export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  children,
  requiredPermission,
  requiredRole,
  requiredRoles
}) => {
  const { hasPermission, hasRole, hasAnyRole } = useAuthStore()

  // Check permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return null
  }

  // Check specific role
  if (requiredRole && !hasRole(requiredRole)) {
    return null
  }

  // Check any of the required roles
  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return null
  }

  return <>{children}</>
}

// Higher-order component for role-based access
export const withRoleProtection = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: string | string[],
  fallback?: React.ReactNode
) => {
  return (props: P) => {
    const { hasRole, hasAnyRole } = useAuthStore()
    
    const hasAccess = Array.isArray(requiredRole) 
      ? hasAnyRole(requiredRole)
      : hasRole(requiredRole)

    if (!hasAccess) {
      return fallback || <div className="p-4 text-center text-red-600">Access Denied</div>
    }

    return <Component {...props} />
  }
}

// Higher-order component for permission-based access
export const withPermissionProtection = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: string,
  fallback?: React.ReactNode
) => {
  return (props: P) => {
    const { hasPermission } = useAuthStore()
    
    if (!hasPermission(requiredPermission)) {
      return fallback || <div className="p-4 text-center text-red-600">Access Denied</div>
    }

    return <Component {...props} />
  }
}
