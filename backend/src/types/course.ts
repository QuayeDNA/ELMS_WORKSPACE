import { CourseType as PrismaCourseType } from '@prisma/client';
import { DepartmentalQuery, ActiveQuery } from './shared/query';

export { PrismaCourseType as CourseType };

export interface Course {
  id: number;
  name: string;
  code: string;
  departmentId: number;
  level: number;
  courseType: PrismaCourseType;
  creditHours: number;
  contactHours?: number | null;
  description?: string | null;
  learningOutcomes?: string | null;
  syllabus?: string | null;
  assessmentMethods?: string | null;
  prerequisites?: string | null;
  corequisites?: string | null;
  recommendedBooks?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  department?: {
    id: number;
    name: string;
    code: string;
    faculty?: {
      id: number;
      name: string;
      institution?: {
        id: number;
        name: string;
      };
    };
  };

  // Enrollment count (computed)
  enrollmentCount?: number;
  prerequisiteCount?: number;
  corequisiteCount?: number;
}

export interface CreateCourseData {
  name: string;
  code: string;
  departmentId: number;
  level: number;
  courseType: PrismaCourseType;
  creditHours?: number;
  contactHours?: number;
  description?: string;
  learningOutcomes?: string;
  syllabus?: string;
  assessmentMethods?: string;
  prerequisites?: string;
  corequisites?: string;
  recommendedBooks?: string;
  isActive?: boolean;
}

export interface UpdateCourseData {
  name?: string;
  code?: string;
  level?: number;
  courseType?: PrismaCourseType;
  creditHours?: number;
  contactHours?: number;
  description?: string;
  learningOutcomes?: string;
  syllabus?: string;
  assessmentMethods?: string;
  prerequisites?: string;
  corequisites?: string;
  recommendedBooks?: string;
  isActive?: boolean;
}

export interface CourseQuery extends DepartmentalQuery, ActiveQuery {
  level?: number;
  courseType?: PrismaCourseType;
  sortBy?: 'name' | 'code' | 'level' | 'createdAt';
}

export interface CourseByProgramQuery {
  page?: number;
  limit?: number;
  search?: string;
  level?: number;
  isActive?: boolean;
}

export interface CourseStats {
  courseId: number;
  enrollmentCount: number;
  prerequisiteCount: number;
  corequisiteCount: number;
  totalStudents: number;
}
