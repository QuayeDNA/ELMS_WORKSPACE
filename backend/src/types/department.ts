// ========================================
// DEPARTMENT TYPES
// ========================================

export interface Department {
  id: number;
  name: string;
  code: string;
  type: string; // 'department', 'school', 'institute'
  description?: string | null;
  officeLocation?: string | null;
  contactInfo?: string | null; // JSON string
  facultyId: number;
  hodId?: number | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
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

  hod?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  } | null;

  courses?: {
    id: number;
    name: string;
    code: string;
    creditHours: number;
    courseType: string;
    isActive: boolean;
  }[];

  users?: {
    id: number;
    firstName: string;
    lastName: string;
    role: string;
    email: string;
  }[];

  lecturerDepartments?: {
    lecturer: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      staffId?: string;
    };
  }[];

  // Computed stats
  stats?: {
    totalUsers: number;
    totalCourses: number;
    totalLecturers: number;
    activePrograms: number;
  };
}

export interface DepartmentQuery {
  page?: number;
  limit?: number;
  search?: string;
  facultyId?: number;
  institutionId?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DepartmentCreateData {
  name: string;
  code: string;
  facultyId: number;
  type?: string;
  description?: string;
  officeLocation?: string;
  contactInfo?: string;
}

export interface DepartmentUpdateData {
  name?: string;
  code?: string;
  type?: string;
  description?: string;
  officeLocation?: string;
  contactInfo?: string;
}

export interface DepartmentResponse {
  success: boolean;
  data?: {
    departments: Department[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  error?: string;
}
