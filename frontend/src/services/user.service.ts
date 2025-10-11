import { BaseService } from './base.service';
import { ApiResponse } from '@/types/shared/api';
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
  async getUsers(query?: UserQuery): Promise<ApiResponse<UserListResponse>> {
    return this.getPaginated<User>(query);
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
    this.validateRequired(data, ['firstName', 'lastName', 'email', 'password', 'role']);
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
      return await this.apiService.get<User[]>(
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
      return await this.apiService.get<User[]>(
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
      return await this.apiService.get<User[]>(
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
      return await this.apiService.put<User>(
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
    return this.export(filters, format);
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
      institutionId: user.institutionId,
      facultyId: user.facultyId,
      departmentId: user.departmentId,
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
