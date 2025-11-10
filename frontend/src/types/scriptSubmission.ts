// ========================================
// SCRIPT SUBMISSION TYPES
// ========================================

import { AttendanceStatus } from './examRegistration';
import { ScriptStatus } from './batchScript';

export interface ScriptSubmission {
  id: number;
  scriptNumber: string;
  registrationId: number;
  batchScriptId: number;
  studentId: number;
  examEntryId: number;
  status: ScriptStatus;
  submittedAt: Date;
  submittedById: number;
  verifiedAt?: Date | null;
  verifiedById?: number | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  student?: {
    id: number;
    studentId: string;
    firstName: string;
    lastName: string;
  };
  examEntry?: {
    id: number;
    date: Date;
    course: {
      code: string;
      title: string;
    };
  };
  submittedBy?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  verifiedBy?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  batchScript?: {
    id: number;
    batchNumber: string;
  };
}

// ========================================
// SUBMISSION HISTORY TYPES
// ========================================

export interface SubmissionHistory {
  scriptId: number;
  scriptNumber: string;
  studentName: string;
  studentNumber: string;
  courseCode: string;
  courseTitle: string;
  submittedAt: Date;
  submittedBy: string;
  status: ScriptStatus;
  verifiedAt?: Date | null;
  verifiedBy?: string | null;
}

// ========================================
// STUDENT SUBMISSION STATUS
// ========================================

export interface StudentSubmissionStatus {
  registrationId: number;
  studentId: number;
  studentName: string;
  studentNumber: string;
  examEntryId: number;
  courseCode: string;
  courseTitle: string;
  examDate: Date;
  attendanceStatus: AttendanceStatus;
  hasSubmitted: boolean;
  submittedAt?: Date | null;
  scriptNumber?: string | null;
  scriptStatus?: ScriptStatus | null;
  batchNumber?: string | null;
}

// ========================================
// QR CODE VALIDATION
// ========================================

export interface QRCodeValidation {
  isValid: boolean;
  registration?: {
    id: number;
    studentId: number;
    studentName: string;
    studentNumber: string;
    examEntryId: number;
    courseCode: string;
    courseTitle: string;
    examDate: Date;
    attendanceStatus: AttendanceStatus;
    hasSubmitted: boolean;
  };
  message?: string;
}

// ========================================
// FORM DATA TYPES
// ========================================

export interface SubmitScriptData {
  qrCode: string;
  examEntryId: number;
  notes?: string;
}

export interface BulkSubmitScriptsData {
  submissions: Array<{
    qrCode: string;
    examEntryId: number;
  }>;
  notes?: string;
}

export interface VerifyScriptData {
  scriptId: number;
  notes?: string;
}

export interface ScanStudentData {
  qrCode: string;
  examEntryId: number;
}

// ========================================
// QUERY TYPES
// ========================================

export interface SubmissionHistoryQuery {
  batchId?: number;
  examEntryId?: number;
  courseId?: number;
  status?: ScriptStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}
