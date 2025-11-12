/**
 * Public Registration Service
 * Handles public student registration without authentication
 */

import axios from 'axios';
import {
  PublicRegistrationRequest,
  PublicRegistrationResponse,
  ProgramsResponse,
  AcademicYearsResponse,
} from '@/types/registration';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Register a new student (public endpoint, no auth required)
 */
export const registerStudent = async (
  data: PublicRegistrationRequest
): Promise<PublicRegistrationResponse> => {
  const response = await axios.post<PublicRegistrationResponse>(
    `${API_URL}/api/public/students/register`,
    data
  );
  return response.data;
};

/**
 * Get available programs for an institution (public endpoint)
 */
export const getAvailablePrograms = async (
  institutionId: number
): Promise<ProgramsResponse> => {
  const response = await axios.get<ProgramsResponse>(
    `${API_URL}/api/public/institutions/${institutionId}/programs`
  );
  return response.data;
};

/**
 * Get available academic years for an institution (public endpoint)
 */
export const getAvailableAcademicYears = async (
  institutionId: number
): Promise<AcademicYearsResponse> => {
  const response = await axios.get<AcademicYearsResponse>(
    `${API_URL}/api/public/institutions/${institutionId}/academic-years`
  );
  return response.data;
};
