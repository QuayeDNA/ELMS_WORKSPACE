import { Request, Response } from 'express';
import { programService } from '../services/programService';
import { UserRole } from '../types/auth';

export const programController = {
  // Get all programs with pagination and filtering
  async getPrograms(req: Request, res: Response) {
    try {
      const query = {
        departmentId: req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined,
        facultyId: req.query.facultyId ? parseInt(req.query.facultyId as string) : undefined,
        institutionId: req.query.institutionId ? parseInt(req.query.institutionId as string) : undefined,
        type: req.query.type as any,
        level: req.query.level as any,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string || '',
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const result = await programService.getPrograms(query);
      res.json(result);
    } catch (error) {
      console.error('Error fetching programs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch programs',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get single program by ID
  async getProgramById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid program ID'
        });
      }

      const program = await programService.getProgramById(id);
      if (!program) {
        return res.status(404).json({
          success: false,
          message: 'Program not found'
        });
      }

      res.json({ success: true, data: program });
    } catch (error) {
      console.error('Error fetching program:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch program',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Create new program
  async createProgram(req: Request, res: Response) {
    try {
      const programData = {
        name: req.body.name,
        code: req.body.code,
        departmentId: parseInt(req.body.departmentId),
        type: req.body.type,
        level: req.body.level,
        durationYears: parseFloat(req.body.durationYears),
        creditHours: req.body.creditHours ? parseInt(req.body.creditHours) : undefined,
        description: req.body.description,
        admissionRequirements: req.body.admissionRequirements,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true
      };

      // Basic validation
      if (!programData.name || !programData.code || !programData.departmentId || !programData.type || !programData.level) {
        return res.status(400).json({
          success: false,
          message: 'Name, code, department ID, type, and level are required'
        });
      }

      const program = await programService.createProgram(programData);
      res.status(201).json({
        success: true,
        message: 'Program created successfully',
        data: program
      });
    } catch (error) {
      console.error('Error creating program:', error);

      // Handle unique constraint violations
      if (error instanceof Error && error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create program',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Update program
  async updateProgram(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid program ID'
        });
      }

      const updateData = {
        name: req.body.name,
        code: req.body.code,
        type: req.body.type,
        level: req.body.level,
        durationYears: req.body.durationYears ? parseFloat(req.body.durationYears) : undefined,
        creditHours: req.body.creditHours ? parseInt(req.body.creditHours) : undefined,
        description: req.body.description,
        admissionRequirements: req.body.admissionRequirements,
        isActive: req.body.isActive
      };

      const program = await programService.updateProgram(id, updateData);
      if (!program) {
        return res.status(404).json({
          success: false,
          message: 'Program not found'
        });
      }

      res.json({
        success: true,
        message: 'Program updated successfully',
        data: program
      });
    } catch (error) {
      console.error('Error updating program:', error);

      // Handle unique constraint violations
      if (error instanceof Error && error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update program',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Delete program
  async deleteProgram(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid program ID'
        });
      }

      const success = await programService.deleteProgram(id);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Program not found'
        });
      }

      res.json({
        success: true,
        message: 'Program deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting program:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete program',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get programs by department
  async getProgramsByDepartment(req: Request, res: Response) {
    try {
      const departmentId = parseInt(req.params.departmentId);
      if (isNaN(departmentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid department ID'
        });
      }

      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string || '',
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined
      };

      const result = await programService.getProgramsByDepartment(departmentId, query);
      res.json(result);
    } catch (error) {
      console.error('Error fetching programs by department:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch programs',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
