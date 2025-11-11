import { realtimeService } from '../services/realtimeService';
import {
  RealtimeChannel,
  RealtimeEvent,
  ScriptSubmissionEvent,
  BatchUpdateEvent,
  ExamTimetableEvent,
  IncidentEvent,
  NotificationEvent,
  ScriptSubmittedPayload,
  ScriptVerifiedPayload,
  ScriptCollectedPayload,
  ScriptGradedPayload,
  BatchSealedPayload,
  BatchAssignedPayload,
  BatchCreatedPayload,
  BatchStatusChangedPayload,
  BatchStatsUpdatedPayload,
  TimetablePublishedPayload,
  TimetableUpdatedPayload,
  BatchesCreatedPayload,
  IncidentReportedPayload,
  IncidentUpdatedPayload,
  IncidentResolvedPayload,
  NewNotificationPayload,
  NotificationReadPayload,
} from '../types/realtime';

/**
 * Helper function to create and emit real-time events
 */
function emitEvent<T>(event: RealtimeEvent<T>, rooms?: string[]): void {
  if (rooms && rooms.length > 0) {
    realtimeService.emitToRooms(rooms, event);
  } else {
    // If no specific rooms, emit to institution room (extracted from payload if available)
    const payload = event.payload as any;
    if (payload?.institutionId) {
      realtimeService.emitToInstitution(payload.institutionId, event);
    }
  }
}

// ============================================
// SCRIPT SUBMISSION EVENTS
// ============================================

export function emitScriptSubmitted(payload: ScriptSubmittedPayload, rooms?: string[]): void {
  const event: RealtimeEvent<ScriptSubmittedPayload> = {
    channel: RealtimeChannel.SCRIPT_SUBMISSION,
    event: ScriptSubmissionEvent.SCRIPT_SUBMITTED,
    payload,
    timestamp: new Date().toISOString(),
  };
  emitEvent(event, rooms);
}

export function emitScriptVerified(payload: ScriptVerifiedPayload, rooms?: string[]): void {
  const event: RealtimeEvent<ScriptVerifiedPayload> = {
    channel: RealtimeChannel.SCRIPT_SUBMISSION,
    event: ScriptSubmissionEvent.SCRIPT_VERIFIED,
    payload,
    timestamp: new Date().toISOString(),
  };
  emitEvent(event, rooms);
}

export function emitScriptCollected(payload: ScriptCollectedPayload, rooms?: string[]): void {
  const event: RealtimeEvent<ScriptCollectedPayload> = {
    channel: RealtimeChannel.SCRIPT_SUBMISSION,
    event: ScriptSubmissionEvent.SCRIPT_COLLECTED,
    payload,
    timestamp: new Date().toISOString(),
  };
  emitEvent(event, rooms);
}

export function emitScriptGraded(payload: ScriptGradedPayload, rooms?: string[]): void {
  const event: RealtimeEvent<ScriptGradedPayload> = {
    channel: RealtimeChannel.SCRIPT_SUBMISSION,
    event: ScriptSubmissionEvent.SCRIPT_GRADED,
    payload,
    timestamp: new Date().toISOString(),
  };
  emitEvent(event, rooms);
}

export function emitBatchSealed(payload: BatchSealedPayload, rooms?: string[]): void {
  const event: RealtimeEvent<BatchSealedPayload> = {
    channel: RealtimeChannel.SCRIPT_SUBMISSION,
    event: ScriptSubmissionEvent.BATCH_SEALED,
    payload,
    timestamp: new Date().toISOString(),
  };
  emitEvent(event, rooms);
}

export function emitBatchAssigned(payload: BatchAssignedPayload, rooms?: string[]): void {
  const event: RealtimeEvent<BatchAssignedPayload> = {
    channel: RealtimeChannel.SCRIPT_SUBMISSION,
    event: ScriptSubmissionEvent.BATCH_ASSIGNED,
    payload,
    timestamp: new Date().toISOString(),
  };
  emitEvent(event, rooms);
}

// ============================================
// BATCH UPDATE EVENTS
// ============================================

export function emitBatchCreated(payload: BatchCreatedPayload, rooms?: string[]): void {
  const event: RealtimeEvent<BatchCreatedPayload> = {
    channel: RealtimeChannel.BATCH_UPDATE,
    event: BatchUpdateEvent.BATCH_CREATED,
    payload,
    timestamp: new Date().toISOString(),
  };
  emitEvent(event, rooms);
}

