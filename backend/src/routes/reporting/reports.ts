import { Router, Request, Response } from 'express';
import { CustomReportService, CreateReportDto, UpdateReportDto } from '../../services/reporting/CustomReportService';
import { authenticateToken, authorize, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const reportService = new CustomReportService(prisma);

// Middleware
const authMiddleware = authenticateToken(prisma);
const superAdminOnly = authorize(['SUPER_ADMIN']);

// Validation schemas
const createReportSchema = {
  name: { type: 'string', required: true, minLength: 1, maxLength: 255 },
  description: { type: 'string', required: false, maxLength: 1000 },
  queryConfig: {
    type: 'object',
    required: true,
    properties: {
      entity: {
        type: 'string',
        enum: ['users', 'institutions', 'courses', 'exams', 'audit_logs']
      },
      filters: { type: 'object' },
      aggregations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: { type: 'string' },
            operation: { type: 'string', enum: ['count', 'sum', 'avg', 'min', 'max'] },
            alias: { type: 'string' }
          }
        }
      },
      groupBy: { type: 'array', items: { type: 'string' } },
      sortBy: { type: 'string' },
      sortOrder: { type: 'string', enum: ['asc', 'desc'] },
      limit: { type: 'number', minimum: 1, maximum: 10000 },
      offset: { type: 'number', minimum: 0 }
    }
  },
  scheduleConfig: {
    type: 'object',
    required: false,
    properties: {
      enabled: { type: 'boolean' },
      frequency: { type: 'string', enum: ['daily', 'weekly', 'monthly'] },
      time: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' },
      recipients: { type: 'array', items: { type: 'string', format: 'email' } },
      format: { type: 'string', enum: ['json', 'csv', 'pdf'] }
    }
  }
};

const updateReportSchema = {
  name: { type: 'string', required: false, minLength: 1, maxLength: 255 },
  description: { type: 'string', required: false, maxLength: 1000 },
  queryConfig: {
    type: 'object',
    required: false,
    properties: {
      entity: {
        type: 'string',
        enum: ['users', 'institutions', 'courses', 'exams', 'audit_logs']
      },
      filters: { type: 'object' },
      aggregations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: { type: 'string' },
            operation: { type: 'string', enum: ['count', 'sum', 'avg', 'min', 'max'] },
            alias: { type: 'string' }
          }
        }
      },
      groupBy: { type: 'array', items: { type: 'string' } },
      sortBy: { type: 'string' },
      sortOrder: { type: 'string', enum: ['asc', 'desc'] },
      limit: { type: 'number', minimum: 1, maximum: 10000 },
      offset: { type: 'number', minimum: 0 }
    }
  },
  scheduleConfig: {
    type: 'object',
    required: false,
    properties: {
      enabled: { type: 'boolean' },
      frequency: { type: 'string', enum: ['daily', 'weekly', 'monthly'] },
      time: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' },
      recipients: { type: 'array', items: { type: 'string', format: 'email' } },
      format: { type: 'string', enum: ['json', 'csv', 'pdf'] }
    }
  },
  isActive: { type: 'boolean', required: false }
};

// Routes

/**
 * @route GET /api/reports
 * @desc Get all custom reports
 * @access Private (Super Admin only)
 */
router.get('/', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const userId = user?.userId;
    const reports = await reportService.getReports(userId);

    res.json({
      success: true,
      data: reports,
      message: 'Reports retrieved successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: `Failed to retrieve reports: ${message}`
    });
  }
});

/**
 * @route GET /api/reports/:id
 * @desc Get a specific custom report by ID
 * @access Private (Super Admin only)
 */
router.get('/:id', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID'
      });
    }

    const report = await reportService.getReportById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report,
      message: 'Report retrieved successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: `Failed to retrieve report: ${message}`
    });
  }
});

/**
 * @route POST /api/reports
 * @desc Create a new custom report
 * @access Private (Super Admin only)
 */
router.post('/', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const userId = user!.userId;
    const dto: CreateReportDto = req.body;

    const report = await reportService.createReport(userId, dto);

    res.status(201).json({
      success: true,
      data: report,
      message: 'Report created successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: `Failed to create report: ${message}`
    });
  }
});

/**
 * @route PUT /api/reports/:id
 * @desc Update an existing custom report
 * @access Private (Super Admin only)
 */
router.put('/:id', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID'
      });
    }

    const user = (req as AuthenticatedRequest).user;
    const userId = user!.userId;
    const dto: UpdateReportDto = req.body;

    const report = await reportService.updateReport(id, userId, dto);

    res.json({
      success: true,
      data: report,
      message: 'Report updated successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message
      });
    }
    res.status(500).json({
      success: false,
      message: `Failed to update report: ${message}`
    });
  }
});

/**
 * @route DELETE /api/reports/:id
 * @desc Delete a custom report
 * @access Private (Super Admin only)
 */
router.delete('/:id', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID'
      });
    }

    await reportService.deleteReport(id);

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message
      });
    }
    res.status(500).json({
      success: false,
      message: `Failed to delete report: ${message}`
    });
  }
});

/**
 * @route POST /api/reports/:id/execute
 * @desc Execute a custom report
 * @access Private (Super Admin only)
 */
router.post('/:id/execute', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID'
      });
    }

    const user = (req as AuthenticatedRequest).user;
    const userId = user!.userId;
    const parameters = req.body.parameters || {};

    const result = await reportService.executeReport(id, userId, parameters);

    res.json({
      success: true,
      data: result,
      message: 'Report executed successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message
      });
    }
    res.status(500).json({
      success: false,
      message: `Failed to execute report: ${message}`
    });
  }
});

/**
 * @route GET /api/reports/:id/executions
 * @desc Get execution history for a custom report
 * @access Private (Super Admin only)
 */
router.get('/:id/executions', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID'
      });
    }

    const executions = await reportService.getReportExecutions(id);

    res.json({
      success: true,
      data: executions,
      message: 'Report executions retrieved successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: `Failed to retrieve report executions: ${message}`
    });
  }
});

export default router;
