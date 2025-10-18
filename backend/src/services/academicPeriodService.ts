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
  },

  // ========================================
  // ACADEMIC PERIOD SERVICES (NEW)
  // ========================================

  /**
   * Create a new academic period for a semester
   */
  async createAcademicPeriod(data: any) {
    // Validate the semester exists
    const semester = await prisma.semester.findUnique({
      where: { id: data.semesterId },
      include: {
        academicYear: {
          include: {
            institution: true
          }
        }
      }
    });

    if (!semester) {
      throw new Error(`Semester with ID ${data.semesterId} not found`);
    }

    // Check if academic period already exists for this semester
    const existingPeriod = await prisma.academicPeriod.findUnique({
      where: { semesterId: data.semesterId }
    });

    if (existingPeriod) {
      throw new Error(`Academic period already exists for semester ${data.semesterId}`);
    }

    // Create the academic period
    const academicPeriod = await prisma.academicPeriod.create({
      data: {
        semesterId: data.semesterId,
        registrationStartDate: new Date(data.registrationStartDate),
        registrationEndDate: new Date(data.registrationEndDate),
        addDropStartDate: data.addDropStartDate ? new Date(data.addDropStartDate) : null,
        addDropEndDate: data.addDropEndDate ? new Date(data.addDropEndDate) : null,
        lectureStartDate: new Date(data.lectureStartDate),
        lectureEndDate: new Date(data.lectureEndDate),
        examStartDate: new Date(data.examStartDate),
        examEndDate: new Date(data.examEndDate),
        resultsReleaseDate: data.resultsReleaseDate ? new Date(data.resultsReleaseDate) : null,
        maxCreditsPerStudent: data.maxCreditsPerStudent || 24,
        minCreditsPerStudent: data.minCreditsPerStudent || 12,
        lateRegistrationFee: data.lateRegistrationFee,
        isActive: data.isActive !== undefined ? data.isActive : true,
        isRegistrationOpen: data.isRegistrationOpen || false,
        isAddDropOpen: data.isAddDropOpen || false,
        notes: data.notes,
        createdBy: data.createdBy
      },
      include: {
        semester: {
          include: {
            academicYear: true
          }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return academicPeriod;
  },

  /**
   * Get academic period by ID
   */
  async getAcademicPeriodById(id: number) {
    return await prisma.academicPeriod.findUnique({
      where: { id },
      include: {
        semester: {
          include: {
            academicYear: true
          }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
  },

  /**
   * Get academic period by semester ID
   */
  async getAcademicPeriodBySemester(semesterId: number) {
    return await prisma.academicPeriod.findUnique({
      where: { semesterId },
      include: {
        semester: {
          include: {
            academicYear: true
          }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
  },

  /**
   * Get all academic periods with optional filters
   */
  async getAcademicPeriods(filters: any = {}) {
    const where: any = {};

    if (filters.semesterId) {
      where.semesterId = filters.semesterId;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.isRegistrationOpen !== undefined) {
      where.isRegistrationOpen = filters.isRegistrationOpen;
    }

    if (filters.isAddDropOpen !== undefined) {
      where.isAddDropOpen = filters.isAddDropOpen;
    }

    if (filters.academicYearId) {
      where.semester = {
        academicYearId: filters.academicYearId
      };
    }

    if (filters.institutionId) {
      where.semester = {
        academicYear: {
          institutionId: filters.institutionId
        }
      };
    }

    return await prisma.academicPeriod.findMany({
      where,
      include: {
        semester: {
          include: {
            academicYear: true
          }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  /**
   * Get current active academic period
   */
  async getCurrentAcademicPeriod(institutionId?: number) {
    const where: any = {
      isActive: true
    };

    if (institutionId) {
      where.semester = {
        academicYear: {
          institutionId
        }
      };
    }

    return await prisma.academicPeriod.findFirst({
      where,
      include: {
        semester: {
          include: {
            academicYear: true
          }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        registrationStartDate: 'desc'
      }
    });
  },

  /**
   * Update academic period
   */
  async updateAcademicPeriod(id: number, data: any) {
    const existingPeriod = await this.getAcademicPeriodById(id);
    if (!existingPeriod) {
      throw new Error(`Academic period with ID ${id} not found`);
    }

    const updateData: any = {};

    if (data.registrationStartDate) updateData.registrationStartDate = new Date(data.registrationStartDate);
    if (data.registrationEndDate) updateData.registrationEndDate = new Date(data.registrationEndDate);
    if (data.addDropStartDate !== undefined) {
      updateData.addDropStartDate = data.addDropStartDate ? new Date(data.addDropStartDate) : null;
    }
    if (data.addDropEndDate !== undefined) {
      updateData.addDropEndDate = data.addDropEndDate ? new Date(data.addDropEndDate) : null;
    }
    if (data.lectureStartDate) updateData.lectureStartDate = new Date(data.lectureStartDate);
    if (data.lectureEndDate) updateData.lectureEndDate = new Date(data.lectureEndDate);
    if (data.examStartDate) updateData.examStartDate = new Date(data.examStartDate);
    if (data.examEndDate) updateData.examEndDate = new Date(data.examEndDate);
    if (data.resultsReleaseDate !== undefined) {
      updateData.resultsReleaseDate = data.resultsReleaseDate ? new Date(data.resultsReleaseDate) : null;
    }
    if (data.maxCreditsPerStudent !== undefined) updateData.maxCreditsPerStudent = data.maxCreditsPerStudent;
    if (data.minCreditsPerStudent !== undefined) updateData.minCreditsPerStudent = data.minCreditsPerStudent;
    if (data.lateRegistrationFee !== undefined) updateData.lateRegistrationFee = data.lateRegistrationFee;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isRegistrationOpen !== undefined) updateData.isRegistrationOpen = data.isRegistrationOpen;
    if (data.isAddDropOpen !== undefined) updateData.isAddDropOpen = data.isAddDropOpen;
    if (data.notes !== undefined) updateData.notes = data.notes;

    return await prisma.academicPeriod.update({
      where: { id },
      data: updateData,
      include: {
        semester: {
          include: {
            academicYear: true
          }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
  },

  /**
   * Delete academic period
   */
  async deleteAcademicPeriod(id: number) {
    const existingPeriod = await this.getAcademicPeriodById(id);
    if (!existingPeriod) {
      throw new Error(`Academic period with ID ${id} not found`);
    }

    return await prisma.academicPeriod.delete({
      where: { id }
    });
  },

  /**
   * Open registration for a period
   */
  async openRegistration(id: number) {
    const period = await this.getAcademicPeriodById(id);
    if (!period) {
      throw new Error(`Academic period with ID ${id} not found`);
    }

    const now = new Date();
    const registrationStart = new Date(period.registrationStartDate);
    const registrationEnd = new Date(period.registrationEndDate);

    if (now < registrationStart) {
      throw new Error('Cannot open registration before the start date');
    }

    if (now > registrationEnd) {
      throw new Error('Cannot open registration after the end date');
    }

    return await this.updateAcademicPeriod(id, { isRegistrationOpen: true });
  },

  /**
   * Close registration for a period
   */
  async closeRegistration(id: number) {
    return await this.updateAcademicPeriod(id, { isRegistrationOpen: false });
  },

  /**
   * Open add/drop for a period
   */
  async openAddDrop(id: number) {
    const period = await this.getAcademicPeriodById(id);
    if (!period) {
      throw new Error(`Academic period with ID ${id} not found`);
    }

    if (!period.addDropStartDate || !period.addDropEndDate) {
      throw new Error('Add/Drop period dates not configured');
    }

    const now = new Date();
    const addDropStart = new Date(period.addDropStartDate);
    const addDropEnd = new Date(period.addDropEndDate);

    if (now < addDropStart) {
      throw new Error('Cannot open add/drop before the start date');
    }

    if (now > addDropEnd) {
      throw new Error('Cannot open add/drop after the end date');
    }

    return await this.updateAcademicPeriod(id, { isAddDropOpen: true });
  },

  /**
   * Close add/drop for a period
   */
  async closeAddDrop(id: number) {
    return await this.updateAcademicPeriod(id, { isAddDropOpen: false });
  },

  /**
   * Get the current status of an academic period
   */
  async getAcademicPeriodStatus(id: number) {
    const period = await this.getAcademicPeriodById(id);
    if (!period) {
      throw new Error(`Academic period with ID ${id} not found`);
    }

    const now = new Date();
    const registrationStart = new Date(period.registrationStartDate);
    const registrationEnd = new Date(period.registrationEndDate);
    const addDropStart = period.addDropStartDate ? new Date(period.addDropStartDate) : null;
    const addDropEnd = period.addDropEndDate ? new Date(period.addDropEndDate) : null;
    const lectureStart = new Date(period.lectureStartDate);
    const lectureEnd = new Date(period.lectureEndDate);
    const examStart = new Date(period.examStartDate);
    const examEnd = new Date(period.examEndDate);

    let currentPhase = 'before_registration';

    if (now >= examStart && now <= examEnd) {
      currentPhase = 'exams';
    } else if (now > examEnd) {
      currentPhase = 'completed';
    } else if (now >= lectureStart && now <= lectureEnd) {
      currentPhase = 'lectures';
    } else if (addDropStart && addDropEnd && now >= addDropStart && now <= addDropEnd) {
      currentPhase = 'add_drop';
    } else if (now >= registrationStart && now <= registrationEnd) {
      currentPhase = 'registration';
    }

    const daysUntilRegistration = now < registrationStart
      ? Math.ceil((registrationStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const daysUntilExams = now < examStart
      ? Math.ceil((examStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      id: period.id,
      semesterId: period.semesterId,
      currentPhase,
      isRegistrationOpen: period.isRegistrationOpen,
      isAddDropOpen: period.isAddDropOpen,
      isExamPeriod: currentPhase === 'exams',
      daysUntilRegistration,
      daysUntilExams
    };
  }
};
