import { apiService } from "./api";
import { ApiResponse } from "@/types/api";
import {
  Instructor,
  InstructorsResponse,
  CreateInstructorRequest,
  UpdateInstructorRequest,
  InstructorFilters,
  DepartmentAssignment,
  InstructorStats,
  InstructorWorkload,
  BulkInstructorImportResponse,
} from "@/types/instructor";

class InstructorService {
  private readonly basePath = "/api/instructors";

  // Get all instructors with pagination and filtering
  async getInstructors(
    filters: InstructorFilters = {}
  ): Promise<InstructorsResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });

    const response = await apiService.get<{
      success: boolean;
      data: Instructor[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
      filters: InstructorFilters;
    }>(`${this.basePath}?${params.toString()}`);

    if (!response.success || !response.data) {
      throw new Error("Failed to fetch instructors");
    }

    // The response.data contains the actual API response
    const apiData = response.data;

    // Since the backend returns {success, data, pagination, filters}
    // And the apiService wraps it, we need to handle both cases
    let result;
    if (apiData && typeof apiData === 'object' && 'success' in apiData) {
      // apiData is the full backend response
      result = {
        success: apiData.success,
        data: apiData.data,
        pagination: apiData.pagination,
        filters: apiData.filters,
      };
    } else {
      // apiData is just the instructors array (fallback)
      const instructorsArray = Array.isArray(apiData) ? apiData : [];
      result = {
        success: true,
        data: instructorsArray,
        pagination: {
          page: 1,
          limit: 10,
          total: instructorsArray.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        filters: {},
      };
    }

    return result;
  }

  // Get instructor by staff ID
  async getInstructorByStaffId(staffId: string): Promise<Instructor> {
    const response = await apiService.get<ApiResponse<Instructor>>(
      `${this.basePath}/by-staff-id/${staffId}`
    );

    if (!response.data?.data) {
      throw new Error("Instructor not found");
    }

    return response.data.data;
  }

  // Get instructor by ID
  async getInstructorById(id: number): Promise<Instructor> {
    const response = await apiService.get<ApiResponse<Instructor>>(
      `${this.basePath}/${id}`
    );

    if (!response.data?.data) {
      throw new Error("Instructor not found");
    }

    return response.data.data;
  }

  // Create new instructor
  async createInstructor(
    instructorData: CreateInstructorRequest
  ): Promise<Instructor> {
    const response = await apiService.post<ApiResponse<Instructor>>(
      this.basePath,
      instructorData
    );

    if (!response.data?.data) {
      throw new Error("Failed to create instructor");
    }

    return response.data.data;
  }

  // Update instructor
  async updateInstructor(
    id: number,
    updates: UpdateInstructorRequest
  ): Promise<Instructor> {
    const response = await apiService.put<ApiResponse<Instructor>>(
      `${this.basePath}/${id}`,
      updates
    );

    if (!response.data?.data) {
      throw new Error("Failed to update instructor");
    }

    return response.data.data;
  }

  // Delete instructor
  async deleteInstructor(id: number): Promise<void> {
    await apiService.delete(`${this.basePath}/${id}`);
  }

  // Assign instructor to department
  async assignToDepartment(
    id: number,
    assignment: DepartmentAssignment
  ): Promise<Instructor> {
    const response = await apiService.post<ApiResponse<Instructor>>(
      `${this.basePath}/${id}/departments`,
      assignment
    );

    if (!response.data?.data) {
      throw new Error("Failed to assign instructor to department");
    }

    return response.data.data;
  }

  // Remove instructor from department
  async removeFromDepartment(
    id: number,
    departmentId: number
  ): Promise<Instructor> {
    const response = await apiService.delete<ApiResponse<Instructor>>(
      `${this.basePath}/${id}/departments/${departmentId}`
    );

    if (!response.data?.data) {
      throw new Error("Failed to remove instructor from department");
    }

    return response.data.data;
  }

  // Update instructor status
  async updateInstructorStatus(
    id: number,
    status: { employmentStatus?: string; employmentType?: string }
  ): Promise<Instructor> {
    const response = await apiService.patch<ApiResponse<Instructor>>(
      `${this.basePath}/${id}/status`,
      status
    );

    if (!response.data?.data) {
      throw new Error("Failed to update instructor status");
    }

    return response.data.data;
  }

  // Get instructor statistics
  async getInstructorStats(
    filters: Partial<InstructorFilters> = {}
  ): Promise<InstructorStats> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });

    const response = await apiService.get<ApiResponse<InstructorStats>>(
      `${this.basePath}/stats?${params.toString()}`
    );

    if (!response.data?.data) {
      throw new Error("Failed to fetch instructor statistics");
    }

    return response.data.data;
  }

  // Get instructor workload
  async getInstructorWorkload(id: number): Promise<InstructorWorkload> {
    const response = await apiService.get<ApiResponse<InstructorWorkload>>(
      `${this.basePath}/${id}/workload`
    );

    if (!response.data?.data) {
      throw new Error("Failed to fetch instructor workload");
    }

    return response.data.data;
  }

  // Search instructors
  async searchInstructors(
    query: string,
    filters: Partial<InstructorFilters> = {}
  ): Promise<Instructor[]> {
    const searchFilters = {
      ...filters,
      search: query,
      limit: 50, // Reasonable limit for search results
    };

    const response = await this.getInstructors(searchFilters);
    return response.data;
  }

  // Get instructors by department
  async getInstructorsByDepartment(
    departmentId: number,
    filters: Partial<InstructorFilters> = {}
  ): Promise<InstructorsResponse> {
    return this.getInstructors({
      ...filters,
      departmentId,
    });
  }

  // Get instructors by faculty
  async getInstructorsByFaculty(
    facultyId: number,
    filters: Partial<InstructorFilters> = {}
  ): Promise<InstructorsResponse> {
    return this.getInstructors({
      ...filters,
      facultyId,
    });
  }

  // Get instructors by institution
  async getInstructorsByInstitution(
    institutionId: number,
    filters: Partial<InstructorFilters> = {}
  ): Promise<InstructorsResponse> {
    return this.getInstructors({
      ...filters,
      institutionId,
    });
  }

  // Get instructors by academic rank
  async getInstructorsByRank(
    academicRank: string,
    filters: Partial<InstructorFilters> = {}
  ): Promise<InstructorsResponse> {
    return this.getInstructors({
      ...filters,
      academicRank: academicRank as InstructorFilters["academicRank"],
    });
  }

  // Export instructors data
  async exportInstructors(
    filters: InstructorFilters = {},
    format: "csv" | "excel" = "csv"
  ): Promise<Blob> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });

    params.append("format", format);

    const response = await apiService.get(
      `${this.basePath}/export?${params.toString()}`,
      { responseType: "blob" }
    );
    return response.data as Blob;
  }

  // Bulk import instructors
  async bulkImportInstructors(
    instructors: CreateInstructorRequest[]
  ): Promise<BulkInstructorImportResponse> {
    const response = await apiService.post<
      ApiResponse<BulkInstructorImportResponse>
    >(`${this.basePath}/bulk-import`, { instructors });

    if (!response.data?.data) {
      throw new Error("Failed to import instructors");
    }

    return response.data.data;
  }
}

export const instructorService = new InstructorService();
