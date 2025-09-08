import { apiService } from './api';
import { ApiResponse } from '@/types/api';
import {
  Student,
  StudentsResponse,
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentFilters,
  BulkStudentImport,
  BulkStudentImportResponse,
  StudentStats
} from '@/types/student';
import { API_ENDPOINTS } from '@/utils/constants';

class StudentService {
  private readonly basePath = API_ENDPOINTS.STUDENTS.BASE;

  // Get all students with pagination and filtering
  async getStudents(filters: StudentFilters = {}): Promise<StudentsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
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
    }>(
      `${this.basePath}?${params.toString()}`
    );
    
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch students');
    }
    
    // Ensure the response structure matches what the frontend expects
    return {
      success: response.success,
      data: response.data.data || [],
      pagination: response.data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      },
      filters: filters
    };
  }

  // Get single student by ID
  async getStudentById(id: number): Promise<Student> {
    const response = await apiService.get<ApiResponse<Student>>(
      `${this.basePath}/${id}`
    );
    
    if (!response.data?.data) {
      throw new Error('Student not found');
    }
    
    return response.data.data;
  }

  // Create new student
  async createStudent(studentData: CreateStudentRequest): Promise<Student> {
    const response = await apiService.post<ApiResponse<Student>>(
      this.basePath,
      studentData
    );
    
    if (!response.data?.data) {
      throw new Error('Failed to create student');
    }
    
    return response.data.data;
  }

  // Update student
  async updateStudent(id: number, updates: UpdateStudentRequest): Promise<Student> {
    const response = await apiService.put<ApiResponse<Student>>(
      `${this.basePath}/${id}`,
      updates
    );
    
    if (!response.data?.data) {
      throw new Error('Failed to update student');
    }
    
    return response.data.data;
  }

  // Delete student
  async deleteStudent(id: number): Promise<void> {
    await apiService.delete(`${this.basePath}/${id}`);
  }

  // Bulk import students
  async bulkImportStudents(importData: BulkStudentImport): Promise<BulkStudentImportResponse> {
    const response = await apiService.post<BulkStudentImportResponse>(
      `${this.basePath}/bulk-import`,
      importData
    );
    
    if (!response.success || !response.data) {
      throw new Error('Failed to import students');
    }
    
    return response.data;
  }

  // Update student status
  async updateStudentStatus(
    id: number, 
    status: { enrollmentStatus?: string; academicStatus?: string }
  ): Promise<Student> {
    const response = await apiService.patch<ApiResponse<Student>>(
      `${this.basePath}/${id}/status`,
      status
    );
    
    if (!response.data?.data) {
      throw new Error('Failed to update student status');
    }
    
    return response.data.data;
  }

  // Get student statistics
  async getStudentStats(filters: Partial<StudentFilters> = {}): Promise<StudentStats> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiService.get<ApiResponse<StudentStats>>(
      `${this.basePath}/stats?${params.toString()}`
    );
    
    if (!response.data?.data) {
      throw new Error('Failed to fetch student statistics');
    }
    
    return response.data.data;
  }

  // Search students
  async searchStudents(query: string, filters: Partial<StudentFilters> = {}): Promise<Student[]> {
    const searchFilters = {
      ...filters,
      search: query,
      limit: 50 // Reasonable limit for search results
    };

    const response = await this.getStudents(searchFilters);
    return response.data;
  }

  // Get students by program
  async getStudentsByProgram(programId: number, filters: Partial<StudentFilters> = {}): Promise<StudentsResponse> {
    return this.getStudents({
      ...filters,
      programId
    });
  }

  // Get students by department
  async getStudentsByDepartment(departmentId: number, filters: Partial<StudentFilters> = {}): Promise<StudentsResponse> {
    return this.getStudents({
      ...filters,
      departmentId
    });
  }

  // Get students by faculty
  async getStudentsByFaculty(facultyId: number, filters: Partial<StudentFilters> = {}): Promise<StudentsResponse> {
    return this.getStudents({
      ...filters,
      facultyId
    });
  }

  // Get students by institution
  async getStudentsByInstitution(institutionId: number, filters: Partial<StudentFilters> = {}): Promise<StudentsResponse> {
    return this.getStudents({
      ...filters,
      institutionId
    });
  }

  // Export students data
  async exportStudents(filters: StudentFilters = {}, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    
    params.append('format', format);

    const response = await apiService.get(
      `${this.basePath}/export?${params.toString()}`,
      { responseType: 'blob' }
    );
    return response.data as Blob;
  }

  // Download student import template
  async downloadImportTemplate(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await apiService.get(
      `${this.basePath}/import-template?format=${format}`,
      { responseType: 'blob' }
    );
    return response.data as Blob;
  }
}

export const studentService = new StudentService();
