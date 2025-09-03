import { Router } from 'express';
import { departmentController } from '../controllers/departmentController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../types/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// ========================================
// DEPARTMENT ROUTES
// ========================================

// GET /api/departments - Get all departments with pagination and filtering
// Accessible by: Super Admin, Institution Admin, Faculty Admin, Lecturer
router.get('/', 
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.LECTURER),
  departmentController.getDepartments
);

// GET /api/departments/:id - Get single department by ID
// Accessible by: Super Admin, Institution Admin, Faculty Admin, Lecturer
router.get('/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.LECTURER),
  departmentController.getDepartmentById
);

// POST /api/departments - Create new department
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.post('/',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  departmentController.createDepartment
);

// PUT /api/departments/:id - Update department
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.put('/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  departmentController.updateDepartment
);

// DELETE /api/departments/:id - Delete department
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.delete('/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  departmentController.deleteDepartment
);

// ========================================
// DEPARTMENT SCOPED ROUTES
// ========================================

// GET /api/departments/faculty/:facultyId - Get departments by faculty
// Accessible by: Super Admin, Institution Admin, Faculty Admin, Lecturer
router.get('/faculty/:facultyId',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.LECTURER),
  departmentController.getDepartmentsByFaculty
);

// GET /api/departments/institution/:institutionId - Get departments by institution
// Accessible by: Super Admin, Institution Admin
router.get('/institution/:institutionId',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  departmentController.getDepartmentsByInstitution
);

// GET /api/departments/stats - Get department statistics
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.get('/stats',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  departmentController.getDepartmentStats
);

export default router;
