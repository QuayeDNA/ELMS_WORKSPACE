/**
 * Dashboard Controller for Super Admin
 * 
 * Handles HTTP requests for dashboard functionality including
 * system overview, metrics, alerts, and quick actions
 */

import { Request, Response } from 'express';
import { DashboardService } from '../../../services/superadmin/dashboard/dashboard.service';
import { 
  GetOverviewResponse, 
  GetMetricsResponse, 
  GetAlertsResponse, 
  GetQuickActionsResponse,
  AlertFilters,
  AlertSeverity,
  AlertSource
} from '../../../types/superadmin/dashboard/dashboard.types';
import logger from '../../../utils/logger';
import { validationResult } from 'express-validator';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        permissions?: string[];
      };
    }
  }
}

export class DashboardController {
  private dashboardService: DashboardService;

  constructor(dashboardService: DashboardService) {
    this.dashboardService = dashboardService;
  }

  /**
   * GET /api/v1/superadmin/dashboard/overview
   * Get system overview with key metrics
   */
  async getOverview(req: Request, res: Response): Promise<Response> {
    try {
      logger.info('Super admin requesting system overview', {
        userId: req.user?.id,
        ip: req.ip
      });

      const overview = await this.dashboardService.getSystemOverview();

      const response: GetOverviewResponse = {
        data: overview,
        success: true,
        timestamp: new Date().toISOString()
      };

      return res.status(200).json(response);
    } catch (error) {
      logger.error('Error in getOverview:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve system overview',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /api/v1/superadmin/dashboard/metrics/realtime
   * Get real-time system metrics
   */
  async getRealTimeMetrics(req: Request, res: Response): Promise<Response> {
    try {
      logger.info('Super admin requesting real-time metrics', {
        userId: req.user?.id,
        ip: req.ip
      });

      const metrics = await this.dashboardService.getRealTimeMetrics();

      const response: GetMetricsResponse = {
        data: metrics,
        success: true,
        timestamp: new Date().toISOString()
      };

      return res.status(200).json(response);
    } catch (error) {
      logger.error('Error in getRealTimeMetrics:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve real-time metrics',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /api/v1/superadmin/dashboard/alerts
   * Get system alerts with filtering and pagination
   */
  async getAlerts(req: Request, res: Response): Promise<Response> {
    try {
      // Validate request parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request parameters',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
      }

      logger.info('Super admin requesting alerts', {
        userId: req.user?.id,
        filters: req.query,
        ip: req.ip
      });

      // Parse query parameters
      const filters: AlertFilters = this.parseAlertFilters(req.query);

      const alerts = await this.dashboardService.getActiveAlerts(filters);

      const response: GetAlertsResponse = {
        data: alerts,
        success: true,
        timestamp: new Date().toISOString()
      };

      return res.status(200).json(response);
    } catch (error) {
      logger.error('Error in getAlerts:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve alerts',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /api/v1/superadmin/dashboard/quick-actions
   * Get available quick actions for super admin
   */
  async getQuickActions(req: Request, res: Response): Promise<Response> {
    try {
      logger.info('Super admin requesting quick actions', {
        userId: req.user?.id,
        ip: req.ip
      });

      const quickActions = await this.dashboardService.getQuickActions();

      // Filter actions based on user permissions
      const userPermissions = req.user?.permissions || [];
      const filteredActions = quickActions.filter(action => 
        action.permissions.every(permission => userPermissions.includes(permission))
      );

      const response: GetQuickActionsResponse = {
        data: filteredActions,
        success: true,
        timestamp: new Date().toISOString()
      };

      return res.status(200).json(response);
    } catch (error) {
      logger.error('Error in getQuickActions:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve quick actions',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * POST /api/v1/superadmin/dashboard/alerts/:id/resolve
   * Resolve a specific alert
   */
  async resolveAlert(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Alert ID is required',
          timestamp: new Date().toISOString()
        });
      }

      logger.info('Super admin resolving alert', {
        userId: req.user?.id,
        alertId: id,
        ip: req.ip
      });

      const resolvedAlert = await this.dashboardService.resolveAlert(id);

      return res.status(200).json({
        data: resolvedAlert,
        success: true,
        message: 'Alert resolved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in resolveAlert:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to resolve alert',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * POST /api/v1/superadmin/dashboard/alerts
   * Create a new system alert
   */
  async createAlert(req: Request, res: Response): Promise<Response> {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request body',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
      }

      const { severity, title, description, source, metadata } = req.body;

      logger.info('Super admin creating alert', {
        userId: req.user?.id,
        alertTitle: title,
        severity,
        ip: req.ip
      });

      const alert = await this.dashboardService.createAlert({
        severity,
        title,
        description,
        source,
        metadata: metadata || {},
        resolved: false,
        resolvedAt: undefined
      });

      return res.status(201).json({
        data: alert,
        success: true,
        message: 'Alert created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in createAlert:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create alert',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Private helper methods

  private parseAlertFilters(query: any): AlertFilters {
    const filters: AlertFilters = {};

    // Parse severity filter
    if (query.severity) {
      const severities = Array.isArray(query.severity) ? query.severity : [query.severity];
      filters.severity = severities.filter((s: string) => 
        Object.values(AlertSeverity).includes(s as AlertSeverity)
      ) as AlertSeverity[];
    }

    // Parse source filter
    if (query.source) {
      const sources = Array.isArray(query.source) ? query.source : [query.source];
      filters.source = sources.filter((s: string) => 
        Object.values(AlertSource).includes(s as AlertSource)
      ) as AlertSource[];
    }

    // Parse resolved filter
    if (query.resolved !== undefined) {
      filters.resolved = query.resolved === 'true';
    }

    // Parse date range
    if (query.startDate && query.endDate) {
      filters.dateRange = {
        start: new Date(query.startDate),
        end: new Date(query.endDate)
      };
    }

    // Parse pagination
    if (query.limit) {
      filters.limit = Math.min(parseInt(query.limit), 100); // Max 100 items
    }

    if (query.offset) {
      filters.offset = Math.max(parseInt(query.offset), 0);
    }

    return filters;
  }
}
