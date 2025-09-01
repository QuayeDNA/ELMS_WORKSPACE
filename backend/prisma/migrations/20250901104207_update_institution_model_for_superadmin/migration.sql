/*
  Warnings:

  - You are about to drop the column `config` on the `institutions` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "InstitutionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "InstitutionType" ADD VALUE 'HIGH_SCHOOL';
ALTER TYPE "InstitutionType" ADD VALUE 'TRAINING_CENTER';

-- AlterTable
ALTER TABLE "institutions" DROP COLUMN "config",
ADD COLUMN     "billingEmail" TEXT,
ADD COLUMN     "configuration" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "lastModifiedBy" TEXT,
ADD COLUMN     "status" "InstitutionStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "subscriptionData" JSONB,
ADD COLUMN     "subscriptionPlan" TEXT NOT NULL DEFAULT 'basic';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "institutionId" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutions" ADD CONSTRAINT "institutions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutions" ADD CONSTRAINT "institutions_lastModifiedBy_fkey" FOREIGN KEY ("lastModifiedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
