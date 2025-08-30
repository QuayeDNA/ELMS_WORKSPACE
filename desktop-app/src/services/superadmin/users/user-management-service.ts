import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-config';
import {
  CreateInstitutionRequest,
  UpdateInstitutionRequest,
  GetUsersRequest,
  GetUsersResponse,
  UpdateUserStatusRequest,
  BulkUpdateUsersRequest,
  InstitutionResponse
} from '@/types/superadmin/users/user-management-types';

/**
 * User Management Service
 * Handles all user management API calls
 */
export class UserManagementService {
  private static instance: UserManagementService;

  private constructor() {}

  static getInstance(): UserManagementService {
    if (!UserManagementService.instance) {
      UserManagementService.instance = new UserManagementService();
    }
    return UserManagementService.instance;
  }

  /**
   * Create a new institution
   */
  async createInstitution(data: CreateInstitutionRequest): Promise<InstitutionResponse> {
    return apiClient.post<InstitutionResponse>(
      API_ENDPOINTS.SUPERADMIN.USERS.INSTITUTIONS,
      data
    );
  }

  /**
   * Get all institutions
   */
  async getInstitutions(): Promise<InstitutionResponse[]> {
    return apiClient.get<InstitutionResponse[]>(
      API_ENDPOINTS.SUPERADMIN.USERS.INSTITUTIONS
    );
  }

  /**
   * Get institution by ID
   */
  async getInstitution(id: string): Promise<InstitutionResponse> {
    return apiClient.get<InstitutionResponse>(
      API_ENDPOINTS.SUPERADMIN.USERS.INSTITUTION_BY_ID(id)
    );
  }

  /**
   * Update institution
   */
  async updateInstitution(id: string, data: UpdateInstitutionRequest): Promise<InstitutionResponse> {
    return apiClient.put<InstitutionResponse>(
      API_ENDPOINTS.SUPERADMIN.USERS.INSTITUTION_BY_ID(id),
      data
    );
  }

  /**
   * Delete institution
   */
  async deleteInstitution(id: string): Promise<void> {
    return apiClient.delete<void>(
      API_ENDPOINTS.SUPERADMIN.USERS.INSTITUTION_BY_ID(id)
    );
  }

  /**
   * Get users by institution
   */
  async getUsersByInstitution(query: GetUsersRequest): Promise<GetUsersResponse> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.role) params.append('role', query.role);
    if (query.status) params.append('status', query.status);
    if (query.department) params.append('department', query.department);

    const endpoint = query.institutionId
      ? API_ENDPOINTS.SUPERADMIN.USERS.USERS_BY_INSTITUTION(query.institutionId)
      : API_ENDPOINTS.SUPERADMIN.USERS.INSTITUTIONS;

    const queryString = params.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return apiClient.get<GetUsersResponse>(url);
  }

  /**
   * Update user status
   */
  async updateUserStatus(data: UpdateUserStatusRequest): Promise<void> {
    return apiClient.put<void>(
      API_ENDPOINTS.SUPERADMIN.USERS.USER_STATUS,
      data
    );
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(data: BulkUpdateUsersRequest): Promise<void> {
    return apiClient.put<void>(
      API_ENDPOINTS.SUPERADMIN.USERS.USER_BULK,
      data
    );
  }

  /**
   * Search users across all institutions
   */
  async searchUsers(searchTerm: string, filters?: Partial<GetUsersRequest>): Promise<GetUsersResponse> {
    const params = new URLSearchParams();
    params.append('search', searchTerm);

    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.department) params.append('department', filters.department);

    const url = `${API_ENDPOINTS.SUPERADMIN.USERS.INSTITUTIONS}?${params.toString()}`;

    return apiClient.get<GetUsersResponse>(url);
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    usersByRole: Record<string, number>;
    usersByInstitution: Record<string, number>;
  }> {
    return apiClient.get<{
      totalUsers: number;
      activeUsers: number;
      inactiveUsers: number;
      usersByRole: Record<string, number>;
      usersByInstitution: Record<string, number>;
    }>(`${API_ENDPOINTS.SUPERADMIN.USERS.INSTITUTIONS}/stats`);
  }

  /**
   * Export users data
   */
  async exportUsers(institutionId?: string, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('format', format);
    if (institutionId) params.append('institutionId', institutionId);

    const url = `${API_ENDPOINTS.SUPERADMIN.USERS.INSTITUTIONS}/export?${params.toString()}`;

    const response = await fetch(`${apiClient.getToken() ? 'http://localhost:3000/api' : ''}${url}`, {
      method: 'GET',
      headers: {
        'Authorization': apiClient.getToken() ? `Bearer ${apiClient.getToken()}` : '',
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }
}

// Create singleton instance
export const userManagementService = UserManagementService.getInstance();
