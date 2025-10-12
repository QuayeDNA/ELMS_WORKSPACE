import express from "express";
import { instructorController } from "../controllers/instructorController";
import { authenticateToken, requireRole } from "../middleware/auth";
import { UserRole } from "../types/auth";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Public routes (authenticated users)
router.get("/stats", instructorController.getInstructorStats);

// Admin routes - require SUPER_ADMIN, ADMIN, or FACULTY_ADMIN roles
router.get(
  "/",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  instructorController.getInstructors
);
router.get(
  "/:id",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  instructorController.getInstructorById
);
router.get(
  "/by-staff-id/:staffId",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  instructorController.getInstructorByStaffId
);
router.post(
  "/",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  instructorController.createInstructor
);
router.put(
  "/:id",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  instructorController.updateInstructor
);
router.delete(
  "/:id",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  instructorController.deleteInstructor
);
router.patch(
  "/:id/status",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  instructorController.updateInstructorStatus
);
router.post(
  "/:id/departments",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  instructorController.assignToDepartment
);
router.delete(
  "/:id/departments/:departmentId",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  instructorController.removeFromDepartment
);
router.post(
  "/bulk-import",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  instructorController.bulkImportInstructors
);

// Get instructors by department
router.get(
  "/department/:departmentId",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  instructorController.getInstructorsByDepartment
);
router.get(
  "/export",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  instructorController.exportInstructors
);

export default router;
