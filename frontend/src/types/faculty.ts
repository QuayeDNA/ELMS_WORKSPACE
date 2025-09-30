// ========================================
// FACULTY TYPES FOR FRONTEND
// ========================================

export interface Faculty {
  id: number;
  name: string;
  code: string;
  description?: string;
  establishedYear?: number;
  institutionId: number;
  deanId?: number;
  createdAt: string;
  updatedAt: string;
  institution?: {
    id: number;
    name: string;
    code: string;
    type?: string;
    status?: string;
  };
  dean?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    title?: string;
  };
  departments?: Array<{
    id: number;
    name: string;
    code: string;
    hod?: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
    _count?: {
      users: number;
      courses: number;
    };
  }>;
  users?: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
  }>;
  _count?: {
    users: number;
    departments: number;
    exams?: number;
  };
}

// ========================================
// REQUEST/RESPONSE INTERFACES
// ========================================

export interface CreateFacultyRequest {
  name: string;
  code: string;
  institutionId: number;
  description?: string;
}

export interface UpdateFacultyRequest {
  name?: string;
  code?: string;
  description?: string;
}

export interface FacultyQuery {
  institutionId?: number;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "code" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface FacultyListResponse {
  faculties: Faculty[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ========================================
// FORM DATA INTERFACES
// ========================================

export interface FacultyFormData {
  name: string;
  code: string;
  institutionId: string; // Form input as string
  description: string;
}

// ========================================
// UI STATE INTERFACES
// ========================================

export interface FacultyFilters {
  institutionId: number | "ALL";
  search: string;
  sortBy: "name" | "code" | "createdAt";
  sortOrder: "asc" | "desc";
}

export interface FacultyTableColumn {
  key: keyof Faculty | "actions";
  label: string;
  sortable?: boolean;
  width?: string;
}

// ========================================
// CONSTANTS
// ========================================

export const DEFAULT_FACULTY_FILTERS: FacultyFilters = {
  institutionId: "ALL",
  search: "",
  sortBy: "name",
  sortOrder: "asc",
};

export const FACULTY_TABLE_COLUMNS: FacultyTableColumn[] = [
  { key: "name", label: "Faculty Name", sortable: true, width: "30%" },
  { key: "code", label: "Code", sortable: true, width: "15%" },
  { key: "institution", label: "Institution", sortable: false, width: "25%" },
  { key: "_count", label: "Users/Depts", sortable: false, width: "15%" },
  { key: "createdAt", label: "Created", sortable: true, width: "15%" },
  { key: "actions", label: "Actions", sortable: false, width: "10%" },
];
