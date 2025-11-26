import express from 'express';
import { ScriptSubmissionController } from '../controllers/scriptSubmissionController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../types/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// ========================================
// SCRIPT SUBMISSION ROUTES
// ========================================

// Submit script (INVIGILATOR, LECTURER, EXAMS_OFFICER)
router.post(
  '/submit',
  requireRole(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.INVIGILATOR,
    UserRole.LECTURER
  ),
  ScriptSubmissionController.submitScript
);

// Scan student QR code (INVIGILATOR, LECTURER, EXAMS_OFFICER)
router.post(
  '/scan-student',
  requireRole(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.INVIGILATOR,
    UserRole.LECTURER
  ),
  ScriptSubmissionController.scanStudent
);

// Verify script (INVIGILATOR, LECTURER, EXAMS_OFFICER)
router.post(
  '/:scriptId/verify',
  requireRole(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.INVIGILATOR,
    UserRole.LECTURER
  ),
  ScriptSubmissionController.verifyScript
);

// Bulk submit scripts (INVIGILATOR, LECTURER, EXAMS_OFFICER)
router.post(
  '/bulk-submit',
  requireRole(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.INVIGILATOR,
    UserRole.LECTURER
  ),
  ScriptSubmissionController.bulkSubmitScripts
);

// Get batch submission history (all authenticated users)
router.get(
  '/batch/:batchId/history',
  ScriptSubmissionController.getBatchSubmissionHistory
);

// Get student submission status (all authenticated users)
router.get(
  '/student/:studentId/exam/:examEntryId',
  ScriptSubmissionController.getStudentSubmissionStatus
);

export default router;
