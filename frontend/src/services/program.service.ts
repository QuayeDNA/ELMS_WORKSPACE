import { apiService } from "./api";
import { API_ENDPOINTS } from "@/utils/constants";
import {
  ApiResponse,
  Program,
  ProgramListResponse,
  CreateProgramRequest,
  UpdateProgramRequest,
  ProgramQuery,
  ProgramStats,
} from "@/types/shared";

export const programService = {
  // Get all programs with pagination and filtering
  async getPrograms(
    query?: ProgramQuery
  ): Promise<ApiResponse<ProgramListResponse>> {
    try {
      const params = new URLSearchParams();

      if (query?.departmentId)
        params.append("departmentId", query.departmentId.toString());
      if (query?.facultyId)
        params.append("facultyId", query.facultyId.toString());
      if (query?.institutionId)
        params.append("institutionId", query.institutionId.toString());
      if (query?.type) params.append("type", query.type);
      if (query?.level) params.append("level", query.level);
      if (query?.isActive !== undefined)
        params.append("isActive", query.isActive.toString());
      if (query?.page) params.append("page", query.page.toString());
      if (query?.limit) params.append("limit", query.limit.toString());
      if (query?.search) params.append("search", query.search);
      if (query?.sortBy) params.append("sortBy", query.sortBy);
      if (query?.sortOrder) params.append("sortOrder", query.sortOrder);

      const queryString = params.toString();
      const url = queryString
        ? `${API_ENDPOINTS.PROGRAMS.BASE}?${queryString}`
        : API_ENDPOINTS.PROGRAMS.BASE;

      return await apiService.get<ProgramListResponse>(url);
    } catch (error) {
      console.error("Error fetching programs:", error);
      throw error;
    }
  },

  // Get single program by ID
  async getProgramById(id: number): Promise<ApiResponse<Program>> {
    try {
      return await apiService.get<Program>(API_ENDPOINTS.PROGRAMS.BY_ID(id));
    } catch (error) {
      console.error("Error fetching program:", error);
      throw error;
    }
  },

  // Create new program
  async createProgram(
    data: CreateProgramRequest
  ): Promise<ApiResponse<Program>> {
    try {
      return await apiService.post<Program>(API_ENDPOINTS.PROGRAMS.BASE, data);
    } catch (error) {
      console.error("Error creating program:", error);
      throw error;
    }
  },

  // Update program
  async updateProgram(
    id: number,
    data: UpdateProgramRequest
  ): Promise<ApiResponse<Program>> {
    try {
      return await apiService.put<Program>(
        API_ENDPOINTS.PROGRAMS.BY_ID(id),
        data
      );
    } catch (error) {
      console.error("Error updating program:", error);
      throw error;
    }
  },

  // Delete program
  async deleteProgram(id: number): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(API_ENDPOINTS.PROGRAMS.BY_ID(id));
    } catch (error) {
      console.error("Error deleting program:", error);
      throw error;
    }
  },

  // Get programs by department
  async getProgramsByDepartment(
    departmentId: number,
    query?: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
    }
  ): Promise<ApiResponse<ProgramListResponse>> {
    try {
      const params = new URLSearchParams();
      params.append("departmentId", departmentId.toString());

      if (query?.page) params.append("page", query.page.toString());
      if (query?.limit) params.append("limit", query.limit.toString());
      if (query?.search) params.append("search", query.search);
      if (query?.isActive !== undefined)
        params.append("isActive", query.isActive.toString());

      const url = `${API_ENDPOINTS.PROGRAMS.BASE}?${params.toString()}`;
      return await apiService.get<ProgramListResponse>(url);
    } catch (error) {
      console.error("Error fetching programs by department:", error);
      throw error;
    }
  },

  // Get program statistics
  async getProgramStats(id: number): Promise<ApiResponse<ProgramStats>> {
    try {
      return await apiService.get<ProgramStats>(
        `${API_ENDPOINTS.PROGRAMS.BY_ID(id)}/stats`
      );
    } catch (error) {
      console.error("Error fetching program stats:", error);
      throw error;
    }
  },
};
