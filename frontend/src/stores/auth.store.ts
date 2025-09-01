import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authService } from '@/services/auth.service';
import { storageService } from '@/services/storage.service';
import type { AuthState, LoginRequest, RegisterRequest } from '@/types/auth';

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
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
            
            // Save to both Zustand store and storage service
            storageService.setToken(authResponse.token);
            storageService.setRefreshToken(authResponse.refreshToken);
            storageService.setUser(authResponse.user);
            
            set({
              user: authResponse.user,
              token: authResponse.token,
              refreshToken: authResponse.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
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
            
            set({
              user: authResponse.user,
              token: authResponse.token,
              refreshToken: authResponse.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
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
          try {
            const user = await authService.getCurrentUser();
            if (user) {
              set({ user });
            }
          } catch {
            // Don't logout on profile fetch error, might be temporary
          }
        },

        initializeAuth: async () => {
          // Check if we have tokens in storage service
          const token = storageService.getToken();
          const user = storageService.getUser();
          const refreshToken = storageService.getRefreshToken();
          
          if (token && user) {
            // Sync storage service data to Zustand store
            set({
              user,
              token,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            // No valid auth data
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

        clearError: () => {
          set({ error: null });
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },
      }),
      {
        name: 'elms-auth-storage', // Unique name for localStorage key
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
        onRehydrateStorage: () => (state) => {
          if (state?.user && state?.token) {
            // Auth state rehydrated successfully
          }
        },
      }
    ),
    {
      name: 'auth-store',
    }
  )
);
