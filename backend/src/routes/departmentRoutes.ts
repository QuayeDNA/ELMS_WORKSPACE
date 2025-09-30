import { Router } from "express";
import { departmentController } from "../controllers/departmentController";
import { authenticateToken, requireRole } from "../middleware/auth";
import { UserRole } from "../types/auth";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// ========================================
// DEPARTMENT ROUTES
// ========================================

// GET /api/departments - Get all departments with pagination and filtering
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.get(
  "/",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  departmentController.getDepartments
);

// GET /api/departments/:id - Get single department by ID
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.get(
  "/:id",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  departmentController.getDepartmentById
);

// POST /api/departments - Create new department
// Accessible by: Super Admin, Institution Admin
router.post(
  "/",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  departmentController.createDepartment
);

// PUT /api/departments/:id - Update department
// Accessible by: Super Admin, Institution Admin
router.put(
  "/:id",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  departmentController.updateDepartment
);

// DELETE /api/departments/:id - Delete department
// Accessible by: Super Admin only
router.delete(
  "/:id",
  requireRole(UserRole.SUPER_ADMIN),
  departmentController.deleteDepartment
);

// GET /api/faculties/:facultyId/departments - Get departments by faculty
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.get(
  "/faculties/:facultyId/departments",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  departmentController.getDepartmentsByFaculty
);

// GET /api/departments/analytics - Get department analytics
// Accessible by: Super Admin, Institution Admin, Faculty Admin
router.get(
  "/analytics",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  departmentController.getDepartmentAnalytics
);

export { router as departmentRoutes };
