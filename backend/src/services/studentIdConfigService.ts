import { prisma } from '../server';
import {
  StudentIdFormat,
  StudentIdYearPosition,
  StudentIdConfig,
} from '@prisma/client';
import {
  CreateStudentIdConfigDTO,
  UpdateStudentIdConfigDTO,
  GenerateStudentIdOptions,
  StudentIdPreview,
} from '../types/studentIdConfig';

/**
 * Student ID Configuration Service
 * Handles student ID generation configuration and generation logic
 */
class StudentIdConfigService {
  /**
   * Create student ID configuration for an institution
   */
  async createConfig(data: CreateStudentIdConfigDTO): Promise<StudentIdConfig> {
    // Check if config already exists
    const existing = await prisma.studentIdConfig.findUnique({
      where: { institutionId: data.institutionId },
    });

    if (existing) {
      throw new Error('Student ID configuration already exists for this institution');
    }

    // Generate example based on configuration
    const example = this.generateExample(data);

    return await prisma.studentIdConfig.create({
      data: {
        ...data,
        example,
        currentNumber: data.startNumber || 1,
      },
    });
  }

  /**
   * Get student ID configuration by institution
   */
  async getConfigByInstitution(institutionId: number): Promise<StudentIdConfig | null> {
    return await prisma.studentIdConfig.findUnique({
      where: { institutionId },
      include: {
        institution: true,
      },
    });
  }

  /**
   * Update student ID configuration
   */
  async updateConfig(
    institutionId: number,
    data: UpdateStudentIdConfigDTO
  ): Promise<StudentIdConfig> {
    const config = await this.getConfigByInstitution(institutionId);
    if (!config) {
      throw new Error('Student ID configuration not found');
    }

    // Generate new example if format changed
    let example = config.example;
    if (data.format) {
      const exampleConfig: Partial<CreateStudentIdConfigDTO> = {
        format: data.format,
        prefix: data.prefix !== undefined ? data.prefix : (config.prefix || undefined),
        useAcademicYear: data.useAcademicYear !== undefined ? data.useAcademicYear : config.useAcademicYear,
        academicYearPos: data.academicYearPos !== undefined ? data.academicYearPos : (config.academicYearPos || undefined),
        separator: data.separator !== undefined ? data.separator : (config.separator || undefined),
        paddingLength: data.paddingLength !== undefined ? data.paddingLength : config.paddingLength,
        pattern: data.pattern !== undefined ? data.pattern : (config.pattern || undefined),
      };
      example = this.generateExample(exampleConfig);
    }

    return await prisma.studentIdConfig.update({
      where: { institutionId },
      data: {
        ...data,
        example,
      },
    });
  }

  /**
   * Generate next student ID
   */
  async generateStudentId(options: GenerateStudentIdOptions): Promise<string> {
    const config = await this.getConfigByInstitution(options.institutionId);
    if (!config) {
      throw new Error('Student ID configuration not found for this institution');
    }

    let studentId: string;

    switch (config.format) {
      case StudentIdFormat.SEQUENTIAL:
        studentId = this.generateSequentialId(config);
        break;

      case StudentIdFormat.ACADEMIC_YEAR:
        if (!options.academicYearId) {
          throw new Error('Academic year ID is required for ACADEMIC_YEAR format');
        }
        studentId = await this.generateAcademicYearId(
          config,
          options.academicYearId,
          options.programCode
        );
        break;

      case StudentIdFormat.CUSTOM:
        studentId = await this.generateCustomId(
          config,
          options.academicYearId,
          options.programCode
        );
        break;

      default:
        throw new Error(`Unsupported student ID format: ${config.format}`);
    }

    // Increment current number
    await prisma.studentIdConfig.update({
      where: { institutionId: options.institutionId },
      data: {
        currentNumber: config.currentNumber + 1,
      },
    });

    return studentId;
  }

  /**
   * Generate sequential ID (e.g., 0721000001)
   */
  private generateSequentialId(config: StudentIdConfig): string {
    const prefix = config.prefix || '';
    const number = config.currentNumber.toString().padStart(config.paddingLength, '0');
    return `${prefix}${number}`;
  }

