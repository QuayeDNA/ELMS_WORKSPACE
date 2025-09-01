import { Request, Response } from 'express';
import { institutionService } from '../services/institutionService';
import { CreateInstitutionRequest, UpdateInstitutionRequest, InstitutionQuery } from '../types/institution';

export const institutionController = {
  // Get all institutions with pagination and filtering
  async getInstitutions(req: Request, res: Response) {
    try {
      const query: InstitutionQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string || '',
        type: req.query.type as any,
        status: req.query.status as any,
        sortBy: req.query.sortBy as any || 'name',
        sortOrder: (req.query.sortOrder as string) === 'desc' ? 'desc' : 'asc'
      };

      const result = await institutionService.getInstitutions(query);
      res.json(result);
    } catch (error) {
      console.error('Error fetching institutions:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch institutions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get single institution by ID
  async getInstitutionById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid institution ID' 
        });
      }

      const institution = await institutionService.getInstitutionById(id);
      if (!institution) {
        return res.status(404).json({ 
          success: false, 
          message: 'Institution not found' 
        });
      }

      res.json({ success: true, data: institution });
    } catch (error) {
      console.error('Error fetching institution:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch institution',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Create new institution
  async createInstitution(req: Request, res: Response) {
    try {
      const institutionData: CreateInstitutionRequest = req.body;

      // Basic validation
      if (!institutionData.name || !institutionData.code) {
        return res.status(400).json({ 
          success: false, 
          message: 'Institution name and code are required' 
        });
      }

      const institution = await institutionService.createInstitution(institutionData);
      res.status(201).json({ 
        success: true, 
        message: 'Institution created successfully',
        data: institution 
      });
    } catch (error) {
      console.error('Error creating institution:', error);
      
      // Handle unique constraint violations
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        return res.status(409).json({ 
          success: false, 
          message: 'Institution code already exists' 
        });
      }

      res.status(500).json({ 
        success: false, 
        message: 'Failed to create institution',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Update institution
  async updateInstitution(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid institution ID' 
        });
      }

      const updateData: UpdateInstitutionRequest = req.body;
      const institution = await institutionService.updateInstitution(id, updateData);

      if (!institution) {
        return res.status(404).json({ 
          success: false, 
          message: 'Institution not found' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Institution updated successfully',
        data: institution 
      });
    } catch (error) {
      console.error('Error updating institution:', error);
      
      // Handle unique constraint violations
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        return res.status(409).json({ 
          success: false, 
          message: 'Institution code already exists' 
        });
      }

      res.status(500).json({ 
        success: false, 
        message: 'Failed to update institution',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Delete institution
  async deleteInstitution(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid institution ID' 
        });
      }

      const success = await institutionService.deleteInstitution(id);
      if (!success) {
        return res.status(404).json({ 
          success: false, 
          message: 'Institution not found' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Institution deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting institution:', error);
      
      // Handle foreign key constraints
      if (error instanceof Error && error.message.includes('Foreign key constraint')) {
        return res.status(409).json({ 
          success: false, 
          message: 'Cannot delete institution with existing users or faculties' 
        });
      }

      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete institution',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Create institution with admin user
  async createInstitutionWithAdmin(req: Request, res: Response) {
    try {
      const { institution, admin } = req.body;

      // Basic validation
      if (!institution || !admin) {
        return res.status(400).json({ 
          success: false, 
          message: 'Institution and admin data are required' 
        });
      }

      if (!institution.name || !institution.code) {
        return res.status(400).json({ 
          success: false, 
          message: 'Institution name and code are required' 
        });
      }

      if (!admin.firstName || !admin.lastName || !admin.email || !admin.password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Admin first name, last name, email, and password are required' 
        });
      }

      const result = await institutionService.createInstitutionWithAdmin({ institution, admin });
      res.status(201).json({ 
        success: true, 
        message: 'Institution and admin created successfully',
        data: result 
      });
    } catch (error) {
      console.error('Error creating institution with admin:', error);
      
      // Handle unique constraint violations
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        return res.status(409).json({ 
          success: false, 
          message: 'Institution code or admin email already exists' 
        });
      }

      res.status(500).json({ 
        success: false, 
        message: 'Failed to create institution with admin',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get institution analytics
  async getInstitutionAnalytics(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid institution ID' 
        });
      }

      const analytics = await institutionService.getInstitutionStats();
      res.json({ success: true, data: analytics });
    } catch (error) {
      console.error('Error fetching institution analytics:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch institution analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get overall analytics for all institutions
  async getOverallAnalytics(req: Request, res: Response) {
    try {
      const analytics = await institutionService.getInstitutionStats();
      res.json({ success: true, data: analytics });
    } catch (error) {
      console.error('Error fetching overall analytics:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch overall analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
