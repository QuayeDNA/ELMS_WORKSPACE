import { useState, useEffect, useCallback } from 'react';
import { instructorService } from '@/services/instructor.service';
import { usePermissions, useDataScope } from './usePermissions';
import {
  Instructor,
  CreateInstructorRequest,
  UpdateInstructorRequest,
  InstructorFilters,
  InstructorStats,
  InstructorWorkload,
  DepartmentAssignment
} from '@/types/instructor';

export const useInstructors = (initialFilters: InstructorFilters = {}) => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const permissions = usePermissions();
  const { getDataFilters } = useDataScope();

  // Check if user can view instructors
  if (!permissions.canViewInstructors) {
    throw new Error('Access denied: You do not have permission to view instructors');
  }

  const fetchInstructors = useCallback(async (filters: InstructorFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Apply scope-based filters
      const scopeFilters = getDataFilters();
      const combinedFilters = { ...initialFilters, ...filters, ...scopeFilters };

      const response = await instructorService.getInstructors(combinedFilters);
      setInstructors(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch instructors');
    } finally {
      setLoading(false);
    }
  }, [initialFilters, getDataFilters]);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const createInstructor = useCallback(async (instructorData: CreateInstructorRequest): Promise<Instructor> => {
    if (!permissions.canCreateInstructors) {
      throw new Error('Access denied: You do not have permission to create instructors');
    }

    try {
      const newInstructor = await instructorService.createInstructor(instructorData);
      await fetchInstructors(); // Refresh the list
      return newInstructor;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create instructor');
    }
  }, [permissions.canCreateInstructors, fetchInstructors]);

  const updateInstructor = useCallback(async (id: number, updates: UpdateInstructorRequest): Promise<Instructor> => {
    if (!permissions.canUpdateInstructors) {
      throw new Error('Access denied: You do not have permission to update instructors');
    }

    try {
      const updatedInstructor = await instructorService.updateInstructor(id, updates);
      await fetchInstructors(); // Refresh the list
      return updatedInstructor;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update instructor');
    }
  }, [permissions.canUpdateInstructors, fetchInstructors]);

  const deleteInstructor = useCallback(async (id: number): Promise<void> => {
    if (!permissions.canDeleteInstructors) {
      throw new Error('Access denied: You do not have permission to delete instructors');
    }

    try {
      await instructorService.deleteInstructor(id);
      await fetchInstructors(); // Refresh the list
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete instructor');
    }
  }, [permissions.canDeleteInstructors, fetchInstructors]);

  const assignToDepartment = useCallback(async (id: number, assignment: DepartmentAssignment): Promise<Instructor> => {
    if (!permissions.canAssignInstructorDepartments) {
      throw new Error('Access denied: You do not have permission to assign instructor departments');
    }

    try {
      const updatedInstructor = await instructorService.assignToDepartment(id, assignment);
      await fetchInstructors(); // Refresh the list
      return updatedInstructor;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to assign instructor to department');
    }
  }, [permissions.canAssignInstructorDepartments, fetchInstructors]);

  const removeFromDepartment = useCallback(async (id: number, departmentId: number): Promise<Instructor> => {
    if (!permissions.canAssignInstructorDepartments) {
      throw new Error('Access denied: You do not have permission to manage instructor departments');
    }

    try {
      const updatedInstructor = await instructorService.removeFromDepartment(id, departmentId);
      await fetchInstructors(); // Refresh the list
      return updatedInstructor;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to remove instructor from department');
    }
  }, [permissions.canAssignInstructorDepartments, fetchInstructors]);

  const updateInstructorStatus = useCallback(async (
    id: number, 
    status: { employmentStatus?: string; employmentType?: string }
  ): Promise<Instructor> => {
    if (!permissions.canUpdateInstructors) {
      throw new Error('Access denied: You do not have permission to update instructor status');
    }

    try {
      const updatedInstructor = await instructorService.updateInstructorStatus(id, status);
      await fetchInstructors(); // Refresh the list
      return updatedInstructor;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update instructor status');
    }
  }, [permissions.canUpdateInstructors, fetchInstructors]);

  const exportInstructors = useCallback(async (filters: InstructorFilters = {}, format: 'csv' | 'excel' = 'csv') => {
    if (!permissions.canExportInstructors) {
      throw new Error('Access denied: You do not have permission to export instructors');
    }

    try {
      const scopeFilters = getDataFilters();
      const combinedFilters = { ...filters, ...scopeFilters };
      return await instructorService.exportInstructors(combinedFilters, format);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to export instructors');
    }
  }, [permissions.canExportInstructors, getDataFilters]);

  return {
    instructors,
    loading,
    error,
    pagination,
    fetchInstructors,
    createInstructor,
    updateInstructor,
    deleteInstructor,
    assignToDepartment,
    removeFromDepartment,
    updateInstructorStatus,
    exportInstructors,
    permissions: {
      canCreate: permissions.canCreateInstructors,
      canUpdate: permissions.canUpdateInstructors,
      canDelete: permissions.canDeleteInstructors,
      canAssignDepartments: permissions.canAssignInstructorDepartments,
      canExport: permissions.canExportInstructors,
    },
  };
};

export const useInstructorById = (id: number) => {
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const permissions = usePermissions();

  if (!permissions.canViewInstructors) {
    throw new Error('Access denied: You do not have permission to view instructors');
  }

  const fetchInstructor = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const instructorData = await instructorService.getInstructorById(id);
      setInstructor(instructorData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch instructor');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchInstructor();
    }
  }, [id, fetchInstructor]);

  return {
    instructor,
    loading,
    error,
    refetch: fetchInstructor,
  };
};

export const useInstructorStats = (filters: Partial<InstructorFilters> = {}) => {
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const permissions = usePermissions();
  const { getDataFilters } = useDataScope();

  if (!permissions.canViewInstructorStats) {
    throw new Error('Access denied: You do not have permission to view instructor statistics');
  }

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const scopeFilters = getDataFilters();
      const combinedFilters = { ...filters, ...scopeFilters };

      const statsData = await instructorService.getInstructorStats(combinedFilters);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch instructor statistics');
    } finally {
      setLoading(false);
    }
  }, [filters, getDataFilters]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

export const useInstructorWorkload = (id: number) => {
  const [workload, setWorkload] = useState<InstructorWorkload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const permissions = usePermissions();

  if (!permissions.canViewInstructorWorkload) {
    throw new Error('Access denied: You do not have permission to view instructor workload');
  }

  const fetchWorkload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const workloadData = await instructorService.getInstructorWorkload(id);
      setWorkload(workloadData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch instructor workload');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchWorkload();
    }
  }, [id, fetchWorkload]);

  return {
    workload,
    loading,
    error,
    refetch: fetchWorkload,
  };
};
