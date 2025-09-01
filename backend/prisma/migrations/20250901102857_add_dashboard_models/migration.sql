/*
  Warnings:

  - The primary key for the `system_alerts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `isActive` on the `system_alerts` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `system_alerts` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `system_alerts` table. All the data in the column will be lost.
  - Added the required column `description` to the `system_alerts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `system_alerts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "system_alerts" DROP CONSTRAINT "system_alerts_pkey",
DROP COLUMN "isActive",
DROP COLUMN "message",
DROP COLUMN "type",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "source" VARCHAR(100) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "system_alerts_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "system_alerts_id_seq";

-- CreateTable
CREATE TABLE "system_metrics" (
    "id" SERIAL NOT NULL,
    "metricType" VARCHAR(50) NOT NULL,
    "metricValue" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "system_metrics_metricType_timestamp_idx" ON "system_metrics"("metricType", "timestamp");
