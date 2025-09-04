import { Request, Response } from 'express';
import { departmentService } from '../services/departmentService';
import { UserRole } from '../types/auth';

export const departmentController = {
  // Get all departments with pagination and filtering
  async getDepartments(req: Request, res: Response) {
    try {
      const query = {
        facultyId: req.query.facultyId ? parseInt(req.query.facultyId as string) : undefined,
        institutionId: req.query.institutionId ? parseInt(req.query.institutionId as string) : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string || '',
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
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
      const departmentData = {
        name: req.body.name,
        code: req.body.code,
        facultyId: parseInt(req.body.facultyId),
        type: req.body.type || 'department',
        description: req.body.description,
        officeLocation: req.body.officeLocation,
        contactInfo: req.body.contactInfo
      };

      // Basic validation
      if (!departmentData.name || !departmentData.code || !departmentData.facultyId) {
        return res.status(400).json({
          success: false,
          message: 'Name, code, and faculty ID are required'
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
      if (error instanceof Error && error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
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

      const updateData = {
        name: req.body.name,
        code: req.body.code,
        type: req.body.type,
        description: req.body.description,
        officeLocation: req.body.officeLocation,
        contactInfo: req.body.contactInfo
      };

      const department = await departmentService.updateDepartment(id, updateData);
      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      res.json({
        success: true,
        message: 'Department updated successfully',
        data: department
      });
    } catch (error) {
      console.error('Error updating department:', error);

      // Handle unique constraint violations
      if (error instanceof Error && error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
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

      const success = await departmentService.deleteDepartment(id);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      res.json({
        success: true,
        message: 'Department deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting department:', error);
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

      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string || ''
      };

      const result = await departmentService.getDepartmentsByFaculty(facultyId, query);
      res.json(result);
    } catch (error) {
      console.error('Error fetching departments by faculty:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch departments',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
