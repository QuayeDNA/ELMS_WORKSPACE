import { apiService } from './api';
import { 
  Program, 
  CreateProgramRequest, 
  UpdateProgramRequest, 
  ProgramQuery, 
  ProgramStats 
} from '../types/program';

export const programService = {
  // Get programs with filtering and pagination
  async getPrograms(query: ProgramQuery = {}) {
    const params = new URLSearchParams();
    
    if (query.departmentId) params.append('departmentId', query.departmentId.toString());
    if (query.facultyId) params.append('facultyId', query.facultyId.toString());
    if (query.institutionId) params.append('institutionId', query.institutionId.toString());
    if (query.degreeType) params.append('degreeType', query.degreeType);
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString());
    if (query.search) params.append('search', query.search);
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());

    return apiService.get<{
      programs: Program[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/programs?${params.toString()}`);
  },

  // Get program by ID
  async getProgramById(id: number) {
    return apiService.get<Program>(`/programs/${id}`);
  },

  // Create new program
  async createProgram(data: CreateProgramRequest) {
    return apiService.post<Program>('/programs', data);
  },

  // Update program
  async updateProgram(id: number, data: UpdateProgramRequest) {
    return apiService.put<Program>(`/programs/${id}`, data);
  },

  // Delete program
  async deleteProgram(id: number) {
    return apiService.delete(`/programs/${id}`);
  },

  // Get program statistics
  async getProgramStats(departmentId?: number, facultyId?: number, institutionId?: number) {
    const params = new URLSearchParams();
    if (departmentId) params.append('departmentId', departmentId.toString());
    if (facultyId) params.append('facultyId', facultyId.toString());
    if (institutionId) params.append('institutionId', institutionId.toString());
    
    return apiService.get<ProgramStats>(`/programs/stats?${params.toString()}`);
  },

  // Get programs by department
  async getProgramsByDepartment(departmentId: number) {
    return apiService.get<Program[]>(`/programs/department/${departmentId}`);
  },

  // Get programs by faculty
  async getProgramsByFaculty(facultyId: number) {
    return apiService.get<Program[]>(`/programs/faculty/${facultyId}`);
  },

  // Get programs by institution
  async getProgramsByInstitution(institutionId: number) {
    return apiService.get<Program[]>(`/programs/institution/${institutionId}`);
  }
};
