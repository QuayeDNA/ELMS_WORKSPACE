import { Request, Response } from 'express';
import { programService } from '../services/programService';
import { CreateProgramRequest, UpdateProgramRequest, ProgramQuery } from '../types/program';

export const programController = {
  // Get all programs with pagination and filtering
  async getPrograms(req: Request, res: Response) {
    try {
      const query: ProgramQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string || '',
        departmentId: req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined,
        facultyId: req.query.facultyId ? parseInt(req.query.facultyId as string) : undefined,
        institutionId: req.query.institutionId ? parseInt(req.query.institutionId as string) : undefined,
        type: req.query.type as any,
        level: req.query.level as any,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        sortBy: req.query.sortBy as any || 'name',
        sortOrder: (req.query.sortOrder as string) === 'desc' ? 'desc' : 'asc'
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
      const programData: CreateProgramRequest = req.body;

      // Basic validation
      if (!programData.name || !programData.code || !programData.departmentId || !programData.type || !programData.level) {
        return res.status(400).json({ 
          success: false, 
          message: 'Program name, code, department, type, and level are required' 
        });
      }

      // Validate duration
      if (!programData.durationYears || programData.durationYears <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Valid program duration is required' 
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
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        return res.status(409).json({ 
          success: false, 
          message: 'Program code already exists in this department' 
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

      const updateData: UpdateProgramRequest = req.body;

      // Check if program exists
      const existingProgram = await programService.getProgramById(id);
      if (!existingProgram) {
        return res.status(404).json({ 
          success: false, 
          message: 'Program not found' 
        });
      }

      // Validate duration if provided
      if (updateData.durationYears !== undefined && updateData.durationYears <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Valid program duration is required' 
        });
      }

      const program = await programService.updateProgram(id, updateData);
      res.json({ 
        success: true, 
        message: 'Program updated successfully',
        data: program 
      });
    } catch (error) {
      console.error('Error updating program:', error);
      
      // Handle unique constraint violations
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        return res.status(409).json({ 
          success: false, 
          message: 'Program code already exists in this department' 
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

      // Check if program exists
      const existingProgram = await programService.getProgramById(id);
      if (!existingProgram) {
        return res.status(404).json({ 
          success: false, 
          message: 'Program not found' 
        });
      }

      const deleted = await programService.deleteProgram(id);
      if (!deleted) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot delete program. It may have associated records.' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Program deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting program:', error);
      
      // Handle foreign key constraint violations
      if (error instanceof Error && error.message.includes('constraint')) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot delete program. It has associated students or courses.' 
        });
      }

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

      const programs = await programService.getProgramsByDepartment(departmentId);
      res.json({ 
        success: true, 
        data: programs 
      });
    } catch (error) {
      console.error('Error fetching programs by department:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch programs',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get programs by faculty
  async getProgramsByFaculty(req: Request, res: Response) {
    try {
      const facultyId = parseInt(req.params.facultyId);
      if (isNaN(facultyId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid faculty ID' 
        });
      }

      const programs = await programService.getProgramsByFaculty(facultyId);
      res.json({ 
        success: true, 
        data: programs 
      });
    } catch (error) {
      console.error('Error fetching programs by faculty:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch programs',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get programs by institution
  async getProgramsByInstitution(req: Request, res: Response) {
    try {
      const institutionId = parseInt(req.params.institutionId);
      if (isNaN(institutionId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid institution ID' 
        });
      }

      const programs = await programService.getProgramsByInstitution(institutionId);
      res.json({ 
        success: true, 
        data: programs 
      });
    } catch (error) {
      console.error('Error fetching programs by institution:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch programs',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get program statistics
  async getProgramStats(req: Request, res: Response) {
    try {
      const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined;
      const facultyId = req.query.facultyId ? parseInt(req.query.facultyId as string) : undefined;
      const institutionId = req.query.institutionId ? parseInt(req.query.institutionId as string) : undefined;

      const stats = await programService.getProgramStats(departmentId, facultyId, institutionId);
      res.json({ 
        success: true, 
        data: stats 
      });
    } catch (error) {
      console.error('Error fetching program statistics:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch program statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
