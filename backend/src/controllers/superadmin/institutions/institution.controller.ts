/**
 * Institution Management Controller
 * 
 * Handles HTTP requests for institution management operations including
 * CRUD operations, configuration management, status changes, and analytics
 */

import { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { InstitutionService } from '../../../services/superadmin/institutions/institution.service';
import {
  CreateInstitutionRequest,
  UpdateInstitutionRequest,
  InstitutionFilters,
  InstitutionConfiguration,
  InstitutionType,
  InstitutionCategory,
  InstitutionStatus
} from '../../../types/superadmin/institutions/institution.types';

export class InstitutionController {
  constructor(private readonly institutionService: InstitutionService) {}

  /**
   * Get institution statistics
   */
  async getInstitutionStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.institutionService.getInstitutionStats();
      
      res.status(200).json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get institution statistics',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get institutions with pagination and filters
   */
  async getInstitutions(req: Request, res: Response): Promise<void> {
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

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const filters: InstitutionFilters = {
        search: req.query.search as string,
        type: req.query.type ? (req.query.type as string).split(',') as InstitutionType[] : undefined,
        category: req.query.category ? (req.query.category as string).split(',') as InstitutionCategory[] : undefined,
        status: req.query.status ? (req.query.status as string).split(',') as InstitutionStatus[] : undefined
      };

      const result = await this.institutionService.getAllInstitutions(page, limit, filters);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get institutions',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get institution by ID
   */
  async getInstitutionById(req: Request, res: Response): Promise<void> {
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

      const { id } = req.params;
      const institution = await this.institutionService.getInstitutionById(id);
      
      res.status(200).json({
        success: true,
        data: institution,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Institution not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get institution',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Create new institution
   */
  async createInstitution(req: Request, res: Response): Promise<void> {
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

      const createdBy = req.user?.id || 'system';
      const institutionData = req.body as CreateInstitutionRequest;
      
      const institution = await this.institutionService.createInstitution(institutionData, createdBy);
      
      res.status(201).json({
        success: true,
        data: institution,
        message: 'Institution created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Institution code already exists' ? 409 : 500;
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create institution',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update institution
   */
  async updateInstitution(req: Request, res: Response): Promise<void> {
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

      const { id } = req.params;
      const updatedBy = req.user?.id || 'system';
      const updateData = req.body as UpdateInstitutionRequest;
      
      const institution = await this.institutionService.updateInstitution(id, updateData, updatedBy);
      
      res.status(200).json({
        success: true,
        data: institution,
        message: 'Institution updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Institution not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update institution',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Delete institution (soft delete)
   */
  async deleteInstitution(req: Request, res: Response): Promise<void> {
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

      const { id } = req.params;
      const deletedBy = req.user?.id || 'system';
      
      await this.institutionService.deleteInstitution(id, deletedBy);
      
      res.status(200).json({
        success: true,
        message: 'Institution deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Institution not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete institution',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get institution configuration
   */
  async getInstitutionConfiguration(req: Request, res: Response): Promise<void> {
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

      const { id } = req.params;
      const configuration = await this.institutionService.getInstitutionConfiguration(id);
      
      res.status(200).json({
        success: true,
        data: configuration,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Institution not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get institution configuration',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update institution configuration
   */
  async updateInstitutionConfiguration(req: Request, res: Response): Promise<void> {
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

      const { id } = req.params;
      const updatedBy = req.user?.id || 'system';
      const configUpdate = req.body as Partial<InstitutionConfiguration>;
      
      const institution = await this.institutionService.updateInstitutionConfiguration(id, configUpdate, updatedBy);
      
      res.status(200).json({
        success: true,
        data: institution,
        message: 'Institution configuration updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Institution not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update institution configuration',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get institution analytics
   */
  async getInstitutionAnalytics(req: Request, res: Response): Promise<void> {
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

      const { id } = req.params;
      const analytics = await this.institutionService.getInstitutionAnalytics(id);
      
      res.status(200).json({
        success: true,
        data: analytics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get institution analytics',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Change institution status
   */
  async changeInstitutionStatus(req: Request, res: Response): Promise<void> {
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

      const { id } = req.params;
      const { status, reason } = req.body;
      const updatedBy = req.user?.id || 'system';
      
      const institution = await this.institutionService.changeInstitutionStatus(id, status, updatedBy, reason);
      
      res.status(200).json({
        success: true,
        data: institution,
        message: `Institution status changed to ${status} successfully`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Institution not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to change institution status',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Perform bulk operations on institutions
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

      const { institutionIds, operation, data, reason } = req.body;
      const performedBy = (req as any).user?.id || 'system';

      const result = await this.institutionService.performBulkOperation(
        institutionIds,
        operation,
        data,
        performedBy,
        reason
      );

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to perform bulk operation',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Toggle institution feature
   */
  async toggleInstitutionFeature(req: Request, res: Response): Promise<void> {
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

      const { id } = req.params;
      const { feature, enabled, reason } = req.body;
      const updatedBy = (req as any).user?.id || 'system';

      const institution = await this.institutionService.toggleInstitutionFeature(
        id,
        feature,
        enabled,
        updatedBy,
        reason
      );

      res.status(200).json({
        success: true,
        data: institution,
        message: `Feature ${feature} ${enabled ? 'enabled' : 'disabled'} successfully`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Institution not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to toggle institution feature',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update institution integrations
   */
  async updateInstitutionIntegrations(req: Request, res: Response): Promise<void> {
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

      const { id } = req.params;
      const integrations = req.body;
      const updatedBy = (req as any).user?.id || 'system';

      const institution = await this.institutionService.updateInstitutionIntegrations(
        id,
        integrations,
        updatedBy
      );

      res.status(200).json({
        success: true,
        data: institution,
        message: 'Institution integrations updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Institution not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update institution integrations',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get institution usage statistics
   */
  async getInstitutionUsageStats(req: Request, res: Response): Promise<void> {
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

      const { id } = req.params;
      const usageStats = await this.institutionService.getInstitutionUsageStats(id);

      res.status(200).json({
        success: true,
        data: usageStats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Institution not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve institution usage statistics',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get institution billing information
   */
  async getInstitutionBilling(req: Request, res: Response): Promise<void> {
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

      const { id } = req.params;
      const billing = await this.institutionService.getInstitutionBilling(id);

      res.status(200).json({
        success: true,
        data: billing,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Institution not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve institution billing information',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Generate billing report
   */
  async generateBillingReport(req: Request, res: Response): Promise<void> {
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

      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const end = endDate ? new Date(endDate as string) : new Date();

      const report = await this.institutionService.generateBillingReport(id, start, end);

      res.status(200).json({
        success: true,
        data: report,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Institution not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate billing report',
        timestamp: new Date().toISOString()
      });
    }
  }
}

// Validation rules
export const institutionValidationRules = {
  getInstitutions: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().trim().isLength({ min: 1 }).withMessage('Search must be a non-empty string'),
    query('type').optional().isString().withMessage('Type must be a string'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('status').optional().isString().withMessage('Status must be a string')
  ],

  getInstitutionById: [
    param('id').isString().trim().isLength({ min: 1 }).withMessage('Institution ID is required')
  ],

  createInstitution: [
    body('name').isString().trim().isLength({ min: 2, max: 255 }).withMessage('Name must be 2-255 characters'),
    body('code').isString().trim().isLength({ min: 2, max: 50 }).withMessage('Code must be 2-50 characters'),
    body('shortName').optional().isString().trim().isLength({ max: 50 }).withMessage('Short name must be max 50 characters'),
    body('type').isIn(Object.values(InstitutionType)).withMessage('Invalid institution type'),
    body('category').isIn(Object.values(InstitutionCategory)).withMessage('Invalid institution category'),
    body('address').isObject().withMessage('Address must be an object'),
    body('address.street').isString().trim().isLength({ min: 1 }).withMessage('Street address is required'),
    body('address.city').isString().trim().isLength({ min: 1 }).withMessage('City is required'),
    body('address.region').isString().trim().isLength({ min: 1 }).withMessage('Region is required'),
    body('address.country').isString().trim().isLength({ min: 1 }).withMessage('Country is required'),
    body('contactInfo').isObject().withMessage('Contact info must be an object'),
    body('contactInfo.primaryEmail').isEmail().withMessage('Primary email must be valid'),
    body('contactInfo.primaryPhone').isString().trim().isLength({ min: 1 }).withMessage('Primary phone is required'),
    body('establishedYear').optional().isInt({ min: 1800, max: new Date().getFullYear() }).withMessage('Invalid established year'),
    body('subscriptionPlan').isIn(['basic', 'professional', 'enterprise', 'custom']).withMessage('Invalid subscription plan')
  ],

  updateInstitution: [
    param('id').isString().trim().isLength({ min: 1 }).withMessage('Institution ID is required'),
    body('name').optional().isString().trim().isLength({ min: 2, max: 255 }).withMessage('Name must be 2-255 characters'),
    body('shortName').optional().isString().trim().isLength({ max: 50 }).withMessage('Short name must be max 50 characters'),
    body('type').optional().isIn(Object.values(InstitutionType)).withMessage('Invalid institution type'),
    body('category').optional().isIn(Object.values(InstitutionCategory)).withMessage('Invalid institution category'),
    body('establishedYear').optional().isInt({ min: 1800, max: new Date().getFullYear() }).withMessage('Invalid established year')
  ],

  deleteInstitution: [
    param('id').isString().trim().isLength({ min: 1 }).withMessage('Institution ID is required')
  ],

  getInstitutionConfiguration: [
    param('id').isString().trim().isLength({ min: 1 }).withMessage('Institution ID is required')
  ],

  updateInstitutionConfiguration: [
    param('id').isString().trim().isLength({ min: 1 }).withMessage('Institution ID is required'),
    body('branding').optional().isObject().withMessage('Branding must be an object'),
    body('features').optional().isObject().withMessage('Features must be an object'),
    body('limits').optional().isObject().withMessage('Limits must be an object'),
    body('integrations').optional().isObject().withMessage('Integrations must be an object')
  ],

  getInstitutionAnalytics: [
    param('id').isString().trim().isLength({ min: 1 }).withMessage('Institution ID is required')
  ],

  changeInstitutionStatus: [
    param('id').isString().trim().isLength({ min: 1 }).withMessage('Institution ID is required'),
    body('status').isIn(Object.values(InstitutionStatus)).withMessage('Invalid status'),
    body('reason').optional().isString().trim().isLength({ min: 1, max: 500 }).withMessage('Reason must be 1-500 characters')
  ],

  performBulkOperation: [
    body('institutionIds').isArray({ min: 1 }).withMessage('Institution IDs array is required'),
    body('institutionIds.*').isString().trim().isLength({ min: 1 }).withMessage('Each institution ID must be valid'),
    body('operation').isIn(['activate', 'suspend', 'delete', 'update_subscription']).withMessage('Invalid operation'),
    body('reason').isString().trim().isLength({ min: 1, max: 500 }).withMessage('Reason is required and must be 1-500 characters'),
    body('data').optional().isObject().withMessage('Data must be an object')
  ],

  toggleInstitutionFeature: [
    param('id').isString().trim().isLength({ min: 1 }).withMessage('Institution ID is required'),
    body('feature').isString().trim().isLength({ min: 1 }).withMessage('Feature name is required'),
    body('enabled').isBoolean().withMessage('Enabled must be a boolean'),
    body('reason').optional().isString().trim().isLength({ min: 1, max: 500 }).withMessage('Reason must be 1-500 characters')
  ],

  updateInstitutionIntegrations: [
    param('id').isString().trim().isLength({ min: 1 }).withMessage('Institution ID is required'),
    body('sso').optional().isObject().withMessage('SSO config must be an object'),
    body('lms').optional().isObject().withMessage('LMS config must be an object'),
    body('studentInfoSystem').optional().isObject().withMessage('SIS config must be an object')
  ],

  getInstitutionUsageStats: [
    param('id').isString().trim().isLength({ min: 1 }).withMessage('Institution ID is required')
  ],

  getInstitutionBilling: [
    param('id').isString().trim().isLength({ min: 1 }).withMessage('Institution ID is required')
  ],

  generateBillingReport: [
    param('id').isString().trim().isLength({ min: 1 }).withMessage('Institution ID is required'),
    query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
    query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date')
  ]
};
