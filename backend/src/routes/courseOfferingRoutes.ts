import { Router } from 'express';
import { courseOfferingController } from '../controllers/courseOfferingController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../types/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * Course Offering Routes
 * Base path: /api/course-offerings
 */

// Get all course offerings (with optional semester filter)
// Access: All authenticated users
router.get(
  '/',
  requireRole(
    UserRole.STUDENT,
    UserRole.LECTURER,
    UserRole.FACULTY_ADMIN,
    UserRole.ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.HOD
  ),
  (req, res) => courseOfferingController.getCourseOfferings(req, res)
);

// Get course offering by ID
// Access: All authenticated users
router.get(
  '/:id',
  requireRole(
    UserRole.STUDENT,
    UserRole.LECTURER,
    UserRole.FACULTY_ADMIN,
    UserRole.ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.HOD
  ),
  (req, res) => courseOfferingController.getCourseOfferingById(req, res)
);

export default router;
