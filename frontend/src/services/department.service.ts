import { BaseService } from './base.service';
import { ApiResponse } from '@/types/shared/api';
import { API_ENDPOINTS } from '@/utils/constants';
import {
  Department,
  DepartmentListResponse,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentQuery,
  DepartmentAnalytics,
  DepartmentProgramsResponse,
  DepartmentInstructorsResponse,
  DepartmentStudentsResponse,
} from '@/types/shared';

/**
 * Department Service
 * Handles all department-related API operations
 */
class DepartmentService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.DEPARTMENTS.BASE);
  }

  // ========================================
  // CORE CRUD OPERATIONS
  // ========================================

  /**
   * Get all departments with pagination and filtering
   */
  async getDepartments(query?: DepartmentQuery): Promise<ApiResponse<DepartmentListResponse>> {
    return this.getPaginated<Department>(query);
  }

  /**
   * Get single department by ID
   */
  async getDepartmentById(id: number): Promise<ApiResponse<Department>> {
    return this.getById<Department>(id);
  }

  /**
   * Create new department
   */
  async createDepartment(data: CreateDepartmentRequest): Promise<ApiResponse<Department>> {
    this.validateRequired(data, ['name', 'code', 'facultyId']);
    return this.create<Department, CreateDepartmentRequest>(data);
  }

  /**
   * Update department
   */
  async updateDepartment(
    id: number,
    data: UpdateDepartmentRequest
  ): Promise<ApiResponse<Department>> {
    return this.update<Department, UpdateDepartmentRequest>(id, data);
  }

  /**
   * Delete department
   */
  async deleteDepartment(id: number): Promise<ApiResponse<void>> {
    return this.delete(id);
  }

  // ========================================
  // SPECIALIZED OPERATIONS
  // ========================================

  /**
   * Get departments by faculty
   */
  async getDepartmentsByFaculty(
    facultyId: number,
    query?: Omit<DepartmentQuery, 'facultyId'>
  ): Promise<ApiResponse<DepartmentListResponse>> {
    const fullQuery = { ...query, facultyId };
    return this.getDepartments(fullQuery);
  }

  /**
   * Get department analytics
   */
  async getDepartmentAnalytics(
    facultyId?: number
  ): Promise<ApiResponse<DepartmentAnalytics>> {
    const params = facultyId ? { facultyId } : undefined;
    return this.getStats<DepartmentAnalytics>('/analytics', params);
  }

  /**
   * Get programs offered by department
   */
  async getDepartmentPrograms(
    departmentId: number,
    query?: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
    }
  ): Promise<ApiResponse<DepartmentProgramsResponse>> {
    try {
      const url = this.buildUrl(`${this.endpoint}/${departmentId}/programs`, query);
      return await this.apiService.get<DepartmentProgramsResponse>(url);
    } catch (error) {
      console.error(`Error fetching programs for department ${departmentId}:`, error);
      throw error;
    }
  }

  /**
   * Get instructors in department
   */
  async getDepartmentInstructors(
    departmentId: number,
    query?: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
    }
  ): Promise<ApiResponse<DepartmentInstructorsResponse>> {
    try {
      const url = this.buildUrl(`${this.endpoint}/${departmentId}/instructors`, query);
      return await this.apiService.get<DepartmentInstructorsResponse>(url);
    } catch (error) {
      console.error(`Error fetching instructors for department ${departmentId}:`, error);
      throw error;
    }
  }

  /**
   * Get students in department
   */
  async getDepartmentStudents(
    departmentId: number,
    query?: {
      page?: number;
      limit?: number;
      search?: string;
      level?: string;
    }
  ): Promise<ApiResponse<DepartmentStudentsResponse>> {
    try {
      const url = this.buildUrl(`${this.endpoint}/${departmentId}/students`, query);
      return await this.apiService.get<DepartmentStudentsResponse>(url);
    } catch (error) {
      console.error(`Error fetching students for department ${departmentId}:`, error);
      throw error;
    }
  }

  /**
   * Export departments data
   */
  async exportDepartments(
    filters: DepartmentQuery = {},
    format: 'csv' | 'excel' = 'csv'
  ): Promise<Blob> {
    return this.export(filters, format);
  }
}

export const departmentService = new DepartmentService();
export default departmentService;
