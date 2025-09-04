import { apiService } from './api';
import { ApiResponse } from '@/types/api';
import { API_ENDPOINTS } from '@/utils/constants';
import {
  User,
  UserListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserQuery,
  UserFormData,
  USER_ROLES,
  USER_STATUSES,
  UserRole
} from '@/types/user';

// ========================================
// USER SERVICE CLASS
// ========================================

class UserService {
  private readonly endpoint = API_ENDPOINTS.USERS;

  // ========================================
  // CORE CRUD OPERATIONS
  // ========================================

  /**
   * Get all users with pagination and filtering
   */
  async getUsers(query?: UserQuery): Promise<ApiResponse<UserListResponse>> {
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

      return await apiService.get<UserListResponse>(url);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Get single user by ID
   */
  async getUser(id: number): Promise<ApiResponse<User>> {
    try {
      return await apiService.get<User>(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new user
   */
  async createUser(data: CreateUserRequest): Promise<ApiResponse<User>> {
    try {
      return await apiService.post<User>(this.endpoint, data);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(id: number, data: UpdateUserRequest): Promise<ApiResponse<User>> {
    try {
      return await apiService.put<User>(`${this.endpoint}/${id}`, data);
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id: number): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get users by institution
   */
  async getUsersByInstitution(institutionId: number): Promise<ApiResponse<User[]>> {
    try {
      return await apiService.get<User[]>(`${API_ENDPOINTS.INSTITUTIONS.BASE}/${institutionId}/users`);
    } catch (error) {
      console.error(`Error fetching users for institution ${institutionId}:`, error);
      throw error;
    }
  }

  /**
   * Get users by faculty
   */
  async getUsersByFaculty(facultyId: number): Promise<ApiResponse<User[]>> {
    try {
      return await apiService.get<User[]>(`${API_ENDPOINTS.FACULTIES.BASE}/${facultyId}/users`);
    } catch (error) {
      console.error(`Error fetching users for faculty ${facultyId}:`, error);
      throw error;
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Transform form data to API request format
   */
  transformFormData(formData: UserFormData): CreateUserRequest {
    return {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: formData.role as UserRole, // Will be validated by backend
      institutionId: formData.institutionId ? parseInt(formData.institutionId) : undefined,
      facultyId: formData.facultyId && formData.facultyId !== 'NONE_OPTIONAL' ? parseInt(formData.facultyId) : undefined,
      departmentId: formData.departmentId && formData.departmentId !== 'NONE_OPTIONAL' ? parseInt(formData.departmentId) : undefined,
      phone: formData.phone || undefined,
      middleName: formData.middleName || undefined,
      title: formData.title || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      gender: formData.gender || undefined,
      nationality: formData.nationality || undefined,
      address: formData.address || undefined,
    };
  }

  /**
   * Transform user data for form display
   */
  transformToFormData(user: User): UserFormData {
    return {
      email: user.email,
      password: '', // Don't populate password for security
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName || '',
      title: user.title || '',
      role: user.role,
      status: user.status,
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      gender: user.gender || '',
      nationality: user.nationality || '',
      address: user.address || '',
      institutionId: user.institutionId?.toString() || '',
      facultyId: user.facultyId?.toString() || '',
      departmentId: user.departmentId?.toString() || '',
    };
  }

  /**
   * Get user display name
   */
  getDisplayName(user: User): string {
    const parts = [user.firstName];
    if (user.middleName) parts.push(user.middleName);
    parts.push(user.lastName);
    return parts.join(' ');
  }

  /**
   * Get user full name with title
   */
  getFullName(user: User): string {
    const name = this.getDisplayName(user);
    return user.title ? `${user.title} ${name}` : name;
  }

  /**
   * Check if user has specific role
   */
  hasRole(user: User, role: string): boolean {
    return user.role === role;
  }

  /**
   * Check if user has admin privileges
   */
  isAdmin(user: User): boolean {
    return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN].includes(user.role);
  }

  /**
   * Get role display label
   */
  getRoleLabel(role: string): string {
    const roleOption = USER_ROLES.find(r => r.value === role);
    return roleOption?.label || role;
  }

  /**
   * Get status display label
   */
  getStatusLabel(status: string): string {
    const statusOption = USER_STATUSES.find(s => s.value === status);
    return statusOption?.label || status;
  }
}

// ========================================
// EXPORT SINGLETON INSTANCE
// ========================================

export const userService = new UserService();
