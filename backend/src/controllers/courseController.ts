import { Request, Response } from 'express';
import { courseService } from '../services/courseService';
import { UserRole } from '../types/auth';
import { CourseByProgramQuery } from '../types/course';

export const courseController = {
  // Get all courses with pagination and filtering
  async getCourses(req: Request, res: Response) {
    try {
      const query = {
        departmentId: req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined,
        facultyId: req.query.facultyId ? parseInt(req.query.facultyId as string) : undefined,
        institutionId: req.query.institutionId ? parseInt(req.query.institutionId as string) : undefined,
        level: req.query.level ? parseInt(req.query.level as string) : undefined,
        courseType: req.query.courseType as any,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string || '',
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const result = await courseService.getCourses(query);
      res.json(result);
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch courses',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get single course by ID
  async getCourseById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid course ID'
        });
      }

      const course = await courseService.getCourseById(id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      res.json({ success: true, data: course });
    } catch (error) {
      console.error('Error fetching course:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Create new course
  async createCourse(req: Request, res: Response) {
    try {
      const courseData = {
        name: req.body.name,
        code: req.body.code,
        departmentId: parseInt(req.body.departmentId),
        level: parseInt(req.body.level),
        courseType: req.body.courseType,
        creditHours: parseInt(req.body.creditHours) || 3,
        contactHours: req.body.contactHours ? parseInt(req.body.contactHours) : undefined,
        description: req.body.description,
        learningOutcomes: req.body.learningOutcomes,
        syllabus: req.body.syllabus,
        assessmentMethods: req.body.assessmentMethods,
        prerequisites: req.body.prerequisites,
        corequisites: req.body.corequisites,
        recommendedBooks: req.body.recommendedBooks,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true
      };

      // Basic validation
      if (!courseData.name || !courseData.code || !courseData.departmentId || !courseData.level || !courseData.courseType) {
        return res.status(400).json({
          success: false,
          message: 'Name, code, department ID, level, and course type are required'
        });
      }

      const course = await courseService.createCourse(courseData);
      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course
      });
    } catch (error) {
      console.error('Error creating course:', error);

      // Handle unique constraint violations
      if (error instanceof Error && error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Update course
  async updateCourse(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid course ID'
        });
      }

      const updateData = {
        name: req.body.name,
        code: req.body.code,
        level: req.body.level ? parseInt(req.body.level) : undefined,
        courseType: req.body.courseType,
        creditHours: req.body.creditHours ? parseInt(req.body.creditHours) : undefined,
        contactHours: req.body.contactHours ? parseInt(req.body.contactHours) : undefined,
        description: req.body.description,
        learningOutcomes: req.body.learningOutcomes,
        syllabus: req.body.syllabus,
        assessmentMethods: req.body.assessmentMethods,
        prerequisites: req.body.prerequisites,
        corequisites: req.body.corequisites,
        recommendedBooks: req.body.recommendedBooks,
        isActive: req.body.isActive
      };

      const course = await courseService.updateCourse(id, updateData);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      res.json({
        success: true,
        message: 'Course updated successfully',
        data: course
      });
    } catch (error) {
      console.error('Error updating course:', error);

      // Handle unique constraint violations
      if (error instanceof Error && error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Delete course
  async deleteCourse(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid course ID'
        });
      }

      const success = await courseService.deleteCourse(id);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      res.json({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get courses by department
  async getCoursesByDepartment(req: Request, res: Response) {
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
        level: req.query.level ? parseInt(req.query.level as string) : undefined,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined
      };

      const result = await courseService.getCoursesByDepartment(departmentId, query);
      res.json(result);
    } catch (error) {
      console.error('Error fetching courses by department:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch courses',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get courses by program
   async getCoursesByProgram(req: Request, res: Response) {
    try {
      const programId = parseInt(req.params.programId);
      if (isNaN(programId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid program ID'
        });
      } 
      const query: CourseByProgramQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string || '',
        level: req.query.level ? parseInt(req.query.level as string) : undefined,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined
      };

      const result = await courseService.getCoursesByProgram(programId, query);
      res.json(result);
    } catch (error) {
      console.error('Error fetching courses by program:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch courses',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
