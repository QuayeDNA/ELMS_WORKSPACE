import { Router } from "express";
import { examLogisticsController } from "../controllers/examLogisticsController";
import { authenticateToken, requireRole } from "../middleware/auth";
import { UserRole } from "../types/auth";

const router = Router();

// Apply authentication to all logistics routes
router.use(authenticateToken);

// ========================================
// INVIGILATOR ASSIGNMENT ROUTES
// ========================================

/**
 * POST /api/exam-logistics/assign-invigilator
 * Assign an invigilator to an exam entry
 * Requires: ADMIN, EXAMS_OFFICER, SUPER_ADMIN
 */
router.post(
  "/assign-invigilator",
  requireRole(UserRole.ADMIN, UserRole.EXAMS_OFFICER, UserRole.SUPER_ADMIN),
  examLogisticsController.assignInvigilator
);

/**
 * PUT /api/exam-logistics/reassign-invigilator
 * Reassign an invigilator to a different exam entry or venue
 * Requires: ADMIN, EXAMS_OFFICER, SUPER_ADMIN
 */
router.put(
  "/reassign-invigilator",
  requireRole(UserRole.ADMIN, UserRole.EXAMS_OFFICER, UserRole.SUPER_ADMIN),
  examLogisticsController.reassignInvigilator
);

/**
 * PUT /api/exam-logistics/invigilator-presence
 * Update invigilator check-in/check-out status
 * Requires: ADMIN, EXAMS_OFFICER, SUPER_ADMIN, INVIGILATOR, LECTURER
 */
router.put(
  "/invigilator-presence",
  requireRole(UserRole.ADMIN, UserRole.EXAMS_OFFICER, UserRole.SUPER_ADMIN, UserRole.INVIGILATOR, UserRole.LECTURER),
  examLogisticsController.updateInvigilatorPresence
);

/**
 * GET /api/exam-logistics/timetable/:timetableId/sessions
 * Get all exam sessions in a timetable for assignment
 * Requires: ADMIN, EXAMS_OFFICER, SUPER_ADMIN
 */
router.get(
  "/timetable/:timetableId/sessions",
  requireRole(UserRole.ADMIN, UserRole.EXAMS_OFFICER, UserRole.SUPER_ADMIN),
  examLogisticsController.getTimetableSessionsForAssignment
);

/**
 * GET /api/exam-logistics/available-invigilators
 * Get available invigilators for specific date/time
 * Requires: ADMIN, EXAMS_OFFICER, SUPER_ADMIN
 */
router.get(
  "/available-invigilators",
  requireRole(UserRole.ADMIN, UserRole.EXAMS_OFFICER, UserRole.SUPER_ADMIN),
  examLogisticsController.getAvailableInvigilators
);

/**
 * DELETE /api/exam-logistics/invigilator-assignment/:id
 * Remove an invigilator assignment
 * Requires: ADMIN, EXAMS_OFFICER, SUPER_ADMIN
 */
router.delete(
  "/invigilator-assignment/:id",
  requireRole(UserRole.ADMIN, UserRole.EXAMS_OFFICER, UserRole.SUPER_ADMIN),
  examLogisticsController.removeInvigilatorAssignment
);

// ========================================
// STUDENT VERIFICATION ROUTES
// ========================================

/**
 * POST /api/exam-logistics/check-in-student
 * Check in a student for an exam
 * Requires: ADMIN, EXAMS_OFFICER, SUPER_ADMIN, INVIGILATOR, LECTURER
 */
router.post(
  "/check-in-student",
  requireRole(UserRole.ADMIN, UserRole.EXAMS_OFFICER, UserRole.SUPER_ADMIN, UserRole.INVIGILATOR, UserRole.LECTURER),
  examLogisticsController.checkInStudent
);

/**
 * PUT /api/exam-logistics/change-student-room
 * Change a student's assigned room during exam
 * Requires: ADMIN, EXAMS_OFFICER, SUPER_ADMIN
 */
router.put(
  "/change-student-room",
  requireRole(UserRole.ADMIN, UserRole.EXAMS_OFFICER, UserRole.SUPER_ADMIN),
  examLogisticsController.changeStudentRoom
);

// ========================================
// INCIDENT MANAGEMENT ROUTES
// ========================================

/**
 * POST /api/exam-logistics/report-incident
 * Report an exam incident
 * Requires: ADMIN, EXAMS_OFFICER, SUPER_ADMIN, INVIGILATOR, LECTURER
 */
router.post(
  "/report-incident",
  requireRole(UserRole.ADMIN, UserRole.EXAMS_OFFICER, UserRole.SUPER_ADMIN, UserRole.INVIGILATOR, UserRole.LECTURER),
  examLogisticsController.reportExamIncident
);

/**
 * PUT /api/exam-logistics/resolve-incident
 * Resolve an exam incident
 * Requires: ADMIN, EXAMS_OFFICER, SUPER_ADMIN
 */
router.put(
  "/resolve-incident",
  requireRole(UserRole.ADMIN, UserRole.EXAMS_OFFICER, UserRole.SUPER_ADMIN),
  examLogisticsController.resolveExamIncident
);

// ========================================
// VENUE OFFICER ASSIGNMENT ROUTES
// ========================================

/**
 * POST /api/exam-logistics/assign-officer-to-venue
 * Assign an officer to a venue within a timetable
 * Requires: ADMIN, SUPER_ADMIN
 */
