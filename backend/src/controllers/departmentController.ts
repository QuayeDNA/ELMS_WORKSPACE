import { Request, Response } from 'express';
import { departmentService } from '../services/departmentService';
import { CreateDepartmentRequest, UpdateDepartmentRequest, DepartmentQuery } from '../types/department';

export const departmentController = {
  // Get all departments with pagination and filtering
  async getDepartments(req: Request, res: Response) {
    try {
      const query: DepartmentQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string || '',
        facultyId: req.query.facultyId ? parseInt(req.query.facultyId as string) : undefined,
        institutionId: req.query.institutionId ? parseInt(req.query.institutionId as string) : undefined,
        type: req.query.type as string,
        sortBy: req.query.sortBy as any || 'name',
        sortOrder: (req.query.sortOrder as string) === 'desc' ? 'desc' : 'asc'
      };

      const result = await departmentService.getDepartments(query);
      res.json(result);
    } catch (error) {
      console.error('Error fetching departments:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch departments',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get single department by ID
  async getDepartmentById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid department ID' 
        });
      }

      const department = await departmentService.getDepartmentById(id);
      if (!department) {
        return res.status(404).json({ 
          success: false, 
          message: 'Department not found' 
        });
      }

      res.json({ success: true, data: department });
    } catch (error) {
      console.error('Error fetching department:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch department',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Create new department
  async createDepartment(req: Request, res: Response) {
    try {
      const departmentData: CreateDepartmentRequest = req.body;

      // Basic validation
      if (!departmentData.name || !departmentData.code || !departmentData.facultyId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Department name, code, and faculty are required' 
        });
      }

      const department = await departmentService.createDepartment(departmentData);
      res.status(201).json({ 
        success: true, 
        message: 'Department created successfully',
        data: department 
      });
    } catch (error) {
      console.error('Error creating department:', error);
      
      // Handle unique constraint violations
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        return res.status(409).json({ 
          success: false, 
          message: 'Department code already exists in this faculty' 
        });
      }

      res.status(500).json({ 
        success: false, 
        message: 'Failed to create department',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Update department
  async updateDepartment(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid department ID' 
        });
      }

      const updateData: UpdateDepartmentRequest = req.body;

      // Check if department exists
      const existingDepartment = await departmentService.getDepartmentById(id);
      if (!existingDepartment) {
        return res.status(404).json({ 
          success: false, 
          message: 'Department not found' 
        });
      }

      const department = await departmentService.updateDepartment(id, updateData);
      res.json({ 
        success: true, 
        message: 'Department updated successfully',
        data: department 
      });
    } catch (error) {
      console.error('Error updating department:', error);
      
      // Handle unique constraint violations
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        return res.status(409).json({ 
          success: false, 
          message: 'Department code already exists in this faculty' 
        });
      }

      res.status(500).json({ 
        success: false, 
        message: 'Failed to update department',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Delete department
  async deleteDepartment(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid department ID' 
        });
      }

      // Check if department exists
      const existingDepartment = await departmentService.getDepartmentById(id);
      if (!existingDepartment) {
        return res.status(404).json({ 
          success: false, 
          message: 'Department not found' 
        });
      }

      const deleted = await departmentService.deleteDepartment(id);
      if (!deleted) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot delete department. It may have associated records.' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Department deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting department:', error);
      
      // Handle foreign key constraint violations
      if (error instanceof Error && error.message.includes('constraint')) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot delete department. It has associated programs, courses, or users.' 
        });
      }

      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete department',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get departments by faculty
  async getDepartmentsByFaculty(req: Request, res: Response) {
    try {
      const facultyId = parseInt(req.params.facultyId);
      if (isNaN(facultyId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid faculty ID' 
        });
      }

      const departments = await departmentService.getDepartmentsByFaculty(facultyId);
      res.json({ 
        success: true, 
        data: departments 
      });
    } catch (error) {
      console.error('Error fetching departments by faculty:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch departments',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get departments by institution
  async getDepartmentsByInstitution(req: Request, res: Response) {
    try {
      const institutionId = parseInt(req.params.institutionId);
      if (isNaN(institutionId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid institution ID' 
        });
      }

      const departments = await departmentService.getDepartmentsByInstitution(institutionId);
      res.json({ 
        success: true, 
        data: departments 
      });
    } catch (error) {
      console.error('Error fetching departments by institution:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch departments',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get department statistics
  async getDepartmentStats(req: Request, res: Response) {
    try {
      const facultyId = req.query.facultyId ? parseInt(req.query.facultyId as string) : undefined;
      const institutionId = req.query.institutionId ? parseInt(req.query.institutionId as string) : undefined;

      const stats = await departmentService.getDepartmentStats(facultyId, institutionId);
      res.json({ 
        success: true, 
        data: stats 
      });
    } catch (error) {
      console.error('Error fetching department statistics:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch department statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
