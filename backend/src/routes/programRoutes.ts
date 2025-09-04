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
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.get('/',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  programController.getPrograms
);

// GET /api/programs/:id - Get single program by ID
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.get('/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  programController.getProgramById
);

// POST /api/programs - Create new program
// Accessible by: Super Admin, Institution Admin
router.post('/',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  programController.createProgram
);

// PUT /api/programs/:id - Update program
// Accessible by: Super Admin, Institution Admin
router.put('/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  programController.updateProgram
);

// DELETE /api/programs/:id - Delete program
// Accessible by: Super Admin only
router.delete('/:id',
  requireRole(UserRole.SUPER_ADMIN),
  programController.deleteProgram
);

// GET /api/departments/:departmentId/programs - Get programs by department
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.get('/departments/:departmentId/programs',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  programController.getProgramsByDepartment
);

export { router as programRoutes };
