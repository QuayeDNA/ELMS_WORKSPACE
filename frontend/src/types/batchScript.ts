// ========================================
// BATCH SCRIPT TYPES
// ========================================

export interface BatchScript {
  id: number;
  batchNumber: string;
  examEntryId: number;
  courseId: number;
  totalScripts: number;
  submittedCount: number;
  assignedToId?: number | null;
  status: BatchStatus;
  sealedAt?: Date | null;
  sealedById?: number | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  examEntry?: {
    id: number;
    date: Date;
    startTime: string;
    endTime: string;
    course: {
      id: number;
      code: string;
      title: string;
    };
  };
  course?: {
    id: number;
    code: string;
    title: string;
  };
  assignedTo?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  sealedBy?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  scripts?: Script[];
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
  batchNumber: string;
  totalScripts: number;
  submittedCount: number;
  pendingCount: number;
  verifiedCount: number;
  gradedCount: number;
  submissionRate: number;
  averageSubmissionTime?: number | null;
  firstSubmission?: Date | null;
  lastSubmission?: Date | null;
  scriptsByStatus: Record<ScriptStatus, number>;
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
