import { BaseService } from './base.service';
import { ApiResponse, PaginatedResponse } from '@/types/shared/api';
import {
  ScriptSubmission,
  SubmissionHistory,
  StudentSubmissionStatus,
  QRCodeValidation,
  SubmitScriptData,
  BulkSubmitScriptsData,
  VerifyScriptData,
  ScanStudentData,
  SubmissionHistoryQuery,
} from '@/types/scriptSubmission';
import { apiService } from './api';

/**
 * Script Submission Service
 * Handles all script submission related operations
 */
class ScriptSubmissionService extends BaseService {
  constructor() {
    super('/api/script-submissions');
  }

  /**
   * Submit a single script
   */
  async submitScript(
    data: SubmitScriptData
  ): Promise<ApiResponse<ScriptSubmission>> {
    try {
      return await apiService.post<ScriptSubmission>(
        `${this.endpoint}/submit`,
        data
      );
    } catch (error) {
      console.error('Error submitting script:', error);
      throw error;
    }
  }

  /**
   * Scan student QR code (validate before submission)
   */
  async scanStudent(
    data: ScanStudentData
  ): Promise<ApiResponse<QRCodeValidation>> {
    try {
      return await apiService.post<QRCodeValidation>(
        `${this.endpoint}/scan-student`,
        data
      );
    } catch (error) {
      console.error('Error scanning student:', error);
      throw error;
    }
  }

  /**
   * Verify a submitted script
   */
  async verifyScript(
    data: VerifyScriptData
  ): Promise<ApiResponse<ScriptSubmission>> {
    try {
      return await apiService.post<ScriptSubmission>(
        `${this.endpoint}/${data.scriptId}/verify`,
        { notes: data.notes }
      );
    } catch (error) {
      console.error('Error verifying script:', error);
      throw error;
    }
  }

  /**
   * Bulk submit multiple scripts
   */
  async bulkSubmitScripts(
    data: BulkSubmitScriptsData
  ): Promise<ApiResponse<{ submitted: number; failed: number; errors: string[] }>> {
    try {
      return await apiService.post<{ submitted: number; failed: number; errors: string[] }>(
        `${this.endpoint}/bulk-submit`,
        data
      );
    } catch (error) {
      console.error('Error bulk submitting scripts:', error);
      throw error;
    }
  }

  /**
   * Get batch submission history
   */
  async getBatchSubmissionHistory(
    batchId: number,
    query?: SubmissionHistoryQuery
  ): Promise<ApiResponse<SubmissionHistory[]>> {
    try {
      const url = this.buildUrl(
        `${this.endpoint}/batch/${batchId}/history`,
        query as Record<string, unknown>
      );
      return await apiService.get<SubmissionHistory[]>(url);
    } catch (error) {
      console.error('Error fetching batch submission history:', error);
      throw error;
    }
  }

  /**
   * Get student submission status for an exam
   */
  async getStudentSubmissionStatus(
    studentId: number,
    examEntryId: number
  ): Promise<ApiResponse<StudentSubmissionStatus>> {
    try {
      return await apiService.get<StudentSubmissionStatus>(
        `${this.endpoint}/student/${studentId}/exam/${examEntryId}`
      );
    } catch (error) {
      console.error('Error fetching student submission status:', error);
      throw error;
    }
  }

  /**
   * Get submission history with filters (paginated)
   */
  async getSubmissionHistory(
    query: SubmissionHistoryQuery
  ): Promise<PaginatedResponse<SubmissionHistory>> {
    return this.getPaginated<SubmissionHistory>(query);
  }
}

export const scriptSubmissionService = new ScriptSubmissionService();
