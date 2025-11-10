// ========================================
// EXAM REGISTRATION TYPES
// ========================================

export interface ExamRegistration {
  id: number;
  studentId: number;
  examEntryId: number;
  courseId: number;
  status: RegistrationStatus;
  attendanceStatus: AttendanceStatus;
  qrCode: string;
  seatNumber?: string | null;
  venueId?: number | null;
  submittedAt?: Date | null;
  submittedToId?: number | null;
  batchScriptId?: number | null;
  scriptId?: number | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  student?: {
    id: number;
    studentId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
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
  venue?: {
    id: number;
    name: string;
    code: string;
  };
  submittedTo?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  batchScript?: {
    id: number;
    batchNumber: string;
    status: string;
  };
  script?: {
    id: number;
    scriptNumber: string;
    status: string;
  };
}

export enum RegistrationStatus {
  REGISTERED = 'REGISTERED',
  CANCELLED = 'CANCELLED',
  DEFERRED = 'DEFERRED'
}

export enum AttendanceStatus {
  NOT_MARKED = 'NOT_MARKED',
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE'
}

// ========================================
// REQUEST/RESPONSE TYPES
// ========================================

export interface RegistrationStatistics {
  total: number;
  byStatus: Record<RegistrationStatus, number>;
  byAttendance: Record<AttendanceStatus, number>;
  totalPresent: number;
  totalSubmitted: number;
  totalPending: number;
}

export interface MissingScript {
  registrationId: number;
  studentId: number;
  studentName: string;
  studentNumber: string;
  courseCode: string;
  courseTitle: string;
  examDate: Date;
  seatNumber?: string | null;
  venueName?: string | null;
}

export interface StudentActiveExam {
  registrationId: number;
  examEntryId: number;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  examDate: Date;
  startTime: string;
  endTime: string;
  venueName?: string | null;
  seatNumber?: string | null;
  attendanceStatus: AttendanceStatus;
  qrCode: string;
}

export interface RegistrationByQRCode extends ExamRegistration {
  isValid: boolean;
  message?: string;
}

// ========================================
// QUERY TYPES
// ========================================

export interface ExamRegistrationQuery {
  examEntryId?: number;
  studentId?: number;
  courseId?: number;
  status?: RegistrationStatus;
  attendanceStatus?: AttendanceStatus;
  venueId?: number;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

// ========================================
// FORM DATA TYPES
// ========================================

export interface MarkAttendanceData {
  studentId: number;
  examEntryId: number;
  attendanceStatus: AttendanceStatus;
  notes?: string;
}
