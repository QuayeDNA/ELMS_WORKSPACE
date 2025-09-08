import express from 'express';
import { studentController } from '../controllers/studentController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../types/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Public routes (authenticated users)
router.get('/stats', studentController.getStudentStats);

// Admin routes - require SUPER_ADMIN, ADMIN, or FACULTY_ADMIN roles
router.get('/', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN), studentController.getStudents);
router.get('/:id', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN), studentController.getStudentById);
router.get('/by-student-id/:studentId', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN), studentController.getStudentByStudentId);
router.post('/', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN), studentController.createStudent);
router.put('/:id', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN), studentController.updateStudent);
router.delete('/:id', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), studentController.deleteStudent);
router.patch('/:id/status', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN), studentController.updateStudentStatus);
router.post('/bulk-import', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), studentController.bulkImportStudents);

export default router;
