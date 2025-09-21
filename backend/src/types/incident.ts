import {
  IncidentType as PrismaIncidentType,
  IncidentSeverity as PrismaIncidentSeverity,
  IncidentStatus as PrismaIncidentStatus,
} from "@prisma/client";

export { PrismaIncidentType as IncidentType };
export { PrismaIncidentSeverity as IncidentSeverity };
export { PrismaIncidentStatus as IncidentStatus };

export interface Incident {
  id: number;
  type: PrismaIncidentType;
  severity: PrismaIncidentSeverity;
  status: PrismaIncidentStatus;
  title: string;
  description: string;
  examId?: number | null;
  scriptId?: number | null;
  reportedById: number;
  assignedToId?: number | null;
  resolution?: string | null;
  resolvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  exam?: {
    id: number;
    title: string;
    course?: {
      id: number;
      name: string;
      code: string;
    } | null;
    venue?: {
      id: number;
      name: string;
      location: string;
    } | null;
  } | null;

  script?: {
    id: number;
    qrCode: string;
    studentId: string;
    status: string;
  } | null;

  reportedBy: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };

  assignedTo?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface CreateIncidentData {
  type: PrismaIncidentType;
  severity?: PrismaIncidentSeverity;
  title: string;
  description: string;
  examId?: number;
  scriptId?: number;
}

export interface UpdateIncidentData {
  type?: PrismaIncidentType;
  severity?: PrismaIncidentSeverity;
  status?: PrismaIncidentStatus;
  title?: string;
  description?: string;
  examId?: number;
  scriptId?: number;
  assignedToId?: number;
  resolution?: string;
}

export interface IncidentQuery {
  examId?: number;
  scriptId?: number;
  reportedById?: number;
  assignedToId?: number;
  type?: PrismaIncidentType;
  severity?: PrismaIncidentSeverity;
  status?: PrismaIncidentStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IncidentWithDetails extends Incident {
  // Additional computed fields can be added here
  daysOpen?: number;
  priority?: "low" | "medium" | "high" | "critical";
}
