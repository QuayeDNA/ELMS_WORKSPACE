import { apiService } from './api';
import { API_ENDPOINTS } from '@/utils/constants';

// ========================================
// TYPES
// ========================================

export interface BulkUploadResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  failureCount: number;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
  createdEntries?: ExamTimetableEntry[];
}

export interface ExamTimetable {
  id: number;
  title: string;
  description?: string;
  academicYearId: number;
  semesterId: number;
  academicPeriodId?: number;
  institutionId: number;
  facultyId?: number;
  startDate: string;
  endDate: string;
  status: ExamTimetableStatus;
  isPublished: boolean;
  publishedAt?: string;
  publishedBy?: number;
  approvalStatus: TimetableApprovalStatus;
  approvedBy?: number;
  approvedAt?: string;
  rejectionReason?: string;
  allowOverlaps: boolean;
  autoResolveConflicts: boolean;
  defaultExamDuration: number;
  totalExams: number;
  totalConflicts: number;
  venuesUtilization?: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;

  // Relations
  academicYear?: {
    id: number;
    yearCode: string;
    startDate: string;
    endDate: string;
  };
  semester?: {
    id: number;
    semesterNumber: number;
    name: string;
    startDate: string;
    endDate: string;
  };
  academicPeriod?: {
    id: number;
    examStartDate: string;
    examEndDate: string;
  };
  institution?: {
    id: number;
    name: string;
    code: string;
  };
  faculty?: {
    id: number;
    name: string;
    code: string;
  };
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ExamTimetableEntry {
  id: number;
  timetableId: number;
  courseId: number;
  programIds: number[];
  level?: number;
  studentCount?: number;
  examDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  venueId: number;
  roomIds: number[];
  invigilatorIds: number[];
  chiefInvigilatorId?: number;
  status: ExamTimetableEntryStatus;
  notes?: string;
  specialRequirements?: string;
  hasConflicts: boolean;
  conflictDetails?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  course?: {
    id: number;
    code: string;
    name: string;
    creditHours: number;
    level: number;
  };
  venue?: {
    id: number;
    name: string;
    location: string;
    capacity: number;
  };
}

export enum ExamTimetableStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum TimetableApprovalStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REVISION_REQUIRED = 'REVISION_REQUIRED',
}

export enum ExamTimetableEntryStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
}

