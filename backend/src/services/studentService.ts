import { PrismaClient } from '@prisma/client';
import { CreateStudentData, UpdateStudentData, StudentQueryParams, StudentStatsParams } from '../types/student';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const studentService = {
  // Get all students with pagination and filtering
  async getStudents(params: StudentQueryParams) {
    const {
      programId,
      departmentId,
      facultyId,
      institutionId,
      level,
      semester,
      academicYear,
      enrollmentStatus,
      academicStatus,
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const skip = (page - 1) * limit;

    const where: any = {
      AND: [
        programId ? { programId } : {},
        level ? { level } : {},
        semester ? { semester } : {},
        academicYear ? { academicYear } : {},
        enrollmentStatus ? { enrollmentStatus } : {},
        academicStatus ? { academicStatus } : {},
        search ? {
          OR: [
            { studentId: { contains: search, mode: 'insensitive' } },
            { indexNumber: { contains: search, mode: 'insensitive' } },
            { user: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
              ]
            }}
          ]
        } : {},
        // Filter by institutional hierarchy
        departmentId ? {
          program: { departmentId }
        } : {},
        facultyId ? {
          program: { department: { facultyId } }
        } : {},
        institutionId ? {
          program: { department: { faculty: { institutionId } } }
        } : {}
      ]
    };

    const [students, total] = await Promise.all([
      prisma.studentProfile.findMany({
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
              createdAt: true
            }
          },
          program: {
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
          }
        }
      }),
      prisma.studentProfile.count({ where })
    ]);

    return {
      success: true,
      data: students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  // Get single student by ID
  async getStudentById(id: number) {
    return await prisma.studentProfile.findUnique({
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
            updatedAt: true
          }
        },
        program: {
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
        }
      }
    });
  },

  // Get student by student ID
  async getStudentByStudentId(studentId: string) {
    return await prisma.studentProfile.findUnique({
      where: { studentId },
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
            updatedAt: true
          }
        },
        program: {
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
        }
      }
    });
  },

  // Create new student
  async createStudent(data: CreateStudentData) {
    const { user: userData, profile: profileData } = data;

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    return await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          role: 'STUDENT'
        }
      });

      // Create student profile
      const studentProfile = await tx.studentProfile.create({
        data: {
          userId: user.id,
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
              createdAt: true
            }
          },
          program: {
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
          }
        }
      });

      return studentProfile;
    });
  },

  // Update student
  async updateStudent(id: number, data: UpdateStudentData) {
    const { user: userData, profile: profileData } = data;

    return await prisma.$transaction(async (tx) => {
      // Get student profile first
      const studentProfile = await tx.studentProfile.findUnique({
        where: { id },
        include: { user: true }
      });

      if (!studentProfile) {
        throw new Error('Student not found');
      }

      // Update user if user data provided
      if (userData) {
        await tx.user.update({
          where: { id: studentProfile.userId },
          data: userData
        });
      }

      // Update student profile if profile data provided
      if (profileData) {
        await tx.studentProfile.update({
          where: { id },
          data: profileData
        });
      }

      // Return updated profile with user data
      return await tx.studentProfile.findUnique({
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
              createdAt: true
            }
          },
          program: {
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
          }
        }
      });
    });
  },

  // Delete student
  async deleteStudent(id: number) {
    return await prisma.$transaction(async (tx) => {
      // Get student profile first
      const studentProfile = await tx.studentProfile.findUnique({
        where: { id }
      });

      if (!studentProfile) {
        throw new Error('Student not found');
      }

      // Delete student profile (this will cascade delete the user)
      await tx.studentProfile.delete({
        where: { id }
      });

      // Delete associated user
      await tx.user.delete({
        where: { id: studentProfile.userId }
      });
    });
  },

  // Update student status
  async updateStudentStatus(id: number, statusData: { 
    enrollmentStatus?: any, 
    academicStatus?: any 
  }) {
    return await prisma.studentProfile.update({
      where: { id },
      data: statusData,
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
            createdAt: true
          }
        },
        program: {
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
        }
      }
    });
  },

  // Bulk import students
  async bulkImportStudents(studentsData: CreateStudentData[]) {
    const results = {
      successful: [] as any[],
      failed: [] as any[]
    };

    for (const studentData of studentsData) {
      try {
        const student = await this.createStudent(studentData);
        results.successful.push(student);
      } catch (error) {
        results.failed.push({
          data: studentData,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  },

  // Get student statistics
  async getStudentStats(params: StudentStatsParams) {
    const { institutionId, facultyId, departmentId } = params;

    const baseWhere: any = {};
    
    if (departmentId) {
      baseWhere.program = { departmentId };
    } else if (facultyId) {
      baseWhere.program = { department: { facultyId } };
    } else if (institutionId) {
      baseWhere.program = { department: { faculty: { institutionId } } };
    }

    const [
      totalStudents,
      activeStudents,
      graduatedStudents,
      suspendedStudents,
      enrollmentsByStatus,
      studentsByLevel,
      studentsByProgram
    ] = await Promise.all([
      // Total students
      prisma.studentProfile.count({ where: baseWhere }),
      
      // Active students
      prisma.studentProfile.count({
        where: { ...baseWhere, enrollmentStatus: 'ACTIVE' }
      }),
      
      // Graduated students
      prisma.studentProfile.count({
        where: { ...baseWhere, enrollmentStatus: 'GRADUATED' }
      }),
      
      // Suspended students
      prisma.studentProfile.count({
        where: { ...baseWhere, enrollmentStatus: 'SUSPENDED' }
      }),
      
      // Students by enrollment status
      prisma.studentProfile.groupBy({
        by: ['enrollmentStatus'],
        where: baseWhere,
        _count: true
      }),
      
      // Students by level
      prisma.studentProfile.groupBy({
        by: ['level'],
        where: baseWhere,
        _count: true
      }),
      
      // Students by program
      prisma.studentProfile.groupBy({
        by: ['programId'],
        where: baseWhere,
        _count: true
      })
    ]);

    return {
      overview: {
        total: totalStudents,
        active: activeStudents,
        graduated: graduatedStudents,
        suspended: suspendedStudents
      },
      byEnrollmentStatus: enrollmentsByStatus,
      byLevel: studentsByLevel,
      byProgram: studentsByProgram
    };
  }
};
