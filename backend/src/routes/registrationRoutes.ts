import { Router } from 'express';
import { registrationController } from '../controllers/registrationController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../types/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * Simplified Course Registration Routes
 * Base path: /api/registrations
 */

// Register for multiple courses in one action
// Access: STUDENT
router.post(
  '/register',
  requireRole(UserRole.STUDENT),
  (req, res) => registrationController.registerForCourses(req, res)
);

// Get available courses for a student in a semester
// Access: STUDENT (own), LECTURER, FACULTY_ADMIN, ADMIN
router.get(
  '/available-courses/:studentId/:semesterId',
  requireRole(UserRole.STUDENT, UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => registrationController.getAvailableCourses(req, res)
);

// Get student's current registration for a semester
// Access: STUDENT (own), LECTURER, FACULTY_ADMIN, ADMIN
router.get(
  '/student/:studentId/:semesterId',
  requireRole(UserRole.STUDENT, UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => registrationController.getStudentRegistration(req, res)
);

// Drop courses from registration
// Access: STUDENT (own)
router.post(
  '/drop-courses',
  requireRole(UserRole.STUDENT),
  (req, res) => registrationController.dropCourses(req, res)
);

// Cancel entire registration
// Access: STUDENT (own)
router.post(
  '/cancel',
  requireRole(UserRole.STUDENT),
  (req, res) => registrationController.cancelRegistration(req, res)
);

export default router;
