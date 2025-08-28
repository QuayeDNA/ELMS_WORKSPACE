import { create } from 'zustand';
import { superAdminApi } from '../services/superadmin/superadmin.service';
import { useAuthStore } from './authStore';
import type { SuperAdminState } from '../types/superadmin/superadmin.types';

// Helper function to get token from auth store
const getAuthToken = () => {
  const authStore = useAuthStore.getState();
  return authStore.token;
};

// Helper function to ensure API has current token
const ensureApiToken = () => {
  const token = getAuthToken();
  if (token) {
    superAdminApi.setToken(token);
  }
};

export const useSuperAdminStore = create<SuperAdminState>((set) => ({
  // Initial data
  institutions: [],
  users: [],
  auditLogs: [],
  analytics: null,
  overview: null,
  health: null,

  // Initial loading states
  loading: {
    institutions: false,
    users: false,
    auditLogs: false,
    analytics: false,
    overview: false,
    health: false,
  },

  // Initial error states
  errors: {
    institutions: null,
    users: null,
    auditLogs: null,
    analytics: null,
    overview: null,
    health: null,
  },

  // Actions
  fetchInstitutions: async () => {
    ensureApiToken();
    set(state => ({
      loading: { ...state.loading, institutions: true },
      errors: { ...state.errors, institutions: null }
    }));

    try {
      const institutions = await superAdminApi.getInstitutions();
      set({ institutions });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch institutions';
      set(state => ({
        errors: { ...state.errors, institutions: errorMessage }
      }));
    } finally {
      set(state => ({
        loading: { ...state.loading, institutions: false }
      }));
    }
  },

  fetchUsers: async (params = {}) => {
    ensureApiToken();
    set(state => ({
      loading: { ...state.loading, users: true },
      errors: { ...state.errors, users: null }
    }));

    try {
      const response = await superAdminApi.getUsers(params);
      set({ users: response.data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
      set(state => ({
        errors: { ...state.errors, users: errorMessage }
      }));
    } finally {
      set(state => ({
        loading: { ...state.loading, users: false }
      }));
    }
  },

  fetchAuditLogs: async (params = {}) => {
    ensureApiToken();
    set(state => ({
      loading: { ...state.loading, auditLogs: true },
      errors: { ...state.errors, auditLogs: null }
    }));

    try {
      const response = await superAdminApi.getAuditLogs(params);
      set({ auditLogs: response.data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch audit logs';
      set(state => ({
        errors: { ...state.errors, auditLogs: errorMessage }
      }));
    } finally {
      set(state => ({
        loading: { ...state.loading, auditLogs: false }
      }));
    }
  },

  fetchAnalytics: async (timeframe = '7d') => {
    ensureApiToken();
    set(state => ({
      loading: { ...state.loading, analytics: true },
      errors: { ...state.errors, analytics: null }
    }));

    try {
      const analytics = await superAdminApi.getAnalytics(timeframe);
      set({ analytics });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch analytics';
      set(state => ({
        errors: { ...state.errors, analytics: errorMessage }
      }));
    } finally {
      set(state => ({
        loading: { ...state.loading, analytics: false }
      }));
    }
  },

  fetchOverview: async () => {
    ensureApiToken();
    set(state => ({
      loading: { ...state.loading, overview: true },
      errors: { ...state.errors, overview: null }
    }));

    try {
      const overview = await superAdminApi.getOverview();
      set({ overview });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch overview';
      set(state => ({
        errors: { ...state.errors, overview: errorMessage }
      }));
    } finally {
      set(state => ({
        loading: { ...state.loading, overview: false }
      }));
    }
  },

  fetchHealth: async () => {
    ensureApiToken();
    set(state => ({
      loading: { ...state.loading, health: true },
      errors: { ...state.errors, health: null }
    }));

    try {
      const health = await superAdminApi.getHealth();
      set({ health });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch health';
      set(state => ({
        errors: { ...state.errors, health: errorMessage }
      }));
    } finally {
      set(state => ({
        loading: { ...state.loading, health: false }
      }));
    }
  },

  createInstitution: async (data) => {
    ensureApiToken();
    const institution = await superAdminApi.createInstitution(data);
    set(state => ({
      institutions: [...state.institutions, institution]
    }));
    return institution;
  },

  updateInstitution: async (id, data) => {
    ensureApiToken();
    const institution = await superAdminApi.updateInstitution(id, data);
    set(state => ({
      institutions: state.institutions.map(inst =>
        inst.id === id ? institution : inst
      )
    }));
    return institution;
  },

  deleteInstitution: async (id) => {
    ensureApiToken();
    await superAdminApi.deleteInstitution(id);
    set(state => ({
      institutions: state.institutions.filter(inst => inst.id !== id)
    }));
  },

  createUser: async (data) => {
    ensureApiToken();
    const user = await superAdminApi.createUser(data);
    set(state => ({
      users: [...state.users, user]
    }));
    return user;
  },

  updateUser: async (id, data) => {
    ensureApiToken();
    const user = await superAdminApi.updateUser(id, data);
    set(state => ({
      users: state.users.map(u => u.id === id ? user : u)
    }));
    return user;
  },

  toggleUserStatus: async (id, isActive) => {
    ensureApiToken();
    const user = await superAdminApi.toggleUserStatus(id, isActive);
    set(state => ({
      users: state.users.map(u => u.id === id ? user : u)
    }));
    return user;
  },

  deleteUser: async (id) => {
    ensureApiToken();
    await superAdminApi.deleteUser(id);
    set(state => ({
      users: state.users.filter(u => u.id !== id)
    }));
  },

  updateConfiguration: async (configurations) => {
    ensureApiToken();
    await superAdminApi.updateConfiguration(configurations);
  },

  // Utility actions
  clearErrors: () => {
    set({
      errors: {
        institutions: null,
        users: null,
        auditLogs: null,
        analytics: null,
        overview: null,
        health: null,
      }
    });
  },

  setLoading: (key, loading) => {
    set(state => ({
      loading: { ...state.loading, [key]: loading }
    }));
  },

  setError: (key, error) => {
    set(state => ({
      errors: { ...state.errors, [key]: error }
    }));
  },
}));
