import express from "express";
import { programPrefixController } from "../controllers/programPrefixController";
import { authenticateToken, requireRole } from "../middleware/auth";
import { UserRole } from "../types/auth";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Admin routes - require SUPER_ADMIN or ADMIN roles
router.get(
  "/",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  programPrefixController.getProgramPrefixes
);
router.get(
  "/:programType",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  programPrefixController.getProgramPrefix
);
router.put(
  "/:programType",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  programPrefixController.updateProgramPrefix
);
router.put(
  "/bulk/update",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  programPrefixController.bulkUpdatePrefixes
);

export default router;
