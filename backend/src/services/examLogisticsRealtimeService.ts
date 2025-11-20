import { realtimeService } from './realtimeService';
import { RealtimeEvent, RealtimeChannel } from '../types/realtime';

/**
 * Exam Logistics Real-time Service
 * Handles WebSocket broadcasting for exam logistics updates
 */

export enum ExamLogisticsEventType {
  // Student events
  STUDENT_CHECKED_IN = 'student_checked_in',
  STUDENT_CHECKED_OUT = 'student_checked_out',
  STUDENT_ROOM_CHANGED = 'student_room_changed',

  // Script events
  SCRIPT_SUBMITTED = 'script_submitted',
  SCRIPT_VERIFIED = 'script_verified',
  BATCH_SEALED = 'batch_sealed',
  BATCH_ASSIGNED = 'batch_assigned',

  // Invigilator events
  INVIGILATOR_ASSIGNED = 'invigilator_assigned',
  INVIGILATOR_CHECKED_IN = 'invigilator_checked_in',
  INVIGILATOR_CHECKED_OUT = 'invigilator_checked_out',
  INVIGILATOR_REASSIGNED = 'invigilator_reassigned',

  // Incident events
  INCIDENT_REPORTED = 'incident_reported',
  INCIDENT_ASSIGNED = 'incident_assigned',
  INCIDENT_RESOLVED = 'incident_resolved',
  INCIDENT_UPDATED = 'incident_updated',

  // Session events
  SESSION_STARTED = 'session_started',
  SESSION_ENDED = 'session_ended',
  SESSION_STATUS_CHANGED = 'session_status_changed',

  // Logistics updates
  LOGISTICS_UPDATED = 'logistics_updated',
  METRICS_UPDATED = 'metrics_updated',
  CAPACITY_ALERT = 'capacity_alert',
  VERIFICATION_COMPLETED = 'verification_completed',
}

export interface ExamLogisticsEventData {
  examEntryId: number;
  institutionId: number;
  venueId?: number;
  [key: string]: any;
}

class ExamLogisticsRealtimeService {
  /**
   * Broadcast student check-in event
   */
  broadcastStudentCheckIn(data: {
    examEntryId: number;
    institutionId: number;
    venueId: number;
    studentId: number;
    studentName: string;
    seatNumber?: string;
    verificationMethod: string;
    totalPresent: number;
    totalExpected: number;
  }): void {
    const event: RealtimeEvent<ExamLogisticsEventData> = {
      channel: RealtimeChannel.EXAM_LOGISTICS,
      event: ExamLogisticsEventType.STUDENT_CHECKED_IN,
      payload: data,
      timestamp: new Date().toISOString()
    };

    // Emit to multiple rooms
    realtimeService.emitToRooms([
      `institution:${data.institutionId}`,
      `venue:${data.venueId}`,
      `exam-entry:${data.examEntryId}`
    ], event);
  }

  /**
   * Broadcast script submission event
   */
  broadcastScriptSubmission(data: {
    examEntryId: number;
    institutionId: number;
    venueId: number;
    studentId: number;
    studentName: string;
    courseCode: string;
    batchId: number;
    scriptsSubmitted: number;
    scriptsRemaining: number;
  }): void {
    const event: RealtimeEvent<ExamLogisticsEventData> = {
      channel: RealtimeChannel.EXAM_LOGISTICS,
      event: ExamLogisticsEventType.SCRIPT_SUBMITTED,
      payload: data,
      timestamp: new Date().toISOString()
    };

    realtimeService.emitToRooms([
      `institution:${data.institutionId}`,
      `venue:${data.venueId}`,
      `exam-entry:${data.examEntryId}`
    ], event);
  }

