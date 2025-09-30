import { PrismaClient } from "@prisma/client";
import {
  Department,
  DepartmentQuery,
  DepartmentListResponse,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentAnalytics,
} from "../types/department";

const prisma = new PrismaClient();

export const departmentService = {
  // Get all departments with pagination and filtering
  async getDepartments(
    query: DepartmentQuery
  ): Promise<DepartmentListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      facultyId,
      institutionId,
      sortBy = "name",
      sortOrder = "asc",
    } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (facultyId) {
      where.facultyId = facultyId;
    }

    if (institutionId) {
      where.faculty = {
        institutionId: institutionId,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.department.count({ where });

    // Get departments with relations
    const departments = await prisma.department.findMany({
      where,
      include: {
        faculty: {
          include: {
            institution: true,
          },
        },
        hod: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        courses: {
          select: {
            id: true,
            name: true,
            code: true,
            creditHours: true,
            courseType: true,
            isActive: true,
          },
        },
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            email: true,
          },
        },
        lecturerDepartments: {
          include: {
            lecturer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    // Calculate stats for each department
    const departmentsWithStats = (departments as any).map((dept: any) => ({
      ...dept,
      stats: {
        totalUsers: dept.users.length,
        totalCourses: dept.courses.length,
        totalLecturers: dept.lecturerDepartments.length,
        activePrograms: 0, // TODO: Calculate from programs table
      },
    }));

    return {
      departments: departmentsWithStats,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  },

  // Get single department by ID
  async getDepartmentById(id: number): Promise<Department | null> {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        faculty: {
          include: {
            institution: true,
          },
        },
        hod: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        courses: {
          select: {
            id: true,
            name: true,
            code: true,
            creditHours: true,
            courseType: true,
            isActive: true,
          },
        },
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            email: true,
          },
        },
        lecturerDepartments: {
          include: {
            lecturer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!department) return null;

    // Add stats
    return {
      ...department,
      description: department.description ?? undefined,
      stats: {
        totalUsers: department.users.length,
        totalCourses: department.courses.length,
        totalLecturers: department.lecturerDepartments.length,
        activePrograms: 0, // TODO: Calculate from programs table
      },
    };
  },

  // Create new department
  async createDepartment(data: CreateDepartmentRequest) {
    // Check if faculty exists
    const faculty = await prisma.faculty.findUnique({
      where: { id: data.facultyId },
    });

    if (!faculty) {
      throw new Error("Faculty not found");
    }

    // Check if department code is unique within faculty
    const existingDepartment = await prisma.department.findFirst({
      where: {
        code: data.code,
        facultyId: data.facultyId,
      },
    });

    if (existingDepartment) {
      throw new Error(
        `Department with code '${data.code}' already exists in this faculty`
      );
    }

    const department = await prisma.department.create({
      data: {
        name: data.name,
        code: data.code,
        facultyId: data.facultyId,
        type: data.type,
        description: data.description,
        officeLocation: data.officeLocation,
        contactInfo: data.contactInfo,
        hodId: data.hodId,
      },
      include: {
        faculty: {
          include: {
            institution: true,
          },
        },
      },
    });

    return department;
  },

  // Update department
  async updateDepartment(id: number, data: UpdateDepartmentRequest) {
    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id },
    });

    if (!existingDepartment) {
      return null;
    }

    // Check if new code conflicts (if code is being updated)
    if (data.code && data.code !== existingDepartment.code) {
      const codeConflict = await prisma.department.findFirst({
        where: {
          code: data.code,
          facultyId: existingDepartment.facultyId,
          id: { not: id },
        },
      });

      if (codeConflict) {
        throw new Error(
          `Department with code '${data.code}' already exists in this faculty`
        );
      }
    }

    const department = await prisma.department.update({
      where: { id },
      data,
      include: {
        faculty: {
          include: {
            institution: true,
          },
        },
      },
    });

    return department;
  },

  // Delete department
  async deleteDepartment(id: number): Promise<boolean> {
    try {
      // Check if department has dependencies
      const coursesCount = await prisma.course.count({
        where: { departmentId: id },
      });

      const usersCount = await prisma.user.count({
        where: { departmentId: id },
      });

      if (coursesCount > 0 || usersCount > 0) {
        throw new Error(
          "Cannot delete department with existing courses or users"
        );
      }

      await prisma.department.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes("Cannot delete")) {
        throw error;
      }
      return false;
    }
  },

  // Get departments by faculty
  async getDepartmentsByFaculty(
    facultyId: number,
    query: { page: number; limit: number; search?: string }
  ): Promise<DepartmentListResponse> {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { facultyId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    const total = await prisma.department.count({ where });

    const departments = await prisma.department.findMany({
      where,
      include: {
        hod: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        courses: {
          select: {
            id: true,
            name: true,
            code: true,
            creditHours: true,
            courseType: true,
            isActive: true,
          },
        },
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            email: true,
          },
        },
      },
      orderBy: { name: "asc" },
      skip,
      take: limit,
    });

    return {
      departments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  },

  // Get department analytics
  async getDepartmentAnalytics(
    facultyId?: number
  ): Promise<DepartmentAnalytics> {
    try {
      // Build where clause for filtering
      const where: any = {};
      if (facultyId) {
        where.facultyId = facultyId;
      }

      // Get all departments with counts
      const departments = await prisma.department.findMany({
        where,
        include: {
          _count: {
            select: {
              users: true,
              courses: true,
              programs: true,
            },
          },
          faculty: true,
        },
      });

      const totalDepartments = departments.length;

      // Count departments by type
      const departmentsByType = {
        department: departments.filter((d) => d.type === "department").length,
        school: departments.filter((d) => d.type === "school").length,
        institute: departments.filter((d) => d.type === "institute").length,
      };

      // Count departments with/without HODs
      const departmentsWithHODs = departments.filter((d) => d.hodId).length;
      const departmentsWithoutHODs = totalDepartments - departmentsWithHODs;

      // Calculate totals
      const totalDepartmentMembers = departments.reduce(
        (sum, dept) => sum + (dept._count?.users || 0),
        0
      );
      const totalCourses = departments.reduce(
        (sum, dept) => sum + (dept._count?.courses || 0),
        0
      );
      const totalPrograms = departments.reduce(
        (sum, dept) => sum + (dept._count?.programs || 0),
        0
      );

      // Calculate averages
      const averageMembersPerDepartment =
        totalDepartments > 0
          ? Math.round((totalDepartmentMembers / totalDepartments) * 100) / 100
          : 0;

      // Department distribution
      const memberCounts = departments.map((d) => d._count?.users || 0);
      const minMembers =
        memberCounts.length > 0 ? Math.min(...memberCounts) : 0;
      const maxMembers =
        memberCounts.length > 0 ? Math.max(...memberCounts) : 0;
      const averageMembers =
        totalDepartments > 0
          ? Math.round((totalDepartmentMembers / totalDepartments) * 100) / 100
          : 0;

      return {
        totalDepartments,
        departmentsByType,
        departmentsWithHODs,
        departmentsWithoutHODs,
        totalDepartmentMembers,
        averageMembersPerDepartment,
        totalCourses,
        totalPrograms,
        departmentDistribution: {
          minMembers,
          maxMembers,
          averageMembers,
        },
      };
    } catch (error) {
      console.error("Error fetching department analytics:", error);
      throw error;
    }
  },
};
