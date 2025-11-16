import { Request, Response } from "express";
import { instructorService } from "../services/instructorService";
import { UserRole } from "../types/auth";

export const instructorController = {
  // Get all instructors with pagination and filtering
  async getInstructors(req: Request, res: Response) {
    try {
      // Get user's institution from JWT token
      const userInstitutionId = (req as any).user?.institutionId;
      const userRole = (req as any).user?.role;

      // Super admins can query across institutions, others are scoped to their institution
      const institutionId = userRole === 'SUPER_ADMIN'
        ? (req.query.institutionId ? parseInt(req.query.institutionId as string) : undefined)
        : userInstitutionId;

      const query = {
        departmentId: req.query.departmentId
          ? parseInt(req.query.departmentId as string)
          : undefined,
        facultyId: req.query.facultyId
          ? parseInt(req.query.facultyId as string)
          : undefined,
        institutionId,
        academicRank: req.query.academicRank as any,
        employmentType: req.query.employmentType as any,
        employmentStatus: req.query.employmentStatus as any,
        specialization: req.query.specialization as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: (req.query.search as string) || "",
        sortBy: (req.query.sortBy as string) || "id",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
      };

      const result = await instructorService.getInstructors(query);
      res.json(result);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch instructors",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get single instructor by ID
  async getInstructorById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid instructor ID",
        });
      }

      const instructor = await instructorService.getInstructorById(id);
      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: "Instructor not found",
        });
      }

      res.json({
        success: true,
        data: instructor,
      });
    } catch (error) {
      console.error("Error fetching instructor:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch instructor",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get instructor by staff ID
  async getInstructorByStaffId(req: Request, res: Response) {
    try {
      const staffId = req.params.staffId;
      const instructor =
        await instructorService.getInstructorByStaffId(staffId);

      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: "Instructor not found",
        });
      }

      res.json({
        success: true,
        data: instructor,
      });
    } catch (error) {
      console.error("Error fetching instructor by staff ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch instructor",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Create new instructor
  async createInstructor(req: Request, res: Response) {
    try {
      const instructor = await instructorService.createInstructor(req.body);
      res.status(201).json({
        success: true,
        message: "Instructor created successfully",
        data: instructor,
      });
    } catch (error) {
      console.error("Error creating instructor:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create instructor",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Update instructor
  async updateInstructor(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid instructor ID",
        });
      }

      const instructor = await instructorService.updateInstructor(id, req.body);
      res.json({
        success: true,
        message: "Instructor updated successfully",
        data: instructor,
      });
    } catch (error) {
      console.error("Error updating instructor:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update instructor",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Delete instructor
  async deleteInstructor(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid instructor ID",
        });
      }

      await instructorService.deleteInstructor(id);
      res.json({
        success: true,
        message: "Instructor deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting instructor:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete instructor",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Update instructor status
  async updateInstructorStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { employmentStatus } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid instructor ID",
        });
      }

      const instructor = await instructorService.updateInstructorStatus(
        id,
        employmentStatus
      );

      res.json({
        success: true,
        message: "Instructor status updated successfully",
        data: instructor,
      });
    } catch (error) {
      console.error("Error updating instructor status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update instructor status",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Assign instructor to department
  async assignToDepartment(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { departmentId, isPrimary = false } = req.body;

      if (isNaN(id) || isNaN(departmentId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid instructor or department ID",
        });
      }

      const assignment = await instructorService.assignToDepartment(
        id,
        departmentId,
        isPrimary
      );
      res.json({
        success: true,
        message: "Instructor assigned to department successfully",
        data: assignment,
      });
    } catch (error) {
      console.error("Error assigning instructor to department:", error);
      res.status(500).json({
        success: false,
        message: "Failed to assign instructor to department",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Remove instructor from department
  async removeFromDepartment(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const departmentId = parseInt(req.params.departmentId);

      if (isNaN(id) || isNaN(departmentId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid instructor or department ID",
        });
      }

      await instructorService.removeFromDepartment(id, departmentId);
      res.json({
        success: true,
        message: "Instructor removed from department successfully",
      });
    } catch (error) {
      console.error("Error removing instructor from department:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove instructor from department",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Bulk import instructors
  async bulkImportInstructors(req: Request, res: Response) {
    try {
      const { instructors } = req.body;

      if (!Array.isArray(instructors) || instructors.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid instructors data",
        });
      }

      const result = await instructorService.bulkImportInstructors(instructors);
      res.json({
        success: true,
        message: "Instructors imported successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error importing instructors:", error);
      res.status(500).json({
        success: false,
        message: "Failed to import instructors",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get instructor statistics
  async getInstructorStats(req: Request, res: Response) {
    try {
      const institutionId = req.query.institutionId
        ? parseInt(req.query.institutionId as string)
        : undefined;
      const facultyId = req.query.facultyId
        ? parseInt(req.query.facultyId as string)
        : undefined;
      const departmentId = req.query.departmentId
        ? parseInt(req.query.departmentId as string)
        : undefined;

      const stats = await instructorService.getInstructorStats({
        institutionId,
        facultyId,
        departmentId,
      });

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching instructor stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch instructor statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get instructor workload
  async getInstructorWorkload(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid instructor ID",
        });
      }

      const workload = await instructorService.getInstructorWorkload(id);
      res.json({
        success: true,
        data: workload,
      });
    } catch (error) {
      console.error("Error fetching instructor workload:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch instructor workload",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Export instructors
  async exportInstructors(req: Request, res: Response) {
    try {
      const query = {
        departmentId: req.query.departmentId
          ? parseInt(req.query.departmentId as string)
          : undefined,
        facultyId: req.query.facultyId
          ? parseInt(req.query.facultyId as string)
          : undefined,
        institutionId: req.query.institutionId
          ? parseInt(req.query.institutionId as string)
          : undefined,
        academicRank: req.query.academicRank as any,
        employmentType: req.query.employmentType as any,
        employmentStatus: req.query.employmentStatus as any,
        specialization: req.query.specialization as string,
        page: 1, // Export all
        limit: 10000, // Large limit for export
        search: (req.query.search as string) || "",
        sortBy: (req.query.sortBy as string) || "id",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
      };

      const format = (req.query.format as string) || "csv";
      const data = await instructorService.exportInstructors(
        query,
        format as "csv" | "excel"
      );

      if (format === "csv") {
        // data is an array where first element is headers, rest are rows
        const csvContent = (data as any[][])
          .map((row) => row.map((cell) => `"${cell}"`).join(","))
          .join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="instructors.csv"'
        );
        res.send(csvContent);
      } else {
        res.json({
          success: true,
          data: data,
        });
      }
    } catch (error) {
      console.error("Error exporting instructors:", error);
      res.status(500).json({
        success: false,
        message: "Failed to export instructors",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get instructors by department
  async getInstructorsByDepartment(req: Request, res: Response) {
    try {
      const departmentId = parseInt(req.params.departmentId);
      if (isNaN(departmentId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid department ID",
        });
      }

      const query = {
        departmentId,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: (req.query.search as string) || "",
        sortBy: (req.query.sortBy as string) || "id",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
      };

      const result = await instructorService.getInstructorsByDepartment(query);
      res.json(result);
    } catch (error) {
      console.error("Error fetching instructors by department:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch instructors by department",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