  /**
   * Broadcast invigilator check-in event
   */
  broadcastInvigilatorCheckIn(data: {
    examEntryId: number;
    institutionId: number;
    venueId: number;
    invigilatorId: number;
    invigilatorName: string;
    role: string;
    invigilatorsPresent: number;
    invigilatorsAssigned: number;
  }): void {
    const event: RealtimeEvent<ExamLogisticsEventData> = {
      channel: RealtimeChannel.EXAM_LOGISTICS,
      event: ExamLogisticsEventType.INVIGILATOR_CHECKED_IN,
      payload: data,
      timestamp: new Date().toISOString()
    };

    realtimeService.emitToRooms([
      `institution:${data.institutionId}`,
      `venue:${data.venueId}`,
      `exam-entry:${data.examEntryId}`
    ], event);
  }

  /**
   * Broadcast invigilator check-out event
   */
  broadcastInvigilatorCheckOut(data: {
    examEntryId: number;
    institutionId: number;
    venueId: number;
    invigilatorId: number;
    invigilatorName: string;
    invigilatorsPresent: number;
    invigilatorsAssigned: number;
  }): void {
    const event: RealtimeEvent<ExamLogisticsEventData> = {
      channel: RealtimeChannel.EXAM_LOGISTICS,
      event: ExamLogisticsEventType.INVIGILATOR_CHECKED_OUT,
      payload: data,
      timestamp: new Date().toISOString()
    };

    realtimeService.emitToRooms([
      `institution:${data.institutionId}`,
      `venue:${data.venueId}`,
      `exam-entry:${data.examEntryId}`
    ], event);
  }

  /**
   * Broadcast incident report event
   */
  broadcastIncidentReported(data: {
    examEntryId: number;
    institutionId: number;
    venueId: number;
    incidentId: number;
    type: string;
    severity: string;
    title: string;
    reporterName: string;
  }): void {
    const event: RealtimeEvent<ExamLogisticsEventData> = {
      channel: RealtimeChannel.EXAM_LOGISTICS,
      event: ExamLogisticsEventType.INCIDENT_REPORTED,
      payload: data,
      timestamp: new Date().toISOString()
    };

    // Critical incidents should also be broadcast institution-wide
    realtimeService.emitToRooms([
      `institution:${data.institutionId}`,
      `venue:${data.venueId}`,
      `exam-entry:${data.examEntryId}`
    ], event);
  }

  /**
   * Broadcast incident resolution event
   */
  broadcastIncidentResolved(data: {
    examEntryId: number;
    institutionId: number;
    venueId: number;
    incidentId: number;
    resolverName: string;
    resolution: string;
  }): void {
    const event: RealtimeEvent<ExamLogisticsEventData> = {
      channel: RealtimeChannel.EXAM_LOGISTICS,
      event: ExamLogisticsEventType.INCIDENT_RESOLVED,
      payload: data,
      timestamp: new Date().toISOString()
    };

    realtimeService.emitToRooms([
      `institution:${data.institutionId}`,
      `venue:${data.venueId}`,
      `exam-entry:${data.examEntryId}`
    ], event);
  }

  /**
   * Broadcast session status change
   */
  broadcastSessionStatusChange(data: {
    examEntryId: number;
    institutionId: number;
    venueId: number;
    courseCode: string;
    courseName: string;
    oldStatus: string;
    newStatus: string;
  }): void {
    const event: RealtimeEvent<ExamLogisticsEventData> = {
      channel: RealtimeChannel.EXAM_LOGISTICS,
      event: ExamLogisticsEventType.SESSION_STATUS_CHANGED,
      payload: data,
      timestamp: new Date().toISOString()
    };

    realtimeService.emitToRooms([
      `institution:${data.institutionId}`,
      `venue:${data.venueId}`,
      `exam-entry:${data.examEntryId}`
    ], event);
  }

