import express from "express";
import { examTimetableController } from "../controllers/examTimetableController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// ========================================
// TIMETABLE ROUTES
// ========================================

// Get all timetables with filtering
router.get("/", examTimetableController.getTimetables);

// Get single timetable by ID
router.get("/:id", examTimetableController.getTimetableById);

// Create new timetable
router.post("/", examTimetableController.createTimetable);

// Update timetable
router.put("/:id", examTimetableController.updateTimetable);

// Delete timetable
router.delete("/:id", examTimetableController.deleteTimetable);

// Publish timetable
router.post("/:id/publish", examTimetableController.publishTimetable);

// Submit for approval
router.post("/:id/submit-for-approval", examTimetableController.submitForApproval);

// Approve timetable
router.post("/:id/approve", examTimetableController.approveTimetable);

// Reject timetable
router.post("/:id/reject", examTimetableController.rejectTimetable);

// Get timetable statistics
router.get("/:id/statistics", examTimetableController.getTimetableStatistics);

// ========================================
// TIMETABLE ENTRY ROUTES
// ========================================

// Get entries for a timetable
router.get("/:timetableId/entries", examTimetableController.getTimetableEntries);

// Create new entry
router.post("/:timetableId/entries", examTimetableController.createTimetableEntry);

// ========================================
// CONFLICT ROUTES
// ========================================

// Detect conflicts
router.post("/:id/detect-conflicts", examTimetableController.detectConflicts);

// Get conflicts
router.get("/:id/conflicts", examTimetableController.getTimetableConflicts);

export default router;
