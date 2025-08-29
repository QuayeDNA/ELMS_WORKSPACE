import { PrismaClient } from '@prisma/client';
import { CustomReportService } from './CustomReportService';

export interface ReportSchedule {
  reportId: number;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format
  recipients: string[];
  format: 'json' | 'csv' | 'pdf';
  isActive: boolean;
  nextRun?: Date;
  lastRun?: Date;
}

export interface ScheduledReportResult {
  reportId: number;
  executionId: number;
  status: 'success' | 'failed';
  recipients: string[];
  format: string;
  fileUrl?: string;
  error?: string;
}

export class ReportSchedulerService {
  constructor(
    private prisma: PrismaClient,
    private reportService: CustomReportService
  ) {}

  /**
   * Schedule a report for automated execution
   */
  async scheduleReport(schedule: ReportSchedule): Promise<any> {
    try {
      // Calculate next run time
      const nextRun = this.calculateNextRun(schedule.frequency, schedule.time);

      const scheduledReport = await this.prisma.reportSchedule.create({
        data: {
          reportId: schedule.reportId,
          name: schedule.name,
          description: schedule.description,
          frequency: schedule.frequency,
          time: schedule.time,
          recipients: schedule.recipients,
          format: schedule.format,
          isActive: schedule.isActive,
          nextRun,
          createdAt: new Date()
        }
      });

      return scheduledReport;
    } catch (error) {
      console.error('Error scheduling report:', error);
      throw new Error('Failed to schedule report');
    }
  }

  /**
   * Get all scheduled reports
   */
  async getScheduledReports(): Promise<any[]> {
    try {
      const schedules = await this.prisma.reportSchedule.findMany({
        include: {
          report: {
            select: {
              id: true,
              name: true,
              description: true,
              isActive: true
            }
          }
        },
        orderBy: {
          nextRun: 'asc'
        }
      });

      return schedules;
    } catch (error) {
      console.error('Error getting scheduled reports:', error);
      throw new Error('Failed to retrieve scheduled reports');
    }
  }

  /**
   * Update a scheduled report
   */
  async updateScheduledReport(id: number, updates: Partial<ReportSchedule>): Promise<any> {
    try {
      // Recalculate next run if frequency or time changed
      let nextRun = undefined;
      if (updates.frequency || updates.time) {
        const schedule = await this.prisma.reportSchedule.findUnique({
          where: { id }
        });
        if (schedule) {
          const frequency = updates.frequency || schedule.frequency;
          const time = updates.time || schedule.time;
          nextRun = this.calculateNextRun(frequency, time);
        }
      }

      const updatedSchedule = await this.prisma.reportSchedule.update({
        where: { id },
        data: {
          ...updates,
          nextRun,
          updatedAt: new Date()
        },
        include: {
          report: {
            select: {
              id: true,
              name: true,
              description: true
            }
          }
        }
      });

      return updatedSchedule;
    } catch (error) {
      console.error('Error updating scheduled report:', error);
      throw new Error('Failed to update scheduled report');
    }
  }

  /**
   * Delete a scheduled report
   */
  async deleteScheduledReport(id: number): Promise<void> {
    try {
      await this.prisma.reportSchedule.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting scheduled report:', error);
      throw new Error('Failed to delete scheduled report');
    }
  }

