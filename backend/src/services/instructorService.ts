import { PrismaClient, UserRole } from "@prisma/client";
import {
  CreateInstructorData,
  UpdateInstructorData,
  InstructorQueryParams,
  InstructorStatsParams,
} from "../types/instructor";
import { LecturerMetadata, RolePermissions } from "../types/roleProfile";
import {
  upsertRoleProfile,
  getRoleProfile,
  DEFAULT_PERMISSIONS,
} from "../utils/profileHelpers";
import {
  transformToInstructorDTO,
  transformToInstructorListItem,
  transformInstructorsToListItems,
} from "../utils/dtoTransformers";
import bcrypt from "bcryptjs";

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
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const skip = (page - 1) * limit;

    const where: any = {
      role: UserRole.LECTURER,
      isActive: true,
      user: {},
    };

    // Filter by institutional hierarchy
    if (departmentId) {
      where.user.departmentId = departmentId;
    }
    if (facultyId) {
      where.user.facultyId = facultyId;
    }
    if (institutionId) {
      where.user.institutionId = institutionId;
    }

    // Search by name, email
    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { lastName: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [profiles, total] = await Promise.all([
      prisma.roleProfile.findMany({
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
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
              lecturerDepartments: {
                select: {
                  id: true,
                  departmentId: true,
                  isPrimary: true,
                  department: {
                    select: {
                      id: true,
                      name: true,
                      code: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.roleProfile.count({ where }),
    ]);

    // Transform and filter by metadata
    let instructors = transformInstructorsToListItems(profiles as any);

    // Client-side filtering for metadata fields
    if (academicRank) {
      instructors = instructors.filter((i) => i.academicRank === academicRank);
    }
    if (employmentType) {
      instructors = instructors.filter((i) => i.employmentType === employmentType);
    }
    if (employmentStatus) {
      instructors = instructors.filter((i) => i.employmentStatus === employmentStatus);
    }
    if (specialization) {
      instructors = instructors.filter((i) =>
        i.specialization?.toLowerCase().includes(specialization.toLowerCase())
      );
    }

    const filteredTotal = instructors.length;

    return {
      success: true,
      data: instructors,
      pagination: {
        page,
        limit,
        total: filteredTotal,
        totalPages: Math.ceil(filteredTotal / limit),
        hasNext: page < Math.ceil(filteredTotal / limit),
        hasPrev: page > 1,
      },
      filters: params,
    };
  },

  // Get single instructor by user ID
  async getInstructorById(userId: number) {
    const profile = await prisma.roleProfile.findFirst({
      where: {
        userId,
        role: UserRole.LECTURER,
        isActive: true,
      },
      include: {
        user: {
          include: {
            lecturerDepartments: {
              include: {
                department: {
                  include: {
                    faculty: {
                      include: {
                        institution: true,
                      },
                    },
                  },
                },
              },
            },
            department: {
              include: {
                faculty: {
                  include: {
                    institution: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!profile) {
      throw new Error("Instructor not found");
    }

    return transformToInstructorDTO(profile as any);
  },

  // Get instructor by staff ID (from metadata)
  async getInstructorByStaffId(staffId: string) {
    const profile = await prisma.roleProfile.findFirst({
      where: {
        role: UserRole.LECTURER,
        isActive: true,
        metadata: {
          path: ['staffId'],
          equals: staffId,
        },
      },
      include: {
        user: {
          include: {
            lecturerDepartments: {
              include: {
                department: {
                  include: {
                    faculty: {
                      include: {
                        institution: true,
                      },
                    },
                  },
                },
              },
            },
            department: {
              include: {
                faculty: {
                  include: {
                    institution: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!profile) {
      return null;
    }

    return transformToInstructorDTO(profile as any);
  },

  // Create new instructor
  async createInstructor(data: CreateInstructorData) {
    const { user: userData, profile: profileData, permissions, institutionId, facultyId } = data;

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    return await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          middleName: userData.middleName || null,
          title: userData.title || null,
          phone: userData.phone || null,
          dateOfBirth: userData.dateOfBirth || null,
          gender: userData.gender || null,
          nationality: userData.nationality || null,
          address: userData.address || null,
          institutionId: institutionId || null,
          facultyId: facultyId || null,
          departmentId: null,
          role: UserRole.LECTURER,
          status: 'ACTIVE',
        },
      });

      // Build lecturer metadata
      const metadata: LecturerMetadata = {
        staffId: profileData.staffId,
        academicRank: profileData.academicRank,
        employmentType: profileData.employmentType || 'FULL_TIME',
        employmentStatus: profileData.employmentStatus || 'ACTIVE',
        hireDate: profileData.hireDate?.toISOString(),
        highestQualification: profileData.highestQualification,
        specialization: profileData.specialization,
        researchInterests: profileData.researchInterests,
        officeLocation: profileData.officeLocation,
        officeHours: profileData.officeHours,
        biography: profileData.biography,
        profileImageUrl: profileData.profileImageUrl,
      };

      // Create RoleProfile for lecturer
      const rolePermissions = permissions || DEFAULT_PERMISSIONS[UserRole.LECTURER];
      await upsertRoleProfile(
        user.id,
        UserRole.LECTURER,
        rolePermissions as RolePermissions,
        metadata as any,
        true,
        tx as any
      );

      // Return the created instructor profile
      return await this.getInstructorById(user.id);
    });
  },

  // Update instructor (by userId)
  async updateInstructor(userId: number, data: UpdateInstructorData) {
    const { user: userData, profile: profileData, permissions, isActive } = data;

    return await prisma.$transaction(async (tx) => {
      // Get lecturer role profile first
      const roleProfile = await tx.roleProfile.findFirst({
        where: {
          userId,
          role: UserRole.LECTURER,
        },
      });

      if (!roleProfile) {
        throw new Error("Instructor profile not found");
      }

      // Update user if user data provided
      if (userData) {
        await tx.user.update({
          where: { id: userId },
          data: userData as any,
        });
      }

      // Update RoleProfile metadata/permissions if provided
      if (profileData || permissions !== undefined || isActive !== undefined) {
        const currentMetadata = roleProfile.metadata as any;
        const currentPermissions = roleProfile.permissions as RolePermissions;

        const updateData: any = {};

        if (profileData) {
          updateData.metadata = {
            ...currentMetadata,
            ...profileData,
            ...(profileData.hireDate && { hireDate: profileData.hireDate.toISOString() }),
          };
        }

        if (permissions) {
          updateData.permissions = {
            ...currentPermissions,
            ...permissions,
          };
        }

        if (isActive !== undefined) {
          updateData.isActive = isActive;
        }

        if (Object.keys(updateData).length > 0) {
          await tx.roleProfile.update({
            where: { id: roleProfile.id },
            data: updateData,
          });
        }
      }

      // Return updated profile
      return await this.getInstructorById(userId);
    });
  },

  // Delete instructor (by userId)
  async deleteInstructor(userId: number) {
    return await prisma.$transaction(async (tx) => {
      // Get lecturer role profile first
      const roleProfile = await tx.roleProfile.findFirst({
        where: {
          userId,
          role: UserRole.LECTURER,
        },
      });

      if (!roleProfile) {
        throw new Error("Instructor profile not found");
      }

      // Delete role profile
      await tx.roleProfile.delete({
        where: { id: roleProfile.id },
      });

      // Delete user (if no other role profiles exist)
      const otherProfiles = await tx.roleProfile.count({
        where: { userId },
      });

      if (otherProfiles === 0) {
        await tx.user.delete({
          where: { id: userId },
        });
      }
    });
  },

  // Update instructor status (by userId)
  async updateInstructorStatus(userId: number, employmentStatus: any) {
    return await prisma.$transaction(async (tx) => {
      const roleProfile = await tx.roleProfile.findFirst({
        where: {
          userId,
          role: UserRole.LECTURER,
        },
      });

      if (!roleProfile) {
        throw new Error("Instructor profile not found");
      }

      const currentMetadata = roleProfile.metadata as any;

      await tx.roleProfile.update({
        where: { id: roleProfile.id },
        data: {
          metadata: {
            ...currentMetadata,
            employmentStatus,
          },
        },
      });

      return await this.getInstructorById(userId);
    });
  },

  // Assign instructor to department (simplified - via user relationship)
  async assignToDepartment(
    userId: number,
    departmentId: number,
    isPrimary: boolean = false
  ) {
    // Verify instructor exists
    const roleProfile = await prisma.roleProfile.findFirst({
      where: {
        userId,
        role: UserRole.LECTURER,
      },
    });

    if (!roleProfile) {
      throw new Error("Instructor not found");
    }

    // Update user's department
    await prisma.user.update({
      where: { id: userId },
      data: { departmentId },
    });

    // Return updated instructor
    return await this.getInstructorById(userId);
  },

  // Remove instructor from department
  async removeFromDepartment(userId: number, departmentId: number) {
    // Verify instructor exists
    const roleProfile = await prisma.roleProfile.findFirst({
      where: {
        userId,
        role: UserRole.LECTURER,
      },
    });

    if (!roleProfile) {
      throw new Error("Instructor not found");
    }

    // Remove department assignment
    await prisma.user.update({
      where: { id: userId },
      data: { departmentId: null },
    });

    // Return updated instructor
    return await this.getInstructorById(userId);
  },

  // Bulk import instructors
  async bulkImportInstructors(instructorsData: CreateInstructorData[]) {
    const results = {
      successful: [] as any[],
      failed: [] as any[],
    };

    for (const instructorData of instructorsData) {
      try {
        const instructor = await this.createInstructor(instructorData);
        results.successful.push(instructor);
      } catch (error) {
        results.failed.push({
          data: instructorData,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  },

  // Get instructor statistics
  async getInstructorStats(params: InstructorStatsParams) {
    const { institutionId, facultyId, departmentId } = params;

    const baseWhere: any = {
      role: UserRole.LECTURER,
      isActive: true,
      user: {},
    };

    if (departmentId) {
      baseWhere.user.departmentId = departmentId;
    } else if (facultyId) {
      baseWhere.user.facultyId = facultyId;
    } else if (institutionId) {
      baseWhere.user.institutionId = institutionId;
    }

    // Get all instructor profiles
    const instructorProfiles = await prisma.roleProfile.findMany({
      where: baseWhere,
      include: {
        user: {
          select: {
            departmentId: true,
          },
        },
      },
    });

    const metadataList = instructorProfiles.map((p) => p.metadata as any);

    const totalInstructors = instructorProfiles.length;
    const activeInstructors = metadataList.filter(
      (m) => m.employmentStatus === "ACTIVE"
    ).length;
    const onLeaveInstructors = metadataList.filter(
      (m) => m.employmentStatus === "ON_LEAVE"
    ).length;
    const retiredInstructors = metadataList.filter(
      (m) => m.employmentStatus === "RETIRED"
    ).length;

    // Group by academic rank
    const instructorsByRank = metadataList.reduce((acc: any, m: any) => {
      const rank = m.academicRank || "UNSPECIFIED";
      if (!acc[rank]) {
        acc[rank] = { academicRank: rank, _count: 0 };
      }
      acc[rank]._count++;
      return acc;
    }, {});

    // Group by employment type
    const instructorsByEmploymentType = metadataList.reduce((acc: any, m: any) => {
      const type = m.employmentType || "FULL_TIME";
      if (!acc[type]) {
        acc[type] = { employmentType: type, _count: 0 };
      }
      acc[type]._count++;
      return acc;
    }, {});

    // Group by department
    const instructorsByDepartment = instructorProfiles.reduce((acc: any, p: any) => {
      const deptId = p.user.departmentId;
      if (deptId) {
        if (!acc[deptId]) {
          acc[deptId] = { departmentId: deptId, _count: 0 };
        }
        acc[deptId]._count++;
      }
      return acc;
    }, {});

    // Calculate average experience
    const instructorsWithHireDate = metadataList.filter((m) => m.hireDate);
    const averageExperience =
      instructorsWithHireDate.length > 0
        ? instructorsWithHireDate.reduce((sum, m) => {
            const years = m.hireDate
              ? new Date().getFullYear() - new Date(m.hireDate).getFullYear()
              : 0;
            return sum + years;
          }, 0) / instructorsWithHireDate.length
        : 0;

    return {
      totalInstructors,
      activeInstructors,
      onLeaveInstructors,
      retiredInstructors,
      averageExperience: Math.round(averageExperience * 10) / 10,
      instructorsByRank: Object.values(instructorsByRank).map((item: any) => ({
        rank: item.academicRank,
        count: item._count,
      })),
      instructorsByDepartment: await Promise.all(
        Object.values(instructorsByDepartment)
          .map(async (item: any) => {
            const department = await prisma.department.findUnique({
              where: { id: item.departmentId },
              select: { name: true },
            });
            return {
              departmentId: item.departmentId,
              departmentName: department?.name || "Unknown",
              count: item._count,
            };
          })
      ),
      instructorsByEmploymentType: Object.values(instructorsByEmploymentType).map((item: any) => ({
        type: item.employmentType,
        count: item._count,
      })),
    };
  },

  // Get instructor workload (by userId)
  async getInstructorWorkload(userId: number) {
    const roleProfile = await prisma.roleProfile.findFirst({
      where: {
        userId,
        role: UserRole.LECTURER,
      },
    });

    if (!roleProfile) {
      throw new Error("Instructor not found");
    }

    // Get courses assigned to this instructor
    const coursesAssigned = await prisma.courseLecturer.count({
      where: { lecturerId: userId },
    });

    // Get students enrolled in instructor's courses
    const studentsEnrolled = await prisma.courseEnrollment.count({
      where: {
        courseOffering: {
          courseLecturers: {
            some: { lecturerId: userId },
          },
        },
      },
    });

    // Get contact hours (simplified - assuming standard course hours)
    const contactHours = coursesAssigned * 3; // 3 hours per course as default

    // Get research projects (placeholder - not implemented yet)
    const researchProjects = 0;

    // Get administrative roles (placeholder - not implemented yet)
    const administrativeRoles = 0;

    return {
      instructorId: userId,
      coursesAssigned,
      studentsEnrolled,
      contactHours,
      researchProjects,
      administrativeRoles,
    };
  },

  // Export instructors data
  async exportInstructors(
    params: InstructorQueryParams,
    format: "csv" | "excel" = "csv"
  ) {
    const instructors = await this.getInstructors(params);

    if (format === "csv") {
      // Convert to CSV format
      const headers = [
        "Staff ID",
        "First Name",
        "Last Name",
        "Email",
        "Academic Rank",
        "Employment Type",
        "Employment Status",
        "Specialization",
        "Department",
        "Faculty",
        "Institution",
      ];

      const rows = instructors.data.map((instructor) => [
        instructor.staffId,
        instructor.firstName,
        instructor.lastName,
        instructor.email,
        instructor.academicRank || "",
        instructor.employmentType,
        instructor.employmentStatus,
        instructor.specialization || "",
        instructor.departmentNames.join(", ") || "",
        "", // Faculty - not directly available in list DTO
        "", // Institution - not directly available in list DTO
      ]);

      return [headers, ...rows];
    }

    // For excel, return the data as is (would need additional processing)
    return instructors.data;
  },

  // Get instructors by department
  async getInstructorsByDepartment(params: {
    departmentId: number;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const {
      departmentId,
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const skip = (page - 1) * limit;

    const where: any = {
      role: UserRole.LECTURER,
      isActive: true,
      user: {
        departmentId,
      },
    };

    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { lastName: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [profiles, total] = await Promise.all([
      prisma.roleProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              status: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.roleProfile.count({ where }),
    ]);

    const instructors = transformInstructorsToListItems(profiles as any);
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: "Instructors retrieved successfully",
      data: {
        instructors,
        total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },
};
