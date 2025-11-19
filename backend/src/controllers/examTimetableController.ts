import { Request, Response } from "express";
import { examTimetableService } from "../services/examTimetableService";
import {
  CreateTimetableData,
  UpdateTimetableData,
  CreateTimetableEntryData,
  UpdateTimetableEntryData,
  TimetableQuery,
  TimetableEntryQuery,
} from "../types/examTimetable";

export const examTimetableController = {
  // ========================================
  // TIMETABLE MANAGEMENT
  // ========================================

  /**
   * GET /api/timetables
   * Get all exam timetables with filtering
   */
  async getTimetables(req: Request, res: Response) {
    try {
      // Get user's institution from JWT token
      const userInstitutionId = (req as any).user?.institutionId;
      const userRole = (req as any).user?.role;
      const userId = (req as any).user?.userId;

      console.log('🔍 Timetable query debug:', {
        userId,
        userRole,
        userInstitutionId,
        queryInstitutionId: req.query.institutionId,
        isAuthenticated: !!(req as any).user
      });

      // Super admins can query across institutions, others are scoped to their institution
      // If no user is authenticated, allow querying by institutionId if provided
      let institutionId: number | undefined;

      if (userRole === 'SUPER_ADMIN') {
        institutionId = req.query.institutionId ? parseInt(req.query.institutionId as string) : undefined;
      } else if (userInstitutionId) {
        institutionId = userInstitutionId;
      } else if (req.query.institutionId) {
        // Allow querying by institutionId even if user is not authenticated or doesn't have institutionId
        institutionId = parseInt(req.query.institutionId as string);
      }

      console.log('📋 Final institutionId for query:', institutionId);

      const query: TimetableQuery = {
        institutionId,
        facultyId: req.query.facultyId
          ? parseInt(req.query.facultyId as string)
          : undefined,
        academicYearId: req.query.academicYearId
          ? parseInt(req.query.academicYearId as string)
          : undefined,
        semesterId: req.query.semesterId
          ? parseInt(req.query.semesterId as string)
          : undefined,
        academicPeriodId: req.query.academicPeriodId
          ? parseInt(req.query.academicPeriodId as string)
          : undefined,
        status: req.query.status as any,
        isPublished: req.query.isPublished === "true" ? true : req.query.isPublished === "false" ? false : undefined,
        approvalStatus: req.query.approvalStatus as any,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: (req.query.search as string) || "",
        sortBy: (req.query.sortBy as any) || "createdAt",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
      };

      console.log('🔎 Final query object:', JSON.stringify(query, null, 2));

      const result = await examTimetableService.getTimetables(query);
      console.log('📊 Query result:', {
        success: result.success,
        total: result.pagination?.total,
        dataLength: result.data?.length
      });

      res.json(result);
    } catch (error) {
      console.error("Error fetching timetables:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch timetables",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  /**
   * GET /api/timetables/:id
   * Get single timetable by ID
   */
  async getTimetableById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid timetable ID",
        });
      }

      const result = await examTimetableService.getTimetableById(id);
      res.json(result);
    } catch (error) {
      console.error("Error fetching timetable:", error);
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      res.status(statusCode).json({
        success: false,
        message: "Failed to fetch timetable",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  /**
   * POST /api/timetables
   * Create a new exam timetable
   */
  async createTimetable(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const data: CreateTimetableData = {
        ...req.body,
        createdBy: userId,
      };

      // Validate required fields
      if (
        !data.title ||
        !data.academicYearId ||
        !data.semesterId ||
        !data.institutionId ||
        !data.startDate ||
        !data.endDate
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      const result = await examTimetableService.createTimetable(data);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating timetable:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create timetable",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  /**
   * PUT /api/timetables/:id
   * Update an existing timetable
   */
  async updateTimetable(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid timetable ID",
        });
      }

      const data: UpdateTimetableData = req.body;
      const result = await examTimetableService.updateTimetable(id, data);
      res.json(result);
    } catch (error) {
      console.error("Error updating timetable:", error);
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      res.status(statusCode).json({
        success: false,
        message: "Failed to update timetable",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  /**
   * PUT /api/timetables/:id/status
   * Update timetable status (ADMIN only)
   */
  async updateTimetableStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.primaryRole;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid timetable ID",
        });
      }

      if (!userId || !userRole) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      // Validate status enum
      const validStatuses = [
        'DRAFT',
        'PENDING_APPROVAL',
        'APPROVED',
        'PUBLISHED',
        'IN_PROGRESS',
        'COMPLETED',
        'ARCHIVED'
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
          validStatuses,
        });
      }

      const result = await examTimetableService.updateTimetableStatus(
        id,
        status,
        userId,
        userRole
      );

      res.json(result);
    } catch (error) {
      console.error("Error updating timetable status:", error);
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : error instanceof Error && error.message.includes("administrators")
          ? 403
          : error instanceof Error && error.message.includes("Invalid status")
          ? 400
          : 500;
      res.status(statusCode).json({
        success: false,
        message: "Failed to update timetable status",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  /**
   * DELETE /api/timetables/:id
   * Delete a timetable
   */
  async deleteTimetable(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid timetable ID",
        });
      }

      const result = await examTimetableService.deleteTimetable(id);
      res.json(result);
    } catch (error) {
      console.error("Error deleting timetable:", error);
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : error instanceof Error && error.message.includes("Cannot delete")
          ? 400
          : 500;
      res.status(statusCode).json({
        success: false,
        message: "Failed to delete timetable",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  /**
   * POST /api/timetables/:id/publish
   * Publish a timetable
   */
  async publishTimetable(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.userId;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid timetable ID",
        });
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const result = await examTimetableService.publishTimetable(id, userId);
      res.json(result);
    } catch (error) {
      console.error("Error publishing timetable:", error);
      res.status(500).json({
        success: false,
        message: "Failed to publish timetable",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  /**
   * POST /api/timetables/:id/submit-for-approval
   * Submit timetable for approval
   */
  async submitForApproval(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid timetable ID",
        });
      }

      const result = await examTimetableService.submitForApproval(id);
      res.json(result);
    } catch (error) {
      console.error("Error submitting timetable for approval:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit timetable for approval",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  /**
   * POST /api/timetables/:id/approve
   * Approve a timetable
   */
  async approveTimetable(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.userId;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid timetable ID",
        });
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const result = await examTimetableService.approveTimetable(id, userId);
      res.json(result);
    } catch (error) {
      console.error("Error approving timetable:", error);
      res.status(500).json({
        success: false,
        message: "Failed to approve timetable",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  /**
   * POST /api/timetables/:id/reject
   * Reject a timetable
   */
  async rejectTimetable(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid timetable ID",
        });
      }

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: "Rejection reason is required",
        });
      }

      const result = await examTimetableService.rejectTimetable(id, reason);
      res.json(result);
    } catch (error) {
      console.error("Error rejecting timetable:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reject timetable",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  /**
   * GET /api/timetables/:id/statistics
   * Get timetable statistics
   */
  async getTimetableStatistics(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid timetable ID",
        });
      }

      const result = await examTimetableService.getTimetableStatistics(id);
      res.json(result);
    } catch (error) {
      console.error("Error fetching timetable statistics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch timetable statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // ========================================
  // TIMETABLE ENTRY MANAGEMENT
  // ========================================

  /**
   * GET /api/timetables/:timetableId/entries
   * Get entries for a timetable
   */
  async getTimetableEntries(req: Request, res: Response) {
    try {
      const timetableId = parseInt(req.params.timetableId);
      if (isNaN(timetableId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid timetable ID",
        });
      }

      const query: TimetableEntryQuery = {
        timetableId,
        courseId: req.query.courseId
          ? parseInt(req.query.courseId as string)
          : undefined,
        programId: req.query.programId
          ? parseInt(req.query.programId as string)
          : undefined,
        level: req.query.level ? parseInt(req.query.level as string) : undefined,
        venueId: req.query.venueId
          ? parseInt(req.query.venueId as string)
          : undefined,
        roomId: req.query.roomId
          ? parseInt(req.query.roomId as string)
          : undefined,
        invigilatorId: req.query.invigilatorId
          ? parseInt(req.query.invigilatorId as string)
          : undefined,
        status: req.query.status as any,
        examDate: req.query.examDate as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        hasConflicts: req.query.hasConflicts === "true",
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        search: (req.query.search as string) || "",
        sortBy: (req.query.sortBy as any) || "examDate",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "asc",
      };

      const result = await examTimetableService.getTimetableEntries(query);
      res.json(result);
    } catch (error) {
      console.error("Error fetching timetable entries:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch timetable entries",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  /**
   * GET /api/timetables/entries/:id
   * Get single timetable entry by ID
   */
  async getTimetableEntryById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid entry ID",
        });
      }

      const result = await examTimetableService.getTimetableEntryById(id);
      res.json(result);
    } catch (error) {
      console.error("Error fetching timetable entry:", error);
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      res.status(statusCode).json({
        success: false,
        message: "Failed to fetch timetable entry",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  /**
   * POST /api/timetables/:timetableId/entries
   * Create a new timetable entry
   */
  async createTimetableEntry(req: Request, res: Response) {
    try {
      const timetableId = parseInt(req.params.timetableId);
      if (isNaN(timetableId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid timetable ID",
        });
      }

      const data: CreateTimetableEntryData = {
        ...req.body,
        timetableId,
      };

      // Validate required fields
      if (
        !data.courseId ||
        !data.examDate ||
        !data.startTime ||
        !data.endTime ||
        !data.duration ||
        !data.venueId ||
        !data.programIds ||
        !Array.isArray(data.programIds) ||
        data.programIds.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: courseId, examDate, startTime, endTime, duration, venueId, programIds (must be non-empty array)",
        });
      }

      // Ensure arrays exist (can be empty)
      if (!data.roomIds) data.roomIds = [];
      if (!data.invigilatorIds) data.invigilatorIds = [];

      const result = await examTimetableService.createTimetableEntry(data);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating timetable entry:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create timetable entry",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // ========================================
  // CONFLICT MANAGEMENT
  // ========================================

  /**
   * POST /api/timetables/:id/detect-conflicts
   * Detect conflicts in a timetable
   */
  async detectConflicts(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid timetable ID",
        });
      }

      const result = await examTimetableService.detectConflicts(id);
      res.json(result);
    } catch (error) {
      console.error("Error detecting conflicts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to detect conflicts",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  /**
   * GET /api/timetables/:id/conflicts
   * Get conflicts for a timetable
   */
  async getTimetableConflicts(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid timetable ID",
        });
      }

      const result = await examTimetableService.getTimetableConflicts(id);
      res.json(result);
    } catch (error) {
      console.error("Error fetching conflicts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch conflicts",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  /**
   * POST /api/timetables/conflicts/:conflictId/resolve
   * Resolve a conflict
   */
  async resolveConflict(req: Request, res: Response) {
    try {
      const conflictId = req.params.conflictId;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const result = await examTimetableService.resolveConflict(
        conflictId,
        userId
      );
      res.json(result);
    } catch (error) {
      console.error("Error resolving conflict:", error);
      res.status(500).json({
        success: false,
        message: "Failed to resolve conflict",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  /**
   * PUT /api/timetables/:timetableId/entries/:entryId
   * Update a timetable entry with role-based permissions
   */
  async updateTimetableEntry(req: Request, res: Response) {
    try {
      const entryId = parseInt(req.params.entryId);
      const userId = req.user?.userId;
      const userRole = req.user?.primaryRole;

      if (isNaN(entryId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid entry ID",
        });
      }

      if (!userId || !userRole) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const data: UpdateTimetableEntryData = req.body;

      const result = await examTimetableService.updateTimetableEntry(
        entryId,
        data,
        userId,
        userRole
      );

      res.json(result);
    } catch (error) {
      console.error("Error updating entry:", error);

      const statusCode =
        error instanceof Error && error.message.includes('permission') ? 403 :
        error instanceof Error && error.message.includes('not found') ? 404 : 500;

      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to update entry",
      });
    }
  },

  /**
   * DELETE /api/timetables/:timetableId/entries/:entryId
   * Delete a timetable entry with permission checks
   */
  async deleteTimetableEntry(req: Request, res: Response) {
    try {
      const entryId = parseInt(req.params.entryId);
      const userId = req.user?.userId;
      const userRole = req.user?.primaryRole;

      if (isNaN(entryId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid entry ID",
        });
      }

      if (!userId || !userRole) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const result = await examTimetableService.deleteTimetableEntry(
        entryId,
        userId,
        userRole
      );

      res.json(result);
    } catch (error) {
      console.error("Error deleting entry:", error);

      const statusCode =
        error instanceof Error && error.message.includes('permission') ? 403 :
        error instanceof Error && error.message.includes('not found') ? 404 : 500;

      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete entry",
      });
    }
  },

  /**
   * GET /api/timetables/entries/:entryId/permissions
   * Get what the current user can modify for this entry
   */
  async getEntryPermissions(req: Request, res: Response) {
    try {
      const entryId = parseInt(req.params.entryId);
      const userId = req.user?.userId;
      const userRole = req.user?.primaryRole;

      if (isNaN(entryId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid entry ID",
        });
      }

      if (!userId || !userRole) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const permissions = await examTimetableService.getModificationPermissions(
        userId,
        userRole,
        entryId
      );

      res.json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      console.error("Error getting permissions:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get permissions",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  /**
   * POST /api/timetable-entries/batch
   * Batch create multiple exam timetable entries
   */
  async batchCreateEntries(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const { timetableId, entries } = req.body;

      if (!timetableId) {
        return res.status(400).json({
          success: false,
          message: "Timetable ID is required",
        });
      }

      if (!Array.isArray(entries) || entries.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Entries array is required and must not be empty",
        });
      }

      // Create entries in batch
      const createdEntries = [];
      const errors = [];

      for (let i = 0; i < entries.length; i++) {
        try {
          const entry = entries[i];
          const entryData: CreateTimetableEntryData = {
            timetableId,
            courseId: entry.courseId,
            programIds: entry.programIds || [],
            level: entry.level,
            examDate: entry.examDate,
            startTime: entry.startTime,
            endTime: entry.endTime || calculateEndTime(entry.startTime, entry.duration),
            duration: entry.duration,
            venueId: entry.venueId,
            roomIds: entry.roomIds || [],
            invigilatorIds: entry.invigilatorIds || [],
            chiefInvigilatorId: entry.chiefInvigilatorId,
            notes: entry.notes,
            specialRequirements: entry.specialRequirements,
          };

          // Validate required fields for each entry
          if (
            !entryData.courseId ||
            !entryData.examDate ||
            !entryData.startTime ||
            !entryData.duration ||
            !entryData.venueId ||
            !entryData.programIds ||
            !Array.isArray(entryData.programIds) ||
            entryData.programIds.length === 0
          ) {
            throw new Error(`Missing required fields for entry at index ${i}: courseId, examDate, startTime, duration, venueId, programIds (must be non-empty array)`);
          }

          const created = await examTimetableService.createTimetableEntry(entryData);
          createdEntries.push(created);
        } catch (error) {
          errors.push({
            index: i,
            entry: entries[i],
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      res.status(errors.length > 0 ? 207 : 201).json({
        success: createdEntries.length > 0,
        message: `Created ${createdEntries.length} out of ${entries.length} entries`,
        data: {
          created: createdEntries,
          failed: errors,
          summary: {
            total: entries.length,
            succeeded: createdEntries.length,
            failed: errors.length,
          },
        },
      });
    } catch (error) {
      console.error("Error batch creating entries:", error);
      res.status(500).json({
        success: false,
        message: "Failed to batch create entries",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  /**
   * POST /api/timetables/:id/create-batches
   * Create batch scripts for a published timetable
   */
  async createBatchScripts(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid timetable ID",
        });
      }

      const result = await examTimetableService.createBatchScriptsForTimetable(id);
      res.json(result);
    } catch (error) {
      console.error("Error creating batch scripts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create batch scripts",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};

// Helper function to calculate end time
function calculateEndTime(startTime: string | Date, durationMinutes: number): string | Date {
  const start = new Date(startTime);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  return end;
}

