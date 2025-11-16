import { Request, Response } from "express";
import { venueService } from "../services/venueService";
import { UserRole } from "../types/auth";
import {
  CreateVenueData,
  UpdateVenueData,
  CreateRoomData,
  UpdateRoomData,
  VenueQuery,
  RoomQuery,
} from "../types/venue";

export const venueController = {
  // Get all venues with pagination and filtering
  async getVenues(req: Request, res: Response) {
    try {
      // Get user's institution from JWT token
      const userInstitutionId = (req as any).user?.institutionId;
      const userRole = (req as any).user?.role;

      // Super admins can query across institutions, others are scoped to their institution
      const institutionId = userRole === 'SUPER_ADMIN'
        ? (req.query.institutionId ? parseInt(req.query.institutionId as string) : undefined)
        : userInstitutionId;

      const query: VenueQuery = {
        institutionId,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: (req.query.search as string) || "",
        sortBy: (req.query.sortBy as string) || "name",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "asc",
      };

      const result = await venueService.getVenues(query);
      res.json(result);
    } catch (error) {
      console.error("Error fetching venues:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch venues",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get single venue by ID
  async getVenueById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid venue ID",
        });
      }

      const venue = await venueService.getVenueById(id);
      if (!venue) {
        return res.status(404).json({
          success: false,
          message: "Venue not found",
        });
      }

      res.json({
        success: true,
        data: venue,
      });
    } catch (error) {
      console.error("Error fetching venue:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch venue",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Create new venue
  async createVenue(req: Request, res: Response) {
    try {
      const data: CreateVenueData = {
        name: req.body.name,
        location: req.body.location,
        capacity: req.body.capacity,
        institutionId: req.body.institutionId,
      };

      // Validate required fields
      if (
        !data.name ||
        !data.location ||
        !data.capacity ||
        !data.institutionId
      ) {
        return res.status(400).json({
          success: false,
          message: "Name, location, capacity, and institutionId are required",
        });
      }

      const venue = await venueService.createVenue(data);
      res.status(201).json({
        success: true,
        message: "Venue created successfully",
        data: venue,
      });
    } catch (error) {
      console.error("Error creating venue:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create venue",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Update venue
  async updateVenue(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid venue ID",
        });
      }

      const data: UpdateVenueData = {
        name: req.body.name,
        location: req.body.location,
        capacity: req.body.capacity,
      };

      const venue = await venueService.updateVenue(id, data);
      res.json({
        success: true,
        message: "Venue updated successfully",
        data: venue,
      });
    } catch (error) {
      console.error("Error updating venue:", error);
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      res.status(statusCode).json({
        success: false,
        message: "Failed to update venue",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Delete venue
  async deleteVenue(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid venue ID",
        });
      }

      await venueService.deleteVenue(id);
      res.json({
        success: true,
        message: "Venue deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting venue:", error);
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      res.status(statusCode).json({
        success: false,
        message: "Failed to delete venue",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get venues by institution
  async getVenuesByInstitution(req: Request, res: Response) {
    try {
      const institutionId = parseInt(req.params.institutionId);
      if (isNaN(institutionId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid institution ID",
        });
      }

      const query: Omit<VenueQuery, "institutionId"> = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: (req.query.search as string) || "",
        sortBy: (req.query.sortBy as string) || "name",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "asc",
      };

      const result = await venueService.getVenuesByInstitution(
        institutionId,
        query
      );
      res.json(result);
    } catch (error) {
      console.error("Error fetching venues by institution:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch venues by institution",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get all rooms with pagination and filtering
  async getRooms(req: Request, res: Response) {
    try {
      const query: RoomQuery = {
        venueId: req.query.venueId
          ? parseInt(req.query.venueId as string)
          : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: (req.query.search as string) || "",
        sortBy: (req.query.sortBy as string) || "name",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "asc",
      };

      const result = await venueService.getRooms(query);
      res.json(result);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch rooms",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get single room by ID
  async getRoomById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid room ID",
        });
      }

      const room = await venueService.getRoomById(id);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Room not found",
        });
      }

      res.json({
        success: true,
        data: room,
      });
    } catch (error) {
      console.error("Error fetching room:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch room",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Create new room
  async createRoom(req: Request, res: Response) {
    try {
      const data: CreateRoomData = {
        name: req.body.name,
        capacity: req.body.capacity,
        venueId: req.body.venueId,
      };

      // Validate required fields
      if (!data.name || !data.capacity || !data.venueId) {
        return res.status(400).json({
          success: false,
          message: "Name, capacity, and venueId are required",
        });
      }

      const room = await venueService.createRoom(data);
      res.status(201).json({
        success: true,
        message: "Room created successfully",
        data: room,
      });
    } catch (error) {
      console.error("Error creating room:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create room",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Update room
  async updateRoom(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid room ID",
        });
      }

      const data: UpdateRoomData = {
        name: req.body.name,
        capacity: req.body.capacity,
      };

      const room = await venueService.updateRoom(id, data);
      res.json({
        success: true,
        message: "Room updated successfully",
        data: room,
      });
    } catch (error) {
      console.error("Error updating room:", error);
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      res.status(statusCode).json({
        success: false,
        message: "Failed to update room",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Delete room
  async deleteRoom(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid room ID",
        });
      }

      await venueService.deleteRoom(id);
      res.json({
        success: true,
        message: "Room deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting room:", error);
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      res.status(statusCode).json({
        success: false,
        message: "Failed to delete room",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get rooms by venue
  async getRoomsByVenue(req: Request, res: Response) {
    try {
      const venueId = parseInt(req.params.venueId);
      if (isNaN(venueId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid venue ID",
        });
      }

      const query: Omit<RoomQuery, "venueId"> = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: (req.query.search as string) || "",
        sortBy: (req.query.sortBy as string) || "name",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "asc",
      };

      const result = await venueService.getRoomsByVenue(venueId, query);
      res.json(result);
    } catch (error) {
      console.error("Error fetching rooms by venue:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch rooms by venue",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
