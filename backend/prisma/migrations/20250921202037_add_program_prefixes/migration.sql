/*
  Warnings:

  - You are about to drop the column `credits` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `program` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to alter the column `level` on the `student_profiles` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `level` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `staffId` to the `lecturer_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN "address" TEXT;
ALTER TABLE "users" ADD COLUMN "dateOfBirth" DATETIME;
ALTER TABLE "users" ADD COLUMN "gender" TEXT;
ALTER TABLE "users" ADD COLUMN "middleName" TEXT;
ALTER TABLE "users" ADD COLUMN "nationality" TEXT;
ALTER TABLE "users" ADD COLUMN "phone" TEXT;
ALTER TABLE "users" ADD COLUMN "title" TEXT;

-- CreateTable
CREATE TABLE "programs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "durationYears" REAL NOT NULL,
    "creditHours" INTEGER,
    "description" TEXT,
    "admissionRequirements" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "departmentId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "programs_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "program_prefixes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "programType" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "program_courses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "programId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "program_courses_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "program_courses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "academic_years" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "yearCode" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "institutionId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "academic_years_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "semesters" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "academicYearId" INTEGER NOT NULL,
    "semesterNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "semesters_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "course_offerings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "courseId" INTEGER NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "primaryLecturerId" INTEGER,
    "maxEnrollment" INTEGER,
    "currentEnrollment" INTEGER NOT NULL DEFAULT 0,
    "classroom" TEXT,
    "schedule" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "course_offerings_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "course_offerings_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "course_offerings_primaryLecturerId_fkey" FOREIGN KEY ("primaryLecturerId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "course_lecturers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "courseOfferingId" INTEGER NOT NULL,
    "lecturerId" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'instructor',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "course_lecturers_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES "course_offerings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "course_lecturers_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lecturer_departments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lecturerId" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lecturer_departments_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "lecturer_departments_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "courseOfferingId" INTEGER NOT NULL,
    "enrollmentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'enrolled',
    "grade" TEXT,
    "gradePoints" REAL,
    "attendancePercentage" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "enrollments_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES "course_offerings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "assessment_types" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "defaultWeight" REAL
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "courseOfferingId" INTEGER NOT NULL,
    "assessmentTypeId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "totalMarks" REAL NOT NULL,
    "weightPercentage" REAL NOT NULL,
    "dueDate" DATETIME,
    "instructions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "assessments_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES "course_offerings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "assessments_assessmentTypeId_fkey" FOREIGN KEY ("assessmentTypeId") REFERENCES "assessment_types" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "student_assessments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assessmentId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "score" REAL,
    "submittedAt" DATETIME,
    "gradedAt" DATETIME,
    "gradedById" INTEGER,
    "feedback" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "student_assessments_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "student_assessments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "student_assessments_gradedById_fkey" FOREIGN KEY ("gradedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_courses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "creditHours" INTEGER NOT NULL DEFAULT 3,
    "contactHours" INTEGER,
    "level" INTEGER NOT NULL,
    "courseType" TEXT NOT NULL DEFAULT 'CORE',
    "prerequisites" TEXT,
    "corequisites" TEXT,
    "learningOutcomes" TEXT,
    "syllabus" TEXT,
    "assessmentMethods" TEXT,
    "recommendedBooks" TEXT,
    "departmentId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "courses_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_courses" ("code", "createdAt", "departmentId", "id", "name", "updatedAt") SELECT "code", "createdAt", "departmentId", "id", "name", "updatedAt" FROM "courses";
DROP TABLE "courses";
ALTER TABLE "new_courses" RENAME TO "courses";
CREATE UNIQUE INDEX "courses_code_key" ON "courses"("code");
CREATE TABLE "new_departments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'department',
    "description" TEXT,
    "officeLocation" TEXT,
    "contactInfo" TEXT,
    "facultyId" INTEGER NOT NULL,
    "hodId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "departments_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "departments_hodId_fkey" FOREIGN KEY ("hodId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_departments" ("code", "createdAt", "facultyId", "id", "name", "updatedAt") SELECT "code", "createdAt", "facultyId", "id", "name", "updatedAt" FROM "departments";
DROP TABLE "departments";
ALTER TABLE "new_departments" RENAME TO "departments";
CREATE UNIQUE INDEX "departments_facultyId_code_key" ON "departments"("facultyId", "code");
CREATE TABLE "new_faculties" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "establishedYear" INTEGER,
    "institutionId" INTEGER NOT NULL,
    "deanId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "faculties_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "faculties_deanId_fkey" FOREIGN KEY ("deanId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_faculties" ("code", "createdAt", "id", "institutionId", "name", "updatedAt") SELECT "code", "createdAt", "id", "institutionId", "name", "updatedAt" FROM "faculties";
DROP TABLE "faculties";
ALTER TABLE "new_faculties" RENAME TO "faculties";
CREATE UNIQUE INDEX "faculties_institutionId_code_key" ON "faculties"("institutionId", "code");
CREATE TABLE "new_institutions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_institutions" ("address", "code", "contactEmail", "contactPhone", "createdAt", "id", "name", "updatedAt") SELECT "address", "code", "contactEmail", "contactPhone", "createdAt", "id", "name", "updatedAt" FROM "institutions";
DROP TABLE "institutions";
ALTER TABLE "new_institutions" RENAME TO "institutions";
CREATE UNIQUE INDEX "institutions_code_key" ON "institutions"("code");
CREATE TABLE "new_lecturer_profiles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "staffId" TEXT NOT NULL,
    "academicRank" TEXT,
    "employmentType" TEXT NOT NULL DEFAULT 'FULL_TIME',
    "employmentStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "hireDate" DATETIME,
    "highestQualification" TEXT,
    "specialization" TEXT,
    "researchInterests" TEXT,
    "officeLocation" TEXT,
    "officeHours" TEXT,
    "biography" TEXT,
    "profileImageUrl" TEXT,
    "permissions" JSONB NOT NULL,
    "canCreateExams" BOOLEAN NOT NULL DEFAULT true,
    "canGradeScripts" BOOLEAN NOT NULL DEFAULT true,
    "canViewResults" BOOLEAN NOT NULL DEFAULT true,
    "canTeachCourses" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "lecturer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_lecturer_profiles" ("canCreateExams", "canGradeScripts", "canViewResults", "id", "permissions", "userId") SELECT "canCreateExams", "canGradeScripts", "canViewResults", "id", "permissions", "userId" FROM "lecturer_profiles";
DROP TABLE "lecturer_profiles";
ALTER TABLE "new_lecturer_profiles" RENAME TO "lecturer_profiles";
CREATE UNIQUE INDEX "lecturer_profiles_userId_key" ON "lecturer_profiles"("userId");
CREATE UNIQUE INDEX "lecturer_profiles_staffId_key" ON "lecturer_profiles"("staffId");
CREATE TABLE "new_student_profiles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "studentId" TEXT NOT NULL,
    "indexNumber" TEXT,
    "level" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL DEFAULT 1,
    "academicYear" TEXT,
    "programId" INTEGER,
    "admissionDate" DATETIME,
    "expectedGraduation" DATETIME,
    "enrollmentStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "academicStatus" TEXT NOT NULL DEFAULT 'GOOD_STANDING',
    "guardianName" TEXT,
    "guardianPhone" TEXT,
    "guardianEmail" TEXT,
    "emergencyContact" TEXT,
    CONSTRAINT "student_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "student_profiles_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_student_profiles" ("id", "level", "studentId", "userId") SELECT "id", "level", "studentId", "userId" FROM "student_profiles";
DROP TABLE "student_profiles";
ALTER TABLE "new_student_profiles" RENAME TO "student_profiles";
CREATE UNIQUE INDEX "student_profiles_userId_key" ON "student_profiles"("userId");
CREATE UNIQUE INDEX "student_profiles_studentId_key" ON "student_profiles"("studentId");
CREATE UNIQUE INDEX "student_profiles_indexNumber_key" ON "student_profiles"("indexNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "programs_departmentId_code_key" ON "programs"("departmentId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "program_prefixes_programType_key" ON "program_prefixes"("programType");

-- CreateIndex
CREATE UNIQUE INDEX "program_courses_programId_courseId_level_semester_key" ON "program_courses"("programId", "courseId", "level", "semester");

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_yearCode_key" ON "academic_years"("yearCode");

-- CreateIndex
CREATE UNIQUE INDEX "semesters_academicYearId_semesterNumber_key" ON "semesters"("academicYearId", "semesterNumber");

-- CreateIndex
CREATE UNIQUE INDEX "course_offerings_courseId_semesterId_key" ON "course_offerings"("courseId", "semesterId");

-- CreateIndex
CREATE UNIQUE INDEX "course_lecturers_courseOfferingId_lecturerId_key" ON "course_lecturers"("courseOfferingId", "lecturerId");

-- CreateIndex
CREATE UNIQUE INDEX "lecturer_departments_lecturerId_departmentId_key" ON "lecturer_departments"("lecturerId", "departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_studentId_courseOfferingId_key" ON "enrollments"("studentId", "courseOfferingId");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_types_name_key" ON "assessment_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "student_assessments_assessmentId_studentId_key" ON "student_assessments"("assessmentId", "studentId");
