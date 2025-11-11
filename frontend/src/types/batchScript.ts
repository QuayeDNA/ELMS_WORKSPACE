// ========================================
// BATCH SCRIPT TYPES
// ========================================

export interface BatchScript {
  id: number;
  batchNumber?: string; // Legacy field
  batchQRCode: string; // New field from API
  examEntryId: number;
  courseId: number;
  totalScripts?: number; // Legacy field
  totalRegistered: number; // New field from API
  submittedCount?: number; // Legacy field
  scriptsSubmitted: number; // New field from API
  scriptsCollected: number;
  scriptsGraded: number;
  assignedToId?: number | null; // Legacy field
  assignedLecturerId?: number | null; // New field from API
  status: BatchStatus;
  sealedAt?: Date | string | null;
  sealedById?: number | null;
  sealedBy?: number | null;
  deliveredAt?: Date | string | null;
  completedAt?: Date | string | null;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Relations
  examEntry?: {
    id: number;
    date?: Date; // Legacy field
    examDate?: string; // New field from API
    startTime: string;
    endTime: string;
    duration?: number;
    venueId?: number;
    level?: number;
    programIds?: string; // JSON array of program IDs
    course: {
      id: number;
      code: string;
      title?: string; // Legacy field
      name?: string; // New field from API
    };
    venue?: {
      id: number;
      name: string;
      location: string;
    };
  };
  course?: {
    id: number;
    code: string;
    title?: string; // Legacy field
    name?: string; // New field from API
    creditHours?: number; // Optional credit hours
  };
  assignedTo?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedLecturer?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  sealedByUser?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  scripts?: Script[];
  movements?: Array<unknown>;
  registrations?: Array<{
    id: number;
    studentId: number;
    student: {
      firstName: string;
      lastName: string;
      studentId: string;
    };
  }>;
}

export enum BatchStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  SEALED = 'SEALED',
  ASSIGNED = 'ASSIGNED',
  GRADING = 'GRADING',
  COMPLETED = 'COMPLETED'
}

export interface Script {
  id: number;
  scriptNumber: string;
  batchScriptId: number;
  status: ScriptStatus;
  submittedAt?: Date | null;
  gradedAt?: Date | null;
  marks?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum ScriptStatus {
  SUBMITTED = 'SUBMITTED',
  VERIFIED = 'VERIFIED',
  GRADING_IN_PROGRESS = 'GRADING_IN_PROGRESS',
  GRADED = 'GRADED',
  REVIEWED = 'REVIEWED'
}

// ========================================
// STATISTICS TYPES
// ========================================

export interface BatchStatistics {
  batchId: number;
  batchNumber?: string; // Legacy field
  totalScripts?: number; // Legacy field
  totalRegistered?: number; // New field from API
  submittedCount?: number; // Legacy field
  scriptsSubmitted?: number; // New field from API
  scriptsCollected?: number;
  scriptsGraded?: number;
  pendingCount?: number; // Legacy field
  pending?: number; // New field from API
  verifiedCount?: number;
  gradedCount?: number;
  submissionRate: number;
  gradingProgress?: number;
  averageSubmissionTime?: number | null;
  firstSubmission?: Date | null;
  lastSubmission?: Date | null;
  scriptsByStatus?: Record<ScriptStatus, number>;
  status?: BatchStatus;
}

// ========================================
// QUERY TYPES
// ========================================

export interface BatchScriptQuery {
  examEntryId?: number;
  courseId?: number;
  status?: BatchStatus;
  assignedToId?: number;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

// ========================================
// FORM DATA TYPES
// ========================================

export interface AssignBatchData {
  lecturerId: number;
  notes?: string;
}

export interface UpdateBatchStatusData {
  status: BatchStatus;
  notes?: string;
}

export interface SealBatchData {
  notes?: string;
}
