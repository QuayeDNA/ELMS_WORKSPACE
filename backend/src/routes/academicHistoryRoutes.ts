import { Router } from 'express';
import { studentAcademicHistoryController } from '../controllers/studentAcademicHistoryController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../types/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * Student Academic History Routes
 * Base path: /api/academic-history
 */

// Create academic history
// Access: FACULTY_ADMIN, ADMIN
router.post(
  '/',
  requireRole(UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => studentAcademicHistoryController.createAcademicHistory(req, res)
);

// Get academic history
// Access: STUDENT (own), LECTURER, FACULTY_ADMIN, ADMIN
router.get(
  '/:studentId',
  requireRole(UserRole.STUDENT, UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => studentAcademicHistoryController.getAcademicHistory(req, res)
);

// Update cumulative GPA
// Access: FACULTY_ADMIN, ADMIN
router.post(
  '/:studentId/update-gpa',
  requireRole(UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => studentAcademicHistoryController.updateCumulativeGPA(req, res)
);

// Check level progression
// Access: STUDENT (own), LECTURER, FACULTY_ADMIN, ADMIN
router.get(
  '/:studentId/level-progression',
  requireRole(UserRole.STUDENT, UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => studentAcademicHistoryController.checkLevelProgression(req, res)
);

// Update academic standing
// Access: FACULTY_ADMIN, ADMIN
router.post(
  '/:studentId/update-standing',
  requireRole(UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => studentAcademicHistoryController.updateAcademicStanding(req, res)
);

// Update current semester
// Access: FACULTY_ADMIN, ADMIN
router.put(
  '/:studentId/current-semester',
  requireRole(UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => studentAcademicHistoryController.updateCurrentSemester(req, res)
);

// Check graduation eligibility
// Access: STUDENT (own), LECTURER, FACULTY_ADMIN, ADMIN
router.get(
  '/:studentId/graduation-eligibility',
  requireRole(UserRole.STUDENT, UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => studentAcademicHistoryController.checkGraduationEligibility(req, res)
);

// Mark as graduated
// Access: FACULTY_ADMIN, ADMIN
router.post(
  '/:studentId/graduate',
  requireRole(UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => studentAcademicHistoryController.markAsGraduated(req, res)
);

// Get academic summary
// Access: STUDENT (own), LECTURER, FACULTY_ADMIN, ADMIN
router.get(
  '/:studentId/summary',
  requireRole(UserRole.STUDENT, UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => studentAcademicHistoryController.getAcademicSummary(req, res)
);

// Get academic transcript
// Access: STUDENT (own), LECTURER, FACULTY_ADMIN, ADMIN
router.get(
  '/:studentId/transcript',
  requireRole(UserRole.STUDENT, UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => studentAcademicHistoryController.getTranscript(req, res)
);

export default router;
