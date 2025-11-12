// Student ID Configuration Types
export type StudentIdFormat = 'SEQUENTIAL' | 'ACADEMIC_YEAR' | 'CUSTOM';
export type StudentIdYearPosition = 'PREFIX' | 'MIDDLE' | 'SUFFIX';

export interface StudentIdConfig {
  id: number;
  institutionId: number;
  format: StudentIdFormat;
  prefix?: string;
  useAcademicYear: boolean;
  academicYearPos?: StudentIdYearPosition;
  separator?: string;
  paddingLength: number;
  startNumber: number;
  currentNumber: number;
  pattern?: string;
  example?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentIdConfigDTO {
  institutionId: number;
  format: StudentIdFormat;
  prefix?: string;
  useAcademicYear?: boolean;
  academicYearPos?: StudentIdYearPosition;
  separator?: string;
  paddingLength?: number;
  startNumber?: number;
  pattern?: string;
}

export interface UpdateStudentIdConfigDTO {
  format?: StudentIdFormat;
  prefix?: string;
  useAcademicYear?: boolean;
  academicYearPos?: StudentIdYearPosition;
  separator?: string;
  paddingLength?: number;
  startNumber?: number;
  currentNumber?: number;
  pattern?: string;
}

export interface StudentIdPreview {
  format: StudentIdFormat;
  pattern: string;
  example: string;
  nextId: string;
}
