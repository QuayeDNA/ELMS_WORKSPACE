import { PrismaClient } from '@prisma/client';
import { Course, CreateCourseRequest, UpdateCourseRequest, CourseQuery, CourseStats, ProgramCourse, CreateProgramCourseRequest, UpdateProgramCourseRequest } from '../types/course';

const prisma = new PrismaClient();

export const courseService = {
  // Get all courses with filtering and pagination
  async getCourses(query: CourseQuery) {
    const {
      page = 1,
      limit = 10,
      search = '',
      departmentId,
      facultyId,
      institutionId,
      level,
      courseType,
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

    if (level) {
      where.level = level;
    }

    if (courseType) {
      where.courseType = courseType;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Get total count
    const total = await prisma.course.count({ where });

    // Get courses
    const courses = await prisma.course.findMany({
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
            exams: true,
            programCourses: true,
            courseOfferings: true
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
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  // Get course by ID
  async getCourseById(id: number) {
    const course = await prisma.course.findUnique({
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
        programCourses: {
          include: {
            program: {
              select: {
                id: true,
                name: true,
                code: true,
                type: true,
                level: true
              }
            }
          },
          orderBy: [
            { level: 'asc' },
            { semester: 'asc' }
          ]
        },
        exams: {
          select: {
            id: true,
            title: true,
            examDate: true,
            duration: true,
            status: true
          },
          orderBy: {
            examDate: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            exams: true,
            programCourses: true,
            courseOfferings: true
          }
        }
      }
    });

    // Parse prerequisite and corequisite JSON strings
    if (course) {
      return {
        ...course,
        prerequisites: course.prerequisites ? JSON.parse(course.prerequisites) : [],
        corequisites: course.corequisites ? JSON.parse(course.corequisites) : []
      };
    }

    return course;
  },

  // Create new course
  async createCourse(courseData: CreateCourseRequest): Promise<Course> {
    // Convert arrays to JSON strings
    const prerequisites = courseData.prerequisites ? JSON.stringify(courseData.prerequisites) : null;
    const corequisites = courseData.corequisites ? JSON.stringify(courseData.corequisites) : null;

    const course = await prisma.course.create({
      data: {
        ...courseData,
        prerequisites,
        corequisites
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
                name: true,
                institutionId: true
              }
            }
          }
        },
        _count: {
          select: {
            exams: true,
            programCourses: true,
            courseOfferings: true
          }
        }
      }
    });

    return course;
  },

  // Update course
  async updateCourse(id: number, updateData: UpdateCourseRequest): Promise<Course | null> {
    // Convert arrays to JSON strings if provided
    const dataToUpdate: any = { ...updateData };
    
    if (updateData.prerequisites !== undefined) {
      dataToUpdate.prerequisites = updateData.prerequisites ? JSON.stringify(updateData.prerequisites) : null;
    }
    
    if (updateData.corequisites !== undefined) {
      dataToUpdate.corequisites = updateData.corequisites ? JSON.stringify(updateData.corequisites) : null;
    }

    const course = await prisma.course.update({
      where: { id },
      data: dataToUpdate,
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
            exams: true,
            programCourses: true,
            courseOfferings: true
          }
        }
      }
    });

    return course;
  },

  // Delete course
  async deleteCourse(id: number): Promise<boolean> {
    try {
      await prisma.course.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting course:', error);
      return false;
    }
  },

  // Get courses by department
  async getCoursesByDepartment(departmentId: number) {
    const courses = await prisma.course.findMany({
      where: { departmentId },
      include: {
        _count: {
          select: {
            exams: true,
            programCourses: true,
            courseOfferings: true
          }
        }
      },
      orderBy: [
        { level: 'asc' },
        { name: 'asc' }
      ]
    });

    return courses;
  },

  // Get courses by faculty
  async getCoursesByFaculty(facultyId: number) {
    const courses = await prisma.course.findMany({
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
            exams: true,
            programCourses: true,
            courseOfferings: true
          }
        }
      },
      orderBy: [
        { level: 'asc' },
        { name: 'asc' }
      ]
    });

    return courses;
  },

  // Get courses by institution
  async getCoursesByInstitution(institutionId: number) {
    const courses = await prisma.course.findMany({
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
            exams: true,
            programCourses: true,
            courseOfferings: true
          }
        }
      },
      orderBy: [
        { level: 'asc' },
        { name: 'asc' }
      ]
    });

    return courses;
  },

  // Get course statistics
  async getCourseStats(departmentId?: number, facultyId?: number, institutionId?: number): Promise<CourseStats> {
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
    const totalCourses = await prisma.course.count({ where });

    // Get courses by level
    const coursesByLevel = await prisma.course.groupBy({
      by: ['level'],
      where,
      _count: {
        id: true
      }
    });

    const byLevel = coursesByLevel.reduce((acc, item) => {
      acc[`Level ${item.level}`] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Get courses by type
    const coursesByType = await prisma.course.groupBy({
      by: ['courseType'],
      where,
      _count: {
        id: true
      }
    });

    const byType = coursesByType.reduce((acc, item) => {
      acc[item.courseType] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Get courses by department
    const coursesByDepartment = await prisma.course.groupBy({
      by: ['departmentId'],
      where,
      _count: {
        id: true
      }
    });

    const departmentNames = await prisma.department.findMany({
      where: {
        id: {
          in: coursesByDepartment.map(c => c.departmentId)
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    const byDepartment = coursesByDepartment.reduce((acc, item) => {
      const department = departmentNames.find(d => d.id === item.departmentId);
      if (department) {
        acc[department.name] = item._count.id;
      }
      return acc;
    }, {} as Record<string, number>);

    // Get average credit hours
    const avgResult = await prisma.course.aggregate({
      where,
      _avg: {
        creditHours: true
      }
    });

    const averageCreditHours = Math.round((avgResult._avg.creditHours || 0) * 10) / 10;

    // Get recent courses
    const recentCourses = await prisma.course.findMany({
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
            exams: true,
            programCourses: true,
            courseOfferings: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    return {
      totalCourses,
      byLevel,
      byType,
      byDepartment,
      averageCreditHours,
      recentCourses
    };
  },

  // Program-Course relationship management
  async addCourseToProgram(data: CreateProgramCourseRequest): Promise<ProgramCourse> {
    const programCourse = await prisma.programCourse.create({
      data,
      include: {
        program: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        course: true
      }
    });

    return programCourse;
  },

  async updateProgramCourse(id: number, data: UpdateProgramCourseRequest): Promise<ProgramCourse | null> {
    const programCourse = await prisma.programCourse.update({
      where: { id },
      data,
      include: {
        program: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        course: true
      }
    });

    return programCourse;
  },

  async removeCourseFromProgram(id: number): Promise<boolean> {
    try {
      await prisma.programCourse.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error removing course from program:', error);
      return false;
    }
  },

  async getProgramCourses(programId: number) {
    const programCourses = await prisma.programCourse.findMany({
      where: { programId },
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
    });

    return programCourses;
  }
};
