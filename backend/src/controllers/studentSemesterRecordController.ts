import { Request, Response } from 'express';
import { studentSemesterRecordService } from '../services/studentSemesterRecordService';

/**
 * StudentSemesterRecordController
 * Handles HTTP requests for student semester records
 */
export class StudentSemesterRecordController {

  /**
   * Create a new semester record
   * POST /api/semester-records
   * Access: Faculty Admin, Admin
   */
  async createSemesterRecord(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, semesterId, remarksFromAdvisor } = req.body;

      if (!studentId || !semesterId) {
        res.status(400).json({
          success: false,
          message: 'Student ID and Semester ID are required'
        });
        return;
      }

      const record = await studentSemesterRecordService.createSemesterRecord({
        studentId,
        semesterId,
        remarksFromAdvisor
      });

      res.status(201).json({
        success: true,
        message: 'Semester record created successfully',
        data: record
      });
    } catch (error) {
      console.error('Error creating semester record:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create semester record'
      });
    }
  }

  /**
   * Get a semester record
   * GET /api/semester-records/:studentId/:semesterId
   * Access: Student (own), Lecturer, Faculty Admin, Admin
   */
  async getSemesterRecord(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);
      const semesterId = parseInt(req.params.semesterId);

      if (isNaN(studentId) || isNaN(semesterId)) {
        res.status(400).json({
          success: false,
          message: 'Valid Student ID and Semester ID are required'
        });
        return;
      }

      const record = await studentSemesterRecordService.getSemesterRecord(studentId, semesterId);

      res.status(200).json({
        success: true,
        data: record
      });
    } catch (error) {
      console.error('Error getting semester record:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get semester record'
      });
    }
  }

  /**
   * Get all semester records for a student
   * GET /api/semester-records/student/:studentId
   * Access: Student (own), Lecturer, Faculty Admin, Admin
   */
  async getStudentSemesterRecords(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);

      if (isNaN(studentId)) {
        res.status(400).json({
          success: false,
          message: 'Valid Student ID is required'
        });
        return;
      }

      const records = await studentSemesterRecordService.getStudentSemesterRecords(studentId);

      res.status(200).json({
        success: true,
        data: records,
        count: records.length
      });
    } catch (error) {
      console.error('Error getting student semester records:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get student semester records'
      });
    }
  }

  /**
   * Update semester record statistics
   * PUT /api/semester-records/:studentId/:semesterId
   * Access: Faculty Admin, Admin
   */
  async updateSemesterRecord(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);
      const semesterId = parseInt(req.params.semesterId);

      if (isNaN(studentId) || isNaN(semesterId)) {
        res.status(400).json({
          success: false,
          message: 'Valid Student ID and Semester ID are required'
        });
        return;
      }

      const {
        coursesRegistered,
        coursesCompleted,
        coursesFailed,
        coursesDropped,
        coursesInProgress,
        creditsAttempted,
        creditsEarned,
        remarksFromAdvisor
      } = req.body;

      const record = await studentSemesterRecordService.updateSemesterRecord(
        studentId,
        semesterId,
        {
          coursesRegistered,
          coursesCompleted,
          coursesFailed,
          coursesDropped,
          coursesInProgress,
          creditsAttempted,
          creditsEarned,
          remarksFromAdvisor
        }
      );

      res.status(200).json({
        success: true,
        message: 'Semester record updated successfully',
        data: record
      });
    } catch (error) {
      console.error('Error updating semester record:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update semester record'
      });
    }
  }

  /**
   * Calculate semester GPA
   * POST /api/semester-records/:studentId/:semesterId/calculate-gpa
   * Access: Faculty Admin, Admin
   */
  async calculateSemesterGPA(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);
      const semesterId = parseInt(req.params.semesterId);

      if (isNaN(studentId) || isNaN(semesterId)) {
        res.status(400).json({
          success: false,
          message: 'Valid Student ID and Semester ID are required'
        });
        return;
      }

      const result = await studentSemesterRecordService.calculateSemesterGPA(studentId, semesterId);

      res.status(200).json({
        success: true,
        message: 'Semester GPA calculated successfully',
        data: result
      });
    } catch (error) {
      console.error('Error calculating semester GPA:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to calculate semester GPA'
      });
    }
  }

  /**
   * Update academic standing
   * POST /api/semester-records/:studentId/:semesterId/update-standing
   * Access: Faculty Admin, Admin
   */
  async updateAcademicStanding(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);
      const semesterId = parseInt(req.params.semesterId);

      if (isNaN(studentId) || isNaN(semesterId)) {
        res.status(400).json({
          success: false,
          message: 'Valid Student ID and Semester ID are required'
        });
        return;
      }

      const record = await studentSemesterRecordService.updateAcademicStanding(studentId, semesterId);

      res.status(200).json({
        success: true,
        message: 'Academic standing updated successfully',
        data: record
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
   * Finalize semester record
   * POST /api/semester-records/:studentId/:semesterId/finalize
   * Access: Faculty Admin, Admin
   */
  async finalizeSemesterRecord(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);
      const semesterId = parseInt(req.params.semesterId);
      const finalizedBy = req.user?.userId;

      if (isNaN(studentId) || isNaN(semesterId)) {
        res.status(400).json({
          success: false,
          message: 'Valid Student ID and Semester ID are required'
        });
        return;
      }

      if (!finalizedBy) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const record = await studentSemesterRecordService.finalizeSemesterRecord(
        studentId,
        semesterId,
        finalizedBy
      );

      res.status(200).json({
        success: true,
        message: 'Semester record finalized successfully',
        data: record
      });
    } catch (error) {
      console.error('Error finalizing semester record:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to finalize semester record'
      });
    }
  }

  /**
   * Get semester statistics
   * GET /api/semester-records/:studentId/:semesterId/statistics
   * Access: Student (own), Lecturer, Faculty Admin, Admin
   */
  async getSemesterStatistics(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);
      const semesterId = parseInt(req.params.semesterId);

      if (isNaN(studentId) || isNaN(semesterId)) {
        res.status(400).json({
          success: false,
          message: 'Valid Student ID and Semester ID are required'
        });
        return;
      }

      const statistics = await studentSemesterRecordService.getSemesterStatistics(studentId, semesterId);

      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error getting semester statistics:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get semester statistics'
      });
    }
  }
}

// Export singleton instance
export const studentSemesterRecordController = new StudentSemesterRecordController();
