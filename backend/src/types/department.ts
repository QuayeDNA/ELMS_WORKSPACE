export interface Department {
  id: number;
  name: string;
  code: string;
  type: string;
  description?: string | null;
  officeLocation?: string | null;
  contactInfo?: string | null;
  facultyId: number;
  hodId?: number | null;
  createdAt: Date;
  updatedAt: Date;
  faculty?: {
    id: number;
    name: string;
    institutionId: number;
  };
  hod?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  _count?: {
    users: number;
    courses: number;
    programs: number;
  };
}

export interface CreateDepartmentRequest {
  name: string;
  code: string;
  type?: string;
  description?: string | null;
  officeLocation?: string | null;
  contactInfo?: string | null;
  facultyId: number;
  hodId?: number | null;
}

export interface UpdateDepartmentRequest {
  name?: string;
  code?: string;
  type?: string;
  description?: string | null;
  officeLocation?: string | null;
  contactInfo?: string | null;
  hodId?: number | null;
}

export interface DepartmentQuery {
  page?: number;
  limit?: number;
  search?: string;
  facultyId?: number;
  institutionId?: number;
  type?: string;
  sortBy?: 'name' | 'code' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface DepartmentStats {
  totalDepartments: number;
  byType: Record<string, number>;
  byFaculty: Record<string, number>;
  recentDepartments: Department[];
}

export interface DepartmentResponse {
  success: boolean;
  data?: Department;
  departments?: Department[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: DepartmentStats;
  message?: string;
  error?: string;
}
