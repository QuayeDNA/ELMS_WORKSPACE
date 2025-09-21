import { Router } from "express";
import { venueController } from "../controllers/venueController";
import { authenticateToken, requireRole } from "../middleware/auth";
import { UserRole } from "../types/auth";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// ========================================
// VENUE ROUTES
// ========================================

// Get all venues with pagination and filtering
router.get(
  "/",
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.LECTURER
  ),
  venueController.getVenues
);

// Get single venue by ID
router.get(
  "/:id",
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.LECTURER
  ),
  venueController.getVenueById
);

// Create new venue
router.post(
  "/",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  venueController.createVenue
);

// Update venue
router.put(
  "/:id",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  venueController.updateVenue
);

// Delete venue
router.delete(
  "/:id",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  venueController.deleteVenue
);

// Get venues by institution
router.get(
  "/institution/:institutionId",
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.LECTURER
  ),
  venueController.getVenuesByInstitution
);

// ========================================
// ROOM ROUTES
// ========================================

// Get all rooms with pagination and filtering
router.get(
  "/rooms/all",
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.LECTURER
  ),
  venueController.getRooms
);

// Get single room by ID
router.get(
  "/rooms/:id",
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.LECTURER
  ),
  venueController.getRoomById
);

// Create new room
router.post(
  "/:venueId/rooms",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  venueController.createRoom
);

// Update room
router.put(
  "/rooms/:id",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  venueController.updateRoom
);

// Delete room
router.delete(
  "/rooms/:id",
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  venueController.deleteRoom
);

// Get rooms by venue
router.get(
  "/:venueId/rooms",
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER,
    UserRole.LECTURER
  ),
  venueController.getRoomsByVenue
);

export default router;
