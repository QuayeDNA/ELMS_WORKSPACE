// ========================================
// ACADEMIC SYSTEM TYPES FOR FRONTEND
// ========================================

// ========================================
// ENUMS
// ========================================

export enum CalendarImportStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED'
}

export enum CalendarFileType {
  CSV = 'CSV',
  EXCEL = 'EXCEL',
  ICAL = 'ICAL',
  JSON = 'JSON'
}

export enum AcademicPeriodPhase {
  BEFORE_REGISTRATION = 'before_registration',
  REGISTRATION = 'registration',
  ADD_DROP = 'add_drop',
  LECTURES = 'lectures',
  EXAMS = 'exams',
  COMPLETED = 'completed'
}

// ========================================
// INSTITUTION REFERENCE
// ========================================

export interface InstitutionReference {
  id: number;
  name: string;
  code: string;
}

// ========================================
// ACADEMIC YEAR TYPES
// ========================================

export interface AcademicYear {
  id: number;
  yearCode: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  institutionId: number;
  createdAt: string;
  institution?: InstitutionReference;
  semesters?: Semester[];
}

export interface CreateAcademicYearRequest {
  yearCode: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  institutionId: number;
}

export interface UpdateAcademicYearRequest {
  yearCode?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}

export interface AcademicYearQuery {
  institutionId?: number;
  isCurrent?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ========================================
// SEMESTER TYPES
// ========================================

export interface Semester {
  id: number;
  academicYearId: number;
  semesterNumber: number;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt: string;
  academicYear?: {
    id: number;
    yearCode: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    institution?: InstitutionReference;
  };
}

export interface CreateSemesterRequest {
  academicYearId: number;
  semesterNumber: number;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}

export interface UpdateSemesterRequest {
  semesterNumber?: number;
  name?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}

export interface SemesterQuery {
  academicYearId?: number;
  isCurrent?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ========================================
// ACADEMIC PERIOD TYPES
// ========================================

export interface AcademicPeriod {
  id: number;
  semesterId: number;

  // Registration period
  registrationStartDate: string;
  registrationEndDate: string;

  // Add/Drop period
  addDropStartDate: string | null;
  addDropEndDate: string | null;

  // Lecture/Teaching period
  lectureStartDate: string;
  lectureEndDate: string;

  // Examination period
  examStartDate: string;
  examEndDate: string;

  // Results release
  resultsReleaseDate: string | null;

  // Configuration
  maxCreditsPerStudent: number;
  minCreditsPerStudent: number;
  lateRegistrationFee: number | null;

  // Status
  isActive: boolean;
  isRegistrationOpen: boolean;
  isAddDropOpen: boolean;

  // Metadata
  notes: string | null;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  semester?: {
    id: number;
    semesterNumber: number;
    name: string;
    startDate: string;
    endDate: string;
    academicYear: {
      id: number;
      yearCode: string;
      startDate: string;
      endDate: string;
      institution?: InstitutionReference;
    };
  };
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateAcademicPeriodRequest {
  semesterId: number;
  registrationStartDate: string;
  registrationEndDate: string;
  addDropStartDate?: string | null;
  addDropEndDate?: string | null;
  lectureStartDate: string;
  lectureEndDate: string;
  examStartDate: string;
  examEndDate: string;
  resultsReleaseDate?: string | null;
  maxCreditsPerStudent?: number;
  minCreditsPerStudent?: number;
  lateRegistrationFee?: number | null;
  isActive?: boolean;
  isRegistrationOpen?: boolean;
  isAddDropOpen?: boolean;
  notes?: string | null;
  createdBy?: number;
}

export interface UpdateAcademicPeriodRequest {
  registrationStartDate?: string;
  registrationEndDate?: string;
  addDropStartDate?: string | null;
  addDropEndDate?: string | null;
  lectureStartDate?: string;
  lectureEndDate?: string;
  examStartDate?: string;
  examEndDate?: string;
  resultsReleaseDate?: string | null;
  maxCreditsPerStudent?: number;
  minCreditsPerStudent?: number;
  lateRegistrationFee?: number | null;
  isActive?: boolean;
  isRegistrationOpen?: boolean;
  isAddDropOpen?: boolean;
  notes?: string | null;
}

export interface AcademicPeriodQuery {
  semesterId?: number;
  academicYearId?: number;
  institutionId?: number;
  isActive?: boolean;
  isRegistrationOpen?: boolean;
  isAddDropOpen?: boolean;
}

export interface AcademicPeriodStatus {
  id: number;
  semesterId: number;
  currentPhase: AcademicPeriodPhase;
  isRegistrationOpen: boolean;
  isAddDropOpen: boolean;
  isExamPeriod: boolean;
  daysUntilRegistration: number | null;
  daysUntilExams: number | null;
}

// ========================================
// ACADEMIC PERIOD STATISTICS
// ========================================

export interface AcademicPeriodStats {
  overview: {
    totalAcademicYears: number;
    totalSemesters: number;
  };
  current: {
    academicYear: AcademicYear | null;
    semester: Semester | null;
  };
}

// ========================================
// CALENDAR IMPORT TYPES
// ========================================

export interface AcademicCalendarImport {
  id: number;
  institutionId: number;

