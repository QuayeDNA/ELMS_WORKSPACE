import { BaseService } from './base.service';
import { ApiResponse, PaginatedResponse } from '@/types/shared/api';
import {
  BatchScript,
  BatchScriptQuery,
  BatchStatistics,
  AssignBatchData,
  UpdateBatchStatusData,
  SealBatchData,
} from '@/types/batchScript';
import { apiService } from './api';

/**
 * Batch Script Service
 * Handles all batch script related operations
 */
class BatchScriptService extends BaseService {
  constructor() {
    super('/batch-scripts');
  }

  /**
   * Get batch scripts with filters
   */
  async getBatchScripts(
    query: BatchScriptQuery
  ): Promise<PaginatedResponse<BatchScript>> {
    return this.getPaginated<BatchScript>(query);
  }

  /**
   * Get batch script by ID
   */
  async getBatchScriptById(
    batchId: number
  ): Promise<ApiResponse<BatchScript>> {
    return this.getById<BatchScript>(batchId);
  }

  /**
   * Get batch script for exam entry and course
   */
  async getBatchScriptForExamEntry(
    examEntryId: number,
    courseId: number
  ): Promise<ApiResponse<BatchScript>> {
    try {
      return await apiService.get<BatchScript>(
        `${this.endpoint}/entry/${examEntryId}/course/${courseId}`
      );
    } catch (error) {
      console.error('Error fetching batch script for exam entry:', error);
      throw error;
    }
  }

  /**
   * Get batch statistics
   */
  async getBatchStatistics(
    batchId: number
  ): Promise<ApiResponse<BatchStatistics>> {
    try {
      return await apiService.get<BatchStatistics>(
        `${this.endpoint}/${batchId}/statistics`
      );
    } catch (error) {
      console.error('Error fetching batch statistics:', error);
      throw error;
    }
  }

  /**
   * Get batches pending assignment
   */
  async getPendingAssignment(): Promise<ApiResponse<BatchScript[]>> {
    try {
      return await apiService.get<BatchScript[]>(
        `${this.endpoint}/pending/assignment`
      );
    } catch (error) {
      console.error('Error fetching pending assignment batches:', error);
      throw error;
    }
  }

  /**
   * Get batches for a lecturer
   */
  async getBatchesForLecturer(
    lecturerId: number
  ): Promise<ApiResponse<BatchScript[]>> {
    try {
      return await apiService.get<BatchScript[]>(
        `${this.endpoint}/lecturer/${lecturerId}`
      );
    } catch (error) {
      console.error('Error fetching batches for lecturer:', error);
      throw error;
    }
  }

  /**
   * Seal a batch script
   */
  async sealBatchScript(
    batchId: number,
    data?: SealBatchData
  ): Promise<ApiResponse<BatchScript>> {
    try {
      return await apiService.post<BatchScript>(
        `${this.endpoint}/${batchId}/seal`,
        data || {}
      );
    } catch (error) {
      console.error('Error sealing batch script:', error);
      throw error;
    }
  }

  /**
   * Assign batch to lecturer
   */
  async assignBatchToLecturer(
    batchId: number,
    data: AssignBatchData
  ): Promise<ApiResponse<BatchScript>> {
    try {
      return await apiService.post<BatchScript>(
        `${this.endpoint}/${batchId}/assign`,
        data
      );
    } catch (error) {
      console.error('Error assigning batch to lecturer:', error);
      throw error;
    }
  }

  /**
   * Update batch status
   */
  async updateBatchStatus(
    batchId: number,
    data: UpdateBatchStatusData
  ): Promise<ApiResponse<BatchScript>> {
    try {
      return await apiService.patch<BatchScript>(
        `${this.endpoint}/${batchId}/status`,
        data
      );
    } catch (error) {
      console.error('Error updating batch status:', error);
      throw error;
    }
  }

  /**
   * Update submission count (used after manual script submission)
   */
  async updateSubmissionCount(
    batchId: number
  ): Promise<ApiResponse<BatchScript>> {
    try {
      return await apiService.post<BatchScript>(
        `${this.endpoint}/${batchId}/update-counts`,
        {}
      );
    } catch (error) {
      console.error('Error updating submission count:', error);
      throw error;
    }
  }
}

export const batchScriptService = new BatchScriptService();
