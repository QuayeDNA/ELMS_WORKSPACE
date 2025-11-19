-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'FACULTY_ADMIN', 'DEAN', 'HOD', 'EXAMS_OFFICER', 'SCRIPT_HANDLER', 'INVIGILATOR', 'LECTURER', 'STUDENT');

-- CreateEnum
CREATE TYPE "AcademicRankLevel" AS ENUM ('GRADUATE_ASSISTANT', 'ASSISTANT_LECTURER', 'LECTURER', 'SENIOR_LECTURER', 'PRINCIPAL_LECTURER', 'ASSOCIATE_PROFESSOR', 'PROFESSOR');

-- CreateEnum
CREATE TYPE "ProgramType" AS ENUM ('CERTIFICATE', 'DIPLOMA', 'HND', 'BACHELOR', 'MASTERS', 'PHD');

-- CreateEnum
CREATE TYPE "ProgramLevel" AS ENUM ('UNDERGRADUATE', 'POSTGRADUATE');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'DEFERRED', 'GRADUATED', 'WITHDRAWN', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AcademicStatus" AS ENUM ('GOOD_STANDING', 'PROBATION', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('CORE', 'ELECTIVE', 'GENERAL');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'VISITING');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'RETIRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "CalendarImportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'PARTIALLY_COMPLETED');

