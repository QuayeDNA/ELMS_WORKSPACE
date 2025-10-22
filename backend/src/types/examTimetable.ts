import { ExamStatus } from "@prisma/client";

// ========================================
// EXAM TIMETABLE TYPES
// ========================================

/**
 * Exam Timetable Entry - represents a single scheduled exam
 */
export interface ExamTimetableEntry {
  id: number;
  timetableId: number;

  // Core exam details
  examId?: number | null; // Link to existing Exam if created
  courseId: number;
  courseName?: string;
  courseCode?: string;

  // Program/Student information
  programIds: number[]; // Programs taking this exam
  level?: number; // 100, 200, 300, 400
  studentCount?: number;

  // Scheduling
  examDate: Date;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes

  // Venue details
  venueId: number;
  roomIds: number[]; // Multiple rooms if needed
  seatingCapacity?: number;

  // Invigilator assignments
  invigilatorIds: number[];
  chiefInvigilatorId?: number | null;

  // Status and metadata
  status: ExamTimetableEntryStatus;
  notes?: string | null;
  specialRequirements?: string | null;

  // Conflict detection
  hasConflicts: boolean;
  conflictDetails?: string | null;

  createdAt: Date;
  updatedAt: Date;

  // Relations
  timetable?: ExamTimetable;
  exam?: ExamReference | null;
  course?: CourseReference;
  programs?: ProgramReference[];
  venue?: VenueReference;
  rooms?: RoomReference[];
  invigilators?: InvigilatorReference[];
  chiefInvigilator?: InvigilatorReference | null;
}

/**
 * Exam Timetable - container for all scheduled exams in a period
 */
export interface ExamTimetable {
  id: number;
  title: string;
  description?: string | null;

  // Academic period linkage
  academicYearId: number;
  semesterId: number;
  academicPeriodId?: number | null;

  // Institution/Faculty scope
  institutionId: number;
  facultyId?: number | null; // If faculty-specific

  // Date range
  startDate: Date;
  endDate: Date;

  // Status
  status: ExamTimetableStatus;
  isPublished: boolean;
  publishedAt?: Date | null;
  publishedBy?: number | null;

  // Approval workflow
  approvalStatus: TimetableApprovalStatus;
  approvedBy?: number | null;
  approvedAt?: Date | null;
  rejectionReason?: string | null;

  // Configuration
  allowOverlaps: boolean; // Allow same students in multiple exams at same time
  autoResolveConflicts: boolean;
  defaultExamDuration: number; // minutes

  // Statistics
  totalExams: number;
  totalConflicts: number;
  venuesUtilization?: number; // percentage

  // Metadata
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  academicYear?: AcademicYearReference;
  semester?: SemesterReference;
  academicPeriod?: AcademicPeriodReference | null;
  institution?: InstitutionReference;
  faculty?: FacultyReference | null;
  entries?: ExamTimetableEntry[];
  creator?: UserReference;
  publisher?: UserReference | null;
  approver?: UserReference | null;
}

/**
 * Timetable conflict details
 */
export interface TimetableConflict {
  id: string; // Unique conflict identifier
  type: ConflictType;
  severity: ConflictSeverity;

  // Affected entries
  entryIds: number[];
  entries?: ExamTimetableEntry[];

  // Conflict details
  description: string;
  affectedStudents?: number;
  affectedPrograms?: number[];

  // Resolution
  canAutoResolve: boolean;
  suggestedResolution?: string;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: number;

  detectedAt: Date;
}

/**
 * Timetable import/export types
 */
export interface TimetableImport {
  id: number;
  timetableId?: number | null; // If importing into existing timetable

  // File details
  fileName: string;
  fileUrl?: string | null;
  fileType: TimetableFileType;
  fileSize?: number;

  // Import metadata
  status: TimetableImportStatus;
  totalRecords: number;
  importedRecords: number;
  failedRecords: number;
  skippedRecords: number;

  // Error tracking
  errors: TimetableImportError[];
  warnings: TimetableImportWarning[];

  // Configuration
  importMapping?: Record<string, string>; // Column mapping
  importOptions?: TimetableImportOptions;

  // Validation
  validationPassed: boolean;
  validationErrors?: string[];

  // Preview data (before commit)
  previewData?: ExamTimetableEntry[];

  // Audit
  importedBy: number;
  importedAt: Date;
  completedAt?: Date | null;

