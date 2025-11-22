// ========================================
// EXAM LOGISTICS TYPES
// ========================================

import { IncidentSeverity, IncidentStatus } from "@/types/shared/api";

// ========================================
// REFERENCE TYPES (Used by other interfaces)
// ========================================

export interface ExamTimetableEntry {
  id: number;
  courseId: number;
  venueId: number;
  examDate: Date;
  startTime: Date;
  endTime: Date;
  studentCount?: number;
  roomIds?: string; // JSON string of room IDs
  course: {
    id: number;
    code: string;
    name: string;
  };
  venue: {
    id: number;
    name: string;
  };
}

export interface UserReference {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  title?: string;
}

export interface VenueReference {
  id: number;
  name: string;
  address?: string;
}

export interface RoomReference {
  id: number;
  name: string;
  capacity: number;
}

export interface InvigilatorReference {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  title?: string;
}

export interface StudentReference {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  program?: {
    id: number;
    name: string;
    code: string;
  };
}

/**
 * Venue Officer Assignment - tracks officer assignments to venues within timetables
 */
export interface VenueOfficerAssignment {
  id: number;
  timetableId: number;
  venueId: number;
  officerId: number;
  assignedBy: number;
  assignedAt: Date;

  // Relations
  timetable?: {
    id: number;
    title: string;
  };
  venue?: {
    id: number;
    name: string;
    capacity?: number;
  };
  officer?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  assigner?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

/**
 * Exam Session Log - tracks all actions during exam sessions
 */
export interface ExamSessionLog {
  id: number;
  examEntryId: number;
  action: ExamSessionAction;
  performedBy: number;
  performedAt: Date;

  // Action details
  details: ExamSessionActionDetails;

  // Context
  venueId?: number;
  roomId?: number;
  studentId?: number;
  invigilatorId?: number;

  // Audit
  ipAddress?: string;
  userAgent?: string;
  notes?: string;

  // Relations
  examEntry?: ExamTimetableEntry;
  performer?: UserReference;
  venue?: VenueReference;
  room?: RoomReference;
  student?: StudentReference;
  invigilator?: InvigilatorReference;
}

/**
 * Invigilator Assignment - detailed assignment tracking
 */
export interface InvigilatorAssignment {
  id: number;
  examEntryId: number;
  invigilatorId: number;
  role: InvigilatorRole;
  assignedBy: number;
  assignedAt: Date;

  // Status tracking
  status: AssignmentStatus;
  checkedInAt?: Date;
  checkedOutAt?: Date;

  // Assignment details
  venueId: number;
  roomIds?: number[]; // Specific rooms if assigned to particular rooms
  duties?: string;

  // Reassignment tracking
  reassignedFrom?: number; // Previous assignment ID
  reassignedAt?: Date;
  reassignmentReason?: string;

  // Relations
  examEntry?: ExamTimetableEntry;
  invigilator?: InvigilatorReference;
  assignedByUser?: UserReference;
  venue?: VenueReference;
  rooms?: RoomReference[];
}

/**
 * Student Verification - tracks student check-ins and verification
 */
export interface StudentVerification {
  id: number;
  examEntryId: number;
  studentId: number;
  verifiedBy: number;
  verifiedAt: Date;

  // Verification details
  status: VerificationStatus;
  method: VerificationMethod;
  seatNumber?: string;
  specialArrangement?: string;

  // Biometric/QR verification
  qrCode?: string;
  biometricMatch?: boolean;
  confidenceScore?: number;

  // Issues encountered
  issues?: VerificationIssue[];
  notes?: string;

  // Relations
  examEntry?: ExamTimetableEntry;
  student?: StudentReference;
  verifier?: InvigilatorReference;
}

/**
 * Exam Incident - extends base incident for exam-specific issues
 */
export interface ExamIncident {
  id: number;
  examEntryId: number;
  type: ExamIncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;

  // Incident details
  title: string;
  description: string;
  location?: string; // Specific location within venue
  affectedStudents?: number[];
  affectedInvigilators?: number[];

  // Reporting
  reportedBy: number;
  reportedAt: Date;
  assignedTo?: number;

  // Resolution
  resolution?: string;
  resolvedBy?: number;
  resolvedAt?: Date;

  // Evidence
  attachments?: string[]; // File URLs
  witnesses?: number[]; // User IDs

  // Relations
  examEntry?: ExamTimetableEntry;
  reporter?: UserReference;
  assignee?: UserReference;
  resolver?: UserReference;
}

/**
 * Venue Session Overview - real-time status of exam sessions in a venue
 */
export interface VenueSessionOverview {
  venueId: number;
  venueName: string;
  date: Date;

  // Active sessions
  activeSessions: ExamSessionStatus[];

  // Statistics
  totalStudentsExpected: number;
  totalStudentsVerified: number;
  totalScriptsSubmitted?: number; // Added for script tracking
  totalInvigilatorsAssigned: number;
  totalInvigilatorsPresent: number;

