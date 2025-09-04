// ========================================
// PROGRAM TYPES
// ========================================

export interface Program {
  id: number;
  name: string;
  code: string;
  type: string;
  level: string;
  durationYears: number;
  creditHours?: number | null;
  description?: string | null;
  admissionRequirements?: string | null;
  isActive: boolean;
  departmentId: number;
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

  // Stats (computed)
  stats?: {
    totalStudents: number;
    totalCourses: number;
    totalCreditHours: number;
  };
}

export interface CreateProgramData {
  name: string;
  code: string;
  departmentId: number;
  type: string;
  level: string;
  durationYears: number;
  creditHours?: number;
  description?: string;
  admissionRequirements?: string;
  isActive?: boolean;
}

export interface UpdateProgramData {
  name?: string;
  code?: string;
  type?: string;
  level?: string;
  durationYears?: number;
  creditHours?: number;
  description?: string;
  admissionRequirements?: string;
  isActive?: boolean;
}

export interface ProgramQuery {
  departmentId?: number;
  facultyId?: number;
  institutionId?: number;
  type?: string;
  level?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProgramStats {
  programId: number;
  totalStudents: number;
  totalCourses: number;
  totalCreditHours: number;
}
