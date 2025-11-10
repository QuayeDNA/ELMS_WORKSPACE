import express from 'express';
import { BatchScriptController } from '../controllers/batchScriptController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../types/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// ========================================
// BATCH SCRIPT ROUTES
// ========================================

// Get all batch scripts with filters (all authenticated users)
router.get('/', BatchScriptController.getBatchScripts);

// Get batch script by ID (all authenticated users)
router.get('/:batchId', BatchScriptController.getBatchScriptById);

// Get batch script for exam entry and course (all authenticated users)
router.get(
  '/entry/:examEntryId/course/:courseId',
  BatchScriptController.getBatchScriptForExamEntry
);

// Get batch statistics (all authenticated users)
router.get(
  '/:batchId/statistics',
  BatchScriptController.getBatchStatistics
);

// Get batches pending assignment (EXAMS_OFFICER, ADMIN)
router.get(
  '/pending/assignment',
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXAMS_OFFICER),
  BatchScriptController.getPendingAssignment
);

// Get batches for lecturer (LECTURER can see own, EXAMS_OFFICER can see all)
router.get('/lecturer/:lecturerId', BatchScriptController.getBatchesForLecturer);

// Seal batch script (EXAMS_OFFICER, INVIGILATOR)
router.post(
  '/:batchId/seal',
  requireRole(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.INVIGILATOR
  ),
  BatchScriptController.sealBatchScript
);

// Assign batch to lecturer (EXAMS_OFFICER, ADMIN)
router.post(
  '/:batchId/assign',
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXAMS_OFFICER),
  BatchScriptController.assignBatchToLecturer
);

// Update batch status (EXAMS_OFFICER, ADMIN)
router.patch(
  '/:batchId/status',
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXAMS_OFFICER),
  BatchScriptController.updateBatchStatus
);

// Update submission count (EXAMS_OFFICER, INVIGILATOR)
router.post(
  '/:batchId/update-counts',
  requireRole(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.INVIGILATOR
  ),
  BatchScriptController.updateSubmissionCount
);

export default router;
