import { apiService } from './api';
import { ApiResponse } from '@/types/api';
import { API_ENDPOINTS } from '@/utils/constants';
import {
  Institution,
  InstitutionListResponse,
  CreateInstitutionRequest,
  UpdateInstitutionRequest,
  InstitutionQuery,
  CreateInstitutionWithAdminRequest,
  InstitutionWithAdminResponse,
  InstitutionStats,
  InstitutionSpecificAnalytics,
  InstitutionFormData,
  AdminFormData,
  InstitutionType
} from '@/types/institution';

// ========================================
// INSTITUTION SERVICE CLASS
// ========================================

class InstitutionService {
  private readonly endpoint = API_ENDPOINTS.INSTITUTIONS.BASE;

  // ========================================
  // CORE CRUD OPERATIONS
  // ========================================

  /**
   * Get all institutions with pagination and filtering
   */
  async getInstitutions(query?: InstitutionQuery): Promise<ApiResponse<InstitutionListResponse>> {
    try {
      const params = new URLSearchParams();
      
      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const queryString = params.toString();
      const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;
      
      return await apiService.get<InstitutionListResponse>(url);
    } catch (error) {
      console.error('Error fetching institutions:', error);
      throw error;
    }
  }

  /**
   * Get single institution by ID
   */
  async getInstitution(id: number): Promise<ApiResponse<Institution>> {
    try {
      return await apiService.get<Institution>(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Error fetching institution ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new institution
   */
  async createInstitution(data: CreateInstitutionRequest): Promise<ApiResponse<Institution>> {
    try {
      return await apiService.post<Institution>(this.endpoint, data);
    } catch (error) {
      console.error('Error creating institution:', error);
      throw error;
    }
  }

  /**
   * Update existing institution
   */
  async updateInstitution(id: number, data: UpdateInstitutionRequest): Promise<ApiResponse<Institution>> {
    try {
      return await apiService.put<Institution>(`${this.endpoint}/${id}`, data);
    } catch (error) {
      console.error(`Error updating institution ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete institution
   */
  async deleteInstitution(id: number): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Error deleting institution ${id}:`, error);
      throw error;
    }
  }

  // ========================================
  // INSTITUTION WITH ADMIN OPERATIONS
  // ========================================

  /**
   * Create institution with admin user
   */
  async createInstitutionWithAdmin(
    data: CreateInstitutionWithAdminRequest
  ): Promise<ApiResponse<InstitutionWithAdminResponse>> {
    try {
      return await apiService.post<InstitutionWithAdminResponse>(API_ENDPOINTS.INSTITUTIONS.WITH_ADMIN, data);
    } catch (error) {
      console.error('Error creating institution with admin:', error);
      throw error;
    }
  }

  // ========================================
  // ANALYTICS OPERATIONS
  // ========================================

  /**
   * Get institution analytics
   */
  async getInstitutionAnalytics(id: number): Promise<ApiResponse<InstitutionSpecificAnalytics>> {
    try {
      return await apiService.get<InstitutionSpecificAnalytics>(API_ENDPOINTS.INSTITUTIONS.ANALYTICS(id));
    } catch (error) {
      console.error(`Error fetching analytics for institution ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get overall analytics for all institutions
   */
  async getOverallAnalytics(): Promise<ApiResponse<InstitutionStats>> {
    try {
      return await apiService.get<InstitutionStats>(API_ENDPOINTS.INSTITUTIONS.OVERVIEW_ANALYTICS);
    } catch (error) {
      console.error('Error fetching overall analytics:', error);
      throw error;
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Transform form data to API request format
   */
  transformFormToRequest(formData: InstitutionFormData): CreateInstitutionRequest {
    return {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      type: formData.type,
      establishedYear: formData.establishedYear ? parseInt(formData.establishedYear) : undefined,
      address: formData.address.trim() || undefined,
      city: formData.city.trim() || undefined,
      state: formData.state.trim() || undefined,
      country: formData.country.trim() || undefined,
      contactEmail: formData.contactEmail.trim() || undefined,
      contactPhone: formData.contactPhone.trim() || undefined,
      website: formData.website.trim() || undefined,
      description: formData.description.trim() || undefined,
    };
  }

  /**
   * Transform form data to institution with admin request
   */
  transformFormToWithAdminRequest(
    institutionForm: InstitutionFormData,
    adminForm: AdminFormData
  ): CreateInstitutionWithAdminRequest {
    return {
      institution: this.transformFormToRequest(institutionForm),
      admin: {
        firstName: adminForm.firstName.trim(),
        lastName: adminForm.lastName.trim(),
        email: adminForm.email.trim().toLowerCase(),
        password: adminForm.password,
        phone: adminForm.phone.trim() || undefined,
      },
    };
  }

  /**
   * Validate institution form data
   */
  validateInstitutionForm(formData: InstitutionFormData): string[] {
    const errors: string[] = [];

    if (!formData.name.trim()) {
      errors.push('Institution name is required');
    }

    if (!formData.code.trim()) {
      errors.push('Institution code is required');
    } else if (formData.code.length < 2) {
      errors.push('Institution code must be at least 2 characters');
    }

    if (!formData.type) {
      errors.push('Institution type is required');
    }

    if (formData.establishedYear && parseInt(formData.establishedYear) > new Date().getFullYear()) {
      errors.push('Established year cannot be in the future');
    }

    if (formData.contactEmail && !this.isValidEmail(formData.contactEmail)) {
      errors.push('Contact email must be a valid email address');
    }

    if (formData.website && !this.isValidUrl(formData.website)) {
      errors.push('Website must be a valid URL');
    }

    return errors;
  }

  /**
   * Validate admin form data
   */
  validateAdminForm(formData: AdminFormData): string[] {
    const errors: string[] = [];

    if (!formData.firstName.trim()) {
      errors.push('First name is required');
    }

    if (!formData.lastName.trim()) {
      errors.push('Last name is required');
    }

    if (!formData.email.trim()) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(formData.email)) {
      errors.push('Email must be a valid email address');
    }

    if (!formData.password) {
      errors.push('Password is required');
    } else if (formData.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    }

    return errors;
  }

  /**
   * Search institutions by term
   */
  async searchInstitutions(searchTerm: string): Promise<ApiResponse<Institution[]>> {
    try {
      const query: InstitutionQuery = {
        search: searchTerm,
        limit: 10,
      };
      
      const response = await this.getInstitutions(query);
      return {
        ...response,
        data: response.data?.institutions || [],
      };
    } catch (error) {
      console.error('Error searching institutions:', error);
      throw error;
    }
  }

  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // ========================================
  // FORM INITIALIZATION HELPERS
  // ========================================

  /**
   * Get empty institution form data
   */
  getEmptyInstitutionForm(): InstitutionFormData {
    return {
      name: '',
      code: '',
      type: InstitutionType.UNIVERSITY,
      establishedYear: '',
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
  getEmptyAdminForm(): AdminFormData {
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
   * Convert institution to form data for editing
   */
  institutionToFormData(institution: Institution): InstitutionFormData {
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
}

// ========================================
// EXPORT SINGLETON INSTANCE
// ========================================

export const institutionService = new InstitutionService();
export default institutionService;
