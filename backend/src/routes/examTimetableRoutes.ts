import express from "express";
import { examTimetableController } from "../controllers/examTimetableController";
import { authenticateToken, requireRole } from "../middleware/auth";
import { UserRole } from "../types/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// ========================================
// TIMETABLE ROUTES
// ========================================

// Get all timetables with filtering (all authenticated users)
router.get("/", examTimetableController.getTimetables);

// Get single timetable by ID (all authenticated users)
router.get("/:id", examTimetableController.getTimetableById);

// Create new timetable (ADMIN, EXAMS_OFFICER)
router.post(
  "/",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXAMS_OFFICER),
  examTimetableController.createTimetable
);

// Update timetable (ADMIN, EXAMS_OFFICER)
router.put(
  "/:id",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXAMS_OFFICER),
  examTimetableController.updateTimetable
);

// Update timetable status (ADMIN only)
router.put(
  "/:id/status",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  examTimetableController.updateTimetableStatus
);

// Delete timetable (ADMIN only)
router.delete(
  "/:id",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  examTimetableController.deleteTimetable
);

// Publish timetable (ADMIN, EXAMS_OFFICER)
router.post(
  "/:id/publish",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXAMS_OFFICER),
  examTimetableController.publishTimetable
);

// Create batch scripts for published timetable (ADMIN, EXAMS_OFFICER)
router.post(
  "/:id/create-batches",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXAMS_OFFICER),
  examTimetableController.createBatchScripts
);

// Submit for approval (ADMIN, EXAMS_OFFICER)
router.post(
  "/:id/submit-for-approval",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXAMS_OFFICER),
  examTimetableController.submitForApproval
);

// Approve timetable (ADMIN, FACULTY_ADMIN can approve)
router.post(
  "/:id/approve",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY_ADMIN),
  examTimetableController.approveTimetable
);

// Reject timetable (ADMIN, FACULTY_ADMIN can reject)
router.post(
  "/:id/reject",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY_ADMIN),
  examTimetableController.rejectTimetable
);

// Get timetable statistics (all authenticated users)
router.get("/:id/statistics", examTimetableController.getTimetableStatistics);

// ========================================
// TIMETABLE ENTRY ROUTES
// ========================================

// Get entries for a timetable (all authenticated users)
router.get("/:timetableId/entries", examTimetableController.getTimetableEntries);

// Create new entry (ADMIN, EXAMS_OFFICER)
router.post(
  "/:timetableId/entries",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXAMS_OFFICER),
  examTimetableController.createTimetableEntry
);

// Update entry (ADMIN, EXAMS_OFFICER, FACULTY_ADMIN)
// Permission checks are handled in the service layer
router.put(
  "/:timetableId/entries/:entryId",
  requireRole(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.FACULTY_ADMIN
  ),
  examTimetableController.updateTimetableEntry
);

// Delete entry (ADMIN, EXAMS_OFFICER only)
router.delete(
  "/:timetableId/entries/:entryId",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXAMS_OFFICER),
  examTimetableController.deleteTimetableEntry
);

// Get entry permissions (all authenticated users)
router.get(
  "/entries/:entryId/permissions",
  examTimetableController.getEntryPermissions
);

// ========================================
// CONFLICT ROUTES
// ========================================

// Detect conflicts (ADMIN, EXAMS_OFFICER)
router.post(
  "/:id/detect-conflicts",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXAMS_OFFICER),
  examTimetableController.detectConflicts
);

// Get conflicts (all authenticated users)
router.get("/:id/conflicts", examTimetableController.getTimetableConflicts);

export default router;
