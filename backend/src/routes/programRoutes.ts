import { Router } from 'express';
import { programController } from '../controllers/programController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../types/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// ========================================
// PROGRAM ROUTES
// ========================================

// GET /api/programs - Get all programs with pagination and filtering
// Accessible by: Super Admin, Institution Admin, Faculty Admin, Lecturer
router.get('/', 
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.LECTURER),
  programController.getPrograms
);

// GET /api/programs/:id - Get single program by ID
// Accessible by: Super Admin, Institution Admin, Faculty Admin, Lecturer
router.get('/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.LECTURER),
  programController.getProgramById
);

// POST /api/programs - Create new program
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.post('/',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  programController.createProgram
);

// PUT /api/programs/:id - Update program
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.put('/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  programController.updateProgram
);

// DELETE /api/programs/:id - Delete program
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.delete('/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  programController.deleteProgram
);

// ========================================
// PROGRAM SCOPED ROUTES
// ========================================

// GET /api/programs/department/:departmentId - Get programs by department
// Accessible by: Super Admin, Institution Admin, Faculty Admin, Lecturer
router.get('/department/:departmentId',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.LECTURER),
  programController.getProgramsByDepartment
);

// GET /api/programs/faculty/:facultyId - Get programs by faculty
// Accessible by: Super Admin, Institution Admin, Faculty Admin, Lecturer
router.get('/faculty/:facultyId',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.LECTURER),
  programController.getProgramsByFaculty
);

// GET /api/programs/institution/:institutionId - Get programs by institution
// Accessible by: Super Admin, Institution Admin
router.get('/institution/:institutionId',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  programController.getProgramsByInstitution
);

// GET /api/programs/stats - Get program statistics
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.get('/stats',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  programController.getProgramStats
);

export default router;