  // Issues
  pendingIncidents?: number; // Made optional
  unresolvedIssues: number;

  // Capacity utilization
  rooms: RoomStatus[];
}

/**
 * Exam Session Status - current status of a specific exam session
 */
export interface ExamSessionStatus {
  examEntryId: number;
  courseCode: string;
  courseName: string;
  startTime: Date;
  endTime: Date;
  status: ExamSessionStatusType;

  // Attendance
  expectedStudents: number;
  verifiedStudents: number;
  absentStudents: number;

  // Invigilators
  assignedInvigilators: number;
  presentInvigilators: number;

  // Issues
  incidentCount: number;
  unresolvedIncidents: number;

  // Rooms
  rooms: {
    roomId: number;
    roomName: string;
    capacity: number;
    verifiedStudents: number;
  }[];
}

/**
 * Room Status - status of individual rooms during exam
 */
export interface RoomStatus {
  roomId: number;
  roomName: string;
  capacity: number;
  examEntryId?: number;
  courseCode?: string;

  // Occupancy
  expectedStudents: number;
  verifiedStudents: number;

  // Invigilators
  assignedInvigilators: InvigilatorPresence[];

  // Status
  status: RoomStatusType;
  issues?: string[];
}

/**
 * Invigilator Presence - tracks invigilator check-in/out
 */
export interface InvigilatorPresence {
  invigilatorId: number;
  name: string;
  role: InvigilatorRole;
  checkedInAt?: Date;
  checkedOutAt?: Date;
  status: PresenceStatus;
}

// ========================================
// ENUMS
// ========================================

export enum ExamSessionAction {
  STUDENT_CHECK_IN = 'STUDENT_CHECK_IN',
  STUDENT_CHECK_OUT = 'STUDENT_CHECK_OUT',
  INVIGILATOR_CHECK_IN = 'INVIGILATOR_CHECK_IN',
  INVIGILATOR_CHECK_OUT = 'INVIGILATOR_CHECK_OUT',
  ROOM_CHANGE = 'ROOM_CHANGE',
  INVIGILATOR_REASSIGNMENT = 'INVIGILATOR_REASSIGNMENT',
  INCIDENT_REPORTED = 'INCIDENT_REPORTED',
  INCIDENT_RESOLVED = 'INCIDENT_RESOLVED',
  SESSION_STARTED = 'SESSION_STARTED',
  SESSION_ENDED = 'SESSION_ENDED',
  VERIFICATION_OVERRIDE = 'VERIFICATION_OVERRIDE',
  EMERGENCY_ACTION = 'EMERGENCY_ACTION',
}

export enum InvigilatorRole {
  CHIEF_INVIGILATOR = 'CHIEF_INVIGILATOR',
  INVIGILATOR = 'INVIGILATOR',
  RELIEF_INVIGILATOR = 'RELIEF_INVIGILATOR',
}

export enum AssignmentStatus {
  ASSIGNED = 'ASSIGNED',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  ACTIVE = 'ACTIVE',
  CHECKED_OUT = 'CHECKED_OUT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REASSIGNED = 'REASSIGNED',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
  OVERRIDDEN = 'OVERRIDDEN',
  ABSENT = 'ABSENT',
}

export enum VerificationMethod {
  QR_CODE = 'QR_CODE',
  BIOMETRIC = 'BIOMETRIC',
  MANUAL = 'MANUAL',
  PHOTO_ID = 'PHOTO_ID',
}

export enum VerificationIssue {
  INVALID_QR = 'INVALID_QR',
  BIOMETRIC_MISMATCH = 'BIOMETRIC_MISMATCH',
  WRONG_VENUE = 'WRONG_VENUE',
  WRONG_TIME = 'WRONG_TIME',
  NO_REGISTRATION = 'NO_REGISTRATION',
  LATE_ARRIVAL = 'LATE_ARRIVAL',
}

export enum ExamIncidentType {
  STUDENT_ABSENCE = 'STUDENT_ABSENCE',
  INVIGILATOR_ABSENCE = 'INVIGILATOR_ABSENCE',
  TECHNICAL_ISSUE = 'TECHNICAL_ISSUE',
  SECURITY_BREACH = 'SECURITY_BREACH',
  MEDICAL_EMERGENCY = 'MEDICAL_EMERGENCY',
  VENUE_ISSUE = 'VENUE_ISSUE',
  ACADEMIC_MISCONDUCT = 'ACADEMIC_MISCONDUCT',
  MATERIAL_MISSING = 'MATERIAL_MISSING',
  OTHER = 'OTHER',
}

export enum ExamSessionStatusType {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  POSTPONED = 'POSTPONED',
}

export enum RoomStatusType {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  CLOSED = 'CLOSED',
}

export enum PresenceStatus {
  EXPECTED = 'EXPECTED',
  PRESENT = 'PRESENT',
  LATE = 'LATE',
  ABSENT = 'ABSENT',
  RELIEVED = 'RELIEVED',
}

// ========================================
// DATA TRANSFER TYPES
// ========================================

export interface ExamSessionActionDetails {
  action: ExamSessionAction;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface AssignInvigilatorData {
  examEntryId: number;
  invigilatorId: number;
  role: InvigilatorRole;
  venueId: number;
  roomIds?: number[];
  duties?: string;
  assignedBy: number;
}

export interface ReassignInvigilatorData {
  assignmentId: number;
  newExamEntryId?: number;
  newVenueId?: number;
  newRoomIds?: number[];
  reason: string;
  reassignedBy: number;
}

export interface StudentCheckInData {
  examEntryId: number;
  studentId: number;
  verificationMethod: VerificationMethod;
  seatNumber?: string;
  verifiedBy: number;
  qrCode?: string;
  biometricData?: unknown;
}

export interface ChangeStudentRoomData {
  verificationId: number;
  newRoomId: number;
  reason: string;
  changedBy: number;
}

export interface ReportExamIncidentData {
  examEntryId: number;
  type: ExamIncidentType;
  title: string;
  description: string;
  severity: IncidentSeverity;
  location?: string;
  affectedStudents?: number[];
  affectedInvigilators?: number[];
  attachments?: string[];
  witnesses?: number[];
  reportedBy: number;
}

export interface AssignOfficerToVenueData {
  timetableId: number;
  venueId: number;
  officerId: number;
}

export interface LogisticsQuery {
  institutionId?: number;
  venueId?: number;
  examEntryId?: number;
  date?: Date | string;
  status?: AssignmentStatus | VerificationStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ========================================
// DASHBOARD TYPES
// ========================================

export interface InstitutionLogisticsDashboard {
  institutionId: number;
  date: Date;

