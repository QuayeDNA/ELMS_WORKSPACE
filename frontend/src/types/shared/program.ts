// ========================================
// CENTRALIZED PROGRAM TYPES
// ========================================

export interface Program {
  id: number;
  name: string;
  code: string;
  type: ProgramType;
  level: ProgramLevel;
  durationYears: number;
  creditHours?: number | null;
  description?: string | null;
  admissionRequirements?: string | null;
  isActive: boolean;
  departmentId: number;
  createdAt: string;
  updatedAt: string;

  // Relations
  department?: {
    id: number;
    name: string;
    code: string;
    faculty?: {
      id: number;
      name: string;
      code: string;
      institution?: {
        id: number;
        name: string;
        code: string;
      };
    };
  };

  students?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    studentId?: string;
    indexNumber?: string;
    level?: number;
  }[];

  programCourses?: {
    id: number;
    level: number;
    semester: number;
    isRequired: boolean;
    course: {
      id: number;
      name: string;
      code: string;
      creditHours: number;
      courseType: string;
      level: number;
    };
  }[];

  // Computed stats
  stats?: {
    totalStudents: number;
    totalCourses: number;
    totalCreditHours: number;
  };
}

// ========================================
// PROGRAM ENUMS
// ========================================

export enum ProgramType {
  UNDERGRADUATE = "UNDERGRADUATE",
  POSTGRADUATE = "POSTGRADUATE",
  DIPLOMA = "DIPLOMA",
  CERTIFICATE = "CERTIFICATE",
}

export enum ProgramLevel {
  LEVEL_100 = "LEVEL_100",
  LEVEL_200 = "LEVEL_200",
  LEVEL_300 = "LEVEL_300",
  LEVEL_400 = "LEVEL_400",
  LEVEL_500 = "LEVEL_500",
  LEVEL_600 = "LEVEL_600",
  LEVEL_700 = "LEVEL_700",
}

// ========================================
// QUERY AND RESPONSE TYPES
// ========================================

export interface ProgramQuery {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: number;
  facultyId?: number;
  institutionId?: number;
  type?: ProgramType;
  level?: ProgramLevel;
  isActive?: boolean;
  sortBy?: "name" | "code" | "createdAt" | "type" | "level";
  sortOrder?: "asc" | "desc";
}

export interface ProgramListResponse {
  programs: Program[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ========================================
// REQUEST TYPES
// ========================================

export interface CreateProgramRequest {
  name: string;
  code: string;
  departmentId: number;
  type: ProgramType;
  level: ProgramLevel;
  durationYears: number;
  creditHours?: number | null;
  description?: string | null;
  admissionRequirements?: string | null;
  isActive?: boolean;
}

export interface UpdateProgramRequest {
  name?: string;
  code?: string;
  type?: ProgramType;
  level?: ProgramLevel;
  durationYears?: number;
  creditHours?: number | null;
  description?: string | null;
  admissionRequirements?: string | null;
  isActive?: boolean;
}

// ========================================
// COMPONENT PROPS INTERFACES
// ========================================

export interface ProgramFormProps {
  mode: "create" | "edit";
  program?: Program; // Only required for edit mode
  onSuccess: () => void;
  onCancel: () => void;
}

export interface ProgramViewProps {
  program: Program;
  onClose: () => void;
}

export interface ProgramStats {
  totalStudents: number;
  totalCourses: number;
  totalCreditHours: number;
}
