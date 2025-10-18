// Enums for Academic Calendar Import
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

// Academic Year types
export interface CreateAcademicYearData {
  yearCode: string;
  startDate: Date;
  endDate: Date;
  isCurrent?: boolean;
  institutionId: number;
}

export interface UpdateAcademicYearData {
  yearCode?: string;
  startDate?: Date;
  endDate?: Date;
  isCurrent?: boolean;
}

export interface AcademicYearQueryParams {
  institutionId?: number;
  isCurrent?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Semester types
export interface CreateSemesterData {
  academicYearId: number;
  semesterNumber: number;
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent?: boolean;
}

export interface UpdateSemesterData {
  semesterNumber?: number;
  name?: string;
  startDate?: Date;
  endDate?: Date;
  isCurrent?: boolean;
}

export interface SemesterQueryParams {
  academicYearId?: number;
  isCurrent?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Stats types
export interface AcademicPeriodStatsParams {
  institutionId?: number;
}

// Response types
export interface AcademicYearResponse {
  id: number;
  yearCode: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  institutionId: number;
  createdAt: Date;
  institution: {
    id: number;
    name: string;
    code: string;
  };
  semesters: SemesterResponse[];
}

export interface SemesterResponse {
  id: number;
  academicYearId: number;
  semesterNumber: number;
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  createdAt: Date;
  academicYear: {
    id: number;
    yearCode: string;
    startDate: Date;
    endDate: Date;
    isCurrent: boolean;
    institution: {
      id: number;
      name: string;
      code: string;
    };
  };
}

// ========================================
// ACADEMIC PERIOD TYPES (New)
// ========================================

/**
 * Complete Academic Period data including all relations
 */
export interface AcademicPeriodWithRelations {
  id: number;
  semesterId: number;

  // Registration period
  registrationStartDate: Date;
  registrationEndDate: Date;

  // Add/Drop period
  addDropStartDate: Date | null;
  addDropEndDate: Date | null;

  // Lecture/Teaching period
  lectureStartDate: Date;
  lectureEndDate: Date;

  // Examination period
  examStartDate: Date;
  examEndDate: Date;

  // Results release
  resultsReleaseDate: Date | null;

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
  createdAt: Date;
  updatedAt: Date;

  // Relations
  semester?: {
    id: number;
    semesterNumber: number;
    name: string;
    startDate: Date;
    endDate: Date;
    academicYear: {
      id: number;
      yearCode: string;
      startDate: Date;
      endDate: Date;
    };
  };
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

/**
 * Data required to create a new Academic Period
 */
export interface CreateAcademicPeriodData {
  semesterId: number;

  // Registration period
  registrationStartDate: Date | string;
  registrationEndDate: Date | string;

  // Add/Drop period (optional)
  addDropStartDate?: Date | string | null;
  addDropEndDate?: Date | string | null;

  // Lecture/Teaching period
  lectureStartDate: Date | string;
  lectureEndDate: Date | string;

  // Examination period
  examStartDate: Date | string;
  examEndDate: Date | string;

  // Results release (optional)
  resultsReleaseDate?: Date | string | null;

  // Configuration (optional with defaults)
  maxCreditsPerStudent?: number;
  minCreditsPerStudent?: number;
  lateRegistrationFee?: number | null;

  // Status (optional with defaults)
  isActive?: boolean;
  isRegistrationOpen?: boolean;
  isAddDropOpen?: boolean;

  // Metadata
  notes?: string | null;
  createdBy?: number;
}

/**
 * Data for updating an existing Academic Period
 */
export interface UpdateAcademicPeriodData {
  // Registration period
  registrationStartDate?: Date | string;
  registrationEndDate?: Date | string;

  // Add/Drop period
  addDropStartDate?: Date | string | null;
  addDropEndDate?: Date | string | null;

  // Lecture/Teaching period
  lectureStartDate?: Date | string;
  lectureEndDate?: Date | string;

  // Examination period
  examStartDate?: Date | string;
  examEndDate?: Date | string;

  // Results release
  resultsReleaseDate?: Date | string | null;

  // Configuration
  maxCreditsPerStudent?: number;
  minCreditsPerStudent?: number;
  lateRegistrationFee?: number | null;

  // Status
  isActive?: boolean;
  isRegistrationOpen?: boolean;
  isAddDropOpen?: boolean;