  // File details
  fileName: string;
  fileUrl: string | null;
  fileType: CalendarFileType;
  fileSize: number | null;

  // Import metadata
  status: CalendarImportStatus;
  recordsTotal: number;
  recordsImported: number;
  recordsFailed: number;

  // Error tracking
  errorLog: string | null;
  validationErrors: string | null;

  // Import configuration
  importMapping: string | null;
  importOptions: string | null;

  // Audit
  importedBy: number;
  importedAt: string;
  completedAt: string | null;

  // Relations
  institution?: InstitutionReference;
  importer?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateCalendarImportRequest {
  institutionId: number;
  fileName: string;
  fileUrl?: string;
  fileType: CalendarFileType;
  fileSize?: number;
  importMapping?: Record<string, string>;
  importOptions?: Record<string, any>;
  importedBy: number;
}

export interface CalendarImportSummary {
  id: number;
  fileName: string;
  fileType: CalendarFileType;
  fileSize: number | null;
  status: CalendarImportStatus;
  recordsTotal: number;
  recordsImported: number;
  recordsFailed: number;
  successRate: number;
  importedBy: string;
  importedAt: string;
  completedAt: string | null;
  duration: number | null;
}

// ========================================
// FORM DATA TYPES
// ========================================

export interface AcademicYearFormData {
  yearCode: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  institutionId: number;
}

export interface SemesterFormData {
  academicYearId: number;
  semesterNumber: number;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface AcademicPeriodFormData {
  semesterId: number;
  registrationStartDate: string;
  registrationEndDate: string;
  addDropStartDate: string;
  addDropEndDate: string;
  lectureStartDate: string;
  lectureEndDate: string;
  examStartDate: string;
  examEndDate: string;
  resultsReleaseDate: string;
  maxCreditsPerStudent: number;
  minCreditsPerStudent: number;
  lateRegistrationFee: number | null;
  isActive: boolean;
  isRegistrationOpen: boolean;
  isAddDropOpen: boolean;
  notes: string;
}

// ========================================
// RESPONSE WRAPPERS
// ========================================

export interface AcademicYearResponse {
  success: boolean;
  data: AcademicYear;
  message?: string;
}

export interface AcademicYearsListResponse {
  success: boolean;
  data: AcademicYear[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
}

export interface SemesterResponse {
  success: boolean;
  data: Semester;
  message?: string;
}

export interface SemestersListResponse {
  success: boolean;
  data: Semester[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
}

export interface AcademicPeriodResponse {
  success: boolean;
  data: AcademicPeriod;
  message?: string;
}

export interface AcademicPeriodsListResponse {
  success: boolean;
  data: AcademicPeriod[];
  message?: string;
}
