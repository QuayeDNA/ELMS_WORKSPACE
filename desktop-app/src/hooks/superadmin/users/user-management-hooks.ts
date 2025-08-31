import { useState, useEffect, useCallback, useMemo } from 'react';
import { userManagementService } from '../../../services/superadmin/users/user-management-service';
import { realTimeService } from '../../../services/realTimeService';
import { useAuthStore } from '../../../stores/authStore';
import {
  InstitutionResponse,
  UserSummary,
  GetUsersRequest,
  UserManagementEvents,
  CreateInstitutionRequest,
  UpdateInstitutionRequest,
  SocketEventData,
  UserStats
} from '../../../types/superadmin/users/user-management-types';

/**
 * Hook for managing institutions
 */
export function useInstitutions() {
  const [institutions, setInstitutions] = useState<InstitutionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  const fetchInstitutions = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError(null);
      const data = await userManagementService.getInstitutions();
      setInstitutions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch institutions';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const createInstitution = useCallback(async (institutionData: CreateInstitutionRequest) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    try {
      setLoading(true);
      const newInstitution = await userManagementService.createInstitution(institutionData);
      setInstitutions(prev => [...prev, newInstitution]);
      return newInstitution;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create institution';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const updateInstitution = useCallback(async (id: string, institutionData: UpdateInstitutionRequest) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    try {
      setLoading(true);
      const updatedInstitution = await userManagementService.updateInstitution(id, institutionData);
      setInstitutions(prev =>
        prev.map(inst => inst.id === id ? updatedInstitution : inst)
      );
      return updatedInstitution;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update institution';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const deleteInstitution = useCallback(async (id: string) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    try {
      setLoading(true);
      await userManagementService.deleteInstitution(id);
      setInstitutions(prev => prev.filter(inst => inst.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete institution';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchInstitutions();
    }
  }, [fetchInstitutions, isAuthenticated]);

  // Real-time updates
  useEffect(() => {
    const handleInstitutionCreated = (event: { type: string; data: unknown; timestamp: Date }) => {
      const eventData = event.data as SocketEventData[UserManagementEvents.INSTITUTION_CREATED];
      // Create a full InstitutionResponse from the event data
      const newInstitution: InstitutionResponse = {
          id: eventData.institution.id,
          name: eventData.institution.name,
          type: eventData.institution.type,
          category: eventData.institution.category,
          createdAt: eventData.timestamp,
          updatedAt: eventData.timestamp,
          isActive: false
      };
      setInstitutions(prev => [...prev, newInstitution]);
    };

    const handleInstitutionUpdated = (event: { type: string; data: unknown; timestamp: Date }) => {
      const eventData = event.data as SocketEventData[UserManagementEvents.INSTITUTION_UPDATED];
      setInstitutions(prev =>
        prev.map(inst =>
          inst.id === eventData.institution.id
            ? {
                ...inst,
                ...eventData.institution,
                updatedAt: eventData.timestamp
              }
            : inst
        )
      );
    };

    const handleInstitutionDeleted = (event: { type: string; data: unknown; timestamp: Date }) => {
      const eventData = event.data as SocketEventData[UserManagementEvents.INSTITUTION_DELETED];
      setInstitutions(prev => prev.filter(inst => inst.id !== eventData.institutionId));
    };

    const unsubscribeCreated = realTimeService.on(UserManagementEvents.INSTITUTION_CREATED, handleInstitutionCreated);
    const unsubscribeUpdated = realTimeService.on(UserManagementEvents.INSTITUTION_UPDATED, handleInstitutionUpdated);
    const unsubscribeDeleted = realTimeService.on(UserManagementEvents.INSTITUTION_DELETED, handleInstitutionDeleted);

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
    };
  }, []);

  return {
    institutions,
    loading,
    error,
    fetchInstitutions,
    createInstitution,
    updateInstitution,
    deleteInstitution,
    clearError: () => setError(null)
  };
}

/**
 * Hook for managing users with pagination and filtering
 */
