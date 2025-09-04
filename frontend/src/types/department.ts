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
  contactInfo?: string | null;
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
    };
  };

  hod?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  } | null;

  // Stats (computed)
  stats?: {
    totalUsers: number;
    totalCourses: number;
    totalLecturers: number;
    activePrograms: number;
  };
}

export interface CreateDepartmentData {
  name: string;
  code: string;
  type: string;
  description?: string;
  officeLocation?: string;
  contactInfo?: string;
  facultyId: number;
  hodId?: number;
}

export interface UpdateDepartmentData {
  name?: string;
  code?: string;
  type?: string;
  description?: string;
  officeLocation?: string;
  contactInfo?: string;
  hodId?: number;
}

export interface DepartmentQuery {
  facultyId?: number;
  institutionId?: number;
  isActive?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DepartmentStats {
  departmentId: number;
  totalUsers: number;
  totalCourses: number;
  totalLecturers: number;
  activePrograms: number;
}
