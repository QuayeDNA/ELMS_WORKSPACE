/**
 * Real-time Event System Types
 * Matches backend types for type-safe WebSocket communication
 */

// Event Channels
export enum RealtimeChannel {
  SCRIPT_SUBMISSION = 'script_submission',
  BATCH_UPDATE = 'batch_update',
  EXAM_TIMETABLE = 'exam_timetable',
  INCIDENT = 'incident',
  NOTIFICATION = 'notification',
}

// Base Event Interface
export interface RealtimeEvent<T = unknown> {
  channel: RealtimeChannel;
  event: string;
  payload: T;
  timestamp: string;
}

// ============================================
// SCRIPT SUBMISSION EVENTS
// ============================================

export enum ScriptSubmissionEvent {
  SCRIPT_SUBMITTED = 'script_submitted',
  SCRIPT_VERIFIED = 'script_verified',
  SCRIPT_COLLECTED = 'script_collected',
  SCRIPT_GRADED = 'script_graded',
  BATCH_SEALED = 'batch_sealed',
  BATCH_ASSIGNED = 'batch_assigned',
}

export interface ScriptSubmittedPayload {
  scriptId: number;
  batchId: number;
  studentId: number;
  studentName: string;
  courseCode: string;
  courseName: string;
  submittedAt: string;
  institutionId: number;
}

export interface ScriptVerifiedPayload {
  scriptId: number;
  batchId: number;
  verifiedBy: number;
  verifiedByName: string;
  verifiedAt: string;
  institutionId: number;
}

export interface ScriptCollectedPayload {
  scriptId: number;
  batchId: number;
  collectedBy: number;
  collectedByName: string;
  collectedAt: string;
  institutionId: number;
}

export interface ScriptGradedPayload {
  scriptId: number;
  batchId: number;
  score: number;
  maxScore: number;
  gradedBy: number;
  gradedByName: string;
  gradedAt: string;
  institutionId: number;
}

export interface BatchSealedPayload {
  batchId: number;
  totalScripts: number;
  verifiedScripts: number;
  sealedBy: number;
  sealedByName: string;
  sealedAt: string;
  institutionId: number;
}

export interface BatchAssignedPayload {
  batchId: number;
  assignedTo: number;
  assignedToName: string;
  assignedToEmail: string;
  assignedBy: number;
  assignedByName: string;
  assignedAt: string;
  institutionId: number;
}

// ============================================
// BATCH UPDATE EVENTS
// ============================================

export enum BatchUpdateEvent {
  BATCH_CREATED = 'batch_created',
  BATCH_STATUS_CHANGED = 'batch_status_changed',
  BATCH_STATS_UPDATED = 'batch_stats_updated',
}

export interface BatchCreatedPayload {
  batchId: number;
  batchNumber: string;
  examId: number;
  examName: string;
  courseCode: string;
  totalSlots: number;
  createdBy: number;
  createdByName: string;
  institutionId: number;
}

export interface BatchStatusChangedPayload {
  batchId: number;
  oldStatus: string;
  newStatus: string;
  changedBy: number;
  changedByName: string;
  changedAt: string;
  institutionId: number;
}

export interface BatchStatsUpdatedPayload {
  batchId: number;
  totalScripts: number;
  submittedScripts: number;
  verifiedScripts: number;
  collectedScripts: number;
  gradedScripts: number;
  institutionId: number;
}

// ============================================
// EXAM TIMETABLE EVENTS
// ============================================

export enum ExamTimetableEvent {
  TIMETABLE_PUBLISHED = 'timetable_published',
  TIMETABLE_UPDATED = 'timetable_updated',
  BATCHES_CREATED = 'batches_created',
}

export interface TimetablePublishedPayload {
  timetableId: number;
  academicPeriodId: number;
  academicPeriodName: string;
  totalEntries: number;
  publishedBy: number;
  publishedByName: string;
  publishedAt: string;
  institutionId: number;
}

export interface TimetableUpdatedPayload {
  timetableId: number;
  changes: string[];
  updatedBy: number;
  updatedByName: string;
  updatedAt: string;
  institutionId: number;
}

export interface BatchesCreatedPayload {
  timetableId: number;
  totalBatches: number;
  totalSlots: number;
  createdBy: number;
  createdByName: string;
  createdAt: string;
  institutionId: number;
}

// ============================================
// INCIDENT EVENTS
// ============================================

export enum IncidentEvent {
  INCIDENT_REPORTED = 'incident_reported',
  INCIDENT_UPDATED = 'incident_updated',
  INCIDENT_RESOLVED = 'incident_resolved',
}

export interface IncidentReportedPayload {
  incidentId: number;
  type: string;
  severity: string;
  description: string;
  reportedBy: number;
  reportedByName: string;
  reportedAt: string;
  examId?: number;
  batchId?: number;
  institutionId: number;
}

export interface IncidentUpdatedPayload {
  incidentId: number;
  updates: Record<string, unknown>;
  updatedBy: number;
  updatedByName: string;
  updatedAt: string;
  institutionId: number;
}

export interface IncidentResolvedPayload {
  incidentId: number;
  resolution: string;
  resolvedBy: number;
  resolvedByName: string;
  resolvedAt: string;
  institutionId: number;
}

// ============================================
// NOTIFICATION EVENTS
// ============================================

export enum NotificationEvent {
  NEW_NOTIFICATION = 'new_notification',
  NOTIFICATION_READ = 'notification_read',
}

export interface NewNotificationPayload {
  notificationId: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  link?: string;
  createdAt: string;
}

export interface NotificationReadPayload {
  notificationId: number;
  userId: number;
  readAt: string;
}

// ============================================
// SUBSCRIPTION TYPES
// ============================================

export interface RealtimeSubscription {
  channel: RealtimeChannel;
  event?: string; // If undefined, subscribe to all events in channel
  handler: (event: RealtimeEvent) => void;
}

export interface RealtimeContextValue {
  isConnected: boolean;
  subscribe: (subscription: RealtimeSubscription) => () => void;
  unsubscribe: (subscription: RealtimeSubscription) => void;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
}
