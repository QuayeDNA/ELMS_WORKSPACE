import apiService from './api';
import { CreateDepartmentData, UpdateDepartmentData, DepartmentQuery } from '../types/department';

export const departmentService = {
  // Get all departments with pagination and filtering
  async getDepartments(query?: DepartmentQuery) {
    const params = new URLSearchParams();

    if (query?.facultyId) params.append('facultyId', query.facultyId.toString());
    if (query?.institutionId) params.append('institutionId', query.institutionId.toString());
    if (query?.isActive !== undefined) params.append('isActive', query.isActive.toString());
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);

    const response = await apiService.get(`/departments?${params.toString()}`);
    return response.data;
  },

  // Get single department by ID
  async getDepartmentById(id: number) {
    const response = await apiService.get(`/departments/${id}`);
    return response.data;
  },

  // Create new department
  async createDepartment(data: CreateDepartmentData) {
    const response = await apiService.post('/departments', data);
    return response.data;
  },

  // Update department
  async updateDepartment(id: number, data: UpdateDepartmentData) {
    const response = await apiService.put(`/departments/${id}`, data);
    return response.data;
  },

  // Delete department
  async deleteDepartment(id: number) {
    const response = await apiService.delete(`/departments/${id}`);
    return response.data;
  },

  // Get departments by faculty
  async getDepartmentsByFaculty(facultyId: number, query?: { page?: number; limit?: number; search?: string; isActive?: boolean }) {
    const params = new URLSearchParams();
    params.append('facultyId', facultyId.toString());

    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.isActive !== undefined) params.append('isActive', query.isActive.toString());

    const response = await apiService.get(`/departments?${params.toString()}`);
    return response.data;
  },

  // Get department statistics
  async getDepartmentStats(id: number) {
    const response = await apiService.get(`/departments/${id}/stats`);
    return response.data;
  }
};
