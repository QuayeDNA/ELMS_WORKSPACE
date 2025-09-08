// Academic Year types
export interface CreateAcademicYearData {
  yearCode: string;
  startDate: Date;
  endDate: Date;
  isCurrent?: boolean;
  institutionId: number;
}

export interface UpdateAcademicYearData {
  yearCode?: string;
  startDate?: Date;
  endDate?: Date;
  isCurrent?: boolean;
}

export interface AcademicYearQueryParams {
  institutionId?: number;
  isCurrent?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Semester types
export interface CreateSemesterData {
  academicYearId: number;
  semesterNumber: number;
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent?: boolean;
}

export interface UpdateSemesterData {
  semesterNumber?: number;
  name?: string;
  startDate?: Date;
  endDate?: Date;
  isCurrent?: boolean;
}

export interface SemesterQueryParams {
  academicYearId?: number;
  isCurrent?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Stats types
export interface AcademicPeriodStatsParams {
  institutionId?: number;
}

// Response types
export interface AcademicYearResponse {
  id: number;
  yearCode: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  institutionId: number;
  createdAt: Date;
  institution: {
    id: number;
    name: string;
    code: string;
  };
  semesters: SemesterResponse[];
}

export interface SemesterResponse {
  id: number;
  academicYearId: number;
  semesterNumber: number;
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  createdAt: Date;
  academicYear: {
    id: number;
    yearCode: string;
    startDate: Date;
    endDate: Date;
    isCurrent: boolean;
    institution: {
      id: number;
      name: string;
      code: string;
    };
  };
}
