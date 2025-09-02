import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class FacultyService {
  // ========================================
  // BASIC CRUD OPERATIONS
  // ========================================

  async createFaculty(data: {
    name: string;
    code: string;
    institutionId: number;
    description?: string;
  }) {
    try {
      // Check if faculty code already exists for this institution
      const existingFaculty = await prisma.faculty.findFirst({
        where: {
          code: data.code,
          institutionId: data.institutionId
        }
      });

      if (existingFaculty) {
        throw new Error(`Faculty with code '${data.code}' already exists in this institution`);
      }

      const faculty = await prisma.faculty.create({
        data: {
          name: data.name,
          code: data.code,
          institutionId: data.institutionId,
          description: data.description
        },
        include: {
          institution: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          _count: {
            select: {
              users: true,
              departments: true
            }
          }
        }
      });

      return faculty;
    } catch (error) {
      console.error('Error creating faculty:', error);
      throw error;
    }
  }

  async getFaculties(query: {
    institutionId?: number;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'name' | 'code' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  }) {
    try {
      const {
        institutionId,
        page = 1,
        limit = 10,
        search = '',
        sortBy = 'name',
        sortOrder = 'asc'
      } = query;

      const skip = (page - 1) * limit;

      const where: any = {};
      if (institutionId) {
        where.institutionId = institutionId;
      }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [faculties, total] = await Promise.all([
        prisma.faculty.findMany({
          where,
          include: {
            institution: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            _count: {
              select: {
                users: true,
                departments: true
              }
            }
          },
          orderBy: {
            [sortBy]: sortOrder
          },
          skip,
          take: limit
        }),
        prisma.faculty.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        faculties,
        total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (error) {
      console.error('Error fetching faculties:', error);
      throw error;
    }
  }

  async getFacultyById(id: number) {
    try {
      const faculty = await prisma.faculty.findUnique({
        where: { id },
        include: {
          institution: {
            select: {
              id: true,
              name: true,
              code: true,
              type: true,
              status: true
            }
          },
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              status: true,
              lastLogin: true
            },
            orderBy: { createdAt: 'desc' }
          },
          departments: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          _count: {
            select: {
              users: true,
              departments: true
            }
          }
        }
      });

      return faculty;
    } catch (error) {
      console.error('Error fetching faculty:', error);
      throw error;
    }
  }

  async updateFaculty(id: number, data: {
    name?: string;
    code?: string;
    description?: string;
  }) {
    try {
      // Check if updating code and it already exists
      if (data.code) {
        const existingFaculty = await prisma.faculty.findFirst({
          where: {
            code: data.code,
            id: { not: id }
          }
        });

        if (existingFaculty) {
          throw new Error(`Faculty with code '${data.code}' already exists`);
        }
      }

      const faculty = await prisma.faculty.update({
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
          _count: {
            select: {
              users: true,
              departments: true
            }
          }
        }
      });

      return faculty;
    } catch (error) {
      console.error('Error updating faculty:', error);
      throw error;
    }
  }

  async deleteFaculty(id: number) {
    try {
      // Check if faculty has users or departments
      const faculty = await prisma.faculty.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              users: true,
              departments: true
            }
          }
        }
      });

      if (!faculty) {
        return false;
      }

      if (faculty._count.users > 0 || faculty._count.departments > 0) {
        throw new Error('Cannot delete faculty with existing users or departments');
      }

      await prisma.faculty.delete({
        where: { id }
      });

      return true;
    } catch (error) {
      console.error('Error deleting faculty:', error);
      throw error;
    }
  }

  async getFacultiesByInstitution(institutionId: number) {
    try {
      const faculties = await prisma.faculty.findMany({
        where: { institutionId },
        include: {
          _count: {
            select: {
              users: true,
              departments: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      return faculties;
    } catch (error) {
      console.error('Error fetching faculties by institution:', error);
      throw error;
    }
  }
}

export const facultyService = new FacultyService();
