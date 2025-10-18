import express from 'express';
import { academicPeriodController } from '../controllers/academicPeriodController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../types/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// ========================================
// ACADEMIC YEAR ROUTES
// ========================================

// Public routes (authenticated users)
router.get('/academic-years/current', academicPeriodController.getCurrentAcademicYear);
router.get('/academic-years/stats', academicPeriodController.getAcademicPeriodStats);

// Admin routes - require SUPER_ADMIN, ADMIN, or FACULTY_ADMIN roles
router.get('/academic-years', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN), academicPeriodController.getAcademicYears);
router.get('/academic-years/:id', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN), academicPeriodController.getAcademicYearById);
router.post('/academic-years', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), academicPeriodController.createAcademicYear);
router.put('/academic-years/:id', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), academicPeriodController.updateAcademicYear);
router.delete('/academic-years/:id', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), academicPeriodController.deleteAcademicYear);
router.patch('/academic-years/:id/set-current', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), academicPeriodController.setCurrentAcademicYear);

// ========================================
// SEMESTER ROUTES
// ========================================

// Public routes (authenticated users)
router.get('/semesters/current', academicPeriodController.getCurrentSemester);

// Admin routes - require SUPER_ADMIN, ADMIN, or FACULTY_ADMIN roles
router.get('/semesters', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN), academicPeriodController.getSemesters);
router.get('/semesters/:id', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN), academicPeriodController.getSemesterById);
router.post('/semesters', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), academicPeriodController.createSemester);
router.put('/semesters/:id', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), academicPeriodController.updateSemester);
router.delete('/semesters/:id', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), academicPeriodController.deleteSemester);
router.patch('/semesters/:id/set-current', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), academicPeriodController.setCurrentSemester);

// ========================================
// ACADEMIC PERIOD ROUTES (NEW)
// ========================================

// Public routes (authenticated users)
router.get('/periods/current', academicPeriodController.getCurrentAcademicPeriod);
router.get('/periods/:id/status', academicPeriodController.getAcademicPeriodStatus);

// Admin routes - read access for admins and faculty admin
router.get('/periods', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN), academicPeriodController.getAcademicPeriods);
router.get('/periods/:id', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN), academicPeriodController.getAcademicPeriodById);
router.get('/periods/semester/:semesterId', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN), academicPeriodController.getAcademicPeriodBySemester);

// Admin routes - write access for super admin and admin only
router.post('/periods', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), academicPeriodController.createAcademicPeriod);
router.put('/periods/:id', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), academicPeriodController.updateAcademicPeriod);
router.delete('/periods/:id', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), academicPeriodController.deleteAcademicPeriod);

// Registration management - require admin roles
router.patch('/periods/:id/open-registration', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), academicPeriodController.openRegistration);
router.patch('/periods/:id/close-registration', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), academicPeriodController.closeRegistration);

// Add/Drop management - require admin roles
router.patch('/periods/:id/open-add-drop', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), academicPeriodController.openAddDrop);
router.patch('/periods/:id/close-add-drop', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), academicPeriodController.closeAddDrop);

export default router;