  /**
   * Execute due scheduled reports
   * This should be called by a cron job or scheduler
   */
  async executeDueReports(): Promise<ScheduledReportResult[]> {
    try {
      const now = new Date();

      // Find all active schedules that are due
      const dueSchedules = await this.prisma.reportSchedule.findMany({
        where: {
          isActive: true,
          nextRun: {
            lte: now
          }
        },
        include: {
          report: true
        }
      });

      const results: ScheduledReportResult[] = [];

      for (const schedule of dueSchedules) {
        try {
          const result = await this.executeScheduledReport(schedule);
          results.push(result);

          // Update next run time
          const nextRun = this.calculateNextRun(schedule.frequency, schedule.time);
          await this.prisma.reportSchedule.update({
            where: { id: schedule.id },
            data: {
              lastRun: now,
              nextRun
            }
          });
        } catch (error) {
          console.error(`Failed to execute scheduled report ${schedule.id}:`, error);

          results.push({
            reportId: schedule.reportId,
            executionId: 0,
            status: 'failed',
            recipients: schedule.recipients,
            format: schedule.format,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error executing due reports:', error);
      throw new Error('Failed to execute due reports');
    }
  }

  /**
   * Execute a single scheduled report
   */
  private async executeScheduledReport(schedule: any): Promise<ScheduledReportResult> {
    try {
      // Execute the report with empty parameters
      const executionResult = await this.reportService.executeReport(
        schedule.reportId,
        'system', // System user
        {}
      );

      // Generate report file in requested format
      const fileUrl = await this.generateReportFile(
        executionResult,
        schedule.format,
        schedule.report.name
      );

      // Send report to recipients
      await this.sendReportToRecipients(
        fileUrl,
        schedule.recipients,
        schedule.report.name,
        schedule.format
      );

      return {
        reportId: schedule.reportId,
        executionId: executionResult.executionId,
        status: 'success',
        recipients: schedule.recipients,
        format: schedule.format,
        fileUrl
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculate next run time based on frequency and time
   */
  private calculateNextRun(frequency: string, time: string): Date {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);

    let nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);

    switch (frequency) {
      case 'daily':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;

      case 'weekly':
        // Run every Monday at specified time
        const daysUntilMonday = (1 - nextRun.getDay() + 7) % 7;
        if (daysUntilMonday === 0 && nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 7);
        } else {
          nextRun.setDate(nextRun.getDate() + daysUntilMonday);
        }
        break;

      case 'monthly':
        // Run on the 1st of every month at specified time
        nextRun.setDate(1);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;

      default:
        throw new Error(`Unsupported frequency: ${frequency}`);
    }

    return nextRun;
  }

  /**
   * Generate report file in specified format
   */
  private async generateReportFile(
    executionResult: any,
    format: string,
    reportName: string
  ): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${reportName}_${timestamp}`;

      switch (format) {
        case 'json':
          return await this.generateJsonFile(executionResult.data, filename);

        case 'csv':
          return await this.generateCsvFile(executionResult.data, filename);

        case 'pdf':
          return await this.generatePdfFile(executionResult.data, filename);

        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      console.error('Error generating report file:', error);
      throw new Error('Failed to generate report file');
    }
  }

  /**
   * Generate JSON file
   */
  private async generateJsonFile(data: any, filename: string): Promise<string> {
    // In a real implementation, you'd save to cloud storage
    const filePath = `/reports/${filename}.json`;
    console.log(`Generated JSON file: ${filePath}`);
    return filePath;
  }

  /**
   * Generate CSV file
   */
  private async generateCsvFile(data: any, filename: string): Promise<string> {
    // In a real implementation, you'd convert data to CSV and save
    const filePath = `/reports/${filename}.csv`;
    console.log(`Generated CSV file: ${filePath}`);
    return filePath;
  }

  /**
   * Generate PDF file
   */
  private async generatePdfFile(data: any, filename: string): Promise<string> {
    // In a real implementation, you'd use a PDF generation library
    const filePath = `/reports/${filename}.pdf`;
    console.log(`Generated PDF file: ${filePath}`);
    return filePath;
  }

  /**
   * Send report to recipients
   */
  private async sendReportToRecipients(
    fileUrl: string,
    recipients: string[],
    reportName: string,
    format: string
  ): Promise<void> {
    try {
      const subject = `Scheduled Report: ${reportName}`;
      const message = `
        Your scheduled report "${reportName}" is ready.
        Format: ${format.toUpperCase()}
        Download: ${fileUrl}

        This report was generated automatically on ${new Date().toISOString()}.
      `;

      // Send email to each recipient
      for (const recipient of recipients) {
        await this.sendEmail(recipient, subject, message, fileUrl);
      }
    } catch (error) {
      console.error('Error sending report to recipients:', error);
      throw new Error('Failed to send report to recipients');
    }
  }

  /**
   * Send email with report attachment
   */
  private async sendEmail(
    to: string,
    subject: string,
    message: string,
    attachmentUrl?: string
  ): Promise<void> {
    // In a real implementation, you'd use an email service like SendGrid
    console.log(`Sending email to ${to}: ${subject}`);
  }

  /**
   * Get scheduler statistics
   */
  async getSchedulerStatistics(): Promise<{
    totalSchedules: number;
    activeSchedules: number;
    nextRuns: any[];
    recentExecutions: any[];
  }> {
    try {
      const [totalSchedules, activeSchedules, nextRuns, recentExecutions] = await Promise.all([
        this.prisma.reportSchedule.count(),
        this.prisma.reportSchedule.count({ where: { isActive: true } }),
        this.prisma.reportSchedule.findMany({
          where: { isActive: true },
          orderBy: { nextRun: 'asc' },
          take: 5,
          include: {
            report: {
              select: { name: true }
            }
          }
        }),
        this.prisma.reportSchedule.findMany({
          where: { lastRun: { not: null } },
          orderBy: { lastRun: 'desc' },
          take: 10,
          include: {
            report: {
              select: { name: true }
            }
          }
        })
      ]);

      return {
        totalSchedules,
        activeSchedules,
        nextRuns,
        recentExecutions
      };
    } catch (error) {
      console.error('Error getting scheduler statistics:', error);
      throw new Error('Failed to get scheduler statistics');
    }
  }
}
