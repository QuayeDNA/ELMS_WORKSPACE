import { Request, Response } from 'express';
import { academicPeriodService } from '../services/academicPeriodService';
import { UserRole } from '../types/auth';

export const academicPeriodController = {
  // ========================================
  // ACADEMIC YEAR ENDPOINTS
  // ========================================

  // Get all academic years with pagination and filtering
  async getAcademicYears(req: Request, res: Response) {
    try {
      const query = {
        institutionId: req.query.institutionId ? parseInt(req.query.institutionId as string) : undefined,
        isCurrent: req.query.isCurrent ? req.query.isCurrent === 'true' : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string || '',
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const result = await academicPeriodService.getAcademicYears(query);
      res.json(result);
    } catch (error) {
      console.error('Error fetching academic years:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch academic years',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get single academic year by ID
  async getAcademicYearById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid academic year ID'
        });
      }

      const academicYear = await academicPeriodService.getAcademicYearById(id);
      if (!academicYear) {
        return res.status(404).json({
          success: false,
          message: 'Academic year not found'
        });
      }

      res.json({
        success: true,
        data: academicYear
      });
    } catch (error) {
      console.error('Error fetching academic year:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch academic year',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get current academic year
  async getCurrentAcademicYear(req: Request, res: Response) {
    try {
      const institutionId = req.query.institutionId ? parseInt(req.query.institutionId as string) : undefined;
      const academicYear = await academicPeriodService.getCurrentAcademicYear(institutionId);
      
      if (!academicYear) {
        return res.status(404).json({
          success: false,
          message: 'No current academic year found'
        });
      }

      res.json({
        success: true,
        data: academicYear
      });
    } catch (error) {
      console.error('Error fetching current academic year:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch current academic year',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Create new academic year
  async createAcademicYear(req: Request, res: Response) {
    try {
      const academicYear = await academicPeriodService.createAcademicYear(req.body);
      res.status(201).json({
        success: true,
        message: 'Academic year created successfully',
        data: academicYear
      });
    } catch (error) {
      console.error('Error creating academic year:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create academic year',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Update academic year
  async updateAcademicYear(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid academic year ID'
        });
      }

      const academicYear = await academicPeriodService.updateAcademicYear(id, req.body);
      res.json({
        success: true,
        message: 'Academic year updated successfully',
        data: academicYear
      });
    } catch (error) {
      console.error('Error updating academic year:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update academic year',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Delete academic year
  async deleteAcademicYear(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid academic year ID'
        });
      }

      await academicPeriodService.deleteAcademicYear(id);
      res.json({
        success: true,
        message: 'Academic year deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting academic year:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete academic year',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Set current academic year
  async setCurrentAcademicYear(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid academic year ID'
        });
      }

      const academicYear = await academicPeriodService.setCurrentAcademicYear(id);
      res.json({
        success: true,
        message: 'Current academic year set successfully',
        data: academicYear
      });
    } catch (error) {
      console.error('Error setting current academic year:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to set current academic year',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // ========================================
  // SEMESTER ENDPOINTS
  // ========================================

  // Get all semesters with pagination and filtering
  async getSemesters(req: Request, res: Response) {
    try {
      const query = {
        academicYearId: req.query.academicYearId ? parseInt(req.query.academicYearId as string) : undefined,
        isCurrent: req.query.isCurrent ? req.query.isCurrent === 'true' : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string || '',
        sortBy: req.query.sortBy as string || 'semesterNumber',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc'
      };

      const result = await academicPeriodService.getSemesters(query);
      res.json(result);
    } catch (error) {
      console.error('Error fetching semesters:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch semesters',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get single semester by ID
  async getSemesterById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid semester ID'
        });
      }

      const semester = await academicPeriodService.getSemesterById(id);
      if (!semester) {
        return res.status(404).json({
          success: false,
          message: 'Semester not found'
        });
      }

      res.json({
        success: true,
        data: semester
      });
    } catch (error) {
      console.error('Error fetching semester:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch semester',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get current semester
  async getCurrentSemester(req: Request, res: Response) {
    try {
      const academicYearId = req.query.academicYearId ? parseInt(req.query.academicYearId as string) : undefined;
      const semester = await academicPeriodService.getCurrentSemester(academicYearId);
      
      if (!semester) {
        return res.status(404).json({
          success: false,
          message: 'No current semester found'
        });
      }

      res.json({
        success: true,
        data: semester
      });
    } catch (error) {
      console.error('Error fetching current semester:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch current semester',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Create new semester
  async createSemester(req: Request, res: Response) {
    try {
      const semester = await academicPeriodService.createSemester(req.body);
      res.status(201).json({
        success: true,
        message: 'Semester created successfully',
        data: semester
      });
    } catch (error) {
      console.error('Error creating semester:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create semester',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Update semester
  async updateSemester(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid semester ID'
        });
      }

      const semester = await academicPeriodService.updateSemester(id, req.body);
      res.json({
        success: true,
        message: 'Semester updated successfully',
        data: semester
      });
    } catch (error) {
      console.error('Error updating semester:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update semester',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Delete semester
  async deleteSemester(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid semester ID'
        });
      }

      await academicPeriodService.deleteSemester(id);
      res.json({
        success: true,
        message: 'Semester deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting semester:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete semester',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Set current semester
  async setCurrentSemester(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid semester ID'
        });
      }

      const semester = await academicPeriodService.setCurrentSemester(id);
      res.json({
        success: true,
        message: 'Current semester set successfully',
        data: semester
      });
    } catch (error) {
      console.error('Error setting current semester:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to set current semester',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get academic period statistics
  async getAcademicPeriodStats(req: Request, res: Response) {
    try {
      const institutionId = req.query.institutionId ? parseInt(req.query.institutionId as string) : undefined;

      const stats = await academicPeriodService.getAcademicPeriodStats({ institutionId });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching academic period stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch academic period statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
