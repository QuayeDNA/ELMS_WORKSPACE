import { BaseService } from './base.service';
import { ApiResponse, PaginatedResponse } from '@/types/shared/api';
import { apiService } from './api';

// ========================================
// TYPES
// ========================================

export interface Incident {
  id: number;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  examId?: number;
  scriptId?: number;
  reportedById: number;
  assignedToId?: number;
  resolution?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  reportedBy?: {
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
  };
}

export enum IncidentType {
  MISSING_SCRIPT = 'MISSING_SCRIPT',
  DAMAGED_SCRIPT = 'DAMAGED_SCRIPT',
  MALPRACTICE = 'MALPRACTICE',
  VENUE_ISSUE = 'VENUE_ISSUE',
  EQUIPMENT_FAILURE = 'EQUIPMENT_FAILURE',
  STUDENT_ABSENCE = 'STUDENT_ABSENCE',
  INVIGILATOR_ISSUE = 'INVIGILATOR_ISSUE',
  OTHER = 'OTHER',
}

export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum IncidentStatus {
  REPORTED = 'REPORTED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export interface IncidentQuery {
  type?: IncidentType;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  examId?: number;
  reportedById?: number;
  assignedToId?: number;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateIncidentData {
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  examId?: number;
  scriptId?: number;
}

export interface UpdateIncidentData {
  type?: IncidentType;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  title?: string;
  description?: string;
  assignedToId?: number;
  resolution?: string;
}

export interface AssignIncidentData {
  assignedToId: number;
  notes?: string;
}

export interface ResolveIncidentData {
  resolution: string;
}

// ========================================
// INCIDENT SERVICE
// ========================================

class IncidentService extends BaseService {
  constructor() {
    super('/api/incidents');
  }

  /**
   * Get all incidents with filtering and pagination
   */
  async getIncidents(query: IncidentQuery = {}): Promise<PaginatedResponse<Incident>> {
    return this.getPaginated<Incident>(query as Record<string, unknown>);
  }

  /**
   * Get incident by ID
   */
  async getIncidentById(id: number): Promise<ApiResponse<Incident>> {
    return this.getById<Incident>(id);
  }

  /**
   * Create a new incident
   */
  async createIncident(data: CreateIncidentData): Promise<ApiResponse<Incident>> {
    return this.create<Incident>(data);
  }

  /**
   * Update an incident
   */
  async updateIncident(id: number, data: UpdateIncidentData): Promise<ApiResponse<Incident>> {
    return this.update<Incident>(id, data);
  }

  /**
   * Delete an incident
   */
  async deleteIncident(id: number): Promise<ApiResponse<void>> {
    return this.delete(id);
  }

  /**
   * Assign incident to a user
   */
  async assignIncident(id: number, data: AssignIncidentData): Promise<ApiResponse<Incident>> {
    try {
      return await apiService.post<Incident>(`${this.endpoint}/${id}/assign`, data);
    } catch (error) {
      console.error('Error assigning incident:', error);
      throw error;
    }
  }

  /**
   * Resolve an incident
   */
  async resolveIncident(id: number, data: ResolveIncidentData): Promise<ApiResponse<Incident>> {
    try {
      return await apiService.post<Incident>(`${this.endpoint}/${id}/resolve`, data);
    } catch (error) {
      console.error('Error resolving incident:', error);
      throw error;
    }
  }

  /**
   * Close an incident
   */
  async closeIncident(id: number): Promise<ApiResponse<Incident>> {
    try {
      return await apiService.post<Incident>(`${this.endpoint}/${id}/close`, {});
    } catch (error) {
      console.error('Error closing incident:', error);
      throw error;
    }
  }

  /**
   * Get incidents by exam
   */
  async getIncidentsByExam(examId: number): Promise<ApiResponse<Incident[]>> {
    try {
      return await apiService.get<Incident[]>(`${this.endpoint}/exam/${examId}`);
    } catch (error) {
      console.error('Error fetching incidents by exam:', error);
      throw error;
    }
  }

  /**
   * Get incidents assigned to current user
   */
  async getMyIncidents(): Promise<ApiResponse<Incident[]>> {
    try {
      return await apiService.get<Incident[]>(`${this.endpoint}/my-incidents`);
    } catch (error) {
      console.error('Error fetching my incidents:', error);
      throw error;
    }
  }

  /**
   * Get incident statistics
   */
  async getIncidentStatistics(): Promise<ApiResponse<{
    total: number;
    byStatus: Record<IncidentStatus, number>;
    bySeverity: Record<IncidentSeverity, number>;
    byType: Record<IncidentType, number>;
  }>> {
    try {
      return await apiService.get(`${this.endpoint}/statistics`);
    } catch (error) {
      console.error('Error fetching incident statistics:', error);
      throw error;
    }
  }
}

export const incidentService = new IncidentService();
