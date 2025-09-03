export enum CourseType {
  CORE = 'CORE',
  ELECTIVE = 'ELECTIVE',
  PRACTICAL = 'PRACTICAL',
  SEMINAR = 'SEMINAR'
}

export interface Course {
  id: number;
  name: string;
  code: string;
  description: string | null;
  creditHours: number;
  contactHours: number | null;
  level: number | null;
  courseType: CourseType;
  prerequisites: string | null;
  learningOutcomes: string | null;
  assessmentMethods: string | null;
  recommendedTexts: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    programCourses: number;
    students: number;
  };
}

export interface CreateCourseRequest {
  name: string;
  code: string;
  description?: string;
  creditHours: number;
  contactHours?: number;
  level?: number;
  courseType: CourseType;
  prerequisites?: string;
  learningOutcomes?: string;
  assessmentMethods?: string;
  recommendedTexts?: string;
}

export interface UpdateCourseRequest {
  name?: string;
  code?: string;
  description?: string;
  creditHours?: number;
  contactHours?: number;
  level?: number;
  courseType?: CourseType;
  prerequisites?: string;
  learningOutcomes?: string;
  assessmentMethods?: string;
  recommendedTexts?: string;
  isActive?: boolean;
}

export interface CourseQuery {
  courseType?: CourseType;
  level?: number;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CourseStats {
  totalCourses: number;
  activeCourses: number;
  inactiveCourses: number;
  coreCoursesCount: number;
  electiveCoursesCount: number;
  practicalCoursesCount: number;
  seminarCoursesCount: number;
  averageCreditHours: number;
  recentCourses: Course[];
}

export interface ProgramCourse {
  id: number;
  programId: number;
  courseId: number;
  semester: number | null;
  year: number | null;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
  program?: {
    id: number;
    name: string;
    code: string;
  };
  course?: Course;
}

export interface CreateProgramCourseRequest {
  programId: number;
  courseId: number;
  semester?: number;
  year?: number;
  isRequired: boolean;
}

export interface UpdateProgramCourseRequest {
  semester?: number;
  year?: number;
  isRequired?: boolean;
}
