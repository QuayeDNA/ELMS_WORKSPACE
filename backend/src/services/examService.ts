import { PrismaClient, ExamStatus } from "@prisma/client";
import {
  Exam,
  CreateExamData,
  UpdateExamData,
  ExamQuery,
  ExamWithStats,
} from "../types/exam";

const prisma = new PrismaClient();

export const examService = {
  // Get all exams with pagination and filtering
  async getExams(query: ExamQuery) {
    const {
      institutionId,
      facultyId,
      departmentId,
      courseId,
      venueId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      search = "",
      sortBy = "examDate",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (institutionId) {
      where.course = {
        ...where.course,
        department: {
          faculty: {
            institutionId: institutionId,
          },
        },
      };
    }

    if (facultyId) {
      where.facultyId = facultyId;
    }

    if (departmentId) {
      where.course = {
        ...where.course,
        departmentId: departmentId,
      };
    }

    if (courseId) {
      where.courseId = courseId;
    }

    if (venueId) {
      where.venueId = venueId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.examDate = {};
      if (startDate) {
        where.examDate.gte = startDate;
      }
      if (endDate) {
        where.examDate.lte = endDate;
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { course: { name: { contains: search, mode: "insensitive" } } },
        { course: { code: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Get total count
    const total = await prisma.exam.count({ where });

    // Get exams with relations
    const exams = await prisma.exam.findMany({
      where,
      include: {
        course: {
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
        faculty: {
          include: {
            institution: true,
          },
        },
        venue: true,
        room: true,
        _count: {
          select: {
            scripts: true,
            incidents: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    // Transform data to include computed fields
    const transformedExams = exams.map((exam) => ({
      ...exam,
      scriptCount: exam._count.scripts,
      incidentCount: exam._count.incidents,
      studentCount: 0, // TODO: Calculate enrolled students for this exam
    }));

    return {
      exams: transformedExams,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Get single exam by ID
  async getExamById(id: number): Promise<ExamWithStats | null> {
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        course: {
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
        faculty: {
          include: {
            institution: true,
          },
        },
        venue: true,
        room: true,
        scripts: {
          select: {
            id: true,
            status: true,
          },
        },
        incidents: {
          select: {
            id: true,
            status: true,
            severity: true,
          },
        },
        _count: {
          select: {
            scripts: true,
            incidents: true,
          },
        },
      },
    });

    if (!exam) {
      return null;
    }

    // Calculate student count (scripts represent enrolled students)
    const studentCount = exam.scripts.length;

    return {
      ...exam,
      venue: exam.venue || undefined,
      room: exam.room || undefined,
      scriptCount: exam._count.scripts,
      incidentCount: exam._count.incidents,
      studentCount,
    };
  },

  // Create new exam
  async createExam(data: CreateExamData, createdBy: number): Promise<Exam> {
    // Validate that course belongs to faculty
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
      include: { department: { include: { faculty: true } } },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    if (course.department.facultyId !== data.facultyId) {
      throw new Error("Course does not belong to the specified faculty");
    }

    // Validate venue and room if provided
    if (data.venueId) {
      const venue = await prisma.venue.findUnique({
        where: { id: data.venueId },
        include: { institution: true },
      });

      if (!venue) {
        throw new Error("Venue not found");
      }

      // Check if venue belongs to same institution as faculty
      if (venue.institutionId !== course.department.faculty.institutionId) {
        throw new Error("Venue does not belong to the same institution");
      }

      if (data.roomId) {
        const room = await prisma.room.findUnique({
          where: { id: data.roomId, venueId: data.venueId },
        });

        if (!room) {
          throw new Error("Room not found in the specified venue");
        }
      }
    }

    // Validate exam timing
    if (data.endTime <= data.startTime) {
      throw new Error("End time must be after start time");
    }

    const duration = Math.round(
      (data.endTime.getTime() - data.startTime.getTime()) / (1000 * 60)
    );
    if (duration !== data.duration) {
      throw new Error("Duration does not match start and end times");
    }

    const exam = await prisma.exam.create({
      data: {
        ...data,
        createdBy,
      },
      include: {
        course: {
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
        faculty: {
          include: {
            institution: true,
          },
        },
        venue: true,
        room: true,
      },
    });

    return {
      ...exam,
      venue: exam.venue || undefined,
      room: exam.room || undefined,
      scriptCount: 0,
      incidentCount: 0,
      studentCount: 0,
    };
  },

  // Update exam
  async updateExam(id: number, data: UpdateExamData): Promise<Exam> {
    // Get existing exam
    const existingExam = await prisma.exam.findUnique({
      where: { id },
      include: {
        course: { include: { department: { include: { faculty: true } } } },
      },
    });

    if (!existingExam) {
      throw new Error("Exam not found");
    }

    // Validate faculty change
    if (data.facultyId && data.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: data.courseId },
        include: { department: true },
      });

      if (!course) {
        throw new Error("Course not found");
      }

      if (course.department.facultyId !== data.facultyId) {
        throw new Error("Course does not belong to the specified faculty");
      }
    }

    // Validate venue/room changes
    if (data.venueId !== undefined) {
      if (data.venueId) {
        const venue = await prisma.venue.findUnique({
          where: { id: data.venueId },
          include: { institution: true },
        });

        if (!venue) {
          throw new Error("Venue not found");
        }

        if (
          venue.institutionId !==
          existingExam.course.department.faculty.institutionId
        ) {
          throw new Error("Venue does not belong to the same institution");
        }
      }

      if (data.roomId !== undefined) {
        if (data.roomId && data.venueId) {
          const room = await prisma.room.findUnique({
            where: { id: data.roomId, venueId: data.venueId },
          });

          if (!room) {
            throw new Error("Room not found in the specified venue");
          }
        } else if (data.roomId) {
          throw new Error("Cannot set room without venue");
        }
      }
    }

    // Validate timing changes
    if (data.startTime || data.endTime || data.duration) {
      const startTime = data.startTime || existingExam.startTime;
      const endTime = data.endTime || existingExam.endTime;
      const duration = data.duration || existingExam.duration;

      if (endTime <= startTime) {
        throw new Error("End time must be after start time");
      }

      const calculatedDuration = Math.round(
        (endTime.getTime() - startTime.getTime()) / (1000 * 60)
      );
      if (calculatedDuration !== duration) {
        throw new Error("Duration does not match start and end times");
      }
    }

    const exam = await prisma.exam.update({
      where: { id },
      data,
      include: {
        course: {
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
        faculty: {
          include: {
            institution: true,
          },
        },
        venue: true,
        room: true,
      },
    });

    // Get counts
    const counts = await prisma.exam.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            scripts: true,
            incidents: true,
          },
        },
      },
    });

    return {
      ...exam,
      venue: exam.venue || undefined,
      room: exam.room || undefined,
      scriptCount: counts?._count.scripts || 0,
      incidentCount: counts?._count.incidents || 0,
      studentCount: counts?._count.scripts || 0,
    };
  },

  // Delete exam
  async deleteExam(id: number): Promise<void> {
    // Check if exam has scripts or incidents
    const exam = await prisma.exam.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            scripts: true,
            incidents: true,
          },
        },
      },
    });

    if (!exam) {
      throw new Error("Exam not found");
    }

    if (exam._count.scripts > 0 || exam._count.incidents > 0) {
      throw new Error("Cannot delete exam with existing scripts or incidents");
    }

    await prisma.exam.delete({
      where: { id },
    });
  },

  // Get exams by faculty
  async getExamsByFaculty(
    facultyId: number,
    query: Omit<ExamQuery, "facultyId"> = {}
  ) {
    return this.getExams({ ...query, facultyId });
  },

  // Get exams by course
  async getExamsByCourse(
    courseId: number,
    query: Omit<ExamQuery, "courseId"> = {}
  ) {
    return this.getExams({ ...query, courseId });
  },

  // Get exams by venue
  async getExamsByVenue(
    venueId: number,
    query: Omit<ExamQuery, "venueId"> = {}
  ) {
    return this.getExams({ ...query, venueId });
  },

  // Update exam status
  async updateExamStatus(id: number, status: ExamStatus): Promise<Exam> {
    const exam = await prisma.exam.update({
      where: { id },
      data: { status },
      include: {
        course: {
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
        faculty: {
          include: {
            institution: true,
          },
        },
        venue: true,
        room: true,
      },
    });

    // Get counts
    const counts = await prisma.exam.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            scripts: true,
            incidents: true,
          },
        },
      },
    });

    return {
      ...exam,
      venue: exam.venue || undefined,
      room: exam.room || undefined,
      scriptCount: counts?._count.scripts || 0,
      incidentCount: counts?._count.incidents || 0,
      studentCount: counts?._count.scripts || 0,
    };
  },
};
