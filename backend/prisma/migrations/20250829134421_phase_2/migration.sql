/*
  Warnings:

  - You are about to drop the `custom_reports` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `report_executions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `system_alerts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `webhook_deliveries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `webhooks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "custom_reports" DROP CONSTRAINT "custom_reports_created_by_fkey";

-- DropForeignKey
ALTER TABLE "custom_reports" DROP CONSTRAINT "custom_reports_updated_by_fkey";

-- DropForeignKey
ALTER TABLE "report_executions" DROP CONSTRAINT "report_executions_executed_by_fkey";

-- DropForeignKey
ALTER TABLE "report_executions" DROP CONSTRAINT "report_executions_report_id_fkey";

-- DropForeignKey
ALTER TABLE "system_alerts" DROP CONSTRAINT "system_alerts_resolved_by_fkey";

-- DropForeignKey
ALTER TABLE "webhook_deliveries" DROP CONSTRAINT "webhook_deliveries_webhook_id_fkey";

-- DropForeignKey
ALTER TABLE "webhooks" DROP CONSTRAINT "webhooks_created_by_fkey";

-- DropTable
DROP TABLE "custom_reports";

-- DropTable
DROP TABLE "report_executions";

-- DropTable
DROP TABLE "system_alerts";

-- DropTable
DROP TABLE "webhook_deliveries";

-- DropTable
DROP TABLE "webhooks";
