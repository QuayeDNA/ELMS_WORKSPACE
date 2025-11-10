-- Add new enum values to existing enums
ALTER TYPE "ScriptStatus" ADD VALUE IF NOT EXISTS 'GRADING_IN_PROGRESS';
ALTER TYPE "ScriptStatus" ADD VALUE IF NOT EXISTS 'ARCHIVED';

ALTER TYPE "MovementType" ADD VALUE IF NOT EXISTS 'BATCH_SEALED';
ALTER TYPE "MovementType" ADD VALUE IF NOT EXISTS 'BATCH_TRANSFERRED';
ALTER TYPE "MovementType" ADD VALUE IF NOT EXISTS 'GRADING_STARTED';

-- Create new enum for BatchScriptStatus
DO $$ BEGIN
  CREATE TYPE "BatchScriptStatus" AS ENUM (
    'PENDING',
    'IN_COLLECTION',
    'SEALED',
    'IN_TRANSIT',
    'WITH_LECTURER',
    'GRADING_IN_PROGRESS',
    'GRADING_COMPLETED',
    'RETURNED_TO_REGISTRY',
    'ARCHIVED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create ExamRegistration table
CREATE TABLE IF NOT EXISTS "exam_registrations" (
  "id" SERIAL PRIMARY KEY,
  "studentId" INTEGER NOT NULL,
  "examEntryId" INTEGER NOT NULL,
  "studentQRCode" TEXT NOT NULL UNIQUE,
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

  CONSTRAINT "exam_registrations_studentId_fkey" FOREIGN KEY ("studentId")
    REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "exam_registrations_examEntryId_fkey" FOREIGN KEY ("examEntryId")
    REFERENCES "exam_timetable_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "exam_registrations_attendanceMarkedBy_fkey" FOREIGN KEY ("attendanceMarkedBy")
    REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "exam_registrations_studentId_examEntryId_key"
  ON "exam_registrations"("studentId", "examEntryId");
CREATE INDEX IF NOT EXISTS "exam_registrations_examEntryId_scriptSubmitted_idx"
  ON "exam_registrations"("examEntryId", "scriptSubmitted");
CREATE INDEX IF NOT EXISTS "exam_registrations_studentId_idx"
  ON "exam_registrations"("studentId");

-- Create BatchScript table
CREATE TABLE IF NOT EXISTS "batch_scripts" (
  "id" SERIAL PRIMARY KEY,
  "examEntryId" INTEGER NOT NULL,
  "courseId" INTEGER NOT NULL,
  "batchQRCode" TEXT NOT NULL UNIQUE,
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

  CONSTRAINT "batch_scripts_examEntryId_fkey" FOREIGN KEY ("examEntryId")
    REFERENCES "exam_timetable_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "batch_scripts_courseId_fkey" FOREIGN KEY ("courseId")
    REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "batch_scripts_assignedLecturerId_fkey" FOREIGN KEY ("assignedLecturerId")
    REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "batch_scripts_sealedBy_fkey" FOREIGN KEY ("sealedBy")
    REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "batch_scripts_examEntryId_courseId_key"
  ON "batch_scripts"("examEntryId", "courseId");
CREATE INDEX IF NOT EXISTS "batch_scripts_courseId_status_idx"
  ON "batch_scripts"("courseId", "status");
CREATE INDEX IF NOT EXISTS "batch_scripts_assignedLecturerId_idx"
  ON "batch_scripts"("assignedLecturerId");

-- Add new columns to scripts table
ALTER TABLE "scripts" ADD COLUMN IF NOT EXISTS "batchScriptId" INTEGER;
ALTER TABLE "scripts" ADD COLUMN IF NOT EXISTS "currentHolderId" INTEGER;
ALTER TABLE "scripts" ADD COLUMN IF NOT EXISTS "gradedById" INTEGER;
ALTER TABLE "scripts" ADD COLUMN IF NOT EXISTS "score" DOUBLE PRECISION;
ALTER TABLE "scripts" ADD COLUMN IF NOT EXISTS "maxScore" DOUBLE PRECISION;
ALTER TABLE "scripts" ADD COLUMN IF NOT EXISTS "gradedAt" TIMESTAMP(3);

-- Add foreign keys for scripts table
DO $$ BEGIN
  ALTER TABLE "scripts" ADD CONSTRAINT "scripts_batchScriptId_fkey"
    FOREIGN KEY ("batchScriptId") REFERENCES "batch_scripts"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "scripts" ADD CONSTRAINT "scripts_currentHolderId_fkey"
    FOREIGN KEY ("currentHolderId") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "scripts" ADD CONSTRAINT "scripts_gradedById_fkey"
    FOREIGN KEY ("gradedById") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add indexes for scripts table
CREATE INDEX IF NOT EXISTS "scripts_batchScriptId_idx" ON "scripts"("batchScriptId");
CREATE INDEX IF NOT EXISTS "scripts_currentHolderId_idx" ON "scripts"("currentHolderId");

-- Add new column to script_movements table
ALTER TABLE "script_movements" ADD COLUMN IF NOT EXISTS "batchScriptId" INTEGER;

-- Add foreign key for script_movements table
DO $$ BEGIN
  ALTER TABLE "script_movements" ADD CONSTRAINT "script_movements_batchScriptId_fkey"
    FOREIGN KEY ("batchScriptId") REFERENCES "batch_scripts"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add index for script_movements table
CREATE INDEX IF NOT EXISTS "script_movements_batchScriptId_idx"
  ON "script_movements"("batchScriptId");
