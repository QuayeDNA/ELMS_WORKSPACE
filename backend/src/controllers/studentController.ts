import { Request, Response } from 'express';
import { studentService } from '../services/studentService';
import { UserRole } from '../types/auth';

export const studentController = {
  // Get all students with pagination and filtering
  async getStudents(req: Request, res: Response) {
    try {
      const query = {
        programId: req.query.programId ? parseInt(req.query.programId as string) : undefined,
        departmentId: req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined,
        facultyId: req.query.facultyId ? parseInt(req.query.facultyId as string) : undefined,
        institutionId: req.query.institutionId ? parseInt(req.query.institutionId as string) : undefined,
        level: req.query.level ? parseInt(req.query.level as string) : undefined,
        semester: req.query.semester ? parseInt(req.query.semester as string) : undefined,
        academicYear: req.query.academicYear as string,
        enrollmentStatus: req.query.enrollmentStatus as any,
        academicStatus: req.query.academicStatus as any,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string || '',
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const result = await studentService.getStudents(query);
      res.json(result);
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch students',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get single student by ID
  async getStudentById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
      }

      const student = await studentService.getStudentById(id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      res.json({
        success: true,
        data: student
      });
    } catch (error) {
      console.error('Error fetching student:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch student',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get student by student ID
  async getStudentByStudentId(req: Request, res: Response) {
    try {
      const studentId = req.params.studentId;
      const student = await studentService.getStudentByStudentId(studentId);
      
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      res.json({
        success: true,
        data: student
      });
    } catch (error) {
      console.error('Error fetching student by student ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch student',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Create new student
  async createStudent(req: Request, res: Response) {
    try {
      const student = await studentService.createStudent(req.body);
      res.status(201).json({
        success: true,
        message: 'Student created successfully',
        data: student
      });
    } catch (error) {
      console.error('Error creating student:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create student',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Update student
  async updateStudent(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
      }

      const student = await studentService.updateStudent(id, req.body);
      res.json({
        success: true,
        message: 'Student updated successfully',
        data: student
      });
    } catch (error) {
      console.error('Error updating student:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update student',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Delete student
  async deleteStudent(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
      }

      await studentService.deleteStudent(id);
      res.json({
        success: true,
        message: 'Student deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete student',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Update student status
  async updateStudentStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { enrollmentStatus, academicStatus } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
      }

      const student = await studentService.updateStudentStatus(id, {
        enrollmentStatus,
        academicStatus
      });

      res.json({
        success: true,
        message: 'Student status updated successfully',
        data: student
      });
    } catch (error) {
      console.error('Error updating student status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update student status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Bulk import students
  async bulkImportStudents(req: Request, res: Response) {
    try {
      const { students } = req.body;
      
      if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid students data'
        });
      }

      const result = await studentService.bulkImportStudents(students);
      res.json({
        success: true,
        message: 'Students imported successfully',
        data: result
      });
    } catch (error) {
      console.error('Error importing students:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to import students',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get student statistics
  async getStudentStats(req: Request, res: Response) {
    try {
      const institutionId = req.query.institutionId ? parseInt(req.query.institutionId as string) : undefined;
      const facultyId = req.query.facultyId ? parseInt(req.query.facultyId as string) : undefined;
      const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined;

      const stats = await studentService.getStudentStats({
        institutionId,
        facultyId,
        departmentId
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching student stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch student statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
