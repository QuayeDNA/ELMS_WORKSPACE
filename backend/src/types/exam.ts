import { ExamStatus as PrismaExamStatus } from "@prisma/client";

export { PrismaExamStatus as ExamStatus };

export interface Exam {
  id: number;
  title: string;
  courseId: number;
  facultyId: number;
  examDate: Date;
  startTime: Date;
  endTime: Date;
  duration: number;
  venueId?: number | null;
  roomId?: number | null;
  status: PrismaExamStatus;
  instructions?: string | null;
  specialRequirements?: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;

  // Relations
  course?: {
    id: number;
    name: string;
    code: string;
    department?: {
      id: number;
      name: string;
      faculty?: {
        id: number;
        name: string;
        institution?: {
          id: number;
          name: string;
        };
      };
    };
  };

  faculty?: {
    id: number;
    name: string;
    institution?: {
      id: number;
      name: string;
    };
  };

  venue?: {
    id: number;
    name: string;
    location: string;
    capacity: number;
  };

  room?: {
    id: number;
    name: string;
    capacity: number;
  };

  // Computed fields
  scriptCount?: number;
  incidentCount?: number;
  studentCount?: number;
}

export interface CreateExamData {
  title: string;
  courseId: number;
  facultyId: number;
  examDate: Date;
  startTime: Date;
  endTime: Date;
  duration: number;
  venueId?: number;
  roomId?: number;
  instructions?: string;
  specialRequirements?: string;
}

export interface UpdateExamData {
  title?: string;
  courseId?: number;
  facultyId?: number;
  examDate?: Date;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  venueId?: number;
  roomId?: number;
  status?: PrismaExamStatus;
  instructions?: string;
  specialRequirements?: string;
}

export interface ExamQuery {
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
  courseId?: number;
  venueId?: number;
  status?: PrismaExamStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'title' | 'examDate' | 'startTime' | 'duration' | 'status' | 'createdAt';
  sortOrder?: "asc" | "desc";
}

export interface ExamWithStats extends Exam {
  scriptCount: number;
  incidentCount: number;
  studentCount: number;
}
