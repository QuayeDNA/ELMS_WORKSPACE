import { Request, Response } from 'express';
import { ScriptSubmissionService } from '../services/scriptSubmissionService';

export class ScriptSubmissionController {
  /**
   * Submit a script
   * POST /api/script-submissions/submit
   */
  static async submitScript(req: Request, res: Response) {
    try {
      const { studentQRCode, examEntryId, location, notes } = req.body;
      const invigilatorId = req.user?.id;

      if (!studentQRCode) {
        return res.status(400).json({
          success: false,
          message: 'Student QR code is required'
        });
      }

      if (!invigilatorId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const result = await ScriptSubmissionService.submitScript({
        studentQRCode,
        invigilatorId,
        examEntryId: examEntryId ? parseInt(examEntryId) : undefined,
        location: location || 'Exam Venue',
        notes
      });

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in submitScript:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit script'
      });
    }
  }

  /**
   * Scan student QR code to get their info
   * POST /api/script-submissions/scan-student
   */
  static async scanStudent(req: Request, res: Response) {
    try {
      const { studentQRCode } = req.body;

      if (!studentQRCode) {
        return res.status(400).json({
          success: false,
          message: 'Student QR code is required'
        });
      }

      const result = await ScriptSubmissionService.scanStudent(studentQRCode);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in scanStudent:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to scan student QR'
      });
    }
  }

  /**
   * Verify a script
   * POST /api/script-submissions/:scriptId/verify
   */
  static async verifyScript(req: Request, res: Response) {
    try {
      const scriptId = parseInt(req.params.scriptId);
      const verifiedBy = req.user?.id;

      if (isNaN(scriptId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid script ID'
        });
      }

      if (!verifiedBy) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const script = await ScriptSubmissionService.verifyScript(scriptId, verifiedBy);

      res.status(200).json({
        success: true,
        message: 'Script verified successfully',
        data: script
      });
    } catch (error) {
      console.error('Error in verifyScript:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to verify script'
      });
    }
  }

  /**
   * Bulk submit scripts (for offline sync)
   * POST /api/script-submissions/bulk-submit
   */
  static async bulkSubmitScripts(req: Request, res: Response) {
    try {
      const { submissions } = req.body;
      const invigilatorId = req.user?.id;

      if (!submissions || !Array.isArray(submissions) || submissions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Submissions array is required and must not be empty'
        });
      }

      if (!invigilatorId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const result = await ScriptSubmissionService.bulkSubmitScripts(
        submissions,
        invigilatorId
      );

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in bulkSubmitScripts:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to bulk submit scripts'
      });
    }
  }

  /**
   * Get batch submission history
   * GET /api/script-submissions/batch/:batchId/history
   */
  static async getBatchSubmissionHistory(req: Request, res: Response) {
    try {
      const batchId = parseInt(req.params.batchId);

      if (isNaN(batchId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid batch ID'
        });
      }

      const history = await ScriptSubmissionService.getBatchSubmissionHistory(batchId);

      res.status(200).json({
        success: true,
        count: history.length,
        data: history
      });
    } catch (error) {
      console.error('Error in getBatchSubmissionHistory:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get submission history'
      });
    }
  }

  /**
   * Get student submission status
   * GET /api/script-submissions/student/:studentId/exam/:examEntryId
   */
  static async getStudentSubmissionStatus(req: Request, res: Response) {
    try {
      const studentId = parseInt(req.params.studentId);
      const examEntryId = parseInt(req.params.examEntryId);

      if (isNaN(studentId) || isNaN(examEntryId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID or exam entry ID'
        });
      }

      const status = await ScriptSubmissionService.getStudentSubmissionStatus(
        studentId,
        examEntryId
      );

      if (!status) {
        return res.status(404).json({
          success: false,
          message: 'Submission status not found'
        });
      }

      res.status(200).json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Error in getStudentSubmissionStatus:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get submission status'
      });
    }
  }
}
