export interface Course {
  id: number;
  name: string;
  code: string;
  description: string | null;
  creditHours: number;
  contactHours: number | null;
  level: number; // 100, 200, 300, 400
  courseType: 'CORE' | 'ELECTIVE' | 'GENERAL';
  prerequisites: string | null; // JSON array of course codes
  corequisites: string | null; // JSON array of course codes
  learningOutcomes: string | null;
  syllabus: string | null;
  assessmentMethods: string | null;
  recommendedBooks: string | null;
  departmentId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  department?: {
    id: number;
    name: string;
    facultyId: number;
    faculty?: {
      id: number;
      name: string;
      institutionId: number;
    };
  };
  _count?: {
    exams: number;
    programCourses: number;
    courseOfferings: number;
  };
}

export interface CreateCourseRequest {
  name: string;
  code: string;
  description?: string;
  creditHours: number;
  contactHours?: number;
  level: number;
  courseType: 'CORE' | 'ELECTIVE' | 'GENERAL';
  prerequisites?: string[];
  corequisites?: string[];
  learningOutcomes?: string;
  syllabus?: string;
  assessmentMethods?: string;
  recommendedBooks?: string;
  departmentId: number;
}

export interface UpdateCourseRequest {
  name?: string;
  code?: string;
  description?: string;
  creditHours?: number;
  contactHours?: number;
  level?: number;
  courseType?: 'CORE' | 'ELECTIVE' | 'GENERAL';
  prerequisites?: string[];
  corequisites?: string[];
  learningOutcomes?: string;
  syllabus?: string;
  assessmentMethods?: string;
  recommendedBooks?: string;
  isActive?: boolean;
}

export interface CourseQuery {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: number;
  facultyId?: number;
  institutionId?: number;
  level?: number;
  courseType?: 'CORE' | 'ELECTIVE' | 'GENERAL';
  isActive?: boolean;
  sortBy?: 'name' | 'code' | 'level' | 'courseType' | 'creditHours' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CourseStats {
  totalCourses: number;
  byLevel: Record<string, number>;
  byType: Record<string, number>;
  byDepartment: Record<string, number>;
  averageCreditHours: number;
  recentCourses: Course[];
}

export interface CourseResponse {
  success: boolean;
  data?: Course;
  courses?: Course[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: CourseStats;
  message?: string;
  error?: string;
}

export interface ProgramCourse {
  id: number;
  programId: number;
  courseId: number;
  level: number;
  semester: number;
  isRequired: boolean;
  createdAt: Date;
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
  level: number;
  semester: number;
  isRequired?: boolean;
}

export interface UpdateProgramCourseRequest {
  level?: number;
  semester?: number;
  isRequired?: boolean;
}
