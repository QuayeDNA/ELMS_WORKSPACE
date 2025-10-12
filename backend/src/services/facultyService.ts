import { PrismaClient } from "@prisma/client";
import { Faculty, CreateFacultyRequest, UpdateFacultyRequest, FacultyQuery } from '../types/faculty';
import {
  PaginatedResponse,
  ApiResponse,
  createPaginatedResponse,
  createSuccessResponse
} from '../types/shared/api';
import { normalizeQuery } from '../types/shared/query';

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
          institutionId: data.institutionId,
        },
      });

      if (existingFaculty) {
        throw new Error(
          `Faculty with code '${data.code}' already exists in this institution`
        );
      }

      const faculty = await prisma.faculty.create({
        data: {
          name: data.name,
          code: data.code,
          institutionId: data.institutionId,
          description: data.description,
        },
        include: {
          institution: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          _count: {
            select: {
              users: true,
              departments: true,
            },
          },
        },
      });

      return faculty;
    } catch (error) {
      console.error("Error creating faculty:", error);
      throw error;
    }
  }

  async getFaculties(query: FacultyQuery = {}): Promise<PaginatedResponse<Faculty>> {
    try {
      const {
        institutionId,
        page,
        limit,
        search,
        sortBy = "name",
        sortOrder,
      } = normalizeQuery(query);

      const skip = (page - 1) * limit;

      const where: any = {};
      if (institutionId) {
        where.institutionId = institutionId;
      }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
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
                code: true,
                type: true,
                status: true,
              },
            },
            dean: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                title: true,
              },
            },
            _count: {
              select: {
                users: true,
                departments: true,
              },
            },
          },
          orderBy: {
            [sortBy]: sortOrder,
          },
          skip,
          take: limit,
        }),
        prisma.faculty.count({ where }),
      ]);

      return createPaginatedResponse(
        faculties as Faculty[],
        page,
        limit,
        total,
        'Faculties retrieved successfully'
      );
    } catch (error) {
      console.error("Error fetching faculties:", error);
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
              status: true,
            },
          },
          dean: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              title: true,
            },
          },
          departments: {
            select: {
              id: true,
              name: true,
              code: true,
              hod: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              _count: {
                select: {
                  users: true,
                  courses: true,
                },
              },
            },
          },
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              status: true,
            },
            where: {
              role: {
                in: ["DEAN", "HOD", "LECTURER", "EXAMS_OFFICER"],
              },
            },
          },
          _count: {
            select: {
              users: true,
              departments: true,
              exams: true,
            },
          },
        },
      });

      return faculty;
    } catch (error) {
      console.error("Error fetching faculty:", error);
      throw error;
    }
  }

  async assignDean(facultyId: number, deanId: number) {
    try {
      // Verify the user exists and has appropriate role
      const user = await prisma.user.findUnique({
        where: { id: deanId },
        select: { id: true, role: true, institutionId: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Get faculty to verify institution match
      const faculty = await prisma.faculty.findUnique({
        where: { id: facultyId },
        select: { id: true, institutionId: true, deanId: true },
      });

      if (!faculty) {
        throw new Error("Faculty not found");
      }

      // Verify user belongs to same institution
      if (user.institutionId !== faculty.institutionId) {
        throw new Error(
          "Dean must belong to the same institution as the faculty"
        );
      }

      // Update faculty with new dean
      const updatedFaculty = await prisma.faculty.update({
        where: { id: facultyId },
        data: { deanId: deanId },
        include: {
          dean: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return updatedFaculty;
    } catch (error) {
      console.error("Error assigning dean:", error);
      throw error;
    }
  }

  async removeDean(facultyId: number) {
    try {
      // Verify faculty exists
      const faculty = await prisma.faculty.findUnique({
        where: { id: facultyId },
        select: { id: true, deanId: true },
      });

      if (!faculty) {
        throw new Error("Faculty not found");
      }

      // Remove dean assignment
      const updatedFaculty = await prisma.faculty.update({
        where: { id: facultyId },
        data: { deanId: null },
        include: {
          dean: true,
        },
      });

      return updatedFaculty;
    } catch (error) {
      console.error("Error removing dean:", error);
      throw error;
    }
  }

  async updateFaculty(
    id: number,
    data: {
      name?: string;
      code?: string;
      description?: string;
    }
  ) {
    try {
      // Check if updating code and it already exists
      if (data.code) {
        const existingFaculty = await prisma.faculty.findFirst({
          where: {
            code: data.code,
            id: { not: id },
          },
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
              code: true,
            },
          },
          _count: {
            select: {
              users: true,
              departments: true,
            },
          },
        },
      });

      return faculty;
    } catch (error) {
      console.error("Error updating faculty:", error);
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
              departments: true,
            },
          },
        },
      });

      if (!faculty) {
        return false;
      }

      if (faculty._count.users > 0 || faculty._count.departments > 0) {
        throw new Error(
          "Cannot delete faculty with existing users or departments"
        );
      }

      await prisma.faculty.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      console.error("Error deleting faculty:", error);
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
              departments: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });

      return faculties;
    } catch (error) {
      console.error("Error fetching faculties by institution:", error);
      throw error;
    }
  }

  // ========================================
  // ANALYTICS METHODS
  // ========================================

  async getFacultyAnalytics(institutionId?: number) {
    try {
      // Base where clause
      const whereClause = institutionId ? { institutionId } : {};

      // Get all faculties with counts
      const faculties = await prisma.faculty.findMany({
        where: whereClause,
        include: {
          dean: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              users: true,
              departments: true,
            },
          },
        },
      });

      // Calculate basic metrics
      const totalFaculties = faculties.length;
      const totalDepartments = faculties.reduce(
        (acc, faculty) => acc + (faculty._count?.departments || 0),
        0
      );
      const totalFacultyMembers = faculties.reduce(
        (acc, faculty) => acc + (faculty._count?.users || 0),
        0
      );

      // Calculate averages
      const averageMembersPerFaculty =
        totalFaculties > 0
          ? Math.round((totalFacultyMembers / totalFaculties) * 100) / 100
          : 0;

      // Count faculties with/without deans
      const facultiesWithDeans = faculties.filter(
        (faculty) => faculty.deanId
      ).length;
      const facultiesWithoutDeans = totalFaculties - facultiesWithDeans;

      // Department distribution
      const departmentCounts = faculties.map((f) => f._count?.departments || 0);
      const minDepartments =
        departmentCounts.length > 0 ? Math.min(...departmentCounts) : 0;
      const maxDepartments =
        departmentCounts.length > 0 ? Math.max(...departmentCounts) : 0;
      const averageDepartments =
        totalFaculties > 0
          ? Math.round((totalDepartments / totalFaculties) * 100) / 100
          : 0;

      // Member distribution
      const memberCounts = faculties.map((f) => f._count?.users || 0);
      const minMembers =
        memberCounts.length > 0 ? Math.min(...memberCounts) : 0;
      const maxMembers =
        memberCounts.length > 0 ? Math.max(...memberCounts) : 0;
      const averageMembers =
        totalFaculties > 0
          ? Math.round((totalFacultyMembers / totalFaculties) * 100) / 100
          : 0;

      // For now, we'll assume all faculties are active since there's no status field
      // This can be updated when faculty status is implemented
      const facultyStatusBreakdown = {
        active: totalFaculties,
        inactive: 0,
      };

      return {
        totalFaculties,
        totalDepartments,
        totalFacultyMembers,
        averageMembersPerFaculty,
        facultiesWithDeans,
        facultiesWithoutDeans,
        departmentDistribution: {
          minDepartments,
          maxDepartments,
          averageDepartments,
        },
        memberDistribution: {
          minMembers,
          maxMembers,
          averageMembers,
        },
        facultyStatusBreakdown,
      };
    } catch (error) {
      console.error("Error fetching faculty analytics:", error);
      throw error;
    }
  }
}

export const facultyService = new FacultyService();
