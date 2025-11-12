import { PrismaClient } from "@prisma/client";
import {
  CreateStudentData,
  UpdateStudentData,
  StudentQueryParams,
  StudentStatsParams,
} from "../types/student";
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
      sortBy = "admissionDate",
      sortOrder = "desc",
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
        search
          ? {
              OR: [
                { studentId: { contains: search, mode: "insensitive" } },
                { indexNumber: { contains: search, mode: "insensitive" } },
                {
                  user: {
                    OR: [
                      { firstName: { contains: search, mode: "insensitive" } },
                      { lastName: { contains: search, mode: "insensitive" } },
                      { email: { contains: search, mode: "insensitive" } },
                    ],
                  },
                },
              ],
            }
          : {},
        // Filter by institutional hierarchy
        departmentId
          ? {
              program: { departmentId },
            }
          : {},
        facultyId
          ? {
              program: { department: { facultyId } },
            }
          : {},
        institutionId
          ? {
              program: { department: { faculty: { institutionId } } },
            }
          : {},
      ],
    };

    // Handle sorting - properly handle user-related fields
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
      // Sort by user relation fields
      orderBy = { user: { [sortBy]: sortOrder } };
    } else {
      // Sort by studentProfile fields
      orderBy = { [sortBy]: sortOrder };
    }

    const [students, total] = await Promise.all([
      prisma.studentProfile.findMany({
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
          program: {
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
        },
      }),
      prisma.studentProfile.count({ where }),
    ]);

    return {
      success: true,
      data: students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
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
            updatedAt: true,
          },
        },
        program: {
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
      },
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
            updatedAt: true,
          },
        },
        program: {
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
      },
    });
  },

  // Get student by user ID
  async getStudentByUserId(userId: number) {
    return await prisma.studentProfile.findUnique({
      where: { userId },
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
          },
        },
        program: {
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
      },
    });
  },

  // Create new student
  async createStudent(data: CreateStudentData) {
    const { user: userData, profile: profileData } = data;

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
            const currentYear = new Date().getFullYear().toString().slice(-2); // Last 2 digits
            const prefix = prefixRecord.prefix;

            // Extract program code part (everything after the first dash/hyphen)
            let programCode = program.code;
            const dashIndex = program.code.indexOf("-");
            if (dashIndex !== -1) {
              programCode = program.code.substring(dashIndex + 1);
            }

            // Find the highest sequential number for this prefix, program code, and year
            const existingNumbers = await tx.studentProfile.findMany({
              where: {
                indexNumber: {
                  startsWith: `${prefix}/${programCode}/${currentYear}/`,
                },
              },
              select: { indexNumber: true },
              orderBy: { indexNumber: "desc" },
              take: 1,
            });

            let sequentialNumber = 1;
            if (existingNumbers.length > 0 && existingNumbers[0].indexNumber) {
              const lastIndexNumber = existingNumbers[0].indexNumber;
              const parts = lastIndexNumber.split("/");
              if (parts.length === 4) {
                const lastSequential = parseInt(parts[3]);
                if (!isNaN(lastSequential)) {
                  sequentialNumber = lastSequential + 1;
                }
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
          ...userData,
          password: hashedPassword,
          role: "STUDENT",
        },
      });

      // Create student profile
      const studentProfile = await tx.studentProfile.create({
        data: {
          userId: user.id,
          ...profileData,
          indexNumber: indexNumber || profileData.indexNumber,
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
            },
          },
          program: {
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
        },
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
        include: { user: true },
      });

      if (!studentProfile) {
        throw new Error("Student not found");
      }

      // Update user if user data provided
      if (userData) {
        await tx.user.update({
          where: { id: studentProfile.userId },
          data: userData,
        });
      }

      // Update student profile if profile data provided
      if (profileData) {
        await tx.studentProfile.update({
          where: { id },
          data: profileData,
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
              createdAt: true,
            },
          },
          program: {
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
        },
      });
    });
  },

  // Delete student
  async deleteStudent(id: number) {
    return await prisma.$transaction(async (tx) => {
      // Get student profile first
      const studentProfile = await tx.studentProfile.findUnique({
        where: { id },
      });

      if (!studentProfile) {
        throw new Error("Student not found");
      }

      // Delete student profile (this will cascade delete the user)
      await tx.studentProfile.delete({
        where: { id },
      });

      // Delete associated user
      await tx.user.delete({
        where: { id: studentProfile.userId },
      });
    });
  },

  // Update student status
  async updateStudentStatus(
    id: number,
    statusData: {
      enrollmentStatus?: any;
      academicStatus?: any;
    }
  ) {
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
            createdAt: true,
          },
        },
        program: {
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
      },
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
      studentsByProgram,
    ] = await Promise.all([
      // Total students
      prisma.studentProfile.count({ where: baseWhere }),

      // Active students
      prisma.studentProfile.count({
        where: { ...baseWhere, enrollmentStatus: "ACTIVE" },
      }),

      // Graduated students
      prisma.studentProfile.count({
        where: { ...baseWhere, enrollmentStatus: "GRADUATED" },
      }),

      // Suspended students
      prisma.studentProfile.count({
        where: { ...baseWhere, enrollmentStatus: "SUSPENDED" },
      }),

      // Students by enrollment status
      prisma.studentProfile.groupBy({
        by: ["enrollmentStatus"],
        where: baseWhere,
        _count: true,
      }),

      // Students by level
      prisma.studentProfile.groupBy({
        by: ["level"],
        where: baseWhere,
        _count: true,
      }),

      // Students by program
      prisma.studentProfile.groupBy({
        by: ["programId"],
        where: baseWhere,
        _count: true,
      }),
    ]);

    return {
      overview: {
        total: totalStudents,
        active: activeStudents,
        graduated: graduatedStudents,
        suspended: suspendedStudents,
      },
      byEnrollmentStatus: enrollmentsByStatus,
      byLevel: studentsByLevel,
      byProgram: studentsByProgram,
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
      sortBy = "admissionDate",
      sortOrder = "desc",
    } = params;

    const skip = (page - 1) * limit;

    const where: any = {
      program: {
        departmentId,
      },
      ...(search
        ? {
            OR: [
              { studentId: { contains: search, mode: "insensitive" } },
              { indexNumber: { contains: search, mode: "insensitive" } },
              {
                user: {
                  OR: [
                    { firstName: { contains: search, mode: "insensitive" } },
                    { lastName: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                  ],
                },
              },
            ],
          }
        : {}),
    };

    const [students, total] = await Promise.all([
      prisma.studentProfile.findMany({
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
          program: {
            select: {
              id: true,
              name: true,
              code: true,
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
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.studentProfile.count({ where }),
    ]);

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
