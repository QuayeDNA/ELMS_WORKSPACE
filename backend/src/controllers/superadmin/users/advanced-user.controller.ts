/**
 * Advanced User Management Controller
 * 
 * Handles HTTP requests for advanced user management operations including
 * cross-institutional search, analytics, impersonation, and bulk operations
 */

import { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { AdvancedUserService } from '../../../services/superadmin/users/advanced-user.service';
import {
  UserSearchFilters,
  GetUsersRequest,
  GetUsersResponse,
  GetUserAnalyticsRequest,
  GetUserAnalyticsResponse,
  BulkOperationRequest,
  BulkOperationResponse,
  StartImpersonationRequest,
  UserRole,
  UserStatus,
  BulkOperationType,
  UserSortField
} from '../../../types/superadmin/users/user.types';

export class AdvancedUserController {
  constructor(private readonly advancedUserService: AdvancedUserService) {}

  /**
   * Get user statistics for dashboard
   */
  async getUserStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.advancedUserService.getUserStatistics();
      
      res.status(200).json({
        success: true,
        data: statistics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get user statistics',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Search users with advanced filtering
   */
  async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { page = 1, limit = 20, ...filterParams } = req.query as any;

      // Build filters from query parameters
      const filters: UserSearchFilters = {};
      
      if (filterParams.query) filters.query = filterParams.query;
      if (filterParams.institutionIds) filters.institutionIds = Array.isArray(filterParams.institutionIds) ? filterParams.institutionIds : [filterParams.institutionIds];
      if (filterParams.roles) filters.roles = Array.isArray(filterParams.roles) ? filterParams.roles : [filterParams.roles];
      if (filterParams.status) filters.status = Array.isArray(filterParams.status) ? filterParams.status : [filterParams.status];
      if (filterParams.emailVerified !== undefined) filters.emailVerified = filterParams.emailVerified === 'true';
      if (filterParams.hasProfileImage !== undefined) filters.hasProfileImage = filterParams.hasProfileImage === 'true';
      if (filterParams.sortBy) filters.sortBy = filterParams.sortBy;
      if (filterParams.sortOrder) filters.sortOrder = filterParams.sortOrder;

      // Date range filters
      if (filterParams.lastLoginStart && filterParams.lastLoginEnd) {
        filters.lastLoginRange = {
          start: new Date(filterParams.lastLoginStart),
          end: new Date(filterParams.lastLoginEnd)
        };
      }

      if (filterParams.createdStart && filterParams.createdEnd) {
        filters.createdRange = {
          start: new Date(filterParams.createdStart),
          end: new Date(filterParams.createdEnd)
        };
      }

      const result = await this.advancedUserService.searchUsers(
        filters,
        parseInt(page),
        parseInt(limit)
      );

      const response: GetUsersResponse = {
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to search users',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get comprehensive user analytics
   */
  async getUserAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { userId } = req.params;
      const { startDate, endDate, includeComparison = 'true' } = req.query as any;

      let dateRange;
      if (startDate && endDate) {
        dateRange = {
          start: new Date(startDate),
          end: new Date(endDate)
        };
      }

      const analytics = await this.advancedUserService.getUserAnalytics(
        userId,
        dateRange,
        includeComparison === 'true'
      );

      const response: GetUserAnalyticsResponse = {
        success: true,
        data: analytics,
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get user analytics',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Start user impersonation session
   */
  async startImpersonation(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const superAdminId = req.user?.id; // Assume auth middleware sets this
      if (!superAdminId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const impersonationRequest: StartImpersonationRequest = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';

      const token = await this.advancedUserService.startImpersonation(
        superAdminId,
        impersonationRequest,
        ipAddress,
        userAgent
      );

      res.status(200).json({
        success: true,
        data: token,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to start impersonation',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * End user impersonation session
   */
  async endImpersonation(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { sessionId } = req.params;
      const { reason } = req.body;

      await this.advancedUserService.endImpersonation(sessionId, reason);

      res.status(200).json({
        success: true,
        message: 'Impersonation session ended',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to end impersonation',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Perform bulk operations on users
   */
  async performBulkOperation(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const performedBy = req.user?.id; // Assume auth middleware sets this
      const performedByEmail = req.user?.email;
      
      if (!performedBy || !performedByEmail) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { operation, dryRun = false } = req.body as BulkOperationRequest;

      const result = await this.advancedUserService.performBulkOperation(
        operation,
        performedBy,
        performedByEmail,
        dryRun
      );

      const response: BulkOperationResponse = {
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to perform bulk operation',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get bulk operation status
   */
  async getBulkOperationStatus(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { operationId } = req.params;

      // TODO: Implement getBulkOperationStatus in service
      res.status(501).json({
        success: false,
        message: 'Not implemented yet',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get bulk operation status',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get impersonation sessions history
   */
  async getImpersonationHistory(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query as any;

      // TODO: Implement getImpersonationHistory in service
      res.status(501).json({
        success: false,
        message: 'Not implemented yet',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get impersonation history',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get user activity history
   */
  async getUserActivityHistory(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { userId } = req.params;
      const { page = 1, limit = 50 } = req.query as any;

      // TODO: Implement getUserActivityHistory in service
      res.status(501).json({
        success: false,
        message: 'Not implemented yet',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get user activity history',
        timestamp: new Date().toISOString()
      });
    }
  }
}

// Validation rules for advanced user management endpoints
export const advancedUserValidationRules = {
  searchUsers: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('query').optional().isString().trim().isLength({ min: 1 }).withMessage('Query must be a non-empty string'),
    query('institutionIds').optional().custom((value) => {
      if (typeof value === 'string') return true;
      if (Array.isArray(value) && value.every(v => typeof v === 'string')) return true;
      throw new Error('Institution IDs must be string or array of strings');
    }),
    query('roles').optional().custom((value) => {
      const validRoles = Object.values(UserRole);
      if (typeof value === 'string' && validRoles.includes(value as UserRole)) return true;
      if (Array.isArray(value) && value.every(v => validRoles.includes(v as UserRole))) return true;
      throw new Error('Invalid user roles');
    }),
    query('status').optional().custom((value) => {
      const validStatuses = Object.values(UserStatus);
      if (typeof value === 'string' && validStatuses.includes(value as UserStatus)) return true;
      if (Array.isArray(value) && value.every(v => validStatuses.includes(v as UserStatus))) return true;
      throw new Error('Invalid user statuses');
    }),
    query('emailVerified').optional().isBoolean().withMessage('Email verified must be a boolean'),
    query('hasProfileImage').optional().isBoolean().withMessage('Has profile image must be a boolean'),
    query('sortBy').optional().isIn(Object.values(UserSortField)).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
    query('lastLoginStart').optional().isISO8601().withMessage('Last login start must be valid ISO date'),
    query('lastLoginEnd').optional().isISO8601().withMessage('Last login end must be valid ISO date'),
    query('createdStart').optional().isISO8601().withMessage('Created start must be valid ISO date'),
    query('createdEnd').optional().isISO8601().withMessage('Created end must be valid ISO date')
  ],

  getUserAnalytics: [
    param('userId').isString().trim().isLength({ min: 1 }).withMessage('User ID is required'),
    query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
    query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
    query('includeComparison').optional().isBoolean().withMessage('Include comparison must be a boolean')
  ],

  startImpersonation: [
    body('targetUserId').isString().trim().isLength({ min: 1 }).withMessage('Target user ID is required'),
    body('reason').isString().trim().isLength({ min: 10, max: 500 }).withMessage('Reason must be 10-500 characters'),
    body('duration').optional().isInt({ min: 5, max: 480 }).withMessage('Duration must be between 5 and 480 minutes')
  ],

  endImpersonation: [
    param('sessionId').isString().trim().isLength({ min: 1 }).withMessage('Session ID is required'),
    body('reason').optional().isString().trim().isLength({ min: 1, max: 500 }).withMessage('Reason must be 1-500 characters')
  ],

  performBulkOperation: [
    body('operation').isObject().withMessage('Operation must be an object'),
    body('operation.operation').isIn(Object.values(BulkOperationType)).withMessage('Invalid operation type'),
    body('operation.userIds').isArray({ min: 1 }).withMessage('User IDs array is required'),
    body('operation.userIds.*').isString().trim().isLength({ min: 1 }).withMessage('Each user ID must be valid'),
    body('operation.reason').isString().trim().isLength({ min: 10, max: 500 }).withMessage('Reason is required and must be 10-500 characters'),
    body('operation.data').optional().isObject().withMessage('Data must be an object'),
    body('operation.scheduledFor').optional().isISO8601().withMessage('Scheduled for must be valid ISO date'),
    body('operation.notifyUsers').optional().isBoolean().withMessage('Notify users must be a boolean'),
    body('dryRun').optional().isBoolean().withMessage('Dry run must be a boolean')
  ],

  getBulkOperationStatus: [
    param('operationId').isString().trim().isLength({ min: 1 }).withMessage('Operation ID is required')
  ],

  getUserActivityHistory: [
    param('userId').isString().trim().isLength({ min: 1 }).withMessage('User ID is required'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('Limit must be between 1 and 200')
  ],

  getImpersonationHistory: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ]
};
