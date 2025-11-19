import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { User, RoleProfile, UserRole } from '@/types/auth';

interface UserState {
  currentUser: User | null;
  selectedRole: UserRole | null;
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  setUser: (user: User | null) => void;
  selectRole: (role: UserRole) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  getRoleProfile: (role: UserRole) => RoleProfile | null;
  getActiveRoles: () => UserRole[];
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentUser: null,
      selectedRole: null,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user: User | null) => {
        set({
          currentUser: user,
          selectedRole: user?.role || null,
          error: null
        });
      },

      selectRole: (role: UserRole) => {
        const state = get();
        if (!state.currentUser) {
          set({ error: 'No user loaded' });
          return;
        }

        // Verify user has this role
        const hasRole = state.currentUser.roleProfiles?.some(
          rp => rp.role === role && rp.isActive
        ) || state.currentUser.role === role;

        if (hasRole) {
          set({ selectedRole: role, error: null });
        } else {
          set({ error: `User does not have role: ${role}` });
        }
      },

      updateUserProfile: (updates: Partial<User>) => {
        const state = get();
        if (!state.currentUser) return;

        set({
          currentUser: {
            ...state.currentUser,
            ...updates
          }
        });
      },

      getRoleProfile: (role: UserRole) => {
        const state = get();
        if (!state.currentUser?.roleProfiles) return null;

        return state.currentUser.roleProfiles.find(
          rp => rp.role === role && rp.isActive
        ) || null;
      },

      getActiveRoles: () => {
        const state = get();
        if (!state.currentUser) return [];

        if (state.currentUser.roleProfiles && state.currentUser.roleProfiles.length > 0) {
          return state.currentUser.roleProfiles
            .filter(rp => rp.isActive)
            .map(rp => rp.role);
        }

        return state.currentUser.role ? [state.currentUser.role] : [];
      },

      clearUser: () => {
        set({
          currentUser: null,
          selectedRole: null,
          error: null
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'user-store',
    }
  )
);
