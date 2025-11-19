import { PrismaClient, AcademicStanding } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Grade to GPA mapping
 */
const GRADE_POINTS: Record<string, number> = {
  'A': 4.0,
  'B+': 3.5,
  'B': 3.0,
  'C+': 2.5,
  'C': 2.0,
  'D+': 1.5,
  'D': 1.0,
  'F': 0.0,
  'I': 0.0,  // Incomplete
  'W': 0.0,  // Withdrawn
  'P': 0.0   // Pass (no points for pass/fail courses)
};

/**
 * Academic Standing Rules
 * Based on GPA thresholds
 */
const ACADEMIC_STANDING_RULES = {
  GOOD_STANDING: 2.0,
  ACADEMIC_WARNING: 1.75,
  PROBATION: 1.50,
  SUSPENDED: 0.0
};

/**
 * StudentSemesterRecordService
 * Manages student performance tracking per semester
 */
export class StudentSemesterRecordService {

  /**
   * Create a new semester record for a student
   */
  async createSemesterRecord(data: {
    studentId: number;
    semesterId: number;
    remarksFromAdvisor?: string;
  }) {
    const { studentId, semesterId, remarksFromAdvisor } = data;

    // Check if record already exists
    const existing = await prisma.studentSemesterRecord.findUnique({
      where: {
        studentId_semesterId: {
          studentId,
          semesterId
        }
      }
    });

    if (existing) {
      throw new Error('Semester record already exists for this student and semester');
    }

    // Verify student and semester exist
    const [student, semester] = await Promise.all([
      prisma.user.findUnique({ where: { id: studentId } }),
      prisma.semester.findUnique({ where: { id: semesterId } })
    ]);

    if (!student) {
      throw new Error('Student not found');
    }

    if (!semester) {
      throw new Error('Semester not found');
    }

    // Create the record
    return await prisma.studentSemesterRecord.create({
      data: {
        studentId,
        semesterId,
        remarksFromAdvisor,
        academicStanding: AcademicStanding.GOOD_STANDING
      },
      include: {
        student: {
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
            semesterNumber: true,
            academicYear: {
              select: {
                id: true,
                yearCode: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Get a semester record
   */
  async getSemesterRecord(studentId: number, semesterId: number) {
    const record = await prisma.studentSemesterRecord.findUnique({
      where: {
        studentId_semesterId: {
          studentId,
          semesterId
        }
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            roleProfiles: {
              select: {
                id: true,
                role: true,
                metadata: true
              }
            }
          }
        },
        semester: {
          select: {
            id: true,
            name: true,
            semesterNumber: true,
            academicYear: {
              select: {
                id: true,
                yearCode: true
              }
            }
          }
        }
      }
    });

    if (!record) {
      throw new Error('Semester record not found');
    }

    return record;
  }

  /**
   * Get all semester records for a student
   */
  async getStudentSemesterRecords(studentId: number) {
    return await prisma.studentSemesterRecord.findMany({
      where: { studentId },
      include: {
        semester: {
          select: {
            id: true,
            name: true,
            semesterNumber: true,
            academicYear: {
              select: {
                id: true,
                yearCode: true
              }
            }
          }
        }
      },
      orderBy: [
        { semester: { academicYear: { yearCode: 'desc' } } },
        { semester: { semesterNumber: 'desc' } }
      ]
    });
  }

  /**
   * Update semester record statistics
   */
  async updateSemesterRecord(
    studentId: number,
    semesterId: number,
    data: {
      coursesRegistered?: number;
      coursesCompleted?: number;
      coursesFailed?: number;
      coursesDropped?: number;
      coursesInProgress?: number;
      creditsAttempted?: number;
      creditsEarned?: number;
      remarksFromAdvisor?: string;
    }
  ) {
    // Verify record exists
    const existing = await this.getSemesterRecord(studentId, semesterId);

    // Update the record
    return await prisma.studentSemesterRecord.update({
      where: {
        studentId_semesterId: {
          studentId,
          semesterId
        }
      },
      data,
      include: {
        student: {
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
      }
    });
  }

  /**
   * Calculate semester GPA based on enrollments
   */
  async calculateSemesterGPA(studentId: number, semesterId: number) {
    // Get all completed enrollments for the semester
    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        studentId,
        semesterId,
        status: 'ACTIVE',
        grade: { not: null }
      },
      include: {
        courseOffering: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                code: true,
                creditHours: true
              }
            }
          }
        }
      }
    });

    if (enrollments.length === 0) {
      return {
        semesterGPA: null,
        totalGradePoints: 0,
        creditsAttempted: 0,
        creditsEarned: 0,
        coursesCompleted: 0
      };
    }

