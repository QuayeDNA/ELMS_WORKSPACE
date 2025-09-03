import { apiService } from './api';
import { 
  Department, 
  CreateDepartmentRequest, 
  UpdateDepartmentRequest, 
  DepartmentQuery, 
  DepartmentStats 
} from '../types/department';

export const departmentService = {
  // Get departments with filtering and pagination
  async getDepartments(query: DepartmentQuery = {}) {
    const params = new URLSearchParams();
    
    if (query.facultyId) params.append('facultyId', query.facultyId.toString());
    if (query.institutionId) params.append('institutionId', query.institutionId.toString());
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString());
    if (query.search) params.append('search', query.search);
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());

    return apiService.get<{
      departments: Department[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/departments?${params.toString()}`);
  },

  // Get department by ID
  async getDepartmentById(id: number) {
    return apiService.get<Department>(`/departments/${id}`);
  },

  // Create new department
  async createDepartment(data: CreateDepartmentRequest) {
    return apiService.post<Department>('/departments', data);
  },

  // Update department
  async updateDepartment(id: number, data: UpdateDepartmentRequest) {
    return apiService.put<Department>(`/departments/${id}`, data);
  },

  // Delete department
  async deleteDepartment(id: number) {
    return apiService.delete(`/departments/${id}`);
  },

  // Get department statistics
  async getDepartmentStats(facultyId?: number, institutionId?: number) {
    const params = new URLSearchParams();
    if (facultyId) params.append('facultyId', facultyId.toString());
    if (institutionId) params.append('institutionId', institutionId.toString());
    
    return apiService.get<DepartmentStats>(`/departments/stats?${params.toString()}`);
  },

  // Get departments by faculty
  async getDepartmentsByFaculty(facultyId: number) {
    return apiService.get<Department[]>(`/departments/faculty/${facultyId}`);
  },

  // Get departments by institution
  async getDepartmentsByInstitution(institutionId: number) {
    return apiService.get<Department[]>(`/departments/institution/${institutionId}`);
  }
};
