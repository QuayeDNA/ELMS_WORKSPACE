import { Request, Response } from "express";
import { userService } from "../services/userService";
import { UserRole, UserStatus } from "../types/auth";

export const userController = {
  // Get all users with pagination and filtering
  async getUsers(req: Request, res: Response) {
    try {
      const query = {
        institutionId: req.query.institutionId
          ? parseInt(req.query.institutionId as string)
          : undefined,
        facultyId: req.query.facultyId
          ? parseInt(req.query.facultyId as string)
          : undefined,
        departmentId: req.query.departmentId
          ? parseInt(req.query.departmentId as string)
          : undefined,
        role: req.query.role as UserRole,
        status: req.query.status as UserStatus,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: (req.query.search as string) || "",
        sortBy: (req.query.sortBy as 'firstName' | 'lastName' | 'email' | 'role' | 'createdAt' | 'lastLogin') || "createdAt",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
      };

      const result = await userService.getUsers(query);
      res.json(result);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch users",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get single user by ID
  async getUserById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      const user = await userService.getUserById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        data: user,
        message: "User retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Create new user
  async createUser(req: Request, res: Response) {
    try {
      const userData = {
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        role: req.body.role as UserRole,
        institutionId: req.body.institutionId
          ? parseInt(req.body.institutionId)
          : undefined,
        facultyId: req.body.facultyId
          ? parseInt(req.body.facultyId)
          : undefined,
        departmentId: req.body.departmentId
          ? parseInt(req.body.departmentId)
          : undefined,
        phone: req.body.phone,
      };

      // Basic validation
      if (
        !userData.email ||
        !userData.password ||
        !userData.firstName ||
        !userData.lastName ||
        !userData.role
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email, password, first name, last name, and role are required",
        });
      }

      const user = await userService.createUser(userData);
      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user,
      });
    } catch (error) {
      console.error("Error creating user:", error);

      // Handle unique constraint violations
      if (error instanceof Error && error.message.includes("already exists")) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to create user",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Update user
  async updateUser(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      const updateData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        middleName: req.body.middleName,
        title: req.body.title,
        role: req.body.role as UserRole,
        status: req.body.status as UserStatus,
        phone: req.body.phone,
        dateOfBirth: req.body.dateOfBirth
          ? new Date(req.body.dateOfBirth)
          : undefined,
        gender: req.body.gender,
        nationality: req.body.nationality,
        address: req.body.address,
        institutionId: req.body.institutionId
          ? parseInt(req.body.institutionId)
          : undefined,
        facultyId: req.body.facultyId
          ? parseInt(req.body.facultyId)
          : undefined,
        departmentId: req.body.departmentId
          ? parseInt(req.body.departmentId)
          : undefined,
      };

      const user = await userService.updateUser(id, updateData);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        message: "User updated successfully",
        data: user,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update user",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Delete user (soft delete)
  async deleteUser(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      const success = await userService.deleteUser(id);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete user",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get users by institution
  async getUsersByInstitution(req: Request, res: Response) {
    try {
      const institutionId = parseInt(req.params.institutionId);
      if (isNaN(institutionId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid institution ID",
        });
      }

      const users = await userService.getUsersByInstitution(institutionId);
      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error("Error fetching users by institution:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch users",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get users by faculty
  async getUsersByFaculty(req: Request, res: Response) {
    try {
      const facultyId = parseInt(req.params.facultyId);
      if (isNaN(facultyId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid faculty ID",
        });
      }

      const users = await userService.getUsersByFaculty(facultyId);
      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error("Error fetching users by faculty:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch users",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
