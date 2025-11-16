import { Request, Response } from 'express';
import { registrationService } from '../services/registrationService';

/**
 * Simplified Course Registration Controller
 * Handles single-action course registration workflow
 */
export class RegistrationController {

  /**
   * Register student for multiple courses in one action
   * POST /api/registrations/register
   * Access: Student
   */
  async registerForCourses(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, semesterId, courseOfferingIds } = req.body;

      if (!studentId || !semesterId || !courseOfferingIds || !Array.isArray(courseOfferingIds)) {
        res.status(400).json({
          success: false,
          message: 'Student ID, semester ID, and course offering IDs are required'
        });
        return;
      }

      const result = await registrationService.registerForCourses(
        studentId,
        semesterId,
        courseOfferingIds
      );

      res.status(200).json(result);
    } catch (error) {
      console.error('Error registering for courses:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to register for courses'
      });
    }
  }

  /**
   * Get available courses for a student in a semester
   * GET /api/registrations/available-courses/:studentId/:semesterId
   * Access: Student (own), Advisor, Admin
   */
  async getAvailableCourses(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);
      const semesterId = parseInt(req.params.semesterId);

      if (isNaN(studentId) || isNaN(semesterId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid student ID or semester ID'
        });
        return;
      }

      const courses = await registrationService.getAvailableCourses(studentId, semesterId);

      res.status(200).json({
        success: true,
        data: courses,
        count: courses.length
      });
    } catch (error) {
      console.error('Error fetching available courses:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch available courses'
      });
    }
  }

  /**
   * Get student's current registration for a semester
   * GET /api/registrations/student/:studentId/:semesterId
   * Access: Student (own), Advisor, Admin
   */
  async getStudentRegistration(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);
      const semesterId = parseInt(req.params.semesterId);

      if (isNaN(studentId) || isNaN(semesterId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid student ID or semester ID'
        });
        return;
      }

      const registration = await registrationService.getStudentRegistration(studentId, semesterId);

      if (!registration) {
        res.status(200).json({
          success: true,
          data: null,
          message: 'No active registration found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: registration
      });
    } catch (error) {
      console.error('Error fetching student registration:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch registration'
      });
    }
  }

  /**
   * Drop courses from registration
   * POST /api/registrations/drop-courses
   * Access: Student (own)
   */
  async dropCourses(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, semesterId, courseOfferingIds } = req.body;

      if (!studentId || !semesterId || !courseOfferingIds || !Array.isArray(courseOfferingIds)) {
        res.status(400).json({
          success: false,
          message: 'Student ID, semester ID, and course offering IDs are required'
        });
        return;
      }

      const result = await registrationService.dropCourses(
        studentId,
        semesterId,
        courseOfferingIds
      );

      res.status(200).json(result);
    } catch (error) {
      console.error('Error dropping courses:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to drop courses'
      });
    }
  }

  /**
   * Cancel entire registration
   * POST /api/registrations/cancel
   * Access: Student (own)
   */
  async cancelRegistration(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, semesterId } = req.body;

      if (!studentId || !semesterId) {
        res.status(400).json({
          success: false,
          message: 'Student ID and semester ID are required'
        });
        return;
      }

      const result = await registrationService.cancelRegistration(studentId, semesterId);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error cancelling registration:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to cancel registration'
      });
    }
  }
}

// Export a singleton instance
export const registrationController = new RegistrationController();
