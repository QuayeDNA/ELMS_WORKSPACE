import { apiService } from "./api";
import { ApiResponse } from "@/types/api";
import { API_ENDPOINTS } from "@/utils/constants";
import {
  Faculty,
  FacultyListResponse,
  CreateFacultyRequest,
  UpdateFacultyRequest,
  FacultyQuery,
  FacultyFormData,
} from "@/types/faculty";

// ========================================
// FACULTY SERVICE CLASS
// ========================================

class FacultyService {
  private readonly endpoint = API_ENDPOINTS.FACULTIES.BASE;

  // ========================================
  // CORE CRUD OPERATIONS
  // ========================================

  /**
   * Get all faculties with pagination and filtering
   */
  async getFaculties(
    query?: FacultyQuery
  ): Promise<ApiResponse<FacultyListResponse>> {
    try {
      const params = new URLSearchParams();

      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });
      }

      const queryString = params.toString();
      const url = queryString
        ? `${this.endpoint}?${queryString}`
        : this.endpoint;

      return await apiService.get<FacultyListResponse>(url);
    } catch (error) {
      console.error("Error fetching faculties:", error);
      throw error;
    }
  }

  /**
   * Get single faculty by ID
   */
  async getFaculty(id: number): Promise<ApiResponse<Faculty>> {
    try {
      return await apiService.get<Faculty>(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Error fetching faculty ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new faculty
   */
  async createFaculty(
    data: CreateFacultyRequest
  ): Promise<ApiResponse<Faculty>> {
    try {
      return await apiService.post<Faculty>(this.endpoint, data);
    } catch (error) {
      console.error("Error creating faculty:", error);
      throw error;
    }
  }

  /**
   * Update faculty
   */
  async updateFaculty(
    id: number,
    data: UpdateFacultyRequest
  ): Promise<ApiResponse<Faculty>> {
    try {
      return await apiService.put<Faculty>(`${this.endpoint}/${id}`, data);
    } catch (error) {
      console.error(`Error updating faculty ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete faculty
   */
  async deleteFaculty(id: number): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Error deleting faculty ${id}:`, error);
      throw error;
    }
  }

  /**
   * Assign dean to faculty
   */
  async assignDean(
    facultyId: number,
    deanId: number
  ): Promise<ApiResponse<Faculty>> {
    try {
      return await apiService.put<Faculty>(
        `${this.endpoint}/${facultyId}/dean`,
        { deanId }
      );
    } catch (error) {
      console.error(`Error assigning dean to faculty ${facultyId}:`, error);
      throw error;
    }
  }

  /**
   * Remove dean from faculty
   */
  async removeDean(facultyId: number): Promise<ApiResponse<Faculty>> {
    try {
      return await apiService.delete<Faculty>(
        `${this.endpoint}/${facultyId}/dean`
      );
    } catch (error) {
      console.error(`Error removing dean from faculty ${facultyId}:`, error);
      throw error;
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Transform form data to API request format
   */
  transformFormData(formData: FacultyFormData): CreateFacultyRequest {
    return {
      name: formData.name,
      code: formData.code,
      institutionId: parseInt(formData.institutionId),
      description: formData.description || undefined,
    };
  }

  /**
   * Transform faculty data for form display
   */
  transformToFormData(faculty: Faculty): FacultyFormData {
    return {
      name: faculty.name,
      code: faculty.code,
      institutionId: faculty.institutionId.toString(),
      description: faculty.description || "",
    };
  }
}

// ========================================
// EXPORT SINGLETON INSTANCE
// ========================================

export const facultyService = new FacultyService();
