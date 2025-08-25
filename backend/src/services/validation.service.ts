import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'email' | 'date' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: string[];
  custom?: (value: any) => boolean | string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
}

export interface StudentValidationData {
  studentId?: string;
  indexNumber?: string;
  admissionNumber?: string;
  programId: string;
  yearOfStudy: number;
  currentLevel?: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    dateOfBirth?: Date;
    nationality?: string;
  };
}

export interface LecturerValidationData {
  employeeId?: string;
  staffNumber?: string;
  departmentId: string;
  rank: string;
  qualification: string[];
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };
}

export interface CourseValidationData {
  code: string;
  name: string;
  departmentId: string;
  creditHours: number;
  lecturerId: string;
  prerequisites?: string[];
  level: string;
}

export interface ExamSessionValidationData {
  examPeriodId: string;
  courseId: string;
  date: Date;
  startTime: string;
  endTime: string;
  venueId: string;
  roomId: string;
  maxStudents: number;
}

export class ValidationService {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Generic field validation
   */
  validateFields(data: Record<string, any>, rules: ValidationRule[]): ValidationResult {
    const errors: Record<string, string[]> = {};
    const warnings: Record<string, string[]> = {};

    for (const rule of rules) {
      const value = data[rule.field];
      const fieldErrors: string[] = [];
      const fieldWarnings: string[] = [];

      // Required field check
      if (rule.required && (value === undefined || value === null || value === '')) {
        fieldErrors.push(`${rule.field} is required`);
        continue;
      }

      // Skip other validations if field is empty and not required
      if (value === undefined || value === null || value === '') {
        continue;
      }

      // Type validation
      if (rule.type) {
        if (!this.validateType(value, rule.type)) {
          fieldErrors.push(`${rule.field} must be of type ${rule.type}`);
          continue;
        }
      }

      // Length validation for strings
      if (typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          fieldErrors.push(`${rule.field} must be at least ${rule.minLength} characters long`);
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          fieldErrors.push(`${rule.field} must be no more than ${rule.maxLength} characters long`);
        }
      }

      // Numeric validation
      if (typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          fieldErrors.push(`${rule.field} must be at least ${rule.min}`);
        }
        if (rule.max !== undefined && value > rule.max) {
          fieldErrors.push(`${rule.field} must be no more than ${rule.max}`);
        }
      }

      // Pattern validation
      if (rule.pattern && typeof value === 'string') {
        if (!rule.pattern.test(value)) {
          fieldErrors.push(`${rule.field} format is invalid`);
        }
      }

      // Enum validation
      if (rule.enum && !rule.enum.includes(value)) {
        fieldErrors.push(`${rule.field} must be one of: ${rule.enum.join(', ')}`);
      }

      // Custom validation
      if (rule.custom) {
        const customResult = rule.custom(value);
        if (customResult !== true) {
          fieldErrors.push(typeof customResult === 'string' ? customResult : `${rule.field} is invalid`);
        }
      }