export function useUsers(institutionId?: string) {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState<GetUsersRequest>({});
  const { isAuthenticated } = useAuthStore();

  const fetchUsers = useCallback(async (query: GetUsersRequest = {}) => {
    if (!isAuthenticated || institutionId === undefined) return;
    try {
      setLoading(true);
      setError(null);

      const validatedQuery = {
        ...query,
        institutionId,
        page: query.page || 1,
        limit: query.limit || 10
      };

      const response = await userManagementService.getUsersByInstitution(validatedQuery);

      setUsers(response.users);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: Math.ceil(response.total / response.limit)
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [institutionId, isAuthenticated]);

  const updateUserStatus = useCallback(async (userId: string, status: 'ACTIVE' | 'INACTIVE') => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    try {
      await userManagementService.updateUserStatus({ userId, status });
      setUsers(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, status } : user
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update user status';
      setError(message);
      throw err;
    }
  }, [isAuthenticated]);

  const bulkUpdateUsers = useCallback(async (userIds: string[], action: 'ACTIVATE' | 'DEACTIVATE') => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    try {
      await userManagementService.bulkUpdateUsers({ userIds, action });
      const newStatus = action === 'ACTIVATE' ? 'ACTIVE' : 'INACTIVE';
      setUsers(prev =>
        prev.map(user =>
          userIds.includes(user.id) ? { ...user, status: newStatus } : user
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update users';
      setError(message);
      throw err;
    }
  }, [isAuthenticated]);

  const searchUsers = useCallback(async (searchTerm: string) => {
    if (institutionId === undefined) return;
    if (searchTerm.trim()) {
      await fetchUsers({ ...filters, search: searchTerm.trim() });
    } else {
      await fetchUsers({ ...filters, search: undefined });
    }
  }, [filters, fetchUsers, institutionId]);

  const changePage = useCallback(async (page: number) => {
    if (institutionId === undefined) return;
    await fetchUsers({ ...filters, page });
  }, [filters, fetchUsers, institutionId]);

  const changeFilters = useCallback(async (newFilters: Partial<GetUsersRequest>) => {
    if (institutionId === undefined) return;
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    await fetchUsers(updatedFilters);
  }, [filters, fetchUsers, institutionId]);

  useEffect(() => {
    if (isAuthenticated && institutionId !== undefined) {
      fetchUsers();
    }
  }, [fetchUsers, isAuthenticated, institutionId]);

  // Real-time updates
  useEffect(() => {
    const updateUserStatus = (userId: string, newStatus: 'ACTIVE' | 'INACTIVE') => {
      setUsers(prevUsers => {
        const updated = [];
        for (const user of prevUsers) {
          if (user.id === userId) {
            updated.push({ ...user, status: newStatus });
          } else {
            updated.push(user);
          }
        }
        return updated;
      });
    };

    const updateBulkUsers = (userIds: string[], newStatus: 'ACTIVE' | 'INACTIVE') => {
      setUsers(prevUsers => {
        const updated = [];
        for (const user of prevUsers) {
          if (userIds.includes(user.id)) {
            updated.push({ ...user, status: newStatus });
          } else {
            updated.push(user);
          }
        }
        return updated;
      });
    };

    const handleUserStatusUpdated = (event: { type: string; data: unknown; timestamp: Date }) => {
      const eventData = event.data as SocketEventData[UserManagementEvents.USER_STATUS_UPDATED];
      updateUserStatus(eventData.userId, eventData.newStatus as 'ACTIVE' | 'INACTIVE');
    };

    const handleUsersBulkUpdated = (event: { type: string; data: unknown; timestamp: Date }) => {
      const eventData = event.data as SocketEventData[UserManagementEvents.USERS_BULK_UPDATED];
      const newStatus = eventData.action === 'ACTIVATE' ? 'ACTIVE' : 'INACTIVE';
      updateBulkUsers(eventData.userIds, newStatus);
    };

    const unsubscribeStatus = realTimeService.on(UserManagementEvents.USER_STATUS_UPDATED, handleUserStatusUpdated);
    const unsubscribeBulk = realTimeService.on(UserManagementEvents.USERS_BULK_UPDATED, handleUsersBulkUpdated);

    return () => {
      unsubscribeStatus();
      unsubscribeBulk();
    };
  }, []);

  return {
    users,
    loading,
    error,
    pagination,
    filters,
    fetchUsers,
    updateUserStatus,
    bulkUpdateUsers,
    searchUsers,
    changePage,
    changeFilters,
    clearError: () => setError(null)
  };
}

/**
 * Hook for user management statistics
 */
export function useUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError(null);
      // Mock data for now - replace with actual API call when backend is ready
      const mockStats: UserStats = {
        totalUsers: 1250,
        activeUsers: 980,
        inactiveUsers: 270,
        pendingUsers: 45,
        newUsersToday: 12,
        newUsersThisWeek: 89,
        newUsersThisMonth: 234,
        userGrowthRate: 15.5,
        averageSessionDuration: 45,
        topInstitutionByUsers: {
          name: 'University of Ghana',
          userCount: 450
        },
        usersByRole: {
          admin: 25,
          examiner: 120,
          student: 980,
          invigilator: 125
        },
        recentActivity: [
          {
            id: '1',
            type: 'login',
            userEmail: 'john.doe@university.edu',
            timestamp: new Date().toISOString(),
            details: 'Logged in from Chrome'
          },
          {
            id: '2',
            type: 'created',
            userEmail: 'jane.smith@university.edu',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            details: 'Account created'
          }
        ]
      };
      setStats(mockStats);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch user statistics';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [fetchStats, isAuthenticated]);

  return {
    stats,
    loading,
    error,
    fetchStats,
    clearError: () => setError(null)
  };
}

/**
 * Combined hook for complete user management state
 */
export function useUserManagement(institutionId?: string) {
  const institutions = useInstitutions();
  const users = useUsers(institutionId);
  const stats = useUserStats();

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const toggleUserSelection = useCallback((userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const selectAllUsers = useCallback(() => {
    setSelectedUsers(users.users.map(user => user.id));
  }, [users.users]);

  const clearSelection = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  const bulkUpdateSelectedUsers = useCallback(async (action: 'ACTIVATE' | 'DEACTIVATE') => {
    if (selectedUsers.length === 0) return;

    try {
      await users.bulkUpdateUsers(selectedUsers, action);
      clearSelection();
    } catch (err) {
      console.error('Failed to perform bulk update:', err);
      // Error is already handled in the users hook
    }
  }, [selectedUsers, users, clearSelection]);

  // Memoized computed values
  const selectedUsersData = useMemo(() =>
    users.users.filter(user => selectedUsers.includes(user.id)),
    [users.users, selectedUsers]
  );

  const hasSelection = selectedUsers.length > 0;
  const allSelected = users.users.length > 0 && selectedUsers.length === users.users.length;

  return {
    // Institution management
    institutions: institutions.institutions,
    institutionsLoading: institutions.loading,
    institutionsError: institutions.error,
    createInstitution: institutions.createInstitution,
    updateInstitution: institutions.updateInstitution,
    deleteInstitution: institutions.deleteInstitution,

    // User management
    users: users.users,
    usersLoading: users.loading,
    usersError: users.error,
    pagination: users.pagination,
    filters: users.filters,
    updateUserStatus: users.updateUserStatus,
    bulkUpdateUsers: users.bulkUpdateUsers,
    searchUsers: users.searchUsers,
    changePage: users.changePage,
    changeFilters: users.changeFilters,

    // Statistics
    stats: stats.stats,
    statsLoading: stats.loading,
    statsError: stats.error,

    // Selection management
    selectedUsers,
    selectedUsersData,
    hasSelection,
    allSelected,
    toggleUserSelection,
    selectAllUsers,
    clearSelection,
    bulkUpdateSelectedUsers,

    // Utility functions
    clearErrors: () => {
      institutions.clearError();
      users.clearError();
      stats.clearError();
    }
  };
}
