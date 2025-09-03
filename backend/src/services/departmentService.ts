import { PrismaClient } from '@prisma/client';
import { Department, CreateDepartmentRequest, UpdateDepartmentRequest, DepartmentQuery, DepartmentStats } from '../types/department';

const prisma = new PrismaClient();

export const departmentService = {
  // Get all departments with filtering and pagination
  async getDepartments(query: DepartmentQuery) {
    const {
      page = 1,
      limit = 10,
      search = '',
      facultyId,
      institutionId,
      type,
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

    if (facultyId) {
      where.facultyId = facultyId;
    }

    if (institutionId) {
      where.faculty = {
        institutionId: institutionId
      };
    }

    if (type) {
      where.type = type;
    }

    // Get total count
    const total = await prisma.department.count({ where });

    // Get departments
    const departments = await prisma.department.findMany({
      where,
      include: {
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
        },
        hod: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            users: true,
            courses: true,
            programs: true
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
      departments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  // Get department by ID
  async getDepartmentById(id: number) {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
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
        },
        hod: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            title: true
          }
        },
        programs: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
            level: true,
            isActive: true
          },
          orderBy: {
            name: 'asc'
          }
        },
        courses: {
          select: {
            id: true,
            name: true,
            code: true,
            level: true,
            courseType: true,
            creditHours: true,
            isActive: true
          },
          orderBy: {
            level: 'asc'
          }
        },
        _count: {
          select: {
            users: true,
            courses: true,
            programs: true
          }
        }
      }
    });

    return department;
  },

  // Create new department
  async createDepartment(departmentData: CreateDepartmentRequest): Promise<Department> {
    // Convert contactInfo to JSON string if it's an object
    const contactInfo = typeof departmentData.contactInfo === 'object' 
      ? JSON.stringify(departmentData.contactInfo)
      : departmentData.contactInfo;

    const department = await prisma.department.create({
      data: {
        ...departmentData,
        contactInfo,
        type: departmentData.type || 'department'
      },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            institutionId: true
          }
        },
        hod: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            users: true,
            courses: true,
            programs: true
          }
        }
      }
    });

    return department;
  },

  // Update department
  async updateDepartment(id: number, updateData: UpdateDepartmentRequest): Promise<Department | null> {
    // Convert contactInfo to JSON string if it's an object
    const contactInfo = typeof updateData.contactInfo === 'object' 
      ? JSON.stringify(updateData.contactInfo)
      : updateData.contactInfo;

    const department = await prisma.department.update({
      where: { id },
      data: {
        ...updateData,
        contactInfo
      },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            institutionId: true
          }
        },
        hod: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            users: true,
            courses: true,
            programs: true
          }
        }
      }
    });

    return department;
  },

  // Delete department
  async deleteDepartment(id: number): Promise<boolean> {
    try {
      await prisma.department.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting department:', error);
      return false;
    }
  },

  // Get departments by faculty
  async getDepartmentsByFaculty(facultyId: number) {
    const departments = await prisma.department.findMany({
      where: { facultyId },
      include: {
        hod: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            users: true,
            courses: true,
            programs: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return departments;
  },

  // Get departments by institution
  async getDepartmentsByInstitution(institutionId: number) {
    const departments = await prisma.department.findMany({
      where: {
        faculty: {
          institutionId: institutionId
        }
      },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            institutionId: true
          }
        },
        hod: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            users: true,
            courses: true,
            programs: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return departments;
  },

  // Get department statistics
  async getDepartmentStats(facultyId?: number, institutionId?: number): Promise<DepartmentStats> {
    const where: any = {};

    if (facultyId) {
      where.facultyId = facultyId;
    } else if (institutionId) {
      where.faculty = {
        institutionId: institutionId
      };
    }

    // Get total count
    const totalDepartments = await prisma.department.count({ where });

    // Get departments by type
    const departmentsByType = await prisma.department.groupBy({
      by: ['type'],
      where,
      _count: {
        id: true
      }
    });

    const byType = departmentsByType.reduce((acc, item) => {
      acc[item.type] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Get departments by faculty
    const departmentsByFaculty = await prisma.department.groupBy({
      by: ['facultyId'],
      where,
      _count: {
        id: true
      }
    });

    const facultyNames = await prisma.faculty.findMany({
      where: {
        id: {
          in: departmentsByFaculty.map(d => d.facultyId)
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    const byFaculty = departmentsByFaculty.reduce((acc, item) => {
      const faculty = facultyNames.find(f => f.id === item.facultyId);
      if (faculty) {
        acc[faculty.name] = item._count.id;
      }
      return acc;
    }, {} as Record<string, number>);

    // Get recent departments
    const recentDepartments = await prisma.department.findMany({
      where,
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            institutionId: true
          }
        },
        _count: {
          select: {
            users: true,
            courses: true,
            programs: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    return {
      totalDepartments,
      byType,
      byFaculty,
      recentDepartments
    };
  }
};
