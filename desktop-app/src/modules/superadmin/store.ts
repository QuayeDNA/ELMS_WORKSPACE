import { create } from 'zustand';
import { superAdminApi } from './api';
import type { SuperAdminState } from './types';

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
    const institution = await superAdminApi.createInstitution(data);
    set(state => ({
      institutions: [...state.institutions, institution]
    }));
    return institution;
  },

  updateInstitution: async (id, data) => {
    const institution = await superAdminApi.updateInstitution(id, data);
    set(state => ({
      institutions: state.institutions.map(inst =>
        inst.id === id ? institution : inst
      )
    }));
    return institution;
  },

  deleteInstitution: async (id) => {
    await superAdminApi.deleteInstitution(id);
    set(state => ({
      institutions: state.institutions.filter(inst => inst.id !== id)
    }));
  },

  createUser: async (data) => {
    const user = await superAdminApi.createUser(data);
    set(state => ({
      users: [...state.users, user]
    }));
    return user;
  },

  updateUser: async (id, data) => {
    const user = await superAdminApi.updateUser(id, data);
    set(state => ({
      users: state.users.map(u => u.id === id ? user : u)
    }));
    return user;
  },

  toggleUserStatus: async (id, isActive) => {
    const user = await superAdminApi.toggleUserStatus(id, isActive);
    set(state => ({
      users: state.users.map(u => u.id === id ? user : u)
    }));
    return user;
  },

  deleteUser: async (id) => {
    await superAdminApi.deleteUser(id);
    set(state => ({
      users: state.users.filter(u => u.id !== id)
    }));
  },

  updateConfiguration: async (configurations) => {
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
