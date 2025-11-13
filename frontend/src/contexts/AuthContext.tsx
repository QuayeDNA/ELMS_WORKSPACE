import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import type { User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasRole: (roles: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  isUserActive: () => boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const {
    user,
    isAuthenticated,
    isLoading: storeLoading,
    error,
    initializeAuth,
    clearError,
  } = useAuthStore();

  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize auth on mount
  useEffect(() => {
    const init = async () => {
      setIsInitializing(true);
      try {
        await initializeAuth();
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, [initializeAuth]);

  // Check if user has specific role(s)
  const hasRole = useCallback(
    (roles: string | string[]): boolean => {
      if (!user) return false;

      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(user.role);
    },
    [user]
  );

  // Check if user has specific permission
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;

      // Define role-based permissions
      const rolePermissions: Record<string, string[]> = {
        SUPER_ADMIN: ['*'], // Super admin has all permissions
        ADMIN: [
          'manage_users',
          'manage_institutions',
          'manage_faculties',
          'view_analytics',
        ],
        FACULTY_ADMIN: [
          'manage_departments',
          'create_exams',
          'manage_officers',
          'view_faculty_data',
        ],
        DEAN: [
          'view_faculty_data',
          'approve_exams',
          'manage_departments',
        ],
        HOD: [
          'manage_department',
          'view_department_data',
          'manage_courses',
        ],
        EXAMS_OFFICER: [
          'schedule_exams',
          'manage_incidents',
          'assign_invigilators',
          'manage_venues',
        ],
        SCRIPT_HANDLER: [
          'receive_scripts',
          'dispatch_scripts',
          'scan_qr_codes',
          'report_incidents',
        ],
        INVIGILATOR: [
          'conduct_exams',
          'report_incidents',
          'manage_scripts',
        ],
        LECTURER: [
          'create_exams',
          'grade_scripts',
          'view_results',
          'teach_courses',
        ],
        STUDENT: [
          'view_results',
          'register_courses',
          'view_timetable',
        ],
      };

      const userPermissions = rolePermissions[user.role] || [];

      // Super admin has all permissions
      if (userPermissions.includes('*')) return true;

      return userPermissions.includes(permission);
    },
    [user]
  );

  // Check if user account is active
  const isUserActive = useCallback((): boolean => {
    if (!user) return false;
    return user.status === 'ACTIVE';
  }, [user]);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading: isInitializing || storeLoading,
    error,
    hasRole,
    hasPermission,
    isUserActive,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
