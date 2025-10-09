import apiService from "./api";
import {
  Course,
  CreateCourseData,
  UpdateCourseData,
  CourseQuery,
} from "../types/course";

export const courseService = {
  // Get all courses with pagination and filtering
  async getCourses(query?: CourseQuery) {
    const params = new URLSearchParams();

    if (query?.departmentId)
      params.append("departmentId", query.departmentId.toString());
    if (query?.facultyId)
      params.append("facultyId", query.facultyId.toString());
    if (query?.institutionId)
      params.append("institutionId", query.institutionId.toString());
    if (query?.level) params.append("level", query.level.toString());
    if (query?.courseType) params.append("courseType", query.courseType);
    if (query?.isActive !== undefined)
      params.append("isActive", query.isActive.toString());
    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());
    if (query?.search) params.append("search", query.search);
    if (query?.sortBy) params.append("sortBy", query.sortBy);
    if (query?.sortOrder) params.append("sortOrder", query.sortOrder);

    const response = await apiService.get(`/api/courses?${params.toString()}`);

    if (!response.success || !response.data) {
      throw new Error("Failed to fetch courses");
    }

    // Check if the response data indicates an error
    if (
      typeof response.data === "object" &&
      response.data !== null &&
      "success" in response.data &&
      !response.data.success
    ) {
      const errorData = response.data as { message?: string };
      throw new Error(errorData.message || "Failed to fetch courses");
    }

    return response.data;
  },

  // Get single course by ID
  async getCourseById(id: number): Promise<Course> {
    const response = await apiService.get<Course>(`/api/courses/${id}`);
    if (!response.success || !response.data) {
      throw new Error("Course not found");
    }
    return response.data;
  },

  // Create new course
  async createCourse(data: CreateCourseData) {
    const response = await apiService.post("/api/courses", data);
    if (!response.success || !response.data) {
      throw new Error("Failed to create course");
    }
    return response.data;
  },

  // Update course
  async updateCourse(id: number, data: UpdateCourseData) {
    const response = await apiService.put(`/api/courses/${id}`, data);
    if (!response.success || !response.data) {
      throw new Error("Failed to update course");
    }
    return response.data;
  },

  // Delete course
  async deleteCourse(id: number) {
    const response = await apiService.delete(`/api/courses/${id}`);
    if (!response.success) {
      throw new Error("Failed to delete course");
    }
    return response.data;
  },

  // Get courses by program
  async getCoursesByProgram(
    programId: number,
    query?: {
      page?: number;
      limit?: number;
      search?: string;
      level?: number;
      isActive?: boolean;
    }
  ) {
    const params = new URLSearchParams();
    params.append("programId", programId.toString());

    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());
    if (query?.search) params.append("search", query.search);
    if (query?.level) params.append("level", query.level.toString());
    if (query?.isActive !== undefined)
      params.append("isActive", query.isActive.toString());

    const response = await apiService.get(
      `/api/courses/program/${programId}?${params.toString()}`
    );
    if (!response.success || !response.data) {
      throw new Error("Failed to fetch courses by program");
    }

    // Check if the response data indicates an error
    if (
      typeof response.data === "object" &&
      response.data !== null &&
      "success" in response.data &&
      !response.data.success
    ) {
      const errorData = response.data as { message?: string };
      throw new Error(
        errorData.message || "Failed to fetch courses by program"
      );
    }

    return response.data;
  },

  // Get course statistics
  async getCourseStats(id: number) {
    const response = await apiService.get(`/api/courses/${id}/stats`);
    if (!response.success || !response.data) {
      throw new Error("Failed to fetch course statistics");
    }
    return response.data;
  },
};
