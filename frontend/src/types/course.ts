// ========================================
// COURSE TYPES
// ========================================

export interface Course {
  id: number;
  name: string;
  code: string;
  departmentId: number;
  level: number;
  courseType: string;
  creditHours: number;
  contactHours?: number | null;
  description?: string | null;
  learningOutcomes?: string | null;
  syllabus?: string | null;
  assessmentMethods?: string | null;
  prerequisites?: string | null; // JSON array of course codes
  corequisites?: string | null; // JSON array of course codes
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
  courseType: string;
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
  courseType?: string;
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

export interface CourseQuery {
  departmentId?: number;
  facultyId?: number;
  institutionId?: number;
  level?: number;
  courseType?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CourseListResponse {
  courses: Course[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CourseStats {
  courseId: number;
  enrollmentCount: number;
  prerequisiteCount: number;
  corequisiteCount: number;
  totalStudents: number;
}

// ========================================
// COURSE OFFERING TYPES
// ========================================

export interface CourseOffering {
  id: number;
  courseId: number;
  semesterId: number;
  primaryLecturerId?: number;
  maxEnrollment?: number;
  currentEnrollment: number;
  classroom?: string;
  schedule?: string; // JSON string for class times and days
  status: string; // 'active', 'cancelled', 'completed'
  createdAt: Date;
  updatedAt: Date;

  // Relations
  course: {
    id: number;
    name: string;
    code: string;
    creditHours: number;
    level: number;
    courseType: string;
  };

  semester: {
    id: number;
    academicYearId: number;
    semesterNumber: number;
    name: string;
    startDate: Date;
    endDate: Date;
    isCurrent: boolean;
    academicYear: {
      id: number;
      yearCode: string;
      startDate: Date;
      endDate: Date;
      isCurrent: boolean;
    };
  };

  primaryLecturer?: {
    id: number;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      title?: string;
    };
    academicRank?: string;
  };

  courseLecturers: CourseLecturer[];
  enrollments: Enrollment[];
}

export interface CourseLecturer {
  id: number;
  courseOfferingId: number;
  lecturerId: number;
  role: string; // 'instructor', 'coordinator', 'assistant'
  createdAt: Date;

  // Relations
  lecturer: {
    id: number;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      title?: string;
    };
    academicRank?: string;
    specialization?: string;
  };
}

export interface Enrollment {
  id: number;
  studentId: number;
  courseOfferingId: number;
  enrollmentDate: Date;
  status: string; // 'enrolled', 'dropped', 'completed', 'deferred'
  grade?: string;
  gradePoints?: number;
  attendancePercentage?: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  student: {
    id: number;
    user: {
      id: number;
      firstName: string;
      lastName: string;
    };
    studentId: string;
    indexNumber?: string;
  };
}
