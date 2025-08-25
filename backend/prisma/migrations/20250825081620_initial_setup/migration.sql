-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'SYSTEM_ADMIN', 'INSTITUTIONAL_ADMIN', 'FACULTY_ADMIN', 'DEPARTMENT_HEAD', 'PROGRAM_COORDINATOR', 'ACADEMIC_OFFICER', 'EXAM_COORDINATOR', 'CHIEF_INVIGILATOR', 'INVIGILATOR', 'SCRIPT_HANDLER', 'SECURITY_OFFICER', 'IT_SUPPORT', 'LECTURER', 'TEACHING_ASSISTANT', 'STUDENT', 'GUEST');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "ProfileVisibility" AS ENUM ('PUBLIC', 'INSTITUTIONAL', 'FACULTY', 'DEPARTMENT', 'PRIVATE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'EXAM', 'INCIDENT', 'SCRIPT', 'ANNOUNCEMENT', 'PERSONAL', 'EXAM_REMINDER', 'SCRIPT_UPDATE', 'INCIDENT_ASSIGNED', 'INCIDENT_RESOLVED', 'SYSTEM_ALERT', 'SECURITY_ALERT', 'BROADCAST');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "StaffType" AS ENUM ('ADMINISTRATIVE', 'TECHNICAL', 'SECURITY', 'MAINTENANCE', 'SUPPORT', 'MANAGEMENT');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('PERMANENT', 'TEMPORARY', 'CONTRACT', 'PART_TIME', 'INTERNSHIP');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DISMISSED', 'GRADUATED', 'TRANSFERRED_OUT', 'TRANSFERRED_IN', 'WITHDRAWN', 'DEFERRED', 'ON_LEAVE', 'DECEASED');

-- CreateEnum
CREATE TYPE "EntryMode" AS ENUM ('REGULAR', 'MATURE', 'TRANSFER', 'DIPLOMA_TOP_UP', 'INTERNATIONAL', 'SPECIAL_ADMISSION', 'SANDWICH');

-- CreateEnum
CREATE TYPE "StudentFinancialStatus" AS ENUM ('CLEARED', 'PENDING', 'BLOCKED', 'PARTIAL', 'SCHOLARSHIP', 'DEFERRED_PAYMENT');

