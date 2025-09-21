import { Request, Response } from "express";
import { examService } from "../services/examService";
import { UserRole } from "../types/auth";
import { ExamQuery, CreateExamData, UpdateExamData } from "../types/exam";
import { ExamStatus } from "@prisma/client";

export const examController = {
  // Get all exams with pagination and filtering
  async getExams(req: Request, res: Response) {
    try {
      const query: ExamQuery = {
        facultyId: req.query.facultyId
          ? parseInt(req.query.facultyId as string)
          : undefined,
        departmentId: req.query.departmentId
          ? parseInt(req.query.departmentId as string)
          : undefined,
        courseId: req.query.courseId
          ? parseInt(req.query.courseId as string)
          : undefined,
        venueId: req.query.venueId
          ? parseInt(req.query.venueId as string)
          : undefined,
        status: req.query.status as ExamStatus,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: (req.query.search as string) || "",
        sortBy: (req.query.sortBy as string) || "examDate",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
      };

      const result = await examService.getExams(query);
      res.json(result);
    } catch (error) {
      console.error("Error fetching exams:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch exams",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get single exam by ID
  async getExamById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid exam ID",
        });
      }

      const exam = await examService.getExamById(id);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: "Exam not found",
        });
      }

      res.json({
        success: true,
        data: exam,
      });
    } catch (error) {
      console.error("Error fetching exam:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch exam",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Create new exam
  async createExam(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const data: CreateExamData = {
        title: req.body.title,
        courseId: req.body.courseId,
        facultyId: req.body.facultyId,
        examDate: new Date(req.body.examDate),
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
        duration: req.body.duration,
        venueId: req.body.venueId,
        roomId: req.body.roomId,
        instructions: req.body.instructions,
        specialRequirements: req.body.specialRequirements,
      };

      // Validate required fields
      if (
        !data.title ||
        !data.courseId ||
        !data.facultyId ||
        !data.examDate ||
        !data.startTime ||
        !data.endTime ||
        !data.duration
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      const exam = await examService.createExam(data, userId);
      res.status(201).json({
        success: true,
        message: "Exam created successfully",
        data: exam,
      });
    } catch (error) {
      console.error("Error creating exam:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create exam",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Update exam
  async updateExam(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid exam ID",
        });
      }

      const data: UpdateExamData = {
        title: req.body.title,
        courseId: req.body.courseId,
        facultyId: req.body.facultyId,
        examDate: req.body.examDate ? new Date(req.body.examDate) : undefined,
        startTime: req.body.startTime
          ? new Date(req.body.startTime)
          : undefined,
        endTime: req.body.endTime ? new Date(req.body.endTime) : undefined,
        duration: req.body.duration,
        venueId: req.body.venueId,
        roomId: req.body.roomId,
        status: req.body.status,
        instructions: req.body.instructions,
        specialRequirements: req.body.specialRequirements,
      };

      const exam = await examService.updateExam(id, data);
      res.json({
        success: true,
        message: "Exam updated successfully",
        data: exam,
      });
    } catch (error) {
      console.error("Error updating exam:", error);
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      res.status(statusCode).json({
        success: false,
        message: "Failed to update exam",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Delete exam
  async deleteExam(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid exam ID",
        });
      }

      await examService.deleteExam(id);
      res.json({
        success: true,
        message: "Exam deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting exam:", error);
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      res.status(statusCode).json({
        success: false,
        message: "Failed to delete exam",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get exams by faculty
  async getExamsByFaculty(req: Request, res: Response) {
    try {
      const facultyId = parseInt(req.params.facultyId);
      if (isNaN(facultyId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid faculty ID",
        });
      }

      const query: Omit<ExamQuery, "facultyId"> = {
        departmentId: req.query.departmentId
          ? parseInt(req.query.departmentId as string)
          : undefined,
        courseId: req.query.courseId
          ? parseInt(req.query.courseId as string)
          : undefined,
        venueId: req.query.venueId
          ? parseInt(req.query.venueId as string)
          : undefined,
        status: req.query.status as ExamStatus,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: (req.query.search as string) || "",
        sortBy: (req.query.sortBy as string) || "examDate",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
      };

      const result = await examService.getExamsByFaculty(facultyId, query);
      res.json(result);
    } catch (error) {
      console.error("Error fetching exams by faculty:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch exams by faculty",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get exams by course
  async getExamsByCourse(req: Request, res: Response) {
    try {
      const courseId = parseInt(req.params.courseId);
      if (isNaN(courseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid course ID",
        });
      }

      const query: Omit<ExamQuery, "courseId"> = {
        facultyId: req.query.facultyId
          ? parseInt(req.query.facultyId as string)
          : undefined,
        departmentId: req.query.departmentId
          ? parseInt(req.query.departmentId as string)
          : undefined,
        venueId: req.query.venueId
          ? parseInt(req.query.venueId as string)
          : undefined,
        status: req.query.status as ExamStatus,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: (req.query.search as string) || "",
        sortBy: (req.query.sortBy as string) || "examDate",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
      };

      const result = await examService.getExamsByCourse(courseId, query);
      res.json(result);
    } catch (error) {
      console.error("Error fetching exams by course:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch exams by course",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Update exam status
  async updateExamStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid exam ID",
        });
      }

      const { status } = req.body;
      if (!status || !Object.values(ExamStatus).includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid or missing status",
        });
      }

      const exam = await examService.updateExamStatus(id, status);
      res.json({
        success: true,
        message: "Exam status updated successfully",
        data: exam,
      });
    } catch (error) {
      console.error("Error updating exam status:", error);
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      res.status(statusCode).json({
        success: false,
        message: "Failed to update exam status",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
