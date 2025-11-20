import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authService } from '@/services/auth.service';
import { storageService } from '@/services/storage.service';
import type { AuthState, LoginRequest, RegisterRequest, RoleProfile, UserRole } from '@/types/auth';

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  refreshAuthToken: () => Promise<boolean>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
  updateUser: (user: AuthState['user']) => void;
  startTokenRefresh: () => void;
  stopTokenRefresh: () => void;
  // RoleProfile helpers
  getCurrentRole: () => UserRole | null;
  getPrimaryRole: () => RoleProfile | null;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  getRoleMetadata: (role?: UserRole) => Record<string, unknown> | null;
  getAllRoles: () => UserRole[];
}

type AuthStore = AuthState & AuthActions;

// Token refresh interval (15 minutes)
const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000;

let refreshInterval: NodeJS.Timeout | null = null;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        login: async (credentials: LoginRequest) => {
          set({ isLoading: true, error: null });

          try {
            const authResponse = await authService.login(credentials);
            const rememberMe = credentials.rememberMe || false;

            // Save to both Zustand store and storage service (cookies)
            storageService.setToken(authResponse.token, rememberMe);
            storageService.setRefreshToken(authResponse.refreshToken, rememberMe);
            storageService.setUser(authResponse.user, rememberMe);

            if (rememberMe) {
              storageService.setRememberMe(true);
            }

            set({
              user: authResponse.user,
              token: authResponse.token,
              refreshToken: authResponse.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            // Start token refresh interval
            get().startTokenRefresh();
          } catch (error) {
            set({
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Login failed',
            });
            throw error;
          }
        },

        register: async (userData: RegisterRequest) => {
          set({ isLoading: true, error: null });

          try {
            const authResponse = await authService.register(userData);
            const rememberMe = false; // Default to session for new registrations

            // Save to storage (cookies)
            storageService.setToken(authResponse.token, rememberMe);
            storageService.setRefreshToken(authResponse.refreshToken, rememberMe);
            storageService.setUser(authResponse.user, rememberMe);

            set({
              user: authResponse.user,
              token: authResponse.token,
              refreshToken: authResponse.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            // Start token refresh interval
            get().startTokenRefresh();
          } catch (error) {
            set({
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Registration failed',
            });
            throw error;
          }
        },

        logout: async () => {
          set({ isLoading: true });

          try {
            await authService.logout();
          } catch {
            // Continue with logout even if API call fails
          } finally {
            // Stop token refresh
            get().stopTokenRefresh();

            // Clear from both Zustand store and storage service
            storageService.clearAuthData();

            set({
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        },

        getCurrentUser: async () => {
          const state = get();

          // Don't fetch if not authenticated
          if (!state.isAuthenticated || !state.token) {
            return;
          }

          try {
            const user = await authService.getCurrentUser();
            if (user) {
              // Update user in both store and storage
              storageService.setUser(user);
              set({ user });
            }
          } catch (error) {
            console.error('Failed to fetch current user:', error);
            // Don't logout on profile fetch error, might be temporary
            // Only logout if it's a 401 error (handled by API interceptor)
          }
        },

        refreshAuthToken: async (): Promise<boolean> => {
          const state = get();
          const refreshToken = state.refreshToken || storageService.getRefreshToken();

          if (!refreshToken) {
            console.warn('No refresh token available');
            await get().logout();
            return false;
          }

          try {
            const newToken = await authService.refreshToken(refreshToken);

            if (newToken) {
              const rememberMe = storageService.getRememberMe();
              // Update token in storage and store
              storageService.setToken(newToken, rememberMe);
              set({ token: newToken });
              return true;
            } else {
              // Refresh failed, logout user
              console.error('Token refresh failed');
              await get().logout();
              return false;
            }
          } catch (error) {
            console.error('Token refresh error:', error);
            await get().logout();
            return false;
          }
        },

        initializeAuth: async () => {
          set({ isLoading: true });

          try {
            // Check if we have tokens in storage service
            const token = storageService.getToken();
            const user = storageService.getUser();
            const refreshToken = storageService.getRefreshToken();

            if (token && user) {
              // Validate token by fetching current user
              try {
                const currentUser = await authService.getCurrentUser();

                if (currentUser) {
                  // Sync storage service data to Zustand store
                  set({
                    user: currentUser,
                    token,
                    refreshToken,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                  });

                  // Start token refresh interval
                  get().startTokenRefresh();
                  return;
                }
              } catch (error) {
                // Token is invalid, try to refresh
                console.warn('Token validation failed, attempting refresh...');

                if (refreshToken) {
                  const refreshed = await get().refreshAuthToken();

                  if (refreshed) {
                    // Try to get user again
                    const retryUser = await authService.getCurrentUser();

                    if (retryUser) {
                      set({
                        user: retryUser,
                        token: storageService.getToken(),
                        refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                      });

                      get().startTokenRefresh();
                      return;
                    }
                  }
                }
              }
            }

            // No valid auth data or refresh failed
            storageService.clearAuthData();
            set({
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            console.error('Auth initialization error:', error);
            storageService.clearAuthData();
            set({
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        },

        // Start automatic token refresh
        startTokenRefresh: () => {
          // Clear existing interval
          get().stopTokenRefresh();

          // Set up new interval
          refreshInterval = setInterval(async () => {
            const state = get();

            if (state.isAuthenticated && state.refreshToken) {
              console.log('Auto-refreshing token...');
              await get().refreshAuthToken();
            }
          }, TOKEN_REFRESH_INTERVAL);
        },

        // Stop automatic token refresh
        stopTokenRefresh: () => {
          if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
          }
        },

        updateUser: (user) => {
          if (user) {
            const rememberMe = storageService.getRememberMe();
            storageService.setUser(user, rememberMe);
            set({ user });
          }
        },

        clearError: () => {
          set({ error: null });
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        // RoleProfile Helper Methods
        getCurrentRole: () => {
          const state = get();
          return state.user?.role || null;
        },

        getPrimaryRole: () => {
          const state = get();
          if (!state.user?.roleProfiles) return null;
          return state.user.roleProfiles.find(rp => rp.isPrimary) || state.user.roleProfiles[0] || null;
        },

        hasRole: (role: UserRole | UserRole[]) => {
          const state = get();
          if (!state.user) return false;

          const roles = Array.isArray(role) ? role : [role];

          // Check primary role for backward compatibility
          if (roles.includes(state.user.role)) return true;

          // Check roleProfiles if available
          if (state.user.roleProfiles && state.user.roleProfiles.length > 0) {
            return state.user.roleProfiles.some(rp =>
              rp.isActive && roles.includes(rp.role)
            );
          }

          return false;
        },

        getRoleMetadata: (role?: UserRole) => {
          const state = get();
          if (!state.user?.roleProfiles) return null;

          // If role specified, find that specific role profile
          if (role) {
            const roleProfile = state.user.roleProfiles.find(rp => rp.role === role && rp.isActive);
            return roleProfile?.metadata || null;
          }

          // Otherwise return primary role metadata
          const primaryRole = state.user.roleProfiles.find(rp => rp.isPrimary);
          return primaryRole?.metadata || state.user.roleProfiles[0]?.metadata || null;
        },

        getAllRoles: () => {
          const state = get();
          if (!state.user?.roleProfiles) return state.user?.role ? [state.user.role] : [];
          return state.user.roleProfiles
            .filter(rp => rp.isActive)
            .map(rp => rp.role);
        },
      }),
      {
        name: 'elms-auth-storage',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
        onRehydrateStorage: () => (state) => {
          if (state?.isAuthenticated && state?.token) {
            // Start token refresh on rehydration
            state.startTokenRefresh();
          }
        },
      }
    ),
    {
      name: 'auth-store',
    }
  )
);
