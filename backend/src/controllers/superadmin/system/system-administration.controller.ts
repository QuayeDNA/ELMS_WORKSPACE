/**
 * System Administration Controller
 * 
 * Handles HTTP requests for Super Admin system management operations including
 * configuration management, system health monitoring, database operations,
 * cache management, and maintenance scheduling
 */

import { Request, Response } from 'express';
import { SystemAdministrationService } from '../../../services/superadmin/system/system-administration.service';
import {
  ConfigurationCategory,
  ComponentType,
  MaintenanceStatus,
  DatabaseOperationType,
  CacheOperation,
  CacheTarget,
  SystemConfigurationRequest,
  SystemHealthRequest,
  DatabaseOperationRequest,
  MaintenanceWindowRequest,
  CacheManagementRequest
} from '../../../types/superadmin/system/system-admin.types';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import logger from '../../../utils/logger';

export class SystemAdministrationController {
  constructor(private systemAdminService: SystemAdministrationService) {}

  // ===== CONFIGURATION MANAGEMENT =====

  /**
   * GET /api/superadmin/system/configuration/:category
   * Get system configuration by category
   */
  async getSystemConfiguration(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      
      // Validate category
      if (!Object.values(ConfigurationCategory).includes(category as ConfigurationCategory)) {
        res.status(400).json({
          success: false,
          error: 'Invalid configuration category'
        });
        return;
      }

      const configuration = await this.systemAdminService.getSystemConfiguration(
        category as ConfigurationCategory
      );

      if (!configuration) {
        res.status(404).json({
          success: false,
          error: 'Configuration not found'
        });
        return;
      }

      res.json({
        success: true,
        data: configuration
      });
    } catch (error) {
      logger.error('Failed to get system configuration', { error, category: req.params.category });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve system configuration'
      });
    }
  }

  /**
   * PUT /api/superadmin/system/configuration/:category
   * Update system configuration
   */
  async updateSystemConfiguration(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const requestData: SystemConfigurationRequest = req.body;
      const updatedBy = req.user!.userId;

      // Validate category
      if (!Object.values(ConfigurationCategory).includes(category as ConfigurationCategory)) {
        res.status(400).json({
          success: false,
          error: 'Invalid configuration category'
        });
        return;
      }

      // Validate request body
      if (!requestData.settings || typeof requestData.settings !== 'object') {
        res.status(400).json({
          success: false,
          error: 'Invalid configuration settings'
        });
        return;
      }

      const configuration = await this.systemAdminService.updateSystemConfiguration(
        category as ConfigurationCategory,
        requestData,
        updatedBy
      );

      res.json({
        success: true,
        data: configuration,
        message: 'Configuration updated successfully'
      });
    } catch (error) {
      logger.error('Failed to update system configuration', { 
        error, 
        category: req.params.category,
        userId: req.user?.userId 
      });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update system configuration'
      });
    }
  }

  /**
   * GET /api/superadmin/system/configuration
   * Get all system configurations
   */
  async getAllConfigurations(req: Request, res: Response): Promise<void> {
    try {
      const configurations = await this.systemAdminService.getAllConfigurations();

      res.json({
        success: true,
        data: configurations
      });
    } catch (error) {
      logger.error('Failed to get all configurations', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve configurations'
      });
    }
  }

  // ===== SYSTEM HEALTH MONITORING =====

  /**
   * GET /api/superadmin/system/health
   * Get comprehensive system health status
   */
  async getSystemHealth(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query;
      const request: SystemHealthRequest = {
        components: query.components ? 
          (query.components as string).split(',') as ComponentType[] : 
          undefined,
        includeMetrics: query.includeMetrics === 'true',
        detailed: query.detailed === 'true'
      };

      const health = await this.systemAdminService.getSystemHealth(request);

      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      logger.error('Failed to get system health', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve system health'
      });
    }
  }

  // ===== DATABASE OPERATIONS =====

  /**
   * POST /api/superadmin/system/database/operations
   * Execute database operation
   */
  async executeDatabaseOperation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const requestData: DatabaseOperationRequest = req.body;
      const performedBy = req.user!.userId;

      // Validate request
      if (!requestData.type || !Object.values(DatabaseOperationType).includes(requestData.type)) {
        res.status(400).json({
          success: false,
          error: 'Invalid database operation type'
        });
        return;
      }

      const operation = await this.systemAdminService.executeDatabaseOperation(
        requestData,
        performedBy
      );

      res.json({
        success: true,
        data: operation,
        message: 'Database operation initiated successfully'
      });
    } catch (error) {
      logger.error('Failed to execute database operation', { 
        error, 
        request: req.body,
        userId: req.user?.userId 
      });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute database operation'
      });
    }
  }

  /**
   * GET /api/superadmin/system/database/operations/:operationId
   * Get database operation status
   */
  async getDatabaseOperationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { operationId } = req.params;

      const operation = await this.systemAdminService.getDatabaseOperationStatus(operationId);

      if (!operation) {
        res.status(404).json({
          success: false,
          error: 'Database operation not found'
        });
        return;
      }

      res.json({
        success: true,
        data: operation
      });
    } catch (error) {
      logger.error('Failed to get database operation status', { 
        error, 
        operationId: req.params.operationId 
      });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve database operation status'
      });
    }
  }

  // ===== CACHE MANAGEMENT =====

  /**
   * GET /api/superadmin/system/cache/statistics
   * Get cache statistics
   */
  async getCacheStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.systemAdminService.getCacheStatistics();

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      logger.error('Failed to get cache statistics', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve cache statistics'
      });
    }
  }

  /**
   * POST /api/superadmin/system/cache/manage
   * Manage cache operations (clear, flush, rebuild, analyze)
   */
  async manageCacheOperation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const requestData: CacheManagementRequest = req.body;

      // Validate request
      if (!requestData.operation || !Object.values(CacheOperation).includes(requestData.operation)) {
        res.status(400).json({
          success: false,
          error: 'Invalid cache operation'
        });
        return;
      }

      if (requestData.target && !Object.values(CacheTarget).includes(requestData.target)) {
        res.status(400).json({
          success: false,
          error: 'Invalid cache target'
        });
        return;
      }

      const result = await this.systemAdminService.manageCacheOperation(requestData);

      res.json({
        success: true,
        data: result,
        message: result.message
      });
    } catch (error) {
      logger.error('Failed to manage cache operation', { 
        error, 
        request: req.body,
        userId: req.user?.userId 
      });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to manage cache operation'
      });
    }
  }

  // ===== MAINTENANCE MANAGEMENT =====

  /**
   * POST /api/superadmin/system/maintenance
   * Schedule maintenance window
   */
  async scheduleMaintenanceWindow(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const requestData: MaintenanceWindowRequest = req.body;
      const createdBy = req.user!.userId;

      // Validate request
      if (!requestData.title || !requestData.scheduledStart || !requestData.scheduledEnd) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: title, scheduledStart, scheduledEnd'
        });
        return;
      }

      // Validate dates
      const startDate = new Date(requestData.scheduledStart);
      const endDate = new Date(requestData.scheduledEnd);
      
      if (startDate >= endDate) {
        res.status(400).json({
          success: false,
          error: 'Scheduled start time must be before end time'
        });
        return;
      }

      if (startDate <= new Date()) {
        res.status(400).json({
          success: false,
          error: 'Scheduled start time must be in the future'
        });
        return;
      }

      const maintenanceWindow = await this.systemAdminService.scheduleMaintenanceWindow(
        requestData,
        createdBy
      );

      res.status(201).json({
        success: true,
        data: maintenanceWindow,
        message: 'Maintenance window scheduled successfully'
      });
    } catch (error) {
      logger.error('Failed to schedule maintenance window', { 
        error, 
        request: req.body,
        userId: req.user?.userId 
      });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to schedule maintenance window'
      });
    }
  }

  /**
   * GET /api/superadmin/system/maintenance
   * Get maintenance windows
   */
  async getMaintenanceWindows(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query;
      const status = query.status as MaintenanceStatus;
      const limit = query.limit ? parseInt(query.limit as string, 10) : 20;
      const offset = query.offset ? parseInt(query.offset as string, 10) : 0;

      // Validate status if provided
      if (status && !Object.values(MaintenanceStatus).includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid maintenance status'
        });
        return;
      }

      // Validate pagination parameters
      if (limit < 1 || limit > 100) {
        res.status(400).json({
          success: false,
          error: 'Limit must be between 1 and 100'
        });
        return;
      }

      if (offset < 0) {
        res.status(400).json({
          success: false,
          error: 'Offset must be non-negative'
        });
        return;
      }

      const maintenanceWindows = await this.systemAdminService.getMaintenanceWindows(
        status,
        limit,
        offset
      );

      res.json({
        success: true,
        data: maintenanceWindows,
        pagination: {
          limit,
          offset,
          total: maintenanceWindows.length
        }
      });
    } catch (error) {
      logger.error('Failed to get maintenance windows', { error, query: req.query });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve maintenance windows'
      });
    }
  }

  // ===== UTILITY ENDPOINTS =====

  /**
   * GET /api/superadmin/system/configuration/categories
   * Get available configuration categories
   */
  async getConfigurationCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = Object.values(ConfigurationCategory);

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      logger.error('Failed to get configuration categories', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve configuration categories'
      });
    }
  }

  /**
   * GET /api/superadmin/system/database/operation-types
   * Get available database operation types
   */
  async getDatabaseOperationTypes(req: Request, res: Response): Promise<void> {
    try {
      const operationTypes = Object.values(DatabaseOperationType);

      res.json({
        success: true,
        data: operationTypes
      });
    } catch (error) {
      logger.error('Failed to get database operation types', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve database operation types'
      });
    }
  }

  /**
   * GET /api/superadmin/system/cache/targets
   * Get available cache targets
   */
  async getCacheTargets(req: Request, res: Response): Promise<void> {
    try {
      const targets = Object.values(CacheTarget);

      res.json({
        success: true,
        data: targets
      });
    } catch (error) {
      logger.error('Failed to get cache targets', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve cache targets'
      });
    }
  }
}
