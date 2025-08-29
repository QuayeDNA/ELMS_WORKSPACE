import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { ReportSchedulerService } from './ReportSchedulerService';
import { CustomReportService } from './CustomReportService';
import logger from '../../utils/logger';

class ReportSchedulerCron {
  private readonly schedulerService: ReportSchedulerService;
  private cronJob: cron.ScheduledTask | null = null;

  constructor() {
    const prisma = new PrismaClient();
    const reportService = new CustomReportService(prisma);
    this.schedulerService = new ReportSchedulerService(prisma, reportService);
  }

  /**
   * Start the report scheduler cron job
   * Runs every 5 minutes to check for due reports
   */
  public start(): void {
    if (this.cronJob) {
      logger.warn('Report scheduler cron job is already running');
      return;
    }

    // Run every 5 minutes
    this.cronJob = cron.schedule('*/5 * * * *', async () => {
      try {
        logger.info('🔍 Checking for due scheduled reports...');

        const results = await this.schedulerService.executeDueReports();

        if (results.length > 0) {
          logger.info(`✅ Executed ${results.length} scheduled reports`);

          // Log results
          results.forEach((result: any) => {
            if (result.status === 'success') {
              logger.info(`📧 Report ${result.reportId} executed successfully and sent to ${result.recipients.length} recipients`);
            } else {
              logger.error(`❌ Report ${result.reportId} execution failed: ${result.error}`);
            }
          });
        } else {
          logger.debug('No due reports found');
        }
      } catch (error) {
        logger.error('Error in report scheduler cron job:', error);
      }
    }, {
      scheduled: false // Don't start immediately
    });

    this.cronJob.start();
    logger.info('⏰ Report scheduler cron job started - runs every 5 minutes');
  }

  /**
   * Stop the report scheduler cron job
   */
  public stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      logger.info('🛑 Report scheduler cron job stopped');
    } else {
      logger.warn('Report scheduler cron job is not running');
    }
  }

  /**
   * Manually trigger report execution (for testing)
   */
  public async triggerExecution(): Promise<any[]> {
    try {
      logger.info('🔧 Manually triggering scheduled report execution...');
      const results = await this.schedulerService.executeDueReports();
      logger.info(`✅ Manual execution completed: ${results.length} reports processed`);
      return results;
    } catch (error) {
      logger.error('Error in manual report execution:', error);
      throw error;
    }
  }

  /**
   * Get scheduler status
   */
  public getStatus(): {
    isRunning: boolean;
    nextRun?: Date;
    lastRun?: Date;
  } {
    return {
      isRunning: this.cronJob !== null,
      nextRun: this.cronJob ? new Date(Date.now() + 5 * 60 * 1000) : undefined, // Approximate next run
      lastRun: undefined // Would need to track this separately
    };
  }

  /**
   * Get scheduler statistics
   */
  public async getStatistics(): Promise<any> {
    try {
      return await this.schedulerService.getSchedulerStatistics();
    } catch (error) {
      logger.error('Error getting scheduler statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const reportSchedulerCron = new ReportSchedulerCron();
export default reportSchedulerCron;
