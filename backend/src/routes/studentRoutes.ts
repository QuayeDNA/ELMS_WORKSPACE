import express from 'express';
import { studentController } from '../controllers/studentController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../types/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Public routes (authenticated users)
router.get('/stats', studentController.getStudentStats);

// Get all students (main list endpoint)
router.get('/', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN), studentController.getStudents);

// Get students by department
router.get(
  "/department/:departmentId",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  studentController.getStudentsByDepartment
);
router.get('/export', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN), studentController.exportStudents);
router.get('/import-template', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN), studentController.downloadImportTemplate);
router.get('/by-user-id/:userId', studentController.getStudentByUserId); // Students can view their own profile
router.get('/:id', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN), studentController.getStudentById);
router.get('/by-student-id/:studentId', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN), studentController.getStudentByStudentId);
router.post('/', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN), studentController.createStudent);
router.put('/:id', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN), studentController.updateStudent);
router.delete('/:id', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), studentController.deleteStudent);
router.patch('/:id/status', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN), studentController.updateStudentStatus);
router.post('/bulk-import', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), studentController.bulkImportStudents);

export default router;