-- CreateEnum
CREATE TYPE "CalendarFileType" AS ENUM ('CSV', 'EXCEL', 'ICAL', 'JSON');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RegistrationItemStatus" AS ENUM ('REGISTERED', 'DROPPED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AcademicStanding" AS ENUM ('GOOD_STANDING', 'PROBATION', 'ACADEMIC_WARNING', 'SUSPENDED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('PLANNED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- CreateEnum
CREATE TYPE "ExamTimetableStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TimetableApprovalStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED', 'REVISION_REQUIRED');

-- CreateEnum
CREATE TYPE "ExamTimetableEntryStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "TimetableFileType" AS ENUM ('CSV', 'EXCEL', 'ICAL', 'JSON', 'PDF');

-- CreateEnum
CREATE TYPE "TimetableImportStatus" AS ENUM ('PENDING', 'VALIDATING', 'VALIDATED', 'IMPORTING', 'COMPLETED', 'FAILED', 'PARTIALLY_COMPLETED');

-- CreateEnum
CREATE TYPE "ConflictType" AS ENUM ('STUDENT_OVERLAP', 'VENUE_OVERLAP', 'INVIGILATOR_OVERLAP', 'CAPACITY_EXCEEDED', 'TIME_VIOLATION', 'DATE_VIOLATION', 'PREREQUISITE_VIOLATION');

-- CreateEnum
CREATE TYPE "ConflictSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ScriptStatus" AS ENUM ('GENERATED', 'DISTRIBUTED', 'COLLECTED', 'VERIFIED', 'SCANNED', 'DISPATCHED', 'RECEIVED_FOR_GRADING', 'GRADING_IN_PROGRESS', 'GRADED', 'RETURNED');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('GENERATED', 'DISTRIBUTED_TO_VENUE', 'COLLECTED_FROM_STUDENT', 'VERIFIED_BY_INVIGILATOR', 'SCANNED_BY_HANDLER', 'DISPATCHED_TO_GRADER', 'RECEIVED_BY_GRADER', 'GRADED', 'RETURNED_TO_REGISTRY', 'BATCH_SEALED', 'BATCH_TRANSFERRED');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('ACADEMIC_MISCONDUCT', 'TECHNICAL_ISSUE', 'MEDICAL_EMERGENCY', 'MISSING_SCRIPT', 'DAMAGED_SCRIPT', 'LATE_ARRIVAL', 'IDENTITY_VERIFICATION', 'VENUE_ISSUE', 'OTHER');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('REPORTED', 'UNDER_INVESTIGATION', 'RESOLVED', 'CLOSED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT');

-- CreateEnum
CREATE TYPE "BatchScriptStatus" AS ENUM ('PENDING', 'IN_COLLECTION', 'SEALED', 'IN_TRANSIT', 'WITH_LECTURER', 'GRADING_IN_PROGRESS', 'GRADING_COMPLETED', 'RETURNED_TO_REGISTRY', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StudentIdFormat" AS ENUM ('SEQUENTIAL', 'ACADEMIC_YEAR', 'CUSTOM');

-- CreateEnum
CREATE TYPE "StudentIdYearPosition" AS ENUM ('PREFIX', 'MIDDLE', 'SUFFIX');

-- CreateEnum
CREATE TYPE "ExamSessionAction" AS ENUM ('STUDENT_CHECK_IN', 'STUDENT_CHECK_OUT', 'INVIGILATOR_CHECK_IN', 'INVIGILATOR_CHECK_OUT', 'ROOM_CHANGE', 'INVIGILATOR_REASSIGNMENT', 'INCIDENT_REPORTED', 'INCIDENT_RESOLVED', 'SESSION_STARTED', 'SESSION_ENDED', 'VERIFICATION_OVERRIDE', 'EMERGENCY_ACTION');

-- CreateEnum
CREATE TYPE "InvigilatorRole" AS ENUM ('CHIEF_INVIGILATOR', 'INVIGILATOR', 'RELIEF_INVIGILATOR');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ASSIGNED', 'CONFIRMED', 'CHECKED_IN', 'ACTIVE', 'CHECKED_OUT', 'COMPLETED', 'CANCELLED', 'REASSIGNED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED', 'OVERRIDDEN', 'ABSENT');

-- CreateEnum
CREATE TYPE "VerificationMethod" AS ENUM ('QR_CODE', 'BIOMETRIC', 'MANUAL', 'PHOTO_ID');

-- CreateEnum
CREATE TYPE "VerificationIssue" AS ENUM ('INVALID_QR', 'BIOMETRIC_MISMATCH', 'WRONG_VENUE', 'WRONG_TIME', 'NO_REGISTRATION', 'LATE_ARRIVAL');

-- CreateEnum
CREATE TYPE "ExamIncidentType" AS ENUM ('STUDENT_ABSENCE', 'INVIGILATOR_ABSENCE', 'TECHNICAL_ISSUE', 'SECURITY_BREACH', 'MEDICAL_EMERGENCY', 'VENUE_ISSUE', 'ACADEMIC_MISCONDUCT', 'MATERIAL_MISSING', 'OTHER');

-- CreateEnum
CREATE TYPE "ExamSessionStatusType" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- CreateEnum
CREATE TYPE "RoomStatusType" AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLOSED');

-- CreateEnum
CREATE TYPE "PresenceStatus" AS ENUM ('EXPECTED', 'PRESENT', 'LATE', 'ABSENT', 'RELIEVED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "title" TEXT,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "lastLogin" TIMESTAMP(3),
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "nationality" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "institutionId" INTEGER,
    "facultyId" INTEGER,
    "departmentId" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_profiles" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "UserRole" NOT NULL,
    "permissions" JSONB NOT NULL,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'UNIVERSITY',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "establishedYear" INTEGER,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "website" TEXT,
    "description" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_id_configs" (
    "id" SERIAL NOT NULL,
    "institutionId" INTEGER NOT NULL,
    "format" "StudentIdFormat" NOT NULL,
    "prefix" TEXT,
    "useAcademicYear" BOOLEAN NOT NULL DEFAULT false,
    "academicYearPos" "StudentIdYearPosition",
    "separator" TEXT,
    "paddingLength" INTEGER NOT NULL DEFAULT 6,
    "startNumber" INTEGER NOT NULL DEFAULT 1,
    "currentNumber" INTEGER NOT NULL DEFAULT 1,
    "pattern" TEXT,
    "example" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_id_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculties" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "establishedYear" INTEGER,
    "institutionId" INTEGER NOT NULL,
    "deanId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'department',
    "description" TEXT,
    "officeLocation" TEXT,
    "contactInfo" TEXT,
    "facultyId" INTEGER NOT NULL,
    "hodId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "ProgramType" NOT NULL,
    "level" "ProgramLevel" NOT NULL,
    "durationYears" DOUBLE PRECISION NOT NULL,
    "creditHours" INTEGER,
    "description" TEXT,
    "admissionRequirements" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "departmentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_prefixes" (
    "id" SERIAL NOT NULL,
    "programType" "ProgramType" NOT NULL,
    "prefix" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_prefixes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "creditHours" INTEGER NOT NULL DEFAULT 3,
    "contactHours" INTEGER,
    "level" INTEGER NOT NULL,
    "courseType" "CourseType" NOT NULL DEFAULT 'CORE',
    "prerequisites" TEXT,
    "corequisites" TEXT,
    "learningOutcomes" TEXT,
    "syllabus" TEXT,
    "assessmentMethods" TEXT,
    "recommendedBooks" TEXT,
    "departmentId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_courses" (
    "id" SERIAL NOT NULL,
    "programId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isCore" BOOLEAN NOT NULL DEFAULT true,
    "offeredInSemester1" BOOLEAN NOT NULL DEFAULT true,
    "offeredInSemester2" BOOLEAN NOT NULL DEFAULT false,
    "prerequisiteCourseIds" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "yearInProgram" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "program_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_years" (
    "id" SERIAL NOT NULL,
    "yearCode" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "institutionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semesters" (
    "id" SERIAL NOT NULL,
    "academicYearId" INTEGER NOT NULL,
    "semesterNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "semesters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_periods" (
    "id" SERIAL NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "registrationStartDate" TIMESTAMP(3) NOT NULL,
    "registrationEndDate" TIMESTAMP(3) NOT NULL,
    "addDropStartDate" TIMESTAMP(3),
    "addDropEndDate" TIMESTAMP(3),
    "lectureStartDate" TIMESTAMP(3) NOT NULL,
    "lectureEndDate" TIMESTAMP(3) NOT NULL,
    "examStartDate" TIMESTAMP(3) NOT NULL,
    "examEndDate" TIMESTAMP(3) NOT NULL,
    "resultsReleaseDate" TIMESTAMP(3),
    "maxCreditsPerStudent" INTEGER NOT NULL DEFAULT 24,
    "minCreditsPerStudent" INTEGER NOT NULL DEFAULT 12,
    "lateRegistrationFee" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isRegistrationOpen" BOOLEAN NOT NULL DEFAULT false,
    "isAddDropOpen" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_calendar_imports" (
    "id" SERIAL NOT NULL,
    "institutionId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileType" "CalendarFileType" NOT NULL,
    "fileSize" INTEGER,
    "status" "CalendarImportStatus" NOT NULL DEFAULT 'PENDING',
    "recordsTotal" INTEGER NOT NULL DEFAULT 0,
    "recordsImported" INTEGER NOT NULL DEFAULT 0,
    "recordsFailed" INTEGER NOT NULL DEFAULT 0,
    "errorLog" TEXT,
    "validationErrors" TEXT,
    "importMapping" TEXT,
    "importOptions" TEXT,
    "importedBy" INTEGER NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "academic_calendar_imports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_offerings" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "primaryLecturerId" INTEGER,
    "maxEnrollment" INTEGER,
    "currentEnrollment" INTEGER NOT NULL DEFAULT 0,
    "classroom" TEXT,
    "schedule" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_offerings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_lecturers" (
    "id" SERIAL NOT NULL,
    "courseOfferingId" INTEGER NOT NULL,
    "lecturerId" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'instructor',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_lecturers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecturer_departments" (
    "id" SERIAL NOT NULL,
    "lecturerId" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lecturer_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_enrollments" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "courseOfferingId" INTEGER NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "itemStatus" "RegistrationItemStatus" NOT NULL DEFAULT 'REGISTERED',
    "advisorId" INTEGER,
    "advisorApprovedAt" TIMESTAMP(3),
    "approverId" INTEGER,
    "approverApprovedAt" TIMESTAMP(3),
    "grade" TEXT,
    "gradePoints" DOUBLE PRECISION,
    "attendance" DOUBLE PRECISION,
    "droppedAt" TIMESTAMP(3),
    "dropReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_registrations" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "advisorId" INTEGER,
    "approverId" INTEGER,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'ACTIVE',
    "totalCredits" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_registration_items" (
    "id" SERIAL NOT NULL,
    "registrationId" INTEGER NOT NULL,
    "courseOfferingId" INTEGER NOT NULL,
    "status" "RegistrationItemStatus" NOT NULL DEFAULT 'REGISTERED',
    "droppedAt" TIMESTAMP(3),
    "dropReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_registration_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_semester_records" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "coursesRegistered" INTEGER NOT NULL DEFAULT 0,
    "coursesCompleted" INTEGER NOT NULL DEFAULT 0,
    "coursesFailed" INTEGER NOT NULL DEFAULT 0,
    "coursesDropped" INTEGER NOT NULL DEFAULT 0,
    "coursesInProgress" INTEGER NOT NULL DEFAULT 0,
    "creditsAttempted" INTEGER NOT NULL DEFAULT 0,
    "creditsEarned" INTEGER NOT NULL DEFAULT 0,
    "semesterGPA" DOUBLE PRECISION,
    "cumulativeGPA" DOUBLE PRECISION,
    "totalGradePoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCreditsEarned" INTEGER NOT NULL DEFAULT 0,
    "academicStanding" "AcademicStanding" NOT NULL DEFAULT 'GOOD_STANDING',
    "isOnProbation" BOOLEAN NOT NULL DEFAULT false,
    "probationCount" INTEGER NOT NULL DEFAULT 0,
    "remarksFromAdvisor" TEXT,
    "isFinalized" BOOLEAN NOT NULL DEFAULT false,
    "finalizedAt" TIMESTAMP(3),
    "finalizedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_semester_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_academic_history" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "admissionYear" TEXT NOT NULL,
    "admissionSemester" INTEGER NOT NULL DEFAULT 1,
    "expectedGraduationYear" TEXT,
    "currentLevel" INTEGER NOT NULL DEFAULT 100,
    "currentSemester" INTEGER NOT NULL DEFAULT 1,
    "totalSemestersCompleted" INTEGER NOT NULL DEFAULT 0,
    "cumulativeGPA" DOUBLE PRECISION,
    "overallCreditsEarned" INTEGER NOT NULL DEFAULT 0,
    "overallCreditsAttempted" INTEGER NOT NULL DEFAULT 0,
    "currentStatus" "AcademicStanding" NOT NULL DEFAULT 'GOOD_STANDING',
    "hasGraduated" BOOLEAN NOT NULL DEFAULT false,
    "graduationDate" TIMESTAMP(3),
    "levelProgressionHistory" TEXT,
    "probationHistory" TEXT,
    "awardsAndHonors" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_academic_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "defaultWeight" DOUBLE PRECISION,

    CONSTRAINT "assessment_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" SERIAL NOT NULL,
    "courseOfferingId" INTEGER NOT NULL,
    "assessmentTypeId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "totalMarks" DOUBLE PRECISION NOT NULL,
    "weightPercentage" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3),
    "instructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_assessments" (
    "id" SERIAL NOT NULL,
    "assessmentId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "score" DOUBLE PRECISION,
    "submittedAt" TIMESTAMP(3),
    "gradedAt" TIMESTAMP(3),
    "gradedById" INTEGER,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "courseId" INTEGER NOT NULL,
    "facultyId" INTEGER NOT NULL,
    "examDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "venueId" INTEGER,
    "roomId" INTEGER,
    "status" "ExamStatus" NOT NULL DEFAULT 'PLANNED',
    "instructions" TEXT,
    "specialRequirements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_sessions" (
    "id" SERIAL NOT NULL,
    "examId" INTEGER NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "actualStartTime" TIMESTAMP(3),
    "actualEndTime" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_timetables" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "academicYearId" INTEGER NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "academicPeriodId" INTEGER,
    "institutionId" INTEGER NOT NULL,
    "facultyId" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "ExamTimetableStatus" NOT NULL DEFAULT 'DRAFT',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "publishedBy" INTEGER,
    "approvalStatus" "TimetableApprovalStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "approvedBy" INTEGER,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "allowOverlaps" BOOLEAN NOT NULL DEFAULT false,
    "autoResolveConflicts" BOOLEAN NOT NULL DEFAULT true,
    "defaultExamDuration" INTEGER NOT NULL DEFAULT 180,
    "totalExams" INTEGER NOT NULL DEFAULT 0,
    "totalConflicts" INTEGER NOT NULL DEFAULT 0,
    "venuesUtilization" DOUBLE PRECISION,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_timetables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_timetable_entries" (
    "id" SERIAL NOT NULL,
    "timetableId" INTEGER NOT NULL,
    "examId" INTEGER,
    "courseId" INTEGER NOT NULL,
    "level" INTEGER,
    "studentCount" INTEGER,
    "examDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "venueId" INTEGER NOT NULL,
    "seatingCapacity" INTEGER,
    "chiefInvigilatorId" INTEGER,
    "status" "ExamTimetableEntryStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "specialRequirements" TEXT,
    "hasConflicts" BOOLEAN NOT NULL DEFAULT false,
    "conflictDetails" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_timetable_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_timetable_programs" (
    "id" SERIAL NOT NULL,
    "timetableEntryId" INTEGER NOT NULL,
    "programId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_timetable_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_timetable_rooms" (
    "id" SERIAL NOT NULL,
    "timetableEntryId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "capacity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_timetable_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_timetable_invigilators" (
    "id" SERIAL NOT NULL,
    "timetableEntryId" INTEGER NOT NULL,
    "invigilatorId" INTEGER NOT NULL,
    "role" "InvigilatorRole" NOT NULL DEFAULT 'INVIGILATOR',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_timetable_invigilators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_conflicts" (
    "id" TEXT NOT NULL,
    "timetableId" INTEGER NOT NULL,
    "type" "ConflictType" NOT NULL,
    "severity" "ConflictSeverity" NOT NULL DEFAULT 'MEDIUM',
    "entry1Id" INTEGER NOT NULL,
    "entry2Id" INTEGER NOT NULL,
    "additionalEntryIds" TEXT,
    "description" TEXT NOT NULL,
    "affectedStudents" INTEGER,
    "affectedPrograms" TEXT,
    "canAutoResolve" BOOLEAN NOT NULL DEFAULT false,
    "suggestedResolution" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" INTEGER,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timetable_conflicts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_imports" (
    "id" SERIAL NOT NULL,
    "timetableId" INTEGER,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileType" "TimetableFileType" NOT NULL,
    "fileSize" INTEGER,
    "status" "TimetableImportStatus" NOT NULL DEFAULT 'PENDING',
    "totalRecords" INTEGER NOT NULL DEFAULT 0,
    "importedRecords" INTEGER NOT NULL DEFAULT 0,
    "failedRecords" INTEGER NOT NULL DEFAULT 0,
    "skippedRecords" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT,
    "warnings" TEXT,
    "importMapping" TEXT,
    "importOptions" TEXT,
    "validationPassed" BOOLEAN NOT NULL DEFAULT false,
    "validationErrors" TEXT,
    "previewData" TEXT,
    "importedBy" INTEGER NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "timetable_imports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venues" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "institutionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "venueId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scripts" (
    "id" SERIAL NOT NULL,
    "qrCode" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "examId" INTEGER NOT NULL,
    "status" "ScriptStatus" NOT NULL DEFAULT 'GENERATED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "batchScriptId" INTEGER,
    "currentHolderId" INTEGER,
    "gradedById" INTEGER,
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "gradedAt" TIMESTAMP(3),

    CONSTRAINT "scripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "script_movements" (
    "id" SERIAL NOT NULL,
    "scriptId" INTEGER NOT NULL,
    "type" "MovementType" NOT NULL,
    "fromUserId" INTEGER,
    "toUserId" INTEGER,
    "location" TEXT,
    "notes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "batchScriptId" INTEGER,

    CONSTRAINT "script_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_registrations" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "examEntryId" INTEGER NOT NULL,
    "studentQRCode" TEXT NOT NULL,
    "isPresent" BOOLEAN NOT NULL DEFAULT false,
    "attendanceMarkedAt" TIMESTAMP(3),
    "attendanceMarkedBy" INTEGER,
    "scriptSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "scriptSubmittedAt" TIMESTAMP(3),
    "seatNumber" TEXT,
    "specialArrangement" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submitted_to" INTEGER,
    "batch_script_id" INTEGER,
    "script_id" INTEGER,

    CONSTRAINT "exam_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_scripts" (
    "id" SERIAL NOT NULL,
    "examEntryId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "batchQRCode" TEXT NOT NULL,
    "status" "BatchScriptStatus" NOT NULL DEFAULT 'PENDING',
    "totalRegistered" INTEGER NOT NULL DEFAULT 0,
    "scriptsSubmitted" INTEGER NOT NULL DEFAULT 0,
    "scriptsCollected" INTEGER NOT NULL DEFAULT 0,
    "scriptsGraded" INTEGER NOT NULL DEFAULT 0,
    "assignedLecturerId" INTEGER,
    "sealedAt" TIMESTAMP(3),
    "sealedBy" INTEGER,
    "deliveredAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batch_scripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" SERIAL NOT NULL,
    "type" "IncidentType" NOT NULL,
    "severity" "IncidentSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "IncidentStatus" NOT NULL DEFAULT 'REPORTED',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "examId" INTEGER,
    "scriptId" INTEGER,
    "reportedById" INTEGER NOT NULL,
    "assignedToId" INTEGER,
    "resolution" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_session_logs" (
    "id" SERIAL NOT NULL,
    "examEntryId" INTEGER NOT NULL,
    "action" "ExamSessionAction" NOT NULL,
    "performedBy" INTEGER NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB NOT NULL,
    "venueId" INTEGER,
    "roomId" INTEGER,
    "studentId" INTEGER,
    "invigilatorId" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_session_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invigilator_assignments" (
    "id" SERIAL NOT NULL,
    "examEntryId" INTEGER NOT NULL,
    "invigilatorId" INTEGER NOT NULL,
    "role" "InvigilatorRole" NOT NULL,
    "assignedBy" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "checkedInAt" TIMESTAMP(3),
    "checkedOutAt" TIMESTAMP(3),
    "venueId" INTEGER NOT NULL,
    "duties" TEXT,
    "reassignedFrom" INTEGER,
    "reassignedAt" TIMESTAMP(3),
    "reassignmentReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invigilator_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_verifications" (
    "id" SERIAL NOT NULL,
    "examEntryId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "verifiedBy" INTEGER NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "method" "VerificationMethod" NOT NULL,
    "seatNumber" TEXT,
    "specialArrangement" TEXT,
    "qrCode" TEXT,
    "biometricMatch" BOOLEAN,
    "confidenceScore" DOUBLE PRECISION,
    "issues" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_incidents" (
    "id" SERIAL NOT NULL,
    "examEntryId" INTEGER NOT NULL,
    "type" "ExamIncidentType" NOT NULL,
    "severity" "IncidentSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "IncidentStatus" NOT NULL DEFAULT 'REPORTED',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "affectedStudents" TEXT,
    "reportedBy" INTEGER NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedTo" INTEGER,
    "resolution" TEXT,
    "resolvedBy" INTEGER,
    "resolvedAt" TIMESTAMP(3),
    "attachments" TEXT,
    "witnesses" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_institutionId_role_idx" ON "users"("institutionId", "role");

-- CreateIndex
CREATE INDEX "users_facultyId_role_idx" ON "users"("facultyId", "role");

-- CreateIndex
CREATE INDEX "users_email_status_idx" ON "users"("email", "status");

-- CreateIndex
CREATE INDEX "users_role_status_idx" ON "users"("role", "status");

-- CreateIndex
CREATE INDEX "users_departmentId_role_idx" ON "users"("departmentId", "role");

-- CreateIndex
CREATE INDEX "users_status_lastLogin_idx" ON "users"("status", "lastLogin");

-- CreateIndex
CREATE INDEX "role_profiles_userId_role_isActive_idx" ON "role_profiles"("userId", "role", "isActive");

-- CreateIndex
CREATE INDEX "role_profiles_role_isActive_idx" ON "role_profiles"("role", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "role_profiles_userId_role_key" ON "role_profiles"("userId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "institutions_code_key" ON "institutions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "student_id_configs_institutionId_key" ON "student_id_configs"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "faculties_institutionId_code_key" ON "faculties"("institutionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "departments_facultyId_code_key" ON "departments"("facultyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "programs_departmentId_code_key" ON "programs"("departmentId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "program_prefixes_programType_key" ON "program_prefixes"("programType");

-- CreateIndex
CREATE UNIQUE INDEX "courses_code_key" ON "courses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "program_courses_programId_courseId_level_semester_key" ON "program_courses"("programId", "courseId", "level", "semester");

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_yearCode_key" ON "academic_years"("yearCode");

-- CreateIndex
CREATE UNIQUE INDEX "semesters_academicYearId_semesterNumber_key" ON "semesters"("academicYearId", "semesterNumber");

-- CreateIndex
CREATE UNIQUE INDEX "academic_periods_semesterId_key" ON "academic_periods"("semesterId");

-- CreateIndex
CREATE INDEX "course_offerings_semesterId_status_idx" ON "course_offerings"("semesterId", "status");

-- CreateIndex
CREATE INDEX "course_offerings_courseId_status_idx" ON "course_offerings"("courseId", "status");

-- CreateIndex
CREATE INDEX "course_offerings_primaryLecturerId_idx" ON "course_offerings"("primaryLecturerId");

-- CreateIndex
CREATE UNIQUE INDEX "course_offerings_courseId_semesterId_key" ON "course_offerings"("courseId", "semesterId");

-- CreateIndex
CREATE UNIQUE INDEX "course_lecturers_courseOfferingId_lecturerId_key" ON "course_lecturers"("courseOfferingId", "lecturerId");

-- CreateIndex
CREATE UNIQUE INDEX "lecturer_departments_lecturerId_departmentId_key" ON "lecturer_departments"("lecturerId", "departmentId");

-- CreateIndex
CREATE INDEX "course_enrollments_studentId_semesterId_idx" ON "course_enrollments"("studentId", "semesterId");

-- CreateIndex
CREATE INDEX "course_enrollments_semesterId_status_idx" ON "course_enrollments"("semesterId", "status");

-- CreateIndex
CREATE INDEX "course_enrollments_courseOfferingId_status_idx" ON "course_enrollments"("courseOfferingId", "status");

-- CreateIndex
CREATE INDEX "course_enrollments_studentId_status_idx" ON "course_enrollments"("studentId", "status");

-- CreateIndex
CREATE INDEX "course_enrollments_advisorId_status_idx" ON "course_enrollments"("advisorId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "course_enrollments_studentId_courseOfferingId_key" ON "course_enrollments"("studentId", "courseOfferingId");

-- CreateIndex
CREATE INDEX "course_registrations_studentId_status_idx" ON "course_registrations"("studentId", "status");

-- CreateIndex
CREATE INDEX "course_registrations_semesterId_status_idx" ON "course_registrations"("semesterId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "course_registrations_studentId_semesterId_key" ON "course_registrations"("studentId", "semesterId");

-- CreateIndex
CREATE INDEX "course_registration_items_registrationId_idx" ON "course_registration_items"("registrationId");

-- CreateIndex
CREATE INDEX "course_registration_items_courseOfferingId_idx" ON "course_registration_items"("courseOfferingId");

-- CreateIndex
CREATE UNIQUE INDEX "course_registration_items_registrationId_courseOfferingId_key" ON "course_registration_items"("registrationId", "courseOfferingId");

-- CreateIndex
CREATE INDEX "student_semester_records_studentId_idx" ON "student_semester_records"("studentId");

-- CreateIndex
CREATE INDEX "student_semester_records_semesterId_idx" ON "student_semester_records"("semesterId");

-- CreateIndex
CREATE UNIQUE INDEX "student_semester_records_studentId_semesterId_key" ON "student_semester_records"("studentId", "semesterId");

-- CreateIndex
CREATE UNIQUE INDEX "student_academic_history_studentId_key" ON "student_academic_history"("studentId");

-- CreateIndex
CREATE INDEX "student_academic_history_studentId_idx" ON "student_academic_history"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_types_name_key" ON "assessment_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "student_assessments_assessmentId_studentId_key" ON "student_assessments"("assessmentId", "studentId");

-- CreateIndex
CREATE INDEX "exams_examDate_status_idx" ON "exams"("examDate", "status");

-- CreateIndex
CREATE INDEX "exams_courseId_examDate_idx" ON "exams"("courseId", "examDate");

-- CreateIndex
CREATE INDEX "exams_facultyId_examDate_idx" ON "exams"("facultyId", "examDate");

-- CreateIndex
CREATE INDEX "exams_venueId_examDate_idx" ON "exams"("venueId", "examDate");

-- CreateIndex
CREATE INDEX "exams_status_examDate_idx" ON "exams"("status", "examDate");

-- CreateIndex
CREATE INDEX "exam_timetables_institutionId_academicYearId_semesterId_idx" ON "exam_timetables"("institutionId", "academicYearId", "semesterId");

-- CreateIndex
CREATE INDEX "exam_timetables_status_isPublished_idx" ON "exam_timetables"("status", "isPublished");

-- CreateIndex
CREATE INDEX "exam_timetable_entries_timetableId_examDate_idx" ON "exam_timetable_entries"("timetableId", "examDate");

-- CreateIndex
CREATE INDEX "exam_timetable_entries_courseId_idx" ON "exam_timetable_entries"("courseId");

-- CreateIndex
CREATE INDEX "exam_timetable_entries_venueId_examDate_startTime_idx" ON "exam_timetable_entries"("venueId", "examDate", "startTime");

-- CreateIndex
CREATE INDEX "exam_timetable_entries_status_hasConflicts_idx" ON "exam_timetable_entries"("status", "hasConflicts");

-- CreateIndex
CREATE INDEX "exam_timetable_programs_timetableEntryId_idx" ON "exam_timetable_programs"("timetableEntryId");

-- CreateIndex
CREATE INDEX "exam_timetable_programs_programId_idx" ON "exam_timetable_programs"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_timetable_programs_timetableEntryId_programId_key" ON "exam_timetable_programs"("timetableEntryId", "programId");

-- CreateIndex
CREATE INDEX "exam_timetable_rooms_timetableEntryId_idx" ON "exam_timetable_rooms"("timetableEntryId");

-- CreateIndex
CREATE INDEX "exam_timetable_rooms_roomId_idx" ON "exam_timetable_rooms"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_timetable_rooms_timetableEntryId_roomId_key" ON "exam_timetable_rooms"("timetableEntryId", "roomId");

-- CreateIndex
CREATE INDEX "exam_timetable_invigilators_timetableEntryId_idx" ON "exam_timetable_invigilators"("timetableEntryId");

-- CreateIndex
CREATE INDEX "exam_timetable_invigilators_invigilatorId_idx" ON "exam_timetable_invigilators"("invigilatorId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_timetable_invigilators_timetableEntryId_invigilatorId_key" ON "exam_timetable_invigilators"("timetableEntryId", "invigilatorId");

-- CreateIndex
CREATE INDEX "timetable_conflicts_timetableId_isResolved_idx" ON "timetable_conflicts"("timetableId", "isResolved");

-- CreateIndex
CREATE INDEX "timetable_conflicts_type_severity_idx" ON "timetable_conflicts"("type", "severity");

-- CreateIndex
CREATE INDEX "timetable_imports_timetableId_status_idx" ON "timetable_imports"("timetableId", "status");

-- CreateIndex
CREATE INDEX "timetable_imports_importedBy_importedAt_idx" ON "timetable_imports"("importedBy", "importedAt");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_venueId_name_key" ON "rooms"("venueId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "scripts_qrCode_key" ON "scripts"("qrCode");

-- CreateIndex
CREATE INDEX "scripts_examId_status_idx" ON "scripts"("examId", "status");

-- CreateIndex
CREATE INDEX "scripts_batchScriptId_idx" ON "scripts"("batchScriptId");

-- CreateIndex
CREATE INDEX "scripts_currentHolderId_idx" ON "scripts"("currentHolderId");

-- CreateIndex
CREATE INDEX "scripts_status_currentHolderId_idx" ON "scripts"("status", "currentHolderId");

-- CreateIndex
CREATE INDEX "scripts_examId_status_updatedAt_idx" ON "scripts"("examId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "scripts_studentId_examId_idx" ON "scripts"("studentId", "examId");

-- CreateIndex
CREATE INDEX "scripts_status_gradedAt_idx" ON "scripts"("status", "gradedAt");

-- CreateIndex
CREATE INDEX "script_movements_batchScriptId_idx" ON "script_movements"("batchScriptId");

-- CreateIndex
CREATE INDEX "script_movements_scriptId_timestamp_idx" ON "script_movements"("scriptId", "timestamp");

-- CreateIndex
CREATE INDEX "script_movements_type_timestamp_idx" ON "script_movements"("type", "timestamp");

-- CreateIndex
CREATE INDEX "script_movements_toUserId_timestamp_idx" ON "script_movements"("toUserId", "timestamp");

-- CreateIndex
CREATE INDEX "script_movements_fromUserId_timestamp_idx" ON "script_movements"("fromUserId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "exam_registrations_studentQRCode_key" ON "exam_registrations"("studentQRCode");

-- CreateIndex
CREATE INDEX "exam_registrations_examEntryId_scriptSubmitted_idx" ON "exam_registrations"("examEntryId", "scriptSubmitted");

-- CreateIndex
CREATE INDEX "exam_registrations_studentId_idx" ON "exam_registrations"("studentId");

-- CreateIndex
CREATE INDEX "idx_exam_registrations_batch_script_id" ON "exam_registrations"("batch_script_id");

-- CreateIndex
CREATE INDEX "exam_registrations_examEntryId_isPresent_idx" ON "exam_registrations"("examEntryId", "isPresent");

-- CreateIndex
CREATE INDEX "exam_registrations_studentId_scriptSubmitted_idx" ON "exam_registrations"("studentId", "scriptSubmitted");

-- CreateIndex
CREATE INDEX "exam_registrations_attendanceMarkedBy_attendanceMarkedAt_idx" ON "exam_registrations"("attendanceMarkedBy", "attendanceMarkedAt");

-- CreateIndex
CREATE UNIQUE INDEX "exam_registrations_studentId_examEntryId_key" ON "exam_registrations"("studentId", "examEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "batch_scripts_batchQRCode_key" ON "batch_scripts"("batchQRCode");

-- CreateIndex
CREATE INDEX "batch_scripts_courseId_status_idx" ON "batch_scripts"("courseId", "status");

-- CreateIndex
CREATE INDEX "batch_scripts_assignedLecturerId_idx" ON "batch_scripts"("assignedLecturerId");

-- CreateIndex
CREATE INDEX "batch_scripts_status_createdAt_idx" ON "batch_scripts"("status", "createdAt");

-- CreateIndex
CREATE INDEX "batch_scripts_examEntryId_status_idx" ON "batch_scripts"("examEntryId", "status");

-- CreateIndex
CREATE INDEX "batch_scripts_assignedLecturerId_status_idx" ON "batch_scripts"("assignedLecturerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "batch_scripts_examEntryId_courseId_key" ON "batch_scripts"("examEntryId", "courseId");

-- CreateIndex
CREATE INDEX "incidents_examId_status_idx" ON "incidents"("examId", "status");

-- CreateIndex
CREATE INDEX "incidents_status_severity_idx" ON "incidents"("status", "severity");

-- CreateIndex
CREATE INDEX "incidents_reportedById_createdAt_idx" ON "incidents"("reportedById", "createdAt");

-- CreateIndex
CREATE INDEX "incidents_assignedToId_status_idx" ON "incidents"("assignedToId", "status");

-- CreateIndex
CREATE INDEX "incidents_type_status_idx" ON "incidents"("type", "status");

-- CreateIndex
CREATE INDEX "exam_session_logs_examEntryId_performedAt_idx" ON "exam_session_logs"("examEntryId", "performedAt");

-- CreateIndex
CREATE INDEX "exam_session_logs_performedBy_performedAt_idx" ON "exam_session_logs"("performedBy", "performedAt");

-- CreateIndex
CREATE INDEX "exam_session_logs_venueId_performedAt_idx" ON "exam_session_logs"("venueId", "performedAt");

-- CreateIndex
CREATE INDEX "exam_session_logs_action_performedAt_idx" ON "exam_session_logs"("action", "performedAt");

-- CreateIndex
CREATE INDEX "exam_session_logs_studentId_examEntryId_idx" ON "exam_session_logs"("studentId", "examEntryId");

-- CreateIndex
CREATE INDEX "exam_session_logs_invigilatorId_examEntryId_idx" ON "exam_session_logs"("invigilatorId", "examEntryId");

-- CreateIndex
CREATE INDEX "invigilator_assignments_examEntryId_status_idx" ON "invigilator_assignments"("examEntryId", "status");

-- CreateIndex
CREATE INDEX "invigilator_assignments_invigilatorId_assignedAt_idx" ON "invigilator_assignments"("invigilatorId", "assignedAt");

-- CreateIndex
CREATE INDEX "invigilator_assignments_venueId_assignedAt_idx" ON "invigilator_assignments"("venueId", "assignedAt");

-- CreateIndex
CREATE INDEX "invigilator_assignments_status_assignedAt_idx" ON "invigilator_assignments"("status", "assignedAt");

-- CreateIndex
CREATE INDEX "invigilator_assignments_invigilatorId_status_idx" ON "invigilator_assignments"("invigilatorId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "invigilator_assignments_examEntryId_invigilatorId_key" ON "invigilator_assignments"("examEntryId", "invigilatorId");

-- CreateIndex
CREATE INDEX "student_verifications_examEntryId_verifiedAt_idx" ON "student_verifications"("examEntryId", "verifiedAt");

-- CreateIndex
CREATE INDEX "student_verifications_studentId_examEntryId_idx" ON "student_verifications"("studentId", "examEntryId");

-- CreateIndex
CREATE INDEX "student_verifications_verifiedBy_verifiedAt_idx" ON "student_verifications"("verifiedBy", "verifiedAt");

-- CreateIndex
CREATE INDEX "student_verifications_status_method_idx" ON "student_verifications"("status", "method");

-- CreateIndex
CREATE INDEX "student_verifications_examEntryId_status_idx" ON "student_verifications"("examEntryId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "student_verifications_examEntryId_studentId_key" ON "student_verifications"("examEntryId", "studentId");

-- CreateIndex
CREATE INDEX "exam_incidents_examEntryId_status_idx" ON "exam_incidents"("examEntryId", "status");

-- CreateIndex
CREATE INDEX "exam_incidents_reportedBy_reportedAt_idx" ON "exam_incidents"("reportedBy", "reportedAt");

-- CreateIndex
CREATE INDEX "exam_incidents_assignedTo_status_idx" ON "exam_incidents"("assignedTo", "status");

-- CreateIndex
CREATE INDEX "exam_incidents_type_severity_status_idx" ON "exam_incidents"("type", "severity", "status");

-- CreateIndex
CREATE INDEX "exam_incidents_status_reportedAt_idx" ON "exam_incidents"("status", "reportedAt");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_profiles" ADD CONSTRAINT "role_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_id_configs" ADD CONSTRAINT "student_id_configs_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_deanId_fkey" FOREIGN KEY ("deanId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_hodId_fkey" FOREIGN KEY ("hodId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_courses" ADD CONSTRAINT "program_courses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_courses" ADD CONSTRAINT "program_courses_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_years" ADD CONSTRAINT "academic_years_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semesters" ADD CONSTRAINT "semesters_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_periods" ADD CONSTRAINT "academic_periods_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_periods" ADD CONSTRAINT "academic_periods_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_calendar_imports" ADD CONSTRAINT "academic_calendar_imports_importedBy_fkey" FOREIGN KEY ("importedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_calendar_imports" ADD CONSTRAINT "academic_calendar_imports_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_offerings" ADD CONSTRAINT "course_offerings_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_offerings" ADD CONSTRAINT "course_offerings_primaryLecturerId_fkey" FOREIGN KEY ("primaryLecturerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_offerings" ADD CONSTRAINT "course_offerings_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_lecturers" ADD CONSTRAINT "course_lecturers_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES "course_offerings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_lecturers" ADD CONSTRAINT "course_lecturers_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturer_departments" ADD CONSTRAINT "lecturer_departments_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturer_departments" ADD CONSTRAINT "lecturer_departments_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES "course_offerings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_registrations" ADD CONSTRAINT "course_registrations_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_registrations" ADD CONSTRAINT "course_registrations_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_registrations" ADD CONSTRAINT "course_registrations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_registrations" ADD CONSTRAINT "course_registrations_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_registration_items" ADD CONSTRAINT "course_registration_items_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "course_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_registration_items" ADD CONSTRAINT "course_registration_items_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES "course_offerings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_semester_records" ADD CONSTRAINT "student_semester_records_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_semester_records" ADD CONSTRAINT "student_semester_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_academic_history" ADD CONSTRAINT "student_academic_history_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_assessmentTypeId_fkey" FOREIGN KEY ("assessmentTypeId") REFERENCES "assessment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES "course_offerings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_assessments" ADD CONSTRAINT "student_assessments_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_assessments" ADD CONSTRAINT "student_assessments_gradedById_fkey" FOREIGN KEY ("gradedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_assessments" ADD CONSTRAINT "student_assessments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_sessions" ADD CONSTRAINT "exam_sessions_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_timetables" ADD CONSTRAINT "exam_timetables_academicPeriodId_fkey" FOREIGN KEY ("academicPeriodId") REFERENCES "academic_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_timetables" ADD CONSTRAINT "exam_timetables_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_timetables" ADD CONSTRAINT "exam_timetables_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_timetables" ADD CONSTRAINT "exam_timetables_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_timetables" ADD CONSTRAINT "exam_timetables_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_timetables" ADD CONSTRAINT "exam_timetables_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_timetables" ADD CONSTRAINT "exam_timetables_publishedBy_fkey" FOREIGN KEY ("publishedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_timetables" ADD CONSTRAINT "exam_timetables_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_timetable_entries" ADD CONSTRAINT "exam_timetable_entries_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_timetable_entries" ADD CONSTRAINT "exam_timetable_entries_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_timetable_entries" ADD CONSTRAINT "exam_timetable_entries_timetableId_fkey" FOREIGN KEY ("timetableId") REFERENCES "exam_timetables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_timetable_entries" ADD CONSTRAINT "exam_timetable_entries_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_timetable_programs" ADD CONSTRAINT "exam_timetable_programs_timetableEntryId_fkey" FOREIGN KEY ("timetableEntryId") REFERENCES "exam_timetable_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_timetable_programs" ADD CONSTRAINT "exam_timetable_programs_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_timetable_rooms" ADD CONSTRAINT "exam_timetable_rooms_timetableEntryId_fkey" FOREIGN KEY ("timetableEntryId") REFERENCES "exam_timetable_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_timetable_rooms" ADD CONSTRAINT "exam_timetable_rooms_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_timetable_invigilators" ADD CONSTRAINT "exam_timetable_invigilators_timetableEntryId_fkey" FOREIGN KEY ("timetableEntryId") REFERENCES "exam_timetable_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_timetable_invigilators" ADD CONSTRAINT "exam_timetable_invigilators_invigilatorId_fkey" FOREIGN KEY ("invigilatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_conflicts" ADD CONSTRAINT "timetable_conflicts_entry1Id_fkey" FOREIGN KEY ("entry1Id") REFERENCES "exam_timetable_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_conflicts" ADD CONSTRAINT "timetable_conflicts_entry2Id_fkey" FOREIGN KEY ("entry2Id") REFERENCES "exam_timetable_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_conflicts" ADD CONSTRAINT "timetable_conflicts_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_conflicts" ADD CONSTRAINT "timetable_conflicts_timetableId_fkey" FOREIGN KEY ("timetableId") REFERENCES "exam_timetables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_imports" ADD CONSTRAINT "timetable_imports_importedBy_fkey" FOREIGN KEY ("importedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_imports" ADD CONSTRAINT "timetable_imports_timetableId_fkey" FOREIGN KEY ("timetableId") REFERENCES "exam_timetables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venues" ADD CONSTRAINT "venues_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scripts" ADD CONSTRAINT "scripts_batchScriptId_fkey" FOREIGN KEY ("batchScriptId") REFERENCES "batch_scripts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scripts" ADD CONSTRAINT "scripts_currentHolderId_fkey" FOREIGN KEY ("currentHolderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scripts" ADD CONSTRAINT "scripts_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scripts" ADD CONSTRAINT "scripts_gradedById_fkey" FOREIGN KEY ("gradedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "script_movements" ADD CONSTRAINT "script_movements_batchScriptId_fkey" FOREIGN KEY ("batchScriptId") REFERENCES "batch_scripts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "script_movements" ADD CONSTRAINT "script_movements_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "scripts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "script_movements" ADD CONSTRAINT "script_movements_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_registrations" ADD CONSTRAINT "exam_registrations_attendanceMarkedBy_fkey" FOREIGN KEY ("attendanceMarkedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_registrations" ADD CONSTRAINT "exam_registrations_examEntryId_fkey" FOREIGN KEY ("examEntryId") REFERENCES "exam_timetable_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_registrations" ADD CONSTRAINT "exam_registrations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_registrations" ADD CONSTRAINT "fk_exam_registrations_batch_script" FOREIGN KEY ("batch_script_id") REFERENCES "batch_scripts"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "exam_registrations" ADD CONSTRAINT "fk_exam_registrations_script" FOREIGN KEY ("script_id") REFERENCES "scripts"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "exam_registrations" ADD CONSTRAINT "fk_exam_registrations_submitted_to" FOREIGN KEY ("submitted_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "batch_scripts" ADD CONSTRAINT "batch_scripts_assignedLecturerId_fkey" FOREIGN KEY ("assignedLecturerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_scripts" ADD CONSTRAINT "batch_scripts_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_scripts" ADD CONSTRAINT "batch_scripts_examEntryId_fkey" FOREIGN KEY ("examEntryId") REFERENCES "exam_timetable_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_scripts" ADD CONSTRAINT "batch_scripts_sealedBy_fkey" FOREIGN KEY ("sealedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "scripts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_session_logs" ADD CONSTRAINT "exam_session_logs_examEntryId_fkey" FOREIGN KEY ("examEntryId") REFERENCES "exam_timetable_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_session_logs" ADD CONSTRAINT "exam_session_logs_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_session_logs" ADD CONSTRAINT "exam_session_logs_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_session_logs" ADD CONSTRAINT "exam_session_logs_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_session_logs" ADD CONSTRAINT "exam_session_logs_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_session_logs" ADD CONSTRAINT "exam_session_logs_invigilatorId_fkey" FOREIGN KEY ("invigilatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invigilator_assignments" ADD CONSTRAINT "invigilator_assignments_examEntryId_fkey" FOREIGN KEY ("examEntryId") REFERENCES "exam_timetable_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invigilator_assignments" ADD CONSTRAINT "invigilator_assignments_invigilatorId_fkey" FOREIGN KEY ("invigilatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invigilator_assignments" ADD CONSTRAINT "invigilator_assignments_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invigilator_assignments" ADD CONSTRAINT "invigilator_assignments_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invigilator_assignments" ADD CONSTRAINT "invigilator_assignments_reassignedFrom_fkey" FOREIGN KEY ("reassignedFrom") REFERENCES "invigilator_assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_verifications" ADD CONSTRAINT "student_verifications_examEntryId_fkey" FOREIGN KEY ("examEntryId") REFERENCES "exam_timetable_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_verifications" ADD CONSTRAINT "student_verifications_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_verifications" ADD CONSTRAINT "student_verifications_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_incidents" ADD CONSTRAINT "exam_incidents_examEntryId_fkey" FOREIGN KEY ("examEntryId") REFERENCES "exam_timetable_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_incidents" ADD CONSTRAINT "exam_incidents_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_incidents" ADD CONSTRAINT "exam_incidents_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_incidents" ADD CONSTRAINT "exam_incidents_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
