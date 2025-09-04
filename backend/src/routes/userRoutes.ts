import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../types/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// ========================================
// USER MANAGEMENT ROUTES
// ========================================

// GET /api/users - Get all users with pagination and filtering
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.get('/',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  userController.getUsers
);

// GET /api/users/:id - Get single user by ID
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.get('/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  userController.getUserById
);

// POST /api/users - Create new user
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.post('/',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  userController.createUser
);

// PUT /api/users/:id - Update user
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.put('/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  userController.updateUser
);

// DELETE /api/users/:id - Delete user (soft delete)
// Accessible by: Super Admin only
router.delete('/:id',
  requireRole(UserRole.SUPER_ADMIN),
  userController.deleteUser
);

// GET /api/institutions/:institutionId/users - Get users by institution
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.get('/institutions/:institutionId/users',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  userController.getUsersByInstitution
);

// GET /api/faculties/:facultyId/users - Get users by faculty
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.get('/faculties/:facultyId/users',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  userController.getUsersByFaculty
);

export { router as userRoutes };
