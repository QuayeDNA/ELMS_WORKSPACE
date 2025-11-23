import { BaseService } from './base.service';
import { ApiResponse } from '@/types/shared/api';
import { apiService } from './api';
import {
  InstitutionLogisticsDashboard,
  ExamsOfficerDashboard,
  AssignInvigilatorData,
  ReassignInvigilatorData,
  StudentCheckInData,
  ChangeStudentRoomData,
  ReportExamIncidentData,
  InvigilatorAssignment,
  StudentVerification,
  ExamIncident,
  ExamSessionLog,
  VenueOfficerAssignment,
  AssignOfficerToVenueData,
} from '@/types/examLogistics';

export interface ExamSessionForAssignment {
  id: number;
  courseCode: string;
  courseName: string;
  level: number;
  examDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  venue: {
    id: number;
    name: string;
    location: string;
    capacity: number;
  };
  studentCount: number;
  registeredCount: number;
  verifiedCount: number;
  status: string;
  assignments: Array<{
    id: number;
    invigilator: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      fullName: string;
    };
    role: string;
    status: string;
    checkedInAt: string | null;
    assignedAt: string;
  }>;
}

export interface AvailableInvigilator {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
  role: string;
  department: string;
  departmentCode: string;
  isAvailable: boolean;
  conflict: {
    courseCode: string;
    courseName: string;
    startTime: string;
    endTime: string;
  } | null;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ExamLogisticsService extends BaseService {
  constructor() {
    super('/api/exam-logistics');
  }

  // ========================================
  // INVIGILATOR ASSIGNMENT ENDPOINTS
  // ========================================

  /**
   * Assign an invigilator to an exam entry
   */
  async assignInvigilator(data: AssignInvigilatorData): Promise<ApiResponse<InvigilatorAssignment>> {
    return this.create<InvigilatorAssignment>(data, '/assign-invigilator');
  }

  /**
   * Reassign an invigilator
   */
  async reassignInvigilator(data: ReassignInvigilatorData): Promise<ApiResponse<InvigilatorAssignment>> {
    return this.update<InvigilatorAssignment>(data.assignmentId, data, '/reassign-invigilator');
  }

  /**
   * Update invigilator presence (check-in/check-out)
   */
  async updateInvigilatorPresence(
    assignmentId: number,
    action: 'check_in' | 'check_out'
  ): Promise<ApiResponse<InvigilatorAssignment>> {
    return this.update<InvigilatorAssignment>(
      assignmentId,
      { action },
      '/invigilator-presence'
    );
  }

  /**
   * Get all exam sessions in a timetable for assignment UI
   */
  async getSessionsForAssignment(timetableId: number): Promise<ApiResponse<ExamSessionForAssignment[]>> {
    return this.getStats<ExamSessionForAssignment[]>(`/timetable/${timetableId}/sessions`);
  }

  /**
   * Get available invigilators for a specific date/time
   */
  async getAvailableInvigilators(params: {
    examDate: string;
    startTime: string;
    endTime: string;
  }): Promise<ApiResponse<AvailableInvigilator[]>> {
    return this.getStats<AvailableInvigilator[]>('/available-invigilators', params);
  }

  /**
   * Remove an invigilator assignment
   */
  async removeInvigilatorAssignment(assignmentId: number): Promise<ApiResponse<void>> {
    return this.delete<void>(assignmentId, '/invigilator-assignment');
  }

  // ========================================
  // STUDENT VERIFICATION ENDPOINTS
  // ========================================

  /**
   * Check in a student for an exam
   */
  async checkInStudent(data: StudentCheckInData): Promise<ApiResponse<StudentVerification>> {
    return this.create<StudentVerification>(data, '/check-in-student');
  }

  /**
   * Change a student's assigned room
   */
  async changeStudentRoom(data: ChangeStudentRoomData): Promise<ApiResponse<StudentVerification>> {
    return this.update<StudentVerification>(data.verificationId, data, '/change-student-room');
  }

  // ========================================
  // INCIDENT MANAGEMENT ENDPOINTS
  // ========================================

  /**
   * Report an exam incident
   */
  async reportExamIncident(data: ReportExamIncidentData): Promise<ApiResponse<ExamIncident>> {
    return this.create<ExamIncident>(data, '/report-incident');
  }

  /**
   * Resolve an exam incident
   */
  async resolveExamIncident(
    incidentId: number,
    resolution: string
  ): Promise<ApiResponse<ExamIncident>> {
    return this.update<ExamIncident>(incidentId, { resolution }, '/resolve-incident');
  }

  // ========================================
  // VENUE OFFICER ASSIGNMENT ENDPOINTS
  // ========================================

  /**
   * Assign an officer to a venue within a timetable
   */
  async assignOfficerToVenue(data: AssignOfficerToVenueData): Promise<ApiResponse<VenueOfficerAssignment>> {
    return apiService.post<VenueOfficerAssignment>(`${this.endpoint}/assign-officer-to-venue`, data);
  }

  /**
   * Remove an officer assignment
   */
  async removeOfficerAssignment(assignmentId: number): Promise<ApiResponse<VenueOfficerAssignment>> {
    return this.delete<VenueOfficerAssignment>(assignmentId, '/officer-assignment');
  }

  /**
   * Get all officers assigned to a venue (within a timetable)
   */
  async getVenueOfficers(timetableId: number, venueId: number): Promise<ApiResponse<VenueOfficerAssignment[]>> {
    return this.getStats<VenueOfficerAssignment[]>(`/venue-officers/${timetableId}/${venueId}`);
  }

  /**
   * Get all venues assigned to an officer (within a timetable)
   */
  async getOfficerVenues(timetableId: number, officerId: number): Promise<ApiResponse<VenueOfficerAssignment[]>> {
    return this.getStats<VenueOfficerAssignment[]>(`/officer-venues/${timetableId}/${officerId}`);
  }

  /**
   * Get venues assigned to the current officer across all active timetables
   */
  async getMyAssignedVenues(): Promise<ApiResponse<VenueOfficerAssignment[]>> {
    return this.getStats<VenueOfficerAssignment[]>('/my-assigned-venues');
  }

  /**
   * Get all venue officer assignments for a timetable
   */
  async getTimetableVenueAssignments(timetableId: number): Promise<ApiResponse<VenueOfficerAssignment[]>> {
    return this.getStats<VenueOfficerAssignment[]>(`/timetable-venue-assignments/${timetableId}`);
  }

  // ========================================
  // DASHBOARD ENDPOINTS
  // ========================================

  /**
   * Get institution logistics dashboard
   */
  async getInstitutionDashboard(
    options?: { date?: Date; timetableId?: number }
  ): Promise<ApiResponse<InstitutionLogisticsDashboard>> {
    const params: Record<string, string | number> = {};
    if (options?.date) {
      params.date = options.date.toISOString();
    }
    if (options?.timetableId) {
      params.timetableId = options.timetableId;
    }
    return this.getStats<InstitutionLogisticsDashboard>('/institution-dashboard', params);
  }

  /**
   * Get exams officer dashboard
   */
  async getExamsOfficerDashboard(
    options?: { date?: Date; timetableId?: number; venueId?: number }
  ): Promise<ApiResponse<ExamsOfficerDashboard>> {
    const params: Record<string, string | number> = {};
    if (options?.date) {
      params.date = options.date.toISOString();
    }
    if (options?.timetableId) {
      params.timetableId = options.timetableId;
    }
    if (options?.venueId) {
      params.venueId = options.venueId;
    }
    return this.getStats<ExamsOfficerDashboard>('/exams-officer-dashboard', params);
  }

  // ========================================
  // LOGS AND AUDIT ENDPOINTS
  // ========================================

  /**
   * Get session logs for an exam entry
   */
  async getSessionLogs(
    examEntryId: number,
    query?: { page?: number; limit?: number }
  ): Promise<ApiResponse<{ data: ExamSessionLog[]; pagination: PaginationMeta }>> {
    const url = this.buildUrl(`${this.endpoint}/session-logs/${examEntryId}`, query || {});
    return apiService.get<{ data: ExamSessionLog[]; pagination: PaginationMeta }>(url);
  }

  /**
   * Get invigilator assignments for an exam entry
   */
  async getInvigilatorAssignments(examEntryId: number): Promise<ApiResponse<InvigilatorAssignment[]>> {
    return apiService.get<InvigilatorAssignment[]>(`${this.endpoint}/invigilator-assignments/${examEntryId}`);
  }

  /**
   * Get student verifications for an exam entry
   */
  async getStudentVerifications(
    examEntryId: number,
    query?: { page?: number; limit?: number }
  ): Promise<ApiResponse<{ data: StudentVerification[]; pagination: PaginationMeta }>> {
    const url = this.buildUrl(`${this.endpoint}/student-verifications/${examEntryId}`, query || {});
    return apiService.get<{ data: StudentVerification[]; pagination: PaginationMeta }>(url);
  }

  /**
   * Get exam incidents for an exam entry
   */
  async getExamIncidents(examEntryId: number): Promise<ApiResponse<ExamIncident[]>> {
    return this.getById<ExamIncident[]>(`/incidents/${examEntryId}`);
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Get real-time dashboard updates
   */
  async getRealtimeDashboard(institutionId: number): Promise<ApiResponse<InstitutionLogisticsDashboard>> {
    return this.getStats<InstitutionLogisticsDashboard>('/realtime-dashboard', { institutionId });
  }

  /**
   * Export logistics data
   */
  async exportLogisticsData(
    type: 'assignments' | 'verifications' | 'incidents' | 'logs',
    filters: Record<string, unknown> = {},
    format: 'csv' | 'excel' = 'csv'
  ): Promise<Blob> {
    return this.export({ ...filters, type }, format);
  }

  /**
   * Bulk operations for logistics
   */
  async bulkAssignInvigilators(
    assignments: AssignInvigilatorData[]
  ): Promise<ApiResponse<{ success: number; failed: number; errors: string[] }>> {
    return this.bulkOperation('bulk-assign', { assignments });
  }

  /**
   * Search logistics data
   */
  async searchLogistics(
    searchTerm: string,
    type: 'students' | 'invigilators' | 'incidents',
    additionalParams?: Record<string, unknown>
  ): Promise<ApiResponse<unknown[]>> {
    return this.search(searchTerm, { ...additionalParams, type });
  }
}

// Export singleton instance
export const examLogisticsService = new ExamLogisticsService();
