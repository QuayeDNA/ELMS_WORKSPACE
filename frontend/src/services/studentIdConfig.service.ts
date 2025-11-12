import api from './api';
import {
  StudentIdConfig,
  CreateStudentIdConfigDTO,
  UpdateStudentIdConfigDTO,
  StudentIdPreview,
} from '@/types/studentIdConfig';

interface ApiResponse<T> {
  data: T;
}

/**
 * Student ID Configuration Service
 * Manages student ID generation configuration for institutions
 */

/**
 * Get student ID configuration for an institution
 */
export const getStudentIdConfig = async (institutionId: number): Promise<StudentIdConfig> => {
  const response = await api.get<ApiResponse<StudentIdConfig>>(`/student-id-config/institution/${institutionId}`);
  return response.data!.data;
};

/**
 * Create student ID configuration
 */
export const createStudentIdConfig = async (
  data: CreateStudentIdConfigDTO
): Promise<StudentIdConfig> => {
  const response = await api.post<ApiResponse<StudentIdConfig>>('/student-id-config', data);
  return response.data!.data;
};

/**
 * Update student ID configuration
 */
export const updateStudentIdConfig = async (
  institutionId: number,
  data: UpdateStudentIdConfigDTO
): Promise<StudentIdConfig> => {
  const response = await api.put<ApiResponse<StudentIdConfig>>(`/student-id-config/institution/${institutionId}`, data);
  return response.data!.data;
};

/**
 * Preview student ID configuration
 */
export const previewStudentIdConfig = async (
  data: CreateStudentIdConfigDTO
): Promise<StudentIdPreview> => {
  const response = await api.post<ApiResponse<StudentIdPreview>>('/student-id-config/preview', data);
  return response.data!.data;
};