      if (fieldErrors.length > 0) {
        errors[rule.field] = fieldErrors;
      }
      if (fieldWarnings.length > 0) {
        warnings[rule.field] = fieldWarnings;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate student data
   */
  async validateStudent(data: StudentValidationData): Promise<ValidationResult> {
    const rules: ValidationRule[] = [
      // Personal info validation
      { field: 'personalInfo.firstName', required: true, type: 'string', minLength: 2, maxLength: 50 },
      { field: 'personalInfo.lastName', required: true, type: 'string', minLength: 2, maxLength: 50 },
      { field: 'personalInfo.email', required: true, type: 'email' },
      { field: 'personalInfo.phoneNumber', type: 'string', pattern: /^\+?[\d\s\-\(\)]+$/ },
      
      // Academic info validation
      { field: 'programId', required: true, type: 'string' },
      { field: 'yearOfStudy', required: true, type: 'number', min: 1, max: 10 },
      { field: 'currentLevel', type: 'string', pattern: /^(LEVEL\s)?\d{3}$/ },
    ];

    // Student ID format validation (Ghana university style)
    if (data.studentId) {
      rules.push({
        field: 'studentId',
        type: 'string',
        pattern: /^[A-Z]{2,4}\d{6,8}$/, // e.g., UG12345678, KNUST12345678
        custom: (value) => this.validateStudentIdFormat(value),
      });
    }

    // Index number validation
    if (data.indexNumber) {
      rules.push({
        field: 'indexNumber',
        type: 'string',
        pattern: /^\d{8,10}$/, // 8-10 digit index number
      });
    }

    const basicValidation = this.validateFields(data as any, rules);

    // Additional async validations
    const asyncErrors: Record<string, string[]> = {};

    try {
      // Check if program exists
      if (data.programId) {
        const program = await this.prisma.program.findUnique({
          where: { id: data.programId },
        });
        if (!program) {
          asyncErrors.programId = ['Program does not exist'];
        }
      }

      // Check for duplicate student ID
      if (data.studentId) {
        const existingStudent = await this.prisma.student.findUnique({
          where: { studentId: data.studentId },
        });
        if (existingStudent) {
          asyncErrors.studentId = ['Student ID already exists'];
        }
      }

      // Check for duplicate index number
      if (data.indexNumber) {
        const existingIndex = await this.prisma.student.findUnique({
          where: { indexNumber: data.indexNumber },
        });
        if (existingIndex) {
          asyncErrors.indexNumber = ['Index number already exists'];
        }
      }

      // Check for duplicate email
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: data.personalInfo.email },
      });
      if (existingEmail) {
        asyncErrors['personalInfo.email'] = ['Email already exists'];
      }

    } catch (error) {
      logger.error('Error in async student validation:', error);
      asyncErrors.general = ['Validation error occurred'];
    }

    return {
      isValid: basicValidation.isValid && Object.keys(asyncErrors).length === 0,
      errors: { ...basicValidation.errors, ...asyncErrors },
      warnings: basicValidation.warnings,
    };
  }

  /**
   * Validate lecturer data
   */
  async validateLecturer(data: LecturerValidationData): Promise<ValidationResult> {
    const rules: ValidationRule[] = [
      // Personal info validation
      { field: 'personalInfo.firstName', required: true, type: 'string', minLength: 2, maxLength: 50 },
      { field: 'personalInfo.lastName', required: true, type: 'string', minLength: 2, maxLength: 50 },
      { field: 'personalInfo.email', required: true, type: 'email' },
      { field: 'personalInfo.phoneNumber', type: 'string', pattern: /^\+?[\d\s\-\(\)]+$/ },
      
      // Academic info validation
      { field: 'departmentId', required: true, type: 'string' },
      { field: 'rank', required: true, type: 'string', enum: [
        'GRADUATE_ASSISTANT', 'TEACHING_ASSISTANT', 'LECTURER', 'ASSISTANT_LECTURER',
        'SENIOR_LECTURER', 'ASSOCIATE_PROFESSOR', 'PROFESSOR', 'EMERITUS_PROFESSOR',
        'VISITING_LECTURER', 'ADJUNCT_PROFESSOR'
      ]},
      { field: 'qualification', required: true, type: 'array', minLength: 1 },
    ];

    // Employee ID validation
    if (data.employeeId) {
      rules.push({
        field: 'employeeId',
        type: 'string',
        pattern: /^[A-Z]{2,4}\d{4,6}$/, // e.g., UG12345, KNUST123456
      });
    }

    const basicValidation = this.validateFields(data as any, rules);

    // Additional async validations
    const asyncErrors: Record<string, string[]> = {};

    try {
      // Check if department exists
      const department = await this.prisma.department.findUnique({
        where: { id: data.departmentId },
      });
      if (!department) {
        asyncErrors.departmentId = ['Department does not exist'];
      }

      // Check for duplicate employee ID
      if (data.employeeId) {
        const existingEmployee = await this.prisma.lecturer.findUnique({
          where: { employeeId: data.employeeId },
        });
        if (existingEmployee) {
          asyncErrors.employeeId = ['Employee ID already exists'];
        }
      }

      // Check for duplicate staff number
      if (data.staffNumber) {
        const existingStaff = await this.prisma.lecturer.findUnique({
          where: { staffNumber: data.staffNumber },
        });
        if (existingStaff) {
          asyncErrors.staffNumber = ['Staff number already exists'];
        }
      }

      // Check for duplicate email
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: data.personalInfo.email },
      });
      if (existingEmail) {
        asyncErrors['personalInfo.email'] = ['Email already exists'];
      }

    } catch (error) {
      logger.error('Error in async lecturer validation:', error);
      asyncErrors.general = ['Validation error occurred'];
    }

    return {
      isValid: basicValidation.isValid && Object.keys(asyncErrors).length === 0,
      errors: { ...basicValidation.errors, ...asyncErrors },
      warnings: basicValidation.warnings,
    };
  }

  /**
   * Validate course data
   */
  async validateCourse(data: CourseValidationData): Promise<ValidationResult> {
    const rules: ValidationRule[] = [
      { field: 'code', required: true, type: 'string', pattern: /^[A-Z]{2,4}\s?\d{3}$/ }, // e.g., CS 101, MATH 201
      { field: 'name', required: true, type: 'string', minLength: 5, maxLength: 100 },
      { field: 'departmentId', required: true, type: 'string' },
      { field: 'creditHours', required: true, type: 'number', min: 1, max: 12 },
      { field: 'lecturerId', required: true, type: 'string' },
      { field: 'level', required: true, type: 'string', enum: [
        'FOUNDATION', 'INTRODUCTORY', 'INTERMEDIATE', 'ADVANCED', 'SENIOR', 'GRADUATE'
      ]},
    ];

    const basicValidation = this.validateFields(data, rules);

    // Additional async validations
    const asyncErrors: Record<string, string[]> = {};

    try {
      // Check if department exists
      const department = await this.prisma.department.findUnique({
        where: { id: data.departmentId },
      });
      if (!department) {
        asyncErrors.departmentId = ['Department does not exist'];
      }

      // Check if lecturer exists
      const lecturer = await this.prisma.lecturer.findUnique({
        where: { id: data.lecturerId },
      });
      if (!lecturer) {
        asyncErrors.lecturerId = ['Lecturer does not exist'];
      }

      // Check for duplicate course code within department
      const existingCourse = await this.prisma.course.findFirst({
        where: {
          code: data.code,
          departmentId: data.departmentId,
        },
      });
      if (existingCourse) {
        asyncErrors.code = ['Course code already exists in this department'];
      }

      // Validate prerequisites
      if (data.prerequisites && data.prerequisites.length > 0) {
        const prerequisiteCourses = await this.prisma.course.findMany({
          where: {
            code: { in: data.prerequisites },
            departmentId: data.departmentId,
          },
        });

        const foundCodes = prerequisiteCourses.map(c => c.code);
        const missingCodes = data.prerequisites.filter(code => !foundCodes.includes(code));
        
        if (missingCodes.length > 0) {
          asyncErrors.prerequisites = [`Prerequisites not found: ${missingCodes.join(', ')}`];
        }
      }

    } catch (error) {
      logger.error('Error in async course validation:', error);
      asyncErrors.general = ['Validation error occurred'];
    }

    return {
      isValid: basicValidation.isValid && Object.keys(asyncErrors).length === 0,
      errors: { ...basicValidation.errors, ...asyncErrors },
      warnings: basicValidation.warnings,
    };
  }

  /**
   * Validate exam session data
   */
  async validateExamSession(data: ExamSessionValidationData): Promise<ValidationResult> {
    const rules: ValidationRule[] = [
      { field: 'examPeriodId', required: true, type: 'string' },
      { field: 'courseId', required: true, type: 'string' },
      { field: 'date', required: true, type: 'date' },
      { field: 'startTime', required: true, type: 'string', pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      { field: 'endTime', required: true, type: 'string', pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      { field: 'venueId', required: true, type: 'string' },
      { field: 'roomId', required: true, type: 'string' },
      { field: 'maxStudents', required: true, type: 'number', min: 1, max: 1000 },
    ];

    const basicValidation = this.validateFields(data, rules);

    // Additional async validations
    const asyncErrors: Record<string, string[]> = {};
    const warnings: Record<string, string[]> = {};

    try {
      // Validate time logic
      if (data.startTime && data.endTime) {
        const [startHour, startMin] = data.startTime.split(':').map(Number);
        const [endHour, endMin] = data.endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        if (endMinutes <= startMinutes) {
          asyncErrors.endTime = ['End time must be after start time'];
        }

        const duration = endMinutes - startMinutes;
        if (duration < 30) {
          warnings.duration = ['Exam duration is less than 30 minutes'];
        }
        if (duration > 300) { // 5 hours
          warnings.duration = ['Exam duration is more than 5 hours'];
        }
      }

      // Check if exam period exists and is active
      const examPeriod = await this.prisma.examPeriod.findUnique({
        where: { id: data.examPeriodId },
      });
      if (!examPeriod) {
        asyncErrors.examPeriodId = ['Exam period does not exist'];
      } else {
        // Check if exam date is within period
        if (data.date < examPeriod.startDate || data.date > examPeriod.endDate) {
          asyncErrors.date = ['Exam date is outside the exam period'];
        }
      }

      // Check if course exists
      const course = await this.prisma.course.findUnique({
        where: { id: data.courseId },
      });
      if (!course) {
        asyncErrors.courseId = ['Course does not exist'];
      }

      // Check if room exists and capacity
      const room = await this.prisma.room.findUnique({
        where: { id: data.roomId },
      });
      if (!room) {
        asyncErrors.roomId = ['Room does not exist'];
      } else if (data.maxStudents > room.capacity) {
        asyncErrors.maxStudents = [`Maximum students exceeds room capacity (${room.capacity})`];
      }

      // Check for scheduling conflicts
      const conflictingSession = await this.prisma.examSession.findFirst({
        where: {
          roomId: data.roomId,
          date: data.date,
          OR: [
            {
              AND: [
                { startTime: { lte: data.startTime } },
                { endTime: { gt: data.startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: data.endTime } },
                { endTime: { gte: data.endTime } },
              ],
            },
          ],
        },
      });

      if (conflictingSession) {
        asyncErrors.general = ['Room is already booked for this time slot'];
      }

    } catch (error) {
      logger.error('Error in async exam session validation:', error);
      asyncErrors.general = ['Validation error occurred'];
    }

    return {
      isValid: basicValidation.isValid && Object.keys(asyncErrors).length === 0,
      errors: { ...basicValidation.errors, ...asyncErrors },
      warnings: { ...basicValidation.warnings, ...warnings },
    };
  }

  /**
   * Validate Ghanaian university student ID format
   */
  private validateStudentIdFormat(studentId: string): boolean | string {
    // Common Ghanaian university formats:
    // UG: UG12345678 (2 letters + 8 digits)
    // KNUST: 12345678 or KNUST12345678
    // UCC: UCC12345678
    // GIMPA: GIMPA12345678
    // UEW: UEW12345678
    
    const formats = [
      /^UG\d{8}$/,           // University of Ghana
      /^KNUST\d{6,8}$/,      // KNUST
      /^\d{8}$/,             // KNUST alternative
      /^UCC\d{6,8}$/,        // University of Cape Coast
      /^GIMPA\d{6,8}$/,      // GIMPA
      /^UEW\d{6,8}$/,        // University of Education, Winneba
      /^UDS\d{6,8}$/,        // University for Development Studies
      /^UHAS\d{6,8}$/,       // University of Health and Allied Sciences
      /^UPSA\d{6,8}$/,       // University of Professional Studies
      /^GCTU\d{6,8}$/,       // Ghana Communication Technology University
    ];

    const isValid = formats.some(format => format.test(studentId));
    return isValid || 'Student ID format not recognized for Ghanaian universities';
  }

  /**
   * Validate data type
   */
  private validateType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'email':
        return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'date':
        return value instanceof Date || !isNaN(Date.parse(value));
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return true;
    }
  }
}
