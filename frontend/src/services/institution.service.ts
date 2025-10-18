import { BaseService } from './base.service';
import { API_ENDPOINTS } from '@/utils/constants';
import { apiService } from './api';
import {
  Institution,
  InstitutionType,
  InstitutionFilters,
  CreateInstitutionRequest,
  UpdateInstitutionRequest,
  InstitutionListResponse,
  InstitutionStats,
  InstitutionSpecificAnalytics,
  CreateInstitutionWithAdminRequest,
  InstitutionWithAdminResponse,
} from '@/types/institution';
import { ApiResponse } from '@/types/shared/api';

/**
 * Institution Service
 * Handles all institution-related API operations
 */
class InstitutionService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.INSTITUTIONS.BASE);
  }

  // ========================================
  // CORE CRUD OPERATIONS
  // ========================================

  /**
   * Get all institutions with pagination and filtering
   */
  async getInstitutions(filters: InstitutionFilters = {}): Promise<ApiResponse<InstitutionListResponse>> {
    try {
      // Clean up filters to remove undefined values
      const cleanFilters: Record<string, unknown> = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanFilters[key] = value;
        }
      });

      // Build URL with query parameters
      const url = this.buildUrl(this.endpoint, cleanFilters);

      // Make direct API call to get institutions
      const response = await apiService.get<InstitutionListResponse>(url);

      // Transform the backend response to match expected InstitutionListResponse format
      const responseWithPagination = response as { pagination?: any };
      if (response.success && Array.isArray(response.data) && responseWithPagination.pagination) {
        return {
          success: response.success,
          message: response.message,
          data: {
            institutions: response.data,
            total: responseWithPagination.pagination.total,
            page: responseWithPagination.pagination.page,
            totalPages: responseWithPagination.pagination.totalPages,
            hasNext: responseWithPagination.pagination.hasNext,
            hasPrev: responseWithPagination.pagination.hasPrev,
          }
        };
      }

      // Fallback for empty or malformed response
      return {
        success: true,
        message: response.message || "No institutions found",
        data: {
          institutions: [],
          total: 0,
          page: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        }
      };
    } catch (error) {
      console.error('Error fetching institutions:', error);
      throw error;
    }
  }

  /**
   * Get single institution by ID
   */
  async getInstitution(id: number): Promise<ApiResponse<Institution>> {
    return this.getById<Institution>(id);
  }

  /**
   * Create new institution
   */
  async createInstitution(data: CreateInstitutionRequest): Promise<ApiResponse<Institution>> {
    this.validateRequired(data as unknown as Record<string, unknown>, ['name', 'code', 'type']);
    return this.create<Institution, CreateInstitutionRequest>(data);
  }

  /**
   * Update institution
   */
  async updateInstitution(id: number, data: UpdateInstitutionRequest): Promise<ApiResponse<Institution>> {
    return this.update<Institution, UpdateInstitutionRequest>(id, data);
  }

  /**
   * Delete institution
   */
  async deleteInstitution(id: number): Promise<ApiResponse<void>> {
    return this.delete(id);
  }

  // ========================================
  // SPECIALIZED OPERATIONS
  // ========================================

  /**
   * Create institution with admin
   */
  async createInstitutionWithAdmin(data: CreateInstitutionWithAdminRequest): Promise<ApiResponse<InstitutionWithAdminResponse>> {
    try {
      return await apiService.post<InstitutionWithAdminResponse>(`${this.endpoint}/with-admin`, data);
    } catch (error) {
      console.error('Error creating institution with admin:', error);
      throw error;
    }
  }

  /**
   * Get institution analytics (overview)
   */
  async getOverallAnalytics(): Promise<ApiResponse<InstitutionStats>> {
    try {
      return await apiService.get<InstitutionStats>(API_ENDPOINTS.INSTITUTIONS.OVERVIEW_ANALYTICS);
    } catch (error) {
      console.error('Error fetching institution analytics:', error);
      throw error;
    }
  }

  /**
   * Get specific institution analytics
   */
  async getInstitutionAnalytics(id: number): Promise<InstitutionSpecificAnalytics> {
    try {
      const response = await apiService.get<InstitutionSpecificAnalytics>(API_ENDPOINTS.INSTITUTIONS.ANALYTICS(id));
      return response.data as InstitutionSpecificAnalytics;
    } catch (error) {
      console.error(`Error fetching analytics for institution ${id}:`, error);
      throw error;
    }
  }

  /**
   * Check if institution code is unique
   */
  async isCodeUnique(code: string, excludeId?: number): Promise<boolean> {
    try {
      const filters: InstitutionFilters = { code };
      const response = await this.getInstitutions(filters);

      if (!response.data?.institutions) {
        return true;
      }

      const institutions = response.data.institutions;

      if (excludeId) {
        return !institutions.some((inst: Institution) => inst.code === code && inst.id !== excludeId);
      }

      return institutions.length === 0;
    } catch (error) {
      console.error('Error checking code uniqueness:', error);
      return false;
    }
  }

  /**
   * Export institutions data
   */
  async exportInstitutions(
    filters: InstitutionFilters = {},
    format: 'csv' | 'excel' = 'csv'
  ): Promise<Blob> {
    return this.export(filters as Record<string, unknown>, format);
  }

  // ========================================
  // FORM UTILITIES
  // ========================================

  /**
   * Get empty institution form data
   */
  getEmptyInstitutionForm() {
    return {
      name: '',
      code: '',
      type: 'UNIVERSITY' as InstitutionType,
      establishedYear: new Date().getFullYear().toString(),
      address: '',
      city: '',
      state: '',
      country: '',
      contactEmail: '',
      contactPhone: '',
      website: '',
      description: '',
    };
  }

  /**
   * Get empty admin form data
   */
  getEmptyAdminForm() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
    };
  }

  /**
   * Transform form data to create request
   */
  transformFormToRequest(formData: any): CreateInstitutionRequest {
    return {
      name: formData.name,
      code: formData.code,
      type: formData.type,
      establishedYear: formData.establishedYear ? parseInt(formData.establishedYear) : undefined,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      website: formData.website,
      description: formData.description,
    };
  }

  /**
   * Transform form to create with admin request
   */
  transformFormToWithAdminRequest(institutionData: any, adminData: any): CreateInstitutionWithAdminRequest {
    return {
      institution: this.transformFormToRequest(institutionData),
      admin: {
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        email: adminData.email,
        password: adminData.password,
        phone: adminData.phone,
      },
    };
  }

  /**
   * Transform institution to form data
   */
  institutionToFormData(institution: Institution) {
    return {
      name: institution.name,
      code: institution.code,
      type: institution.type,
      establishedYear: institution.establishedYear?.toString() || '',
      address: institution.address || '',
      city: institution.city || '',
      state: institution.state || '',
      country: institution.country || '',
      contactEmail: institution.contactEmail || '',
      contactPhone: institution.contactPhone || '',
      website: institution.website || '',
      description: institution.description || '',
    };
  }

  /**
   * Validate institution form data
   */
  validateInstitutionForm(data: any): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!data.name?.trim()) {
      errors.name = 'Institution name is required';
    }

    if (!data.code?.trim()) {
      errors.code = 'Institution code is required';
    }

    if (!data.type) {
      errors.type = 'Institution type is required';
    }

    if (data.contactEmail && !this.isValidEmail(data.contactEmail)) {
      errors.contactEmail = 'Invalid email format';
    }

    if (data.website && !this.isValidWebsite(data.website)) {
      errors.website = 'Invalid website URL format';
    }

    return errors;
  }

  /**
   * Validate admin form data
   */
  validateAdminForm(data: any): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!data.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!data.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!data.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!this.isValidEmail(data.email)) {
      errors.email = 'Invalid email format';
    }

    if (!data.password?.trim()) {
      errors.password = 'Password is required';
    } else if (data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    return errors;
  }

  // ========================================
  // VALIDATION HELPERS
  // ========================================

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidWebsite(website: string): boolean {
    try {
      new URL(website);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate institution data
   */
  validateInstitutionData(data: CreateInstitutionRequest | UpdateInstitutionRequest): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};

    // Check required fields for creation
    if ('name' in data && 'code' in data && 'type' in data) {
      if (!data.name?.trim()) {
        errors.name = 'Institution name is required';
      }

      if (!data.code?.trim()) {
        errors.code = 'Institution code is required';
      }

      if (!data.type) {
        errors.type = 'Institution type is required';
      }
    }

    // Validate optional fields
    if (data.contactEmail && !this.isValidEmail(data.contactEmail)) {
      errors.contactEmail = 'Invalid email format';
    }

    if (data.website && !this.isValidWebsite(data.website)) {
      errors.website = 'Invalid website URL format';
    }

    if (data.establishedYear) {
      const currentYear = new Date().getFullYear();
      if (data.establishedYear < 1800 || data.establishedYear > currentYear) {
        errors.establishedYear = `Established year must be between 1800 and ${currentYear}`;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

export const institutionService = new InstitutionService();
export default institutionService;
