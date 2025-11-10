import { BaseService } from './base.service';
import { ApiResponse, PaginatedResponse } from '@/types/shared/api';
import {
  ExamRegistration,
  ExamRegistrationQuery,
  RegistrationStatistics,
  MissingScript,
  StudentActiveExam,
  RegistrationByQRCode,
  MarkAttendanceData,
} from '@/types/examRegistration';
import { apiService } from './api';

/**
 * Exam Registration Service
 * Handles all exam registration related operations
 */
class ExamRegistrationService extends BaseService {
  constructor() {
    super('/exam-registrations');
  }

  /**
   * Get registrations with filters
   */
  async getRegistrations(
    query: ExamRegistrationQuery
  ): Promise<PaginatedResponse<ExamRegistration>> {
    return this.getPaginated<ExamRegistration>(query);
  }

  /**
   * Get registrations for a specific exam entry
   */
  async getRegistrationsForExamEntry(
    examEntryId: number
  ): Promise<ApiResponse<ExamRegistration[]>> {
    try {
      return await apiService.get<ExamRegistration[]>(
        `${this.endpoint}/entry/${examEntryId}`
      );
    } catch (error) {
      console.error('Error fetching registrations for exam entry:', error);
      throw error;
    }
  }

  /**
   * Get registration by QR code
   */
  async getRegistrationByQRCode(
    qrCode: string
  ): Promise<ApiResponse<RegistrationByQRCode>> {
    try {
      return await apiService.get<RegistrationByQRCode>(
        `${this.endpoint}/qr/${qrCode}`
      );
    } catch (error) {
      console.error('Error fetching registration by QR code:', error);
      throw error;
    }
  }

  /**
   * Mark student attendance
   */
  async markAttendance(
    data: MarkAttendanceData
  ): Promise<ApiResponse<ExamRegistration>> {
    try {
      return await apiService.post<ExamRegistration>(
        `${this.endpoint}/attendance`,
        data
      );
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  }

  /**
   * Get registration statistics for an exam entry
   */
  async getRegistrationStatistics(
    examEntryId: number
  ): Promise<ApiResponse<RegistrationStatistics>> {
    try {
      return await apiService.get<RegistrationStatistics>(
        `${this.endpoint}/statistics/${examEntryId}`
      );
    } catch (error) {
      console.error('Error fetching registration statistics:', error);
      throw error;
    }
  }

  /**
   * Get active exams for a student
   */
  async getActiveExamsForStudent(
    studentId: number
  ): Promise<ApiResponse<StudentActiveExam[]>> {
    try {
      return await apiService.get<StudentActiveExam[]>(
        `${this.endpoint}/student/${studentId}/active-exams`
      );
    } catch (error) {
      console.error('Error fetching active exams for student:', error);
      throw error;
    }
  }

  /**
   * Get students with missing scripts for an exam entry
   */
  async getMissingScripts(
    examEntryId: number
  ): Promise<ApiResponse<MissingScript[]>> {
    try {
      return await apiService.get<MissingScript[]>(
        `${this.endpoint}/missing-scripts/${examEntryId}`
      );
    } catch (error) {
      console.error('Error fetching missing scripts:', error);
      throw error;
    }
  }

  /**
   * Auto-register students for a timetable
   */
  async autoRegisterForTimetable(
    timetableId: number
  ): Promise<ApiResponse<{ registered: number; skipped: number }>> {
    try {
      return await apiService.post<{ registered: number; skipped: number }>(
        `${this.endpoint}/auto-register/${timetableId}`,
        {}
      );
    } catch (error) {
      console.error('Error auto-registering for timetable:', error);
      throw error;
    }
  }

  /**
   * Auto-register students for an exam entry
   */
  async autoRegisterForExamEntry(
    examEntryId: number
  ): Promise<ApiResponse<{ registered: number; skipped: number }>> {
    try {
      return await apiService.post<{ registered: number; skipped: number }>(
        `${this.endpoint}/auto-register/entry/${examEntryId}`,
        {}
      );
    } catch (error) {
      console.error('Error auto-registering for exam entry:', error);
      throw error;
    }
  }
}

export const examRegistrationService = new ExamRegistrationService();
