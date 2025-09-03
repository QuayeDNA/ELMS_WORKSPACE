export interface Program {
  id: number;
  name: string;
  code: string;
  description: string | null;
  departmentId: number;
  duration: number;
  degreeType: string;
  creditHours: number | null;
  tuitionFee: number | null;
  applicationDeadline: string | null;
  startDate: string | null;
  endDate: string | null;
  capacity: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  department?: {
    id: number;
    name: string;
    faculty: {
      id: number;
      name: string;
      institution: {
        id: number;
        name: string;
      };
    };
  };
  _count?: {
    students: number;
    programCourses: number;
  };
}

export interface CreateProgramRequest {
  name: string;
  code: string;
  description?: string;
  departmentId: number;
  duration: number;
  degreeType: string;
  creditHours?: number;
  tuitionFee?: number;
  applicationDeadline?: string;
  startDate?: string;
  endDate?: string;
  capacity?: number;
}

export interface UpdateProgramRequest {
  name?: string;
  code?: string;
  description?: string;
  duration?: number;
  degreeType?: string;
  creditHours?: number;
  tuitionFee?: number;
  applicationDeadline?: string;
  startDate?: string;
  endDate?: string;
  capacity?: number;
  isActive?: boolean;
}

export interface ProgramQuery {
  departmentId?: number;
  facultyId?: number;
  institutionId?: number;
  degreeType?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProgramStats {
  totalPrograms: number;
  activePrograms: number;
  inactivePrograms: number;
  totalStudents: number;
  totalCourses: number;
  averageStudentsPerProgram: number;
  recentPrograms: Program[];
}
