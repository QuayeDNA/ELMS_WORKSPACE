import { BaseService } from './base.service';
import { ApiResponse, PaginatedResponse } from '@/types/shared/api';
import { apiService } from './api';

// ========================================
// TYPES
// ========================================

export interface Exam {
  id: number;
  title: string;
  description?: string;
  courseId: number;
  examType: ExamType;
  totalMarks: number;
  passingMarks: number;
  duration: number;
  instructions?: string;
  allowedMaterials?: string;
  status: ExamStatus;
  createdBy: number;
  createdAt: string;
  updatedAt: string;

  // Relations
  course?: {
    id: number;
    code: string;
    name: string;
  };
}

export enum ExamType {
  MID_SEMESTER = 'MID_SEMESTER',
  END_SEMESTER = 'END_SEMESTER',
  QUIZ = 'QUIZ',
  PRACTICAL = 'PRACTICAL',
  PROJECT = 'PROJECT',
  VIVA = 'VIVA',
  ASSIGNMENT = 'ASSIGNMENT',
}

export enum ExamStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface ExamQuery {
  courseId?: number;
  examType?: ExamType;
  status?: ExamStatus;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateExamData {
  title: string;
  description?: string;
  courseId: number;
  examType: ExamType;
  totalMarks: number;
  passingMarks: number;
  duration: number;
  instructions?: string;
  allowedMaterials?: string;
}

export interface UpdateExamData {
  title?: string;
  description?: string;
  totalMarks?: number;
  passingMarks?: number;
  duration?: number;
  instructions?: string;
  allowedMaterials?: string;
  status?: ExamStatus;
}

// ========================================
// EXAM SERVICE
// ========================================

class ExamService extends BaseService {
  constructor() {
    super('/api/exams');
  }

  /**
   * Get all exams with filtering and pagination
   */
  async getExams(query: ExamQuery = {}): Promise<PaginatedResponse<Exam>> {
    return this.getPaginated<Exam>(query as Record<string, unknown>);
  }

  /**
   * Get exam by ID
   */
  async getExamById(id: number): Promise<ApiResponse<Exam>> {
    return this.getById<Exam>(id);
  }

  /**
   * Create a new exam
   */
  async createExam(data: CreateExamData): Promise<ApiResponse<Exam>> {
    return this.create<Exam>(data);
  }

  /**
   * Update an exam
   */
  async updateExam(id: number, data: UpdateExamData): Promise<ApiResponse<Exam>> {
    return this.update<Exam>(id, data);
  }

  /**
   * Delete an exam
   */
  async deleteExam(id: number): Promise<ApiResponse<void>> {
    return this.delete(id);
  }

  /**
   * Get exams by course
   */
  async getExamsByCourse(courseId: number): Promise<ApiResponse<Exam[]>> {
    try {
      return await apiService.get<Exam[]>(`${this.endpoint}/course/${courseId}`);
    } catch (error) {
      console.error('Error fetching exams by course:', error);
      throw error;
    }
  }
}

export const examService = new ExamService();
