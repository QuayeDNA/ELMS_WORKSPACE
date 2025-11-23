import { Request, Response } from 'express';
import { publicExamService } from '../services/publicExamService';
import { validateQRToken } from '../utils/examTokens';

export const publicExamController = {
  /**
   * Validate a QR code token and return exam details
   */
  async validateQRCode(req: Request, res: Response) {
    try {
      const { qrCode } = req.body;

      if (!qrCode) {
        return res.status(400).json({
          success: false,
          message: 'QR code is required'
        });
      }

      // Validate token format and decode
      const tokenData = validateQRToken(qrCode);
      if (!tokenData) {
        return res.status(400).json({
          success: false,
          message: 'Invalid QR code format'
        });
      }

      // Get exam registration details
      const result = await publicExamService.validateExamRegistration(tokenData);

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error validating QR code:', error);
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to validate QR code'
      });
    }
  },

  /**
   * Check in a student for an exam
   */
  async checkInStudent(req: Request, res: Response) {
    try {
      const { qrCode, verificationMethod = 'QR_CODE' } = req.body;

      if (!qrCode) {
        return res.status(400).json({
          success: false,
          message: 'QR code is required'
        });
      }

      // Validate token
      const tokenData = validateQRToken(qrCode);
      if (!tokenData) {
        return res.status(400).json({
          success: false,
          message: 'Invalid QR code'
        });
      }

      // Process check-in
      const result = await publicExamService.checkInStudent({
        examRegistrationId: tokenData.examRegistrationId,
        studentId: tokenData.studentId,
        verificationMethod,
        qrCode
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
