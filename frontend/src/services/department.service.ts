import { apiService } from "./api";
import { API_ENDPOINTS } from "@/utils/constants";
import {
  ApiResponse,
  Department,
  DepartmentListResponse,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentQuery,
  DepartmentAnalytics,
  DepartmentProgramsResponse,
  DepartmentInstructorsResponse,
  DepartmentStudentsResponse,
} from "@/types/shared";
import { programService } from "./program.service";
import { courseService } from "./course.service";
import { instructorService } from "./instructor.service";
import { studentService } from "./student.service";
import { InstructorFilters } from "@/types/instructor";
import { StudentFilters } from "@/types/student";

export const departmentService = {
  // Get all departments with pagination and filtering
  async getDepartments(
    query?: DepartmentQuery
  ): Promise<ApiResponse<DepartmentListResponse>> {
    try {
      const params = new URLSearchParams();

      if (query?.facultyId)
        params.append("facultyId", query.facultyId.toString());
      if (query?.institutionId)
        params.append("institutionId", query.institutionId.toString());
      if (query?.isActive !== undefined)
        params.append("isActive", query.isActive.toString());
      if (query?.page) params.append("page", query.page.toString());
      if (query?.limit) params.append("limit", query.limit.toString());
      if (query?.search) params.append("search", query.search);
      if (query?.sortBy) params.append("sortBy", query.sortBy);
      if (query?.sortOrder) params.append("sortOrder", query.sortOrder);

      const queryString = params.toString();
      const url = queryString
        ? `${API_ENDPOINTS.DEPARTMENTS.BASE}?${queryString}`
        : API_ENDPOINTS.DEPARTMENTS.BASE;

      return await apiService.get<DepartmentListResponse>(url);
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
  },

  // Get single department by ID
  async getDepartmentById(id: number): Promise<ApiResponse<Department>> {
    try {
      return await apiService.get<Department>(
        API_ENDPOINTS.DEPARTMENTS.BY_ID(id)
      );
    } catch (error) {
      console.error("Error fetching department:", error);
      throw error;
    }
  },

  // Create new department
  async createDepartment(
    data: CreateDepartmentRequest
  ): Promise<ApiResponse<Department>> {
    try {
      return await apiService.post<Department>(
        API_ENDPOINTS.DEPARTMENTS.BASE,
        data
      );
    } catch (error) {
      console.error("Error creating department:", error);
      throw error;
    }
  },

  // Update department
  async updateDepartment(
    id: number,
    data: UpdateDepartmentRequest
  ): Promise<ApiResponse<Department>> {
    try {
      return await apiService.put<Department>(
        API_ENDPOINTS.DEPARTMENTS.BY_ID(id),
        data
      );
    } catch (error) {
      console.error("Error updating department:", error);
      throw error;
    }
  },

  // Delete department
  async deleteDepartment(id: number): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(API_ENDPOINTS.DEPARTMENTS.BY_ID(id));
    } catch (error) {
      console.error("Error deleting department:", error);
      throw error;
    }
  },

  // Get departments by faculty
  async getDepartmentsByFaculty(
    facultyId: number,
    query?: DepartmentQuery
  ): Promise<ApiResponse<DepartmentListResponse>> {
    try {
      const params = new URLSearchParams();
      params.append("facultyId", facultyId.toString());

      if (query?.page) params.append("page", query.page.toString());
      if (query?.limit) params.append("limit", query.limit.toString());
      if (query?.search) params.append("search", query.search);
      if (query?.isActive !== undefined)
        params.append("isActive", query.isActive.toString());

      const url = `${API_ENDPOINTS.DEPARTMENTS.BASE}?${params.toString()}`;
      return await apiService.get<DepartmentListResponse>(url);
    } catch (error) {
      console.error("Error fetching departments by faculty:", error);
      throw error;
    }
  },

  // Get department analytics
  async getDepartmentAnalytics(
    facultyId?: number
  ): Promise<ApiResponse<DepartmentAnalytics>> {
    try {
      const params = facultyId ? `?facultyId=${facultyId}` : "";
      return await apiService.get<DepartmentAnalytics>(
        `${API_ENDPOINTS.DEPARTMENTS.BASE}/analytics${params}`
      );
    } catch (error) {
      console.error("Error fetching department analytics:", error);
      throw error;
    }
  },

  // Get programs offered by department
  async getDepartmentPrograms(
    departmentId: number,
    query?: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
    }
  ): Promise<ApiResponse<DepartmentProgramsResponse>> {
    try {
      return await programService.getProgramsByDepartment(departmentId, query);
    } catch (error) {
      console.error("Error fetching department programs:", error);
      throw error;
    }
  },

  // Get courses offered by department
  async getDepartmentCourses(
    departmentId: number,
    query?: {
      page?: number;
      limit?: number;
      search?: string;
      level?: number;
      isActive?: boolean;
    }
  ): Promise<unknown> {
    try {
      return await courseService.getCoursesByDepartment(departmentId, query);
    } catch (error) {
      console.error("Error fetching department courses:", error);
      throw error;
    }
  },

  // Get instructors in department
  async getDepartmentInstructors(
    departmentId: number,
    filters: Partial<InstructorFilters> = {}
  ): Promise<DepartmentInstructorsResponse> {
    try {
      const response = await instructorService.getInstructorsByDepartment(
        departmentId,
        filters
      );
      return {
        instructors: response.data,
        total: response.pagination.total,
      };
    } catch (error) {
      console.error("Error fetching department instructors:", error);
      throw error;
    }
  },

  // Get students in department (via programs)
  async getDepartmentStudents(
    departmentId: number,
    filters: Partial<StudentFilters> = {}
  ): Promise<DepartmentStudentsResponse> {
    try {
      const response = await studentService.getStudentsByDepartment(
        departmentId,
        filters
      );
      return {
        students: response.data,
        total: response.pagination.total,
      };
    } catch (error) {
      console.error("Error fetching department students:", error);
      throw error;
    }
  },
};
