import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Simplified RegistrationService
 * Handles course registration with single-action workflow
 */
export class RegistrationService {

  /**
   * Register student for multiple courses in one action
   */
  async registerForCourses(
    studentId: number,
    semesterId: number,
    courseOfferingIds: number[]
  ): Promise<{
    success: boolean;
    message: string;
    registeredCourses: any[];
    totalCredits: number;
  }> {
    // Validate student exists and is active
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: { studentProfiles: true }
    });

    if (!student || student.status !== 'ACTIVE') {
      throw new Error('Student not found or inactive');
    }

    const institutionId = student.institutionId;
    if (!institutionId) {
      throw new Error('Student institution not found');
    }

    // Check if registration period is open
    const academicPeriod = await prisma.academicPeriod.findFirst({
      where: { semesterId },
      include: {
        semester: {
          include: {
            academicYear: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!academicPeriod) {
      throw new Error('No academic period found for this semester');
    }

    // Ensure the academic period belongs to the student's institution
    if (academicPeriod.semester.academicYear.institutionId !== institutionId) {
      throw new Error('Academic period does not belong to student\'s institution');
    }

    // Registration is always open for flexibility
    // const now = new Date();
    // if (now < academicPeriod.registrationStartDate || now > academicPeriod.registrationEndDate) {
    //   throw new Error('Registration period is not open');
    // }

    // Check if student already has an active registration
    const existingRegistration = await prisma.courseRegistration.findFirst({
      where: {
        studentId,
        semesterId,
        status: 'ACTIVE'
      }
    });

    if (existingRegistration) {
      throw new Error('Student already has an active registration for this semester');
    }

    // Validate courses and calculate total credits
    let totalCredits = 0;
    const validCourses = [];

    for (const courseOfferingId of courseOfferingIds) {
      const courseOffering = await prisma.courseOffering.findUnique({
        where: { id: courseOfferingId },
        include: {
          course: true
        }
      });

      if (!courseOffering) {
        throw new Error(`Course offering ${courseOfferingId} not found`);
      }

      // Check capacity
      const enrolledCount = await prisma.courseRegistrationItem.count({
        where: {
          courseOfferingId: courseOfferingId,
          status: 'REGISTERED'
        }
      });
      if (enrolledCount >= (courseOffering.maxEnrollment || 0)) {
        throw new Error(`Course ${courseOffering.course.code} is at full capacity`);
      }

      // Basic eligibility check (simplified)
      const isEligible = await this.checkBasicEligibility(studentId, courseOfferingId);
      if (!isEligible) {
        throw new Error(`Not eligible for course ${courseOffering.course.code}`);
      }

      totalCredits += courseOffering.course.creditHours;
      validCourses.push(courseOffering);
    }

    // Check credit limits (relaxed for development/testing)
    const maxCredits = 24;
    const minCredits = 1; // Reduced from 12 for flexibility

    if (totalCredits < minCredits) {
      throw new Error(`Must register for at least ${minCredits} credit`);
    }

    if (totalCredits > maxCredits) {
      throw new Error(`Cannot register for more than ${maxCredits} credits`);
    }

    // Create registration
    const registration = await prisma.courseRegistration.create({
      data: {
        studentId,
        semesterId,
        status: 'ACTIVE',
        totalCredits
      }
    });

    // Create registration items
    const registeredCourses = [];
    for (const courseOffering of validCourses) {
      const item = await prisma.courseRegistrationItem.create({
        data: {
          registrationId: registration.id,
          courseOfferingId: courseOffering.id,
          status: 'REGISTERED'
        },
        include: {
          courseOffering: {
            include: {
              course: true,
              primaryLecturer: true
            }
          }
        }
      });
      registeredCourses.push(item);
    }

    return {
      success: true,
      message: `Successfully registered for ${registeredCourses.length} courses`,
      registeredCourses,
      totalCredits
    };
  }

  /**
   * Get available courses for a student in a semester
   */
  async getAvailableCourses(
    studentId: number,
    semesterId: number
  ): Promise<any[]> {
    // Get student's program and level
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: studentId },
      include: {
        program: {
          include: {
            department: {
              include: {
                faculty: true
              }
            }
          }
        }
      }
    });

    if (!studentProfile?.programId) {
      throw new Error('Student program not found');
    }

    const institutionId = studentProfile.program?.department?.faculty?.institutionId;
    if (!institutionId) {
      throw new Error('Student institution not found');
    }

    // Get program courses for student's level
    const programCourses = await prisma.programCourse.findMany({
      where: {
        programId: studentProfile.programId,
        level: studentProfile.level
      },
      include: { course: true }
    });

    const courseIds = programCourses.map(pc => pc.courseId);

    // Get available course offerings
    const courseOfferings = await prisma.courseOffering.findMany({
      where: {
        semesterId,
        courseId: { in: courseIds },
        status: 'active',
        semester: {
          academicYear: {
            institutionId
          }
        }
      },
      include: {
        course: {
          include: {
            department: true
          }
        },
        primaryLecturer: true,
        semester: {
          include: {
            academicYear: true
          }
        }
      },
      orderBy: {
        course: { code: 'asc' }
      }
    });

    // Add availability and eligibility info
    const availableCourses = await Promise.all(
      courseOfferings.map(async (offering) => {
        // Count enrolled students for this offering
        const enrolled = await prisma.courseRegistrationItem.count({
          where: {
            courseOfferingId: offering.id,
            status: 'REGISTERED'
          }
        });
        const capacity = offering.maxEnrollment || 0;
        const isEligible = await this.checkBasicEligibility(studentId, offering.id);

        return {
          ...offering,
          available: enrolled < capacity,
          enrolledCount: enrolled,
          maxEnrollment: capacity,
          isEligible,
          creditHours: offering.course.creditHours
        };
      })
    );

    return availableCourses;
  }

  /**
   * Get student's current registration for a semester
   */
  async getStudentRegistration(
    studentId: number,
    semesterId: number
  ): Promise<any | null> {
    // Get student institution
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { institutionId: true }
    });

    if (!student?.institutionId) {
      throw new Error('Student institution not found');
    }

    const registration = await prisma.courseRegistration.findFirst({
      where: {
        studentId,
        semesterId,
        status: { not: 'CANCELLED' },
        semester: {
          academicYear: {
            institutionId: student.institutionId
          }
        }
      },
      include: {
        courses: {
          include: {
            courseOffering: {
              include: {
                course: true,
                primaryLecturer: true
              }
            }
          }
        },
        semester: {
          include: {
            academicYear: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!registration) {
      return null;
    }

    return {
      id: registration.id,
      status: registration.status,
      totalCredits: registration.totalCredits,
      createdAt: registration.createdAt,
      courses: registration.courses.map((item: any) => ({
        id: item.id,
        status: item.status,
        courseOffering: item.courseOffering
      }))
    };
  }

  /**
   * Drop courses from registration
   */
  async dropCourses(
    studentId: number,
    semesterId: number,
    courseOfferingIds: number[]
  ): Promise<{
    success: boolean;
    message: string;
    droppedCount: number;
    remainingCredits: number;
  }> {
    // Get student institution
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { institutionId: true }
    });

    if (!student?.institutionId) {
      throw new Error('Student institution not found');
    }

    // Get active registration
    const registration = await prisma.courseRegistration.findFirst({
      where: {
        studentId,
        semesterId,
        status: 'ACTIVE',
        semester: {
          academicYear: {
            institutionId: student.institutionId
          }
        }
      },
      include: {
        courses: {
          where: {
            courseOfferingId: { in: courseOfferingIds },
            status: 'REGISTERED'
          },
          include: {
            courseOffering: {
              include: { course: true }
            }
          }
        }
      }
    });

    if (!registration) {
      throw new Error('No active registration found');
    }

    // Update items to DROPPED
    const updatePromises = courseOfferingIds.map(courseOfferingId =>
      prisma.courseRegistrationItem.updateMany({
        where: {
          registrationId: registration.id,
          courseOfferingId,
          status: 'REGISTERED'
        },
        data: { status: 'DROPPED', droppedAt: new Date() }
      })
    );

    await Promise.all(updatePromises);

    // Recalculate total credits (only count REGISTERED courses)
    const remainingItems = await prisma.courseRegistrationItem.findMany({
      where: {
        registrationId: registration.id,
        status: 'REGISTERED'
      },
      include: {
        courseOffering: {
          include: { course: true }
        }
      }
    });

    const remainingCredits = remainingItems.reduce(
      (sum: number, item: any) => sum + (item.courseOffering?.course?.creditHours || 0),
      0
    );

    // Update registration credits
    await prisma.courseRegistration.update({
      where: { id: registration.id },
      data: { totalCredits: remainingCredits }
    });

    return {
      success: true,
      message: `Successfully dropped ${courseOfferingIds.length} courses`,
      droppedCount: courseOfferingIds.length,
      remainingCredits
    };
  }

  /**
   * Cancel entire registration
   */
  async cancelRegistration(
    studentId: number,
    semesterId: number
  ): Promise<{ success: boolean; message: string }> {
    // Get student institution
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { institutionId: true }
    });

    if (!student?.institutionId) {
      throw new Error('Student institution not found');
    }

    const registration = await prisma.courseRegistration.findFirst({
      where: {
        studentId,
        semesterId,
        status: 'ACTIVE',
        semester: {
          academicYear: {
            institutionId: student.institutionId
          }
        }
      }
    });

    if (!registration) {
      throw new Error('No active registration found');
    }

    // Update status to CANCELLED
    await prisma.courseRegistration.update({
      where: { id: registration.id },
      data: { status: 'CANCELLED' }
    });

    return {
      success: true,
      message: 'Registration cancelled successfully'
    };
  }

  /**
   * Basic eligibility check (simplified version)
   */
  private async checkBasicEligibility(
    studentId: number,
    courseOfferingId: number
  ): Promise<boolean> {
    // Get course offering
    const courseOffering = await prisma.courseOffering.findUnique({
      where: { id: courseOfferingId },
      include: { course: true }
    });

    if (!courseOffering) {
      return false;
    }

    // Get student's academic level
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: studentId }
    });

    if (!studentProfile) {
      return false;
    }

    // Basic level check (course level should not be more than 1 level ahead)
    const courseLevel = courseOffering.course.level;
    const studentLevel = studentProfile.level;

    return courseLevel <= studentLevel + 1;
  }
}

export const registrationService = new RegistrationService();
