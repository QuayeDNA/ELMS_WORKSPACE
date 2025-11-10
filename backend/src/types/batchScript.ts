// ========================================
// BATCH SCRIPT TYPES
// ========================================

export interface BatchScript {
  id: number;
  examEntryId: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  batchCode: string;
  batchQRCode: string;
  totalRegistered: number;
  totalSubmitted: number;
  totalNotSubmitted: number;
  totalPresent: number;
  assignedLecturerId?: number;
  chiefInvigilatorId?: number;
  venueId: number;
  venueName: string;
  programIds: string; // JSON array
  status: BatchScriptStatus;
  createdAt: Date;
  collectedAt?: Date;
  dispatchedAt?: Date;
  receivedByLecturerAt?: Date;
  updatedAt: Date;

  // Relations
  examEntry?: any;
  course?: any;
  assignedLecturer?: any;
  chiefInvigilator?: any;
  venue?: any;
  examRegistrations?: any[];
  scripts?: any[];
}

export enum BatchScriptStatus {
  PENDING = 'PENDING',
  COLLECTING = 'COLLECTING',
  COLLECTED = 'COLLECTED',
  IN_TRANSIT = 'IN_TRANSIT',
  WITH_LECTURER = 'WITH_LECTURER',
  GRADING = 'GRADING',
  GRADED = 'GRADED',
  RETURNED = 'RETURNED',
}

export interface CreateBatchScriptData {
  examEntryId: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  venueId: number;
  venueName: string;
  programIds: number[];
  assignedLecturerId?: number;
  chiefInvigilatorId?: number;
}

export interface UpdateBatchScriptData {
  status?: BatchScriptStatus;
  assignedLecturerId?: number;
  chiefInvigilatorId?: number;
  collectedAt?: Date;
  dispatchedAt?: Date;
  receivedByLecturerAt?: Date;
}

export interface BatchQRCodeData {
  type: 'BATCH';
  batchId: number;
  batchCode: string;
  examEntryId: number;
  courseId: number;
  courseCode: string;
  examDate: string;
  venueId: number;
  totalRegistered: number;
  generatedAt: string;
  securityHash: string;
}

export interface BatchScriptQuery {
  examEntryId?: number;
  courseId?: number;
  status?: BatchScriptStatus;
  assignedLecturerId?: number;
  venueId?: number;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'courseCode' | 'createdAt' | 'status' | 'totalSubmitted';
  sortOrder?: 'asc' | 'desc';
}

export interface BatchScriptStatistics {
  batchId: number;
  totalRegistered: number;
  totalSubmitted: number;
  totalNotSubmitted: number;
  totalPresent: number;
  submissionRate: number;
  attendanceRate: number;
  notSubmittedStudents: Array<{
    studentId: number;
    studentName: string;
    indexNumber: string;
    isPresent: boolean;
  }>;
}

export interface BatchTransferData {
  fromUserId: number;
  toUserId: number;
  location: string;
  verificationCode?: string;
  notes?: string;
}

export interface SealBatchData {
  actualCount: number;
  verifiedBy: number;
  notes?: string;
}
