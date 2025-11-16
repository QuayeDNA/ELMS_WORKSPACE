import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class CourseOfferingService {
  /**
   * Get all course offerings for a specific semester filtered by institution
   */
  async getCourseOfferingsBySemester(semesterId: number, institutionId: number) {
    const offerings = await prisma.courseOffering.findMany({
      where: {
        semesterId,
        status: 'active',
        course: {
          department: {
            faculty: {
              institutionId
            }
          }
        }
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            creditHours: true,
            courseType: true,
            level: true,
            department: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        },
        primaryLecturer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        semester: {
          select: {
            id: true,
            name: true,
            semesterNumber: true
          }
        }
      },
      orderBy: {
        course: {
          code: 'asc'
        }
      }
    });

    // Transform to match frontend expectations
    return offerings.map((offering: any) => ({
      id: offering.id.toString(),
      course: {
        id: offering.course.id.toString(),
        code: offering.course.code,
        name: offering.course.name,
        credits: offering.course.creditHours,
        courseType: offering.course.courseType,
        level: offering.course.level,
        department: offering.course.department
      },
      lecturer: offering.primaryLecturer ? {
        id: offering.primaryLecturer.id,
        firstName: offering.primaryLecturer.firstName,
        lastName: offering.primaryLecturer.lastName,
        email: offering.primaryLecturer.email
      } : null,
      semester: offering.semester,
      maxEnrollment: offering.maxEnrollment,
      status: offering.status
    }));
  }

  /**
   * Get a single course offering by ID
   */
  async getCourseOfferingById(id: number) {
    const offering = await prisma.courseOffering.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            department: true
          }
        },
        primaryLecturer: true,
        semester: true
      }
    });

    if (!offering) {
      return null;
    }

    // Use currentEnrollment field instead of counting
    const totalEnrolled = offering.currentEnrollment;

    return {
      ...offering,
      totalEnrolled,
      availableSeats: offering.maxEnrollment ? offering.maxEnrollment - totalEnrolled : null
    };
  }
}

export const courseOfferingService = new CourseOfferingService();