export interface TimetableQuery {
  institutionId?: number;
  facultyId?: number;
  academicYearId?: number;
  semesterId?: number;
  academicPeriodId?: number;
  status?: ExamTimetableStatus;
  isPublished?: boolean;
  approvalStatus?: TimetableApprovalStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'title' | 'startDate' | 'endDate' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTimetableData {
  title: string;
  description?: string;
  academicYearId: number;
  semesterId: number;
  academicPeriodId?: number;
  institutionId: number;
  facultyId?: number;
  startDate: string;
  endDate: string;
  allowOverlaps?: boolean;
  autoResolveConflicts?: boolean;
  defaultExamDuration?: number;
}

export interface UpdateTimetableData {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: ExamTimetableStatus;
  allowOverlaps?: boolean;
  autoResolveConflicts?: boolean;
  defaultExamDuration?: number;
}

export interface CreateTimetableEntryData {
  courseId: number;
  programIds: number[];
  level?: number;
  examDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  venueId: number;
  roomIds: number[];
  invigilatorIds?: number[];
  chiefInvigilatorId?: number;
  notes?: string;
  specialRequirements?: string;
}

export interface UpdateTimetableEntryData {
  courseId?: number;
  programIds?: number[];
  level?: number;
  examDate?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  venueId?: number;
  roomIds?: number[];
  invigilatorIds?: number[];
  chiefInvigilatorId?: number;
  status?: ExamTimetableEntryStatus;
  notes?: string;
  specialRequirements?: string;
}

export interface TimetableEntryPermissions {
  canModifyTime: boolean;
  canModifyDate: boolean;
  canModifyVenue: boolean;
  canModifyInvigilators: boolean;
  canModifyCourse: boolean;
  canDelete: boolean;
  scope: 'ALL' | 'FACULTY' | 'DEPARTMENT' | 'NONE';
}

// ========================================
// EXAM TIMETABLE SERVICE
// ========================================

export const examTimetableService = {
  /**
   * Get all exam timetables with filtering and pagination
   */
  /**
   * Get all timetables with filtering and pagination
   */
  async getTimetables(params: TimetableQuery = {}): Promise<{
    success: boolean;
    data: ExamTimetable[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await apiService.get<{
      success: boolean;
      data: ExamTimetable[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(API_ENDPOINTS.EXAM_TIMETABLES.BASE, { params });
    // Backend returns the structure directly, apiService passes it through
    return response as unknown as {
      success: boolean;
      data: ExamTimetable[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  },

  /**
   * Get a single timetable by ID
   */
  async getTimetableById(id: number): Promise<{
    success: boolean;
    data: ExamTimetable;
  }> {
    const response = await apiService.get<ExamTimetable>(API_ENDPOINTS.EXAM_TIMETABLES.BY_ID(id));
    return response as unknown as { success: boolean; data: ExamTimetable };
  },

  /**
   * Create a new exam timetable
   */
  async createTimetable(data: CreateTimetableData) {
    return await apiService.post<{
      success: boolean;
      data: ExamTimetable;
      message: string;
    }>(API_ENDPOINTS.EXAM_TIMETABLES.BASE, data);
  },

  /**
   * Update an existing timetable
   */
  async updateTimetable(id: number, data: UpdateTimetableData) {
    return await apiService.put<{
      success: boolean;
      data: ExamTimetable;
      message: string;
    }>(API_ENDPOINTS.EXAM_TIMETABLES.BY_ID(id), data);
  },

  /**
   * Delete a timetable
   */
  async deleteTimetable(id: number) {
    return await apiService.delete<{
      success: boolean;
      message: string;
    }>(API_ENDPOINTS.EXAM_TIMETABLES.BY_ID(id));
  },

  /**
   * Publish a timetable
   */
  async publishTimetable(id: number) {
    return await apiService.post<{
      success: boolean;
      data: ExamTimetable;
      message: string;
    }>(API_ENDPOINTS.EXAM_TIMETABLES.PUBLISH(id), {});
  },

  /**
   * Submit timetable for approval
   */
  async submitForApproval(id: number, notes?: string) {
    return await apiService.post<{
      success: boolean;
      data: ExamTimetable;
      message: string;
    }>(API_ENDPOINTS.EXAM_TIMETABLES.SUBMIT_FOR_APPROVAL(id), { notes });
  },

  /**
   * Approve a timetable
   */
  async approveTimetable(id: number, comments?: string) {
    return await apiService.post<{
      success: boolean;
      data: ExamTimetable;
      message: string;
    }>(API_ENDPOINTS.EXAM_TIMETABLES.APPROVE(id), { comments });
  },

  /**
   * Reject a timetable
   */
  async rejectTimetable(id: number, reason: string) {
    return await apiService.post<{
      success: boolean;
      data: ExamTimetable;
      message: string;
    }>(API_ENDPOINTS.EXAM_TIMETABLES.REJECT(id), { reason });
  },

  /**
   * Get timetable statistics
   */
  async getTimetableStatistics(id: number) {
    return await apiService.get<{
      success: boolean;
      data: {
        totalExams: number;
        scheduledExams: number;
        conflictingExams: number;
        venuesUsed: number;
        invigilatorsAssigned: number;
        studentsAffected: number;
        datesUsed: number;
        peakDate?: {
          date: string;
          examsCount: number;
        };
        venueUtilization: Array<{
          venueId: number;
          venueName: string;
          capacity: number;
          utilizationPercentage: number;
        }>;
      };
    }>(API_ENDPOINTS.EXAM_TIMETABLES.STATISTICS(id));
  },

  /**
   * Get entries for a timetable
   */
  async getTimetableEntries(timetableId: number, params: Record<string, unknown> = {}): Promise<{
    success: boolean;
    data: ExamTimetableEntry[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await apiService.get<{
      success: boolean;
      data: ExamTimetableEntry[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(API_ENDPOINTS.EXAM_TIMETABLES.ENTRIES(timetableId), params);
    return response as unknown as {
      success: boolean;
      data: ExamTimetableEntry[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  },

  /**
   * Create a new timetable entry
   */
  async createTimetableEntry(timetableId: number, data: CreateTimetableEntryData) {
    return await apiService.post<{
      success: boolean;
      data: ExamTimetableEntry;
      message: string;
    }>(API_ENDPOINTS.EXAM_TIMETABLES.ENTRIES(timetableId), data);
  },

  /**
   * Update a timetable entry
   */
  async updateTimetableEntry(timetableId: number, entryId: number, data: UpdateTimetableEntryData) {
    return await apiService.put<{
      success: boolean;
      data: ExamTimetableEntry;
      message: string;
    }>(API_ENDPOINTS.EXAM_TIMETABLES.ENTRY_BY_ID(timetableId, entryId), data);
  },

  /**
   * Delete a timetable entry
   */
  async deleteTimetableEntry(timetableId: number, entryId: number) {
    return await apiService.delete<{
      success: boolean;
      message: string;
    }>(API_ENDPOINTS.EXAM_TIMETABLES.ENTRY_BY_ID(timetableId, entryId));
  },

  /**
   * Get permissions for a specific entry
   */
  async getEntryPermissions(entryId: number) {
    return await apiService.get<{
      success: boolean;
      data: TimetableEntryPermissions;
    }>(API_ENDPOINTS.EXAM_TIMETABLES.ENTRY_PERMISSIONS(0, entryId));
  },

  /**
   * Detect conflicts in a timetable
   */
  async detectConflicts(timetableId: number) {
    return await apiService.post<{
      success: boolean;
      data: {
        conflicts: Array<{
          id: string;
          type: string;
          severity: string;
          description: string;
          affectedStudents?: number;
          canAutoResolve: boolean;
        }>;
      };
      message: string;
    }>(API_ENDPOINTS.EXAM_TIMETABLES.DETECT_CONFLICTS(timetableId), {});
  },

  /**
   * Get conflicts for a timetable
   */
  async getTimetableConflicts(timetableId: number) {
    return await apiService.get<{
      success: boolean;
      data: Array<{
        id: string;
        type: string;
        severity: string;
        description: string;
        isResolved: boolean;
      }>;
    }>(API_ENDPOINTS.EXAM_TIMETABLES.CONFLICTS(timetableId));
  },

  /**
   * Download bulk upload template
   */
  async downloadBulkUploadTemplate(timetableId: number): Promise<Blob> {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/bulk-upload/timetables/${timetableId}/bulk-upload/template`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download template');
    }

    return await response.blob();
  },

  /**
   * Upload bulk entries
   */
  async uploadBulkEntries(timetableId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/bulk-upload/timetables/${timetableId}/bulk-upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload file');
    }

    return await response.json() as {
      message: string;
      result: BulkUploadResult;
    };
  },
};