router.post(
  "/assign-officer-to-venue",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  examLogisticsController.assignOfficerToVenue
);

/**
 * DELETE /api/exam-logistics/officer-assignment/:assignmentId
 * Remove an officer assignment
 * Requires: ADMIN, SUPER_ADMIN
 */
router.delete(
  "/officer-assignment/:assignmentId",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  examLogisticsController.removeOfficerAssignment
);

/**
 * GET /api/exam-logistics/venue-officers/:timetableId/:venueId
 * Get all officers assigned to a venue (within a timetable)
 * Requires: ADMIN, EXAMS_OFFICER, SUPER_ADMIN
 */
router.get(
  "/venue-officers/:timetableId/:venueId",
  requireRole(UserRole.ADMIN, UserRole.EXAMS_OFFICER, UserRole.SUPER_ADMIN),
  examLogisticsController.getVenueOfficers
);

/**
 * GET /api/exam-logistics/officer-venues/:timetableId/:officerId
 * Get all venues assigned to an officer (within a timetable)
 * Requires: ADMIN, EXAMS_OFFICER, SUPER_ADMIN
 */
router.get(
  "/officer-venues/:timetableId/:officerId",
  requireRole(UserRole.ADMIN, UserRole.EXAMS_OFFICER, UserRole.SUPER_ADMIN),
  examLogisticsController.getOfficerVenues
);

/**
 * GET /api/exam-logistics/timetable-venue-assignments/:timetableId
 * Get all venue officer assignments for a timetable
 * Requires: ADMIN, SUPER_ADMIN
 */
router.get(
  "/timetable-venue-assignments/:timetableId",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  examLogisticsController.getTimetableVenueAssignments
);

/**
 * GET /api/exam-logistics/my-assigned-venues
 * Get venues assigned to the current officer across all active timetables
 * Requires: EXAMS_OFFICER, ADMIN, SUPER_ADMIN
 */
router.get(
  "/my-assigned-venues",
  requireRole(UserRole.EXAMS_OFFICER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  examLogisticsController.getMyAssignedVenues
);

// ========================================
// DASHBOARD ROUTES
// ========================================

/**
 * GET /api/exam-logistics/institution-dashboard
 * Get institution-wide logistics dashboard
 * Requires: ADMIN, EXAMS_OFFICER, SUPER_ADMIN
 */
router.get(
  "/institution-dashboard",
  requireRole(UserRole.ADMIN, UserRole.EXAMS_OFFICER, UserRole.SUPER_ADMIN),
  examLogisticsController.getInstitutionDashboard
);

/**
 * GET /api/exam-logistics/exams-officer-dashboard
 * Get exams officer specific dashboard
 * Requires: EXAMS_OFFICER, ADMIN, SUPER_ADMIN
 */
router.get(
  "/exams-officer-dashboard",
  requireRole(UserRole.EXAMS_OFFICER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  examLogisticsController.getExamsOfficerDashboard
);

/**
 * GET /api/exam-logistics/invigilator-dashboard
 * Get invigilator specific dashboard
 * Requires: INVIGILATOR, ADMIN, EXAMS_OFFICER, SUPER_ADMIN, LECTURER
 */
router.get(
  "/invigilator-dashboard",
  requireRole(UserRole.ADMIN, UserRole.EXAMS_OFFICER, UserRole.SUPER_ADMIN, UserRole.INVIGILATOR, UserRole.LECTURER),
  examLogisticsController.getInvigilatorDashboard
);

// ========================================
// LOGS AND AUDIT ROUTES
// ========================================

/**
 * GET /api/exam-logistics/session-logs/:examEntryId
 * Get session logs for a specific exam entry
 * Requires: ADMIN, EXAMS_OFFICER, SUPER_ADMIN
 */
router.get(
  "/session-logs/:examEntryId",
  requireRole(UserRole.ADMIN, UserRole.EXAMS_OFFICER, UserRole.SUPER_ADMIN),
  examLogisticsController.getSessionLogs
);

/**
 * GET /api/exam-logistics/invigilator-assignments/:examEntryId
 * Get invigilator assignments for a specific exam entry
 * Requires: ADMIN, EXAMS_OFFICER, SUPER_ADMIN
 */
router.get(
  "/invigilator-assignments/:examEntryId",
  requireRole(UserRole.ADMIN, UserRole.EXAMS_OFFICER, UserRole.SUPER_ADMIN),
  examLogisticsController.getInvigilatorAssignments
);

/**
 * GET /api/exam-logistics/student-verifications/:examEntryId
 * Get student verifications for a specific exam entry
 * Requires: ADMIN, EXAMS_OFFICER, SUPER_ADMIN, INVIGILATOR, LECTURER
 */
router.get(
  "/student-verifications/:examEntryId",
  requireRole(UserRole.ADMIN, UserRole.EXAMS_OFFICER, UserRole.SUPER_ADMIN, UserRole.INVIGILATOR, UserRole.LECTURER),
  examLogisticsController.getStudentVerifications
);

/**
 * GET /api/exam-logistics/incidents/:examEntryId
 * Get exam incidents for a specific exam entry
 * Requires: ADMIN, EXAMS_OFFICER, SUPER_ADMIN
 */
router.get(
  "/incidents/:examEntryId",
  requireRole(UserRole.ADMIN, UserRole.EXAMS_OFFICER, UserRole.SUPER_ADMIN),
  examLogisticsController.getExamIncidents
);

export default router;
