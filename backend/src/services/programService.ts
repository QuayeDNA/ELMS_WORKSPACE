import { PrismaClient } from '@prisma/client';
import { Program, ProgramQuery, ProgramType, ProgramLevel } from '../types/program';

const prisma = new PrismaClient();

export const programService = {
  // Get all programs with pagination and filtering
  async getPrograms(query: ProgramQuery) {
    const { page = 1, limit = 10, search, departmentId, facultyId, institutionId, type, level, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (facultyId) {
      where.department = {
        facultyId: facultyId
      };
    }

    if (institutionId) {
      where.department = {
        ...where.department,
        faculty: {
          institutionId: institutionId
        }
      };
    }

    if (type) {
      where.type = type;
    }

    if (level) {
      where.level = level;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    console.log('Program service where clause:', JSON.stringify(where, null, 2));

    // Get total count
    const total = await prisma.program.count({ where });
    console.log(`Found ${total} total programs matching criteria`);

    // Get programs with relations
    const programs = await prisma.program.findMany({
      where,
      include: {
        department: {
          include: {
            faculty: {
              include: {
                institution: true
              }
            }
          }
        },
        students: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            studentId: true
          }
        },
        programCourses: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                code: true,
                creditHours: true,
                courseType: true
              }
            }
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip,
      take: limit
    });

    console.log(`Fetched ${programs.length} programs from database`);

    // Calculate stats for each program
    const programsWithStats = programs.map(program => ({
      ...program,
      stats: {
        totalStudents: program.students.length,
        totalCourses: program.programCourses.length,
        totalCreditHours: program.programCourses.reduce((sum, pc) => sum + (pc.course.creditHours || 0), 0)
      }
    }));

    return {
      success: true,
      data: {
        programs: programsWithStats,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  },

  // Get single program by ID
  async getProgramById(id: number): Promise<Program | null> {
    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        department: {
          include: {
            faculty: {
              include: {
                institution: true
              }
            }
          }
        },
        students: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            },
            studentId: true,
            indexNumber: true,
            level: true
          }
        },
        programCourses: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                code: true,
                creditHours: true,
                courseType: true,
                level: true
              }
            }
          },
          orderBy: [
            { level: 'asc' },
            { semester: 'asc' }
          ]
        }
      }
    });

    if (!program) return null;

    // Transform students to flatten user properties
    const transformedStudents = program.students.map(student => ({
      id: student.id,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      email: student.user.email,
      studentId: student.studentId,
      indexNumber: student.indexNumber ?? undefined,
      level: student.level
    }));

    // Add stats
    return {
      ...program,
      students: transformedStudents,
      stats: {
        totalStudents: transformedStudents.length,
        totalCourses: program.programCourses.length,
        totalCreditHours: program.programCourses.reduce((sum, pc) => sum + (pc.course.creditHours || 0), 0)
      }
    };
  },

  // Create new program
  async createProgram(data: {
    name: string;
    code: string;
    departmentId: number;
    type: ProgramType;
    level: ProgramLevel;
    durationYears: number;
    creditHours?: number;
    description?: string;
    admissionRequirements?: string;
    isActive?: boolean;
  }) {
    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { id: data.departmentId }
    });

    if (!department) {
      throw new Error('Department not found');
    }

    // Check if program code is unique within department
    const existingProgram = await prisma.program.findFirst({
      where: {
        code: data.code,
        departmentId: data.departmentId
      }
    });

    if (existingProgram) {
      throw new Error(`Program with code '${data.code}' already exists in this department`);
    }

    const program = await prisma.program.create({
      data: {
        name: data.name,
        code: data.code,
        departmentId: data.departmentId,
        type: data.type,
        level: data.level,
        durationYears: data.durationYears,
        creditHours: data.creditHours,
        description: data.description,
        admissionRequirements: data.admissionRequirements,
        isActive: data.isActive ?? true
      },
      include: {
        department: {
          include: {
            faculty: {
              include: {
                institution: true
              }
            }
          }
        }
      }
    });

    return program;
  },

  // Update program
  async updateProgram(id: number, data: {
    name?: string;
    code?: string;
    type?: ProgramType;
    level?: ProgramLevel;
    durationYears?: number;
    creditHours?: number;
    description?: string;
    admissionRequirements?: string;
    isActive?: boolean;
  }) {
    // Check if program exists
    const existingProgram = await prisma.program.findUnique({
      where: { id }
    });

    if (!existingProgram) {
      return null;
    }

    // Check if new code conflicts (if code is being updated)
    if (data.code && data.code !== existingProgram.code) {
      const codeConflict = await prisma.program.findFirst({
        where: {
          code: data.code,
          departmentId: existingProgram.departmentId,
          id: { not: id }
        }
      });

      if (codeConflict) {
        throw new Error(`Program with code '${data.code}' already exists in this department`);
      }
    }

    const program = await prisma.program.update({
      where: { id },
      data,
      include: {
        department: {
          include: {
            faculty: {
              include: {
                institution: true
              }
            }
          }
        }
      }
    });

    return program;
  },

  // Delete program
  async deleteProgram(id: number): Promise<boolean> {
    try {
      // Check if program has dependencies
      const studentsCount = await prisma.studentProfile.count({
        where: { programId: id }
      });

      const coursesCount = await prisma.programCourse.count({
        where: { programId: id }
      });

      if (studentsCount > 0 || coursesCount > 0) {
        throw new Error('Cannot delete program with existing students or courses');
      }

      await prisma.program.delete({
        where: { id }
      });

      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Cannot delete')) {
        throw error;
      }
      return false;
    }
  },

  // Get programs by department
  async getProgramsByDepartment(departmentId: number, query: { page: number; limit: number; search?: string; isActive?: boolean }) {
    const { page, limit, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = { departmentId };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } }
      ];
    }

    const total = await prisma.program.count({ where });

    const programs = await prisma.program.findMany({
      where,
      include: {
        students: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        programCourses: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit
    });

    return {
      success: true,
      data: {
        programs,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }
};
