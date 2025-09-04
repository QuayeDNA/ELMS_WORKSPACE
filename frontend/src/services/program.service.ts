import apiService from './api';
import { CreateProgramData, UpdateProgramData, ProgramQuery } from '../types/program';

export const programService = {
  // Get all programs with pagination and filtering
  async getPrograms(query?: ProgramQuery) {
    const params = new URLSearchParams();

    if (query?.departmentId) params.append('departmentId', query.departmentId.toString());
    if (query?.facultyId) params.append('facultyId', query.facultyId.toString());
    if (query?.institutionId) params.append('institutionId', query.institutionId.toString());
    if (query?.type) params.append('type', query.type);
    if (query?.level) params.append('level', query.level);
    if (query?.isActive !== undefined) params.append('isActive', query.isActive.toString());
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);

    const response = await apiService.get(`/programs?${params.toString()}`);
    return response.data;
  },

  // Get single program by ID
  async getProgramById(id: number) {
    const response = await apiService.get(`/programs/${id}`);
    return response.data;
  },

  // Create new program
  async createProgram(data: CreateProgramData) {
    const response = await apiService.post('/programs', data);
    return response.data;
  },

  // Update program
  async updateProgram(id: number, data: UpdateProgramData) {
    const response = await apiService.put(`/programs/${id}`, data);
    return response.data;
  },

  // Delete program
  async deleteProgram(id: number) {
    const response = await apiService.delete(`/programs/${id}`);
    return response.data;
  },

  // Get programs by department
  async getProgramsByDepartment(departmentId: number, query?: { page?: number; limit?: number; search?: string; isActive?: boolean }) {
    const params = new URLSearchParams();
    params.append('departmentId', departmentId.toString());

    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.isActive !== undefined) params.append('isActive', query.isActive.toString());

    const response = await apiService.get(`/programs?${params.toString()}`);
    return response.data;
  },

  // Get program statistics
  async getProgramStats(id: number) {
    const response = await apiService.get(`/programs/${id}/stats`);
    return response.data;
  }
};
