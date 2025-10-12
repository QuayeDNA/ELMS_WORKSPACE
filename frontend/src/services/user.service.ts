import { BaseService } from './base.service';
import { ApiResponse, PaginatedResponse } from '@/types/shared/api';
import { API_ENDPOINTS } from '@/utils/constants';
import { apiService } from './api';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserQuery,
  UserFormData,
  USER_ROLES,
  USER_STATUSES,
  UserRole,
} from '@/types/shared';

/**
 * User Service
 * Handles all user-related API operations
 */
class UserService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.USERS);
  }

  // ========================================
  // CORE CRUD OPERATIONS
  // ========================================

  /**
   * Get all users with pagination and filtering
   */
  async getUsers(query?: UserQuery): Promise<PaginatedResponse<User>> {
    const queryWithRecord = query ? { ...query } as Record<string, unknown> : undefined;

    // The backend now returns a standardized PaginatedResponse<User>
    const response = await this.getPaginated<User>(queryWithRecord);
    return response;
  }

  /**
   * Get single user by ID
   */
  async getUser(id: number): Promise<ApiResponse<User>> {
    return this.getById<User>(id);
  }

  /**
   * Create new user
   */
  async createUser(data: CreateUserRequest): Promise<ApiResponse<User>> {
    this.validateRequired(data as unknown as Record<string, unknown>, ['firstName', 'lastName', 'email', 'password', 'role']);
    this.validateUserData(data);
    return this.create<User, CreateUserRequest>(data);
  }

  /**
   * Update user
   */
  async updateUser(
    id: number,
    data: UpdateUserRequest
  ): Promise<ApiResponse<User>> {
    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }
    return this.update<User, UpdateUserRequest>(id, data);
  }

  /**
   * Delete user
   */
  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return this.delete(id);
  }

  // ========================================
  // SPECIALIZED OPERATIONS
  // ========================================

  /**
   * Get users by institution
   */
  async getUsersByInstitution(
    institutionId: number
  ): Promise<ApiResponse<User[]>> {
    try {
      return await apiService.get<User[]>(
        `${API_ENDPOINTS.INSTITUTIONS.BASE}/${institutionId}/users`
      );
    } catch (error) {
      console.error(`Error fetching users for institution ${institutionId}:`, error);
      throw error;
    }
  }

  /**
   * Get users by faculty
   */
  async getUsersByFaculty(
    facultyId: number
  ): Promise<ApiResponse<User[]>> {
    try {
      return await apiService.get<User[]>(
        `${API_ENDPOINTS.FACULTIES.BASE}/${facultyId}/users`
      );
    } catch (error) {
      console.error(`Error fetching users for faculty ${facultyId}:`, error);
      throw error;
    }
  }

  /**
   * Get users by department
   */
  async getUsersByDepartment(
    departmentId: number
  ): Promise<ApiResponse<User[]>> {
    try {
      return await apiService.get<User[]>(
        `${API_ENDPOINTS.DEPARTMENTS.BASE}/${departmentId}/users`
      );
    } catch (error) {
      console.error(`Error fetching users for department ${departmentId}:`, error);
      throw error;
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(
    role: UserRole,
    institutionId?: number
  ): Promise<ApiResponse<User[]>> {
    const params = { role, ...(institutionId && { institutionId }) };
    return this.search<User>('', params);
  }

  /**
   * Update user status
   */
  async updateUserStatus(
    id: number,
    status: string
  ): Promise<ApiResponse<User>> {
    try {
      return await apiService.put<User>(
        `${this.endpoint}/${id}/status`,
        { status }
      );
    } catch (error) {
      console.error(`Error updating user status ${id}:`, error);
      throw error;
    }
  }

  /**
   * Export users data
   */
  async exportUsers(
    filters: UserQuery = {},
    format: 'csv' | 'excel' = 'csv'
  ): Promise<Blob> {
    return this.export(filters as Record<string, unknown>, format);
  }

  // ========================================
  // FORM UTILITIES
  // ========================================

  /**
   * Get empty user form data
   */
  getEmptyUserForm(): UserFormData {
    return {
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: UserRole.STUDENT,
      institutionId: undefined,
      facultyId: undefined,
      departmentId: undefined,
      phone: '',
      dateOfBirth: undefined,
      title: '',
      isActive: true,
    };
  }

  /**
   * Transform user for form
   */
  transformUserForForm(user: User): UserFormData {
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName || '',
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role,
      institutionId: user.institutionId?.toString(),
      facultyId: user.facultyId?.toString(),
      departmentId: user.departmentId?.toString(),
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth,
      title: user.title || '',
      isActive: user.status === 'ACTIVE',
    };
  }

  /**
   * Get user role options
   */
  getUserRoleOptions() {
    return USER_ROLES;
  }

  /**
   * Get user status options
   */
  getUserStatusOptions() {
    return USER_STATUSES;
  }

  /**
   * Get display name for user
   */
  getDisplayName(user: User): string {
    const middleName = user.middleName ? ` ${user.middleName} ` : ' ';
    return `${user.firstName}${middleName}${user.lastName}`;
  }

  /**
   * Get role label for user
   */
  getRoleLabel(role: UserRole): string {
    const roleOption = USER_ROLES.find(r => r.value === role);
    return roleOption ? roleOption.label : role;
  }

  /**
   * Get status label for user
   */
  getStatusLabel(status: string): string {
    const statusOption = USER_STATUSES.find(s => s.value === status);
    return statusOption ? statusOption.label : status;
  }

  /**
   * Transform form data to request format
   */
  transformFormData(formData: UserFormData): CreateUserRequest {
    return {
      firstName: formData.firstName,
      lastName: formData.lastName,
      middleName: formData.middleName || undefined,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      institutionId: formData.institutionId ? parseInt(formData.institutionId) : undefined,
      facultyId: formData.facultyId ? parseInt(formData.facultyId) : undefined,
      departmentId: formData.departmentId ? parseInt(formData.departmentId) : undefined,
      phone: formData.phone || undefined,
      dateOfBirth: formData.dateOfBirth,
      title: formData.title || undefined,
    };
  }

  // ========================================
  // VALIDATION HELPERS
  // ========================================

  private validateUserData(data: CreateUserRequest): void {
    if (!this.isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    if (data.password && data.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (data.phone && !this.isValidPhone(data.phone)) {
      throw new Error('Invalid phone number format');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[+]?[\d\s\\()-]{10,}$/;
    return phoneRegex.test(phone);
  }
}

export const userService = new UserService();
export default userService;
