import { Request, Response } from "express";
import { facultyService } from "../services/facultyService";

export const facultyController = {
  // Get all faculties with pagination and filtering
  async getFaculties(req: Request, res: Response) {
    try {
      // Get user's institution from JWT token
      const userInstitutionId = (req as any).user?.institutionId;
      const userRole = (req as any).user?.role;

      // Super admins can query across institutions, others are scoped to their institution
      const institutionId = userRole === 'SUPER_ADMIN'
        ? (req.query.institutionId ? parseInt(req.query.institutionId as string) : undefined)
        : userInstitutionId;

      const query = {
        institutionId,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: (req.query.search as string) || "",
        sortBy: (req.query.sortBy as "name" | "code" | "createdAt") || "name",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "asc",
      };

      const result = await facultyService.getFaculties(query);
      res.json(result);
    } catch (error) {
      console.error("Error fetching faculties:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch faculties",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get single faculty by ID
  async getFacultyById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid faculty ID",
        });
      }

      const faculty = await facultyService.getFacultyById(id);
      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: "Faculty not found",
        });
      }

      res.json({
        success: true,
        data: faculty,
        message: "Faculty retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching faculty:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch faculty",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Create new faculty
  async createFaculty(req: Request, res: Response) {
    try {
      const facultyData = {
        name: req.body.name,
        code: req.body.code,
        institutionId: parseInt(req.body.institutionId),
        description: req.body.description,
      };

      // Basic validation
      if (
        !facultyData.name ||
        !facultyData.code ||
        !facultyData.institutionId
      ) {
        return res.status(400).json({
          success: false,
          message: "Faculty name, code, and institution ID are required",
        });
      }

      const faculty = await facultyService.createFaculty(facultyData);
      res.status(201).json({
        success: true,
        message: "Faculty created successfully",
        data: faculty,
      });
    } catch (error) {
      console.error("Error creating faculty:", error);

      // Handle unique constraint violations
      if (error instanceof Error && error.message.includes("already exists")) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to create faculty",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Update faculty
  async updateFaculty(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid faculty ID",
        });
      }

      const updateData = {
        name: req.body.name,
        code: req.body.code,
        description: req.body.description,
      };

      const faculty = await facultyService.updateFaculty(id, updateData);

      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: "Faculty not found",
        });
      }

      res.json({
        success: true,
        message: "Faculty updated successfully",
        data: faculty,
      });
    } catch (error) {
      console.error("Error updating faculty:", error);

      // Handle unique constraint violations
      if (error instanceof Error && error.message.includes("already exists")) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update faculty",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Delete faculty
  async deleteFaculty(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid faculty ID",
        });
      }

      const success = await facultyService.deleteFaculty(id);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Faculty not found",
        });
      }

      res.json({
        success: true,
        message: "Faculty deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting faculty:", error);

      // Handle foreign key constraints
      if (
        error instanceof Error &&
        error.message.includes("existing users or departments")
      ) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to delete faculty",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get faculties by institution
  async getFacultiesByInstitution(req: Request, res: Response) {
    try {
      const institutionId = parseInt(req.params.institutionId);
      if (isNaN(institutionId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid institution ID",
        });
      }

      const faculties =
        await facultyService.getFacultiesByInstitution(institutionId);
      res.json({
        success: true,
        data: faculties,
      });
    } catch (error) {
      console.error("Error fetching faculties by institution:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch faculties by institution",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Assign dean to faculty
  async assignDean(req: Request, res: Response) {
    try {
      const facultyId = parseInt(req.params.id);
      const { deanId } = req.body;

      if (isNaN(facultyId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid faculty ID",
        });
      }

      if (!deanId || isNaN(deanId)) {
        return res.status(400).json({
          success: false,
          message: "Valid dean ID is required",
        });
      }

      const faculty = await facultyService.assignDean(facultyId, deanId);

      res.json({
        success: true,
        message: "Dean assigned successfully",
        data: faculty,
      });
    } catch (error) {
      console.error("Error assigning dean:", error);

      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          return res.status(404).json({
            success: false,
            message: error.message,
          });
        }
        if (error.message.includes("must belong to the same institution")) {
          return res.status(400).json({
            success: false,
            message: error.message,
          });
        }
      }

      res.status(500).json({
        success: false,
        message: "Failed to assign dean",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Remove dean from faculty
  async removeDean(req: Request, res: Response) {
    try {
      const facultyId = parseInt(req.params.id);

      if (isNaN(facultyId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid faculty ID",
        });
      }

      const faculty = await facultyService.removeDean(facultyId);

      res.json({
        success: true,
        message: "Dean removed successfully",
        data: faculty,
      });
    } catch (error) {
      console.error("Error removing dean:", error);

      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to remove dean",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get faculty analytics
  async getFacultyAnalytics(req: Request, res: Response) {
    try {
      const institutionId = req.query.institutionId
        ? parseInt(req.query.institutionId as string)
        : undefined;

      const analytics = await facultyService.getFacultyAnalytics(institutionId);

      res.json({
        success: true,
        data: analytics,
        message: "Faculty analytics retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching faculty analytics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch faculty analytics",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
