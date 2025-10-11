import { BaseService } from './base.service';
import { ApiResponse } from '@/types/shared/api';
import { API_ENDPOINTS } from '@/utils/constants';
import {
  Program,
  ProgramListResponse,
  CreateProgramRequest,
  UpdateProgramRequest,
  ProgramQuery,
  ProgramStats,
} from '@/types/shared';

/**
 * Program Service
 * Handles all program-related API operations
 */
class ProgramService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.PROGRAMS.BASE);
  }

  // ========================================
  // CORE CRUD OPERATIONS
  // ========================================

  /**
   * Get all programs with pagination and filtering
   */
  async getPrograms(query?: ProgramQuery): Promise<ApiResponse<ProgramListResponse>> {
    return this.getPaginated<Program>(query);
  }

  /**
   * Get single program by ID
   */
  async getProgramById(id: number): Promise<ApiResponse<Program>> {
    return this.getById<Program>(id);
  }

  /**
   * Create new program
   */
  async createProgram(data: CreateProgramRequest): Promise<ApiResponse<Program>> {
    this.validateRequired(data, ['name', 'code', 'departmentId', 'type', 'level', 'durationYears']);
    return this.create<Program, CreateProgramRequest>(data);
  }

  /**
   * Update program
   */
  async updateProgram(
    id: number,
    data: UpdateProgramRequest
  ): Promise<ApiResponse<Program>> {
    return this.update<Program, UpdateProgramRequest>(id, data);
  }

  /**
   * Delete program
   */
  async deleteProgram(id: number): Promise<ApiResponse<void>> {
    return this.delete(id);
  }

  // ========================================
  // SPECIALIZED OPERATIONS
  // ========================================

  /**
   * Get programs by department
   */
  async getProgramsByDepartment(
    departmentId: number,
    query?: Omit<ProgramQuery, 'departmentId'>
  ): Promise<ApiResponse<ProgramListResponse>> {
    const fullQuery = { ...query, departmentId };
    return this.getPrograms(fullQuery);
  }

  /**
   * Get programs by faculty
   */
  async getProgramsByFaculty(
    facultyId: number,
    query?: Omit<ProgramQuery, 'facultyId'>
  ): Promise<ApiResponse<ProgramListResponse>> {
    const fullQuery = { ...query, facultyId };
    return this.getPrograms(fullQuery);
  }

  /**
   * Get program statistics
   */
  async getProgramStats(
    filters: Partial<ProgramQuery> = {}
  ): Promise<ApiResponse<ProgramStats>> {
    return this.getStats<ProgramStats>('/stats', filters);
  }

  /**
   * Export programs data
   */
  async exportPrograms(
    filters: ProgramQuery = {},
    format: 'csv' | 'excel' = 'csv'
  ): Promise<Blob> {
    return this.export(filters, format);
  }

  /**
   * Search programs
   */
  async searchPrograms(
    searchTerm: string,
    departmentId?: number
  ): Promise<ApiResponse<Program[]>> {
    const additionalParams = departmentId ? { departmentId } : undefined;
    return this.search<Program>(searchTerm, additionalParams);
  }
}

export const programService = new ProgramService();
export default programService;
