import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authService } from '@/services/auth.service';
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
          const state = get();
          
          // If already authenticated, don't re-initialize
          if (state.isAuthenticated && state.user && state.token) {
            return;
          }
          
          // The persist middleware will automatically restore the state
          // We just need to validate it
          if (state.token && state.user) {
            set({ isAuthenticated: true });
          } else {
            set({ isAuthenticated: false });
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
