-- CreateTable
CREATE TABLE "venue_officer_assignments" (
    "id" SERIAL NOT NULL,
    "timetableId" INTEGER NOT NULL,
    "venueId" INTEGER NOT NULL,
    "officerId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "venue_officer_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "venue_officer_assignments_timetableId_officerId_idx" ON "venue_officer_assignments"("timetableId", "officerId");

-- CreateIndex
CREATE INDEX "venue_officer_assignments_venueId_timetableId_idx" ON "venue_officer_assignments"("venueId", "timetableId");

-- CreateIndex
CREATE UNIQUE INDEX "venue_officer_assignments_timetableId_venueId_officerId_key" ON "venue_officer_assignments"("timetableId", "venueId", "officerId");

-- AddForeignKey
ALTER TABLE "venue_officer_assignments" ADD CONSTRAINT "venue_officer_assignments_timetableId_fkey" FOREIGN KEY ("timetableId") REFERENCES "exam_timetables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_officer_assignments" ADD CONSTRAINT "venue_officer_assignments_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_officer_assignments" ADD CONSTRAINT "venue_officer_assignments_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_officer_assignments" ADD CONSTRAINT "venue_officer_assignments_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
