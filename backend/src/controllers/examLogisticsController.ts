import { Request, Response } from "express";
import { examLogisticsService } from "../services/examLogisticsService";
import { ExamSessionAction } from "../types/examLogistics";

export const examLogisticsController = {
  // ========================================
  // INVIGILATOR ASSIGNMENT ENDPOINTS
  // ========================================

  /**
   * Assign an invigilator to an exam entry
   */
  async assignInvigilator(req: Request, res: Response) {
    try {
      const { examEntryId, invigilatorId, role, venueId, roomIds, duties } = req.body;
      const assignedBy = req.user?.userId;

      if (!assignedBy) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const result = await examLogisticsService.assignInvigilator({
        examEntryId: parseInt(examEntryId),
        invigilatorId: parseInt(invigilatorId),
        role,
        assignedBy,
        venueId: parseInt(venueId),
        roomIds: roomIds?.map((id: string) => parseInt(id)),
        duties,
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * Reassign an invigilator
   */
  async reassignInvigilator(req: Request, res: Response) {
    try {
      const { assignmentId, newExamEntryId, newVenueId, newRoomIds, reason } = req.body;
      const reassignedBy = req.user?.userId;

      if (!reassignedBy) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const result = await examLogisticsService.reassignInvigilator({
        assignmentId: parseInt(assignmentId),
        newExamEntryId: newExamEntryId ? parseInt(newExamEntryId) : undefined,
        newVenueId: newVenueId ? parseInt(newVenueId) : undefined,
        newRoomIds: newRoomIds?.map((id: string) => parseInt(id)),
        reason,
        reassignedBy,
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * Update invigilator presence (check-in/check-out)
   */
  async updateInvigilatorPresence(req: Request, res: Response) {
    try {
      const { assignmentId, action } = req.body;
      const performedBy = req.user?.userId;

      if (!performedBy) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!['check_in', 'check_out'].includes(action)) {
        return res.status(400).json({ error: "Invalid action. Must be 'check_in' or 'check_out'" });
      }

      const result = await examLogisticsService.updateInvigilatorPresence(
        parseInt(assignmentId),
        action,
        performedBy
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // ========================================
  // STUDENT VERIFICATION ENDPOINTS
  // ========================================

  /**
   * Check in a student for an exam
   */
  async checkInStudent(req: Request, res: Response) {
    try {
      const { examEntryId, studentId, verificationMethod, seatNumber, qrCode } = req.body;
      const verifiedBy = req.user?.userId;

      if (!verifiedBy) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const result = await examLogisticsService.checkInStudent({
        examEntryId: parseInt(examEntryId),
        studentId: parseInt(studentId),
        verificationMethod,
        seatNumber,
        verifiedBy,
        qrCode,
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * Change a student's assigned room
   */
  async changeStudentRoom(req: Request, res: Response) {
    try {
      const { verificationId, newRoomId, reason } = req.body;
      const changedBy = req.user?.userId;

      if (!changedBy) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const result = await examLogisticsService.changeStudentRoom({
        verificationId: parseInt(verificationId),
        newRoomId: parseInt(newRoomId),
        reason,
        changedBy,
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // ========================================
  // INCIDENT MANAGEMENT ENDPOINTS
  // ========================================

  /**
   * Report an exam incident
   */
  async reportExamIncident(req: Request, res: Response) {
    try {
      const {
        examEntryId,
        type,
        title,
        description,
        severity,
        location,
        affectedStudents,
        affectedInvigilators,
        attachments,
        witnesses,
      } = req.body;
      const reportedBy = req.user?.userId;

      if (!reportedBy) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const result = await examLogisticsService.reportExamIncident({
        examEntryId: parseInt(examEntryId),
        type,
        title,
        description,
        severity,
        location,
        affectedStudents: affectedStudents?.map((id: string) => parseInt(id)),
        affectedInvigilators: affectedInvigilators?.map((id: string) => parseInt(id)),
        attachments,
        witnesses: witnesses?.map((id: string) => parseInt(id)),
        reportedBy,
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * Resolve an exam incident
   */
  async resolveExamIncident(req: Request, res: Response) {
    try {
      const { incidentId, resolution } = req.body;
      const resolvedBy = req.user?.userId;

      if (!resolvedBy) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const result = await examLogisticsService.resolveExamIncident(
        parseInt(incidentId),
        resolution,
        resolvedBy
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // ========================================
  // VENUE OFFICER ASSIGNMENT ENDPOINTS
  // ========================================

  /**
   * Assign an officer to a venue within a timetable
   */
  async assignOfficerToVenue(req: Request, res: Response) {
    try {
      const { timetableId, venueId, officerId } = req.body;
      const assignedBy = req.user?.userId;

      if (!assignedBy) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const result = await examLogisticsService.assignOfficerToVenue(
        parseInt(timetableId),
        parseInt(venueId),
        parseInt(officerId),
        assignedBy
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * Remove an officer assignment
   */
  async removeOfficerAssignment(req: Request, res: Response) {
    try {
      const { assignmentId } = req.params;
      const removedBy = req.user?.userId;

      if (!removedBy) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const result = await examLogisticsService.removeOfficerAssignment(
        parseInt(assignmentId),
        removedBy
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * Get all officers assigned to a venue (within a timetable)
   */
  async getVenueOfficers(req: Request, res: Response) {
    try {
      const { timetableId, venueId } = req.params;

      const result = await examLogisticsService.getVenueOfficers(
        parseInt(timetableId),
        parseInt(venueId)
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * Get all venues assigned to an officer (within a timetable)
   */
  async getOfficerVenues(req: Request, res: Response) {
    try {
      const { timetableId, officerId } = req.params;

      const result = await examLogisticsService.getOfficerVenues(
        parseInt(timetableId),
        parseInt(officerId)
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * Get all venue officer assignments for a timetable
   */
  async getTimetableVenueAssignments(req: Request, res: Response) {
    try {
      const { timetableId } = req.params;

      const result = await examLogisticsService.getTimetableVenueAssignments(
        parseInt(timetableId)
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // ========================================
  // DASHBOARD ENDPOINTS
  // ========================================

  /**
   * Get institution logistics dashboard
   */
  async getInstitutionDashboard(req: Request, res: Response) {
    try {
      const institutionId = req.user?.institutionId;
      const { date, timetableId } = req.query;

      if (!institutionId) {
        return res.status(400).json({ error: "Institution not found" });
      }

      const options: { date?: Date; timetableId?: number } = {};

      if (date) {
        options.date = new Date(date as string);
      }

      if (timetableId) {
        options.timetableId = parseInt(timetableId as string, 10);
      }

      const result = await examLogisticsService.getInstitutionLogisticsDashboard(
        institutionId,
        options
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * Get exams officer dashboard
   */
  async getExamsOfficerDashboard(req: Request, res: Response) {
    try {
      const officerId = req.user?.userId;
      const { date, timetableId } = req.query;

      if (!officerId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const options: { date?: Date; timetableId?: number } = {};

      if (date) {
        options.date = new Date(date as string);
      }

      if (timetableId) {
        options.timetableId = parseInt(timetableId as string, 10);
      }

      const result = await examLogisticsService.getExamsOfficerDashboard(
        officerId,
        options
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // ========================================
  // LOGS AND AUDIT ENDPOINTS
  // ========================================

  /**
   * Get session logs for an exam entry
   */
  async getSessionLogs(req: Request, res: Response) {
    try {
      const { examEntryId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const [logs, total] = await Promise.all([
        prisma.examSessionLog.findMany({
          where: { examEntryId: parseInt(examEntryId) },
          include: {
            performer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            venue: {
              select: {
                id: true,
                name: true,
              },
            },
            room: {
              select: {
                id: true,
                name: true,
              },
            },
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            invigilator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { performedAt: 'desc' },
          skip,
          take: parseInt(limit as string),
        }),
        prisma.examSessionLog.count({
          where: { examEntryId: parseInt(examEntryId) },
        }),
      ]);

      res.json({
        success: true,
        data: logs,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * Get invigilator assignments for an exam entry
   */
  async getInvigilatorAssignments(req: Request, res: Response) {
    try {
      const { examEntryId } = req.params;

      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();

      const assignments = await prisma.invigilatorAssignment.findMany({
        where: { examEntryId: parseInt(examEntryId) },
        include: {
          invigilator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              title: true,
            },
          },
          assignedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          venue: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { assignedAt: 'desc' },
      });

      res.json({
        success: true,
        data: assignments,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * Get student verifications for an exam entry
   */
  async getStudentVerifications(req: Request, res: Response) {
    try {
      const { examEntryId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const [verifications, total] = await Promise.all([
        prisma.studentVerification.findMany({
          where: { examEntryId: parseInt(examEntryId) },
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                studentProfiles: {
                  select: {
                    studentId: true,
                  },
                },
              },
            },
            verifier: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { verifiedAt: 'desc' },
          skip,
          take: parseInt(limit as string),
        }),
        prisma.studentVerification.count({
          where: { examEntryId: parseInt(examEntryId) },
        }),
      ]);

      res.json({
        success: true,
        data: verifications,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * Get exam incidents for an exam entry
   */
  async getExamIncidents(req: Request, res: Response) {
    try {
      const { examEntryId } = req.params;

      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();

      const incidents = await prisma.examIncident.findMany({
        where: { examEntryId: parseInt(examEntryId) },
        include: {
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          resolver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { reportedAt: 'desc' },
      });

      res.json({
        success: true,
        data: incidents,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};
