/**
 * Course Registration Type Definitions
 * Defines types for student course registration workflow and management
 */

// Enum definitions
export enum RegistrationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum RegistrationType {
  REGULAR = 'REGULAR',
  RETAKE = 'RETAKE',
  CARRYOVER = 'CARRYOVER',
  MAKE_UP = 'MAKE_UP'
}

export enum AcademicStanding {
  GOOD_STANDING = 'GOOD_STANDING',
  PROBATION = 'PROBATION',
  ACADEMIC_WARNING = 'ACADEMIC_WARNING',
  SUSPENDED = 'SUSPENDED',
  DISMISSED = 'DISMISSED'
}

// ========================================
// COURSE REGISTRATION TYPES (PHASE 2)
// ========================================

/**
 * Complete Course Registration data with relations
 */
export interface CourseRegistrationWithRelations {
  id: number;
  studentId: number;
  semesterId: number;
  status: RegistrationStatus;
  totalCredits: number;
  approvedBy: number | null;
  advisorId: number | null;
  submittedAt: Date | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  rejectionReason: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  student?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    studentProfiles: Array<{
      studentId: string;
      level: number;
      programId: number | null;
    }>;
  };
  semester?: {
    id: number;
    name: string;
    semesterNumber: number;
    academicYear: {
      yearCode: string;
    };
  };
  approver?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  advisor?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  registeredCourses?: RegisteredCourseWithRelations[];
}

/**
 * Registered Course with relations
 */
export interface RegisteredCourseWithRelations {
  id: number;
  registrationId: number;
  courseOfferingId: number;
  registrationType: RegistrationType;
  prerequisitesMet: boolean;
  prerequisitesOverride: boolean;
  overrideReason: string | null;
  isLocked: boolean;
  droppedAt: Date | null;
  dropReason: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  courseOffering?: {
    id: number;
    maxEnrollment: number | null;
    currentEnrollment: number;
    course: {
      id: number;
      name: string;
      code: string;
      creditHours: number;
      level: number;
      courseType: string;
      prerequisites: string | null;
    };
    primaryLecturer?: {
      id: number;
      firstName: string;
      lastName: string;
    };
  };
}

/**
 * Data to create new course registration
 */
export interface CreateCourseRegistrationData {
  studentId: number;
  semesterId: number;
  advisorId?: number;
  notes?: string;
}

/**
 * Data to update course registration
 */
export interface UpdateCourseRegistrationData {
  status?: RegistrationStatus;
  totalCredits?: number;
  approvedBy?: number;
  advisorId?: number;
  rejectionReason?: string;
  notes?: string;
}

/**
 * Data to add course to registration
 */
export interface AddCourseToRegistrationData {
  courseOfferingId: number;
  registrationType?: RegistrationType;
  prerequisitesOverride?: boolean;
  overrideReason?: string;
}

/**
 * Registration validation result
 */
export interface RegistrationValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  canSubmit: boolean;
  canApprove: boolean;
}

/**
 * Course eligibility check result
 */
export interface CourseEligibility {
  isEligible: boolean;
  reasons: string[];
  prerequisitesMet: boolean;
  missingPrerequisites: string[];
  hasCapacity: boolean;
  hasTimeConflict: boolean;
  conflictingCourses: string[];
}

/**
 * Registration summary for student view
 */
export interface RegistrationSummary {
  studentId: number;
  semesterId: number;
  hasRegistration: boolean;
  registrationId?: number;
  status?: RegistrationStatus;
  totalCredits: number;
  courseCount: number;
  canRegister: boolean;
  minCredits: number;
  maxCredits: number;
  remainingCredits: number;
}

/**
 * Registration filters for queries
 */
export interface RegistrationFilters {
  studentId?: number;
  semesterId?: number;
  academicYearId?: number;
  status?: RegistrationStatus;
  advisorId?: number;
  dateFrom?: Date | string;
  dateTo?: Date | string;
}

/**
 * Bulk registration operation
 */
export interface BulkRegistrationData {
  studentIds: number[];
  semesterId: number;
  advisorId?: number;
  notes?: string;
}

// ========================================
// GPA & ACADEMIC PROGRESS TYPES (PHASE 3)
// ========================================

/**
 * Student Semester Record with relations
 */
export interface StudentSemesterRecordWithRelations {
  id: number;
  studentId: number;
  semesterId: number;
  coursesRegistered: number;
  coursesCompleted: number;
  coursesFailed: number;
  coursesDropped: number;
  coursesInProgress: number;
  creditsAttempted: number;
  creditsEarned: number;
  semesterGPA: number | null;
  cumulativeGPA: number | null;
  totalGradePoints: number;
  totalCreditsEarned: number;
  academicStanding: AcademicStanding;
  isOnProbation: boolean;
  probationCount: number;
  remarksFromAdvisor: string | null;
  isFinalized: boolean;
  finalizedAt: Date | null;
  finalizedBy: number | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  student?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    studentProfiles: Array<{
      studentId: number;
      level: number;
    }>;
  };
  semester?: {
    id: number;
    name: string;
    semesterNumber: number;
    academicYear: {
      yearCode: string;
    };
  };
}

