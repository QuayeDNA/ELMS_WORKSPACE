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

            // Save remember me preference to cookies (for persistence preference)
            if (rememberMe) {
              storageService.setRememberMe(true);
            }

            // Update Zustand store (persist middleware will handle storage)
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

            // Update Zustand store (persist middleware will handle storage)
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

            // Clear all auth data from cookies
            storageService.clearAuthData();

            // Clear Zustand store (persist will clear localStorage)
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
              // Update user in store (persist will handle storage)
              set({ user });
            }
          } catch (error) {
            // Don't logout on profile fetch error, might be temporary
            // Only logout if it's a 401 error (handled by API interceptor)
          }
        },

        refreshAuthToken: async (): Promise<boolean> => {
          const state = get();
          const refreshToken = state.refreshToken;

          if (!refreshToken) {
            await get().logout();
            return false;
          }

          try {
            const newToken = await authService.refreshToken(refreshToken);

            if (newToken) {
              // Update token in store (persist will handle storage)
              set({ token: newToken });
              return true;
            } else {
              // Refresh failed, logout user
              await get().logout();
              return false;
            }
          } catch (error) {
            await get().logout();
            return false;
          }
        },

        initializeAuth: async () => {
          set({ isLoading: true });

          try {
            // Get current state from Zustand (which loads from persist storage)
            const state = get();
            const { token, user, refreshToken } = state;

            if (token && user) {
              // Validate token by fetching current user
              try {
                const currentUser = await authService.getCurrentUser();

                if (currentUser) {
                  // Update store with fresh user data
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

                if (refreshToken) {
                  const refreshed = await get().refreshAuthToken();

                  if (refreshed) {
                    // Try to get user again
                    const retryUser = await authService.getCurrentUser();

                    if (retryUser) {
                      set({
                        user: retryUser,
                        token: get().token, // Use refreshed token from state
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
