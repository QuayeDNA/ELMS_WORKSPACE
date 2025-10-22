import express from "express";
import { examTimetableController } from "../controllers/examTimetableController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// ========================================
// CONFLICT ROUTES (standalone)
// ========================================

// Resolve a conflict
router.post("/:conflictId/resolve", examTimetableController.resolveConflict);

export default router;
