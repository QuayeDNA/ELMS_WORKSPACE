import { useState, useEffect, useCallback } from 'react';
import { studentService } from '@/services/student.service';
import { usePermissions, useDataScope } from './usePermissions';
import {
  Student,
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentFilters,
  StudentStats,
  BulkStudentImport
} from '@/types/student';

export const useStudents = (initialFilters: StudentFilters = {}) => {
  const [students, setStudents] = useState<Student[]>([]);
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

  // Check if user can view students
  if (!permissions.canViewStudents) {
    throw new Error('Access denied: You do not have permission to view students');
  }

  const fetchStudents = useCallback(async (customFilters: StudentFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Apply scope-based filters fresh each time to avoid stale closures
      const scopeFilters = getDataFilters();
      const combinedFilters = { ...initialFilters, ...customFilters, ...scopeFilters };

      const response = await studentService.getStudents(combinedFilters);
      setStudents(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [initialFilters, getDataFilters]);

  // Only fetch once on mount - remove the problematic dependencies
  useEffect(() => {
    let isMounted = true;
    
    const initialFetch = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        setError(null);

        const scopeFilters = getDataFilters();
        const combinedFilters = { ...initialFilters, ...scopeFilters };
        const response = await studentService.getStudents(combinedFilters);
        
        if (isMounted) {
          setStudents(response.data);
          setPagination(response.pagination);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch students');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initialFetch();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount (avoid infinite loops)

  const createStudent = useCallback(async (studentData: CreateStudentRequest): Promise<Student> => {
    if (!permissions.canCreateStudents) {
      throw new Error('Access denied: You do not have permission to create students');
    }

    try {
      const newStudent = await studentService.createStudent(studentData);
      await fetchStudents(); // Refresh the list
      return newStudent;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create student');
    }
  }, [permissions.canCreateStudents, fetchStudents]);

  const updateStudent = useCallback(async (id: number, updates: UpdateStudentRequest): Promise<Student> => {
    if (!permissions.canUpdateStudents) {
      throw new Error('Access denied: You do not have permission to update students');
    }

    try {
      const updatedStudent = await studentService.updateStudent(id, updates);
      await fetchStudents(); // Refresh the list
      return updatedStudent;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update student');
    }
  }, [permissions.canUpdateStudents, fetchStudents]);

  const deleteStudent = useCallback(async (id: number): Promise<void> => {
    if (!permissions.canDeleteStudents) {
      throw new Error('Access denied: You do not have permission to delete students');
    }

    try {
      await studentService.deleteStudent(id);
      await fetchStudents(); // Refresh the list
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete student');
    }
  }, [permissions.canDeleteStudents, fetchStudents]);

  const bulkImportStudents = useCallback(async (importData: BulkStudentImport) => {
    if (!permissions.canBulkImportStudents) {
      throw new Error('Access denied: You do not have permission to bulk import students');
    }

    try {
      const result = await studentService.bulkImportStudents(importData);
      await fetchStudents(); // Refresh the list
      return result;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to import students');
    }
  }, [permissions.canBulkImportStudents, fetchStudents]);

  const exportStudents = useCallback(async (filters: StudentFilters = {}, format: 'csv' | 'excel' = 'csv') => {
    if (!permissions.canExportStudents) {
      throw new Error('Access denied: You do not have permission to export students');
    }

    try {
      const scopeFilters = getDataFilters();
      const combinedFilters = { ...filters, ...scopeFilters };
      return await studentService.exportStudents(combinedFilters, format);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to export students');
    }
  }, [permissions.canExportStudents, getDataFilters]);

  return {
    students,
    loading,
    error,
    pagination,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    bulkImportStudents,
    exportStudents,
    permissions: {
      canCreate: permissions.canCreateStudents,
      canUpdate: permissions.canUpdateStudents,
      canDelete: permissions.canDeleteStudents,
      canBulkImport: permissions.canBulkImportStudents,
      canExport: permissions.canExportStudents,
    },
  };
};

export const useStudentById = (id: number) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const permissions = usePermissions();

  if (!permissions.canViewStudents) {
    throw new Error('Access denied: You do not have permission to view students');
  }

  const fetchStudent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const studentData = await studentService.getStudentById(id);
      setStudent(studentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch student');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchStudent();
    }
  }, [id, fetchStudent]);

  return {
    student,
    loading,
    error,
    refetch: fetchStudent,
  };
};

export const useStudentStats = (filters: Partial<StudentFilters> = {}) => {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const permissions = usePermissions();
  const { getDataFilters } = useDataScope();

  if (!permissions.canViewStudentStats) {
    throw new Error('Access denied: You do not have permission to view student statistics');
  }

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const scopeFilters = getDataFilters();
      const combinedFilters = { ...filters, ...scopeFilters };

      const statsData = await studentService.getStudentStats(combinedFilters);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch student statistics');
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
