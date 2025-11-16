import { PrismaClient, IncidentStatus, IncidentSeverity } from "@prisma/client";
import {
  Incident,
  CreateIncidentData,
  UpdateIncidentData,
  IncidentQuery,
  IncidentWithDetails,
} from "../types/incident";

const prisma = new PrismaClient();

export const incidentService = {
  // Get all incidents with pagination and filtering
  async getIncidents(query: IncidentQuery) {
    const {
      institutionId,
      examId,
      scriptId,
      reportedById,
      assignedToId,
      type,
      severity,
      status,
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

    if (institutionId) {
      where.exam = {
        ...where.exam,
        course: {
          department: {
            faculty: {
              institutionId: institutionId,
            },
          },
        },
      };
    }

    if (examId) {
      where.examId = examId;
    }

    if (scriptId) {
      where.scriptId = scriptId;
    }

    if (reportedById) {
      where.reportedById = reportedById;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (type) {
      where.type = type;
    }

    if (severity) {
      where.severity = severity;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        {
          reportedBy: { firstName: { contains: search, mode: "insensitive" } },
        },
        { reportedBy: { lastName: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Get total count
    const total = await prisma.incident.count({ where });

    // Get incidents with relations
    const incidents = await prisma.incident.findMany({
      where,
      include: {
        exam: {
          include: {
            course: true,
            venue: true,
          },
        },
        script: {
          select: {
            id: true,
            qrCode: true,
            studentId: true,
            status: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    // Transform data to include computed fields
    const transformedIncidents = incidents.map((incident) => {
      const daysOpen =
        incident.status !== IncidentStatus.RESOLVED &&
        incident.status !== IncidentStatus.CLOSED
          ? Math.floor(
              (Date.now() - incident.createdAt.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : undefined;

      const priority =
        incident.severity === IncidentSeverity.CRITICAL
          ? "critical"
          : incident.severity === IncidentSeverity.HIGH
            ? "high"
            : incident.severity === IncidentSeverity.MEDIUM
              ? "medium"
              : "low";

      return {
        ...incident,
        daysOpen,
        priority,
      };
    });

    return {
      incidents: transformedIncidents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Get single incident by ID
  async getIncidentById(id: number): Promise<IncidentWithDetails | null> {
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        exam: {
          include: {
            course: true,
            venue: true,
          },
        },
        script: {
          select: {
            id: true,
            qrCode: true,
            studentId: true,
            status: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!incident) {
      return null;
    }

    const daysOpen =
      incident.status !== IncidentStatus.RESOLVED &&
      incident.status !== IncidentStatus.CLOSED
        ? Math.floor(
            (Date.now() - incident.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          )
        : undefined;

    const priority =
      incident.severity === IncidentSeverity.CRITICAL
        ? "critical"
        : incident.severity === IncidentSeverity.HIGH
          ? "high"
          : incident.severity === IncidentSeverity.MEDIUM
            ? "medium"
            : "low";

    return {
      ...incident,
      daysOpen,
      priority,
    };
  },

  // Create new incident
  async createIncident(
    data: CreateIncidentData,
    reportedById: number
  ): Promise<Incident> {
    // Validate that exam exists if provided
    if (data.examId) {
      const exam = await prisma.exam.findUnique({
        where: { id: data.examId },
      });

      if (!exam) {
        throw new Error("Exam not found");
      }
    }

    // Validate that script exists if provided
    if (data.scriptId) {
      const script = await prisma.script.findUnique({
        where: { id: data.scriptId },
      });

      if (!script) {
        throw new Error("Script not found");
      }
    }

    // Set default severity if not provided
    const severity = data.severity || IncidentSeverity.MEDIUM;

    const incident = await prisma.incident.create({
      data: {
        ...data,
        severity,
        reportedById,
      },
      include: {
        exam: {
          include: {
            course: true,
            venue: true,
          },
        },
        script: {
          select: {
            id: true,
            qrCode: true,
            studentId: true,
            status: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return incident;
  },

  // Update incident
  async updateIncident(
    id: number,
    data: UpdateIncidentData
  ): Promise<Incident> {
    // Get existing incident
    const existingIncident = await prisma.incident.findUnique({
      where: { id },
    });

    if (!existingIncident) {
      throw new Error("Incident not found");
    }

    // Validate exam/script changes
    if (data.examId) {
      const exam = await prisma.exam.findUnique({
        where: { id: data.examId },
      });

      if (!exam) {
        throw new Error("Exam not found");
      }
    }

    if (data.scriptId) {
      const script = await prisma.script.findUnique({
        where: { id: data.scriptId },
      });

      if (!script) {
        throw new Error("Script not found");
      }
    }

    // Handle status changes
    let updateData: any = { ...data };

    if (
      data.status === IncidentStatus.RESOLVED ||
      data.status === IncidentStatus.CLOSED
    ) {
      updateData.resolvedAt = new Date();
    } else if (
      existingIncident.status === IncidentStatus.RESOLVED ||
      existingIncident.status === IncidentStatus.CLOSED
    ) {
      // If reopening a resolved/closed incident
      updateData.resolvedAt = null;
    }

    const incident = await prisma.incident.update({
      where: { id },
      data: updateData,
      include: {
        exam: {
          include: {
            course: true,
            venue: true,
          },
        },
        script: {
          select: {
            id: true,
            qrCode: true,
            studentId: true,
            status: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return incident;
  },

  // Assign incident to user
  async assignIncident(id: number, assignedToId: number): Promise<Incident> {
    // Validate that assigned user exists
    const user = await prisma.user.findUnique({
      where: { id: assignedToId },
    });

    if (!user) {
      throw new Error("Assigned user not found");
    }

    return this.updateIncident(id, {
      assignedToId,
      status: IncidentStatus.UNDER_INVESTIGATION,
    });
  },

  // Resolve incident
  async resolveIncident(id: number, resolution: string): Promise<Incident> {
    return this.updateIncident(id, {
      status: IncidentStatus.RESOLVED,
      resolution,
    });
  },

  // Get incidents by exam
  async getIncidentsByExam(
    examId: number,
    query: Omit<IncidentQuery, "examId"> = {}
  ) {
    return this.getIncidents({ ...query, examId });
  },

  // Get incidents by script
  async getIncidentsByScript(
    scriptId: number,
    query: Omit<IncidentQuery, "scriptId"> = {}
  ) {
    return this.getIncidents({ ...query, scriptId });
  },

  // Get incidents reported by user
  async getIncidentsByReporter(
    reportedById: number,
    query: Omit<IncidentQuery, "reportedById"> = {}
  ) {
    return this.getIncidents({ ...query, reportedById });
  },

  // Get incidents assigned to user
  async getIncidentsByAssignee(
    assignedToId: number,
    query: Omit<IncidentQuery, "assignedToId"> = {}
  ) {
    return this.getIncidents({ ...query, assignedToId });
  },

  // Delete incident
  async deleteIncident(id: number): Promise<void> {
    // Check if incident is resolved or closed
    const incident = await prisma.incident.findUnique({
      where: { id },
      select: {
        status: true,
      },
    });

    if (!incident) {
      throw new Error("Incident not found");
    }

    if (
      incident.status !== IncidentStatus.RESOLVED &&
      incident.status !== IncidentStatus.CLOSED
    ) {
      throw new Error("Cannot delete incident that is not resolved or closed");
    }

    await prisma.incident.delete({
      where: { id },
    });
  },

  // Get incident statistics
  async getIncidentStats() {
    const stats = await prisma.incident.groupBy({
      by: ["status", "severity", "type"],
      _count: {
        id: true,
      },
    });

    const totalIncidents = await prisma.incident.count();
    const openIncidents = await prisma.incident.count({
      where: {
        status: {
          in: [IncidentStatus.REPORTED, IncidentStatus.UNDER_INVESTIGATION],
        },
      },
    });

    const resolvedIncidents = await prisma.incident.count({
      where: {
        status: IncidentStatus.RESOLVED,
      },
    });

    return {
      total: totalIncidents,
      open: openIncidents,
      resolved: resolvedIncidents,
      closed: totalIncidents - openIncidents - resolvedIncidents,
      byStatus: stats.reduce(
        (acc, stat) => {
          if (!acc[stat.status]) acc[stat.status] = 0;
          acc[stat.status] += stat._count.id;
          return acc;
        },
        {} as Record<string, number>
      ),
      bySeverity: stats.reduce(
        (acc, stat) => {
          if (!acc[stat.severity]) acc[stat.severity] = 0;
          acc[stat.severity] += stat._count.id;
          return acc;
        },
        {} as Record<string, number>
      ),
      byType: stats.reduce(
        (acc, stat) => {
          if (!acc[stat.type]) acc[stat.type] = 0;
          acc[stat.type] += stat._count.id;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  },
};
