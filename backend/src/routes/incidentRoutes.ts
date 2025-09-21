import { Router } from "express";
import { incidentController } from "../controllers/incidentController";
import { authenticateToken, requireRole } from "../middleware/auth";
import { UserRole } from "../types/auth";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all incidents with pagination and filtering
router.get(
  "/",
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.INVIGILATOR
  ),
  incidentController.getIncidents
);

// Get single incident by ID
router.get(
  "/:id",
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.INVIGILATOR,
    UserRole.LECTURER
  ),
  incidentController.getIncidentById
);

// Create new incident
router.post(
  "/",
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.INVIGILATOR,
    UserRole.LECTURER,
    UserRole.STUDENT
  ),
  incidentController.createIncident
);

// Update incident
router.put(
  "/:id",
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER
  ),
  incidentController.updateIncident
);

// Assign incident to user
router.patch(
  "/:id/assign",
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER
  ),
  incidentController.assignIncident
);

// Resolve incident
router.patch(
  "/:id/resolve",
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER
  ),
  incidentController.resolveIncident
);

// Delete incident
router.delete(
  "/:id",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  incidentController.deleteIncident
);

// Get incidents by exam
router.get(
  "/exam/:examId",
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.INVIGILATOR,
    UserRole.LECTURER
  ),
  incidentController.getIncidentsByExam
);

// Get incidents by script
router.get(
  "/script/:scriptId",
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.SCRIPT_HANDLER,
    UserRole.LECTURER
  ),
  incidentController.getIncidentsByScript
);

// Get incidents reported by user
router.get(
  "/reporter/:userId",
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER
  ),
  incidentController.getIncidentsByReporter
);

// Get incidents assigned to user
router.get(
  "/assignee/:userId",
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER
  ),
  incidentController.getIncidentsByAssignee
);

// Get incident statistics
router.get(
  "/stats/overview",
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER
  ),
  incidentController.getIncidentStats
);

export default router;
