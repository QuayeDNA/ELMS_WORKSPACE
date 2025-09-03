import { Router } from 'express';
import { courseController } from '../controllers/courseController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../types/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// ========================================
// COURSE ROUTES
// ========================================

// GET /api/courses - Get all courses with pagination and filtering
// Accessible by: Super Admin, Institution Admin, Faculty Admin, Lecturer, Student
router.get('/', 
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.LECTURER, UserRole.STUDENT),
  courseController.getCourses
);

// GET /api/courses/:id - Get single course by ID
// Accessible by: Super Admin, Institution Admin, Faculty Admin, Lecturer, Student
router.get('/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.LECTURER, UserRole.STUDENT),
  courseController.getCourseById
);

// POST /api/courses - Create new course
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.post('/',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  courseController.createCourse
);

// PUT /api/courses/:id - Update course
// Accessible by: Super Admin, Institution Admin, Faculty Admin, Lecturer (limited)
router.put('/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.LECTURER),
  courseController.updateCourse
);

// DELETE /api/courses/:id - Delete course
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.delete('/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  courseController.deleteCourse
);

// ========================================
// COURSE SCOPED ROUTES
// ========================================

// GET /api/courses/department/:departmentId - Get courses by department
// Accessible by: Super Admin, Institution Admin, Faculty Admin, Lecturer, Student
router.get('/department/:departmentId',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.LECTURER, UserRole.STUDENT),
  courseController.getCoursesByDepartment
);

// GET /api/courses/faculty/:facultyId - Get courses by faculty
// Accessible by: Super Admin, Institution Admin, Faculty Admin, Lecturer
router.get('/faculty/:facultyId',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.LECTURER),
  courseController.getCoursesByFaculty
);

// GET /api/courses/institution/:institutionId - Get courses by institution
// Accessible by: Super Admin, Institution Admin
router.get('/institution/:institutionId',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  courseController.getCoursesByInstitution
);

// GET /api/courses/stats - Get course statistics
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.get('/stats',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  courseController.getCourseStats
);

// ========================================
// PROGRAM-COURSE RELATIONSHIP ROUTES
// ========================================

// POST /api/courses/program-courses - Add course to program
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.post('/program-courses',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  courseController.addCourseToProgram
);

// PUT /api/courses/program-courses/:id - Update program course
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.put('/program-courses/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  courseController.updateProgramCourse
);

// DELETE /api/courses/program-courses/:id - Remove course from program
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.delete('/program-courses/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  courseController.removeCourseFromProgram
);

// GET /api/courses/program/:programId/courses - Get courses in a program
// Accessible by: Super Admin, Institution Admin, Faculty Admin, Lecturer, Student
router.get('/program/:programId/courses',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.LECTURER, UserRole.STUDENT),
  courseController.getProgramCourses
);

export default router;