  // Relations
  timetable?: ExamTimetable | null;
  importer?: UserReference;
}

/**
 * Auto-scheduling configuration
 */
export interface AutoScheduleConfig {
  // Time constraints
  startDate: Date;
  endDate: Date;
  startTime: string; // HH:mm
  endTime: string; // HH:mm

  // Daily constraints
  maxExamsPerDay: number;
  minBreakBetweenExams: number; // minutes
  lunchBreakStart?: string; // HH:mm
  lunchBreakEnd?: string; // HH:mm

  // Venue preferences
  preferredVenues?: number[];
  excludedVenues?: number[];

  // Distribution preferences
  distributionStrategy: 'balanced' | 'consecutive' | 'minimize_days';
  prioritizeLevel?: number[]; // E.g., [400, 300, 200, 100]

  // Conflict handling
  avoidStudentOverlaps: boolean;
  avoidInvigilatorOverlaps: boolean;
  avoidVenueOverlaps: boolean;

  // Special handling
  allowWeekends: boolean;
  allowHolidays: boolean;
  holidays?: Date[];
}

/**
 * Scheduling result
 */
export interface SchedulingResult {
  success: boolean;
  scheduledEntries: ExamTimetableEntry[];
  unscheduledCourses: UnscheduledCourse[];
  conflicts: TimetableConflict[];
  statistics: SchedulingStatistics;
  recommendations: string[];
}

// ========================================
// SUPPORTING TYPES
// ========================================

export enum ExamTimetableEntryStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
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

export enum ConflictType {
  STUDENT_OVERLAP = 'STUDENT_OVERLAP', // Same students, same time
  VENUE_OVERLAP = 'VENUE_OVERLAP', // Same venue/room, same time
  INVIGILATOR_OVERLAP = 'INVIGILATOR_OVERLAP', // Same invigilator, same time
  CAPACITY_EXCEEDED = 'CAPACITY_EXCEEDED', // Too many students for venue
  TIME_VIOLATION = 'TIME_VIOLATION', // Outside allowed time range
  DATE_VIOLATION = 'DATE_VIOLATION', // Outside timetable date range
  PREREQUISITE_VIOLATION = 'PREREQUISITE_VIOLATION', // Prerequisite course exam after dependent course
}

export enum ConflictSeverity {
  LOW = 'LOW', // Warning, can proceed
  MEDIUM = 'MEDIUM', // Should fix but not blocking
  HIGH = 'HIGH', // Must fix before publishing
  CRITICAL = 'CRITICAL', // Blocks all operations
}

export enum TimetableFileType {
  CSV = 'CSV',
  EXCEL = 'EXCEL',
  ICAL = 'ICAL',
  JSON = 'JSON',
  PDF = 'PDF',
}

export enum TimetableImportStatus {
  PENDING = 'PENDING',
  VALIDATING = 'VALIDATING',
  VALIDATED = 'VALIDATED',
  IMPORTING = 'IMPORTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED',
}

// ========================================
// DATA TRANSFER TYPES
// ========================================

export interface CreateTimetableData {
  title: string;
  description?: string;
  academicYearId: number;
  semesterId: number;
  academicPeriodId?: number;
  institutionId: number;
  facultyId?: number;
  startDate: Date | string;
  endDate: Date | string;
  allowOverlaps?: boolean;
  autoResolveConflicts?: boolean;
  defaultExamDuration?: number;
  createdBy: number;
}

export interface UpdateTimetableData {
  title?: string;
  description?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  status?: ExamTimetableStatus;
  allowOverlaps?: boolean;
  autoResolveConflicts?: boolean;
  defaultExamDuration?: number;
}

