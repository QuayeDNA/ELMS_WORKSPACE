// ========================================
// REAL-TIME EVENT TYPES
// ========================================

/**
 * Real-time event channels
 * Each channel represents a different area of the application
 */
export enum RealtimeChannel {
  SCRIPT_SUBMISSION = 'script:submission',
  BATCH_UPDATE = 'batch:update',
  EXAM_TIMETABLE = 'exam:timetable',
  INCIDENT = 'incident',
  NOTIFICATION = 'notification',
}

/**
 * Base interface for all real-time events
 */
export interface RealtimeEvent<T = unknown> {
  channel: RealtimeChannel;
  event: string;
  data: T;
  timestamp: string;
  institutionId?: number;
  userId?: number;
}

// ========================================
// SCRIPT SUBMISSION EVENTS
// ========================================

export enum ScriptSubmissionEvent {
  SCRIPT_SUBMITTED = 'script:submitted',
  SCRIPT_VERIFIED = 'script:verified',
  SCRIPT_COLLECTED = 'script:collected',
  SCRIPT_GRADED = 'script:graded',
  BATCH_SEALED = 'batch:sealed',
  BATCH_ASSIGNED = 'batch:assigned',
}

export interface ScriptSubmittedPayload {
  scriptId: number;
  batchId: number;
  batchQRCode: string;
  studentId: string;
  studentName: string;
  scriptNumber: string;
  submittedBy: string;
  submittedAt: string;
  courseCode: string;
  courseName: string;
}

export interface ScriptVerifiedPayload {
  scriptId: number;
  batchId: number;
  verifiedBy: string;
  verifiedAt: string;
}

export interface ScriptCollectedPayload {
  scriptId: number;
  batchId: number;
  collectedBy: string;
  collectedAt: string;
}

export interface ScriptGradedPayload {
  scriptId: number;
  batchId: number;
  gradedBy: string;
  marks: number;
  gradedAt: string;
}

export interface BatchSealedPayload {
  batchId: number;
  batchQRCode: string;
  totalScripts: number;
  submittedScripts: number;
  sealedBy: string;
  sealedAt: string;
}

export interface BatchAssignedPayload {
  batchId: number;
  batchQRCode: string;
  assignedTo: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedBy: string;
  assignedAt: string;
}

// ========================================
// BATCH UPDATE EVENTS
// ========================================

export enum BatchUpdateEvent {
  BATCH_CREATED = 'batch:created',
  BATCH_STATUS_CHANGED = 'batch:status:changed',
  BATCH_STATS_UPDATED = 'batch:stats:updated',
}

export interface BatchCreatedPayload {
  batchId: number;
  batchQRCode: string;
  courseId: number;
  courseCode: string;
  courseName: string;
  examDate: string;
  totalRegistered: number;
}

export interface BatchStatusChangedPayload {
  batchId: number;
  batchQRCode: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  changedAt: string;
}

export interface BatchStatsUpdatedPayload {
  batchId: number;
  batchQRCode: string;
  stats: {
    totalRegistered: number;
    scriptsSubmitted: number;
    scriptsCollected: number;
    scriptsGraded: number;
    submissionRate: number;
    gradingProgress: number;
  };
}

// ========================================
// EXAM TIMETABLE EVENTS
// ========================================

export enum ExamTimetableEvent {
  TIMETABLE_PUBLISHED = 'timetable:published',
  TIMETABLE_UPDATED = 'timetable:updated',
  BATCHES_CREATED = 'timetable:batches:created',
}

export interface TimetablePublishedPayload {
  timetableId: number;
  title: string;
  publishedBy: string;
  publishedAt: string;
  totalExams: number;
  batchesCreated: number;
}

export interface TimetableUpdatedPayload {
  timetableId: number;
  title: string;
  updatedBy: string;
  updatedAt: string;
  changes: string[];
}

export interface BatchesCreatedPayload {
  timetableId: number;
  batchesCreated: Array<{
    id: number;
    batchQRCode: string;
    courseCode: string;
    courseName: string;
  }>;
  totalCreated: number;
}

// ========================================
// INCIDENT EVENTS
// ========================================

export enum IncidentEvent {
  INCIDENT_REPORTED = 'incident:reported',
  INCIDENT_UPDATED = 'incident:updated',
  INCIDENT_RESOLVED = 'incident:resolved',
}

export interface IncidentReportedPayload {
  incidentId: number;
  type: string;
  severity: string;
  description: string;
  reportedBy: string;
  reportedAt: string;
  batchId?: number;
  examId?: number;
}

// ========================================
// NOTIFICATION EVENTS
// ========================================

export enum NotificationEvent {
  NEW_NOTIFICATION = 'notification:new',
  NOTIFICATION_READ = 'notification:read',
}

export interface NotificationPayload {
  id: number;
  type: string;
  title: string;
  message: string;
  userId: number;
  createdAt: string;
  data?: Record<string, unknown>;
}

// ========================================
// SOCKET CONNECTION
// ========================================

export interface SocketUser {
  userId: number;
  institutionId: number;
  role: string;
  socketId: string;
}

export interface RoomSubscription {
  room: string;
  userId: number;
  institutionId: number;
}
