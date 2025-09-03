import { Request, Response } from 'express';
import { courseService } from '../services/courseService';
import { CreateCourseRequest, UpdateCourseRequest, CourseQuery, CreateProgramCourseRequest, UpdateProgramCourseRequest } from '../types/course';

export const courseController = {
  // Get all courses with pagination and filtering
  async getCourses(req: Request, res: Response) {
    try {
      const query: CourseQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string || '',
        departmentId: req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined,
        facultyId: req.query.facultyId ? parseInt(req.query.facultyId as string) : undefined,
        institutionId: req.query.institutionId ? parseInt(req.query.institutionId as string) : undefined,
        level: req.query.level ? parseInt(req.query.level as string) : undefined,
        courseType: req.query.courseType as any,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        sortBy: req.query.sortBy as any || 'name',
        sortOrder: (req.query.sortOrder as string) === 'desc' ? 'desc' : 'asc'
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
      const courseData: CreateCourseRequest = req.body;

      // Basic validation
      if (!courseData.name || !courseData.code || !courseData.departmentId || !courseData.level) {
        return res.status(400).json({ 
          success: false, 
          message: 'Course name, code, department, and level are required' 
        });
      }

      // Validate level
      if (![100, 200, 300, 400, 500, 600].includes(courseData.level)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid course level. Must be 100, 200, 300, 400, 500, or 600' 
        });
      }

      // Validate credit hours
      if (!courseData.creditHours || courseData.creditHours <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Valid credit hours are required' 
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
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        return res.status(409).json({ 
          success: false, 
          message: 'Course code already exists' 
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

      const updateData: UpdateCourseRequest = req.body;

      // Check if course exists
      const existingCourse = await courseService.getCourseById(id);
      if (!existingCourse) {
        return res.status(404).json({ 
          success: false, 
          message: 'Course not found' 
        });
      }

      // Validate level if provided
      if (updateData.level !== undefined && ![100, 200, 300, 400, 500, 600].includes(updateData.level)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid course level. Must be 100, 200, 300, 400, 500, or 600' 
        });
      }

      // Validate credit hours if provided
      if (updateData.creditHours !== undefined && updateData.creditHours <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Valid credit hours are required' 
        });
      }

      const course = await courseService.updateCourse(id, updateData);
      res.json({ 
        success: true, 
        message: 'Course updated successfully',
        data: course 
      });
    } catch (error) {
      console.error('Error updating course:', error);
      
      // Handle unique constraint violations
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        return res.status(409).json({ 
          success: false, 
          message: 'Course code already exists' 
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

      // Check if course exists
      const existingCourse = await courseService.getCourseById(id);
      if (!existingCourse) {
        return res.status(404).json({ 
          success: false, 
          message: 'Course not found' 
        });
      }

      const deleted = await courseService.deleteCourse(id);
      if (!deleted) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot delete course. It may have associated records.' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Course deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      
      // Handle foreign key constraint violations
      if (error instanceof Error && error.message.includes('constraint')) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot delete course. It has associated exams, programs, or offerings.' 
        });
      }

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

      const courses = await courseService.getCoursesByDepartment(departmentId);
      res.json({ 
        success: true, 
        data: courses 
      });
    } catch (error) {
      console.error('Error fetching courses by department:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch courses',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get courses by faculty
  async getCoursesByFaculty(req: Request, res: Response) {
    try {
      const facultyId = parseInt(req.params.facultyId);
      if (isNaN(facultyId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid faculty ID' 
        });
      }

      const courses = await courseService.getCoursesByFaculty(facultyId);
      res.json({ 
        success: true, 
        data: courses 
      });
    } catch (error) {
      console.error('Error fetching courses by faculty:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch courses',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get courses by institution
  async getCoursesByInstitution(req: Request, res: Response) {
    try {
      const institutionId = parseInt(req.params.institutionId);
      if (isNaN(institutionId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid institution ID' 
        });
      }

      const courses = await courseService.getCoursesByInstitution(institutionId);
      res.json({ 
        success: true, 
        data: courses 
      });
    } catch (error) {
      console.error('Error fetching courses by institution:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch courses',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get course statistics
  async getCourseStats(req: Request, res: Response) {
    try {
      const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined;
      const facultyId = req.query.facultyId ? parseInt(req.query.facultyId as string) : undefined;
      const institutionId = req.query.institutionId ? parseInt(req.query.institutionId as string) : undefined;

      const stats = await courseService.getCourseStats(departmentId, facultyId, institutionId);
      res.json({ 
        success: true, 
        data: stats 
      });
    } catch (error) {
      console.error('Error fetching course statistics:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch course statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Program-Course relationship endpoints
  async addCourseToProgram(req: Request, res: Response) {
    try {
      const data: CreateProgramCourseRequest = req.body;

      if (!data.programId || !data.courseId || !data.level || !data.semester) {
        return res.status(400).json({ 
          success: false, 
          message: 'Program ID, course ID, level, and semester are required' 
        });
      }

      const programCourse = await courseService.addCourseToProgram(data);
      res.status(201).json({ 
        success: true, 
        message: 'Course added to program successfully',
        data: programCourse 
      });
    } catch (error) {
      console.error('Error adding course to program:', error);
      
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        return res.status(409).json({ 
          success: false, 
          message: 'Course already exists in this program for the specified level and semester' 
        });
      }

      res.status(500).json({ 
        success: false, 
        message: 'Failed to add course to program',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async updateProgramCourse(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid program course ID' 
        });
      }

      const data: UpdateProgramCourseRequest = req.body;
      const programCourse = await courseService.updateProgramCourse(id, data);
      
      if (!programCourse) {
        return res.status(404).json({ 
          success: false, 
          message: 'Program course not found' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Program course updated successfully',
        data: programCourse 
      });
    } catch (error) {
      console.error('Error updating program course:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update program course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async removeCourseFromProgram(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid program course ID' 
        });
      }

      const deleted = await courseService.removeCourseFromProgram(id);
      if (!deleted) {
        return res.status(404).json({ 
          success: false, 
          message: 'Program course not found' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Course removed from program successfully' 
      });
    } catch (error) {
      console.error('Error removing course from program:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to remove course from program',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async getProgramCourses(req: Request, res: Response) {
    try {
      const programId = parseInt(req.params.programId);
      if (isNaN(programId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid program ID' 
        });
      }

      const courses = await courseService.getProgramCourses(programId);
      res.json({ 
        success: true, 
        data: courses 
      });
    } catch (error) {
      console.error('Error fetching program courses:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch program courses',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
