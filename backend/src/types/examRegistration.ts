// ========================================
// EXAM REGISTRATION TYPES
// ========================================

export interface ExamRegistration {
  id: number;
  studentId: number;
  examEntryId: number;
  courseId: number;
  isPresent: boolean;
  arrivedAt?: Date;
  seatNumber?: string;
  scriptSubmitted: boolean;
  submittedAt?: Date;
  submittedTo?: number;
  batchScriptId?: number;
  scriptId?: number;
  studentQRCode: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  student?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    studentProfile?: {
      studentId: string;
      indexNumber?: string;
      level: number;
    };
  };
  examEntry?: any;
  course?: any;
  batchScript?: any;
  script?: any;
}

export interface CreateExamRegistrationData {
  studentId: number;
  examEntryId: number;
  courseId: number;
  seatNumber?: string;
  notes?: string;
}

export interface UpdateExamRegistrationData {
  isPresent?: boolean;
  arrivedAt?: Date;
  seatNumber?: string;
  scriptSubmitted?: boolean;
  submittedAt?: Date;
  submittedTo?: number;
  notes?: string;
}

export interface StudentQRCodeData {
  type: 'STUDENT';
  studentId: number;
  indexNumber: string;
  firstName: string;
  lastName: string;
  programId: number;
  level: number;
  generatedAt: string;
  securityHash: string;
}

export interface ExamRegistrationQuery {
  examEntryId?: number;
  studentId?: number;
  courseId?: number;
  isPresent?: boolean;
  scriptSubmitted?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'studentName' | 'submittedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface AutoRegisterResult {
  success: boolean;
  totalStudents: number;
  registered: number;
  skipped: number;
  errors: Array<{
    studentId: number;
    reason: string;
  }>;
}

export interface ActiveExamInfo {
  examEntryId: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  examDate: Date;
  startTime: Date;
  endTime: Date;
  venueName: string;
  canSubmit: boolean;
  isWithinTime: boolean;
}
