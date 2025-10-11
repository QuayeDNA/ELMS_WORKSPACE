import { BaseService } from './base.service';
import { API_ENDPOINTS } from '@/utils/constants';
import {
  Instructor,
  InstructorsResponse,
  CreateInstructorRequest,
  UpdateInstructorRequest,
  InstructorFilters,
  DepartmentAssignment,
  InstructorStats,
  InstructorWorkload,
  BulkInstructorImportResponse,
} from '@/types/instructor';

/**
 * Instructor Service
 * Handles all instructor-related API operations
 */
class InstructorService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.INSTRUCTORS.BASE);
  }

  // ========================================
  // CORE CRUD OPERATIONS
  // ========================================

  /**
   * Get all instructors with pagination and filtering
   */
  async getInstructors(filters: InstructorFilters = {}): Promise<InstructorsResponse> {
    try {
      const response = await this.getPaginated<Instructor>(filters);

      // Transform response to match expected InstructorsResponse format
      if (response.success && response.data) {
        return {
          success: true,
          data: {
            instructors: response.data.data,
            pagination: response.data.pagination,
          },
          message: response.message,
        };
      }

      throw new Error(response.message || 'Failed to fetch instructors');
    } catch (error) {
      console.error('Error fetching instructors:', error);
      throw error;
    }
  }

  /**
   * Get single instructor by ID
   */
  async getInstructorById(id: number): Promise<Instructor> {
    try {
      const response = await this.getById<Instructor>(id);

      if (!response.data) {
        throw new Error('Instructor not found');
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching instructor ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new instructor
   */
  async createInstructor(data: CreateInstructorRequest): Promise<Instructor> {
    this.validateRequired(data, ['firstName', 'lastName', 'email', 'departmentId']);
    this.validateInstructorData(data);

    try {
      const response = await this.create<Instructor, CreateInstructorRequest>(data);

      if (!response.data) {
        throw new Error('Failed to create instructor');
      }

      return response.data;
    } catch (error) {
      console.error('Error creating instructor:', error);
      throw error;
    }
  }

  /**
   * Update instructor
   */
  async updateInstructor(
    id: number,
    data: UpdateInstructorRequest
  ): Promise<Instructor> {
    try {
      const response = await this.update<Instructor, UpdateInstructorRequest>(id, data);

      if (!response.data) {
        throw new Error('Failed to update instructor');
      }

      return response.data;
    } catch (error) {
      console.error(`Error updating instructor ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete instructor
   */
  async deleteInstructor(id: number): Promise<void> {
    try {
      await this.delete(id);
    } catch (error) {
      console.error(`Error deleting instructor ${id}:`, error);
      throw error;
    }
  }

  // ========================================
  // SPECIALIZED OPERATIONS
  // ========================================

  /**
   * Get instructors by department
   */
  async getInstructorsByDepartment(
    departmentId: number,
    filters: Partial<InstructorFilters> = {}
  ): Promise<InstructorsResponse> {
    return this.getInstructors({ ...filters, departmentId });
  }

  /**
   * Get instructors by academic rank
   */
  async getInstructorsByRank(
    academicRank: string,
    filters: Partial<InstructorFilters> = {}
  ): Promise<InstructorsResponse> {
    return this.getInstructors({
      ...filters,
      academicRank: academicRank as InstructorFilters['academicRank'],
    });
  }

  /**
   * Get instructor workload
   */
  async getInstructorWorkload(id: number): Promise<InstructorWorkload> {
    try {
      const response = await this.apiService.get<InstructorWorkload>(
        `${this.endpoint}/${id}/workload`
      );

      if (!response.data) {
        throw new Error('Failed to fetch instructor workload');
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching instructor workload ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update instructor department assignments
   */
  async updateDepartmentAssignments(
    id: number,
    assignments: DepartmentAssignment[]
  ): Promise<Instructor> {
    try {
      const response = await this.apiService.put<Instructor>(
        `${this.endpoint}/${id}/departments`,
        { assignments }
      );

      if (!response.data) {
        throw new Error('Failed to update department assignments');
      }

      return response.data;
    } catch (error) {
      console.error(`Error updating department assignments for instructor ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get instructor statistics
   */
  async getInstructorStats(
    filters: Partial<InstructorFilters> = {}
  ): Promise<InstructorStats> {
    try {
      const response = await this.getStats<InstructorStats>('/stats', filters);

      if (!response.data) {
        throw new Error('Failed to fetch instructor stats');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching instructor stats:', error);
      throw error;
    }
  }

  /**
   * Export instructors data
   */
  async exportInstructors(
    filters: InstructorFilters = {},
    format: 'csv' | 'excel' = 'csv'
  ): Promise<Blob> {
    return this.export(filters, format);
  }

  /**
   * Bulk import instructors
   */
  async bulkImportInstructors(
    instructors: CreateInstructorRequest[]
  ): Promise<BulkInstructorImportResponse> {
    try {
      const response = await this.bulkOperation<BulkInstructorImportResponse, CreateInstructorRequest[]>(
        'bulk-import',
        instructors
      );

      if (!response.data) {
        throw new Error('Failed to bulk import instructors');
      }

      return response.data;
    } catch (error) {
      console.error('Error bulk importing instructors:', error);
      throw error;
    }
  }

  // ========================================
  // VALIDATION HELPERS
  // ========================================

  private validateInstructorData(data: CreateInstructorRequest): void {
    if (!this.isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    if (data.phone && !this.isValidPhone(data.phone)) {
      throw new Error('Invalid phone number format');
    }

    if (data.dateOfBirth && new Date(data.dateOfBirth) > new Date()) {
      throw new Error('Date of birth cannot be in the future');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[+]?[\d\s\-\\()]{10,}$/;
    return phoneRegex.test(phone);
  }
}

export const instructorService = new InstructorService();
export default instructorService;