export function emitBatchStatusChanged(payload: BatchStatusChangedPayload, rooms?: string[]): void {
  const event: RealtimeEvent<BatchStatusChangedPayload> = {
    channel: RealtimeChannel.BATCH_UPDATE,
    event: BatchUpdateEvent.BATCH_STATUS_CHANGED,
    payload,
    timestamp: new Date().toISOString(),
  };
  emitEvent(event, rooms);
}

export function emitBatchStatsUpdated(payload: BatchStatsUpdatedPayload, rooms?: string[]): void {
  const event: RealtimeEvent<BatchStatsUpdatedPayload> = {
    channel: RealtimeChannel.BATCH_UPDATE,
    event: BatchUpdateEvent.BATCH_STATS_UPDATED,
    payload,
    timestamp: new Date().toISOString(),
  };
  emitEvent(event, rooms);
}

// ============================================
// EXAM TIMETABLE EVENTS
// ============================================

export function emitTimetablePublished(payload: TimetablePublishedPayload, rooms?: string[]): void {
  const event: RealtimeEvent<TimetablePublishedPayload> = {
    channel: RealtimeChannel.EXAM_TIMETABLE,
    event: ExamTimetableEvent.TIMETABLE_PUBLISHED,
    payload,
    timestamp: new Date().toISOString(),
  };
  emitEvent(event, rooms);
}

export function emitTimetableUpdated(payload: TimetableUpdatedPayload, rooms?: string[]): void {
  const event: RealtimeEvent<TimetableUpdatedPayload> = {
    channel: RealtimeChannel.EXAM_TIMETABLE,
    event: ExamTimetableEvent.TIMETABLE_UPDATED,
    payload,
    timestamp: new Date().toISOString(),
  };
  emitEvent(event, rooms);
}

export function emitBatchesCreated(payload: BatchesCreatedPayload, rooms?: string[]): void {
  const event: RealtimeEvent<BatchesCreatedPayload> = {
    channel: RealtimeChannel.EXAM_TIMETABLE,
    event: ExamTimetableEvent.BATCHES_CREATED,
    payload,
    timestamp: new Date().toISOString(),
  };
  emitEvent(event, rooms);
}

// ============================================
// INCIDENT EVENTS
// ============================================

export function emitIncidentReported(payload: IncidentReportedPayload, rooms?: string[]): void {
  const event: RealtimeEvent<IncidentReportedPayload> = {
    channel: RealtimeChannel.INCIDENT,
    event: IncidentEvent.INCIDENT_REPORTED,
    payload,
    timestamp: new Date().toISOString(),
  };
  emitEvent(event, rooms);
}

export function emitIncidentUpdated(payload: IncidentUpdatedPayload, rooms?: string[]): void {
  const event: RealtimeEvent<IncidentUpdatedPayload> = {
    channel: RealtimeChannel.INCIDENT,
    event: IncidentEvent.INCIDENT_UPDATED,
    payload,
    timestamp: new Date().toISOString(),
  };
  emitEvent(event, rooms);
}

export function emitIncidentResolved(payload: IncidentResolvedPayload, rooms?: string[]): void {
  const event: RealtimeEvent<IncidentResolvedPayload> = {
    channel: RealtimeChannel.INCIDENT,
    event: IncidentEvent.INCIDENT_RESOLVED,
    payload,
    timestamp: new Date().toISOString(),
  };
  emitEvent(event, rooms);
}

// ============================================
// NOTIFICATION EVENTS
// ============================================

export function emitNewNotification(payload: NewNotificationPayload, rooms?: string[]): void {
  const event: RealtimeEvent<NewNotificationPayload> = {
    channel: RealtimeChannel.NOTIFICATION,
    event: NotificationEvent.NEW_NOTIFICATION,
    payload,
    timestamp: new Date().toISOString(),
  };

  // Send to specific user
  if (payload.userId) {
    realtimeService.emitToUser(payload.userId, event);
  } else if (rooms && rooms.length > 0) {
    emitEvent(event, rooms);
  }
}

export function emitNotificationRead(payload: NotificationReadPayload, rooms?: string[]): void {
  const event: RealtimeEvent<NotificationReadPayload> = {
    channel: RealtimeChannel.NOTIFICATION,
    event: NotificationEvent.NOTIFICATION_READ,
    payload,
    timestamp: new Date().toISOString(),
  };

  // Send to specific user
  if (payload.userId) {
    realtimeService.emitToUser(payload.userId, event);
  } else if (rooms && rooms.length > 0) {
    emitEvent(event, rooms);
  }
}
