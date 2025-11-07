import express from "express";
import { examTimetableController } from "../controllers/examTimetableController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// ========================================
// TIMETABLE ENTRY ROUTES (standalone, not nested)
// ========================================

// Batch create entries (replaces bulk upload)
router.post("/batch", examTimetableController.batchCreateEntries);

// Get single entry by ID
router.get("/:id", examTimetableController.getTimetableEntryById);

// Update entry
router.put("/:id", examTimetableController.updateTimetableEntry);

// Delete entry
router.delete("/:id", examTimetableController.deleteTimetableEntry);

export default router;