    let totalGradePoints = 0;
    let totalCredits = 0;
    let creditsEarned = 0;

    for (const enrollment of enrollments) {
      const grade = enrollment.grade;
      const credits = enrollment.courseOffering.course.creditHours;

      if (grade && grade in GRADE_POINTS) {
        const gradePoint = GRADE_POINTS[grade];
        totalGradePoints += gradePoint * credits;
        totalCredits += credits;

        // Credits earned only if passing grade (D or better)
        if (gradePoint >= 1.0) {
          creditsEarned += credits;
        }
      }
    }

    const semesterGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

    // Update the semester record
    await prisma.studentSemesterRecord.update({
      where: {
        studentId_semesterId: {
          studentId,
          semesterId
        }
      },
      data: {
        semesterGPA: parseFloat(semesterGPA.toFixed(2)),
        totalGradePoints: parseFloat(totalGradePoints.toFixed(2)),
        creditsAttempted: totalCredits,
        creditsEarned,
        coursesCompleted: enrollments.length,
        totalCreditsEarned: creditsEarned
      }
    });

    return {
      semesterGPA: parseFloat(semesterGPA.toFixed(2)),
      totalGradePoints: parseFloat(totalGradePoints.toFixed(2)),
      creditsAttempted: totalCredits,
      creditsEarned,
      coursesCompleted: enrollments.length
    };
  }

  /**
   * Determine academic standing based on GPA
   */
  determineAcademicStanding(gpa: number): AcademicStanding {
    if (gpa >= ACADEMIC_STANDING_RULES.GOOD_STANDING) {
      return AcademicStanding.GOOD_STANDING;
    } else if (gpa >= ACADEMIC_STANDING_RULES.ACADEMIC_WARNING) {
      return AcademicStanding.ACADEMIC_WARNING;
    } else if (gpa >= ACADEMIC_STANDING_RULES.PROBATION) {
      return AcademicStanding.PROBATION;
    } else {
      return AcademicStanding.SUSPENDED;
    }
  }

  /**
   * Update academic standing based on current GPA
   */
  async updateAcademicStanding(studentId: number, semesterId: number) {
    // Get the semester record
    const record = await this.getSemesterRecord(studentId, semesterId);

    if (!record.semesterGPA) {
      throw new Error('Semester GPA not calculated yet');
    }

    // Determine new academic standing
    const newStanding = this.determineAcademicStanding(record.semesterGPA);
    const isOnProbation = newStanding === AcademicStanding.PROBATION;

    // Update probation count if on probation
    const probationCount = isOnProbation
      ? record.probationCount + 1
      : 0;

    // Update the record
    return await prisma.studentSemesterRecord.update({
      where: {
        studentId_semesterId: {
          studentId,
          semesterId
        }
      },
      data: {
        academicStanding: newStanding,
        isOnProbation,
        probationCount
      },
      include: {
        student: {
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
      }
    });
  }

  /**
   * Finalize a semester record (lock it from changes)
   */
  async finalizeSemesterRecord(
    studentId: number,
    semesterId: number,
    finalizedBy: number
  ) {
    // Calculate GPA first
    await this.calculateSemesterGPA(studentId, semesterId);

    // Update academic standing
    await this.updateAcademicStanding(studentId, semesterId);

    // Finalize the record
    return await prisma.studentSemesterRecord.update({
      where: {
        studentId_semesterId: {
          studentId,
          semesterId
        }
      },
      data: {
        isFinalized: true,
        finalizedAt: new Date(),
        finalizedBy
      },
      include: {
        student: {
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
      }
    });
  }

  /**
   * Get semester statistics for a student
   */
  async getSemesterStatistics(studentId: number, semesterId: number) {
    const record = await this.getSemesterRecord(studentId, semesterId);

    // Get detailed enrollment information
    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        studentId,
        semesterId
      },
      include: {
        courseOffering: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                code: true,
                creditHours: true
              }
            }
          }
        }
      }
    });

    // Calculate statistics
    const byStatus = enrollments.reduce((acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byGrade = enrollments.reduce((acc, e) => {
      if (e.grade) {
        acc[e.grade] = (acc[e.grade] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      record,
      enrollments: {
        total: enrollments.length,
        byStatus,
        byGrade,
        courses: enrollments.map((e: any) => ({
          courseId: e.courseOffering.course.id,
          courseName: e.courseOffering.course.name,
          courseCode: e.courseOffering.course.code,
          credits: e.courseOffering.course.creditHours,
          grade: e.grade,
          status: e.status
        }))
      }
    };
  }
}

// Export singleton instance
export const studentSemesterRecordService = new StudentSemesterRecordService();
