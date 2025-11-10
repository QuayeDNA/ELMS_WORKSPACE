import { Request, Response } from 'express';
import { ExamRegistrationService } from '../services/examRegistrationService';

export class ExamRegistrationController {
  /**
   * Auto-register students for all exams in a timetable
   * POST /api/exam-registrations/auto-register/:timetableId
   */
  static async autoRegisterForTimetable(req: Request, res: Response) {
    try {
      const timetableId = parseInt(req.params.timetableId);

      if (isNaN(timetableId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid timetable ID'
        });
      }

      const result = await ExamRegistrationService.autoRegisterStudentsForTimetable(timetableId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          registrationsCreated: result.registrationsCreated,
          batchScriptsCreated: result.batchScriptsCreated
        }
      });
    } catch (error) {
      console.error('Error in autoRegisterForTimetable:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to auto-register students'
      });
    }
  }

  /**
   * Auto-register students for a specific exam entry
   * POST /api/exam-registrations/auto-register/entry/:examEntryId
   */
  static async autoRegisterForExamEntry(req: Request, res: Response) {
    try {
      const examEntryId = parseInt(req.params.examEntryId);

      if (isNaN(examEntryId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid exam entry ID'
        });
      }

      const result = await ExamRegistrationService.autoRegisterStudentsForExamEntry(examEntryId);

      res.status(200).json({
        success: true,
        message: 'Students registered successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in autoRegisterForExamEntry:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to register students'
      });
    }
  }

  /**
   * Get all registrations for an exam entry
   * GET /api/exam-registrations/entry/:examEntryId
   */
  static async getRegistrationsForExamEntry(req: Request, res: Response) {
    try {
      const examEntryId = parseInt(req.params.examEntryId);
      const { scriptSubmitted, isPresent } = req.query;

      if (isNaN(examEntryId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid exam entry ID'
        });
      }

      const query: any = {};
      if (scriptSubmitted !== undefined) {
        query.scriptSubmitted = scriptSubmitted === 'true';
      }
      if (isPresent !== undefined) {
        query.isPresent = isPresent === 'true';
      }

      const registrations = await ExamRegistrationService.getRegistrationsForExamEntry(
        examEntryId,
        query
      );

      res.status(200).json({
        success: true,
        count: registrations.length,
        data: registrations
      });
    } catch (error) {
      console.error('Error in getRegistrationsForExamEntry:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get registrations'
      });
    }
  }

  /**
   * Get registration by QR code
   * GET /api/exam-registrations/qr/:qrCode
   */
  static async getRegistrationByQRCode(req: Request, res: Response) {
    try {
      const { qrCode } = req.params;

      if (!qrCode) {
        return res.status(400).json({
          success: false,
          message: 'QR code is required'
        });
      }

      const registration = await ExamRegistrationService.getRegistrationByQRCode(qrCode);

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found'
        });
      }

      res.status(200).json({
        success: true,
        data: registration
      });
    } catch (error) {
      console.error('Error in getRegistrationByQRCode:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get registration'
      });
    }
  }

  /**
   * Mark student attendance
   * POST /api/exam-registrations/attendance
   */
  static async markAttendance(req: Request, res: Response) {
    try {
      const { studentId, examEntryId, isPresent, seatNumber, notes } = req.body;
      const markedBy = req.user?.id; // From auth middleware

      if (!studentId || !examEntryId || isPresent === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Student ID, exam entry ID, and attendance status are required'
        });
      }

      if (!markedBy) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const registration = await ExamRegistrationService.markAttendance({
        registrationId: 0, // Will be looked up by studentId and examEntryId
        studentId: parseInt(studentId),
        examEntryId: parseInt(examEntryId),
        isPresent,
        markedBy,
        seatNumber,
        notes
      });

      res.status(200).json({
        success: true,
        message: 'Attendance marked successfully',
        data: registration
      });
    } catch (error) {
      console.error('Error in markAttendance:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to mark attendance'
      });
    }
  }

  /**
   * Get registration statistics for an exam entry
   * GET /api/exam-registrations/statistics/:examEntryId
   */
  static async getRegistrationStatistics(req: Request, res: Response) {
    try {
      const examEntryId = parseInt(req.params.examEntryId);

      if (isNaN(examEntryId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid exam entry ID'
        });
      }

      const statistics = await ExamRegistrationService.getRegistrationStatistics(examEntryId);

      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error in getRegistrationStatistics:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get statistics'
      });
    }
  }

  /**
   * Get active exams for a student
   * GET /api/exam-registrations/student/:studentId/active-exams
   */
  static async getActiveExamsForStudent(req: Request, res: Response) {
    try {
      const studentId = parseInt(req.params.studentId);

      if (isNaN(studentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
      }

      const activeExams = await ExamRegistrationService.getActiveExamsForStudent(studentId);

      res.status(200).json({
        success: true,
        count: activeExams.length,
        data: activeExams
      });
    } catch (error) {
      console.error('Error in getActiveExamsForStudent:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get active exams'
      });
    }
  }

  /**
   * Get students with missing scripts
   * GET /api/exam-registrations/missing-scripts/:examEntryId
   */
  static async getMissingScripts(req: Request, res: Response) {
    try {
      const examEntryId = parseInt(req.params.examEntryId);

      if (isNaN(examEntryId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid exam entry ID'
        });
      }

      const missingScripts = await ExamRegistrationService.getMissingScripts(examEntryId);

      res.status(200).json({
        success: true,
        count: missingScripts.length,
        data: missingScripts
      });
    } catch (error) {
      console.error('Error in getMissingScripts:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get missing scripts'
      });
    }
  }
}
