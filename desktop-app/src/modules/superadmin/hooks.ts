import { useState, useCallback } from 'react';
import { useCachedQuery } from '../../hooks/useCachedQuery';
import { superAdminApi } from './api';
import type {
  Institution,
  User,
  CreateInstitutionData,
  UpdateInstitutionData,
  CreateUserData,
  UpdateUserData,
  UseSuperAdminOptions,
  SuperAdminFilters,
  ConfigurationItem
} from './types';

// Hook for managing superadmin API token
export function useSuperAdminToken() {
  const setToken = useCallback((token: string | null) => {
    superAdminApi.setToken(token);
  }, []);

  return { setToken };
}

// Institutions hooks
export function useInstitutions(options: UseSuperAdminOptions = {}) {
  const { enabled = true } = options;

  return useCachedQuery(
    'superadmin-institutions',
    () => superAdminApi.getInstitutions(),
    { enabled }
  );
}

export function useCreateInstitution() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInstitution = useCallback(async (data: CreateInstitutionData): Promise<Institution | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await superAdminApi.createInstitution(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create institution';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createInstitution, loading, error };
}

export function useUpdateInstitution() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateInstitution = useCallback(async (id: string, data: UpdateInstitutionData): Promise<Institution | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await superAdminApi.updateInstitution(id, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update institution';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateInstitution, loading, error };
}

export function useDeleteInstitution() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteInstitution = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await superAdminApi.deleteInstitution(id);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete institution';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteInstitution, loading, error };
}

// Users hooks
export function useUsers(filters: SuperAdminFilters = {}, options: UseSuperAdminOptions = {}) {
  const { enabled = true } = options;

  const queryKey = `superadmin-users-${JSON.stringify(filters)}`;

  return useCachedQuery(
    queryKey,
    () => superAdminApi.getUsers(filters),
    { enabled }
  );
}

export function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = useCallback(async (data: CreateUserData): Promise<User | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await superAdminApi.createUser(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createUser, loading, error };
}

export function useUpdateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = useCallback(async (id: string, data: UpdateUserData): Promise<User | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await superAdminApi.updateUser(id, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateUser, loading, error };
}

export function useToggleUserStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleUserStatus = useCallback(async (id: string, isActive: boolean): Promise<User | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await superAdminApi.toggleUserStatus(id, isActive);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user status';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { toggleUserStatus, loading, error };
}

export function useDeleteUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUser = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await superAdminApi.deleteUser(id);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteUser, loading, error };
}

// Audit logs hook
export function useAuditLogs(filters: SuperAdminFilters = {}, options: UseSuperAdminOptions = {}) {
  const { enabled = true } = options;

  const queryKey = `superadmin-audit-logs-${JSON.stringify(filters)}`;

  return useCachedQuery(
    queryKey,
    () => superAdminApi.getAuditLogs(filters),
    { enabled }
  );
}

// Analytics hook
export function useAnalytics(timeframe = '7d', options: UseSuperAdminOptions = {}) {
  const { enabled = true } = options;

  const queryKey = `superadmin-analytics-${timeframe}`;

  return useCachedQuery(
    queryKey,
    () => superAdminApi.getAnalytics(timeframe),
    { enabled }
  );
}

// System overview hook
export function useSystemOverview(options: UseSuperAdminOptions = {}) {
  const { enabled = true } = options;

  return useCachedQuery(
    'superadmin-overview',
    () => superAdminApi.getOverview(),
    { enabled }
  );
}

// System health hook
export function useSystemHealth(options: UseSuperAdminOptions = {}) {
  const { enabled = true } = options;

  return useCachedQuery(
    'superadmin-health',
    () => superAdminApi.getHealth(),
    { enabled }
  );
}

// Configuration hook
export function useUpdateConfiguration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateConfiguration = useCallback(async (configurations: ConfigurationItem[]): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await superAdminApi.updateConfiguration(configurations);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update configuration';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateConfiguration, loading, error };
}
