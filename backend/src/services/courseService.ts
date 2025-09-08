import { PrismaClient, CourseType } from '@prisma/client';
import { Course, CreateCourseData, UpdateCourseData, CourseQuery, CourseByProgramQuery } from '../types/course';

const prisma = new PrismaClient();

export const courseService = {
  // Get all courses with pagination and filtering
  async getCourses(query: CourseQuery) {
    const {
      departmentId,
      facultyId,
      institutionId,
      level,
      courseType,
      isActive,
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

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

    if (level !== undefined) {
      where.level = level;
    }

    if (courseType) {
      where.courseType = courseType;
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

    // Get total count
    const total = await prisma.course.count({ where });

    // Get courses with relations
    const courses = await prisma.course.findMany({
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
        _count: {
          select: {
            courseOfferings: true,
            programCourses: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder
      }
    });

    return {
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  // Get single course by ID
  async getCourseById(id: number): Promise<Course | null> {
    const course = await prisma.course.findUnique({
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
        courseOfferings: {
          include: {
            enrollments: {
              include: {
                student: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            courseOfferings: true,
            programCourses: true
          }
        }
      }
    });

    return course;
  },

  // Create new course
  async createCourse(data: CreateCourseData): Promise<Course> {
    // Check if course code already exists
    const existingCourse = await prisma.course.findUnique({
      where: { code: data.code }
    });

    if (existingCourse) {
      throw new Error(`Course with code '${data.code}' already exists`);
    }

    // Verify department exists
    const department = await prisma.department.findUnique({
      where: { id: data.departmentId }
    });

    if (!department) {
      throw new Error('Department not found');
    }

    const course = await prisma.course.create({
      data: {
        name: data.name,
        code: data.code,
        departmentId: data.departmentId,
        level: data.level,
        courseType: data.courseType,
        creditHours: data.creditHours,
        contactHours: data.contactHours,
        description: data.description,
        learningOutcomes: data.learningOutcomes,
        syllabus: data.syllabus,
        assessmentMethods: data.assessmentMethods,
        prerequisites: data.prerequisites,
        corequisites: data.corequisites,
        recommendedBooks: data.recommendedBooks,
        isActive: data.isActive
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

    return course;
  },

  // Update course
  async updateCourse(id: number, data: UpdateCourseData): Promise<Course | null> {
    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id }
    });

    if (!existingCourse) {
      return null;
    }

    // Check if new code conflicts with another course
    if (data.code && data.code !== existingCourse.code) {
      const codeConflict = await prisma.course.findUnique({
        where: { code: data.code }
      });

      if (codeConflict) {
        throw new Error(`Course with code '${data.code}' already exists`);
      }
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code,
        level: data.level,
        courseType: data.courseType,
        creditHours: data.creditHours,
        contactHours: data.contactHours,
        description: data.description,
        learningOutcomes: data.learningOutcomes,
        syllabus: data.syllabus,
        assessmentMethods: data.assessmentMethods,
        prerequisites: data.prerequisites,
        corequisites: data.corequisites,
        recommendedBooks: data.recommendedBooks,
        isActive: data.isActive
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

    return course;
  },

  // Delete course
  async deleteCourse(id: number): Promise<boolean> {
    try {
      // Check if course has enrollments through course offerings
      const enrollmentCount = await prisma.enrollment.count({
        where: {
          courseOffering: {
            courseId: id
          }
        }
      });

      if (enrollmentCount > 0) {
        throw new Error('Cannot delete course with active enrollments');
      }

      await prisma.course.delete({
        where: { id }
      });

      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Cannot delete course with active enrollments')) {
        throw error;
      }
      return false;
    }
  },

  // Get courses by department
  async getCoursesByDepartment(departmentId: number, query: any) {
    const {
      page = 1,
      limit = 10,
      search = '',
      level,
      isActive
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {
      departmentId
    };

    if (level !== undefined) {
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

    const total = await prisma.course.count({ where });

    const courses = await prisma.course.findMany({
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
        _count: {
          select: {
            courseOfferings: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        name: 'asc'
      }
    });

    return {
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  // Get course statistics
  async getCourseStats(courseId: number) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        courseOfferings: {
          include: {
            enrollments: true
          }
        },
        _count: {
          select: {
            courseOfferings: true,
            programCourses: true
          }
        }
      }
    });

    if (!course) {
      return null;
    }

    // Calculate total enrollments across all course offerings
    const totalEnrollments = course.courseOfferings.reduce(
      (sum, offering) => sum + offering.enrollments.length,
      0
    );

    return {
      courseId,
      enrollmentCount: totalEnrollments,
      prerequisiteCount: course.prerequisites ? JSON.parse(course.prerequisites).length : 0,
      corequisiteCount: course.corequisites ? JSON.parse(course.corequisites).length : 0,
      totalStudents: totalEnrollments
    };
  },

  // Get courses by program
  async getCoursesByProgram(programId: number, query: CourseByProgramQuery) {
    const {
      page = 1,
      limit = 10,
      search = '',
      level,
      isActive
    } = query;
    const skip = (page - 1) * limit;

    // Build where clause for courses
    const courseWhere: any = {};

    if (level !== undefined) {
      courseWhere.level = level;
    }

    if (isActive !== undefined) {
      courseWhere.isActive = isActive;
    }

    if (search) {
      courseWhere.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Single optimized query: verify program exists and get courses with relations
    const programWithCourses = await prisma.program.findUnique({
      where: { id: programId },
      select: {
        id: true, // Verify program exists
        programCourses: {
          where: {
            course: courseWhere // Apply filters to the course relation
          },
          select: {
            course: {
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
                _count: {
                  select: {
                    courseOfferings: true,
                    programCourses: true
                  }
                }
              }
            }
          },
          skip,
          take: limit,
          orderBy: {
            course: {
              name: 'asc'
            }
          }
        },
        _count: {
          select: {
            programCourses: {
              where: {
                course: courseWhere // Apply same filters for count
              }
            }
          }
        }
      }
    });

    if (!programWithCourses) {
      throw new Error('Program not found');
    }

    // Extract courses from the result
    const courses = programWithCourses.programCourses.map(pc => pc.course);
    const total = programWithCourses._count.programCourses;

    return {
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
};
