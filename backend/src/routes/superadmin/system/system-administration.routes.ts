/**
 * System Administration Routes
 * 
 * Defines API routes for Super Admin system management operations including
 * configuration management, system health monitoring, database operations,
 * cache management, and maintenance scheduling
 */

import { Router, Request, Response } from 'express';
import { SystemAdministrationController } from '../../../controllers/superadmin/system/system-administration.controller';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../../../middleware/validation.middleware';
import { authenticateToken, authorize, AuthenticatedRequest } from '../../../middleware/auth.middleware';

export function createSystemAdministrationRoutes(
  systemAdminController: SystemAdministrationController,
  prisma: any
): Router {
  const router = Router();

  // Helper function to wrap controller methods with proper type casting
  const wrapHandler = (handler: (req: AuthenticatedRequest, res: Response) => Promise<void>) =>
    async (req: Request, res: Response) => {
      await handler(req as AuthenticatedRequest, res);
    };

  // ===== CONFIGURATION MANAGEMENT ROUTES =====

  /**
   * GET /configuration/categories
   * Get available configuration categories
   */
  router.get('/configuration/categories', 
    systemAdminController.getConfigurationCategories.bind(systemAdminController)
  );

  /**
   * GET /configuration
   * Get all system configurations
   */
  router.get('/configuration',
    systemAdminController.getAllConfigurations.bind(systemAdminController)
  );

  /**
   * GET /configuration/:category
   * Get system configuration by category
   */
  router.get('/configuration/:category',
    [
      param('category')
        .isIn(['general', 'security', 'email', 'authentication', 'database', 'storage', 'notifications', 'integrations', 'performance', 'maintenance'])
        .withMessage('Invalid configuration category')
    ],
    validateRequest,
    systemAdminController.getSystemConfiguration.bind(systemAdminController)
  );

  /**
   * PUT /configuration/:category
   * Update system configuration
   */
  router.put('/configuration/:category',
    authenticateToken(prisma),
    authorize(['SUPER_ADMIN']),
    [
      param('category')
        .isIn(['general', 'security', 'email', 'authentication', 'database', 'storage', 'notifications', 'integrations', 'performance', 'maintenance'])
        .withMessage('Invalid configuration category'),
      body('settings')
        .isObject()
        .withMessage('Settings must be an object'),
      body('validate')
        .optional()
        .isBoolean()
        .withMessage('Validate must be a boolean')
    ],
    validateRequest,
    wrapHandler(systemAdminController.updateSystemConfiguration.bind(systemAdminController))
  );

  // ===== SYSTEM HEALTH MONITORING ROUTES =====

  /**
   * GET /health
   * Get comprehensive system health status
   */
  router.get('/health',
    [
      query('components')
        .optional()
        .isString()
        .withMessage('Components must be a comma-separated string'),
      query('includeMetrics')
        .optional()
        .isBoolean()
        .withMessage('includeMetrics must be a boolean'),
      query('detailed')
        .optional()
        .isBoolean()
        .withMessage('detailed must be a boolean')
    ],
    validateRequest,
    systemAdminController.getSystemHealth.bind(systemAdminController)
  );

  // ===== DATABASE OPERATIONS ROUTES =====

  /**
   * GET /database/operation-types
   * Get available database operation types
   */
  router.get('/database/operation-types',
    systemAdminController.getDatabaseOperationTypes.bind(systemAdminController)
  );

  /**
   * POST /database/operations
   * Execute database operation
   */
  router.post('/database/operations',
    authenticateToken(prisma),
    authorize(['SUPER_ADMIN']),
    [
      body('type')
        .isIn(['backup', 'restore', 'migration', 'maintenance', 'optimization', 'cleanup', 'reindex', 'vacuum'])
        .withMessage('Invalid database operation type'),
      body('tables')
        .optional()
        .isArray()
        .withMessage('Tables must be an array'),
      body('schedule')
        .optional()
        .isObject()
        .withMessage('Schedule must be an object'),
      body('parameters')
        .optional()
        .isObject()
        .withMessage('Parameters must be an object')
    ],
    validateRequest,
    wrapHandler(systemAdminController.executeDatabaseOperation.bind(systemAdminController))
  );

  /**
   * GET /database/operations/:operationId
   * Get database operation status
   */
  router.get('/database/operations/:operationId',
    [
      param('operationId')
        .isUUID()
        .withMessage('Operation ID must be a valid UUID')
    ],
    validateRequest,
    systemAdminController.getDatabaseOperationStatus.bind(systemAdminController)
  );

  // ===== CACHE MANAGEMENT ROUTES =====

  /**
   * GET /cache/targets
   * Get available cache targets
   */
  router.get('/cache/targets',
    systemAdminController.getCacheTargets.bind(systemAdminController)
  );

  /**
   * GET /cache/statistics
   * Get cache statistics
   */
  router.get('/cache/statistics',
    systemAdminController.getCacheStatistics.bind(systemAdminController)
  );

  /**
   * POST /cache/manage
   * Manage cache operations (clear, flush, rebuild, analyze)
   */
  router.post('/cache/manage',
    authenticateToken(prisma),
    authorize(['SUPER_ADMIN']),
    [
      body('operation')
        .isIn(['clear', 'flush', 'rebuild', 'analyze'])
        .withMessage('Invalid cache operation'),
      body('target')
        .optional()
        .isIn(['all', 'user_sessions', 'api_responses', 'database_queries', 'static_assets'])
        .withMessage('Invalid cache target'),
      body('pattern')
        .optional()
        .isString()
        .withMessage('Pattern must be a string')
    ],
    validateRequest,
    wrapHandler(systemAdminController.manageCacheOperation.bind(systemAdminController))
  );

  // ===== MAINTENANCE MANAGEMENT ROUTES =====

  /**
   * GET /maintenance
   * Get maintenance windows
   */
  router.get('/maintenance',
    [
      query('status')
        .optional()
        .isIn(['planned', 'in_progress', 'completed', 'cancelled', 'failed'])
        .withMessage('Invalid maintenance status'),
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
      query('offset')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Offset must be non-negative')
    ],
    validateRequest,
    systemAdminController.getMaintenanceWindows.bind(systemAdminController)
  );

  /**
   * POST /maintenance
   * Schedule maintenance window
   */
  router.post('/maintenance',
    authenticateToken(prisma),
    authorize(['SUPER_ADMIN']),
    [
      body('title')
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 200 })
        .withMessage('Title must not exceed 200 characters'),
      body('description')
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters'),
      body('type')
        .isIn(['scheduled', 'emergency', 'preventive', 'corrective'])
        .withMessage('Invalid maintenance type'),
      body('scheduledStart')
        .isISO8601()
        .withMessage('Scheduled start must be a valid ISO 8601 date')
        .custom((value) => {
          if (new Date(value) <= new Date()) {
            throw new Error('Scheduled start must be in the future');
          }
          return true;
        }),
      body('scheduledEnd')
        .isISO8601()
        .withMessage('Scheduled end must be a valid ISO 8601 date')
        .custom((value, { req }) => {
          if (new Date(value) <= new Date(req.body.scheduledStart)) {
            throw new Error('Scheduled end must be after scheduled start');
          }
          return true;
        }),
      body('affectedServices')
        .isArray()
        .withMessage('Affected services must be an array')
        .notEmpty()
        .withMessage('At least one affected service is required'),
      body('tasks')
        .isArray()
        .withMessage('Tasks must be an array')
        .notEmpty()
        .withMessage('At least one task is required'),
      body('tasks.*.title')
        .notEmpty()
        .withMessage('Task title is required'),
      body('tasks.*.description')
        .notEmpty()
        .withMessage('Task description is required'),
      body('tasks.*.estimatedDuration')
        .isInt({ min: 1 })
        .withMessage('Estimated duration must be a positive integer'),
      body('notifyUsers')
        .optional()
        .isBoolean()
        .withMessage('Notify users must be a boolean')
    ],
    validateRequest,
    wrapHandler(systemAdminController.scheduleMaintenanceWindow.bind(systemAdminController))
  );

  return router;
}
