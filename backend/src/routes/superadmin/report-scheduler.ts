import { Router, Request, Response } from 'express';
import { ReportSchedulerService } from '../../services/reporting/ReportSchedulerService';
import { CustomReportService } from '../../services/reporting/CustomReportService';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorize } from '../../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();
const reportService = new CustomReportService(prisma);
const schedulerService = new ReportSchedulerService(prisma, reportService);

// Apply authentication and authorization middleware
router.use(authenticateToken(prisma));
router.use(authorize(['SUPER_ADMIN']));

/**
 * @swagger
 * /api/superadmin/reports/scheduler:
 *   post:
 *     summary: Schedule a report for automated execution
 *     tags: [Report Scheduler]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportId
 *               - frequency
 *               - time
 *               - recipients
 *               - format
 *             properties:
 *               reportId:
 *                 type: integer
 *                 description: ID of the report to schedule
 *               frequency:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *                 description: How often to run the report
 *               time:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 description: Time to run the report (HH:MM format)
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *                 description: Email addresses to send the report to
 *               format:
 *                 type: string
 *                 enum: [json, csv, pdf]
 *                 description: Format of the generated report
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 description: Whether the schedule is active
 *     responses:
 *       201:
 *         description: Report scheduled successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { reportId, frequency, time, recipients, format, isActive = true } = req.body;

    // Basic validation
    if (!reportId || !frequency || !time || !recipients || !format) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid frequency'
      });
    }

    if (!/^([0-1]?\d|2[0-3]):[0-5]\d$/.test(time)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time format (HH:MM required)'
      });
    }

    if (!['json', 'csv', 'pdf'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid format'
      });
    }

    const schedule = await schedulerService.scheduleReport(req.body);
    res.status(201).json({
      success: true,
      message: 'Report scheduled successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Error scheduling report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/superadmin/reports/scheduler:
 *   get:
 *     summary: Get all scheduled reports
 *     tags: [Report Scheduler]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of scheduled reports
 *       500:
 *         description: Server error
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const schedules = await schedulerService.getScheduledReports();
    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error('Error getting scheduled reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve scheduled reports',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/superadmin/reports/scheduler/{id}:
 *   put:
 *     summary: Update a scheduled report
 *     tags: [Report Scheduler]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Schedule ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               frequency:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *               time:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *               format:
 *                 type: string
 *                 enum: [json, csv, pdf]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Schedule updated successfully
 *       404:
 *         description: Schedule not found
 *       500:
 *         description: Server error
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { frequency, time, recipients, format, isActive } = req.body;

    // Basic validation
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid schedule ID'
      });
    }

    if (frequency && !['daily', 'weekly', 'monthly'].includes(frequency)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid frequency'
      });
    }

    if (time && !/^([0-1]?\d|2[0-3]):[0-5]\d$/.test(time)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time format (HH:MM required)'
      });
    }

    if (format && !['json', 'csv', 'pdf'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid format'
      });
    }

    const schedule = await schedulerService.updateScheduledReport(parseInt(id), req.body);
    res.json({
      success: true,
      message: 'Scheduled report updated successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Error updating scheduled report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update scheduled report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/superadmin/reports/scheduler/{id}:
 *   delete:
 *     summary: Delete a scheduled report
 *     tags: [Report Scheduler]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Schedule ID
 *     responses:
 *       200:
 *         description: Schedule deleted successfully
 *       404:
 *         description: Schedule not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Basic validation
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid schedule ID'
      });
    }

    await schedulerService.deleteScheduledReport(parseInt(id));
    res.json({
      success: true,
      message: 'Scheduled report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting scheduled report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete scheduled report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/superadmin/reports/scheduler/execute:
 *   post:
 *     summary: Execute all due scheduled reports
 *     tags: [Report Scheduler]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reports executed successfully
 *       500:
 *         description: Server error
 */
router.post('/execute', async (req: Request, res: Response) => {
  try {
    const results = await schedulerService.executeDueReports();
    res.json({
      success: true,
      message: 'Scheduled reports executed',
      data: results
    });
  } catch (error) {
    console.error('Error executing due reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute due reports',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/superadmin/reports/scheduler/stats:
 *   get:
 *     summary: Get scheduler statistics
 *     tags: [Report Scheduler]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Scheduler statistics
 *       500:
 *         description: Server error
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await schedulerService.getSchedulerStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting scheduler statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scheduler statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/superadmin/reports/scheduler/cron/start:
 *   post:
 *     summary: Start the report scheduler cron job
 *     tags: [Report Scheduler]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cron job started successfully
 *       500:
 *         description: Server error
 */
router.post('/cron/start', async (req: Request, res: Response) => {
  try {
    // Import the cron service dynamically to avoid circular imports
    const { reportSchedulerCron } = require('../../services/reporting/ReportSchedulerCron');
    reportSchedulerCron.start();

    res.json({
      success: true,
      message: 'Report scheduler cron job started'
    });
  } catch (error) {
    console.error('Error starting cron job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start cron job',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/superadmin/reports/scheduler/cron/stop:
 *   post:
 *     summary: Stop the report scheduler cron job
 *     tags: [Report Scheduler]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cron job stopped successfully
 *       500:
 *         description: Server error
 */
router.post('/cron/stop', async (req: Request, res: Response) => {
  try {
    const { reportSchedulerCron } = require('../../services/reporting/ReportSchedulerCron');
    reportSchedulerCron.stop();

    res.json({
      success: true,
      message: 'Report scheduler cron job stopped'
    });
  } catch (error) {
    console.error('Error stopping cron job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop cron job',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/superadmin/reports/scheduler/cron/status:
 *   get:
 *     summary: Get the status of the report scheduler cron job
 *     tags: [Report Scheduler]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cron job status
 *       500:
 *         description: Server error
 */
router.get('/cron/status', async (req: Request, res: Response) => {
  try {
    const { reportSchedulerCron } = require('../../services/reporting/ReportSchedulerCron');
    const status = reportSchedulerCron.getStatus();

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting cron status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cron status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/superadmin/reports/scheduler/cron/trigger:
 *   post:
 *     summary: Manually trigger report execution
 *     tags: [Report Scheduler]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Manual execution completed
 *       500:
 *         description: Server error
 */
router.post('/cron/trigger', async (req: Request, res: Response) => {
  try {
    const { reportSchedulerCron } = require('../../services/reporting/ReportSchedulerCron');
    const results = await reportSchedulerCron.triggerExecution();

    res.json({
      success: true,
      message: 'Manual execution completed',
      data: results
    });
  } catch (error) {
    console.error('Error triggering manual execution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger manual execution',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
