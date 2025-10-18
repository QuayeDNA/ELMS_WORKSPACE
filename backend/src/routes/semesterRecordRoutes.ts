import { Router } from 'express';
import { studentSemesterRecordController } from '../controllers/studentSemesterRecordController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../types/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * Student Semester Record Routes
 * Base path: /api/semester-records
 */

// Create new semester record
// Access: FACULTY_ADMIN, ADMIN
router.post(
  '/',
  requireRole(UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => studentSemesterRecordController.createSemesterRecord(req, res)
);

// Get specific semester record
// Access: STUDENT (own), LECTURER, FACULTY_ADMIN, ADMIN
router.get(
  '/:studentId/:semesterId',
  requireRole(UserRole.STUDENT, UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => studentSemesterRecordController.getSemesterRecord(req, res)
);

// Get all semester records for a student
// Access: STUDENT (own), LECTURER, FACULTY_ADMIN, ADMIN
router.get(
  '/student/:studentId',
  requireRole(UserRole.STUDENT, UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => studentSemesterRecordController.getStudentSemesterRecords(req, res)
);

// Update semester record statistics
// Access: FACULTY_ADMIN, ADMIN
router.put(
  '/:studentId/:semesterId',
  requireRole(UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => studentSemesterRecordController.updateSemesterRecord(req, res)
);

// Calculate semester GPA
// Access: FACULTY_ADMIN, ADMIN
router.post(
  '/:studentId/:semesterId/calculate-gpa',
  requireRole(UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => studentSemesterRecordController.calculateSemesterGPA(req, res)
);

// Update academic standing
// Access: FACULTY_ADMIN, ADMIN
router.post(
  '/:studentId/:semesterId/update-standing',
  requireRole(UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => studentSemesterRecordController.updateAcademicStanding(req, res)
);

// Finalize semester record
// Access: FACULTY_ADMIN, ADMIN
router.post(
  '/:studentId/:semesterId/finalize',
  requireRole(UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => studentSemesterRecordController.finalizeSemesterRecord(req, res)
);

// Get semester statistics
// Access: STUDENT (own), LECTURER, FACULTY_ADMIN, ADMIN
router.get(
  '/:studentId/:semesterId/statistics',
  requireRole(UserRole.STUDENT, UserRole.LECTURER, UserRole.FACULTY_ADMIN, UserRole.ADMIN),
  (req, res) => studentSemesterRecordController.getSemesterStatistics(req, res)
);

export default router;
