import { PrismaClient } from '@prisma/client';
import { Program, CreateProgramRequest, UpdateProgramRequest, ProgramQuery, ProgramStats } from '../types/program';

const prisma = new PrismaClient();

export const programService = {
  // Get all programs with filtering and pagination
  async getPrograms(query: ProgramQuery) {
    const {
      page = 1,
      limit = 10,
      search = '',
      departmentId,
      facultyId,
      institutionId,
      type,
      level,
      isActive,
      sortBy = 'name',
      sortOrder = 'asc'
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

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

    // Get total count
    const total = await prisma.program.count({ where });

    // Get programs
    const programs = await prisma.program.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            facultyId: true,
            faculty: {
              select: {
                id: true,
                name: true,
                institutionId: true,
                institution: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            students: true,
            programCourses: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip,
      take: limit
    });

    return {
      success: true,
      programs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  // Get program by ID
  async getProgramById(id: number) {
    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            facultyId: true,
            faculty: {
              select: {
                id: true,
                name: true,
                institutionId: true,
                institution: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        students: {
          select: {
            id: true,
            studentId: true,
            level: true,
            semester: true,
            enrollmentStatus: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: {
            user: {
              lastName: 'asc'
            }
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
                isActive: true
              }
            }
          },
          orderBy: [
            { level: 'asc' },
            { semester: 'asc' },
            { course: { name: 'asc' } }
          ]
        },
        _count: {
          select: {
            students: true,
            programCourses: true
          }
        }
      }
    });

    return program;
  },

  // Create new program
  async createProgram(programData: CreateProgramRequest): Promise<Program> {
    const program = await prisma.program.create({
      data: programData,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            facultyId: true,
            faculty: {
              select: {
                id: true,
                name: true,
                institutionId: true
              }
            }
          }
        },
        _count: {
          select: {
            students: true,
            programCourses: true
          }
        }
      }
    });

    return program;
  },

  // Update program
  async updateProgram(id: number, updateData: UpdateProgramRequest): Promise<Program | null> {
    const program = await prisma.program.update({
      where: { id },
      data: updateData,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            facultyId: true,
            faculty: {
              select: {
                id: true,
                name: true,
                institutionId: true
              }
            }
          }
        },
        _count: {
          select: {
            students: true,
            programCourses: true
          }
        }
      }
    });

    return program;
  },

  // Delete program
  async deleteProgram(id: number): Promise<boolean> {
    try {
      await prisma.program.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting program:', error);
      return false;
    }
  },

  // Get programs by department
  async getProgramsByDepartment(departmentId: number) {
    const programs = await prisma.program.findMany({
      where: { departmentId },
      include: {
        _count: {
          select: {
            students: true,
            programCourses: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return programs;
  },

  // Get programs by faculty
  async getProgramsByFaculty(facultyId: number) {
    const programs = await prisma.program.findMany({
      where: {
        department: {
          facultyId: facultyId
        }
      },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            students: true,
            programCourses: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return programs;
  },

  // Get programs by institution
  async getProgramsByInstitution(institutionId: number) {
    const programs = await prisma.program.findMany({
      where: {
        department: {
          faculty: {
            institutionId: institutionId
          }
        }
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            facultyId: true,
            faculty: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            students: true,
            programCourses: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return programs;
  },

  // Get program statistics
  async getProgramStats(departmentId?: number, facultyId?: number, institutionId?: number): Promise<ProgramStats> {
    const where: any = {};

    if (departmentId) {
      where.departmentId = departmentId;
    } else if (facultyId) {
      where.department = {
        facultyId: facultyId
      };
    } else if (institutionId) {
      where.department = {
        faculty: {
          institutionId: institutionId
        }
      };
    }

    // Get total count
    const totalPrograms = await prisma.program.count({ where });

    // Get programs by type
    const programsByType = await prisma.program.groupBy({
      by: ['type'],
      where,
      _count: {
        id: true
      }
    });

    const byType = programsByType.reduce((acc, item) => {
      acc[item.type] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Get programs by level
    const programsByLevel = await prisma.program.groupBy({
      by: ['level'],
      where,
      _count: {
        id: true
      }
    });

    const byLevel = programsByLevel.reduce((acc, item) => {
      acc[item.level] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Get programs by department
    const programsByDepartment = await prisma.program.groupBy({
      by: ['departmentId'],
      where,
      _count: {
        id: true
      }
    });

    const departmentNames = await prisma.department.findMany({
      where: {
        id: {
          in: programsByDepartment.map(p => p.departmentId)
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    const byDepartment = programsByDepartment.reduce((acc, item) => {
      const department = departmentNames.find(d => d.id === item.departmentId);
      if (department) {
        acc[department.name] = item._count.id;
      }
      return acc;
    }, {} as Record<string, number>);

    // Get recent programs
    const recentPrograms = await prisma.program.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            facultyId: true,
            faculty: {
              select: {
                id: true,
                name: true,
                institutionId: true
              }
            }
          }
        },
        _count: {
          select: {
            students: true,
            programCourses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    return {
      totalPrograms,
      byType,
      byLevel,
      byDepartment,
      recentPrograms
    };
  }
};
