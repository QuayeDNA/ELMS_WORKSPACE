/*
  Warnings:

  - You are about to drop the column `affectedStudents` on the `exam_incidents` table. All the data in the column will be lost.
  - You are about to drop the column `witnesses` on the `exam_incidents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "exam_incidents" DROP COLUMN "affectedStudents",
DROP COLUMN "witnesses";

-- CreateTable
CREATE TABLE "exam_incident_students" (
    "id" SERIAL NOT NULL,
    "incidentId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_incident_students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_incident_invigilators" (
    "id" SERIAL NOT NULL,
    "incidentId" INTEGER NOT NULL,
    "invigilatorId" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_incident_invigilators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_incident_witnesses" (
    "id" SERIAL NOT NULL,
    "incidentId" INTEGER NOT NULL,
    "witnessId" INTEGER NOT NULL,
    "statement" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_incident_witnesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_logistics" (
    "id" SERIAL NOT NULL,
    "examEntryId" INTEGER NOT NULL,
    "totalExpected" INTEGER NOT NULL DEFAULT 0,
    "totalPresent" INTEGER NOT NULL DEFAULT 0,
    "totalAbsent" INTEGER NOT NULL DEFAULT 0,
    "totalLateArrivals" INTEGER NOT NULL DEFAULT 0,
    "scriptsSubmitted" INTEGER NOT NULL DEFAULT 0,
    "scriptsCollected" INTEGER NOT NULL DEFAULT 0,
    "scriptsPending" INTEGER NOT NULL DEFAULT 0,
    "invigilatorsAssigned" INTEGER NOT NULL DEFAULT 0,
    "invigilatorsPresent" INTEGER NOT NULL DEFAULT 0,
    "invigilatorsAbsent" INTEGER NOT NULL DEFAULT 0,
    "sessionStatus" "ExamSessionStatusType" NOT NULL DEFAULT 'NOT_STARTED',
    "dataVerificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "hasIncidents" BOOLEAN NOT NULL DEFAULT false,
    "hasUnresolvedIncidents" BOOLEAN NOT NULL DEFAULT false,
    "capacityExceeded" BOOLEAN NOT NULL DEFAULT false,
    "sessionStartedAt" TIMESTAMP(3),
    "sessionEndedAt" TIMESTAMP(3),
    "lastVerificationAt" TIMESTAMP(3),
    "lastIncidentAt" TIMESTAMP(3),
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_logistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exam_incident_students_incidentId_idx" ON "exam_incident_students"("incidentId");

-- CreateIndex
CREATE INDEX "exam_incident_students_studentId_idx" ON "exam_incident_students"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_incident_students_incidentId_studentId_key" ON "exam_incident_students"("incidentId", "studentId");

-- CreateIndex
CREATE INDEX "exam_incident_invigilators_incidentId_idx" ON "exam_incident_invigilators"("incidentId");

-- CreateIndex
CREATE INDEX "exam_incident_invigilators_invigilatorId_idx" ON "exam_incident_invigilators"("invigilatorId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_incident_invigilators_incidentId_invigilatorId_key" ON "exam_incident_invigilators"("incidentId", "invigilatorId");

-- CreateIndex
CREATE INDEX "exam_incident_witnesses_incidentId_idx" ON "exam_incident_witnesses"("incidentId");

-- CreateIndex
CREATE INDEX "exam_incident_witnesses_witnessId_idx" ON "exam_incident_witnesses"("witnessId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_incident_witnesses_incidentId_witnessId_key" ON "exam_incident_witnesses"("incidentId", "witnessId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_logistics_examEntryId_key" ON "exam_logistics"("examEntryId");

-- CreateIndex
CREATE INDEX "exam_logistics_examEntryId_idx" ON "exam_logistics"("examEntryId");

-- CreateIndex
CREATE INDEX "exam_logistics_sessionStatus_examEntryId_idx" ON "exam_logistics"("sessionStatus", "examEntryId");

-- CreateIndex
CREATE INDEX "exam_logistics_hasUnresolvedIncidents_examEntryId_idx" ON "exam_logistics"("hasUnresolvedIncidents", "examEntryId");

-- CreateIndex
CREATE INDEX "exam_logistics_dataVerificationStatus_examEntryId_idx" ON "exam_logistics"("dataVerificationStatus", "examEntryId");

-- AddForeignKey
ALTER TABLE "exam_incident_students" ADD CONSTRAINT "exam_incident_students_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "exam_incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_incident_students" ADD CONSTRAINT "exam_incident_students_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_incident_invigilators" ADD CONSTRAINT "exam_incident_invigilators_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "exam_incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_incident_invigilators" ADD CONSTRAINT "exam_incident_invigilators_invigilatorId_fkey" FOREIGN KEY ("invigilatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_incident_witnesses" ADD CONSTRAINT "exam_incident_witnesses_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "exam_incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_incident_witnesses" ADD CONSTRAINT "exam_incident_witnesses_witnessId_fkey" FOREIGN KEY ("witnessId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_logistics" ADD CONSTRAINT "exam_logistics_examEntryId_fkey" FOREIGN KEY ("examEntryId") REFERENCES "exam_timetable_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
