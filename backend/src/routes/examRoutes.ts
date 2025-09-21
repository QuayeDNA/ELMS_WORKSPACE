import { Router } from "express";
import { examController } from "../controllers/examController";
import { authenticateToken, requireRole } from "../middleware/auth";
import { UserRole } from "../types/auth";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all exams with pagination and filtering
router.get(
  "/",
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.LECTURER
  ),
  examController.getExams
);

// Get single exam by ID
router.get(
  "/:id",
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.LECTURER,
    UserRole.STUDENT
  ),
  examController.getExamById
);

// Create new exam
router.post(
  "/",
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER
  ),
  examController.createExam
);

// Update exam
router.put(
  "/:id",
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER
  ),
  examController.updateExam
);

// Update exam status
router.patch(
  "/:id/status",
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER
  ),
  examController.updateExamStatus
);

// Delete exam
router.delete(
  "/:id",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  examController.deleteExam
);

// Get exams by faculty
router.get(
  "/faculty/:facultyId",
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.LECTURER
  ),
  examController.getExamsByFaculty
);

// Get exams by course
router.get(
  "/course/:courseId",
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.LECTURER
  ),
  examController.getExamsByCourse
);

export default router;
