/**
 * ELMS Mobile - React Query Hooks for Authentication
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as authService from '../services/auth.service';
import type { LoginCredentials } from '../services/auth.service';

/**
 * Login mutation
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      // Cache user data
      queryClient.setQueryData(['user'], data.user);
    },
  });
};

/**
 * Logout mutation
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
};

/**
 * Get current user query
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: authService.getCurrentUser,
    staleTime: Infinity, // User data rarely changes
  });
};

/**
 * Refresh user data mutation
 */
export const useRefreshUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.refreshUser,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data);
    },
  });
};

/**
 * Check authentication status
 */
export const useIsAuthenticated = () => {
  return useQuery({
    queryKey: ['isAuthenticated'],
    queryFn: authService.isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
