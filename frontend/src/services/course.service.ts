import { apiService } from './api';
import { 
  Course, 
  CreateCourseRequest, 
  UpdateCourseRequest, 
  CourseQuery, 
  CourseStats,
  ProgramCourse,
  CreateProgramCourseRequest,
  UpdateProgramCourseRequest,
} from '../types/course';

export const courseService = {
  // Get courses with filtering and pagination
  async getCourses(query: CourseQuery = {}) {
    const params = new URLSearchParams();
    
    if (query.courseType) params.append('courseType', query.courseType);
    if (query.level) params.append('level', query.level.toString());
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString());
    if (query.search) params.append('search', query.search);
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());

    return apiService.get<{
      courses: Course[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/courses?${params.toString()}`);
  },

  // Get course by ID
  async getCourseById(id: number) {
    return apiService.get<Course>(`/courses/${id}`);
  },

  // Create new course
  async createCourse(data: CreateCourseRequest) {
    return apiService.post<Course>('/courses', data);
  },

  // Update course
  async updateCourse(id: number, data: UpdateCourseRequest) {
    return apiService.put<Course>(`/courses/${id}`, data);
  },

  // Delete course
  async deleteCourse(id: number) {
    return apiService.delete(`/courses/${id}`);
  },

  // Get course statistics
  async getCourseStats() {
    return apiService.get<CourseStats>('/courses/stats');
  },

  // Program-Course Management
  
  // Get courses for a program
  async getProgramCourses(programId: number) {
    return apiService.get<ProgramCourse[]>(`/courses/program/${programId}`);
  },

  // Add course to program
  async addCourseToProgram(data: CreateProgramCourseRequest) {
    return apiService.post<ProgramCourse>('/courses/program-course', data);
  },

  // Update program course relationship
  async updateProgramCourse(id: number, data: UpdateProgramCourseRequest) {
    return apiService.put<ProgramCourse>(`/courses/program-course/${id}`, data);
  },

  // Remove course from program
  async removeCourseFromProgram(id: number) {
    return apiService.delete(`/courses/program-course/${id}`);
  }
};
