import { PrismaClient } from "@prisma/client";
import {
  ExamTimetable,
  ExamTimetableEntry,
  CreateTimetableData,
  UpdateTimetableData,
  CreateTimetableEntryData,
  UpdateTimetableEntryData,
  TimetableQuery,
  TimetableEntryQuery,
  TimetableConflict,
  ConflictType,
  ConflictSeverity,
  ExamTimetableStatus,
  TimetableApprovalStatus,
  ExamTimetableEntryStatus,
  AutoScheduleConfig,
  SchedulingResult,
  UnscheduledCourse,
} from "../types/examTimetable";

const prisma = new PrismaClient();

export const examTimetableService = {
  // ========================================
  // TIMETABLE CRUD OPERATIONS
  // ========================================

  /**
   * Get all exam timetables with pagination and filtering
   */
  async getTimetables(query: TimetableQuery) {
    const {
      institutionId,
      facultyId,
      academicYearId,
      semesterId,
      academicPeriodId,
      status,
      isPublished,
      approvalStatus,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (institutionId) where.institutionId = institutionId;
    if (facultyId) where.facultyId = facultyId;
    if (academicYearId) where.academicYearId = academicYearId;
    if (semesterId) where.semesterId = semesterId;
    if (academicPeriodId) where.academicPeriodId = academicPeriodId;
    if (status) where.status = status;
    if (isPublished !== undefined) where.isPublished = isPublished;
    if (approvalStatus) where.approvalStatus = approvalStatus;

    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = new Date(startDate);
      if (endDate) where.startDate.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.examTimetable.count({ where });

    // Get timetables with relations
    const timetables = await prisma.examTimetable.findMany({
      where,
      include: {
        academicYear: {
          select: {
            id: true,
            yearCode: true,
            startDate: true,
            endDate: true,
          },
        },
        semester: {
          select: {
            id: true,
            semesterNumber: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },
        academicPeriod: {
          select: {
            id: true,
            examStartDate: true,
            examEndDate: true,
          },
        },
        institution: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        faculty: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        publisher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            entries: true,
            conflicts: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return {
      success: true,
      data: timetables,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  },

  /**
   * Get single timetable by ID with full details
   */
  async getTimetableById(id: number) {
    const timetable = await prisma.examTimetable.findUnique({
      where: { id },
      include: {
        academicYear: {
          select: {
            id: true,
            yearCode: true,
            startDate: true,
            endDate: true,
            institution: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        semester: {
          select: {
            id: true,
            semesterNumber: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },
        academicPeriod: {
          select: {
            id: true,
            examStartDate: true,
            examEndDate: true,
            registrationStartDate: true,
            registrationEndDate: true,
          },
        },
        institution: true,
        faculty: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            title: true,
          },
        },
        publisher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        entries: {
          include: {
            course: {
              select: {
                id: true,
                code: true,
                name: true,
                creditHours: true,
                level: true,
                department: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            venue: {
              select: {
                id: true,
                name: true,
                location: true,
                capacity: true,
              },
            },
            exam: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        },
        conflicts: {
          where: {
            isResolved: false,
          },
          include: {
            entry1: {
              select: {
                id: true,
                examDate: true,
                startTime: true,
                endTime: true,
                course: {
                  select: {
                    code: true,
                    name: true,
                  },
                },
              },
            },
            entry2: {
              select: {
                id: true,
                examDate: true,
                startTime: true,
                endTime: true,
                course: {
                  select: {
                    code: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            entries: true,
            conflicts: true,
            imports: true,
          },
        },
      },
    });

    if (!timetable) {
      throw new Error("Timetable not found");
    }

    return {
      success: true,
      data: timetable,
    };
  },

  /**
   * Create a new exam timetable
   */
  async createTimetable(data: CreateTimetableData) {
    // Validate academic period exists and belongs to the semester
    const semester = await prisma.semester.findUnique({
      where: { id: data.semesterId },
      include: {
        academicYear: true,
        academicPeriod: true,
      },
    });

    if (!semester) {
      throw new Error("Semester not found");
    }

    if (semester.academicYearId !== data.academicYearId) {
      throw new Error("Semester does not belong to the specified academic year");
    }

    if (data.academicPeriodId && !semester.academicPeriod) {
      throw new Error("Academic period not found for this semester");
    }

    // Validate date range
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate <= startDate) {
      throw new Error("End date must be after start date");
    }

    // Validate institution and faculty relationship
    if (data.facultyId) {
      const faculty = await prisma.faculty.findUnique({
        where: { id: data.facultyId },
      });

      if (!faculty) {
        throw new Error("Faculty not found");
      }

      if (faculty.institutionId !== data.institutionId) {
        throw new Error("Faculty does not belong to the specified institution");
      }
    }

    // Create timetable
    const timetable = await prisma.examTimetable.create({
      data: {
        title: data.title,
        description: data.description,
        academicYearId: data.academicYearId,
        semesterId: data.semesterId,
        academicPeriodId: data.academicPeriodId,
        institutionId: data.institutionId,
        facultyId: data.facultyId,
        startDate,
        endDate,
        allowOverlaps: data.allowOverlaps ?? false,
        autoResolveConflicts: data.autoResolveConflicts ?? true,
        defaultExamDuration: data.defaultExamDuration ?? 180,
        createdBy: data.createdBy,
      },
      include: {
        academicYear: true,
        semester: true,
        academicPeriod: true,
        institution: true,
        faculty: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Timetable created successfully",
      data: timetable,
    };
  },

  /**
   * Update an existing timetable
   */
  async updateTimetable(id: number, data: UpdateTimetableData) {
    // Check if timetable exists
    const existing = await prisma.examTimetable.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error("Timetable not found");
    }

    // Validate date range if provided
    if (data.startDate || data.endDate) {
      const startDate = data.startDate
        ? new Date(data.startDate)
        : existing.startDate;
      const endDate = data.endDate ? new Date(data.endDate) : existing.endDate;

      if (endDate <= startDate) {
        throw new Error("End date must be after start date");
      }
    }

    // Update timetable
    const timetable = await prisma.examTimetable.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        status: data.status,
        allowOverlaps: data.allowOverlaps,
        autoResolveConflicts: data.autoResolveConflicts,
        defaultExamDuration: data.defaultExamDuration,
      },
      include: {
        academicYear: true,
        semester: true,
        academicPeriod: true,
        institution: true,
        faculty: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Timetable updated successfully",
      data: timetable,
    };
  },

  /**
   * Delete a timetable (only if no entries or in draft status)
   */
  async deleteTimetable(id: number) {
    // Check if timetable exists
    const timetable = await prisma.examTimetable.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            entries: true,
          },
        },
      },
    });

    if (!timetable) {
      throw new Error("Timetable not found");
    }

    // Only allow deletion if in DRAFT status and no entries
    if (
      timetable.status !== ExamTimetableStatus.DRAFT &&
      timetable._count.entries > 0
    ) {
      throw new Error(
        "Cannot delete timetable with entries or that is not in draft status"
      );
    }

    await prisma.examTimetable.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Timetable deleted successfully",
    };
  },

  /**
   * Publish a timetable (make it visible to students)
   */
  async publishTimetable(id: number, publishedBy: number) {
    const timetable = await prisma.examTimetable.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            entries: true,
            conflicts: { where: { isResolved: false } },
          },
        },
      },
    });

    if (!timetable) {
      throw new Error("Timetable not found");
    }

    // Must be approved before publishing
    if (timetable.approvalStatus !== TimetableApprovalStatus.APPROVED) {
      throw new Error("Timetable must be approved before publishing");
    }

    // Check for unresolved critical conflicts
    if (timetable._count.conflicts > 0) {
      const criticalConflicts = await prisma.timetableConflict.count({
        where: {
          timetableId: id,
          isResolved: false,
          severity: {
            in: [ConflictSeverity.HIGH, ConflictSeverity.CRITICAL],
          },
        },
      });

      if (criticalConflicts > 0) {
        throw new Error(
          `Cannot publish timetable with ${criticalConflicts} unresolved critical conflicts`
        );
      }
    }

    const updated = await prisma.examTimetable.update({
      where: { id },
      data: {
        status: ExamTimetableStatus.PUBLISHED,
        isPublished: true,
        publishedAt: new Date(),
        publishedBy,
      },
      include: {
        academicYear: true,
        semester: true,
        institution: true,
        faculty: true,
      },
    });

    return {
      success: true,
      message: "Timetable published successfully",
      data: updated,
    };
  },

  /**
   * Submit timetable for approval
   */
  async submitForApproval(id: number) {
    const timetable = await prisma.examTimetable.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            entries: true,
          },
        },
      },
    });

    if (!timetable) {
      throw new Error("Timetable not found");
    }

    if (timetable._count.entries === 0) {
      throw new Error("Cannot submit empty timetable for approval");
    }

    const updated = await prisma.examTimetable.update({
      where: { id },
      data: {
        status: ExamTimetableStatus.PENDING_APPROVAL,
        approvalStatus: TimetableApprovalStatus.PENDING,
      },
    });

    return {
      success: true,
      message: "Timetable submitted for approval",
      data: updated,
    };
  },

  /**
   * Approve timetable
   */
  async approveTimetable(id: number, approvedBy: number) {
    const updated = await prisma.examTimetable.update({
      where: { id },
      data: {
        status: ExamTimetableStatus.APPROVED,
        approvalStatus: TimetableApprovalStatus.APPROVED,
        approvedBy,
        approvedAt: new Date(),
        rejectionReason: null,
      },
    });

    return {
      success: true,
      message: "Timetable approved successfully",
      data: updated,
    };
  },

  /**
   * Reject timetable
   */
  async rejectTimetable(id: number, reason: string) {
    const updated = await prisma.examTimetable.update({
      where: { id },
      data: {
        status: ExamTimetableStatus.DRAFT,
        approvalStatus: TimetableApprovalStatus.REJECTED,
        rejectionReason: reason,
      },
    });

    return {
      success: true,
      message: "Timetable rejected",
      data: updated,
    };
  },

  // ========================================
  // TIMETABLE ENTRY OPERATIONS
  // ========================================

  /**
   * Get timetable entries with filtering
   */
  async getTimetableEntries(query: TimetableEntryQuery) {
    const {
      timetableId,
      courseId,
      programId,
      level,
      venueId,
      roomId,
      invigilatorId,
      status,
      examDate,
      startDate,
      endDate,
      hasConflicts,
      page = 1,
      limit = 50,
      search = "",
      sortBy = "examDate",
      sortOrder = "asc",
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (timetableId) where.timetableId = timetableId;
    if (courseId) where.courseId = courseId;
    if (level) where.level = level;
    if (venueId) where.venueId = venueId;
    if (status) where.status = status;
    if (hasConflicts !== undefined) where.hasConflicts = hasConflicts;

    if (examDate) {
      where.examDate = new Date(examDate);
    } else if (startDate || endDate) {
      where.examDate = {};
      if (startDate) where.examDate.gte = new Date(startDate);
      if (endDate) where.examDate.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { course: { code: { contains: search, mode: "insensitive" } } },
        { course: { name: { contains: search, mode: "insensitive" } } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filter by program ID (stored as JSON array)
    if (programId) {
      const entries = await prisma.examTimetableEntry.findMany({
        where,
      });

      // Filter in memory for JSON array contains
      const filtered = entries.filter((entry) => {
        try {
          const programIds = JSON.parse(entry.programIds);
          return programIds.includes(programId);
        } catch {
          return false;
        }
      });

      // Get IDs of filtered entries
      const ids = filtered.map((e) => e.id);
      if (ids.length > 0) {
        where.id = { in: ids };
      } else {
        // No matching entries
        return {
          success: true,
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        };
      }
    }

    const total = await prisma.examTimetableEntry.count({ where });

    const entries = await prisma.examTimetableEntry.findMany({
      where,
      include: {
        timetable: {
          select: {
            id: true,
            title: true,
            status: true,
            isPublished: true,
          },
        },
        course: {
          include: {
            department: {
              select: {
                id: true,
                name: true,
                faculty: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        venue: true,
        exam: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: sortBy === "courseCode"
        ? { course: { code: sortOrder } }
        : sortBy === "venue"
        ? { venue: { name: sortOrder } }
        : { [sortBy]: sortOrder },
    });

    return {
      success: true,
      data: entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  },

  /**
   * Get single timetable entry by ID
   */
  async getTimetableEntryById(id: number) {
    const entry = await prisma.examTimetableEntry.findUnique({
      where: { id },
      include: {
        timetable: {
          include: {
            academicYear: true,
            semester: true,
            institution: true,
            faculty: true,
          },
        },
        course: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        venue: {
          include: {
            rooms: true,
          },
        },
        exam: true,
      },
    });

    if (!entry) {
      throw new Error("Timetable entry not found");
    }

    // Parse JSON fields
    const programIds = JSON.parse(entry.programIds);
    const roomIds = JSON.parse(entry.roomIds);
    const invigilatorIds = JSON.parse(entry.invigilatorIds);

    // Fetch related data
    const [programs, rooms, invigilators] = await Promise.all([
      prisma.program.findMany({
        where: { id: { in: programIds } },
        include: {
          department: true,
        },
      }),
      prisma.room.findMany({
        where: { id: { in: roomIds } },
      }),
      prisma.user.findMany({
        where: { id: { in: invigilatorIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          title: true,
        },
      }),
    ]);

    const chiefInvigilator = entry.chiefInvigilatorId
      ? await prisma.user.findUnique({
          where: { id: entry.chiefInvigilatorId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            title: true,
          },
        })
      : null;

    return {
      success: true,
      data: {
        ...entry,
        programs,
        rooms,
        invigilators,
        chiefInvigilator,
      },
    };
  },

  /**
   * Create a new timetable entry
   */
  async createTimetableEntry(data: CreateTimetableEntryData) {
    // Validate timetable exists and is editable
    const timetable = await prisma.examTimetable.findUnique({
      where: { id: data.timetableId },
    });

    if (!timetable) {
      throw new Error("Timetable not found");
    }

    if (
      timetable.status === ExamTimetableStatus.PUBLISHED ||
      timetable.status === ExamTimetableStatus.COMPLETED ||
      timetable.status === ExamTimetableStatus.ARCHIVED
    ) {
      throw new Error("Cannot add entries to a published/completed/archived timetable");
    }

    // Validate course exists
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    // Validate programs exist
    for (const programId of data.programIds) {
      const program = await prisma.program.findUnique({
        where: { id: programId },
      });
      if (!program) {
        throw new Error(`Program with ID ${programId} not found`);
      }
    }

    // Validate venue and rooms
    const venue = await prisma.venue.findUnique({
      where: { id: data.venueId },
      include: { rooms: true },
    });

    if (!venue) {
      throw new Error("Venue not found");
    }

    for (const roomId of data.roomIds) {
      const room = venue.rooms.find((r) => r.id === roomId);
      if (!room) {
        throw new Error(`Room with ID ${roomId} not found in venue`);
      }
    }

    // Calculate seating capacity
    const rooms = await prisma.room.findMany({
      where: { id: { in: data.roomIds } },
    });
    const seatingCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);

    // Validate timing
    const examDate = new Date(data.examDate);
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (endTime <= startTime) {
      throw new Error("End time must be after start time");
    }

    if (
      examDate < timetable.startDate ||
      examDate > timetable.endDate
    ) {
      throw new Error("Exam date must be within timetable date range");
    }

    // Store as JSON arrays
    const programIdsJson = JSON.stringify(data.programIds);
    const roomIdsJson = JSON.stringify(data.roomIds);
    const invigilatorIdsJson = JSON.stringify(data.invigilatorIds || []);

    // Create entry
    const entry = await prisma.examTimetableEntry.create({
      data: {
        timetableId: data.timetableId,
        courseId: data.courseId,
        programIds: programIdsJson,
        level: data.level,
        examDate,
        startTime,
        endTime,
        duration: data.duration,
        venueId: data.venueId,
        roomIds: roomIdsJson,
        seatingCapacity,
        invigilatorIds: invigilatorIdsJson,
        chiefInvigilatorId: data.chiefInvigilatorId,
        notes: data.notes,
        specialRequirements: data.specialRequirements,
      },
      include: {
        timetable: true,
        course: true,
        venue: true,
      },
    });

    // Check for conflicts
    await examTimetableService.detectConflicts(data.timetableId);

    // Update timetable statistics
    await examTimetableService.updateTimetableStats(data.timetableId);

    return {
      success: true,
      message: "Timetable entry created successfully",
      data: entry,
    };
  },

  /**
   * Update a timetable entry
   */
  /**
   * Get modification permissions for a user on a specific entry
   */
  async getModificationPermissions(
    userId: number,
    userRole: string,
    entryId: number
  ) {
    // Get entry with faculty/department context
    const entry = await prisma.examTimetableEntry.findUnique({
      where: { id: entryId },
      include: {
        timetable: {
          include: { faculty: true }
        },
        course: {
          include: { department: true }
        }
      }
    });

    if (!entry) {
      throw new Error('Entry not found');
    }

    // ADMIN and EXAMS_OFFICER: Full permissions
    if (['ADMIN', 'SUPER_ADMIN', 'EXAMS_OFFICER'].includes(userRole)) {
      return {
        canModifyTime: true,
        canModifyDate: true,
        canModifyVenue: true,
        canModifyInvigilators: true,
        canModifyCourse: true,
        canDelete: true,
        scope: 'ALL'
      };
    }

    // DEAN/FACULTY_ADMIN: Venue and invigilators for faculty exams only
    if (['DEAN', 'FACULTY_ADMIN'].includes(userRole)) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { facultyId: true }
      });

      const isFacultyExam = entry.timetable.facultyId === user?.facultyId;

      return {
        canModifyTime: false,
        canModifyDate: false,
        canModifyVenue: isFacultyExam,
        canModifyInvigilators: isFacultyExam,
        canModifyCourse: false,
        canDelete: false,
        scope: isFacultyExam ? 'FACULTY' : 'NONE'
      };
    }

    // HOD: Venue and invigilators for department courses only
    if (userRole === 'HOD') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { departmentId: true }
      });

      const isDepartmentCourse = entry.course.departmentId === user?.departmentId;

      return {
        canModifyTime: false,
        canModifyDate: false,
        canModifyVenue: isDepartmentCourse,
        canModifyInvigilators: isDepartmentCourse,
        canModifyCourse: false,
        canDelete: false,
        scope: isDepartmentCourse ? 'DEPARTMENT' : 'NONE'
      };
    }

    // Default: No permissions
    return {
      canModifyTime: false,
      canModifyDate: false,
      canModifyVenue: false,
      canModifyInvigilators: false,
      canModifyCourse: false,
      canDelete: false,
      scope: 'NONE'
    };
  },

  /**
   * Update timetable entry with role-based permission checks
   */
  async updateTimetableEntry(
    id: number,
    data: UpdateTimetableEntryData,
    userId?: number,
    userRole?: string
  ) {
    // Get existing entry
    const existing = await prisma.examTimetableEntry.findUnique({
      where: { id },
      include: { timetable: true },
    });

    if (!existing) {
      throw new Error("Timetable entry not found");
    }

    // Check if timetable is editable
    if (
      existing.timetable.status === ExamTimetableStatus.PUBLISHED ||
      existing.timetable.status === ExamTimetableStatus.COMPLETED ||
      existing.timetable.status === ExamTimetableStatus.ARCHIVED
    ) {
      throw new Error("Cannot edit entries in a published/completed/archived timetable");
    }

    // Check permissions if userId and userRole provided
    if (userId && userRole) {
      const permissions = await this.getModificationPermissions(
        userId,
        userRole,
        id
      );

      // Check if user is trying to modify restricted fields
      if (data.examDate && !permissions.canModifyDate) {
        throw new Error('You do not have permission to modify exam dates');
      }

      if ((data.startTime || data.endTime || data.duration) && !permissions.canModifyTime) {
        throw new Error('You do not have permission to modify exam times');
      }

      if ((data.venueId || data.roomIds) && !permissions.canModifyVenue) {
        throw new Error('You do not have permission to modify venues');
      }

      if ((data.invigilatorIds || data.chiefInvigilatorId) && !permissions.canModifyInvigilators) {
        throw new Error('You do not have permission to modify invigilators');
      }

      if (data.courseId && !permissions.canModifyCourse) {
        throw new Error('You do not have permission to change the course');
      }
    }

    // Validate changes
    if (data.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: data.courseId },
      });
      if (!course) {
        throw new Error("Course not found");
      }
    }

    if (data.venueId) {
      const venue = await prisma.venue.findUnique({
        where: { id: data.venueId },
      });
      if (!venue) {
        throw new Error("Venue not found");
      }
    }

    // Build update data
    const updateData: any = {};

    if (data.courseId) updateData.courseId = data.courseId;
    if (data.level) updateData.level = data.level;
    if (data.venueId) updateData.venueId = data.venueId;
    if (data.status) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.specialRequirements !== undefined) updateData.specialRequirements = data.specialRequirements;
    if (data.chiefInvigilatorId !== undefined) updateData.chiefInvigilatorId = data.chiefInvigilatorId;

    if (data.programIds) {
      updateData.programIds = JSON.stringify(data.programIds);
    }
    if (data.roomIds) {
      updateData.roomIds = JSON.stringify(data.roomIds);
      // Recalculate seating capacity
      const rooms = await prisma.room.findMany({
        where: { id: { in: data.roomIds } },
      });
      updateData.seatingCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
    }
    if (data.invigilatorIds) {
      updateData.invigilatorIds = JSON.stringify(data.invigilatorIds);
    }

    if (data.examDate) updateData.examDate = new Date(data.examDate);
    if (data.startTime) updateData.startTime = new Date(data.startTime);
    if (data.endTime) updateData.endTime = new Date(data.endTime);
    if (data.duration) updateData.duration = data.duration;

    // Validate timing if changed
    if (data.startTime || data.endTime) {
      const startTime = data.startTime ? new Date(data.startTime) : existing.startTime;
      const endTime = data.endTime ? new Date(data.endTime) : existing.endTime;

      if (endTime <= startTime) {
        throw new Error("End time must be after start time");
      }
    }

    const updated = await prisma.examTimetableEntry.update({
      where: { id },
      data: updateData,
      include: {
        timetable: true,
        course: true,
        venue: true,
      },
    });

    // Re-check for conflicts
    await examTimetableService.detectConflicts(existing.timetableId);

    // Update timetable statistics
    await examTimetableService.updateTimetableStats(existing.timetableId);

    return {
      success: true,
      message: "Timetable entry updated successfully",
      data: updated,
    };
  },

  /**
   * Delete a timetable entry
   */
  /**
   * Delete timetable entry with permission checks
   */
  async deleteTimetableEntry(id: number, userId?: number, userRole?: string) {
    const entry = await prisma.examTimetableEntry.findUnique({
      where: { id },
      include: { timetable: true },
    });

    if (!entry) {
      throw new Error("Timetable entry not found");
    }

    // Check if timetable is editable
    if (
      entry.timetable.status === ExamTimetableStatus.PUBLISHED ||
      entry.timetable.status === ExamTimetableStatus.COMPLETED ||
      entry.timetable.status === ExamTimetableStatus.ARCHIVED
    ) {
      throw new Error("Cannot delete entries from a published/completed/archived timetable");
    }

    // Check permissions if userId and userRole provided
    if (userId && userRole) {
      const permissions = await this.getModificationPermissions(
        userId,
        userRole,
        id
      );

      if (!permissions.canDelete) {
        throw new Error('You do not have permission to delete timetable entries');
      }
    }

    await prisma.examTimetableEntry.delete({
      where: { id },
    });

    // Update timetable statistics
    await examTimetableService.updateTimetableStats(entry.timetableId);

    return {
      success: true,
      message: "Timetable entry deleted successfully",
    };
  },

  // ========================================
  // CONFLICT DETECTION & RESOLUTION
  // ========================================

  /**
   * Detect all conflicts in a timetable
   */
  async detectConflicts(timetableId: number) {
    const entries = await prisma.examTimetableEntry.findMany({
      where: { timetableId },
      include: {
        course: true,
        venue: true,
      },
    });

    // Delete existing unresolved conflicts
    await prisma.timetableConflict.deleteMany({
      where: {
        timetableId,
        isResolved: false,
      },
    });

    const conflicts: any[] = [];

    // Check for various types of conflicts
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const entry1 = entries[i];
        const entry2 = entries[j];

        // Check time overlap
        const timeOverlap =
          entry1.examDate.getTime() === entry2.examDate.getTime() &&
          entry1.startTime < entry2.endTime &&
          entry1.endTime > entry2.startTime;

        if (timeOverlap) {
          // Check venue conflict
          if (entry1.venueId === entry2.venueId) {
            const rooms1 = JSON.parse(entry1.roomIds);
            const rooms2 = JSON.parse(entry2.roomIds);
            const roomOverlap = rooms1.some((r: number) => rooms2.includes(r));

            if (roomOverlap) {
              conflicts.push({
                type: ConflictType.VENUE_OVERLAP,
                severity: ConflictSeverity.HIGH,
                entry1Id: entry1.id,
                entry2Id: entry2.id,
                description: `Venue/room overlap: ${entry1.course.code} and ${entry2.course.code} both scheduled in the same room at the same time`,
                canAutoResolve: true,
                suggestedResolution: "Assign different rooms or reschedule one exam",
              });
            }
          }

          // Check student conflict (program overlap)
          const programs1 = JSON.parse(entry1.programIds);
          const programs2 = JSON.parse(entry2.programIds);
          const programOverlap = programs1.some((p: number) => programs2.includes(p));

          if (programOverlap) {
            conflicts.push({
              type: ConflictType.STUDENT_OVERLAP,
              severity: ConflictSeverity.CRITICAL,
              entry1Id: entry1.id,
              entry2Id: entry2.id,
              description: `Student conflict: Programs have students taking both ${entry1.course.code} and ${entry2.course.code} at the same time`,
              affectedPrograms: JSON.stringify(programs1.filter((p: number) => programs2.includes(p))),
              canAutoResolve: true,
              suggestedResolution: "Reschedule one of the exams to a different time slot",
            });
          }

          // Check invigilator conflict
          const invigs1 = JSON.parse(entry1.invigilatorIds);
          const invigs2 = JSON.parse(entry2.invigilatorIds);
          const invigilatorOverlap = invigs1.some((i: number) => invigs2.includes(i));

          if (invigilatorOverlap || entry1.chiefInvigilatorId === entry2.chiefInvigilatorId) {
            conflicts.push({
              type: ConflictType.INVIGILATOR_OVERLAP,
              severity: ConflictSeverity.MEDIUM,
              entry1Id: entry1.id,
              entry2Id: entry2.id,
              description: `Invigilator assigned to multiple exams at the same time`,
              canAutoResolve: true,
              suggestedResolution: "Assign different invigilators to one of the exams",
            });
          }
        }
      }

      // Check capacity for each entry (outer loop)
      const entry1 = entries[i];
      if (entry1.studentCount && entry1.seatingCapacity) {
        if (entry1.studentCount > entry1.seatingCapacity) {
          conflicts.push({
            type: ConflictType.CAPACITY_EXCEEDED,
            severity: ConflictSeverity.HIGH,
            entry1Id: entry1.id,
            entry2Id: entry1.id, // Same entry
            description: `Venue capacity exceeded: ${entry1.studentCount} students need ${entry1.seatingCapacity} seats`,
            canAutoResolve: true,
            suggestedResolution: "Assign additional rooms or use a larger venue",
          });
        }
      }
    }

    // Create conflict records
    for (const conflict of conflicts) {
      await prisma.timetableConflict.create({
        data: {
          timetableId,
          ...conflict,
        },
      });

      // Update entries to mark as having conflicts
      await prisma.examTimetableEntry.update({
        where: { id: conflict.entry1Id },
        data: { hasConflicts: true },
      });

      if (conflict.entry1Id !== conflict.entry2Id) {
        await prisma.examTimetableEntry.update({
          where: { id: conflict.entry2Id },
          data: { hasConflicts: true },
        });
      }
    }

    // Clear conflict flag for entries with no conflicts
    const conflictEntryIds = new Set(conflicts.flatMap(c => [c.entry1Id, c.entry2Id]));
    const nonConflictEntries = entries.filter(e => !conflictEntryIds.has(e.id));

    for (const entry of nonConflictEntries) {
      await prisma.examTimetableEntry.update({
        where: { id: entry.id },
        data: { hasConflicts: false, conflictDetails: null },
      });
    }

    return {
      success: true,
      conflicts,
      totalConflicts: conflicts.length,
    };
  },

  /**
   * Get conflicts for a specific timetable
   */
  async getTimetableConflicts(timetableId: number) {
    const conflicts = await prisma.timetableConflict.findMany({
      where: { timetableId },
      include: {
        entry1: {
          include: {
            course: true,
            venue: true,
          },
        },
        entry2: {
          include: {
            course: true,
            venue: true,
          },
        },
        resolver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [
        { isResolved: 'asc' },
        { severity: 'desc' },
        { detectedAt: 'desc' },
      ],
    });

    return {
      success: true,
      data: conflicts,
      summary: {
        total: conflicts.length,
        resolved: conflicts.filter(c => c.isResolved).length,
        unresolved: conflicts.filter(c => !c.isResolved).length,
        bySeverity: {
          critical: conflicts.filter(c => c.severity === ConflictSeverity.CRITICAL && !c.isResolved).length,
          high: conflicts.filter(c => c.severity === ConflictSeverity.HIGH && !c.isResolved).length,
          medium: conflicts.filter(c => c.severity === ConflictSeverity.MEDIUM && !c.isResolved).length,
          low: conflicts.filter(c => c.severity === ConflictSeverity.LOW && !c.isResolved).length,
        },
      },
    };
  },

  /**
   * Resolve a conflict
   */
  async resolveConflict(conflictId: string, resolvedBy: number) {
    const conflict = await prisma.timetableConflict.update({
      where: { id: conflictId },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy,
      },
    });

    return {
      success: true,
      message: "Conflict resolved successfully",
      data: conflict,
    };
  },

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  /**
   * Update timetable statistics
   */
  async updateTimetableStats(timetableId: number) {
    const [totalExams, unresolvedConflicts] = await Promise.all([
      prisma.examTimetableEntry.count({
        where: { timetableId },
      }),
      prisma.timetableConflict.count({
        where: {
          timetableId,
          isResolved: false,
        },
      }),
    ]);

    await prisma.examTimetable.update({
      where: { id: timetableId },
      data: {
        totalExams,
        totalConflicts: unresolvedConflicts,
      },
    });
  },

  /**
   * Get timetable statistics
   */
  async getTimetableStatistics(timetableId: number) {
    const [timetable, entries, conflicts] = await Promise.all([
      prisma.examTimetable.findUnique({
        where: { id: timetableId },
        include: {
          academicYear: true,
          semester: true,
        },
      }),
      prisma.examTimetableEntry.findMany({
        where: { timetableId },
        include: {
          venue: true,
        },
      }),
      prisma.timetableConflict.findMany({
        where: { timetableId },
      }),
    ]);

    if (!timetable) {
      throw new Error("Timetable not found");
    }

    // Calculate statistics
    const uniqueVenues = new Set(entries.map(e => e.venueId)).size;
    const uniqueCourses = new Set(entries.map(e => e.courseId)).size;
    const uniqueDates = new Set(entries.map(e => e.examDate.toDateString())).size;

    const totalStudents = entries.reduce((sum, e) => sum + (e.studentCount || 0), 0);
    const totalSeats = entries.reduce((sum, e) => sum + (e.seatingCapacity || 0), 0);

    return {
      success: true,
      data: {
        timetableInfo: {
          id: timetable.id,
          title: timetable.title,
          status: timetable.status,
          isPublished: timetable.isPublished,
          dateRange: {
            start: timetable.startDate,
            end: timetable.endDate,
            days: Math.ceil((timetable.endDate.getTime() - timetable.startDate.getTime()) / (1000 * 60 * 60 * 24)),
          },
        },
        exams: {
          total: entries.length,
          byStatus: {
            draft: entries.filter(e => e.status === ExamTimetableEntryStatus.DRAFT).length,
            scheduled: entries.filter(e => e.status === ExamTimetableEntryStatus.SCHEDULED).length,
            confirmed: entries.filter(e => e.status === ExamTimetableEntryStatus.CONFIRMED).length,
            inProgress: entries.filter(e => e.status === ExamTimetableEntryStatus.IN_PROGRESS).length,
            completed: entries.filter(e => e.status === ExamTimetableEntryStatus.COMPLETED).length,
            cancelled: entries.filter(e => e.status === ExamTimetableEntryStatus.CANCELLED).length,
          },
          uniqueCourses,
          uniqueDates,
          averagePerDay: uniqueDates > 0 ? (entries.length / uniqueDates).toFixed(2) : 0,
        },
        venues: {
          uniqueVenues,
          totalSeats,
          utilizationRate: totalSeats > 0 ? ((totalStudents / totalSeats) * 100).toFixed(2) : 0,
        },
        conflicts: {
          total: conflicts.length,
          resolved: conflicts.filter(c => c.isResolved).length,
          unresolved: conflicts.filter(c => !c.isResolved).length,
          bySeverity: {
            critical: conflicts.filter(c => c.severity === ConflictSeverity.CRITICAL && !c.isResolved).length,
            high: conflicts.filter(c => c.severity === ConflictSeverity.HIGH && !c.isResolved).length,
            medium: conflicts.filter(c => c.severity === ConflictSeverity.MEDIUM && !c.isResolved).length,
            low: conflicts.filter(c => c.severity === ConflictSeverity.LOW && !c.isResolved).length,
          },
          byType: {
            studentOverlap: conflicts.filter(c => c.type === ConflictType.STUDENT_OVERLAP && !c.isResolved).length,
            venueOverlap: conflicts.filter(c => c.type === ConflictType.VENUE_OVERLAP && !c.isResolved).length,
            invigilatorOverlap: conflicts.filter(c => c.type === ConflictType.INVIGILATOR_OVERLAP && !c.isResolved).length,
            capacityExceeded: conflicts.filter(c => c.type === ConflictType.CAPACITY_EXCEEDED && !c.isResolved).length,
          },
        },
        students: {
          total: totalStudents,
          averagePerExam: entries.length > 0 ? (totalStudents / entries.length).toFixed(2) : 0,
        },
      },
    };
  },
};
