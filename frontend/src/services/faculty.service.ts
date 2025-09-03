import { apiService } from './api';

export const facultyService = {
  async getFaculties(query: any = {}) {
    return apiService.get(`/faculties`);
  },

  async getFacultyById(id: number) {
    return apiService.get(`/faculties/${id}`);
  },

  async getFacultiesByInstitution(institutionId: number) {
    return apiService.get(`/faculties/institution/${institutionId}`);
  }
};