import { PrismaClient } from "@prisma/client";
import {
  ExamSessionLog,
  InvigilatorAssignment,
  StudentVerification,
  ExamIncident,
  VenueSessionOverview,
  ExamSessionStatus,
  InstitutionLogisticsDashboard,
  ExamsOfficerDashboard,
  AssignInvigilatorData,
  ReassignInvigilatorData,
  StudentCheckInData,
  ChangeStudentRoomData,
  ReportExamIncidentData,
  LogisticsQuery,
  ExamSessionAction,
  InvigilatorRole,
  AssignmentStatus,
  VerificationStatus,
  VerificationMethod,
  ExamIncidentType,
  IncidentSeverity,
  IncidentStatus,
  ExamSessionActionDetails,
  ExamTimetableEntry,
} from "../types/examLogistics";
import {
  incrementStudentPresence,
  updateInvigilatorPresence,
  updateIncidentFlags,
  getExamLogistics,
  syncExamLogistics
} from "../utils/examLogisticsHelpers";
import { examLogisticsRealtimeService } from "./examLogisticsRealtimeService";

const prisma = new PrismaClient();

export const examLogisticsService = {
  // ========================================
  // INVIGILATOR ASSIGNMENT MANAGEMENT
  // ========================================

  /**
   * Assign an invigilator to an exam entry
   */
  async assignInvigilator(data: AssignInvigilatorData) {
    // Validate exam entry exists and is published
    const examEntry = await prisma.examTimetableEntry.findUnique({
      where: { id: data.examEntryId },
      include: { timetable: true },
    });

    if (!examEntry) {
      throw new Error("Exam entry not found");
    }

    if (!examEntry.timetable.isPublished) {
      throw new Error("Cannot assign invigilators to unpublished exam entries");
    }

    // Check for existing assignment
    const existingAssignment = await prisma.invigilatorAssignment.findUnique({
      where: {
        examEntryId_invigilatorId: {
          examEntryId: data.examEntryId,
          invigilatorId: data.invigilatorId,
        },
      },
    });

    if (existingAssignment) {
      throw new Error("Invigilator is already assigned to this exam entry");
    }

    // Create assignment
    const assignment = await prisma.invigilatorAssignment.create({
      data: {
        examEntryId: data.examEntryId,
        invigilatorId: data.invigilatorId,
        role: data.role,
        assignedBy: data.assignedBy,
        venueId: data.venueId,
        duties: data.duties,
      },
      include: {
        examEntry: {
          include: {
            course: true,
            venue: true,
          },
        },
        invigilator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Log the assignment
    await this.logSessionAction({
      examEntryId: data.examEntryId,
      action: ExamSessionAction.INVIGILATOR_REASSIGNMENT,
      performedBy: data.assignedBy,
      details: {
        action: ExamSessionAction.INVIGILATOR_REASSIGNMENT,
        description: "Invigilator assigned",
        metadata: {
          invigilatorId: data.invigilatorId,
          role: data.role,
          venueId: data.venueId,
        },
      },
      notes: `Invigilator ${assignment.invigilator.firstName} ${assignment.invigilator.lastName} assigned as ${data.role}`,
    });

    return {
      success: true,
      message: "Invigilator assigned successfully",
      data: assignment,
    };
  },

  /**
   * Reassign an invigilator to a different exam entry or venue
   */
  async reassignInvigilator(data: ReassignInvigilatorData) {
    const existingAssignment = await prisma.invigilatorAssignment.findUnique({
      where: { id: data.assignmentId },
    });

    if (!existingAssignment) {
      throw new Error("Assignment not found");
    }

    // Update the existing assignment
    const updatedAssignment = await prisma.invigilatorAssignment.update({
      where: { id: data.assignmentId },
      data: {
        status: AssignmentStatus.REASSIGNED,
        reassignedAt: new Date(),
        reassignmentReason: data.reason,
      },
    });

    // Create new assignment if specified
    let newAssignment = null;
    if (data.newExamEntryId) {
      const newExamEntry = await prisma.examTimetableEntry.findUnique({
        where: { id: data.newExamEntryId },
      });

      if (!newExamEntry) {
        throw new Error("New exam entry not found");
      }

      newAssignment = await prisma.invigilatorAssignment.create({
        data: {
          examEntryId: data.newExamEntryId,
          invigilatorId: existingAssignment.invigilatorId,
          role: existingAssignment.role,
          assignedBy: data.reassignedBy,
          venueId: data.newVenueId || existingAssignment.venueId,
          duties: existingAssignment.duties,
          reassignedFrom: data.assignmentId,
        },
      });
    }

    // Log the reassignment
    await this.logSessionAction({
      examEntryId: existingAssignment.examEntryId,
      action: ExamSessionAction.INVIGILATOR_REASSIGNMENT,
      performedBy: data.reassignedBy,
      invigilatorId: existingAssignment.invigilatorId,
      details: {
        action: ExamSessionAction.INVIGILATOR_REASSIGNMENT,
        description: "Invigilator reassigned",
        metadata: {
          oldAssignmentId: data.assignmentId,
          newAssignmentId: newAssignment?.id,
          reason: data.reason,
        },
      },
      notes: `Invigilator reassigned: ${data.reason}`,
    });

    return {
      success: true,
      message: "Invigilator reassigned successfully",
      data: {
        oldAssignment: updatedAssignment,
        newAssignment,
      },
    };
  },

  /**
   * Update invigilator check-in/check-out status
   */
  async updateInvigilatorPresence(assignmentId: number, action: 'check_in' | 'check_out', performedBy: number) {
    const assignment = await prisma.invigilatorAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        invigilator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        examEntry: {
          include: {
            timetable: {
              select: {
                institutionId: true
              }
            },
            venue: true
          }
        }
      },
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    const updateData: Partial<{
      checkedInAt: Date;
      checkedOutAt: Date;
      status: AssignmentStatus;
    }> = {};
    let sessionAction: ExamSessionAction;
    let statusUpdate: AssignmentStatus;

    if (action === 'check_in') {
      updateData.checkedInAt = new Date();
      updateData.status = AssignmentStatus.CHECKED_IN;
      sessionAction = ExamSessionAction.INVIGILATOR_CHECK_IN;
      statusUpdate = AssignmentStatus.CHECKED_IN;
      // Increment invigilator presence
      await updateInvigilatorPresence(assignment.examEntryId, true);
    } else {
      updateData.checkedOutAt = new Date();
      updateData.status = AssignmentStatus.CHECKED_OUT;
      sessionAction = ExamSessionAction.INVIGILATOR_CHECK_OUT;
      statusUpdate = AssignmentStatus.CHECKED_OUT;
      // Decrement invigilator presence
      await updateInvigilatorPresence(assignment.examEntryId, false);
    }

    const updated = await prisma.invigilatorAssignment.update({
      where: { id: assignmentId },
      data: updateData,
    });

    // Get updated logistics
    const logistics = await getExamLogistics(assignment.examEntryId);

    // Log the action
    await this.logSessionAction({
      examEntryId: assignment.examEntryId,
      action: sessionAction,
      performedBy,
      invigilatorId: assignment.invigilatorId,
      venueId: assignment.venueId,
      details: {
        action: sessionAction,
        description: `${action === 'check_in' ? 'Check-in' : 'Check-out'} action`,
        metadata: {
          assignmentId,
        },
      },
      notes: `Invigilator ${assignment.invigilator.firstName} ${assignment.invigilator.lastName} ${action === 'check_in' ? 'checked in' : 'checked out'}`,
    });

    // Broadcast real-time event
    const eventData = {
      examEntryId: assignment.examEntryId,
      institutionId: assignment.examEntry.timetable.institutionId,
      venueId: assignment.venueId,
      invigilatorId: assignment.invigilatorId,
      invigilatorName: `${assignment.invigilator.firstName} ${assignment.invigilator.lastName}`,
      role: assignment.role,
      invigilatorsPresent: logistics?.invigilatorsPresent || 0,
      invigilatorsAssigned: logistics?.invigilatorsAssigned || 0
    };

    if (action === 'check_in') {
      examLogisticsRealtimeService.broadcastInvigilatorCheckIn(eventData);
    } else {
      examLogisticsRealtimeService.broadcastInvigilatorCheckOut(eventData);
    }

    return {
      success: true,
      message: `Invigilator ${action === 'check_in' ? 'checked in' : 'checked out'} successfully`,
      data: updated,
    };
  },

  // ========================================
  // STUDENT VERIFICATION MANAGEMENT
  // ========================================

  /**
   * Check in a student for an exam
   */
  async checkInStudent(data: StudentCheckInData) {
    // Validate exam entry and student registration
    const registration = await prisma.examRegistration.findUnique({
      where: {
        studentId_examEntryId: {
          studentId: data.studentId,
          examEntryId: data.examEntryId,
        },
      },
      include: {
        examEntry: {
          include: {
            course: true,
            venue: true,
            timetable: {
              select: {
                institutionId: true
              }
            }
          }
        }
      }
    });

    if (!registration) {
      throw new Error("Student is not registered for this exam");
    }

    // Check if already verified
    const existingVerification = await prisma.studentVerification.findUnique({
      where: {
        examEntryId_studentId: {
          examEntryId: data.examEntryId,
          studentId: data.studentId,
        },
      },
    });

    if (existingVerification && existingVerification.status === VerificationStatus.VERIFIED) {
      throw new Error("Student is already checked in for this exam");
    }

    // Check if student is late
    const now = new Date();
    const startTime = new Date(registration.examEntry.startTime);
    const isLate = now > startTime;

    // Create or update verification
    const verificationData: {
      examEntryId: number;
      studentId: number;
      verifiedBy: number;
      status: VerificationStatus;
      method: VerificationMethod;
      seatNumber?: string;
      qrCode?: string;
      notes?: string;
    } = {
      examEntryId: data.examEntryId,
      studentId: data.studentId,
      verifiedBy: data.verifiedBy,
      status: VerificationStatus.VERIFIED,
      method: data.verificationMethod,
      seatNumber: data.seatNumber,
      qrCode: data.qrCode,
      notes: isLate ? 'Late arrival' : undefined
    };

    const verification = await prisma.studentVerification.upsert({
      where: {
        examEntryId_studentId: {
          examEntryId: data.examEntryId,
          studentId: data.studentId,
        },
      },
      update: verificationData,
      create: verificationData,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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
    });

    // Update exam registration attendance
    await prisma.examRegistration.update({
      where: {
        studentId_examEntryId: {
          studentId: data.studentId,
          examEntryId: data.examEntryId,
        },
      },
      data: {
        isPresent: true,
        attendanceMarkedAt: new Date(),
        attendanceMarkedBy: data.verifiedBy,
        seatNumber: data.seatNumber,
      },
    });

    // Update ExamLogistics counters
    await incrementStudentPresence(data.examEntryId, isLate);

    // Get updated logistics for real-time broadcast
    const logistics = await getExamLogistics(data.examEntryId);

    // Log the check-in
    await this.logSessionAction({
      examEntryId: data.examEntryId,
      action: ExamSessionAction.STUDENT_CHECK_IN,
      performedBy: data.verifiedBy,
      studentId: data.studentId,
      details: {
        action: ExamSessionAction.STUDENT_CHECK_IN,
        description: "Student check-in",
        metadata: {
          method: data.verificationMethod,
          seatNumber: data.seatNumber,
          isLate
        },
      },
      notes: `Student ${verification.student.firstName} ${verification.student.lastName} checked in via ${data.verificationMethod}${isLate ? ' (late)' : ''}`,
    });

    // Broadcast real-time event
    examLogisticsRealtimeService.broadcastStudentCheckIn({
      examEntryId: data.examEntryId,
      institutionId: registration.examEntry.timetable.institutionId,
      venueId: registration.examEntry.venueId,
      studentId: data.studentId,
      studentName: `${verification.student.firstName} ${verification.student.lastName}`,
      seatNumber: data.seatNumber,
      verificationMethod: data.verificationMethod,
      totalPresent: logistics?.totalPresent || 0,
      totalExpected: logistics?.totalExpected || 0
    });

    return {
      success: true,
      message: "Student checked in successfully",
      data: verification,
    };
  },

  /**
   * Change a student's assigned room
   */
  async changeStudentRoom(data: ChangeStudentRoomData) {
    const verification = await prisma.studentVerification.findUnique({
      where: { id: data.verificationId },
      include: {
        examEntry: true,
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!verification) {
      throw new Error("Student verification not found");
    }

    // Validate new room belongs to the venue
    const room = await prisma.room.findUnique({
      where: { id: data.newRoomId },
      include: { venue: true },
    });

    if (!room) {
      throw new Error("New room not found");
    }

    if (room.venueId !== verification.examEntry.venueId) {
      throw new Error("New room does not belong to the exam venue");
    }

    // Update verification with new room
    const updated = await prisma.studentVerification.update({
      where: { id: data.verificationId },
      data: {
        notes: `Room changed: ${data.reason}`,
      },
    });

    // Log the room change
    await this.logSessionAction({
      examEntryId: verification.examEntryId,
      action: ExamSessionAction.ROOM_CHANGE,
      performedBy: data.changedBy,
      studentId: verification.studentId,
      roomId: data.newRoomId,
      details: {
        action: ExamSessionAction.ROOM_CHANGE,
        description: "Student room change",
        metadata: {
          oldRoomId: null, // Room info available via examEntry.rooms junction table
          newRoomId: data.newRoomId,
          reason: data.reason,
        },
      },
      notes: `Student ${verification.student.firstName} ${verification.student.lastName} moved to room ${room.name}: ${data.reason}`,
    });

    return {
      success: true,
      message: "Student room changed successfully",
      data: updated,
    };
  },

  // ========================================
  // INCIDENT MANAGEMENT
  // ========================================

  /**
   * Report an exam incident
   */
  async reportExamIncident(data: ReportExamIncidentData) {
    // Create incident
    const incident = await prisma.$transaction(async (tx) => {
      const newIncident = await tx.examIncident.create({
        data: {
          examEntryId: data.examEntryId,
          type: data.type,
          severity: data.severity,
          title: data.title,
          description: data.description,
          location: data.location,
          reportedBy: data.reportedBy,
          attachments: data.attachments ? JSON.stringify(data.attachments) : null,
        },
        include: {
          examEntry: {
            include: {
              course: true,
              venue: true,
              timetable: {
                select: {
                  institutionId: true
                }
              }
            },
          },
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Create junction table entries for affected students
      if (data.affectedStudents && data.affectedStudents.length > 0) {
        await tx.examIncidentStudent.createMany({
          data: data.affectedStudents.map(studentId => ({
            incidentId: newIncident.id,
            studentId: parseInt(studentId.toString())
          })),
          skipDuplicates: true
        });
      }

      // Create junction table entries for affected invigilators
      if (data.affectedInvigilators && data.affectedInvigilators.length > 0) {
        await tx.examIncidentInvigilator.createMany({
          data: data.affectedInvigilators.map(invigilatorId => ({
            incidentId: newIncident.id,
            invigilatorId: parseInt(invigilatorId.toString())
          })),
          skipDuplicates: true
        });
      }

      // Create junction table entries for witnesses
      if (data.witnesses && data.witnesses.length > 0) {
        await tx.examIncidentWitness.createMany({
          data: data.witnesses.map(witnessId => ({
            incidentId: newIncident.id,
            witnessId: parseInt(witnessId.toString())
          })),
          skipDuplicates: true
        });
      }

      // Update ExamLogistics incident flags
      await updateIncidentFlags(data.examEntryId, true, tx);

      return newIncident;
    });

    // Log the incident report
    await this.logSessionAction({
      examEntryId: data.examEntryId,
      action: ExamSessionAction.INCIDENT_REPORTED,
      performedBy: data.reportedBy,
      details: {
        action: ExamSessionAction.INCIDENT_REPORTED,
        description: "Incident reported",
        metadata: {
          incidentId: incident.id,
          type: data.type,
          severity: data.severity,
        },
      },
      notes: `Incident reported: ${data.title}`,
    });

    // Broadcast real-time event
    examLogisticsRealtimeService.broadcastIncidentReported({
      examEntryId: data.examEntryId,
      institutionId: incident.examEntry.timetable.institutionId,
      venueId: incident.examEntry.venueId,
      incidentId: incident.id,
      type: data.type,
      severity: data.severity,
      title: data.title,
      reporterName: `${incident.reporter.firstName} ${incident.reporter.lastName}`
    });

    return {
      success: true,
      message: "Incident reported successfully",
      data: incident,
    };
  },

  /**
   * Resolve an exam incident
   */
  async resolveExamIncident(incidentId: number, resolution: string, resolvedBy: number) {
    const incident = await prisma.examIncident.findUnique({
      where: { id: incidentId },
      include: {
        examEntry: {
          include: {
            timetable: {
              select: {
                institutionId: true
              }
            },
            venue: true
          }
        },
        resolver: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!incident) {
      throw new Error("Incident not found");
    }

    const updated = await prisma.examIncident.update({
      where: { id: incidentId },
      data: {
        status: IncidentStatus.RESOLVED,
        resolution,
        resolvedBy,
        resolvedAt: new Date(),
      },
    });

    // Check if there are still unresolved incidents
    const unresolvedCount = await prisma.examIncident.count({
      where: {
        examEntryId: incident.examEntryId,
        status: {
          not: IncidentStatus.RESOLVED
        }
      }
    });

    // Update ExamLogistics incident flags
    await updateIncidentFlags(incident.examEntryId, unresolvedCount > 0);

    // Log the resolution
    await this.logSessionAction({
      examEntryId: incident.examEntryId,
      action: ExamSessionAction.INCIDENT_RESOLVED,
      performedBy: resolvedBy,
      details: {
        action: ExamSessionAction.INCIDENT_RESOLVED,
        description: "Incident resolved",
        metadata: {
          incidentId,
          resolution,
        },
      },
      notes: `Incident resolved: ${resolution}`,
    });

    // Broadcast real-time event
    if (incident.resolver) {
      examLogisticsRealtimeService.broadcastIncidentResolved({
        examEntryId: incident.examEntryId,
        institutionId: incident.examEntry.timetable.institutionId,
        venueId: incident.examEntry.venueId,
        incidentId,
        resolverName: `${incident.resolver.firstName} ${incident.resolver.lastName}`,
        resolution
      });
    }

    return {
      success: true,
      message: "Incident resolved successfully",
      data: updated,
    };
  },

  // ========================================
  // SESSION LOGGING
  // ========================================

  /**
   * Log an exam session action
   */
  async logSessionAction({
    examEntryId,
    action,
    performedBy,
    details,
    venueId,
    roomId,
    studentId,
    invigilatorId,
    notes,
  }: {
    examEntryId: number;
    action: ExamSessionAction;
    performedBy: number;
    details: ExamSessionActionDetails;
    venueId?: number;
    roomId?: number;
    studentId?: number;
    invigilatorId?: number;
    notes?: string;
  }) {
    return await prisma.examSessionLog.create({
      data: {
        examEntryId,
        action,
        performedBy,
        details: JSON.stringify(details),
        venueId,
        roomId,
        studentId,
        invigilatorId,
        notes,
      },
    });
  },

  // ========================================
  // DASHBOARD & MONITORING
  // ========================================

  /**
   * Get institution logistics dashboard (Optimized with ExamLogistics)
   */
  async getInstitutionLogisticsDashboard(
    institutionId: number,
    options: { date?: Date; timetableId?: number } = {}
  ) {
    const { date, timetableId } = options;
    const devMode = process.env.DEV_IGNORE_EXAM_DATES === 'true';

    // Get all venues for the institution
    const venues = await prisma.venue.findMany({
      where: { institutionId },
      include: {
        rooms: true,
      },
    });

    // Build query filters based on mode
    const examEntryFilters: any = {
      timetable: {
        institutionId,
        isPublished: true,
      },
    };

    // If timetableId is provided, filter by timetable instead of date
    if (timetableId) {
      examEntryFilters.timetableId = timetableId;
    }
    // If not in dev mode and no timetableId, use date filtering
    else if (!devMode && date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      examEntryFilters.examDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }
    // In dev mode with no timetableId, get all published entries (ignore dates)

    // Get exam entries with their logistics (OPTIMIZED: single query with pre-calculated metrics)
    const examEntries = await prisma.examTimetableEntry.findMany({
      where: examEntryFilters,
      include: {
        venue: true,
        course: true,
        examLogistics: true, // Pre-calculated metrics
        rooms: { include: { room: true } },
      },
    });

    // Calculate institution-wide statistics from logistics aggregates
    const totalVenues = venues.length;
    const activeVenues = new Set(examEntries.map(e => e.venueId)).size;

    const totalExpectedStudents = examEntries.reduce((sum, entry) =>
      sum + (entry.examLogistics?.totalExpected || 0), 0);
    const totalPresentStudents = examEntries.reduce((sum, entry) =>
      sum + (entry.examLogistics?.totalPresent || 0), 0);
    const totalScriptsSubmitted = examEntries.reduce((sum, entry) =>
      sum + (entry.examLogistics?.scriptsSubmitted || 0), 0);

    const totalAssignedInvigilators = examEntries.reduce((sum, entry) =>
      sum + (entry.examLogistics?.invigilatorsAssigned || 0), 0);
    const totalInvigilatorsPresent = examEntries.reduce((sum, entry) =>
      sum + (entry.examLogistics?.invigilatorsPresent || 0), 0);

    const totalIncidents = examEntries.filter(e =>
      e.examLogistics?.hasIncidents).length;
    const unresolvedIncidents = examEntries.filter(e =>
      e.examLogistics?.hasUnresolvedIncidents).length;

    // Build venue overviews using logistics data
    const venueOverviews = venues.map(venue => {
      const venueEntries = examEntries.filter(e => e.venueId === venue.id);

      return {
        venueId: venue.id,
        venueName: venue.name,
        date: date || new Date(), // Use provided date or current date
        activeSessions: venueEntries.map(entry => {
          const logistics = entry.examLogistics;
          return {
            examEntryId: entry.id,
            courseCode: entry.course.code,
            courseName: entry.course.name,
            startTime: entry.startTime,
            endTime: entry.endTime,
            status: logistics?.sessionStatus || 'NOT_STARTED',
            expectedStudents: logistics?.totalExpected || 0,
            verifiedStudents: logistics?.totalPresent || 0,
            scriptsSubmitted: logistics?.scriptsSubmitted || 0,
            assignedInvigilators: logistics?.invigilatorsAssigned || 0,
            presentInvigilators: logistics?.invigilatorsPresent || 0,
            hasIncidents: logistics?.hasUnresolvedIncidents || false,
          };
        }),
        totalStudentsExpected: venueEntries.reduce((sum, e) =>
          sum + (e.examLogistics?.totalExpected || 0), 0),
        totalStudentsVerified: venueEntries.reduce((sum, e) =>
          sum + (e.examLogistics?.totalPresent || 0), 0),
        totalScriptsSubmitted: venueEntries.reduce((sum, e) =>
          sum + (e.examLogistics?.scriptsSubmitted || 0), 0),
        totalInvigilatorsAssigned: venueEntries.reduce((sum, e) =>
          sum + (e.examLogistics?.invigilatorsAssigned || 0), 0),
        totalInvigilatorsPresent: venueEntries.reduce((sum, e) =>
          sum + (e.examLogistics?.invigilatorsPresent || 0), 0),
        unresolvedIssues: venueEntries.filter(e =>
          e.examLogistics?.hasUnresolvedIncidents).length,
        rooms: venue.rooms.map(room => {
          const entryForRoom = venueEntries.find(e =>
            e.rooms?.some((r: any) => r.roomId === room.id)
          );
          const logistics = entryForRoom?.examLogistics;
          return {
            roomId: room.id,
            roomName: room.name,
            capacity: room.capacity,
            examEntryId: entryForRoom?.id,
            courseCode: entryForRoom?.course.code,
            verifiedStudents: logistics?.totalPresent || 0,
          };
        }),
      };
    });

    return {
      institutionId,
      date,
      totalVenues,
      activeVenues,
      totalExamSessions: examEntries.length,
      activeExamSessions: examEntries.filter(e =>
        e.examLogistics?.sessionStatus === 'IN_PROGRESS').length,
      totalExpectedStudents,
      totalPresentStudents,
      totalScriptsSubmitted,
      attendanceRate: totalExpectedStudents > 0 ? (totalPresentStudents / totalExpectedStudents) * 100 : 0,
      submissionRate: totalPresentStudents > 0 ? (totalScriptsSubmitted / totalPresentStudents) * 100 : 0,
      totalAssignedInvigilators,
      totalInvigilatorsPresent,
      invigilatorAttendanceRate: totalAssignedInvigilators > 0 ? (totalInvigilatorsPresent / totalAssignedInvigilators) * 100 : 0,
      totalIncidents,
      unresolvedIncidents,
      venues: venueOverviews,
    };
  },

  /**
   * Get exams officer dashboard (filtered by assigned venues)
   */
  async getExamsOfficerDashboard(officerId: number, options: { date?: Date; timetableId?: number } = {}) {
    const officer = await prisma.user.findUnique({
      where: { id: officerId },
      select: { institutionId: true },
    });

    if (!officer?.institutionId) {
      throw new Error("Officer institution not found");
    }

    // Get the full institution dashboard first
    const dashboard = await this.getInstitutionLogisticsDashboard(officer.institutionId, options);

    // If a timetableId is provided, filter dashboard to only show assigned venues
    if (options.timetableId) {
      // Get officer's assigned venues for this timetable
      const assignments = await prisma.venueOfficerAssignment.findMany({
        where: {
          timetableId: options.timetableId,
          officerId,
        },
        select: {
          venueId: true,
        },
      });

      const assignedVenueIds = assignments.map(a => a.venueId);

      // Filter venues to only show assigned ones
      dashboard.venues = dashboard.venues.filter(v => assignedVenueIds.includes(v.venueId));

      // Recalculate statistics based on filtered venues
      dashboard.activeVenues = dashboard.venues.length;
      dashboard.totalExamSessions = dashboard.venues.reduce((sum, v) => sum + v.activeSessions.length, 0);
      dashboard.activeExamSessions = dashboard.venues.reduce((sum, v) =>
        sum + v.activeSessions.filter(s => s.status === 'IN_PROGRESS').length, 0);
      dashboard.totalExpectedStudents = dashboard.venues.reduce((sum, v) => sum + v.totalStudentsExpected, 0);
      dashboard.totalPresentStudents = dashboard.venues.reduce((sum, v) => sum + v.totalStudentsVerified, 0);
      dashboard.totalScriptsSubmitted = dashboard.venues.reduce((sum, v) => sum + v.totalScriptsSubmitted, 0);
      dashboard.attendanceRate = dashboard.totalExpectedStudents > 0
        ? (dashboard.totalPresentStudents / dashboard.totalExpectedStudents) * 100 : 0;
      dashboard.submissionRate = dashboard.totalPresentStudents > 0
        ? (dashboard.totalScriptsSubmitted / dashboard.totalPresentStudents) * 100 : 0;
      dashboard.totalAssignedInvigilators = dashboard.venues.reduce((sum, v) => sum + v.totalInvigilatorsAssigned, 0);
      dashboard.totalInvigilatorsPresent = dashboard.venues.reduce((sum, v) => sum + v.totalInvigilatorsPresent, 0);
      dashboard.invigilatorAttendanceRate = dashboard.totalAssignedInvigilators > 0
        ? (dashboard.totalInvigilatorsPresent / dashboard.totalAssignedInvigilators) * 100 : 0;
      dashboard.unresolvedIncidents = dashboard.venues.reduce((sum, v) => sum + v.unresolvedIssues, 0);
    }

    // Get officer's specific data
    const { date } = options;
    const devMode = process.env.DEV_IGNORE_EXAM_DATES === 'true';

    // Build date filter if applicable
    let dateFilter = {};
    if (!devMode && date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter = {
        performedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };
    }

    const todaysSessions = dashboard.venues.flatMap(v => v.activeSessions);

    const recentLogs = await prisma.examSessionLog.findMany({
      where: {
        ...dateFilter,
        examEntry: {
          timetable: {
            institutionId: officer.institutionId,
          },
        },
      },
      include: {
        performer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        examEntry: {
          include: {
            course: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        performedAt: 'desc',
      },
      take: 20,
    });

    const pendingIncidents = await prisma.examIncident.findMany({
      where: {
        examEntry: {
          timetable: {
            institutionId: officer.institutionId,
          },
        },
        status: {
          in: [IncidentStatus.REPORTED, IncidentStatus.UNDER_INVESTIGATION],
        },
      },
      include: {
        examEntry: {
          include: {
            course: true,
            venue: true,
          },
        },
      },
      orderBy: {
        reportedAt: 'desc',
      },
    });

    return {
      officerId,
      assignedVenues: dashboard.venues.map(v => v.venueId),
      date,
      venueOverviews: dashboard.venues,
      todaysSessions,
      pendingIncidents,
      unverifiedStudents: dashboard.totalExpectedStudents - dashboard.totalPresentStudents,
      absentInvigilators: dashboard.totalAssignedInvigilators - dashboard.totalInvigilatorsPresent,
      recentLogs,
    };
  },

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  // ========================================
  // VENUE OFFICER ASSIGNMENT MANAGEMENT
  // ========================================

  /**
   * Assign an officer to a venue within a specific timetable
   */
  async assignOfficerToVenue(
    timetableId: number,
    venueId: number,
    officerId: number,
    assignedBy: number
  ) {
    // Validate timetable exists and is published
    const timetable = await prisma.examTimetable.findUnique({
      where: { id: timetableId },
      include: { institution: true },
    });

    if (!timetable) {
      throw new Error("Timetable not found");
    }

    if (!timetable.isPublished) {
      throw new Error("Cannot assign officers to unpublished timetables");
    }

    // Validate venue exists and belongs to the same institution
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
    });

    if (!venue) {
      throw new Error("Venue not found");
    }

    if (venue.institutionId !== timetable.institutionId) {
      throw new Error("Venue does not belong to the timetable's institution");
    }

    // Validate officer exists and belongs to the same institution
    const officer = await prisma.user.findUnique({
      where: { id: officerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        institutionId: true,
        role: true,
      },
    });

    if (!officer) {
      throw new Error("Officer not found");
    }

    if (officer.institutionId !== timetable.institutionId) {
      throw new Error("Officer does not belong to the timetable's institution");
    }

    if (officer.role !== "EXAMS_OFFICER" && officer.role !== "ADMIN") {
      throw new Error("User must be an exams officer or institution admin");
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.venueOfficerAssignment.findUnique({
      where: {
        timetableId_venueId_officerId: {
          timetableId,
          venueId,
          officerId,
        },
      },
    });

    if (existingAssignment) {
      throw new Error("Officer is already assigned to this venue for this timetable");
    }

    // Create assignment
    const assignment = await prisma.venueOfficerAssignment.create({
      data: {
        timetableId,
        venueId,
        officerId,
        assignedBy,
      },
      include: {
        officer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        venue: {
          select: {
            id: true,
            name: true,
          },
        },
        timetable: {
          select: {
            id: true,
            title: true,
          },
        },
        assigner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Officer assigned to venue successfully",
      data: assignment,
    };
  },

  /**
   * Remove an officer assignment from a venue
   */
  async removeOfficerAssignment(assignmentId: number, removedBy: number) {
    const assignment = await prisma.venueOfficerAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        officer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        venue: {
          select: {
            name: true,
          },
        },
        timetable: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    await prisma.venueOfficerAssignment.delete({
      where: { id: assignmentId },
    });

    return {
      success: true,
      message: `Officer ${assignment.officer.firstName} ${assignment.officer.lastName} removed from ${assignment.venue.name}`,
      data: assignment,
    };
  },

  /**
   * Get all officers assigned to a venue within a timetable
   */
  async getVenueOfficers(timetableId: number, venueId: number) {
    const assignments = await prisma.venueOfficerAssignment.findMany({
      where: {
        timetableId,
        venueId,
      },
      include: {
        officer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assigner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });

    return {
      success: true,
      data: assignments,
    };
  },

  /**
   * Get all venues assigned to an officer within a timetable
   */
  async getOfficerVenues(timetableId: number, officerId: number) {
    const assignments = await prisma.venueOfficerAssignment.findMany({
      where: {
        timetableId,
        officerId,
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            capacity: true,
          },
        },
        assigner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });

    return {
      success: true,
      data: assignments,
    };
  },

  /**
   * Get all venue officer assignments for a timetable
   */
  async getTimetableVenueAssignments(timetableId: number) {
    const assignments = await prisma.venueOfficerAssignment.findMany({
      where: {
        timetableId,
      },
      include: {
        officer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        venue: {
          select: {
            id: true,
            name: true,
          },
        },
        assigner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { venueId: 'asc' },
        { assignedAt: 'desc' },
      ],
    });

    return {
      success: true,
      data: assignments,
    };
  },

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  /**
   * Determine if an exam is currently active
   */
  isExamActive(entry: ExamTimetableEntry): boolean {
    const now = new Date();
    const startTime = new Date(entry.startTime);
    const endTime = new Date(entry.endTime);

    return now >= startTime && now <= endTime;
  },

  /**
   * Get exam session status
   */
  getExamSessionStatus(entry: ExamTimetableEntry): string {
    const now = new Date();
    const startTime = new Date(entry.startTime);
    const endTime = new Date(entry.endTime);

    if (now < startTime) return 'NOT_STARTED';
    if (now >= startTime && now <= endTime) return 'IN_PROGRESS';
    return 'COMPLETED';
  },
};