/**
 * Student Academic History with relations
 */
export interface StudentAcademicHistoryWithRelations {
  id: number;
  studentId: number;
  admissionYear: string;
  admissionSemester: number;
  expectedGraduationYear: string | null;
  currentLevel: number;
  currentSemester: number;
  totalSemestersCompleted: number;
  cumulativeGPA: number | null;
  overallCreditsEarned: number;
  overallCreditsAttempted: number;
  currentStatus: AcademicStanding;
  hasGraduated: boolean;
  graduationDate: Date | null;
  levelProgressionHistory: string | null;
  probationHistory: string | null;
  awardsAndHonors: string | null;
  lastUpdated: Date;
  createdAt: Date;

  // Relations
  student?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    studentProfiles: Array<{
      studentId: number;
      level: number;
      programId: number | null;
      program?: {
        id: number;
        name: string;
        code: string;
      };
    }>;
  };
}

/**
 * Data to create semester record
 */
export interface CreateSemesterRecordData {
  studentId: number;
  semesterId: number;
  coursesRegistered?: number;
  creditsAttempted?: number;
}

/**
 * Data to update semester record
 */
export interface UpdateSemesterRecordData {
  coursesCompleted?: number;
  coursesFailed?: number;
  coursesDropped?: number;
  coursesInProgress?: number;
  creditsEarned?: number;
  semesterGPA?: number;
  cumulativeGPA?: number;
  totalGradePoints?: number;
  totalCreditsEarned?: number;
  academicStanding?: AcademicStanding;
  isOnProbation?: boolean;
  probationCount?: number;
  remarksFromAdvisor?: string;
  isFinalized?: boolean;
  finalizedBy?: number;
}

/**
 * GPA calculation input
 */
export interface GPACalculationInput {
  studentId: number;
  semesterId: number;
  courses: Array<{
    courseId: number;
    creditHours: number;
    grade: string; // A, B+, B, C+, C, D+, D, F
  }>;
}

/**
 * GPA calculation result
 */
export interface GPACalculationResult {
  semesterGPA: number;
  cumulativeGPA: number;
  totalGradePoints: number;
  creditsAttempted: number;
  creditsEarned: number;
  qualityPoints: number;
  academicStanding: AcademicStanding;
  isOnProbation: boolean;
}

/**
 * Grade scale mapping
 */
export interface GradeScale {
  grade: string;
  points: number;
  minPercentage: number;
  maxPercentage: number;
  description: string;
}

/**
 * Level progression result
 */
export interface LevelProgressionResult {
  canProgress: boolean;
  currentLevel: number;
  nextLevel: number | null;
  requiredCredits: number;
  earnedCredits: number;
  missingCredits: number;
  cumulativeGPA: number;
  meetsGPARequirement: boolean;
  reasons: string[];
}

/**
 * Transcript data
 */
export interface TranscriptData {
  student: {
    id: number;
    firstName: string;
    lastName: string;
    studentId: number;
    program: string;
    admissionYear: string;
  };
  academicHistory: {
    currentLevel: number;
    totalSemestersCompleted: number;
    cumulativeGPA: number;
    totalCreditsEarned: number;
    academicStanding: AcademicStanding;
  };
  semesterRecords: Array<{
    semester: string;
    academicYear: string;
    courses: Array<{
      courseCode: string;
      courseName: string;
      creditHours: number;
      grade: string;
      gradePoints: number;
    }>;
    semesterGPA: number;
    creditsEarned: number;
  }>;
  summary: {
    totalCoursesCompleted: number;
    totalCreditHours: number;
    overallGPA: number;
    graduationStatus: string;
  };
}

/**
 * Academic history filters
 */
export interface AcademicHistoryFilters {
  studentId?: number;
  programId?: number;
  currentLevel?: number;
  academicStanding?: AcademicStanding;
  hasGraduated?: boolean;
  admissionYearFrom?: string;
  admissionYearTo?: string;
}

/**
 * Probation tracking entry
 */
export interface ProbationEntry {
  semesterId: number;
  semester: string;
  academicYear: string;
  gpa: number;
  reason: string;
  date: Date;
}

/**
 * Award and honor entry
 */
export interface AwardEntry {
  award: string;
  semesterId: number;
  semester: string;
  academicYear: string;
  gpa: number;
  date: Date;
}

/**
 * Level progression entry
 */
export interface ProgressionEntry {
  fromLevel: number;
  toLevel: number;
  date: Date;
  gpa: number;
  creditsEarned: number;
}

/**
 * Academic analytics for student
 */
export interface StudentAcademicAnalytics {
  studentId: number;
  currentGPA: number;
  trendingGPA: 'improving' | 'declining' | 'stable';
  gpaByLevel: Record<number, number>;
  gpaBySemester: Array<{ semester: string; gpa: number }>;
  courseCompletionRate: number;
  failureRate: number;
  dropRate: number;
  creditsPerSemester: number;
  projectedGraduationDate: string | null;
  onTrackForGraduation: boolean;
}
