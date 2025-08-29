import { Router, Request, Response } from 'express';
import { SystemMonitoringService } from '../../services/monitoring/SystemMonitoringService';
import { authenticateToken, authorize } from '../../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const monitoringService = new SystemMonitoringService(prisma);

// Middleware
const authMiddleware = authenticateToken(prisma);
const superAdminOnly = authorize(['SUPER_ADMIN']);

/**
 * @route GET /api/monitoring/health
 * @desc Get overall system health status
 * @access Private (Super Admin only)
 */
router.get('/health', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const healthStatus = await monitoringService.checkSystemHealth();

    res.json({
      success: true,
      data: healthStatus,
      message: 'System health check completed successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: `Failed to check system health: ${message}`
    });
  }
});

/**
 * @route GET /api/monitoring/metrics
 * @desc Get current system metrics
 * @access Private (Super Admin only)
 */
router.get('/metrics', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const metrics = await monitoringService.collectSystemMetrics();

    res.json({
      success: true,
      data: metrics,
      message: 'System metrics retrieved successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: `Failed to retrieve system metrics: ${message}`
    });
  }
});

/**
 * @route GET /api/monitoring/health-checks
 * @desc Get detailed health check results for all services
 * @access Private (Super Admin only)
 */
router.get('/health-checks', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const healthChecks = await monitoringService.performHealthChecks();

    res.json({
      success: true,
      data: healthChecks,
      message: 'Health checks completed successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: `Failed to perform health checks: ${message}`
    });
  }
});

/**
 * @route GET /api/monitoring/metrics/history
 * @desc Get historical system metrics
 * @access Private (Super Admin only)
 */
router.get('/metrics/history', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    if (hours < 1 || hours > 168) { // Max 1 week
      return res.status(400).json({
        success: false,
        message: 'Hours must be between 1 and 168 (1 week)'
      });
    }

    const history = await monitoringService.getMetricsHistory(hours);

    res.json({
      success: true,
      data: history,
      message: 'Metrics history retrieved successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: `Failed to retrieve metrics history: ${message}`
    });
  }
});

/**
 * @route GET /api/monitoring/dashboard
 * @desc Get comprehensive monitoring dashboard data
 * @access Private (Super Admin only)
 */
router.get('/dashboard', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const [healthStatus, metrics, healthChecks, history] = await Promise.all([
      monitoringService.checkSystemHealth(),
      monitoringService.collectSystemMetrics(),
      monitoringService.performHealthChecks(),
      monitoringService.getMetricsHistory(24)
    ]);

    const dashboardData = {
      overallStatus: healthStatus.overallStatus,
      currentMetrics: metrics,
      healthChecks,
      alerts: healthStatus.alerts,
      metricsHistory: history,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: dashboardData,
      message: 'Monitoring dashboard data retrieved successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: `Failed to retrieve dashboard data: ${message}`
    });
  }
});

export default router;
