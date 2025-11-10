import { PrismaClient, Prisma } from '@prisma/client';
import {
  CourseRegistrationWithRelations,
  RegisteredCourseWithRelations,
  CreateCourseRegistrationData,
  UpdateCourseRegistrationData,
  AddCourseToRegistrationData,
  RegistrationValidation,
  CourseEligibility,
  RegistrationSummary,
  RegistrationStatus,
  RegistrationType,
} from '../types/registration';

const prisma = new PrismaClient();

/**
 * RegistrationService
 * Handles course registration workflow and validation
 */
export class RegistrationService {

  /**
   * Create a new course registration (DRAFT status)
   */
  async createRegistration(
    data: CreateCourseRegistrationData
  ): Promise<CourseRegistrationWithRelations> {
    const { studentId, semesterId, advisorId, notes } = data;

    // Validate student exists and is active
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          where: { semesterId },
          include: { course: true }
        },
        academicHistory: true
      }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    if (student.status !== 'ACTIVE') {
      throw new Error('Student account is not active');
    }

    // Check if registration already exists for this semester
    const existingRegistration = await prisma.courseRegistration.findFirst({
      where: {
        studentId,
        semesterId,
        status: {
          notIn: ['CANCELLED', 'REJECTED']
        }
      }
    });

    if (existingRegistration) {
      throw new Error('A registration already exists for this semester');
    }

    // Get semester details
    const semester = await prisma.semester.findUnique({
      where: { id: semesterId },
      include: { academicYear: true }
    });

    if (!semester) {
      throw new Error('Semester not found');
    }

    // Check if registration is open
    const academicPeriod = await prisma.academicPeriod.findFirst({
      where: { semesterId },
      orderBy: { createdAt: 'desc' }
    });

    if (!academicPeriod) {
      throw new Error('No academic period found for this semester');
    }

    const now = new Date();
    if (now < academicPeriod.registrationStartDate || now > academicPeriod.registrationEndDate) {
      throw new Error('Registration period is not open');
    }

    // Create the registration
    const registration = await prisma.courseRegistration.create({
      data: {
        studentId,
        semesterId,
        status: RegistrationStatus.DRAFT,
        totalCredits: 0,
        advisorId,
        notes
      },
      include: {
        student: {
          include: {
            studentProfiles: true
          }
        },
        semester: {
          include: {
            academicYear: true
          }
        },
        registeredCourses: {
          include: {
            courseOffering: {
              include: {
                course: true,
                primaryLecturer: true
              }
            }
          }
        },
        advisor: true
      }
    });

    return registration as CourseRegistrationWithRelations;
  }

  /**
   * Get a registration by ID
   */
  async getRegistrationById(
    registrationId: number
  ): Promise<CourseRegistrationWithRelations | null> {
    const registration = await prisma.courseRegistration.findUnique({
      where: { id: registrationId },
      include: {
        student: {
          include: { studentProfiles: true }
        },
        semester: {
          include: {
            academicYear: true
          }
        },
        registeredCourses: {
          include: {
            courseOffering: {
              include: {
                course: true,
                primaryLecturer: true,
              }
            }
          }
        },
        advisor: true
      }
    });

    return registration as CourseRegistrationWithRelations | null;
  }

  /**
   * Get all registrations for a student
   */
  async getStudentRegistrations(
    studentId: number,
    semesterId?: number
  ): Promise<CourseRegistrationWithRelations[]> {
    const where: Prisma.CourseRegistrationWhereInput = { studentId };
    if (semesterId) {
      where.semesterId = semesterId;
    }

    const registrations = await prisma.courseRegistration.findMany({
      where,
      include: {
        student: {
          include: {
            studentProfiles: true
          }
        },
        semester: {
          include: {
            academicYear: true
          }
        },
        registeredCourses: {
          include: {
            courseOffering: {
              include: {
                course: true,
                primaryLecturer: true,
              }
            }
          }
        },
        advisor: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return registrations as CourseRegistrationWithRelations[];
  }

  /**
   * Add a course to a registration
   */
  async addCourseToRegistration(
    registrationId: number,
    data: AddCourseToRegistrationData
  ): Promise<RegisteredCourseWithRelations> {
    const { courseOfferingId, registrationType, prerequisitesOverride, overrideReason } = data;

    // Get registration
    const registration = await this.getRegistrationById(registrationId);
    if (!registration) {
      throw new Error('Registration not found');
    }

    // Only allow adding courses to DRAFT registrations
    if (registration.status !== RegistrationStatus.DRAFT) {
      throw new Error('Can only add courses to draft registrations');
    }

    // Get course offering details
    const courseOffering = await prisma.courseOffering.findUnique({
      where: { id: courseOfferingId },
      include: {
        course: true,
        primaryLecturer: true,
        _count: {
          select: { enrollments: true, registeredCourses: true }
        }
      }
    });

    if (!courseOffering) {
      throw new Error('Course offering not found');
    }

    // Check if course is already registered
    const existingCourse = await prisma.registeredCourse.findFirst({
      where: {
        registrationId,
        courseOfferingId
      }
    });

    if (existingCourse) {
      throw new Error('Course is already registered');
    }

    // Check capacity
    const totalEnrolled = courseOffering._count.enrollments + courseOffering._count.registeredCourses;
    const maxEnrollment = courseOffering.maxEnrollment || 0;
    if (totalEnrolled >= maxEnrollment) {
      throw new Error('Course is at full capacity');
    }

    // Check eligibility
    const eligibility = await this.checkCourseEligibility(
      registration.studentId,
      courseOfferingId
    );

    if (!eligibility.isEligible && !prerequisitesOverride) {
      throw new Error(`Course not eligible: ${eligibility.reasons.join(', ')}`);
    }

    // Calculate new total credits
    const newTotalCredits = registration.totalCredits + courseOffering.course.creditHours;

    // Check credit limits (configurable, default max 24)
    const maxCredits = 24;
    const minCredits = 12;

    if (newTotalCredits > maxCredits) {
      throw new Error(`Exceeds maximum credits limit of ${maxCredits}`);
    }

    // Add the course
    const registeredCourse = await prisma.registeredCourse.create({
      data: {
        registrationId,
        courseOfferingId,
        registrationType: registrationType || RegistrationType.REGULAR,
        prerequisitesMet: eligibility.prerequisitesMet,
        prerequisitesOverride: prerequisitesOverride || false,
        overrideReason,
        isLocked: false
      },
      include: {
        courseOffering: {
          include: {
            course: true,
            primaryLecturer: true,          }
        },
        registration: true
      }
    });

    // Update total credits
    await prisma.courseRegistration.update({
      where: { id: registrationId },
      data: { totalCredits: newTotalCredits }
    });

    return registeredCourse as RegisteredCourseWithRelations;
  }

  /**
   * Remove a course from a registration
   */
  async removeCourseFromRegistration(
    registeredCourseId: number,
    dropReason?: string
  ): Promise<void> {
    const registeredCourse = await prisma.registeredCourse.findUnique({
      where: { id: registeredCourseId },
      include: {
        registration: true,
        courseOffering: {
          include: { course: true }
        }
      }
    });

    if (!registeredCourse) {
      throw new Error('Registered course not found');
    }

    // Only allow removing from DRAFT registrations
    if (registeredCourse.registration.status !== RegistrationStatus.DRAFT) {
      throw new Error('Can only remove courses from draft registrations');
    }

    // Check if course is locked
    if (registeredCourse.isLocked) {
      throw new Error('This course is locked and cannot be removed');
    }

    // Calculate new total credits
    const newTotalCredits = registeredCourse.registration.totalCredits -
                           registeredCourse.courseOffering.course.creditHours;

    // Delete the registered course
    await prisma.registeredCourse.delete({
      where: { id: registeredCourseId }
    });

    // Update total credits
    await prisma.courseRegistration.update({
      where: { id: registeredCourse.registrationId },
      data: { totalCredits: Math.max(0, newTotalCredits) }
    });
  }

  /**
   * Submit a registration for approval
   */
  async submitRegistration(registrationId: number): Promise<CourseRegistrationWithRelations> {
    const registration = await this.getRegistrationById(registrationId);

    if (!registration) {
      throw new Error('Registration not found');
    }

    if (registration.status !== RegistrationStatus.DRAFT) {
      throw new Error('Only draft registrations can be submitted');
    }

    // Validate the registration
    const validation = await this.validateRegistration(registrationId);

    if (!validation.canSubmit) {
      throw new Error(`Registration cannot be submitted: ${validation.errors.join(', ')}`);
    }

    // Update status
    const updated = await prisma.courseRegistration.update({
      where: { id: registrationId },
      data: {
        status: RegistrationStatus.SUBMITTED,
        submittedAt: new Date()
      },
      include: {
        student: {
          include: { studentProfiles: true }
        },
        semester: {
          include: {
            academicYear: true
          }
        },
        registeredCourses: {
          include: {
            courseOffering: {
              include: {
                course: true,
                primaryLecturer: true,
              }
            }
          }
        },
        advisor: true
      }
    });

    return updated as CourseRegistrationWithRelations;
  }

  /**
   * Approve a registration
   */
  async approveRegistration(
    registrationId: number,
    approverId: number
  ): Promise<CourseRegistrationWithRelations> {
    const registration = await this.getRegistrationById(registrationId);

    if (!registration) {
      throw new Error('Registration not found');
    }

    if (registration.status !== RegistrationStatus.SUBMITTED) {
      throw new Error('Only submitted registrations can be approved');
    }

    // Validate the registration
    const validation = await this.validateRegistration(registrationId);

    if (!validation.canApprove) {
      throw new Error(`Registration cannot be approved: ${validation.errors.join(', ')}`);
    }

    // Update status
    const updated = await prisma.courseRegistration.update({
      where: { id: registrationId },
      data: {
        status: RegistrationStatus.APPROVED,
        approvedBy: approverId,
        approvedAt: new Date()
      },
      include: {
        student: {
          include: { studentProfiles: true }
        },
        semester: {
          include: {
            academicYear: true
          }
        },
        registeredCourses: {
          include: {
            courseOffering: {
              include: {
                course: true,
                primaryLecturer: true,
              }
            }
          }
        },
        advisor: true
      }
    });

    // Create enrollments for approved courses
    await this.createEnrollmentsFromRegistration(registrationId);

    return updated as CourseRegistrationWithRelations;
  }

  /**
   * Reject a registration
   */
  async rejectRegistration(
    registrationId: number,
    rejectionReason: string
  ): Promise<CourseRegistrationWithRelations> {
    const registration = await this.getRegistrationById(registrationId);

    if (!registration) {
      throw new Error('Registration not found');
    }

    if (registration.status !== RegistrationStatus.SUBMITTED) {
      throw new Error('Only submitted registrations can be rejected');
    }

    // Update status
    const updated = await prisma.courseRegistration.update({
      where: { id: registrationId },
      data: {
        status: RegistrationStatus.REJECTED,
        rejectedAt: new Date(),
        rejectionReason
      },
      include: {
        student: {
          include: { studentProfiles: true }
        },
        semester: {
          include: {
            academicYear: true
          }
        },
        registeredCourses: {
          include: {
            courseOffering: {
              include: {
                course: true,
                primaryLecturer: true,
              }
            }
          }
        },
        advisor: true
      }
    });

    return updated as CourseRegistrationWithRelations;
  }

  /**
   * Validate a registration
   */
  async validateRegistration(registrationId: number): Promise<RegistrationValidation> {
    const registration = await this.getRegistrationById(registrationId);

    if (!registration) {
      throw new Error('Registration not found');
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check minimum credits (default 12)
    const minCredits = 12;
    if (registration.totalCredits < minCredits) {
      errors.push(`Must register for at least ${minCredits} credits`);
    }

    const registeredCourses = registration.registeredCourses || [];

    // Check if at least one course is registered
    if (registeredCourses.length === 0) {
      errors.push('Must register for at least one course');
    }

    // Check each course for eligibility and conflicts
    for (const regCourse of registeredCourses) {
      // Skip if courseOffering is not loaded
      if (!regCourse.courseOffering) continue;

      const eligibility = await this.checkCourseEligibility(
        registration.studentId,
        regCourse.courseOfferingId
      );

      const courseCode = regCourse.courseOffering.course.code;

      if (!eligibility.isEligible && !regCourse.prerequisitesOverride) {
        errors.push(`${courseCode}: Not eligible`);
      }

      if (eligibility.hasTimeConflict) {
        errors.push(`${courseCode}: Time conflict with another course`);
      }

      if (!eligibility.hasCapacity) {
        errors.push(`${courseCode}: Course is full`);
      }

      if (!eligibility.prerequisitesMet && !regCourse.prerequisitesOverride) {
        warnings.push(
          `${courseCode}: Missing prerequisites - ${eligibility.missingPrerequisites.join(', ')}`
        );
      }
    }

    const isValid = errors.length === 0;
    const canSubmit = isValid && registration.status === RegistrationStatus.DRAFT;
    const canApprove = isValid && registration.status === RegistrationStatus.SUBMITTED;

    return {
      isValid,
      errors,
      warnings,
      canSubmit,
      canApprove
    };
  }

  /**
   * Check if a student is eligible for a course
   */
  async checkCourseEligibility(
    studentId: number,
    courseOfferingId: number
  ): Promise<CourseEligibility> {
    const courseOffering = await prisma.courseOffering.findUnique({
      where: { id: courseOfferingId },
      include: {
        course: true,
        _count: {
          select: { enrollments: true, registeredCourses: true }
        }
      }
    });

    if (!courseOffering) {
      throw new Error('Course offering not found');
    }

    // Get student's academic history
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        studentProfiles: true,
        academicHistory: true,
        enrollments: {
          where: {
            OR: [
              { grade: { not: null } },
              { status: 'ACTIVE' }
            ]
          },
          include: { course: true }
        }
      }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const errors: string[] = [];
    const missingPrerequisites: string[] = [];

    // Check capacity
    const totalEnrolled = courseOffering._count.enrollments + courseOffering._count.registeredCourses;
    const maxEnrollment = courseOffering.maxEnrollment || 0;
    const hasCapacity = totalEnrolled < maxEnrollment;

    if (!hasCapacity) {
      errors.push('Course is at full capacity');
    }

    // Get student's program ID from student profiles
    const studentProgramId = student.studentProfiles?.programId;

    // Check prerequisites (only if student has a program)
    const programCourse = studentProgramId ? await prisma.programCourse.findFirst({
      where: {
        programId: studentProgramId,
        courseId: courseOffering.courseId
      }
    }) : null;

    let prerequisitesMet = true;

    if (programCourse?.prerequisiteCourseIds) {
      // Parse prerequisite IDs from JSON string to number array
      const prerequisiteIds = JSON.parse(programCourse.prerequisiteCourseIds) as number[];

      for (const prereqId of prerequisiteIds) {
        const hasCompleted = student.enrollments?.some(
          (enrollment: any) =>
            enrollment.courseId === prereqId &&
            enrollment.grade &&
            !['F', 'W'].includes(enrollment.grade)
        );

        if (!hasCompleted) {
          const prereqCourse = await prisma.course.findUnique({
            where: { id: prereqId }
          });

          if (prereqCourse) {
            missingPrerequisites.push(prereqCourse.code);
            prerequisitesMet = false;
          }
        }
      }
    }

    if (!prerequisitesMet) {
      errors.push('Missing required prerequisites');
    }

    // Check time conflicts (simplified - would need more complex logic in production)
    const hasTimeConflict = false; // TODO: Implement time conflict detection

    // Check level restrictions
    const currentLevel = student.academicHistory?.currentLevel || 100;
    const courseLevel = parseInt(courseOffering.course.code.substring(0, 1)) * 100;

    if (courseLevel > currentLevel + 100) {
      errors.push('Course level is too advanced for current level');
    }

    const isEligible = errors.length === 0;

    return {
      isEligible,
      prerequisitesMet,
      missingPrerequisites,
      hasCapacity,
      hasTimeConflict,
      reasons: errors,
      conflictingCourses: [] // TODO: Implement actual conflict detection
    };
  }

  /**
   * Get eligible courses for a student in a semester
   */
  async getEligibleCourses(
    studentId: number,
    semesterId: number
  ): Promise<RegisteredCourseWithRelations[]> {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        academicHistory: true
      }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Get all course offerings for the semester
    const courseOfferings = await prisma.courseOffering.findMany({
      where: {
        semesterId,
      },
      include: {
        course: true,
        primaryLecturer: true,      }
    });

    // Filter by eligibility
    const eligibleCourses: any[] = [];

    for (const offering of courseOfferings) {
      const eligibility = await this.checkCourseEligibility(studentId, offering.id);

      if (eligibility.isEligible) {
        eligibleCourses.push({
          courseOffering: offering,
          eligibility
        });
      }
    }

    return eligibleCourses;
  }

  /**
   * Create enrollments from approved registration
   */
  private async createEnrollmentsFromRegistration(registrationId: number): Promise<void> {
    const registration = await this.getRegistrationById(registrationId);

    if (!registration) {
      throw new Error('Registration not found');
    }

    if (registration.status !== RegistrationStatus.APPROVED) {
      throw new Error('Only approved registrations can create enrollments');
    }

    // Create enrollments for each registered course
    const registeredCourses = registration.registeredCourses || [];
    for (const regCourse of registeredCourses) {
      // Check if enrollment already exists
      const existingEnrollment = await prisma.enrollment.findFirst({
        where: {
          studentId: registration.studentId,
          courseOfferingId: regCourse.courseOfferingId
        }
      });

      if (!existingEnrollment && regCourse.courseOffering) {
        await prisma.enrollment.create({
          data: {
            studentId: registration.studentId,
            courseOfferingId: regCourse.courseOfferingId,
            courseId: regCourse.courseOffering.course.id,
            semesterId: registration.semesterId,
            status: 'ACTIVE',
            enrollmentDate: new Date()
          }
        });
      }
    }

    // Update registration status to COMPLETED
    await prisma.courseRegistration.update({
      where: { id: registrationId },
      data: { status: RegistrationStatus.COMPLETED }
    });
  }

  /**
   * Get registration summary for a student
   */
  async getRegistrationSummary(
    studentId: number,
    semesterId: number
  ): Promise<RegistrationSummary> {
    const registration = await prisma.courseRegistration.findFirst({
      where: { studentId, semesterId },
      include: {
        registeredCourses: {
          include: {
            courseOffering: {
              include: { course: true }
            }
          }
        }
      }
    });

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: { academicHistory: true }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const summary: RegistrationSummary = {
      studentId,
      semesterId,
      hasRegistration: !!registration,
      registrationId: registration?.id,
      status: registration?.status as any,
      totalCredits: registration?.totalCredits || 0,
      courseCount: registration?.registeredCourses.length || 0,
      canRegister: !registration || registration.status === RegistrationStatus.DRAFT,
      minCredits: 12,
      maxCredits: 24,
      remainingCredits: 24 - (registration?.totalCredits || 0)
    };

    return summary;
  }
}

export const registrationService = new RegistrationService();
