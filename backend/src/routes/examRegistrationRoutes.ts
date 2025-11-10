import express from 'express';
import { ExamRegistrationController } from '../controllers/examRegistrationController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../types/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// ========================================
// EXAM REGISTRATION ROUTES
// ========================================

// Auto-register students for timetable (ADMIN, EXAMS_OFFICER)
router.post(
  '/auto-register/:timetableId',
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXAMS_OFFICER),
  ExamRegistrationController.autoRegisterForTimetable
);

// Auto-register students for exam entry (ADMIN, EXAMS_OFFICER)
router.post(
  '/auto-register/entry/:examEntryId',
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXAMS_OFFICER),
  ExamRegistrationController.autoRegisterForExamEntry
);

// Get registrations for exam entry (all authenticated users)
router.get(
  '/entry/:examEntryId',
  ExamRegistrationController.getRegistrationsForExamEntry
);

// Get registration by QR code (INVIGILATOR, EXAMS_OFFICER)
router.get(
  '/qr/:qrCode',
  requireRole(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.INVIGILATOR
  ),
  ExamRegistrationController.getRegistrationByQRCode
);

// Mark attendance (INVIGILATOR, EXAMS_OFFICER)
router.post(
  '/attendance',
  requireRole(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.INVIGILATOR
  ),
  ExamRegistrationController.markAttendance
);

// Get registration statistics (all authenticated users)
router.get(
  '/statistics/:examEntryId',
  ExamRegistrationController.getRegistrationStatistics
);

// Get active exams for student (all authenticated users)
router.get(
  '/student/:studentId/active-exams',
  ExamRegistrationController.getActiveExamsForStudent
);

// Get students with missing scripts (EXAMS_OFFICER, INVIGILATOR)
router.get(
  '/missing-scripts/:examEntryId',
  requireRole(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.INVIGILATOR
  ),
  ExamRegistrationController.getMissingScripts
);

export default router;
