import { BaseService } from './base.service';
import { ApiResponse } from '@/types/shared/api';
import { API_ENDPOINTS } from '@/utils/constants';
import {
  Course,
  CreateCourseData,
  UpdateCourseData,
  CourseQuery,
  CourseListResponse,
  CourseStats,
} from '@/types/course';

/**
 * Course Service
 * Handles all course-related API operations
 */
class CourseService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.COURSES.BASE);
  }

  // ========================================
  // CORE CRUD OPERATIONS
  // ========================================

  /**
   * Get all courses with pagination and filtering
   */
  async getCourses(query?: CourseQuery): Promise<ApiResponse<CourseListResponse>> {
    try {
      const response = await this.getPaginated<Course>(query);

      // Check if the response data indicates an error
      if (
        response.data &&
        typeof response.data === 'object' &&
        'success' in response.data &&
        !response.data.success
      ) {
        const errorData = response.data as { message?: string };
        throw new Error(errorData.message || 'Failed to fetch courses');
      }

      return response;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  /**
   * Get single course by ID
   */
  async getCourseById(id: number): Promise<Course> {
    try {
      const response = await this.getById<Course>(id);

      if (!response.success || !response.data) {
        throw new Error('Course not found');
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching course ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new course
   */
  async createCourse(data: CreateCourseData): Promise<Course> {
    this.validateRequired(data, ['name', 'code', 'departmentId', 'credits']);

    try {
      const response = await this.create<Course, CreateCourseData>(data);

      if (!response.success || !response.data) {
        throw new Error('Failed to create course');
      }

      return response.data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  /**
   * Update course
   */
  async updateCourse(id: number, data: UpdateCourseData): Promise<Course> {
    try {
      const response = await this.update<Course, UpdateCourseData>(id, data);

      if (!response.success || !response.data) {
        throw new Error('Failed to update course');
      }

      return response.data;
    } catch (error) {
      console.error(`Error updating course ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete course
   */
  async deleteCourse(id: number): Promise<void> {
    try {
      const response = await this.delete(id);

      if (!response.success) {
        throw new Error('Failed to delete course');
      }
    } catch (error) {
      console.error(`Error deleting course ${id}:`, error);
      throw error;
    }
  }

  // ========================================
  // SPECIALIZED OPERATIONS
  // ========================================

  /**
   * Get courses by program
   */
  async getCoursesByProgram(
    programId: number,
    query?: {
      page?: number;
      limit?: number;
      search?: string;
      level?: number;
      isActive?: boolean;
    }
  ): Promise<ApiResponse<CourseListResponse>> {
    try {
      const url = this.buildUrl(`/programs/${programId}/courses`, query);
      return await this.apiService.get<CourseListResponse>(url);
    } catch (error) {
      console.error(`Error fetching courses for program ${programId}:`, error);
      throw error;
    }
  }

  /**
   * Get courses by department
   */
  async getCoursesByDepartment(
    departmentId: number,
    query?: Omit<CourseQuery, 'departmentId'>
  ): Promise<ApiResponse<CourseListResponse>> {
    const fullQuery = { ...query, departmentId };
    return this.getCourses(fullQuery);
  }

  /**
   * Get course statistics
   */
  async getCourseStats(
    filters: Partial<CourseQuery> = {}
  ): Promise<ApiResponse<CourseStats>> {
    return this.getStats<CourseStats>('/stats', filters);
  }

  /**
   * Export courses data
   */
  async exportCourses(
    filters: CourseQuery = {},
    format: 'csv' | 'excel' = 'csv'
  ): Promise<Blob> {
    return this.export(filters, format);
  }

  /**
   * Search courses
   */
  async searchCourses(
    searchTerm: string,
    departmentId?: number
  ): Promise<ApiResponse<Course[]>> {
    const additionalParams = departmentId ? { departmentId } : undefined;
    return this.search<Course>(searchTerm, additionalParams);
  }
}

export const courseService = new CourseService();
export default courseService;