  /**
   * Generate academic year-based ID (e.g., BT/ITS/24/001)
   */
  private async generateAcademicYearId(
    config: StudentIdConfig,
    academicYearId: number,
    programCode?: string
  ): Promise<string> {
    // Get academic year info
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: academicYearId },
    });

    if (!academicYear) {
      throw new Error('Academic year not found');
    }

    // Extract year from yearCode (e.g., "2024/2025" -> "24")
    const yearMatch = academicYear.yearCode.match(/\d{4}/);
    const yearShort = yearMatch ? yearMatch[0].slice(-2) : '00';

    const prefix = config.prefix || '';
    const program = programCode || '';
    const separator = config.separator || '/';
    const number = config.currentNumber.toString().padStart(config.paddingLength, '0');

    // Build ID based on year position
    let parts: string[] = [];

    switch (config.academicYearPos) {
      case StudentIdYearPosition.PREFIX:
        parts = [yearShort, prefix, program, number].filter(Boolean);
        break;

      case StudentIdYearPosition.MIDDLE:
        parts = [prefix, program, yearShort, number].filter(Boolean);
        break;

      case StudentIdYearPosition.SUFFIX:
        parts = [prefix, program, number, yearShort].filter(Boolean);
        break;

      default:
        // Default to MIDDLE
        parts = [prefix, program, yearShort, number].filter(Boolean);
    }

    return parts.join(separator);
  }

  /**
   * Generate custom ID based on pattern
   */
  private async generateCustomId(
    config: StudentIdConfig,
    academicYearId?: number,
    programCode?: string
  ): Promise<string> {
    if (!config.pattern) {
      throw new Error('Custom pattern is not defined');
    }

    let pattern = config.pattern;
    const number = config.currentNumber.toString().padStart(config.paddingLength, '0');

    // Replace placeholders
    pattern = pattern.replace('{PREFIX}', config.prefix || '');
    pattern = pattern.replace('{PROGRAM}', programCode || '');
    pattern = pattern.replace('{SEQ}', number);

    if (academicYearId) {
      const academicYear = await prisma.academicYear.findUnique({
        where: { id: academicYearId },
      });
      if (academicYear) {
        const yearMatch = academicYear.yearCode.match(/\d{4}/);
        const yearShort = yearMatch ? yearMatch[0].slice(-2) : '00';
        pattern = pattern.replace('{YEAR}', yearShort);
      }
    }

    return pattern;
  }

  /**
   * Generate example ID for preview
   */
  private generateExample(config: Partial<CreateStudentIdConfigDTO>): string {
    const prefix = config.prefix || 'XXX';
    const paddingLength = config.paddingLength || 6;
    const number = '1'.padStart(paddingLength, '0');
    const separator = config.separator || '/';

    switch (config.format) {
      case StudentIdFormat.SEQUENTIAL:
        return `${prefix}${number}`;

      case StudentIdFormat.ACADEMIC_YEAR:
        if (config.academicYearPos === StudentIdYearPosition.PREFIX) {
          return `24${separator}${prefix}${separator}${number}`;
        } else if (config.academicYearPos === StudentIdYearPosition.SUFFIX) {
          return `${prefix}${separator}${number}${separator}24`;
        } else {
          // MIDDLE or default
          return `${prefix}${separator}24${separator}${number}`;
        }

      case StudentIdFormat.CUSTOM:
        return config.pattern || `${prefix}${separator}24${separator}${number}`;

      default:
        return `${prefix}${number}`;
    }
  }

  /**
   * Preview student ID configuration
   */
  async previewConfig(data: CreateStudentIdConfigDTO): Promise<StudentIdPreview> {
    const example = this.generateExample(data);
    const nextId = example; // Same as example for preview

    return {
      format: data.format,
      pattern: data.pattern || this.buildPattern(data),
      example,
      nextId,
    };
  }

  /**
   * Build pattern description
   */
  private buildPattern(config: Partial<CreateStudentIdConfigDTO>): string {
    const sep = config.separator || '/';

    switch (config.format) {
      case StudentIdFormat.SEQUENTIAL:
        return `{PREFIX}{SEQUENCE}`;

      case StudentIdFormat.ACADEMIC_YEAR:
        if (config.academicYearPos === StudentIdYearPosition.PREFIX) {
          return `{YEAR}${sep}{PREFIX}${sep}{SEQUENCE}`;
        } else if (config.academicYearPos === StudentIdYearPosition.SUFFIX) {
          return `{PREFIX}${sep}{SEQUENCE}${sep}{YEAR}`;
        } else {
          return `{PREFIX}${sep}{YEAR}${sep}{SEQUENCE}`;
        }

      case StudentIdFormat.CUSTOM:
        return config.pattern || `{PREFIX}${sep}{YEAR}${sep}{SEQUENCE}`;

      default:
        return '{PREFIX}{SEQUENCE}';
    }
  }
}

export const studentIdConfigService = new StudentIdConfigService();
