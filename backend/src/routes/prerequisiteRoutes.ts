import { Router } from 'express';
import { prerequisiteController } from '../controllers/prerequisiteController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../types/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * Prerequisite Routes
 * Base path: /api/prerequisites
 */

// Check prerequisites for a course
// Access: STUDENT (own), LECTURER, FACULTY_ADMIN, ADMIN
router.get(
  '/check/:studentId/:courseId',
  requireRole(UserRole.STUDENT, UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => prerequisiteController.checkPrerequisites(req, res)
);

// Get missing prerequisites
// Access: STUDENT (own), LECTURER, FACULTY_ADMIN, ADMIN
router.get(
  '/missing/:studentId/:courseId',
  requireRole(UserRole.STUDENT, UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => prerequisiteController.getMissingPrerequisites(req, res)
);

// Get course prerequisites
// Access: All authenticated users
router.get(
  '/course/:courseId/:programId',
  (req, res) => prerequisiteController.getCoursePrerequisites(req, res)
);

// Batch check prerequisites
// Access: STUDENT (own), LECTURER, FACULTY_ADMIN, ADMIN
router.post(
  '/batch-check',
  requireRole(UserRole.STUDENT, UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => prerequisiteController.batchCheckPrerequisites(req, res)
);

// Get courses requiring a prerequisite
// Access: All authenticated users
router.get(
  '/dependent/:courseId/:programId',
  (req, res) => prerequisiteController.getCoursesRequiringPrerequisite(req, res)
);

// Validate prerequisite chain
// Access: STUDENT (own), LECTURER, FACULTY_ADMIN, ADMIN
router.get(
  '/validate-chain/:studentId/:courseId',
  requireRole(UserRole.STUDENT, UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => prerequisiteController.validatePrerequisiteChain(req, res)
);

export default router;
