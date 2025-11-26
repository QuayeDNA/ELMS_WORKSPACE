import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { RootState, AppDispatch } from '../stores/store';
import { checkAuthStatus, logoutUser, loginUser } from '../stores/slices/authSlice';

// Hook for accessing auth state
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  return {
    ...auth,
    isHandler: auth.isAuthenticated && auth.user?.role !== 'STUDENT',
  };
};

// Hook for login functionality
export const useLogin = () => {
  const dispatch = useDispatch<AppDispatch>();

  const login = async (email: string, password: string) => {
    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      return result;
    } catch (error: any) {
      // Re-throw the error so the component can handle it
      // Make sure to preserve the error structure
      throw error;
    }
  };

  return {
    login,
  };
};

// Hook for logout functionality
export const useLogout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const logout = async () => {
    await dispatch(logoutUser()).unwrap();
    router.replace('/login');
  };

  return { logout };
};

// Hook for auth guard - redirects to login if not authenticated
export const useAuthGuard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // Check auth status on mount
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return { isAuthenticated, isLoading };
};

// Hook for role-based access control
export const useRoleGuard = (allowedRoles: string[]) => {
  const { user, isAuthenticated } = useAuth();

  const hasAccess = isAuthenticated && user && allowedRoles.includes(user.role);

  return {
    hasAccess,
    user,
    isAuthenticated,
  };
};
