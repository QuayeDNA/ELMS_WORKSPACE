import { Router } from "express";
import { facultyController } from "../controllers/facultyController";
import { authenticateToken, requireRole } from "../middleware/auth";
import { UserRole } from "../types/auth";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// ========================================
// FACULTY ROUTES
// ========================================

// GET /api/faculties - Get all faculties with pagination and filtering
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.get(
  "/",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  facultyController.getFaculties
);

// GET /api/faculties/:id - Get single faculty by ID
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.get(
  "/:id",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  facultyController.getFacultyById
);

// POST /api/faculties - Create new faculty
// Accessible by: Super Admin, Institution Admin
router.post(
  "/",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  facultyController.createFaculty
);

// PUT /api/faculties/:id - Update faculty
// Accessible by: Super Admin, Institution Admin
router.put(
  "/:id",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  facultyController.updateFaculty
);

// DELETE /api/faculties/:id - Delete faculty
// Accessible by: Super Admin only
router.delete(
  "/:id",
  requireRole(UserRole.SUPER_ADMIN),
  facultyController.deleteFaculty
);

// GET /api/institutions/:institutionId/faculties - Get faculties by institution
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.get(
  "/institutions/:institutionId/faculties",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  facultyController.getFacultiesByInstitution
);

// PUT /api/faculties/:id/dean - Assign dean to faculty
// Accessible by: Super Admin, Institution Admin
router.put(
  "/:id/dean",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  facultyController.assignDean
);

// DELETE /api/faculties/:id/dean - Remove dean from faculty
// Accessible by: Super Admin, Institution Admin
router.delete(
  "/:id/dean",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  facultyController.removeDean
);

export { router as facultyRoutes };
