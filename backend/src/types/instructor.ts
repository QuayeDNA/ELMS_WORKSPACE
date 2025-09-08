// Enums for better type safety
export type AcademicRankLevel = 'GRADUATE_ASSISTANT' | 'ASSISTANT_LECTURER' | 'LECTURER' | 'SENIOR_LECTURER' | 'PRINCIPAL_LECTURER' | 'ASSOCIATE_PROFESSOR' | 'PROFESSOR';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'VISITING';
export type EmploymentStatus = 'ACTIVE' | 'ON_LEAVE' | 'RETIRED' | 'TERMINATED';

export interface CreateInstructorData {
  user: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    title?: string;
    phone?: string;
    dateOfBirth?: Date;
    gender?: string;
    nationality?: string;
    address?: string;
  };
  profile: {
    staffId: string;
    academicRank?: AcademicRankLevel;
    employmentType?: EmploymentType;
    employmentStatus?: EmploymentStatus;
    hireDate?: Date;
    highestQualification?: string;
    specialization?: string;
    researchInterests?: string;
    officeLocation?: string;
    officeHours?: string;
    biography?: string;
    profileImageUrl?: string;
    canCreateExams?: boolean;
    canGradeScripts?: boolean;
    canViewResults?: boolean;
    canTeachCourses?: boolean;
  };
  departments?: Array<{
    departmentId: number;
    isPrimary?: boolean;
  }>;
}

export interface UpdateInstructorData {
  user?: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    title?: string;
    phone?: string;
    dateOfBirth?: Date;
    gender?: string;
    nationality?: string;
    address?: string;
  };
  profile?: {
    academicRank?: AcademicRankLevel;
    employmentType?: EmploymentType;
    employmentStatus?: EmploymentStatus;
    hireDate?: Date;
    highestQualification?: string;
    specialization?: string;
    researchInterests?: string;
    officeLocation?: string;
    officeHours?: string;
    biography?: string;
    profileImageUrl?: string;
    canCreateExams?: boolean;
    canGradeScripts?: boolean;
    canViewResults?: boolean;
    canTeachCourses?: boolean;
  };
}

export interface InstructorQueryParams {
  departmentId?: number;
  facultyId?: number;
  institutionId?: number;
  academicRank?: AcademicRankLevel;
  employmentType?: EmploymentType;
  employmentStatus?: EmploymentStatus;
  specialization?: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InstructorStatsParams {
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
}

// Instructor profile response type
export interface InstructorProfileResponse {
  id: number;
  userId: number;
  staffId: string;
  academicRank?: AcademicRankLevel;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  hireDate?: Date;
  highestQualification?: string;
  specialization?: string;
  researchInterests?: string;
  officeLocation?: string;
  officeHours?: string;
  biography?: string;
  profileImageUrl?: string;
  canCreateExams: boolean;
  canGradeScripts: boolean;
  canViewResults: boolean;
  canTeachCourses: boolean;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    title?: string;
    phone?: string;
    dateOfBirth?: Date;
    gender?: string;
    nationality?: string;
    address?: string;
    status: string;
    createdAt: Date;
    updatedAt?: Date;
  };
  lecturerDepartments: Array<{
    id: number;
    departmentId: number;
    isPrimary: boolean;
    department: {
      id: number;
      name: string;
      code: string;
      faculty: {
        id: number;
        name: string;
        code: string;
        institution: {
          id: number;
          name: string;
          code: string;
        };
      };
    };
  }>;
}
