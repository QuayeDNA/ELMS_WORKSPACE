import { Router } from 'express';
import { courseController } from '../controllers/courseController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../types/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all courses with pagination and filtering
router.get('/', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.LECTURER), courseController.getCourses);

// Get single course by ID
router.get('/:id', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.LECTURER, UserRole.STUDENT), courseController.getCourseById);

// Create new course
router.post('/', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN), courseController.createCourse);

// Update course
router.put('/:id', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN), courseController.updateCourse);

// Delete course
router.delete('/:id', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), courseController.deleteCourse);

// Get courses by department
router.get('/department/:departmentId', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.LECTURER), courseController.getCoursesByDepartment);

// Get courses by program
router.get('/program/:programId', requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.LECTURER, UserRole.STUDENT), courseController.getCoursesByProgram);

export default router;
