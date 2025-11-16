import { Request, Response } from 'express';
import { courseOfferingService } from '../services/courseOfferingService';

class CourseOfferingController {
  /**
   * Get all course offerings for a semester
   * GET /api/course-offerings?semesterId=:semesterId
   */
  async getCourseOfferings(req: Request, res: Response): Promise<void> {
    try {
      const { semesterId } = req.query;
      const institutionId = (req as any).user?.institutionId;

      if (!semesterId) {
        res.status(400).json({
          success: false,
          message: 'Semester ID is required'
        });
        return;
      }

      if (!institutionId) {
        res.status(400).json({
          success: false,
          message: 'Institution ID not found in user context'
        });
        return;
      }

      const offerings = await courseOfferingService.getCourseOfferingsBySemester(
        parseInt(semesterId as string),
        institutionId
      );

      res.status(200).json({
        success: true,
        data: offerings
      });
    } catch (error) {
      console.error('Error fetching course offerings:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch course offerings'
      });
    }
  }

  /**
   * Get course offering by ID
   * GET /api/course-offerings/:id
   */
  async getCourseOfferingById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const offering = await courseOfferingService.getCourseOfferingById(parseInt(id));

      if (!offering) {
        res.status(404).json({
          success: false,
          message: 'Course offering not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: offering
      });
    } catch (error) {
      console.error('Error fetching course offering:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch course offering'
      });
    }
  }
}

export const courseOfferingController = new CourseOfferingController();
