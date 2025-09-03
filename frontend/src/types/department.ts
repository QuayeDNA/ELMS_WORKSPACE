export interface Department {
  id: number;
  name: string;
  code: string;
  description: string | null;
  facultyId: number;
  headOfDepartment: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  establishedYear: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  faculty?: {
    id: number;
    name: string;
    institution: {
      id: number;
      name: string;
    };
  };
  _count?: {
    programs: number;
    students: number;
  };
}

export interface CreateDepartmentRequest {
  name: string;
  code: string;
  description?: string;
  facultyId: number;
  headOfDepartment?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  establishedYear?: number;
}

export interface UpdateDepartmentRequest {
  name?: string;
  code?: string;
  description?: string;
  headOfDepartment?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  establishedYear?: number;
  isActive?: boolean;
}

export interface DepartmentQuery {
  facultyId?: number;
  institutionId?: number;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DepartmentStats {
  totalDepartments: number;
  activeDepartments: number;
  inactiveDepartments: number;
  totalPrograms: number;
  totalStudents: number;
  averageProgramsPerDepartment: number;
  recentDepartments: Department[];
}
