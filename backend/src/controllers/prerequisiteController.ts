import { Request, Response } from 'express';
import { prerequisiteService } from '../services/prerequisiteService';

/**
 * Prerequisite Controller
 * Handles prerequisite checking and validation
 */
export class PrerequisiteController {
  /**
   * Check prerequisites for a course
   * GET /api/prerequisites/check/:studentId/:courseId
   * Access: Student (own), Advisor, Admin
   */
  async checkPrerequisites(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);
      const courseId = parseInt(req.params.courseId);
      const programId = req.query.programId ? parseInt(req.query.programId as string) : undefined;

      if (isNaN(studentId) || isNaN(courseId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid student ID or course ID'
        });
        return;
      }

      const result = await prerequisiteService.checkPrerequisites(
        studentId,
        courseId,
        programId
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error checking prerequisites:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to check prerequisites'
      });
    }
  }

  /**
   * Get missing prerequisites for a course
   * GET /api/prerequisites/missing/:studentId/:courseId
   * Access: Student (own), Advisor, Admin
   */
  async getMissingPrerequisites(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);
      const courseId = parseInt(req.params.courseId);

      if (isNaN(studentId) || isNaN(courseId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid student ID or course ID'
        });
        return;
      }

      const missingPrerequisites = await prerequisiteService.getMissingPrerequisites(
        studentId,
        courseId
      );

      res.status(200).json({
        success: true,
        data: missingPrerequisites,
        count: missingPrerequisites.length
      });
    } catch (error) {
      console.error('Error fetching missing prerequisites:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch missing prerequisites'
      });
    }
  }

  /**
   * Get all prerequisites for a course
   * GET /api/prerequisites/course/:courseId/:programId
   * Access: Student, Advisor, Admin
   */
  async getCoursePrerequisites(req: Request, res: Response): Promise<void> {
    try {
      const courseId = parseInt(req.params.courseId);
      const programId = parseInt(req.params.programId);

      if (isNaN(courseId) || isNaN(programId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid course ID or program ID'
        });
        return;
      }

      const prerequisites = await prerequisiteService.getCoursePrerequisites(
        courseId,
        programId
      );

      res.status(200).json({
        success: true,
        data: prerequisites,
        count: prerequisites.length
      });
    } catch (error) {
      console.error('Error fetching course prerequisites:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch course prerequisites'
      });
    }
  }

  /**
   * Batch check prerequisites for multiple courses
   * POST /api/prerequisites/batch-check
   * Access: Student (own), Advisor, Admin
   */
  async batchCheckPrerequisites(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, courseIds } = req.body;

      if (!studentId || !Array.isArray(courseIds) || courseIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Student ID and course IDs array are required'
        });
        return;
      }

      // Validate all IDs are numbers
      if (isNaN(studentId) || courseIds.some(id => isNaN(id))) {
        res.status(400).json({
          success: false,
          message: 'Invalid student ID or course IDs'
        });
        return;
      }

      const results = await prerequisiteService.batchCheckPrerequisites(
        studentId,
        courseIds
      );

      res.status(200).json({
        success: true,
        data: results,
        count: results.length
      });
    } catch (error) {
      console.error('Error batch checking prerequisites:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to batch check prerequisites'
      });
    }
  }

  /**
   * Get courses that require a specific course as prerequisite
   * GET /api/prerequisites/dependent/:courseId/:programId
   * Access: Student, Advisor, Admin
   */
  async getCoursesRequiringPrerequisite(req: Request, res: Response): Promise<void> {
    try {
      const courseId = parseInt(req.params.courseId);
      const programId = parseInt(req.params.programId);

      if (isNaN(courseId) || isNaN(programId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid course ID or program ID'
        });
        return;
      }

      const dependentCourses = await prerequisiteService.getCoursesRequiringPrerequisite(
        courseId,
        programId
      );

      res.status(200).json({
        success: true,
        data: dependentCourses,
        count: dependentCourses.length
      });
    } catch (error) {
      console.error('Error fetching dependent courses:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch dependent courses'
      });
    }
  }

  /**
   * Validate entire prerequisite chain for a course
   * GET /api/prerequisites/validate-chain/:studentId/:courseId
   * Access: Student (own), Advisor, Admin
   */
  async validatePrerequisiteChain(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);
      const courseId = parseInt(req.params.courseId);

      if (isNaN(studentId) || isNaN(courseId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid student ID or course ID'
        });
        return;
      }

      const validation = await prerequisiteService.validatePrerequisiteChain(
        studentId,
        courseId
      );

      res.status(200).json({
        success: true,
        data: validation
      });
    } catch (error) {
      console.error('Error validating prerequisite chain:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to validate prerequisite chain'
      });
    }
  }
}

// Export a singleton instance
export const prerequisiteController = new PrerequisiteController();
