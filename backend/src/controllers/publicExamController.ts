import { Request, Response } from 'express';
import { publicExamService } from '../services/publicExamService';

export const publicExamController = {
  /**
   * Validate a student index number QR code and return active exams
   * NEW: Replaces old QR token validation
   */
  async validateIndexNumber(req: Request, res: Response) {
    try {
      const { indexNumber } = req.body;

      if (!indexNumber) {
        return res.status(400).json({
          success: false,
          message: 'Student index number is required'
        });
      }

      // Validate index number and get active exams
      const result = await publicExamService.validateIndexNumber(indexNumber);

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error validating index number:', error);
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to validate index number'
      });
    }
  },

  /**
   * Check in a student for an exam using their index number
   * NEW: Replaces old token-based check-in
   */
  async checkInStudent(req: Request, res: Response) {
    try {
      const { indexNumber, examEntryId, verificationMethod = 'QR_CODE' } = req.body;

      if (!indexNumber) {
        return res.status(400).json({
          success: false,
          message: 'Student index number is required'
        });
      }

      if (!examEntryId) {
        return res.status(400).json({
          success: false,
          message: 'Exam entry ID is required'
        });
      }

      // Process check-in
      const result = await publicExamService.checkInStudent({
        indexNumber,
        examEntryId: Number(examEntryId),
        verificationMethod
      });

      return res.json({
        success: true,
        message: 'Student checked in successfully',
        data: result
      });
    } catch (error) {
      console.error('Error checking in student:', error);
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to check in student'
      });
    }
  },

  /**
   * Get public exam session details (no auth required)
   */
  async getExamSessionDetails(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required'
        });
      }

      const result = await publicExamService.getPublicSessionDetails(parseInt(sessionId));

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting session details:', error);
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get session details'
      });
    }
  },

  /**
   * Get check-in statistics for a session (for display screens)
   */
  async getSessionCheckInStats(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required'
        });
      }

      const stats = await publicExamService.getSessionCheckInStats(parseInt(sessionId));

      return res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting check-in stats:', error);
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get check-in statistics'
      });
    }
  }
};