-- CreateEnum
CREATE TYPE "StudentType" AS ENUM ('REGULAR', 'CONTINUING', 'PART_TIME', 'DISTANCE', 'SANDWICH', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "Nationality" AS ENUM ('GHANAIAN', 'ECOWAS', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "FeeCategoryType" AS ENUM ('TUITION', 'ACADEMIC_FACILITY', 'LIBRARY', 'EXAMINATION', 'LABORATORY', 'HOSTEL', 'REGISTRATION', 'TECHNOLOGY', 'DEVELOPMENT', 'SRC', 'MEDICAL', 'SPORTS', 'GRADUATION', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CREDIT_CARD', 'CHEQUE', 'BANK_DRAFT', 'ONLINE');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('FULL_PAYMENT', 'INSTALLMENT', 'PARTIAL', 'REFUND', 'SCHOLARSHIP', 'WAIVER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'REVERSED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "AcademicRank" AS ENUM ('GRADUATE_ASSISTANT', 'TEACHING_ASSISTANT', 'LECTURER', 'ASSISTANT_LECTURER', 'SENIOR_LECTURER', 'ASSOCIATE_PROFESSOR', 'PROFESSOR', 'EMERITUS_PROFESSOR', 'VISITING_LECTURER', 'ADJUNCT_PROFESSOR');

-- CreateEnum
CREATE TYPE "LecturerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'SABBATICAL', 'RETIRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "PublicationType" AS ENUM ('JOURNAL_ARTICLE', 'CONFERENCE_PAPER', 'BOOK', 'BOOK_CHAPTER', 'THESIS', 'TECHNICAL_REPORT', 'WORKING_PAPER');

-- CreateEnum
CREATE TYPE "CommitteeType" AS ENUM ('ACADEMIC', 'RESEARCH', 'DISCIPLINARY', 'ADMINISTRATIVE', 'EXAMINATION', 'ADMISSIONS');

-- CreateEnum
CREATE TYPE "CommitteeRole" AS ENUM ('CHAIRMAN', 'VICE_CHAIRMAN', 'SECRETARY', 'MEMBER', 'OBSERVER');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('WEB', 'MOBILE_IOS', 'MOBILE_ANDROID', 'DESKTOP');

-- CreateEnum
CREATE TYPE "CertificationLevel" AS ENUM ('CERTIFICATE', 'DIPLOMA', 'BACHELOR', 'MASTER', 'PHD');

-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('UNIVERSITY', 'COLLEGE', 'INSTITUTE', 'SCHOOL', 'ACADEMY', 'POLYTECHNIC', 'TECHNICAL_UNIVERSITY');

-- CreateEnum
CREATE TYPE "InstitutionCategory" AS ENUM ('PUBLIC', 'PRIVATE', 'QUASI_GOVERNMENT', 'RELIGIOUS', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "HostelGender" AS ENUM ('MALE', 'FEMALE', 'MIXED');

-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD', 'SHARED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TuitionMode" AS ENUM ('FULL_TIME', 'PART_TIME', 'SANDWICH', 'EVENING', 'WEEKEND', 'DISTANCE');

-- CreateEnum
CREATE TYPE "DeliveryMode" AS ENUM ('FACE_TO_FACE', 'ONLINE', 'HYBRID', 'DISTANCE');

-- CreateEnum
CREATE TYPE "CourseLevel" AS ENUM ('FOUNDATION', 'INTRODUCTORY', 'INTERMEDIATE', 'ADVANCED', 'SENIOR', 'GRADUATE');

-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('CORE', 'ELECTIVE', 'PRACTICAL', 'SEMINAR', 'THESIS', 'PROJECT', 'INTERNSHIP');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('QUIZ', 'ASSIGNMENT', 'MIDTERM', 'FINAL_EXAM', 'PROJECT', 'PRESENTATION', 'PRACTICAL', 'THESIS', 'PARTICIPATION');

-- CreateEnum
CREATE TYPE "TranscriptStatus" AS ENUM ('DRAFT', 'GENERATED', 'VERIFIED', 'ISSUED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ProgramLevel" AS ENUM ('CERTIFICATE', 'DIPLOMA', 'UNDERGRADUATE', 'POSTGRADUATE', 'DOCTORAL');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ENROLLED', 'COMPLETED', 'WITHDRAWN', 'FAILED');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('MIDTERM', 'FINAL', 'SUPPLEMENTARY', 'SPECIAL', 'RESIT', 'MAKEUP');

-- CreateEnum
CREATE TYPE "SemesterType" AS ENUM ('FIRST', 'SECOND', 'THIRD', 'SUMMER');

-- CreateEnum
CREATE TYPE "ExamPeriodStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- CreateEnum
CREATE TYPE "InvigilatorRole" AS ENUM ('CHIEF', 'ASSISTANT', 'RELIEF');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('REGISTERED', 'PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateEnum
CREATE TYPE "RequirementType" AS ENUM ('EXTRA_TIME', 'SEPARATE_ROOM', 'SCRIBE', 'LARGE_PRINT', 'COMPUTER_ACCESS', 'MEDICAL_ACCOMMODATION', 'RELIGIOUS_ACCOMMODATION');

-- CreateEnum
CREATE TYPE "ScriptStatus" AS ENUM ('GENERATED', 'DISTRIBUTED', 'COLLECTED', 'VERIFIED', 'SCANNED', 'DISPATCHED', 'RECEIVED', 'GRADED', 'RETURNED');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('CREATED', 'PROCESSING', 'COMPLETED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('ACADEMIC_MISCONDUCT', 'TECHNICAL_ISSUE', 'MEDICAL_EMERGENCY', 'SECURITY_BREACH', 'DISRUPTION', 'MISSING_MATERIALS', 'LATE_ARRIVAL', 'IDENTITY_VERIFICATION', 'SCRIPT_IRREGULARITY', 'EQUIPMENT_FAILURE');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('PHOTO', 'VIDEO', 'DOCUMENT', 'AUDIO', 'SCREENSHOT');

-- CreateEnum
CREATE TYPE "FollowUpActionType" AS ENUM ('INVESTIGATION', 'DISCIPLINARY_ACTION', 'REPORT_GENERATION', 'NOTIFICATION', 'MEETING', 'DOCUMENTATION');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('USER', 'STUDENT', 'LECTURER', 'COURSE', 'EXAM_SESSION', 'SCRIPT', 'INCIDENT', 'BATCH', 'VENUE', 'ROOM');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REQUIRES_REVIEW');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'ROLE_CHANGE', 'PERMISSION_GRANT', 'PERMISSION_REVOKE', 'DATA_EXPORT', 'DATA_IMPORT', 'SYSTEM_ACCESS');

-- CreateEnum
CREATE TYPE "ConfigCategory" AS ENUM ('SECURITY', 'AUTHENTICATION', 'EXAMINATION', 'NOTIFICATION', 'STORAGE', 'INTEGRATION', 'UI_CUSTOMIZATION');

-- CreateEnum
CREATE TYPE "Environment" AS ENUM ('DEVELOPMENT', 'STAGING', 'PRODUCTION');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" TIMESTAMP(3),
    "lastLoginIP" TEXT,
    "lastLoginDevice" TEXT,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "backupCodes" TEXT[],
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "emailVerificationToken" TEXT,
    "emailVerificationExpires" TIMESTAMP(3),
    "twoFactorTempSecret" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionTimeout" INTEGER NOT NULL DEFAULT 1800,
    "forcePasswordChange" BOOLEAN NOT NULL DEFAULT false,
    "passwordChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agreedToTermsAt" TIMESTAMP(3),
    "privacyPolicyAcceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "title" TEXT,
    "phoneNumber" TEXT,
    "emergencyContact" JSONB,
    "address" JSONB,
    "avatar" TEXT,
    "bio" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "nationality" TEXT,
    "identificationType" TEXT,
    "identificationNumber" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "socialLinks" JSONB,
    "skills" TEXT[],
    "interests" TEXT[],
    "currentPosition" TEXT,
    "department" TEXT,
    "officeLocation" TEXT,
    "officeHours" JSONB,
    "profileVisibility" "ProfileVisibility" NOT NULL DEFAULT 'INSTITUTIONAL',
    "allowDirectMessages" BOOLEAN NOT NULL DEFAULT true,
    "allowNotifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "deviceInfo" JSONB NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "location" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "deviceInfo" JSONB NOT NULL,
    "location" JSONB,
    "failureReason" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "users" "UserRole"[],

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "userId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "grantedBy" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("userId","permissionId")
);

-- CreateTable
CREATE TABLE "user_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "category" TEXT NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "staffType" "StaffType" NOT NULL,
    "departmentId" TEXT,
    "supervisorId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "contractType" "ContractType" NOT NULL,
    "workSchedule" JSONB NOT NULL,
    "securityClearance" TEXT,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "indexNumber" TEXT NOT NULL,
    "admissionNumber" TEXT,
    "programId" TEXT NOT NULL,
    "yearOfStudy" INTEGER NOT NULL,
    "currentLevel" TEXT,
    "semester" INTEGER,
    "certificationLevel" "CertificationLevel" NOT NULL,
    "entryMode" "EntryMode" NOT NULL DEFAULT 'REGULAR',
    "admissionDate" TIMESTAMP(3) NOT NULL,
    "expectedGraduation" TIMESTAMP(3),
    "graduationDate" TIMESTAMP(3),
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "gpa" DOUBLE PRECISION,
    "cgpa" DOUBLE PRECISION,
    "totalCredits" INTEGER NOT NULL DEFAULT 0,
    "completedCredits" INTEGER NOT NULL DEFAULT 0,
    "requiredCredits" INTEGER,
    "isPartTime" BOOLEAN NOT NULL DEFAULT false,
    "isInternational" BOOLEAN NOT NULL DEFAULT false,
    "isSpecialNeeds" BOOLEAN NOT NULL DEFAULT false,
    "scholarshipInfo" JSONB,
    "financialStatus" "StudentFinancialStatus" NOT NULL DEFAULT 'CLEARED',
    "outstandingFees" DECIMAL(10,2) DEFAULT 0,
    "emergencyContact" JSONB NOT NULL,
    "medicalInfo" JSONB,
    "accommodationNeeds" JSONB,
    "religion" TEXT,
    "tribe" TEXT,
    "hometown" TEXT,
    "academicProbation" BOOLEAN NOT NULL DEFAULT false,
    "probationReason" TEXT,
    "probationDate" TIMESTAMP(3),
    "probationEndDate" TIMESTAMP(3),
    "thesisTitle" TEXT,
    "advisorId" TEXT,
    "hasCompleted" JSONB,
    "ssnit" TEXT,
    "ghanaCard" TEXT,
    "votersId" TEXT,
    "passport" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_structures" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "semester" INTEGER,
    "studentType" "StudentType" NOT NULL,
    "nationality" "Nationality" NOT NULL DEFAULT 'GHANAIAN',
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GHS',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fee_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_categories" (
    "id" TEXT NOT NULL,
    "feeStructureId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "isCompulsory" BOOLEAN NOT NULL DEFAULT true,
    "paymentDeadline" TIMESTAMP(3),
    "category" "FeeCategoryType" NOT NULL,

    CONSTRAINT "fee_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "feeStructureId" TEXT,
    "reference" TEXT NOT NULL,
    "transactionId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GHS',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "academicYear" TEXT NOT NULL,
    "semester" INTEGER,
    "description" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "confirmedBy" TEXT,
    "reverseReason" TEXT,
    "reversedAt" TIMESTAMP(3),
    "receiptNumber" TEXT,
    "bankSlipUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecturers" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "staffNumber" TEXT,
    "departmentId" TEXT NOT NULL,
    "rank" "AcademicRank" NOT NULL,
    "qualification" TEXT[],
    "specialization" TEXT[],
    "researchInterests" TEXT[],
    "officeLocation" TEXT,
    "officeHours" JSONB,
    "bio" TEXT,
    "cvUrl" TEXT,
    "researchGate" TEXT,
    "orcidId" TEXT,
    "googleScholar" TEXT,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "tenureDate" TIMESTAMP(3),
    "retirementDate" TIMESTAMP(3),
    "status" "LecturerStatus" NOT NULL DEFAULT 'ACTIVE',
    "isPartTime" BOOLEAN NOT NULL DEFAULT false,
    "maxTeachingLoad" INTEGER NOT NULL DEFAULT 12,
    "currentLoad" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lecturers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "PublicationType" NOT NULL,
    "journal" TEXT,
    "conference" TEXT,
    "year" INTEGER NOT NULL,
    "doi" TEXT,
    "url" TEXT,
    "abstract" TEXT,
    "keywords" TEXT[],
    "citationCount" INTEGER NOT NULL DEFAULT 0,
    "isOpenAccess" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lecturerId" TEXT,

    CONSTRAINT "publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_authors" (
    "publicationId" TEXT NOT NULL,
    "lecturerId" TEXT NOT NULL,
    "authorOrder" INTEGER NOT NULL,
    "isCorresponding" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "publication_authors_pkey" PRIMARY KEY ("publicationId","lecturerId")
);

-- CreateTable
CREATE TABLE "committees" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "CommitteeType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "committees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "committee_members" (
    "committeeId" TEXT NOT NULL,
    "lecturerId" TEXT NOT NULL,
    "role" "CommitteeRole" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "committee_members_pkey" PRIMARY KEY ("committeeId","lecturerId")
);

-- CreateTable
CREATE TABLE "invigilators" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "certificationDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invigilators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "code" TEXT NOT NULL,
    "type" "InstitutionType" NOT NULL,
    "category" "InstitutionCategory" NOT NULL DEFAULT 'PUBLIC',
    "address" JSONB NOT NULL,
    "contactInfo" JSONB NOT NULL,
    "logo" TEXT,
    "motto" TEXT,
    "description" TEXT,
    "establishedYear" INTEGER,
    "charter" JSONB,
    "accreditation" JSONB,
    "affiliations" TEXT[],
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Accra',
    "language" TEXT NOT NULL DEFAULT 'en',
    "currencies" TEXT[] DEFAULT ARRAY['GHS']::TEXT[],
    "academicCalendar" JSONB NOT NULL,
    "customFields" JSONB,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institution_settings" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "allowSelfRegistration" BOOLEAN NOT NULL DEFAULT false,
    "requireEmailVerification" BOOLEAN NOT NULL DEFAULT true,
    "passwordPolicy" JSONB NOT NULL,
    "sessionTimeout" INTEGER NOT NULL DEFAULT 1800,
    "maxConcurrentSessions" INTEGER NOT NULL DEFAULT 3,
    "enableMFA" BOOLEAN NOT NULL DEFAULT false,
    "allowedEmailDomains" TEXT[],
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "customBranding" JSONB,
    "ghanaSpecific" JSONB,
    "customFields" JSONB,
    "gradingSystem" JSONB NOT NULL,
    "feesStructure" JSONB,

    CONSTRAINT "institution_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "institutionId" TEXT NOT NULL,
    "campusId" TEXT,
    "deanId" TEXT,
    "establishedYear" INTEGER,
    "contactInfo" JSONB,
    "vision" TEXT,
    "mission" TEXT,
    "objectives" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campuses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "address" JSONB NOT NULL,
    "coordinates" JSONB,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "facilities" JSONB,
    "capacity" INTEGER,
    "established" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "gender" "HostelGender" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "occupied" INTEGER NOT NULL DEFAULT 0,
    "facilities" JSONB NOT NULL,
    "fees" JSONB NOT NULL,
    "rules" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hostels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_rooms" (
    "id" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "hostelId" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "occupied" INTEGER NOT NULL DEFAULT 0,
    "type" "RoomType" NOT NULL,
    "facilities" JSONB NOT NULL,
    "condition" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "hostel_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_bookings" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "hostelId" TEXT NOT NULL,
    "roomId" TEXT,
    "academicYear" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "checkinDate" TIMESTAMP(3),
    "checkoutDate" TIMESTAMP(3),
    "fees" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hostel_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_years" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semesters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "semesterNumber" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "registrationStart" TIMESTAMP(3) NOT NULL,
    "registrationEnd" TIMESTAMP(3) NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "semesters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "institutionId" TEXT NOT NULL,
    "campusId" TEXT,
    "schoolId" TEXT,
    "deanId" TEXT,
    "establishedYear" INTEGER,
    "contactInfo" JSONB,
    "vision" TEXT,
    "mission" TEXT,
    "objectives" TEXT[],
    "researchAreas" TEXT[],
    "partnerships" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "facultyId" TEXT,
    "schoolId" TEXT,
    "headId" TEXT,
    "establishedYear" INTEGER,
    "contactInfo" JSONB,
    "researchAreas" TEXT[],
    "laboratories" TEXT[],
    "equipment" JSONB,
    "partnerships" JSONB,
    "accreditation" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "code" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "level" "ProgramLevel" NOT NULL,
    "duration" INTEGER NOT NULL,
    "credits" INTEGER,
    "requirements" JSONB NOT NULL,
    "objectives" TEXT[],
    "careerProspects" TEXT[],
    "entryRequirements" JSONB NOT NULL,
    "accreditation" JSONB,
    "affiliations" TEXT[],
    "tuitionMode" "TuitionMode" NOT NULL DEFAULT 'FULL_TIME',
    "deliveryMode" "DeliveryMode" NOT NULL DEFAULT 'FACE_TO_FACE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hasThesis" BOOLEAN NOT NULL DEFAULT false,
    "hasInternship" BOOLEAN NOT NULL DEFAULT false,
    "minGPA" DOUBLE PRECISION,
    "maxDuration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "creditHours" INTEGER NOT NULL,
    "contactHours" INTEGER,
    "lecturerId" TEXT NOT NULL,
    "description" TEXT,
    "objectives" TEXT[],
    "prerequisiteCodes" TEXT[],
    "corequisites" TEXT[],
    "level" "CourseLevel" NOT NULL,
    "type" "CourseType" NOT NULL,
    "semester" INTEGER,
    "maxStudents" INTEGER,
    "minStudents" INTEGER,
    "syllabus" TEXT,
    "textbooks" JSONB,
    "assessmentStructure" JSONB,
    "language" TEXT NOT NULL DEFAULT 'en',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isElective" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grades" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "assessmentType" "AssessmentType" NOT NULL,
    "assessmentName" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "letterGrade" TEXT,
    "gradePoints" DOUBLE PRECISION,
    "submittedAt" TIMESTAMP(3),
    "gradedAt" TIMESTAMP(3),
    "gradedBy" TEXT NOT NULL,
    "comments" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcripts" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "gpa" DOUBLE PRECISION,
    "cgpa" DOUBLE PRECISION,
    "totalCredits" INTEGER NOT NULL,
    "status" "TranscriptStatus" NOT NULL DEFAULT 'DRAFT',
    "generatedAt" TIMESTAMP(3),
    "generatedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "requestedBy" TEXT,
    "requestedAt" TIMESTAMP(3),
    "purpose" TEXT,

    CONSTRAINT "transcripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_prerequisites" (
    "courseId" TEXT NOT NULL,
    "prerequisiteId" TEXT NOT NULL,

    CONSTRAINT "course_prerequisites_pkey" PRIMARY KEY ("courseId","prerequisiteId")
);

-- CreateTable
CREATE TABLE "program_courses" (
    "programId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "isCore" BOOLEAN NOT NULL DEFAULT true,
    "semester" INTEGER NOT NULL,

    CONSTRAINT "program_courses_pkey" PRIMARY KEY ("programId","courseId")
);

-- CreateTable
CREATE TABLE "student_courses" (
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ENROLLED',
    "grade" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_courses_pkey" PRIMARY KEY ("studentId","courseId")
);

-- CreateTable
CREATE TABLE "venues" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" JSONB NOT NULL,
    "facultyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "schoolId" TEXT,
    "campusId" TEXT,

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "venueId" TEXT NOT NULL,
    "features" JSONB NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_periods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "semesterId" TEXT,
    "code" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "registrationDeadline" TIMESTAMP(3) NOT NULL,
    "status" "ExamPeriodStatus" NOT NULL DEFAULT 'PLANNED',
    "examType" "ExamType" NOT NULL,
    "instructions" TEXT,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_sessions" (
    "id" TEXT NOT NULL,
    "examPeriodId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "venueId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "maxStudents" INTEGER NOT NULL,
    "actualStudents" INTEGER NOT NULL DEFAULT 0,
    "status" "ExamStatus" NOT NULL DEFAULT 'SCHEDULED',
    "examType" "ExamType" NOT NULL DEFAULT 'FINAL',
    "instructions" TEXT,
    "materials" TEXT[],
    "restrictions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_session_invigilators" (
    "examSessionId" TEXT NOT NULL,
    "invigilatorId" TEXT NOT NULL,
    "role" "InvigilatorRole" NOT NULL DEFAULT 'ASSISTANT',

    CONSTRAINT "exam_session_invigilators_pkey" PRIMARY KEY ("examSessionId","invigilatorId")
);

-- CreateTable
CREATE TABLE "exam_session_students" (
    "examSessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'REGISTERED',
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),

    CONSTRAINT "exam_session_students_pkey" PRIMARY KEY ("examSessionId","studentId")
);

-- CreateTable
CREATE TABLE "special_requirements" (
    "id" TEXT NOT NULL,
    "type" "RequirementType" NOT NULL,
    "description" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "examSessionId" TEXT,
    "accommodations" JSONB NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "special_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_slots" (
    "id" TEXT NOT NULL,
    "invigilatorId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "availability_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scripts" (
    "id" TEXT NOT NULL,
    "scriptNumber" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "examSessionId" TEXT NOT NULL,
    "status" "ScriptStatus" NOT NULL DEFAULT 'GENERATED',
    "currentLocation" TEXT,
    "currentHandlerId" TEXT,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movements" (
    "id" TEXT NOT NULL,
    "scriptId" TEXT NOT NULL,
    "fromLocation" TEXT,
    "toLocation" TEXT NOT NULL,
    "handlerId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "batchId" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verificationTimestamp" TIMESTAMP(3),

    CONSTRAINT "movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batches" (
    "id" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "examSessionId" TEXT NOT NULL,
    "handlerId" TEXT NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'CREATED',
    "qrCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_scripts" (
    "batchId" TEXT NOT NULL,
    "scriptId" TEXT NOT NULL,

    CONSTRAINT "batch_scripts_pkey" PRIMARY KEY ("batchId","scriptId")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "incidentNumber" TEXT NOT NULL,
    "type" "IncidentType" NOT NULL,
    "severity" "IncidentSeverity" NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "examSessionId" TEXT NOT NULL,
    "studentId" TEXT,
    "scriptId" TEXT,
    "reportedById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "type" "EvidenceType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "description" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_up_actions" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "type" "FollowUpActionType" NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" "ActionStatus" NOT NULL DEFAULT 'PENDING',
    "assignedTo" TEXT,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "follow_up_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_verifications" (
    "id" TEXT NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedById" TEXT,
    "verificationTimestamp" TIMESTAMP(3),
    "comments" TEXT,
    "autoApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "incidentId" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_configurations" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ConfigCategory" NOT NULL,
    "environment" "Environment" NOT NULL,
    "modifiedBy" TEXT NOT NULL,
    "modifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_sessionToken_key" ON "user_sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profileId_key" ON "staff"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "staff_employeeId_key" ON "staff"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "students_profileId_key" ON "students"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "students_studentId_key" ON "students"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "students_indexNumber_key" ON "students"("indexNumber");

-- CreateIndex
CREATE UNIQUE INDEX "students_admissionNumber_key" ON "students"("admissionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "fee_structures_programId_academicYear_semester_studentType__key" ON "fee_structures"("programId", "academicYear", "semester", "studentType", "nationality");

-- CreateIndex
CREATE UNIQUE INDEX "payments_reference_key" ON "payments"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "lecturers_profileId_key" ON "lecturers"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "lecturers_employeeId_key" ON "lecturers"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "lecturers_staffNumber_key" ON "lecturers"("staffNumber");

-- CreateIndex
CREATE UNIQUE INDEX "invigilators_profileId_key" ON "invigilators"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_token_key" ON "device_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "institutions_code_key" ON "institutions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "institution_settings_institutionId_key" ON "institution_settings"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "schools_institutionId_code_key" ON "schools"("institutionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "campuses_institutionId_code_key" ON "campuses"("institutionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "hostels_campusId_code_key" ON "hostels"("campusId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "hostel_rooms_hostelId_roomNumber_key" ON "hostel_rooms"("hostelId", "roomNumber");

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_institutionId_code_key" ON "academic_years"("institutionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "semesters_academicYearId_code_key" ON "semesters"("academicYearId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "faculties_institutionId_code_key" ON "faculties"("institutionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "departments_facultyId_code_key" ON "departments"("facultyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "departments_schoolId_code_key" ON "departments"("schoolId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "programs_departmentId_code_key" ON "programs"("departmentId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "courses_departmentId_code_key" ON "courses"("departmentId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "grades_studentId_courseId_assessmentType_assessmentName_key" ON "grades"("studentId", "courseId", "assessmentType", "assessmentName");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_venueId_name_key" ON "rooms"("venueId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "exam_periods_academicYearId_code_key" ON "exam_periods"("academicYearId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "scripts_scriptNumber_key" ON "scripts"("scriptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "scripts_qrCode_key" ON "scripts"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "batches_batchNumber_key" ON "batches"("batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "batches_qrCode_key" ON "batches"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "incidents_incidentNumber_key" ON "incidents"("incidentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "system_configurations_key_key" ON "system_configurations"("key");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "lecturers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_categories" ADD CONSTRAINT "fee_categories_feeStructureId_fkey" FOREIGN KEY ("feeStructureId") REFERENCES "fee_structures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_feeStructureId_fkey" FOREIGN KEY ("feeStructureId") REFERENCES "fee_structures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturers" ADD CONSTRAINT "lecturers_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturers" ADD CONSTRAINT "lecturers_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "lecturers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_authors" ADD CONSTRAINT "publication_authors_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "publications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_authors" ADD CONSTRAINT "publication_authors_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "lecturers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_members" ADD CONSTRAINT "committee_members_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "committees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_members" ADD CONSTRAINT "committee_members_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "lecturers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invigilators" ADD CONSTRAINT "invigilators_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_settings" ADD CONSTRAINT "institution_settings_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campuses" ADD CONSTRAINT "campuses_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostels" ADD CONSTRAINT "hostels_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_rooms" ADD CONSTRAINT "hostel_rooms_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "hostels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_bookings" ADD CONSTRAINT "hostel_bookings_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_bookings" ADD CONSTRAINT "hostel_bookings_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "hostels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_bookings" ADD CONSTRAINT "hostel_bookings_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "hostel_rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_years" ADD CONSTRAINT "academic_years_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semesters" ADD CONSTRAINT "semesters_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "lecturers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_prerequisites" ADD CONSTRAINT "course_prerequisites_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_prerequisites" ADD CONSTRAINT "course_prerequisites_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_courses" ADD CONSTRAINT "program_courses_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_courses" ADD CONSTRAINT "program_courses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_courses" ADD CONSTRAINT "student_courses_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_courses" ADD CONSTRAINT "student_courses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venues" ADD CONSTRAINT "venues_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venues" ADD CONSTRAINT "venues_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venues" ADD CONSTRAINT "venues_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_periods" ADD CONSTRAINT "exam_periods_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_periods" ADD CONSTRAINT "exam_periods_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_sessions" ADD CONSTRAINT "exam_sessions_examPeriodId_fkey" FOREIGN KEY ("examPeriodId") REFERENCES "exam_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_sessions" ADD CONSTRAINT "exam_sessions_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_sessions" ADD CONSTRAINT "exam_sessions_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_session_invigilators" ADD CONSTRAINT "exam_session_invigilators_examSessionId_fkey" FOREIGN KEY ("examSessionId") REFERENCES "exam_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_session_invigilators" ADD CONSTRAINT "exam_session_invigilators_invigilatorId_fkey" FOREIGN KEY ("invigilatorId") REFERENCES "invigilators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_session_students" ADD CONSTRAINT "exam_session_students_examSessionId_fkey" FOREIGN KEY ("examSessionId") REFERENCES "exam_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_session_students" ADD CONSTRAINT "exam_session_students_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "special_requirements" ADD CONSTRAINT "special_requirements_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "special_requirements" ADD CONSTRAINT "special_requirements_examSessionId_fkey" FOREIGN KEY ("examSessionId") REFERENCES "exam_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_invigilatorId_fkey" FOREIGN KEY ("invigilatorId") REFERENCES "invigilators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scripts" ADD CONSTRAINT "scripts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scripts" ADD CONSTRAINT "scripts_examSessionId_fkey" FOREIGN KEY ("examSessionId") REFERENCES "exam_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "scripts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_handlerId_fkey" FOREIGN KEY ("handlerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_examSessionId_fkey" FOREIGN KEY ("examSessionId") REFERENCES "exam_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_scripts" ADD CONSTRAINT "batch_scripts_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_scripts" ADD CONSTRAINT "batch_scripts_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "scripts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_examSessionId_fkey" FOREIGN KEY ("examSessionId") REFERENCES "exam_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "scripts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_up_actions" ADD CONSTRAINT "follow_up_actions_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_verifications" ADD CONSTRAINT "data_verifications_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
