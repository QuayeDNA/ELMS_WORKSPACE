import { PrismaClient } from '@prisma/client';
import { CreateInstructorData, UpdateInstructorData, InstructorQueryParams, InstructorStatsParams } from '../types/instructor';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const instructorService = {
  // Get all instructors with pagination and filtering
  async getInstructors(params: InstructorQueryParams) {
    const {
      departmentId,
      facultyId,
      institutionId,
      academicRank,
      employmentType,
      employmentStatus,
      specialization,
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const skip = (page - 1) * limit;

    const where: any = {
      AND: [
        academicRank ? { academicRank } : {},
        employmentType ? { employmentType } : {},
        employmentStatus ? { employmentStatus } : {},
        specialization ? { specialization: { contains: specialization, mode: 'insensitive' } } : {},
        search ? {
          OR: [
            { staffId: { contains: search, mode: 'insensitive' } },
            { specialization: { contains: search, mode: 'insensitive' } },
            { user: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
              ]
            }}
          ]
        } : {},
        // Filter by institutional hierarchy through user relationships
        departmentId ? {
          user: { departmentId }
        } : {},
        facultyId ? {
          user: { facultyId }
        } : {},
        institutionId ? {
          user: { institutionId }
        } : {}
      ]
    };

    const [instructors, total] = await Promise.all([
      prisma.lecturerProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              middleName: true,
              title: true,
              phone: true,
              gender: true,
              status: true,
              createdAt: true,
              departmentId: true,
              facultyId: true,
              institutionId: true,
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
          }
        }
      }),
      prisma.lecturerProfile.count({ where })
    ]);

    return {
      success: true,
      data: instructors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  // Get single instructor by ID
  async getInstructorById(id: number) {
    return await prisma.lecturerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            middleName: true,
            title: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            nationality: true,
            address: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            departmentId: true,
            facultyId: true,
            institutionId: true,
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
        }
      }
    });
  },

  // Get instructor by staff ID
  async getInstructorByStaffId(staffId: string) {
    return await prisma.lecturerProfile.findUnique({
      where: { staffId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            middleName: true,
            title: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            nationality: true,
            address: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            departmentId: true,
            facultyId: true,
            institutionId: true,
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
        }
      }
    });
  },

  // Create new instructor
  async createInstructor(data: CreateInstructorData) {
    const { user: userData, profile: profileData } = data;

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    return await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          role: 'LECTURER'
        }
      });

      // Create lecturer profile
      const lecturerProfile = await tx.lecturerProfile.create({
        data: {
          userId: user.id,
          permissions: {}, // Required JSON field - empty object for now
          ...profileData
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              middleName: true,
              title: true,
              phone: true,
              gender: true,
              status: true,
              createdAt: true,
              departmentId: true,
              facultyId: true,
              institutionId: true,
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
          }
        }
      });

      return lecturerProfile;
    });
  },

  // Update instructor
  async updateInstructor(id: number, data: UpdateInstructorData) {
    const { user: userData, profile: profileData } = data;

    return await prisma.$transaction(async (tx) => {
      // Get lecturer profile first
      const lecturerProfile = await tx.lecturerProfile.findUnique({
        where: { id },
        include: { user: true }
      });

      if (!lecturerProfile) {
        throw new Error('Instructor not found');
      }

      // Update user if user data provided
      if (userData) {
        await tx.user.update({
          where: { id: lecturerProfile.userId },
          data: userData
        });
      }

      // Update lecturer profile if profile data provided
      if (profileData) {
        await tx.lecturerProfile.update({
          where: { id },
          data: profileData
        });
      }

      // Return updated profile with user data
      return await tx.lecturerProfile.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              middleName: true,
              title: true,
              phone: true,
              gender: true,
              status: true,
              createdAt: true,
              departmentId: true,
              facultyId: true,
              institutionId: true,
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
          }
        }
      });
    });
  },

  // Delete instructor
  async deleteInstructor(id: number) {
    return await prisma.$transaction(async (tx) => {
      // Get lecturer profile first
      const lecturerProfile = await tx.lecturerProfile.findUnique({
        where: { id }
      });

      if (!lecturerProfile) {
        throw new Error('Instructor not found');
      }

      // Delete lecturer profile (this will cascade delete the user)
      await tx.lecturerProfile.delete({
        where: { id }
      });

      // Delete associated user
      await tx.user.delete({
        where: { id: lecturerProfile.userId }
      });
    });
  },

  // Update instructor status
  async updateInstructorStatus(id: number, employmentStatus: any) {
    return await prisma.lecturerProfile.update({
      where: { id },
      data: { employmentStatus },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            middleName: true,
            title: true,
            phone: true,
            gender: true,
            status: true,
            createdAt: true,
            departmentId: true,
            facultyId: true,
            institutionId: true,
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
        }
      }
    });
  },

  // Assign instructor to department (simplified - via user relationship)
  async assignToDepartment(instructorId: number, departmentId: number, isPrimary: boolean = false) {
    // Get the instructor first
    const instructor = await prisma.lecturerProfile.findUnique({
      where: { id: instructorId },
      include: { user: true }
    });

    if (!instructor) {
      throw new Error('Instructor not found');
    }

    // Update user's department
    await prisma.user.update({
      where: { id: instructor.userId },
      data: { departmentId }
    });

    return { success: true, message: 'Instructor assigned to department' };
  },

  // Remove instructor from department
  async removeFromDepartment(instructorId: number, departmentId: number) {
    // Get the instructor first
    const instructor = await prisma.lecturerProfile.findUnique({
      where: { id: instructorId },
      include: { user: true }
    });

    if (!instructor) {
      throw new Error('Instructor not found');
    }

    // Remove department assignment
    await prisma.user.update({
      where: { id: instructor.userId },
      data: { departmentId: null }
    });
  },

  // Bulk import instructors
  async bulkImportInstructors(instructorsData: CreateInstructorData[]) {
    const results = {
      successful: [] as any[],
      failed: [] as any[]
    };

    for (const instructorData of instructorsData) {
      try {
        const instructor = await this.createInstructor(instructorData);
        results.successful.push(instructor);
      } catch (error) {
        results.failed.push({
          data: instructorData,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  },

  // Get instructor statistics
  async getInstructorStats(params: InstructorStatsParams) {
    const { institutionId, facultyId, departmentId } = params;

    const baseWhere: any = {};
    
    if (departmentId) {
      baseWhere.user = { departmentId };
    } else if (facultyId) {
      baseWhere.user = { facultyId };
    } else if (institutionId) {
      baseWhere.user = { institutionId };
    }

    const [
      totalInstructors,
      activeInstructors,
      onLeaveInstructors,
      retiredInstructors,
      instructorsByRank,
      instructorsByEmploymentType
    ] = await Promise.all([
      // Total instructors
      prisma.lecturerProfile.count({ where: baseWhere }),
      
      // Active instructors
      prisma.lecturerProfile.count({
        where: { ...baseWhere, employmentStatus: 'ACTIVE' }
      }),
      
      // On leave instructors
      prisma.lecturerProfile.count({
        where: { ...baseWhere, employmentStatus: 'ON_LEAVE' }
      }),
      
      // Retired instructors
      prisma.lecturerProfile.count({
        where: { ...baseWhere, employmentStatus: 'RETIRED' }
      }),
      
      // Instructors by academic rank
      prisma.lecturerProfile.groupBy({
        by: ['academicRank'],
        where: baseWhere,
        _count: true
      }),
      
      // Instructors by employment type
      prisma.lecturerProfile.groupBy({
        by: ['employmentType'],
        where: baseWhere,
        _count: true
      })
    ]);

    return {
      overview: {
        total: totalInstructors,
        active: activeInstructors,
        onLeave: onLeaveInstructors,
        retired: retiredInstructors
      },
      byAcademicRank: instructorsByRank,
      byEmploymentType: instructorsByEmploymentType
    };
  }
};