  // Overall statistics
  totalVenues: number;
  activeVenues: number;
  totalExamSessions: number;
  activeExamSessions: number;

  // Attendance summary
  totalExpectedStudents: number;
  totalPresentStudents: number; // Changed from totalVerifiedStudents
  totalScriptsSubmitted?: number; // Added for script submission tracking
  attendanceRate: number;
  submissionRate?: number; // Added for script submission rate

  // Invigilator summary
  totalAssignedInvigilators: number;
  totalInvigilatorsPresent: number; // Changed from totalPresentInvigilators
  invigilatorAttendanceRate: number;

  // Issues summary
  totalIncidents: number;
  unresolvedIncidents: number;

  // Venue breakdown
  venues: VenueSessionOverview[];
}

export interface ExamsOfficerDashboard {
  officerId: number;
  assignedVenues: number[];
  date: Date;

  // My venues status
  venueOverviews: VenueSessionOverview[];

  // Today's sessions
  todaysSessions: ExamSessionStatus[];

  // Pending actions
  pendingIncidents: ExamIncident[];
  unverifiedStudents: number;
  absentInvigilators: number;

  // Recent activity
  recentLogs: ExamSessionLog[];
}

// ========================================
// QR CODE TYPES
// ========================================

export interface QRCodeData {
  type: 'student_verification' | 'invigilator_checkin' | 'venue_access';
  examEntryId: number;
  studentId?: number;
  invigilatorId?: number;
  venueId?: number;
  timestamp: Date;
  expiresAt: Date;
}

export interface QRCodeScanResult {
  success: boolean;
  data?: QRCodeData;
  error?: string;
  message?: string;
}

// ========================================
// WEBSOCKET EVENT TYPES
// ========================================

export enum ExamLogisticsEvent {
  STUDENT_CHECKED_IN = 'student_checked_in',
  STUDENT_CHECKED_OUT = 'student_checked_out',
  INVIGILATOR_CHECKED_IN = 'invigilator_checked_in',
  INVIGILATOR_CHECKED_OUT = 'invigilator_checked_out',
  INVIGILATOR_ASSIGNED = 'invigilator_assigned',
  INVIGILATOR_REASSIGNED = 'invigilator_reassigned',
  INCIDENT_REPORTED = 'incident_reported',
  INCIDENT_RESOLVED = 'incident_resolved',
  ROOM_CHANGED = 'room_changed',
  SESSION_STARTED = 'session_started',
  SESSION_ENDED = 'session_ended',
  DASHBOARD_UPDATED = 'dashboard_updated',
}

export interface ExamLogisticsRealtimeEvent {
  channel: 'exam_logistics';
  event: ExamLogisticsEvent;
  payload: {
    examEntryId: number;
    venueId?: number;
    roomId?: number;
    studentId?: number;
    invigilatorId?: number;
    timestamp: string;
    data?: unknown;
  };
  timestamp: string;
}
