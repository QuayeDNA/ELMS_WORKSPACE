import { Router } from 'express';
import { registrationController } from '../controllers/registrationController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../types/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * Course Registration Routes
 * Base path: /api/registrations
 */

// Create a new registration
// Access: STUDENT, LECTURER (as advisor), FACULTY_ADMIN, ADMIN
router.post(
  '/',
  requireRole(UserRole.STUDENT, UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => registrationController.createRegistration(req, res)
);

// Get registration by ID
// Access: STUDENT (own), LECTURER, FACULTY_ADMIN, ADMIN
router.get(
  '/:id',
  requireRole(UserRole.STUDENT, UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => registrationController.getRegistrationById(req, res)
);

// Get all registrations for a student
// Access: STUDENT (own), LECTURER, FACULTY_ADMIN, ADMIN
router.get(
  '/student/:studentId',
  requireRole(UserRole.STUDENT, UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => registrationController.getStudentRegistrations(req, res)
);

// Add course to registration
// Access: STUDENT (own), LECTURER (as advisor)
router.post(
  '/:id/courses',
  requireRole(UserRole.STUDENT, UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => registrationController.addCourseToRegistration(req, res)
);

// Remove course from registration
// Access: STUDENT (own), LECTURER (as advisor)
router.delete(
  '/courses/:courseId',
  requireRole(UserRole.STUDENT, UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => registrationController.removeCourseFromRegistration(req, res)
);

// Submit registration for approval
// Access: STUDENT (own)
router.post(
  '/:id/submit',
  requireRole(UserRole.STUDENT),
  (req, res) => registrationController.submitRegistration(req, res)
);

// Approve registration
// Access: LECTURER (as advisor), FACULTY_ADMIN, ADMIN
router.post(
  '/:id/approve',
  requireRole(UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => registrationController.approveRegistration(req, res)
);

// Reject registration
// Access: LECTURER (as advisor), FACULTY_ADMIN, ADMIN
router.post(
  '/:id/reject',
  requireRole(UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => registrationController.rejectRegistration(req, res)
);

// Validate registration
// Access: STUDENT (own), LECTURER, FACULTY_ADMIN, ADMIN
router.get(
  '/:id/validate',
  requireRole(UserRole.STUDENT, UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => registrationController.validateRegistration(req, res)
);

// Check course eligibility
// Access: STUDENT (own), LECTURER, FACULTY_ADMIN, ADMIN
router.get(
  '/eligibility/:studentId/:courseOfferingId',
  requireRole(UserRole.STUDENT, UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => registrationController.checkCourseEligibility(req, res)
);

// Get eligible courses for a semester
// Access: STUDENT (own), LECTURER, FACULTY_ADMIN, ADMIN
router.get(
  '/eligible-courses/:studentId/:semesterId',
  requireRole(UserRole.STUDENT, UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => registrationController.getEligibleCourses(req, res)
);

// Get registration summary
// Access: STUDENT (own), LECTURER, FACULTY_ADMIN, ADMIN
router.get(
  '/summary/:studentId/:semesterId',
  requireRole(UserRole.STUDENT, UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => registrationController.getRegistrationSummary(req, res)
);

// Bulk create registrations (admin feature)
// Access: ADMIN, FACULTY_ADMIN
router.post(
  '/bulk',
  requireRole(UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  (req, res) => registrationController.bulkCreateRegistrations(req, res)
);

// Get students by registration status
// Access: ADMIN, FACULTY_ADMIN
router.get(
  '/students-by-status/:semesterId',
  requireRole(UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  (req, res) => registrationController.getStudentsByRegistrationStatus(req, res)
);

// Register student for all eligible courses
// Access: STUDENT (own)
router.post(
  '/register-all',
  requireRole(UserRole.STUDENT),
  (req, res) => registrationController.registerAllEligibleCourses(req, res)
);

export default router;
