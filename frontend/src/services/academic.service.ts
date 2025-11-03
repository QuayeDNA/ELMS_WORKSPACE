import { BaseService } from './base.service';
import { ApiResponse, PaginatedResponse } from '@/types/shared/api';
import { API_ENDPOINTS } from '@/utils/constants';
import { apiService } from './api';
import {
  AcademicYear,
  Semester,
  AcademicPeriod,
  CreateAcademicYearRequest,
  UpdateAcademicYearRequest,
  AcademicYearQuery,
  CreateSemesterRequest,
  UpdateSemesterRequest,
  SemesterQuery,
  CreateAcademicPeriodRequest,
  UpdateAcademicPeriodRequest,
  AcademicPeriodQuery,
  AcademicPeriodStats,
  AcademicPeriodStatus,
} from '@/types/academic';

/**
 * Academic Service
 * Handles all academic period-related API operations
 *
 * ✅ GET endpoints - Fully implemented
 * ⏳ POST/PUT/DELETE endpoints - Service methods ready, marked as TODO for components
 */
class AcademicService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.ACADEMIC_PERIODS.ACADEMIC_YEARS);
  }

  // ========================================
  // ACADEMIC YEAR OPERATIONS
  // ========================================

  /**
   * ✅ GET - Fetch all academic years with pagination and filtering
   */
  async getAcademicYears(query?: AcademicYearQuery): Promise<ApiResponse<PaginatedResponse<AcademicYear>>> {
    try {
      const url = this.buildUrl(API_ENDPOINTS.ACADEMIC_PERIODS.ACADEMIC_YEARS, query as Record<string, unknown>);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiService.get<any>(url);

      if (!response.success) {
        return {
          success: false,
          data: {
            success: false,
            data: [],
            pagination: { page: 1, totalPages: 1, total: 0, hasNext: false, hasPrev: false },
            error: response.error || 'Failed to fetch academic years'
          }
        };
      }

      if (!response.data) {
        return {
          success: false,
          data: {
            success: false,
            data: [],
            pagination: { page: 1, totalPages: 1, total: 0, hasNext: false, hasPrev: false },
            error: 'No data received from server'
          }
        };
      }

      // Backend returns paginated response with 'pages' field, transform to 'totalPages'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const backendPagination = (response as any).pagination || {};
      const totalPages = backendPagination.pages || backendPagination.totalPages || 1;
      const page = backendPagination.page || query?.page || 1;
      const total = backendPagination.total || response.data.length;

      const paginatedResponse: PaginatedResponse<AcademicYear> = {
        success: response.success,
        message: response.message,
        data: response.data,
        pagination: {
          page,
          totalPages,
          total,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          limit: backendPagination.limit || query?.limit || 10
        }
      };

      // Wrap the paginated response in ApiResponse so the hook can extract it properly
      return {
        success: true,
        data: paginatedResponse
      };
    } catch (error) {
      console.error('Error fetching academic years:', error);
      throw error;
    }
  }  /**
   * ✅ GET - Fetch single academic year by ID
   */
  async getAcademicYearById(id: number): Promise<ApiResponse<AcademicYear>> {
    try {
      return await apiService.get<AcademicYear>(
        API_ENDPOINTS.ACADEMIC_PERIODS.ACADEMIC_YEAR_BY_ID(id)
      );
    } catch (error) {
      console.error(`Error fetching academic year ${id}:`, error);
      throw error;
    }
  }

  /**
   * ✅ GET - Fetch current academic year
   */
  async getCurrentAcademicYear(institutionId?: number): Promise<ApiResponse<AcademicYear>> {
    try {
      const params = institutionId ? { institutionId } : {};
      const url = this.buildUrl(API_ENDPOINTS.ACADEMIC_PERIODS.CURRENT_ACADEMIC_YEAR, params);
      return await apiService.get<AcademicYear>(url);
    } catch (error) {
      console.error('Error fetching current academic year:', error);
      throw error;
    }
  }

  /**
   * ⏳ TODO: POST - Create new academic year
   * Service ready, component implementation pending
   */
  async createAcademicYear(data: CreateAcademicYearRequest): Promise<ApiResponse<AcademicYear>> {
    try {
      return await apiService.post<AcademicYear>(
        API_ENDPOINTS.ACADEMIC_PERIODS.ACADEMIC_YEARS,
        data
      );
    } catch (error) {
      console.error('Error creating academic year:', error);
      throw error;
    }
  }

  /**
   * ⏳ TODO: PUT - Update academic year
   * Service ready, component implementation pending
   */
  async updateAcademicYear(
    id: number,
    data: UpdateAcademicYearRequest
  ): Promise<ApiResponse<AcademicYear>> {
    try {
      return await apiService.put<AcademicYear>(
        API_ENDPOINTS.ACADEMIC_PERIODS.ACADEMIC_YEAR_BY_ID(id),
        data
      );
    } catch (error) {
      console.error(`Error updating academic year ${id}:`, error);
      throw error;
    }
  }

  /**
   * ⏳ TODO: DELETE - Delete academic year
   * Service ready, component implementation pending
   */
  async deleteAcademicYear(id: number): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(
        API_ENDPOINTS.ACADEMIC_PERIODS.ACADEMIC_YEAR_BY_ID(id)
      );
    } catch (error) {
      console.error(`Error deleting academic year ${id}:`, error);
      throw error;
    }
  }

  /**
   * ⏳ TODO: PATCH - Set current academic year
   * Service ready, component implementation pending
   */
  async setCurrentAcademicYear(id: number): Promise<ApiResponse<AcademicYear>> {
    try {
      return await apiService.patch<AcademicYear>(
        API_ENDPOINTS.ACADEMIC_PERIODS.SET_CURRENT_ACADEMIC_YEAR(id)
      );
    } catch (error) {
      console.error(`Error setting current academic year ${id}:`, error);
      throw error;
    }
  }

  // ========================================
  // SEMESTER OPERATIONS
  // ========================================

  /**
   * ✅ GET - Fetch all semesters with pagination and filtering
   */
  async getSemesters(query?: SemesterQuery): Promise<ApiResponse<PaginatedResponse<Semester>>> {
    try {
      const url = this.buildUrl(API_ENDPOINTS.ACADEMIC_PERIODS.SEMESTERS, query as Record<string, unknown>);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiService.get<any>(url);

      if (!response.success || !response.data) {
        return {
          success: false,
          data: {
            success: false,
            data: [],
            pagination: { page: 1, totalPages: 1, total: 0, hasNext: false, hasPrev: false },
            error: response.error || 'Failed to fetch semesters'
          }
        };
      }

      // Backend returns paginated response with 'pages' field, transform to 'totalPages'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const backendPagination = (response as any).pagination || {};
      const totalPages = backendPagination.pages || backendPagination.totalPages || 1;
      const page = backendPagination.page || query?.page || 1;
      const total = backendPagination.total || response.data.length;

      const paginatedResponse: PaginatedResponse<Semester> = {
        success: response.success,
        message: response.message,
        data: response.data,
        pagination: {
          page,
          totalPages,
          total,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          limit: backendPagination.limit || query?.limit || 10
        }
      };

      // Wrap the paginated response in ApiResponse so the hook can extract it properly
      return {
        success: true,
        data: paginatedResponse
      };
    } catch (error) {
      console.error('Error fetching semesters:', error);
      throw error;
    }
  }

  /**
   * ✅ GET - Fetch single semester by ID
   */
  async getSemesterById(id: number): Promise<ApiResponse<Semester>> {
    try {
      return await apiService.get<Semester>(
        API_ENDPOINTS.ACADEMIC_PERIODS.SEMESTER_BY_ID(id)
      );
    } catch (error) {
      console.error(`Error fetching semester ${id}:`, error);
      throw error;
    }
  }

  /**
   * ✅ GET - Fetch current semester
   */
  async getCurrentSemester(academicYearId?: number): Promise<ApiResponse<Semester>> {
    try {
      const params = academicYearId ? { academicYearId } : {};
      const url = this.buildUrl(API_ENDPOINTS.ACADEMIC_PERIODS.CURRENT_SEMESTER, params);
      return await apiService.get<Semester>(url);
    } catch (error) {
      console.error('Error fetching current semester:', error);
      throw error;
    }
  }

  /**
   * ⏳ TODO: POST - Create new semester
   * Service ready, component implementation pending
   */
  async createSemester(data: CreateSemesterRequest): Promise<ApiResponse<Semester>> {
    try {
      return await apiService.post<Semester>(
        API_ENDPOINTS.ACADEMIC_PERIODS.SEMESTERS,
        data
      );
    } catch (error) {
      console.error('Error creating semester:', error);
      throw error;
    }
  }

  /**
   * ⏳ TODO: PUT - Update semester
   * Service ready, component implementation pending
   */
  async updateSemester(
    id: number,
    data: UpdateSemesterRequest
  ): Promise<ApiResponse<Semester>> {
    try {
      return await apiService.put<Semester>(
        API_ENDPOINTS.ACADEMIC_PERIODS.SEMESTER_BY_ID(id),
        data
      );
    } catch (error) {
      console.error(`Error updating semester ${id}:`, error);
      throw error;
    }
  }

  /**
   * ⏳ TODO: DELETE - Delete semester
   * Service ready, component implementation pending
   */
  async deleteSemester(id: number): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(
        API_ENDPOINTS.ACADEMIC_PERIODS.SEMESTER_BY_ID(id)
      );
    } catch (error) {
      console.error(`Error deleting semester ${id}:`, error);
      throw error;
    }
  }

  /**
   * ⏳ TODO: PATCH - Set current semester
   * Service ready, component implementation pending
   */
  async setCurrentSemester(id: number): Promise<ApiResponse<Semester>> {
    try {
      return await apiService.patch<Semester>(
        API_ENDPOINTS.ACADEMIC_PERIODS.SET_CURRENT_SEMESTER(id)
      );
    } catch (error) {
      console.error(`Error setting current semester ${id}:`, error);
      throw error;
    }
  }

  // ========================================
  // ACADEMIC PERIOD OPERATIONS
  // ========================================

  /**
   * ✅ GET - Fetch all academic periods with filters
   */
  async getAcademicPeriods(query?: AcademicPeriodQuery): Promise<ApiResponse<AcademicPeriod[]>> {
    try {
      const url = this.buildUrl(API_ENDPOINTS.ACADEMIC_PERIODS.PERIODS, query as Record<string, unknown>);
      return await apiService.get<AcademicPeriod[]>(url);
    } catch (error) {
      console.error('Error fetching academic periods:', error);
      throw error;
    }
  }

  /**
   * ✅ GET - Fetch single academic period by ID
   */
  async getAcademicPeriodById(id: number): Promise<ApiResponse<AcademicPeriod>> {
    try {
      return await apiService.get<AcademicPeriod>(
        API_ENDPOINTS.ACADEMIC_PERIODS.PERIOD_BY_ID(id)
      );
    } catch (error) {
      console.error(`Error fetching academic period ${id}:`, error);
      throw error;
    }
  }

  /**
   * ✅ GET - Fetch academic period by semester ID
   */
  async getAcademicPeriodBySemester(semesterId: number): Promise<ApiResponse<AcademicPeriod>> {
    try {
      return await apiService.get<AcademicPeriod>(
        API_ENDPOINTS.ACADEMIC_PERIODS.PERIOD_BY_SEMESTER(semesterId)
      );
    } catch (error) {
      console.error(`Error fetching academic period for semester ${semesterId}:`, error);
      throw error;
    }
  }

  /**
   * ✅ GET - Fetch current active academic period
   */
  async getCurrentAcademicPeriod(institutionId?: number): Promise<ApiResponse<AcademicPeriod>> {
    try {
      const params = institutionId ? { institutionId } : {};
      const url = this.buildUrl(API_ENDPOINTS.ACADEMIC_PERIODS.CURRENT_PERIOD, params);
      return await apiService.get<AcademicPeriod>(url);
    } catch (error) {
      console.error('Error fetching current academic period:', error);
      throw error;
    }
  }

  /**
   * ✅ GET - Get academic period status
   */
  async getAcademicPeriodStatus(id: number): Promise<ApiResponse<AcademicPeriodStatus>> {
    try {
      return await apiService.get<AcademicPeriodStatus>(
        API_ENDPOINTS.ACADEMIC_PERIODS.PERIOD_STATUS(id)
      );
    } catch (error) {
      console.error(`Error fetching academic period status ${id}:`, error);
      throw error;
    }
  }

  /**
   * ⏳ TODO: POST - Create new academic period
   * Service ready, component implementation pending
   */
  async createAcademicPeriod(
    data: CreateAcademicPeriodRequest
  ): Promise<ApiResponse<AcademicPeriod>> {
    try {
      return await apiService.post<AcademicPeriod>(
        API_ENDPOINTS.ACADEMIC_PERIODS.PERIODS,
        data
      );
    } catch (error) {
      console.error('Error creating academic period:', error);
      throw error;
    }
  }

  /**
   * ⏳ TODO: PUT - Update academic period
   * Service ready, component implementation pending
   */
  async updateAcademicPeriod(
    id: number,
    data: UpdateAcademicPeriodRequest
  ): Promise<ApiResponse<AcademicPeriod>> {
    try {
      return await apiService.put<AcademicPeriod>(
        API_ENDPOINTS.ACADEMIC_PERIODS.PERIOD_BY_ID(id),
        data
      );
    } catch (error) {
      console.error(`Error updating academic period ${id}:`, error);
      throw error;
    }
  }

  /**
   * ⏳ TODO: DELETE - Delete academic period
   * Service ready, component implementation pending
   */
  async deleteAcademicPeriod(id: number): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(
        API_ENDPOINTS.ACADEMIC_PERIODS.PERIOD_BY_ID(id)
      );
    } catch (error) {
      console.error(`Error deleting academic period ${id}:`, error);
      throw error;
    }
  }

  /**
   * ⏳ TODO: POST - Open registration for a period
   * Service ready, component implementation pending
   */
  async openRegistration(id: number): Promise<ApiResponse<AcademicPeriod>> {
    try {
      return await apiService.post<AcademicPeriod>(
        API_ENDPOINTS.ACADEMIC_PERIODS.OPEN_REGISTRATION(id)
      );
    } catch (error) {
      console.error(`Error opening registration for period ${id}:`, error);
      throw error;
    }
  }

  /**
   * ⏳ TODO: POST - Close registration for a period
   * Service ready, component implementation pending
   */
  async closeRegistration(id: number): Promise<ApiResponse<AcademicPeriod>> {
    try {
      return await apiService.post<AcademicPeriod>(
        API_ENDPOINTS.ACADEMIC_PERIODS.CLOSE_REGISTRATION(id)
      );
    } catch (error) {
      console.error(`Error closing registration for period ${id}:`, error);
      throw error;
    }
  }

  /**
   * ⏳ TODO: POST - Open add/drop for a period
   * Service ready, component implementation pending
   */
  async openAddDrop(id: number): Promise<ApiResponse<AcademicPeriod>> {
    try {
      return await apiService.post<AcademicPeriod>(
        API_ENDPOINTS.ACADEMIC_PERIODS.OPEN_ADD_DROP(id)
      );
    } catch (error) {
      console.error(`Error opening add/drop for period ${id}:`, error);
      throw error;
    }
  }

  /**
   * ⏳ TODO: POST - Close add/drop for a period
   * Service ready, component implementation pending
   */
  async closeAddDrop(id: number): Promise<ApiResponse<AcademicPeriod>> {
    try {
      return await apiService.post<AcademicPeriod>(
        API_ENDPOINTS.ACADEMIC_PERIODS.CLOSE_ADD_DROP(id)
      );
    } catch (error) {
      console.error(`Error closing add/drop for period ${id}:`, error);
      throw error;
    }
  }

  // ========================================
  // STATISTICS
  // ========================================

  /**
   * ✅ GET - Get academic period statistics
   */
  async getAcademicPeriodStats(institutionId?: number): Promise<ApiResponse<AcademicPeriodStats>> {
    try {
      const params = institutionId ? { institutionId } : {};
      const url = this.buildUrl(API_ENDPOINTS.ACADEMIC_PERIODS.STATS, params);
      return await apiService.get<AcademicPeriodStats>(url);
    } catch (error) {
      console.error('Error fetching academic period stats:', error);
      throw error;
    }
  }
}

export const academicService = new AcademicService();
export default academicService;
