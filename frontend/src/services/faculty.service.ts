import { BaseService } from './base.service';
import { ApiResponse, PaginatedResponse } from '@/types/shared/api';
import { API_ENDPOINTS } from '@/utils/constants';
import {
  Faculty,
  CreateFacultyRequest,
  UpdateFacultyRequest,
  FacultyQuery,
  FacultyFormData,
  FacultyAnalytics,
} from '@/types/shared';

/**
 * Faculty Service
 * Handles all faculty-related API operations
 */
class FacultyService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.FACULTIES.BASE);
  }

  // ========================================
  // CORE CRUD OPERATIONS
  // ========================================

  /**
   * Get all faculties with pagination and filtering
   */
  async getFaculties(query?: FacultyQuery): Promise<PaginatedResponse<Faculty>> {
    const queryWithRecord = query ? { ...query } as Record<string, unknown> : undefined;

    // The backend now returns a standardized PaginatedResponse<Faculty>
    const response = await this.getPaginated<Faculty>(queryWithRecord);
    return response;
  }

  /**
   * Get single faculty by ID
   */
  async getFaculty(id: number): Promise<ApiResponse<Faculty>> {
    return this.getById<Faculty>(id);
  }

  /**
   * Create new faculty
   */
  async createFaculty(data: CreateFacultyRequest): Promise<ApiResponse<Faculty>> {
    this.validateRequired(data as unknown as Record<string, unknown>, ['name', 'code', 'institutionId']);
    return this.create<Faculty, CreateFacultyRequest>(data);
  }

  /**
   * Update faculty
   */
  async updateFaculty(
    id: number,
    data: UpdateFacultyRequest
  ): Promise<ApiResponse<Faculty>> {
    return this.update<Faculty, UpdateFacultyRequest>(id, data);
  }

  /**
   * Delete faculty
   */
  async deleteFaculty(id: number): Promise<ApiResponse<void>> {
    return this.delete(id);
  }

  // ========================================
  // SPECIALIZED OPERATIONS
  // ========================================

  /**
   * Get faculties by institution
   */
  async getFacultiesByInstitution(
    institutionId: number,
    query?: Omit<FacultyQuery, 'institutionId'>
  ): Promise<PaginatedResponse<Faculty>> {
    const fullQuery = { ...query, institutionId };
    return this.getFaculties(fullQuery);
  }

  /**
   * Get faculty analytics
   */
  async getFacultyAnalytics(
    institutionId?: number
  ): Promise<ApiResponse<FacultyAnalytics>> {
    const params = institutionId ? { institutionId } : undefined;
    return this.getStats<FacultyAnalytics>('/analytics', params);
  }

  /**
   * Search faculties
   */
  async searchFaculties(
    searchTerm: string,
    institutionId?: number
  ): Promise<ApiResponse<Faculty[]>> {
    const additionalParams = institutionId ? { institutionId } : undefined;
    return this.search<Faculty>(searchTerm, additionalParams);
  }

  /**
   * Export faculties data
   */
  async exportFaculties(
    filters: FacultyQuery = {},
    format: 'csv' | 'excel' = 'csv'
  ): Promise<Blob> {
    return this.export(filters as Record<string, unknown>, format);
  }

  // ========================================
  // DEAN MANAGEMENT
  // ========================================

  /**
   * Assign dean to faculty
   */
  async assignDean(facultyId: number, deanId: number): Promise<ApiResponse<Faculty>> {
    return this.update<Faculty, { deanId: number }>(facultyId, { deanId });
  }

  /**
   * Remove dean from faculty
   */
  async removeDean(facultyId: number): Promise<ApiResponse<Faculty>> {
    return this.update<Faculty, { deanId: null }>(facultyId, { deanId: null });
  }

  // ========================================
  // FORM UTILITIES
  // ========================================

  /**
   * Get empty faculty form data
   */
  getEmptyFacultyForm(): FacultyFormData {
    return {
      name: '',
      code: '',
      institutionId: 0,
      description: '',
      deanId: undefined,
      isActive: true,
    };
  }

  /**
   * Transform faculty for form
   */
  transformFacultyForForm(faculty: Faculty): FacultyFormData {
    return {
      name: faculty.name,
      code: faculty.code,
      institutionId: faculty.institutionId,
      description: faculty.description || '',
      deanId: faculty.deanId || undefined,
      isActive: faculty.isActive ?? true,
    };
  }

  /**
   * Transform form data to create request format
   */
  transformFormData(formData: FacultyFormData): CreateFacultyRequest {
    return {
      name: formData.name,
      code: formData.code,
      institutionId: formData.institutionId,
      description: formData.description || undefined,
    };
  }

  /**
   * Transform form data to update request format
   */
  transformFormDataToUpdate(formData: FacultyFormData): UpdateFacultyRequest {
    return {
      name: formData.name,
      code: formData.code,
      description: formData.description || undefined,
    };
  }
}

export const facultyService = new FacultyService();
export default facultyService;