  // Metadata
  notes?: string | null;
}

/**
 * Academic Period summary for list views
 */
export interface AcademicPeriodSummary {
  id: number;
  semesterId: number;
  semesterName: string;
  academicYearCode: string;

  registrationPeriod: {
    start: Date;
    end: Date;
    isOpen: boolean;
  };

  addDropPeriod: {
    start: Date | null;
    end: Date | null;
    isOpen: boolean;
  } | null;

  lecturePeriod: {
    start: Date;
    end: Date;
  };

  examPeriod: {
    start: Date;
    end: Date;
  };

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Period status for current state checking
 */
export interface AcademicPeriodStatus {
  id: number;
  semesterId: number;
  currentPhase: 'before_registration' | 'registration' | 'add_drop' | 'lectures' | 'exams' | 'completed';
  isRegistrationOpen: boolean;
  isAddDropOpen: boolean;
  isExamPeriod: boolean;
  daysUntilRegistration: number | null;
  daysUntilExams: number | null;
}

/**
 * Query filters for academic periods
 */
export interface AcademicPeriodFilters {
  semesterId?: number;
  academicYearId?: number;
  institutionId?: number;
  isActive?: boolean;
  isRegistrationOpen?: boolean;
  isAddDropOpen?: boolean;
  dateFrom?: Date | string;
  dateTo?: Date | string;
}

/**
 * Validation result for academic period dates
 */
export interface AcademicPeriodValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ========================================
// ACADEMIC CALENDAR IMPORT TYPES (New)
// ========================================

/**
 * Complete Academic Calendar Import data
 */
export interface AcademicCalendarImportWithRelations {
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
  importedAt: Date;
  completedAt: Date | null;

  // Relations
  institution?: {
    id: number;
    name: string;
    code: string;
  };
  importer?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

/**
 * Data required to initiate a calendar import
 */
export interface CreateCalendarImportData {
  institutionId: number;
  fileName: string;
  fileUrl?: string;
  fileType: CalendarFileType;
  fileSize?: number;
  importMapping?: Record<string, string>;
  importOptions?: Record<string, any>;
  importedBy: number;
}

/**
 * Update calendar import progress
 */
export interface UpdateCalendarImportData {
  status?: CalendarImportStatus;
  recordsTotal?: number;
  recordsImported?: number;
  recordsFailed?: number;
  errorLog?: CalendarImportError[];
  validationErrors?: CalendarValidationError[];
  completedAt?: Date;
}

/**
 * Calendar import error structure
 */
export interface CalendarImportError {
  row: number;
  field?: string;
  message: string;
  data?: any;
  timestamp: Date;
}

/**
 * Calendar validation error structure
 */
export interface CalendarValidationError {
  row: number;
  field: string;
  value: any;
  expected: string;
  message: string;
}

/**
 * Calendar import summary
 */
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
  importedAt: Date;
  completedAt: Date | null;
  duration: number | null; // milliseconds
}

/**
 * Parsed calendar data from file
 */
export interface ParsedCalendarData {
  academicYears: ParsedAcademicYear[];
  semesters: ParsedSemester[];
  academicPeriods: ParsedAcademicPeriod[];
  errors: CalendarImportError[];
  validationErrors: CalendarValidationError[];
}

export interface ParsedAcademicYear {
  yearCode: string;
  startDate: Date;
  endDate: Date;
  institutionId: number;
}

export interface ParsedSemester {
  academicYearCode: string;
  semesterNumber: number;
  name: string;
  startDate: Date;
  endDate: Date;
}

export interface ParsedAcademicPeriod {
  semesterKey: string; // Format: "yearCode-semesterNumber"
  registrationStartDate: Date;
  registrationEndDate: Date;
  addDropStartDate?: Date;
  addDropEndDate?: Date;
  lectureStartDate: Date;
  lectureEndDate: Date;
  examStartDate: Date;
  examEndDate: Date;
  resultsReleaseDate?: Date;
  maxCreditsPerStudent?: number;
  minCreditsPerStudent?: number;
}

/**
 * Calendar export format
 */
export interface CalendarExportData {
  format: 'csv' | 'excel' | 'ical' | 'json';
  institutionId: number;
  academicYearId?: number;
  semesterId?: number;
  includeAcademicYears: boolean;
  includeSemesters: boolean;
  includeAcademicPeriods: boolean;
}
