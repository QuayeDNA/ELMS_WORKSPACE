export interface Program {
  id: number;
  name: string;
  code: string;
  type: 'CERTIFICATE' | 'DIPLOMA' | 'HND' | 'BACHELOR' | 'MASTERS' | 'PHD';
  level: 'UNDERGRADUATE' | 'POSTGRADUATE';
  durationYears: number;
  creditHours: number | null;
  description: string | null;
  admissionRequirements: string | null;
  isActive: boolean;
  departmentId: number;
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
    students: number;
    programCourses: number;
  };
}

export interface CreateProgramRequest {
  name: string;
  code: string;
  type: 'CERTIFICATE' | 'DIPLOMA' | 'HND' | 'BACHELOR' | 'MASTERS' | 'PHD';
  level: 'UNDERGRADUATE' | 'POSTGRADUATE';
  durationYears: number;
  creditHours?: number;
  description?: string;
  admissionRequirements?: string;
  departmentId: number;
}

export interface UpdateProgramRequest {
  name?: string;
  code?: string;
  type?: 'CERTIFICATE' | 'DIPLOMA' | 'HND' | 'BACHELOR' | 'MASTERS' | 'PHD';
  level?: 'UNDERGRADUATE' | 'POSTGRADUATE';
  durationYears?: number;
  creditHours?: number;
  description?: string;
  admissionRequirements?: string;
  isActive?: boolean;
}

export interface ProgramQuery {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: number;
  facultyId?: number;
  institutionId?: number;
  type?: 'CERTIFICATE' | 'DIPLOMA' | 'HND' | 'BACHELOR' | 'MASTERS' | 'PHD';
  level?: 'UNDERGRADUATE' | 'POSTGRADUATE';
  isActive?: boolean;
  sortBy?: 'name' | 'code' | 'type' | 'level' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ProgramStats {
  totalPrograms: number;
  byType: Record<string, number>;
  byLevel: Record<string, number>;
  byDepartment: Record<string, number>;
  recentPrograms: Program[];
}

export interface ProgramResponse {
  success: boolean;
  data?: Program;
  programs?: Program[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: ProgramStats;
  message?: string;
  error?: string;
}
