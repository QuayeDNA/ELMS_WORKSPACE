import { useAuthStore } from '@/stores/auth.store';
import type { LoginRequest, RegisterRequest } from '@/types/auth';

/**
 * Custom hook that provides authentication functionality
 * This is a convenience wrapper around the auth store
 */
export const useAuth = () => {
  const {
    // State
    user,
    token,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
    // Actions
    login,
    register,
    logout,
    getCurrentUser,
    clearError,
    setLoading,
    initializeAuth,
  } = useAuthStore();

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: string | string[]) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  /**
   * Check if user can access a resource based on their role and scope
   */
  const canAccess = (requiredRoles: string[], resourceScope?: {
    institutionId?: number;
    facultyId?: number;
  }) => {
    if (!user || !hasRole(requiredRoles)) return false;

    // Super admin can access everything
    if (user.role === 'SUPER_ADMIN') return true;

    // If no scope required, just check role
    if (!resourceScope) return true;

    // Check institution scope for ADMIN role
    if (user.role === 'ADMIN' && resourceScope.institutionId) {
      return user.institutionId === resourceScope.institutionId;
    }

    // Check faculty scope for FACULTY_ADMIN role
    if (user.role === 'FACULTY_ADMIN' && resourceScope.facultyId) {
      return user.facultyId === resourceScope.facultyId;
    }

    return true;
  };

  /**
   * Get user's accessible institution IDs based on their role
   */
  const getAccessibleInstitutions = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'SUPER_ADMIN':
        return []; // Can access all institutions
      case 'ADMIN':
        return user.institutionId ? [user.institutionId] : [];
      case 'FACULTY_ADMIN':
        return user.facultyId && user.institutionId ? [user.institutionId] : [];
      default:
        return [];
    }
  };

  /**
   * Get user's accessible faculty IDs based on their role
   */
  const getAccessibleFaculties = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'SUPER_ADMIN':
        return []; // Can access all faculties
      case 'ADMIN':
        return []; // Can access all faculties in their institution
      case 'FACULTY_ADMIN':
        return user.facultyId ? [user.facultyId] : [];
      default:
        return [];
    }
  };

  /**
   * Check if the user is in a specific institutional context
   */
  const isInInstitution = (institutionId: number) => {
    return user?.institutionId === institutionId;
  };

  /**
   * Check if the user is in a specific faculty context
   */
  const isInFaculty = (facultyId: number) => {
    return user?.facultyId === facultyId;
  };

  /**
   * Login wrapper that handles errors gracefully
   */
  const handleLogin = async (credentials: LoginRequest) => {
    try {
      await login(credentials);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  /**
   * Register wrapper that handles errors gracefully
   */
  const handleRegister = async (userData: RegisterRequest) => {
    try {
      await register(userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  };

  /**
   * Logout wrapper that handles errors gracefully
   */
  const handleLogout = async () => {
    try {
      await logout();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Logout failed' 
      };
    }
  };

  return {
    // State
    user,
    token,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
    
    // Basic actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    getCurrentUser,
    clearError,
    setLoading,
    initializeAuth,
    
    // Permission utilities
    hasRole,
    canAccess,
    getAccessibleInstitutions,
    getAccessibleFaculties,
    isInInstitution,
    isInFaculty,
    
    // Role checks (convenience methods)
    isSuperAdmin: () => hasRole('SUPER_ADMIN'),
    isAdmin: () => hasRole('ADMIN'),
    isFacultyAdmin: () => hasRole('FACULTY_ADMIN'),
    isLecturer: () => hasRole('LECTURER'),
    isStudent: () => hasRole('STUDENT'),
    
    // Combined role checks
    isAdminLevel: () => hasRole(['SUPER_ADMIN', 'ADMIN']),
    isFacultyLevel: () => hasRole(['SUPER_ADMIN', 'ADMIN', 'FACULTY_ADMIN']),
    isAcademicStaff: () => hasRole(['SUPER_ADMIN', 'ADMIN', 'FACULTY_ADMIN', 'LECTURER']),
  };
};