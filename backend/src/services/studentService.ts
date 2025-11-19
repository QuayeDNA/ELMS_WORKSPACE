import { PrismaClient, UserRole } from "@prisma/client";
import {
  CreateStudentData,
  UpdateStudentData,
  StudentQueryParams,
  StudentStatsParams,
} from "../types/student";
import { StudentMetadata, RolePermissions } from "../types/roleProfile";
import {
  upsertRoleProfile,
  getRoleProfile,
  DEFAULT_PERMISSIONS,
} from "../utils/profileHelpers";
import {
  transformToStudentDTO,
  transformToStudentListItem,
  transformStudentsToListItems,
} from "../utils/dtoTransformers";
import bcrypt from "bcryptjs";

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
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause for RoleProfile queries
    const where: any = {
      role: UserRole.STUDENT,
      isActive: true,
      user: {},
    };

    // Filter by institutional hierarchy through user relations
    if (departmentId) {
      where.user.departmentId = departmentId;
    }
    if (facultyId) {
      where.user.facultyId = facultyId;
    }
    if (institutionId) {
      where.user.institutionId = institutionId;
    }

    // Search by name, email, or metadata studentId/indexNumber
    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { lastName: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Handle sorting
    let orderBy: any;
    const userFields = [
      "firstName",
      "lastName",
      "middleName",
      "email",
      "phone",
      "gender",
      "status",
      "createdAt",
    ];

    if (userFields.includes(sortBy)) {
      orderBy = { user: { [sortBy]: sortOrder } };
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    const [profiles, total] = await Promise.all([
      prisma.roleProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
            },
          },
        },
      }),
      prisma.roleProfile.count({ where }),
    ]);

    // Transform to DTOs and filter by metadata if needed
    let students = transformStudentsToListItems(profiles as any);

    // Client-side filtering for metadata fields (programId, level, semester, etc.)
    if (programId !== undefined) {
      students = students.filter((s: any) => {
        const profile = profiles.find(p => p.userId === s.userId);
        const meta = profile?.metadata as any;
        return meta?.programId === programId;
      });
    }
    if (level !== undefined) {
      students = students.filter((s) => s.level === level);
    }
    if (semester !== undefined) {
      students = students.filter((s) => s.semester === semester);
    }
    if (enrollmentStatus) {
      students = students.filter((s) => s.enrollmentStatus === enrollmentStatus);
    }
    if (academicStatus) {
      students = students.filter((s) => s.academicStatus === academicStatus);
    }
    if (academicYear) {
      students = students.filter(
        (s) => (s as any).academicYear === academicYear
      );
    }

    const filteredTotal = students.length;

    return {
      success: true,
      data: students,
      pagination: {
        page,
        limit,
        total: filteredTotal,
        totalPages: Math.ceil(filteredTotal / limit),
        hasNext: page < Math.ceil(filteredTotal / limit),
        hasPrev: page > 1,
      },
    };
  },

  // Get single student by user ID
  async getStudentById(userId: number) {
    const profile = await prisma.roleProfile.findFirst({
      where: {
        userId,
        role: UserRole.STUDENT,
        isActive: true,
      },
      include: {
        user: true,
      },
    });

    if (!profile) {
      return null;
    }

    return transformToStudentDTO(profile as any);
  },

  // Get student by student ID (from metadata)
  async getStudentByStudentId(studentId: string) {
    const profile = await prisma.roleProfile.findFirst({
      where: {
        role: UserRole.STUDENT,
        isActive: true,
        metadata: {
          path: ['studentId'],
          equals: studentId,
        },
      },
      include: {
        user: true,
      },
    });

    if (!profile) {
      return null;
    }

    return transformToStudentDTO(profile as any);
  },

  // Get student by user ID
  async getStudentByUserId(userId: number) {
    return await this.getStudentById(userId);
  },

  // Create new student
  async createStudent(data: CreateStudentData) {
    const { user: userData, profile: profileData, permissions, institutionId, facultyId, departmentId } = data;

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    return await prisma.$transaction(async (tx) => {
      // If no indexNumber provided, auto-generate one
      let indexNumber = profileData.indexNumber;
      if (!indexNumber && profileData.programId) {
        // Get program details including type and code
        const program = await tx.program.findUnique({
          where: { id: profileData.programId },
          select: { type: true, code: true },
        });

        if (program) {
          // Get prefix for this program type
          const prefixRecord = await tx.programPrefix.findUnique({
            where: { programType: program.type },
          });

          if (prefixRecord) {
            // Generate index number: PREFIX/PROGRAM_CODE/YEAR/SEQUENTIAL
            const currentYear = new Date().getFullYear().toString().slice(-2);
            const prefix = prefixRecord.prefix;

            // Extract program code part (everything after the first dash/hyphen)
            let programCode = program.code;
            const dashIndex = program.code.indexOf("-");
            if (dashIndex !== -1) {
              programCode = program.code.substring(dashIndex + 1);
            }

            // Find existing index numbers with this pattern
            const existingProfiles = await tx.roleProfile.findMany({
              where: {
                role: UserRole.STUDENT,
                metadata: {
                  path: ['indexNumber'],
                  string_starts_with: `${prefix}/${programCode}/${currentYear}/`,
                },
              },
              select: { metadata: true },
              take: 100,
            });

            let sequentialNumber = 1;
            if (existingProfiles.length > 0) {
              const numbers = existingProfiles
                .map((p) => {
                  const meta = p.metadata as any;
                  const idx = meta?.indexNumber as string;
                  if (idx) {
                    const parts = idx.split('/');
                    if (parts.length === 4) {
                      return parseInt(parts[3]);
                    }
                  }
                  return 0;
                })
                .filter((n) => !isNaN(n));

              if (numbers.length > 0) {
                sequentialNumber = Math.max(...numbers) + 1;
              }
            }

            // Format: PREFIX/PROGRAM_CODE/YY/001 (pad with zeros to 3 digits)
            indexNumber = `${prefix}/${programCode}/${currentYear}/${sequentialNumber.toString().padStart(3, "0")}`;
          }
        }
      }

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
          departmentId: departmentId || null,
          role: UserRole.STUDENT,
          status: 'ACTIVE',
        },
      });

      // Build student metadata
      const metadata: StudentMetadata = {
        studentId: profileData.studentId,
        indexNumber: indexNumber || profileData.indexNumber,
        level: profileData.level,
        semester: profileData.semester || 1,
        programId: profileData.programId,
        academicYear: profileData.academicYear,
        admissionDate: profileData.admissionDate?.toISOString(),
        expectedGraduation: profileData.expectedGraduation?.toISOString(),
        enrollmentStatus: profileData.enrollmentStatus || 'ACTIVE',
        academicStatus: profileData.academicStatus || 'GOOD_STANDING',
        guardianName: profileData.guardianName,
        guardianPhone: profileData.guardianPhone,
        guardianEmail: profileData.guardianEmail,
        emergencyContact: profileData.emergencyContact,
      };

      // Create RoleProfile for student
      const rolePermissions = permissions || DEFAULT_PERMISSIONS[UserRole.STUDENT];
      await upsertRoleProfile(
        user.id,
        UserRole.STUDENT,
        rolePermissions as RolePermissions,
        metadata as any,
        true,
        tx as any
      );

      // Return the created student profile
      return await this.getStudentById(user.id);
    });
  },

  // Update student (by userId)
  async updateStudent(userId: number, data: UpdateStudentData) {
    const { user: userData, profile: profileData, permissions, isActive } = data;

    return await prisma.$transaction(async (tx) => {
      // Get student role profile first
      const roleProfile = await tx.roleProfile.findFirst({
        where: {
          userId,
          role: UserRole.STUDENT,
        },
      });

      if (!roleProfile) {
        throw new Error("Student profile not found");
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
      return await this.getStudentById(userId);
    });
  },

  // Delete student (by userId)
  async deleteStudent(userId: number) {
    return await prisma.$transaction(async (tx) => {
      // Get student role profile first
      const roleProfile = await tx.roleProfile.findFirst({
        where: {
          userId,
          role: UserRole.STUDENT,
        },
      });

      if (!roleProfile) {
        throw new Error("Student profile not found");
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

  // Update student status (by userId)
  async updateStudentStatus(
    userId: number,
    statusData: {
      enrollmentStatus?: any;
      academicStatus?: any;
    }
  ) {
    return await prisma.$transaction(async (tx) => {
      const roleProfile = await tx.roleProfile.findFirst({
        where: {
          userId,
          role: UserRole.STUDENT,
        },
      });

      if (!roleProfile) {
        throw new Error("Student profile not found");
      }

      const currentMetadata = roleProfile.metadata as any;

      await tx.roleProfile.update({
        where: { id: roleProfile.id },
        data: {
          metadata: {
            ...currentMetadata,
            ...statusData,
          },
        },
      });

      return await this.getStudentById(userId);
    });
  },

  // Bulk import students
  async bulkImportStudents(studentsData: CreateStudentData[]) {
    const results = {
      successful: [] as any[],
      failed: [] as any[],
    };

    for (const studentData of studentsData) {
      try {
        const student = await this.createStudent(studentData);
        results.successful.push(student);
      } catch (error) {
        results.failed.push({
          data: studentData,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  },

  // Get student statistics
  async getStudentStats(params: StudentStatsParams) {
    const { institutionId, facultyId, departmentId } = params;

    const baseWhere: any = {
      role: UserRole.STUDENT,
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

    // Get all student profiles for this scope
    const studentProfiles = await prisma.roleProfile.findMany({
      where: baseWhere,
      include: {
        user: true,
      },
    });

    // Process metadata for statistics
    const metadataList = studentProfiles.map((p) => p.metadata as any);

    const totalStudents = studentProfiles.length;
    const activeStudents = metadataList.filter(
      (m) => m.enrollmentStatus === "ACTIVE"
    ).length;
    const graduatedStudents = metadataList.filter(
      (m) => m.enrollmentStatus === "GRADUATED"
    ).length;
    const suspendedStudents = metadataList.filter(
      (m) => m.enrollmentStatus === "SUSPENDED"
    ).length;

    // Group by enrollment status
    const enrollmentsByStatus = metadataList.reduce((acc: any, m: any) => {
      const status = m.enrollmentStatus || "ACTIVE";
      if (!acc[status]) {
        acc[status] = { enrollmentStatus: status, _count: 0 };
      }
      acc[status]._count++;
      return acc;
    }, {});

    // Group by level
    const studentsByLevel = metadataList.reduce((acc: any, m: any) => {
      const level = m.level || 1;
      if (!acc[level]) {
        acc[level] = { level, _count: 0 };
      }
      acc[level]._count++;
      return acc;
    }, {});

    // Group by program
    const studentsByProgram = studentProfiles.reduce((acc: any, p: any) => {
      const metadata = p.metadata as any;
      const programId = metadata.programId;
      if (programId) {
        if (!acc[programId]) {
          acc[programId] = { programId, _count: 0 };
        }
        acc[programId]._count++;
      }
      return acc;
    }, {});

    return {
      overview: {
        total: totalStudents,
        active: activeStudents,
        graduated: graduatedStudents,
        suspended: suspendedStudents,
      },
      byEnrollmentStatus: Object.values(enrollmentsByStatus),
      byLevel: Object.values(studentsByLevel),
      byProgram: Object.values(studentsByProgram),
    };
  },

  // Export students data
  async exportStudents(filters: any, format: "csv" | "excel" = "csv") {
    // Get all students without pagination for export
    const { data: students } = await this.getStudents({
      ...filters,
      limit: 10000,
      page: 1,
    });

    if (format === "csv") {
      return this.generateCSV(students);
    } else {
      return this.generateExcel(students);
    }
  },

  // Generate CSV format
  generateCSV(students: any[]): string {
    const headers = [
      "Student ID",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Program",
      "Level",
      "Semester",
      "CGPA",
      "Enrollment Status",
      "Academic Status",
      "Enrollment Date",
    ];

    const csvRows = [
      headers.join(","),
      ...students.map((student) =>
        [
          student.studentId || "",
          student.user.firstName || "",
          student.user.lastName || "",
          student.user.email || "",
          student.user.phone || "",
          student.program?.name || "",
          student.level || "",
          student.semester || "",
          student.cgpa || "",
          student.enrollmentStatus || "",
          student.academicStatus || "",
          student.enrollmentDate
            ? new Date(student.enrollmentDate).toLocaleDateString()
            : "",
        ]
          .map((field) => `"${String(field).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];

    return csvRows.join("\n");
  },

  // Generate Excel format (simplified - returns CSV for now)
  generateExcel(students: any[]): string {
    // For a full Excel implementation, you would use a library like 'exceljs'
    // For now, return CSV format
    return this.generateCSV(students);
  },

  // Get import template
  async getImportTemplate(format: "csv" | "excel" = "csv") {
    const headers = [
      "Student ID",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Date of Birth (YYYY-MM-DD)",
      "Gender",
      "Address",
      "Program ID",
      "Level",
      "Semester",
      "Academic Year",
      "Enrollment Date (YYYY-MM-DD)",
      "Emergency Contact",
      "Parent/Guardian Name",
      "Parent/Guardian Phone",
      "Parent/Guardian Email",
    ];

    // Return CSV format template with headers
    return headers.join(",") + "\n";
  },

  // Get students by department
  async getStudentsByDepartment(params: {
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
      role: UserRole.STUDENT,
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

    const students = transformStudentsToListItems(profiles as any);
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: "Students retrieved successfully",
      data: {
        students,
        total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },
};
