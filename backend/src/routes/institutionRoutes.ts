import { Router } from 'express';
import { institutionController } from '../controllers/institutionController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../types/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// ========================================
// INSTITUTION ROUTES
// ========================================

// GET /api/institutions - Get all institutions with pagination and filtering
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.get('/', 
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  institutionController.getInstitutions
);

// GET /api/institutions/:id - Get single institution by ID
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.get('/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  institutionController.getInstitutionById
);

// POST /api/institutions - Create new institution
// Accessible by: Super Admin only
router.post('/',
  requireRole(UserRole.SUPER_ADMIN),
  institutionController.createInstitution
);

// PUT /api/institutions/:id - Update institution
// Accessible by: Super Admin, Institution Admin (own institution only)
router.put('/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  institutionController.updateInstitution
);

// DELETE /api/institutions/:id - Delete institution
// Accessible by: Super Admin only
router.delete('/:id',
  requireRole(UserRole.SUPER_ADMIN),
  institutionController.deleteInstitution
);

// POST /api/institutions/with-admin - Create institution with admin user
// Accessible by: Super Admin only
router.post('/with-admin',
  requireRole(UserRole.SUPER_ADMIN),
  institutionController.createInstitutionWithAdmin
);

// GET /api/institutions/:id/analytics - Get institution analytics
// Accessible by: Super Admin, Institution Admin (own institution only)
router.get('/:id/analytics',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  institutionController.getInstitutionAnalytics
);

// GET /api/institutions/analytics/overview - Get overall analytics
// Accessible by: Super Admin only
router.get('/analytics/overview',
  requireRole(UserRole.SUPER_ADMIN),
  institutionController.getOverallAnalytics
);

export { router as institutionRoutes };
