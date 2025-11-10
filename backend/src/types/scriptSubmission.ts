// ========================================
// SCRIPT SUBMISSION TYPES
// ========================================

export interface ScriptSubmissionData {
  studentQRCode: string;
  invigilatorId: number;
  examEntryId?: number; // Optional - can be auto-detected
  location: string;
  notes?: string;
}

export interface BulkScriptSubmissionData {
  submissions: Array<{
    studentQRCode: string;
    examEntryId?: number;
    notes?: string;
  }>;
  invigilatorId: number;
  location: string;
}

export interface ScriptSubmissionResult {
  success: boolean;
  message: string;
  data: {
    registrationId: number;
    studentName: string;
    courseCode: string;
    courseName: string;
    batchScriptId: number;
    submittedAt: Date;
    batchStats: {
      totalRegistered: number;
      totalSubmitted: number;
      remaining: number;
    };
  };
}

export interface BulkSubmissionResult {
  success: boolean;
  totalSubmissions: number;
  successCount: number;
  failureCount: number;
  submissions: ScriptSubmissionResult[];
  errors: Array<{
    studentQRCode: string;
    reason: string;
  }>;
}

export interface ScanStudentResult {
  success: boolean;
  studentInfo: {
    studentId: number;
    firstName: string;
    lastName: string;
    indexNumber: string;
    programId: number;
    level: number;
  };
  activeExams: Array<{
    examEntryId: number;
    courseId: number;
    courseCode: string;
    courseName: string;
    examDate: Date;
    startTime: Date;
    endTime: Date;
    venueName: string;
    canSubmit: boolean;
    alreadySubmitted: boolean;
  }>;
  canSubmit: boolean;
  message?: string;
}

export interface VerifyQRCodeData {
  qrCode: string;
  expectedType: 'STUDENT' | 'BATCH';
}

export interface QRCodeVerificationResult {
  valid: boolean;
  type: 'STUDENT' | 'BATCH';
  data: any;
  message?: string;
}

// QR Code Data Structure
export interface QRCodeData {
  type: 'STUDENT' | 'BATCH';
  studentId?: number;
  examEntryId: number;
  courseId: number;
  courseCode?: string;
  batchId?: number;
  timestamp: string;
  securityHash: string;
}

// QR Validation Result
export interface QRValidationResult {
  isValid: boolean;
  data?: QRCodeData;
  errorMessage?: string;
}

// Submission Statistics
export interface SubmissionStatistics {
  totalRegistered: number;
  totalPresent: number;
  totalSubmitted: number;
  totalPending: number;
  submissionRate: number;
  attendanceRate: number;
}
