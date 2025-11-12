import { StudentIdFormat, StudentIdYearPosition } from '@prisma/client';

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
  example?: string;
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
  example?: string;
}

export interface GenerateStudentIdOptions {
  institutionId: number;
  programCode?: string;
  academicYearId?: number;
}

export interface StudentIdPreview {
  format: StudentIdFormat;
  pattern: string;
  example: string;
  nextId: string;
}
