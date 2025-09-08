import { PrismaClient } from '@prisma/client';
import { CreateAcademicYearData, UpdateAcademicYearData, AcademicYearQueryParams, CreateSemesterData, UpdateSemesterData, SemesterQueryParams, AcademicPeriodStatsParams } from '../types/academicPeriod';

const prisma = new PrismaClient();

export const academicPeriodService = {
  // ========================================
  // ACADEMIC YEAR SERVICES
  // ========================================

  // Get all academic years with pagination and filtering
  async getAcademicYears(params: AcademicYearQueryParams) {
    const {
      institutionId,
      isCurrent,
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const skip = (page - 1) * limit;

    const where: any = {
      AND: [
        institutionId ? { institutionId } : {},
        isCurrent !== undefined ? { isCurrent } : {},
        search ? {
          yearCode: { contains: search, mode: 'insensitive' }
        } : {}
      ]
    };

    const [academicYears, total] = await Promise.all([
      prisma.academicYear.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          institution: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          semesters: {
            orderBy: { semesterNumber: 'asc' }
          }
        }
      }),
      prisma.academicYear.count({ where })
    ]);

    return {
      success: true,
      data: academicYears,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  // Get single academic year by ID
  async getAcademicYearById(id: number) {
    return await prisma.academicYear.findUnique({
      where: { id },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        semesters: {
          orderBy: { semesterNumber: 'asc' }
        }
      }
    });
  },

  // Get current academic year
  async getCurrentAcademicYear(institutionId?: number) {
    const where: any = { isCurrent: true };
    if (institutionId) {
      where.institutionId = institutionId;
    }

    return await prisma.academicYear.findFirst({
      where,
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        semesters: {
          orderBy: { semesterNumber: 'asc' }
        }
      }
    });
  },

  // Create new academic year
  async createAcademicYear(data: CreateAcademicYearData) {
    // If this is set as current, unset all other current academic years for the institution
    if (data.isCurrent) {
      await prisma.academicYear.updateMany({
        where: { institutionId: data.institutionId, isCurrent: true },
        data: { isCurrent: false }
      });
    }

    const academicYear = await prisma.academicYear.create({
      data,
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        semesters: {
          orderBy: { semesterNumber: 'asc' }
        }
      }
    });

    return academicYear;
  },

  // Update academic year
  async updateAcademicYear(id: number, data: UpdateAcademicYearData) {
    // Get the academic year first to check institution
    const academicYear = await prisma.academicYear.findUnique({
      where: { id }
    });

    if (!academicYear) {
      throw new Error('Academic year not found');
    }

    // If this is set as current, unset all other current academic years for the institution
    if (data.isCurrent) {
      await prisma.academicYear.updateMany({
        where: { 
          institutionId: academicYear.institutionId, 
          isCurrent: true,
          id: { not: id }
        },
        data: { isCurrent: false }
      });
    }

    return await prisma.academicYear.update({
      where: { id },
      data,
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        semesters: {
          orderBy: { semesterNumber: 'asc' }
        }
      }
    });
  },

  // Delete academic year
  async deleteAcademicYear(id: number) {
    return await prisma.academicYear.delete({
      where: { id }
    });
  },

  // Set current academic year
  async setCurrentAcademicYear(id: number) {
    // Get the academic year first to check institution
    const academicYear = await prisma.academicYear.findUnique({
      where: { id }
    });

    if (!academicYear) {
      throw new Error('Academic year not found');
    }

    // Unset all other current academic years for the institution
    await prisma.academicYear.updateMany({
      where: { 
        institutionId: academicYear.institutionId, 
        isCurrent: true 
      },
      data: { isCurrent: false }
    });

    // Set this as current
    return await prisma.academicYear.update({
      where: { id },
      data: { isCurrent: true },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        semesters: {
          orderBy: { semesterNumber: 'asc' }
        }
      }
    });
  },

  // ========================================
  // SEMESTER SERVICES
  // ========================================

  // Get all semesters with pagination and filtering
  async getSemesters(params: SemesterQueryParams) {
    const {
      academicYearId,
      isCurrent,
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'semesterNumber',
      sortOrder = 'asc'
    } = params;

    const skip = (page - 1) * limit;

    const where: any = {
      AND: [
        academicYearId ? { academicYearId } : {},
        isCurrent !== undefined ? { isCurrent } : {},
        search ? {
          name: { contains: search, mode: 'insensitive' }
        } : {}
      ]
    };

    const [semesters, total] = await Promise.all([
      prisma.semester.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          academicYear: {
            include: {
              institution: {
                select: {
                  id: true,
                  name: true,
                  code: true
                }
              }
            }
          }
        }
      }),
      prisma.semester.count({ where })
    ]);

    return {
      success: true,
      data: semesters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  // Get single semester by ID
  async getSemesterById(id: number) {
    return await prisma.semester.findUnique({
      where: { id },
      include: {
        academicYear: {
          include: {
            institution: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }
      }
    });
  },

  // Get current semester
  async getCurrentSemester(academicYearId?: number) {
    const where: any = { isCurrent: true };
    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    return await prisma.semester.findFirst({
      where,
      include: {
        academicYear: {
          include: {
            institution: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }
      }
    });
  },

  // Create new semester
  async createSemester(data: CreateSemesterData) {
    // Check for duplicate semester in the same academic year
    const existing = await prisma.semester.findFirst({
      where: {
        academicYearId: data.academicYearId,
        semesterNumber: data.semesterNumber
      }
    });

    if (existing) {
      throw new Error('Semester already exists for this academic year');
    }

    // If this is set as current, unset all other current semesters for the academic year
    if (data.isCurrent) {
      await prisma.semester.updateMany({
        where: { academicYearId: data.academicYearId, isCurrent: true },
        data: { isCurrent: false }
      });
    }

    const semester = await prisma.semester.create({
      data,
      include: {
        academicYear: {
          include: {
            institution: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }
      }
    });

    return semester;
  },

  // Update semester
  async updateSemester(id: number, data: UpdateSemesterData) {
    // Get the semester first to check academic year
    const semester = await prisma.semester.findUnique({
      where: { id }
    });

    if (!semester) {
      throw new Error('Semester not found');
    }

    // If this is set as current, unset all other current semesters for the academic year
    if (data.isCurrent) {
      await prisma.semester.updateMany({
        where: { 
          academicYearId: semester.academicYearId, 
          isCurrent: true,
          id: { not: id }
        },
        data: { isCurrent: false }
      });
    }

    return await prisma.semester.update({
      where: { id },
      data,
      include: {
        academicYear: {
          include: {
            institution: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }
      }
    });
  },

  // Delete semester
  async deleteSemester(id: number) {
    return await prisma.semester.delete({
      where: { id }
    });
  },

  // Set current semester
  async setCurrentSemester(id: number) {
    // Get the semester first to check academic year
    const semester = await prisma.semester.findUnique({
      where: { id }
    });

    if (!semester) {
      throw new Error('Semester not found');
    }

    // Unset all other current semesters for the academic year
    await prisma.semester.updateMany({
      where: { 
        academicYearId: semester.academicYearId, 
        isCurrent: true 
      },
      data: { isCurrent: false }
    });

    // Set this as current
    return await prisma.semester.update({
      where: { id },
      data: { isCurrent: true },
      include: {
        academicYear: {
          include: {
            institution: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }
      }
    });
  },

  // Get academic period statistics
  async getAcademicPeriodStats(params: AcademicPeriodStatsParams) {
    const { institutionId } = params;

    const baseWhere: any = {};
    if (institutionId) {
      baseWhere.institutionId = institutionId;
    }

    const [
      totalAcademicYears,
      currentAcademicYear,
      totalSemesters,
      currentSemester
    ] = await Promise.all([
      // Total academic years
      prisma.academicYear.count({ where: baseWhere }),
      
      // Current academic year
      prisma.academicYear.findFirst({
        where: { ...baseWhere, isCurrent: true },
        include: {
          institution: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      }),
      
      // Total semesters
      prisma.semester.count({
        where: institutionId ? {
          academicYear: { institutionId }
        } : {}
      }),
      
      // Current semester
      prisma.semester.findFirst({
        where: {
          isCurrent: true,
          ...(institutionId ? {
            academicYear: { institutionId }
          } : {})
        },
        include: {
          academicYear: {
            include: {
              institution: {
                select: {
                  id: true,
                  name: true,
                  code: true
                }
              }
            }
          }
        }
      })
    ]);

    return {
      overview: {
        totalAcademicYears,
        totalSemesters
      },
      current: {
        academicYear: currentAcademicYear,
        semester: currentSemester
      }
    };
  }
};
