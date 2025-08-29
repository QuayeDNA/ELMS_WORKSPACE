import { Router, Request, Response } from 'express';
import { AlertManagementService, AlertFilter } from '../../services/monitoring/AlertManagementService';
import { authenticateToken, authorize } from '../../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const alertService = new AlertManagementService(prisma);

// Middleware
const authMiddleware = authenticateToken(prisma);
const superAdminOnly = authorize(['SUPER_ADMIN']);

/**
 * @route GET /api/alerts
 * @desc Get all system alerts with filtering and pagination
 * @access Private (Super Admin only)
 */
router.get('/', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const filter: AlertFilter = {
      type: req.query.type as string,
      severity: req.query.severity as string,
      status: req.query.status as 'active' | 'resolved',
      resolved: req.query.resolved ? req.query.resolved === 'true' : undefined,
      dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
      dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
    };

    const result = await alertService.getAlerts(filter);

    res.json({
      success: true,
      data: result,
      message: 'Alerts retrieved successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: `Failed to retrieve alerts: ${message}`
    });
  }
});

/**
 * @route GET /api/alerts/:id
 * @desc Get a specific alert by ID
 * @access Private (Super Admin only)
 */
router.get('/:id', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid alert ID'
      });
    }

    const alert = await alertService.getAlertById(id);

    res.json({
      success: true,
      data: alert,
      message: 'Alert retrieved successfully'
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
      message: `Failed to retrieve alert: ${message}`
    });
  }
});

/**
 * @route POST /api/alerts
 * @desc Create a new system alert
 * @access Private (Super Admin only)
 */
router.post('/', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const alertConfig = req.body;
    const user = (req as any).user;

    const alert = await alertService.createAlert(alertConfig, user?.userId);

    res.status(201).json({
      success: true,
      data: alert,
      message: 'Alert created successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: `Failed to create alert: ${message}`
    });
  }
});

/**
 * @route PUT /api/alerts/:id/resolve
 * @desc Resolve an alert
 * @access Private (Super Admin only)
 */
router.put('/:id/resolve', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid alert ID'
      });
    }

    const user = (req as any).user;
    const { resolution } = req.body;

    const alert = await alertService.resolveAlert(id, user.userId, resolution);

    res.json({
      success: true,
      data: alert,
      message: 'Alert resolved successfully'
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
      message: `Failed to resolve alert: ${message}`
    });
  }
});

/**
 * @route PUT /api/alerts/:id
 * @desc Update an alert
 * @access Private (Super Admin only)
 */
router.put('/:id', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid alert ID'
      });
    }

    const updates = req.body;
    const alert = await alertService.updateAlert(id, updates);

    res.json({
      success: true,
      data: alert,
      message: 'Alert updated successfully'
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
      message: `Failed to update alert: ${message}`
    });
  }
});

/**
 * @route DELETE /api/alerts/:id
 * @desc Delete an alert
 * @access Private (Super Admin only)
 */
router.delete('/:id', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid alert ID'
      });
    }

    await alertService.deleteAlert(id);

    res.json({
      success: true,
      message: 'Alert deleted successfully'
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
      message: `Failed to delete alert: ${message}`
    });
  }
});

/**
 * @route GET /api/alerts/statistics/overview
 * @desc Get alert statistics and overview
 * @access Private (Super Admin only)
 */
router.get('/statistics/overview', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const statistics = await alertService.getAlertStatistics();

    res.json({
      success: true,
      data: statistics,
      message: 'Alert statistics retrieved successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: `Failed to retrieve alert statistics: ${message}`
    });
  }
});

export default router;