export interface CreateTimetableEntryData {
  timetableId: number;
  courseId: number;
  programIds: number[];
  level?: number;
  examDate: Date | string;
  startTime: Date | string;
  endTime: Date | string;
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
  examDate?: Date | string;
  startTime?: Date | string;
  endTime?: Date | string;
  duration?: number;
  venueId?: number;
  roomIds?: number[];
  invigilatorIds?: number[];
  chiefInvigilatorId?: number;
  status?: ExamTimetableEntryStatus;
  notes?: string;
  specialRequirements?: string;
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
  startDate?: Date | string;
  endDate?: Date | string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'title' | 'startDate' | 'endDate' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface TimetableEntryQuery {
  timetableId?: number;
  courseId?: number;
  programId?: number;
  level?: number;
  venueId?: number;
  roomId?: number;
  invigilatorId?: number;
  status?: ExamTimetableEntryStatus;
  examDate?: Date | string;
  startDate?: Date | string;
  endDate?: Date | string;
  hasConflicts?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'examDate' | 'startTime' | 'courseCode' | 'venue';
  sortOrder?: 'asc' | 'desc';
}

export interface TimetableImportOptions {
  skipConflictCheck?: boolean;
  autoResolveConflicts?: boolean;
  createMissingVenues?: boolean;
  createMissingCourses?: boolean;
  updateExisting?: boolean;
  dryRun?: boolean; // Preview only, don't commit
}

export interface TimetableImportError {
  row: number;
  column?: string;
  field?: string;
  value?: any;
  message: string;
  severity: 'error' | 'warning';
  timestamp: Date;
}

export interface TimetableImportWarning {
  row: number;
  field?: string;
  message: string;
  suggestion?: string;
}

export interface UnscheduledCourse {
  courseId: number;
  courseCode: string;
  courseName: string;
  reason: string;
  suggestedSlots?: {
    date: Date;
    startTime: Date;
    endTime: Date;
    venueId: number;
  }[];
}

export interface SchedulingStatistics {
  totalCourses: number;
  scheduledCourses: number;
  unscheduledCourses: number;
  totalSlots: number;
  usedSlots: number;
  venuesUsed: number;
  averageExamsPerDay: number;
  totalConflicts: number;
  resolvedConflicts: number;
  executionTime: number; // milliseconds
}

// ========================================
// REFERENCE TYPES (for relations)
// ========================================

export interface ExamReference {
  id: number;
  title: string;
  status: ExamStatus;
}

export interface CourseReference {
  id: number;
  code: string;
  name: string;
  creditHours: number;
  level: number;
  department?: {
    id: number;
    name: string;
  };
}

export interface ProgramReference {
  id: number;
  code: string;
  name: string;
  type: string;
  department?: {
    id: number;
    name: string;
  };
}

export interface VenueReference {
  id: number;
  name: string;
  location: string;
  capacity: number;
}

export interface RoomReference {
  id: number;
  name: string;
  capacity: number;
  venueId: number;
}

export interface InvigilatorReference {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  title?: string;
}

export interface AcademicYearReference {
  id: number;
  yearCode: string;
  startDate: Date;
  endDate: Date;
}

export interface SemesterReference {
  id: number;
  semesterNumber: number;
  name: string;
  startDate: Date;
  endDate: Date;
}

export interface AcademicPeriodReference {
  id: number;
  examStartDate: Date;
  examEndDate: Date;
}

export interface InstitutionReference {
  id: number;
  name: string;
  code: string;
}

export interface FacultyReference {
  id: number;
  name: string;
  code: string;
}

export interface UserReference {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

// ========================================
// UTILITY TYPES
// ========================================

export interface TimeSlot {
  date: Date;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
}

export interface VenueAvailability {
  venueId: number;
  roomId?: number;
  date: Date;
  availableSlots: TimeSlot[];
  unavailableSlots: TimeSlot[];
  capacity: number;
  utilizationRate: number;
}

export interface InvigilatorAvailability {
  invigilatorId: number;
  date: Date;
  availableSlots: TimeSlot[];
  assignedSlots: TimeSlot[];
  maxAssignments: number;
  currentAssignments: number;
}

export interface StudentExamSchedule {
  studentId: number;
  programId: number;
  level: number;
  exams: {
    entryId: number;
    courseCode: string;
    courseName: string;
    examDate: Date;
    startTime: Date;
    endTime: Date;
    venue: string;
    room?: string;
    seat?: string;
  }[];
  conflicts: TimetableConflict[];
}

// ========================================
// EXPORT TYPES
// ========================================

export interface TimetableExportConfig {
  timetableId: number;
  format: TimetableFileType;
  includeInvigilators?: boolean;
  includeVenues?: boolean;
  includeStudentCounts?: boolean;
  groupBy?: 'date' | 'venue' | 'program' | 'level';
  filterBy?: {
    programIds?: number[];
    levels?: number[];
    dates?: Date[];
  };
}

export interface TimetableExportResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  format: TimetableFileType;
  recordCount: number;
  generatedAt: Date;
  expiresAt?: Date;
  error?: string;
}