  /**
   * Broadcast general logistics update
   */
  broadcastLogisticsUpdate(data: {
    examEntryId: number;
    institutionId: number;
    venueId?: number;
    metrics: {
      totalExpected: number;
      totalPresent: number;
      totalAbsent: number;
      scriptsSubmitted: number;
      scriptsPending: number;
      invigilatorsPresent: number;
      invigilatorsAssigned: number;
      hasUnresolvedIncidents: boolean;
    };
  }): void {
    const event: RealtimeEvent<ExamLogisticsEventData> = {
      channel: RealtimeChannel.EXAM_LOGISTICS,
      event: ExamLogisticsEventType.LOGISTICS_UPDATED,
      payload: data,
      timestamp: new Date().toISOString()
    };

    const rooms = [
      `institution:${data.institutionId}`,
      `exam-entry:${data.examEntryId}`
    ];

    if (data.venueId) {
      rooms.push(`venue:${data.venueId}`);
    }

    realtimeService.emitToRooms(rooms, event);
  }

  /**
   * Broadcast capacity alert
   */
  broadcastCapacityAlert(data: {
    examEntryId: number;
    institutionId: number;
    venueId: number;
    courseCode: string;
    totalExpected: number;
    totalCapacity: number;
    exceeded: boolean;
  }): void {
    const event: RealtimeEvent<ExamLogisticsEventData> = {
      channel: RealtimeChannel.EXAM_LOGISTICS,
      event: ExamLogisticsEventType.CAPACITY_ALERT,
      payload: {
        ...data,
        severity: 'HIGH'
      },
      timestamp: new Date().toISOString()
    };

    // Capacity alerts go to institution level
    realtimeService.emitToRooms([
      `institution:${data.institutionId}`,
      `venue:${data.venueId}`
    ], event);
  }

  /**
   * Broadcast metrics update (aggregated)
   */
  broadcastMetricsUpdate(data: {
    institutionId: number;
    venueId?: number;
    date: string;
    metrics: {
      totalSessions: number;
      activeSessions: number;
      totalStudentsExpected: number;
      totalStudentsPresent: number;
      attendanceRate: number;
      totalScriptsSubmitted: number;
      submissionRate: number;
      totalIncidents: number;
      unresolvedIncidents: number;
    };
  }): void {
    const event: RealtimeEvent<ExamLogisticsEventData> = {
      channel: RealtimeChannel.EXAM_LOGISTICS,
      event: ExamLogisticsEventType.METRICS_UPDATED,
      payload: {
        ...data,
        examEntryId: 0 // Aggregated, no specific entry
      },
      timestamp: new Date().toISOString()
    };

    const rooms = [`institution:${data.institutionId}`];
    if (data.venueId) {
      rooms.push(`venue:${data.venueId}`);
    }

    realtimeService.emitToRooms(rooms, event);
  }

  /**
   * Broadcast verification completion
   */
  broadcastVerificationCompleted(data: {
    examEntryId: number;
    institutionId: number;
    venueId: number;
    courseCode: string;
    totalVerified: number;
    totalExpected: number;
    verificationRate: number;
    status: string;
  }): void {
    const event: RealtimeEvent<ExamLogisticsEventData> = {
      channel: RealtimeChannel.EXAM_LOGISTICS,
      event: ExamLogisticsEventType.VERIFICATION_COMPLETED,
      payload: data,
      timestamp: new Date().toISOString()
    };

    realtimeService.emitToRooms([
      `institution:${data.institutionId}`,
      `venue:${data.venueId}`,
      `exam-entry:${data.examEntryId}`
    ], event);
  }

  /**
   * Broadcast batch sealed event
   */
  broadcastBatchSealed(data: {
    examEntryId: number;
    institutionId: number;
    venueId: number;
    batchId: number;
    courseCode: number;
    totalScripts: number;
    sealedBy: string;
  }): void {
    const event: RealtimeEvent<ExamLogisticsEventData> = {
      channel: RealtimeChannel.EXAM_LOGISTICS,
      event: ExamLogisticsEventType.BATCH_SEALED,
      payload: data,
      timestamp: new Date().toISOString()
    };

    realtimeService.emitToRooms([
      `institution:${data.institutionId}`,
      `venue:${data.venueId}`,
      `exam-entry:${data.examEntryId}`
    ], event);
  }
}

// Export singleton instance
export const examLogisticsRealtimeService = new ExamLogisticsRealtimeService();


