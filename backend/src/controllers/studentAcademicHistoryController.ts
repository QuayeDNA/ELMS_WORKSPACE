import { Request, Response } from 'express';
import { studentAcademicHistoryService } from '../services/studentAcademicHistoryService';

/**
 * StudentAcademicHistoryController
 * Handles HTTP requests for student academic history
 */
export class StudentAcademicHistoryController {

  /**
   * Create academic history for a new student
   * POST /api/academic-history
   * Access: Faculty Admin, Admin
   */
  async createAcademicHistory(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, admissionYear, admissionSemester, expectedGraduationYear } = req.body;

      if (!studentId || !admissionYear) {
        res.status(400).json({
          success: false,
          message: 'Student ID and Admission Year are required'
        });
        return;
      }

      const history = await studentAcademicHistoryService.createAcademicHistory({
        studentId,
        admissionYear,
        admissionSemester,
        expectedGraduationYear
      });

      res.status(201).json({
        success: true,
        message: 'Academic history created successfully',
        data: history
      });
    } catch (error) {
      console.error('Error creating academic history:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create academic history'
      });
    }
  }

  /**
   * Get academic history for a student
   * GET /api/academic-history/:studentId
   * Access: Student (own), Lecturer, Faculty Admin, Admin
   */
  async getAcademicHistory(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);

      if (isNaN(studentId)) {
        res.status(400).json({
          success: false,
          message: 'Valid Student ID is required'
        });
        return;
      }

      const history = await studentAcademicHistoryService.getAcademicHistory(studentId);

      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Error getting academic history:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get academic history'
      });
    }
  }

  /**
   * Update cumulative GPA
   * POST /api/academic-history/:studentId/update-gpa
   * Access: Faculty Admin, Admin
   */
  async updateCumulativeGPA(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);

      if (isNaN(studentId)) {
        res.status(400).json({
          success: false,
          message: 'Valid Student ID is required'
        });
        return;
      }

      const result = await studentAcademicHistoryService.updateCumulativeGPA(studentId);

      res.status(200).json({
        success: true,
        message: 'Cumulative GPA updated successfully',
        data: result
      });
    } catch (error) {
      console.error('Error updating cumulative GPA:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update cumulative GPA'
      });
    }
  }

  /**
   * Check level progression
   * GET /api/academic-history/:studentId/level-progression
   * Access: Student (own), Lecturer, Faculty Admin, Admin
   */
  async checkLevelProgression(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);

      if (isNaN(studentId)) {
        res.status(400).json({
          success: false,
          message: 'Valid Student ID is required'
        });
        return;
      }

      const result = await studentAcademicHistoryService.checkLevelProgression(studentId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error checking level progression:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to check level progression'
      });
    }
  }

  /**
   * Update academic standing
   * POST /api/academic-history/:studentId/update-standing
   * Access: Faculty Admin, Admin
   */
  async updateAcademicStanding(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);

      if (isNaN(studentId)) {
        res.status(400).json({
          success: false,
          message: 'Valid Student ID is required'
        });
        return;
      }

      const history = await studentAcademicHistoryService.updateAcademicStanding(studentId);

      res.status(200).json({
        success: true,
        message: 'Academic standing updated successfully',
        data: history
      });
    } catch (error) {
      console.error('Error updating academic standing:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update academic standing'
      });
    }
  }

  /**
   * Update current semester
   * PUT /api/academic-history/:studentId/current-semester
   * Access: Faculty Admin, Admin
   */
  async updateCurrentSemester(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);
      const { semesterNumber } = req.body;

      if (isNaN(studentId) || !semesterNumber) {
        res.status(400).json({
          success: false,
          message: 'Valid Student ID and Semester Number are required'
        });
        return;
      }

      const history = await studentAcademicHistoryService.updateCurrentSemester(
        studentId,
        semesterNumber
      );

      res.status(200).json({
        success: true,
        message: 'Current semester updated successfully',
        data: history
      });
    } catch (error) {
      console.error('Error updating current semester:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update current semester'
      });
    }
  }

  /**
   * Check graduation eligibility
   * GET /api/academic-history/:studentId/graduation-eligibility
   * Access: Student (own), Lecturer, Faculty Admin, Admin
   */
  async checkGraduationEligibility(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);

      if (isNaN(studentId)) {
        res.status(400).json({
          success: false,
          message: 'Valid Student ID is required'
        });
        return;
      }

      const result = await studentAcademicHistoryService.checkGraduationEligibility(studentId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error checking graduation eligibility:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to check graduation eligibility'
      });
    }
  }

  /**
   * Mark student as graduated
   * POST /api/academic-history/:studentId/graduate
   * Access: Faculty Admin, Admin
   */
  async markAsGraduated(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);
      const { graduationDate } = req.body;

      if (isNaN(studentId) || !graduationDate) {
        res.status(400).json({
          success: false,
          message: 'Valid Student ID and Graduation Date are required'
        });
        return;
      }

      const history = await studentAcademicHistoryService.markAsGraduated(
        studentId,
        new Date(graduationDate)
      );

      res.status(200).json({
        success: true,
        message: 'Student marked as graduated successfully',
        data: history
      });
    } catch (error) {
      console.error('Error marking student as graduated:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to mark student as graduated'
      });
    }
  }

  /**
   * Get academic summary
   * GET /api/academic-history/:studentId/summary
   * Access: Student (own), Lecturer, Faculty Admin, Admin
   */
  async getAcademicSummary(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);

      if (isNaN(studentId)) {
        res.status(400).json({
          success: false,
          message: 'Valid Student ID is required'
        });
        return;
      }

      const summary = await studentAcademicHistoryService.getAcademicSummary(studentId);

      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error getting academic summary:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get academic summary'
      });
    }
  }

  /**
   * Get academic transcript
   * GET /api/academic-history/:studentId/transcript
   * Access: Student (own), Lecturer, Faculty Admin, Admin
   */
  async getTranscript(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);

      if (isNaN(studentId)) {
        res.status(400).json({
          success: false,
          message: 'Valid Student ID is required'
        });
        return;
      }

      const transcript = await studentAcademicHistoryService.getTranscript(studentId);

      res.status(200).json({
        success: true,
        data: transcript
      });
    } catch (error) {
      console.error('Error getting transcript:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get transcript'
      });
    }
  }
}

// Export singleton instance
export const studentAcademicHistoryController = new StudentAcademicHistoryController();
