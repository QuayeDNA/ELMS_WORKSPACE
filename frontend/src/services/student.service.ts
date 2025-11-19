import { ApiResponse } from '@/types/shared/api';
import { apiService } from "./api";
import {
  Student,
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentFilters,
  BulkStudentImport,
  BulkStudentImportResponse,
  BackendStudentStats,
  StudentsResponse,
} from "@/types/student";
import {
  API_ENDPOINTS,
  API_CONFIG,
  STUDENT_CONSTANTS,
  ERROR_MESSAGES,
  STORAGE_KEYS,
} from "@/constants";
import { transformBackendStudent, transformBackendStudents } from '@/utils/studentHelpers';

/**
 * Student Service Class
 * Handles all student-related API operations using centralized constants
 */
class StudentService {
  private readonly basePath = API_ENDPOINTS.STUDENTS.BASE;

  /**
   * Get all students with pagination and filtering
   */
  async getStudents(filters: StudentFilters = {}): Promise<StudentsResponse> {
    try {
      // Build query parameters using API_CONFIG defaults
      const params = new URLSearchParams();

      // Apply pagination defaults from constants
      const page = filters.page || API_CONFIG.PAGINATION.DEFAULT_PAGE;
      const limit = Math.min(
        filters.limit || API_CONFIG.PAGINATION.DEFAULT_LIMIT,
        API_CONFIG.PAGINATION.MAX_LIMIT
      );

      params.append("page", page.toString());
      params.append("limit", limit.toString());

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          key !== "page" &&
          key !== "limit"
        ) {
          params.append(key, String(value));
        }
      });

      const response = await apiService.get<{
        success: boolean;
        data: Student[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
        filters?: StudentFilters;
      }>(`${this.basePath}?${params.toString()}`);

      if (!response.success) {
        throw new Error(response.message || ERROR_MESSAGES.SERVER);
      }

      if (!response.data) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND);
      }

      // Handle the response structure - response.data contains the backend response
      const apiData = response.data;

      // Early return for full backend response structure
      if (apiData && typeof apiData === 'object' && 'success' in apiData) {
        // Transform backend users to frontend students
        const transformedData = transformBackendStudents(apiData.data || []);
        return {
          success: apiData.success,
          data: transformedData,
          pagination: apiData.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
          filters: apiData.filters || {},
        };
      }

      // Handle array response (fallback)
      const studentsArray = Array.isArray(apiData) ? apiData : [];
      const transformedStudents = transformBackendStudents(studentsArray);
      return {
        success: true,
        data: transformedStudents,
        pagination: {
          page: 1,
          limit: 20,
          total: transformedStudents.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        filters: {},
      };
    } catch (error) {
      console.error("Error fetching students:", error);
      throw error;
    }
  }

  /**
   * Get single student by ID
   */
  async getStudentById(id: number): Promise<Student> {
    try {
      const response = await apiService.get<{
        success: boolean;
        data: Student;
      }>(API_ENDPOINTS.STUDENTS.BY_ID(id));

      if (!response.success || !response.data) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND);
      }

      // Handle the response structure
      const apiData = response.data;

      // Early return for nested response structure
      if (apiData && typeof apiData === 'object' && 'success' in apiData) {
        return apiData.data;
      }

      return apiData as Student;
    } catch (error) {
      console.error(`Error fetching student ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get student by student ID
   */
  async getStudentByStudentId(studentId: string): Promise<Student> {
    try {
      const response = await apiService.get<{
        success: boolean;
        data: Student;
      }>(`${this.basePath}/by-student-id/${studentId}`);

      if (!response.success || !response.data) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND);
      }

      // Handle the response structure and transform to Student
      const apiData = response.data;

      // Early return for nested response structure
      if (apiData && typeof apiData === 'object' && 'success' in apiData) {
        const student = transformBackendStudent(apiData.data);
        if (!student) throw new Error(ERROR_MESSAGES.NOT_FOUND);
        return student;
      }

      const student = transformBackendStudent(apiData);
      if (!student) throw new Error(ERROR_MESSAGES.NOT_FOUND);
      return student;
    } catch (error) {
      console.error(
        `Error fetching student by student ID ${studentId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get student by user ID
   */
  async getStudentByUserId(userId: number): Promise<Student> {
    try {
      const response = await apiService.get<{
        success: boolean;
        data: Student;
      }>(`${this.basePath}/by-user-id/${userId}`);

      if (!response.success || !response.data) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND);
      }

      // Handle the response structure and transform to Student
      const apiData = response.data;

      // Early return for nested response structure
      if (apiData && typeof apiData === 'object' && 'success' in apiData) {
        const student = transformBackendStudent(apiData.data);
        if (!student) throw new Error(ERROR_MESSAGES.NOT_FOUND);
        return student;
      }

      const student = transformBackendStudent(apiData);
      if (!student) throw new Error(ERROR_MESSAGES.NOT_FOUND);
      return student;
    } catch (error) {
      console.error(
        `Error fetching student by user ID ${userId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Create new student
   */
  async createStudent(studentData: CreateStudentRequest): Promise<Student> {
    try {
      // Validate required fields using constants
      this.validateStudentData(studentData);

      const response = await apiService.post<{
        success: boolean;
        data: Student;
      }>(this.basePath, studentData);

      if (!response.success || !response.data) {
        throw new Error(ERROR_MESSAGES.SERVER);
      }

      // Handle the response structure and transform to Student
      const apiData = response.data;

      // Early return for nested response structure
      if (apiData && typeof apiData === 'object' && 'success' in apiData) {
        const student = transformBackendStudent(apiData.data);
        if (!student) throw new Error(ERROR_MESSAGES.SERVER);
        return student;
      }

      const student = transformBackendStudent(apiData);
      if (!student) throw new Error(ERROR_MESSAGES.SERVER);
      return student;
    } catch (error) {
      console.error("Error creating student:", error);
      throw error;
    }
  }

  /**
   * Update student
   */
  async updateStudent(
    id: number,
    updates: UpdateStudentRequest
  ): Promise<Student> {
    try {
      const response = await apiService.put<{
        success: boolean;
        data: Student;
      }>(API_ENDPOINTS.STUDENTS.BY_ID(id), updates);

      if (!response.success || !response.data) {
        throw new Error(ERROR_MESSAGES.SERVER);
      }

      // Handle the response structure and transform to Student
      const apiData = response.data;

      // Early return for nested response structure
      if (apiData && typeof apiData === 'object' && 'success' in apiData) {
        const student = transformBackendStudent(apiData.data);
        if (!student) throw new Error(ERROR_MESSAGES.SERVER);
        return student;
      }

      const student = transformBackendStudent(apiData);
      if (!student) throw new Error(ERROR_MESSAGES.SERVER);
      return student;
    } catch (error) {
      console.error(`Error updating student ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete student
   */
  async deleteStudent(id: number): Promise<void> {
    try {
      await apiService.delete(API_ENDPOINTS.STUDENTS.BY_ID(id));
    } catch (error) {
      console.error(`Error deleting student ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update student status
   */
  async updateStudentStatus(
    id: number,
    status: {
      enrollmentStatus?: keyof typeof STUDENT_CONSTANTS.ENROLLMENT_STATUS;
      academicStatus?: keyof typeof STUDENT_CONSTANTS.ACADEMIC_STATUS;
    }
  ): Promise<Student> {
    try {
      // Validate status values against constants
      if (
        status.enrollmentStatus &&
        !Object.keys(STUDENT_CONSTANTS.ENROLLMENT_STATUS).includes(
          status.enrollmentStatus
        )
      ) {
        throw new Error("Invalid enrollment status");
      }

      if (
        status.academicStatus &&
        !Object.keys(STUDENT_CONSTANTS.ACADEMIC_STATUS).includes(
          status.academicStatus
        )
      ) {
        throw new Error("Invalid academic status");
      }

      const response = await apiService.patch<Student | ApiResponse<Student>>(
        API_ENDPOINTS.STUDENTS.UPDATE_STATUS(id),
        status
      );

      // Early return for direct Student response
      if (response.data && !('success' in response.data)) {
        const student = transformBackendStudent(response.data);
        if (!student) throw new Error(ERROR_MESSAGES.SERVER);
        return student;
      }

      // Handle nested ApiResponse structure
      const apiResponse = response.data as ApiResponse<Student>;
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(ERROR_MESSAGES.SERVER);
      }

      const student = transformBackendStudent(apiResponse.data);
      if (!student) throw new Error(ERROR_MESSAGES.SERVER);
      return student;
    } catch (error) {
      console.error(`Error updating student status ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get student statistics
   * Returns the backend stats structure directly
   */
  async getStudentStats(
    filters: Partial<StudentFilters> = {}
  ): Promise<BackendStudentStats> {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });

      const response = await apiService.get<BackendStudentStats>(
        `${API_ENDPOINTS.STUDENTS.STATS}?${params.toString()}`
      );

      if (!response.data) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND);
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching student statistics:", error);
      throw error;
    }
  }

  /**
   * Bulk import students
   */
  async bulkImportStudents(
    importData: BulkStudentImport
  ): Promise<BulkStudentImportResponse> {
    try {
      const response = await apiService.post<BulkStudentImportResponse>(
        API_ENDPOINTS.STUDENTS.BULK_IMPORT,
        importData
      );

      if (!response.data) {
        throw new Error(ERROR_MESSAGES.SERVER);
      }

      return response.data;
    } catch (error) {
      console.error("Error importing students:", error);
      throw error;
    }
  }

  /**
   * Export students data
   */
  async exportStudents(
    filters: Partial<StudentFilters> = {},
    format: "csv" | "excel" = "csv"
  ): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append("format", format);

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });

      const response = await apiService.get<Blob>(
        `${API_ENDPOINTS.STUDENTS.EXPORT}?${params.toString()}`,
        { responseType: "blob" }
      );

      return response.data as Blob;
    } catch (error) {
      console.error("Error exporting students:", error);
      throw error;
    }
  }

  /**
   * Get students by program
   */
  async getStudentsByProgram(
    programId: number,
    filters: Partial<StudentFilters> = {}
  ): Promise<StudentsResponse> {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });

      const response = await apiService.get<StudentsResponse>(
        `${API_ENDPOINTS.STUDENTS.BY_PROGRAM(programId)}?${params.toString()}`
      );

      // Early return for direct StudentsResponse structure
      if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data && 'pagination' in response.data) {
        return response.data as StudentsResponse;
      }

      // Handle nested ApiResponse containing StudentsResponse
      if (!response.data || typeof response.data !== 'object' || !('success' in response.data) || !('data' in response.data)) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND);
      }

      const apiResponse = response.data as ApiResponse<StudentsResponse>;
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND);
      }

      return apiResponse.data;
    } catch (error) {
      console.error(`Error fetching students by program ${programId}:`, error);
      throw error;
    }
  }

  /**
   * Get students by department
   */
  async getStudentsByDepartment(
    departmentId: number,
    filters: Partial<StudentFilters> = {}
  ): Promise<StudentsResponse> {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });

      const response = await apiService.get<StudentsResponse>(
        `${this.basePath}?departmentId=${departmentId}&${params.toString()}`
      );

      // Early return for direct StudentsResponse structure
      if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data && 'pagination' in response.data) {
        return response.data as StudentsResponse;
      }

      // Handle nested ApiResponse containing StudentsResponse
      if (!response.data || typeof response.data !== 'object' || !('success' in response.data) || !('data' in response.data)) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND);
      }

      const apiResponse = response.data as ApiResponse<StudentsResponse>;
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND);
      }

      return apiResponse.data;
    } catch (error) {
      console.error(
        `Error fetching students by department ${departmentId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Search students with caching
   */
  async searchStudents(
    query: string,
    filters: Partial<StudentFilters> = {}
  ): Promise<Student[]> {
    try {
      const searchFilters = {
        ...filters,
        search: query,
        limit: 50, // Reasonable limit for search results
      };

      const response = await this.getStudents(searchFilters);
      return response.data;
    } catch (error) {
      console.error("Error searching students:", error);
      throw error;
    }
  }

  /**
   * Validate student data against constants
   */
  private validateStudentData(data: CreateStudentRequest): void {
    const errors: string[] = [];

    // Validate basic user data
    if (!data.email) errors.push("Email is required");
    if (!data.firstName) errors.push("First name is required");
    if (!data.lastName) errors.push("Last name is required");
    if (!data.password) errors.push("Password is required");

    // Validate student-specific data
    if (!data.studentId) errors.push("Student ID is required");
    if (!data.programId) errors.push("Program is required");
    if (!data.level || data.level <= 0)
      errors.push("Valid level is required");

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
      errors.push("Invalid email format");
    }

    // Validate gender
    if (
      data.gender &&
      !Object.values(STUDENT_CONSTANTS.GENDER).includes(
        data.gender as keyof typeof STUDENT_CONSTANTS.GENDER
      )
    ) {
      errors.push("Invalid gender");
    }

    // Validate level
    if (
      data.level &&
      !STUDENT_CONSTANTS.LEVELS.some(
        (level) => level.value === data.level.toString()
      )
    ) {
      errors.push("Invalid level");
    }

    // Validate semester
    if (
      data.semester &&
      !STUDENT_CONSTANTS.SEMESTERS.some(
        (semester) => semester.value === data.semester!.toString()
      )
    ) {
      errors.push("Invalid semester");
    }

    // Validate password strength
    if (data.password && data.password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }
  }

  /**
   * Save filters to local storage
   */
  saveFilters(filters: StudentFilters): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.STUDENTS_FILTERS,
        JSON.stringify(filters)
      );
    } catch (error) {
      console.warn("Failed to save student filters to localStorage:", error);
    }
  }

  /**
   * Load filters from local storage
   */
  loadFilters(): StudentFilters | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS_FILTERS);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn("Failed to load student filters from localStorage:", error);
      return null;
    }
  }

  clearFilters(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.STUDENTS_FILTERS);
    } catch (error) {
      console.warn("Failed to clear student filters from localStorage:", error);
    }
  }
}

// Export singleton instance
export const studentService = new StudentService();
