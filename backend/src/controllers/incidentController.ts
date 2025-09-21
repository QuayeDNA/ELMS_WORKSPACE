import { Request, Response } from "express";
import { incidentService } from "../services/incidentService";
import { UserRole } from "../types/auth";
import {
  IncidentQuery,
  CreateIncidentData,
  UpdateIncidentData,
} from "../types/incident";
import { IncidentStatus, IncidentSeverity, IncidentType } from "@prisma/client";

export const incidentController = {
  // Get all incidents with pagination and filtering
  async getIncidents(req: Request, res: Response) {
    try {
      const query: IncidentQuery = {
        examId: req.query.examId
          ? parseInt(req.query.examId as string)
          : undefined,
        scriptId: req.query.scriptId
          ? parseInt(req.query.scriptId as string)
          : undefined,
        reportedById: req.query.reportedById
          ? parseInt(req.query.reportedById as string)
          : undefined,
        assignedToId: req.query.assignedToId
          ? parseInt(req.query.assignedToId as string)
          : undefined,
        type: req.query.type as IncidentType,
        severity: req.query.severity as IncidentSeverity,
        status: req.query.status as IncidentStatus,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: (req.query.search as string) || "",
        sortBy: (req.query.sortBy as string) || "createdAt",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
      };

      const result = await incidentService.getIncidents(query);
      res.json(result);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch incidents",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get single incident by ID
  async getIncidentById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid incident ID",
        });
      }

      const incident = await incidentService.getIncidentById(id);
      if (!incident) {
        return res.status(404).json({
          success: false,
          message: "Incident not found",
        });
      }

      res.json({
        success: true,
        data: incident,
      });
    } catch (error) {
      console.error("Error fetching incident:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch incident",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Create new incident
  async createIncident(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const data: CreateIncidentData = {
        type: req.body.type,
        severity: req.body.severity,
        title: req.body.title,
        description: req.body.description,
        examId: req.body.examId,
        scriptId: req.body.scriptId,
      };

      // Validate required fields
      if (!data.type || !data.title || !data.description) {
        return res.status(400).json({
          success: false,
          message: "Type, title, and description are required",
        });
      }

      // Validate enum values
      if (!Object.values(IncidentType).includes(data.type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid incident type",
        });
      }

      if (
        data.severity &&
        !Object.values(IncidentSeverity).includes(data.severity)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid incident severity",
        });
      }

      const incident = await incidentService.createIncident(data, userId);
      res.status(201).json({
        success: true,
        message: "Incident reported successfully",
        data: incident,
      });
    } catch (error) {
      console.error("Error creating incident:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create incident",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Update incident
  async updateIncident(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid incident ID",
        });
      }

      const data: UpdateIncidentData = {
        type: req.body.type,
        severity: req.body.severity,
        status: req.body.status,
        title: req.body.title,
        description: req.body.description,
        examId: req.body.examId,
        scriptId: req.body.scriptId,
        assignedToId: req.body.assignedToId,
        resolution: req.body.resolution,
      };

      // Validate enum values if provided
      if (data.type && !Object.values(IncidentType).includes(data.type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid incident type",
        });
      }

      if (
        data.severity &&
        !Object.values(IncidentSeverity).includes(data.severity)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid incident severity",
        });
      }

      if (data.status && !Object.values(IncidentStatus).includes(data.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid incident status",
        });
      }

      const incident = await incidentService.updateIncident(id, data);
      res.json({
        success: true,
        message: "Incident updated successfully",
        data: incident,
      });
    } catch (error) {
      console.error("Error updating incident:", error);
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      res.status(statusCode).json({
        success: false,
        message: "Failed to update incident",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Assign incident to user
  async assignIncident(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { assignedToId } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid incident ID",
        });
      }

      if (!assignedToId || isNaN(parseInt(assignedToId))) {
        return res.status(400).json({
          success: false,
          message: "Valid assignedToId is required",
        });
      }

      const incident = await incidentService.assignIncident(
        id,
        parseInt(assignedToId)
      );
      res.json({
        success: true,
        message: "Incident assigned successfully",
        data: incident,
      });
    } catch (error) {
      console.error("Error assigning incident:", error);
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      res.status(statusCode).json({
        success: false,
        message: "Failed to assign incident",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Resolve incident
  async resolveIncident(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { resolution } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid incident ID",
        });
      }

      if (
        !resolution ||
        typeof resolution !== "string" ||
        resolution.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Resolution is required",
        });
      }

      const incident = await incidentService.resolveIncident(
        id,
        resolution.trim()
      );
      res.json({
        success: true,
        message: "Incident resolved successfully",
        data: incident,
      });
    } catch (error) {
      console.error("Error resolving incident:", error);
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      res.status(statusCode).json({
        success: false,
        message: "Failed to resolve incident",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get incidents by exam
  async getIncidentsByExam(req: Request, res: Response) {
    try {
      const examId = parseInt(req.params.examId);
      if (isNaN(examId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid exam ID",
        });
      }

      const query: Omit<IncidentQuery, "examId"> = {
        reportedById: req.query.reportedById
          ? parseInt(req.query.reportedById as string)
          : undefined,
        assignedToId: req.query.assignedToId
          ? parseInt(req.query.assignedToId as string)
          : undefined,
        type: req.query.type as IncidentType,
        severity: req.query.severity as IncidentSeverity,
        status: req.query.status as IncidentStatus,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: (req.query.search as string) || "",
        sortBy: (req.query.sortBy as string) || "createdAt",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
      };

      const result = await incidentService.getIncidentsByExam(examId, query);
      res.json(result);
    } catch (error) {
      console.error("Error fetching incidents by exam:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch incidents by exam",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get incidents by script
  async getIncidentsByScript(req: Request, res: Response) {
    try {
      const scriptId = parseInt(req.params.scriptId);
      if (isNaN(scriptId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid script ID",
        });
      }

      const query: Omit<IncidentQuery, "scriptId"> = {
        reportedById: req.query.reportedById
          ? parseInt(req.query.reportedById as string)
          : undefined,
        assignedToId: req.query.assignedToId
          ? parseInt(req.query.assignedToId as string)
          : undefined,
        type: req.query.type as IncidentType,
        severity: req.query.severity as IncidentSeverity,
        status: req.query.status as IncidentStatus,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: (req.query.search as string) || "",
        sortBy: (req.query.sortBy as string) || "createdAt",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
      };

      const result = await incidentService.getIncidentsByScript(
        scriptId,
        query
      );
      res.json(result);
    } catch (error) {
      console.error("Error fetching incidents by script:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch incidents by script",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get incidents reported by user
  async getIncidentsByReporter(req: Request, res: Response) {
    try {
      const reportedById = parseInt(req.params.userId);
      if (isNaN(reportedById)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      const query: Omit<IncidentQuery, "reportedById"> = {
        examId: req.query.examId
          ? parseInt(req.query.examId as string)
          : undefined,
        scriptId: req.query.scriptId
          ? parseInt(req.query.scriptId as string)
          : undefined,
        assignedToId: req.query.assignedToId
          ? parseInt(req.query.assignedToId as string)
          : undefined,
        type: req.query.type as IncidentType,
        severity: req.query.severity as IncidentSeverity,
        status: req.query.status as IncidentStatus,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: (req.query.search as string) || "",
        sortBy: (req.query.sortBy as string) || "createdAt",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
      };

      const result = await incidentService.getIncidentsByReporter(
        reportedById,
        query
      );
      res.json(result);
    } catch (error) {
      console.error("Error fetching incidents by reporter:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch incidents by reporter",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get incidents assigned to user
  async getIncidentsByAssignee(req: Request, res: Response) {
    try {
      const assignedToId = parseInt(req.params.userId);
      if (isNaN(assignedToId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      const query: Omit<IncidentQuery, "assignedToId"> = {
        examId: req.query.examId
          ? parseInt(req.query.examId as string)
          : undefined,
        scriptId: req.query.scriptId
          ? parseInt(req.query.scriptId as string)
          : undefined,
        reportedById: req.query.reportedById
          ? parseInt(req.query.reportedById as string)
          : undefined,
        type: req.query.type as IncidentType,
        severity: req.query.severity as IncidentSeverity,
        status: req.query.status as IncidentStatus,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: (req.query.search as string) || "",
        sortBy: (req.query.sortBy as string) || "createdAt",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
      };

      const result = await incidentService.getIncidentsByAssignee(
        assignedToId,
        query
      );
      res.json(result);
    } catch (error) {
      console.error("Error fetching incidents by assignee:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch incidents by assignee",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get incident statistics
  async getIncidentStats(req: Request, res: Response) {
    try {
      const stats = await incidentService.getIncidentStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching incident stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch incident statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Delete incident
  async deleteIncident(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid incident ID",
        });
      }

      await incidentService.deleteIncident(id);
      res.json({
        success: true,
        message: "Incident deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting incident:", error);
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      res.status(statusCode).json({
        success: false,
        message: "Failed to delete incident",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
