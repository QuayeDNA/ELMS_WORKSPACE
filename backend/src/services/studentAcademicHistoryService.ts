import { PrismaClient, AcademicStanding } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Level Progression Rules
 * Credits required to advance to next level
 */
const LEVEL_PROGRESSION_RULES = {
  100: 0,    // Starting level
  200: 24,   // Need 24 credits to reach 200 level
  300: 60,   // Need 60 credits to reach 300 level
  400: 96    // Need 96 credits to reach 400 level
};

/**
 * StudentAcademicHistoryService
 * Manages overall student academic journey and cumulative records
 */
export class StudentAcademicHistoryService {

  /**
   * Create academic history for a new student
   */
  async createAcademicHistory(data: {
    studentId: number;
    admissionYear: string;
    admissionSemester?: number;
    expectedGraduationYear?: string;
  }) {
    const { studentId, admissionYear, admissionSemester, expectedGraduationYear } = data;

    // Check if history already exists
    const existing = await prisma.studentAcademicHistory.findUnique({
      where: { studentId }
    });

    if (existing) {
      throw new Error('Academic history already exists for this student');
    }

    // Verify student exists
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        studentProfiles: true
      }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Create academic history
    return await prisma.studentAcademicHistory.create({
      data: {
        studentId,
        admissionYear,
        admissionSemester: admissionSemester || 1,
        expectedGraduationYear,
        currentLevel: 100,
        currentSemester: 1,
        currentStatus: AcademicStanding.GOOD_STANDING
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            studentProfiles: {
              select: {
                studentId: true,
                level: true,
                programId: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Get academic history for a student
   */
  async getAcademicHistory(studentId: number) {
    const history = await prisma.studentAcademicHistory.findUnique({
      where: { studentId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            studentProfiles: {
              select: {
                studentId: true,
                level: true,
                programId: true,
                program: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                    durationYears: true,
                    creditHours: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!history) {
      throw new Error('Academic history not found');
    }

    return history;
  }

  /**
   * Update cumulative GPA based on all semester records
   */
  async updateCumulativeGPA(studentId: number) {
    // Get all finalized semester records
    const semesterRecords = await prisma.studentSemesterRecord.findMany({
      where: {
        studentId,
        isFinalized: true,
        semesterGPA: { not: null }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (semesterRecords.length === 0) {
      return {
        cumulativeGPA: null,
        totalCreditsAttempted: 0,
        totalCreditsEarned: 0,
        totalSemestersCompleted: 0
      };
    }

    // Calculate cumulative GPA
    let totalGradePoints = 0;
    let totalCredits = 0;
    let totalCreditsEarned = 0;

    for (const record of semesterRecords) {
      totalGradePoints += record.totalGradePoints;
      totalCredits += record.creditsAttempted;
      totalCreditsEarned += record.creditsEarned;
    }

    const cumulativeGPA = totalCredits > 0
      ? parseFloat((totalGradePoints / totalCredits).toFixed(2))
      : 0;

    // Update academic history
    await prisma.studentAcademicHistory.update({
      where: { studentId },
      data: {
        cumulativeGPA,
        overallCreditsAttempted: totalCredits,
        overallCreditsEarned: totalCreditsEarned,
        totalSemestersCompleted: semesterRecords.length
      }
    });

    return {
      cumulativeGPA,
      totalCreditsAttempted: totalCredits,
      totalCreditsEarned,
      totalSemestersCompleted: semesterRecords.length
    };
  }

  /**
   * Check and update level progression
   */
  async checkLevelProgression(studentId: number) {
    const history = await this.getAcademicHistory(studentId);
    const creditsEarned = history.overallCreditsEarned;

    // Determine appropriate level based on credits earned
    let newLevel = 100;
    if (creditsEarned >= LEVEL_PROGRESSION_RULES[400]) {
      newLevel = 400;
    } else if (creditsEarned >= LEVEL_PROGRESSION_RULES[300]) {
      newLevel = 300;
    } else if (creditsEarned >= LEVEL_PROGRESSION_RULES[200]) {
      newLevel = 200;
    }

    // Update level if changed
    if (newLevel !== history.currentLevel) {
      await prisma.studentAcademicHistory.update({
        where: { studentId },
        data: {
          currentLevel: newLevel
        }
      });

      // Also update student profile level
      await prisma.studentProfile.updateMany({
        where: {
          userId: studentId
        },
        data: {
          level: newLevel
        }
      });

      return {
        levelChanged: true,
        previousLevel: history.currentLevel,
        newLevel,
        creditsEarned
      };
    }

    return {
      levelChanged: false,
      currentLevel: history.currentLevel,
      creditsEarned,
      creditsToNextLevel: this.getCreditsToNextLevel(history.currentLevel, creditsEarned)
    };
  }

  /**
   * Calculate credits needed for next level
   */
  private getCreditsToNextLevel(currentLevel: number, creditsEarned: number): number {
    if (currentLevel === 400) {
      return 0; // Already at max level
    }

    const nextLevel = currentLevel + 100;
    const requiredCredits = LEVEL_PROGRESSION_RULES[nextLevel as keyof typeof LEVEL_PROGRESSION_RULES];
    return Math.max(0, requiredCredits - creditsEarned);
  }

  /**
   * Update academic standing based on cumulative GPA
   */
  async updateAcademicStanding(studentId: number) {
    const history = await this.getAcademicHistory(studentId);

    if (!history.cumulativeGPA) {
      throw new Error('Cumulative GPA not calculated yet');
    }

    // Determine academic standing
    let newStatus: AcademicStanding;
    if (history.cumulativeGPA >= 2.0) {
      newStatus = AcademicStanding.GOOD_STANDING;
    } else if (history.cumulativeGPA >= 1.75) {
      newStatus = AcademicStanding.ACADEMIC_WARNING;
    } else if (history.cumulativeGPA >= 1.5) {
      newStatus = AcademicStanding.PROBATION;
    } else {
      newStatus = AcademicStanding.SUSPENDED;
    }

    // Update the status
    return await prisma.studentAcademicHistory.update({
      where: { studentId },
      data: {
        currentStatus: newStatus
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
  }

  /**
   * Update current semester
   */
  async updateCurrentSemester(studentId: number, semesterNumber: number) {
    return await prisma.studentAcademicHistory.update({
      where: { studentId },
      data: {
        currentSemester: semesterNumber
      }
    });
  }

  /**
   * Check graduation eligibility
   */
  async checkGraduationEligibility(studentId: number) {
    const history = await this.getAcademicHistory(studentId);

    // Get program requirements
    const studentProfile = history.student.studentProfiles[0];
    if (!studentProfile || !studentProfile.program) {
      throw new Error('Student program information not found');
    }

    const program = studentProfile.program;
    const requiredCredits = program.creditHours || 120; // Default to 120 if not specified

    // Check eligibility criteria
    const isEligible =
      history.overallCreditsEarned >= requiredCredits &&
      (history.cumulativeGPA || 0) >= 2.0 &&
      history.currentLevel >= 400;

    return {
      isEligible,
      requiredCredits,
      earnedCredits: history.overallCreditsEarned,
      remainingCredits: Math.max(0, requiredCredits - history.overallCreditsEarned),
      cumulativeGPA: history.cumulativeGPA,
      currentLevel: history.currentLevel,
      academicStanding: history.currentStatus
    };
  }

  /**
   * Mark student as graduated
   */
  async markAsGraduated(studentId: number, graduationDate: Date) {
    // Check eligibility first
    const eligibility = await this.checkGraduationEligibility(studentId);

    if (!eligibility.isEligible) {
      throw new Error('Student does not meet graduation requirements');
    }

    return await prisma.studentAcademicHistory.update({
      where: { studentId },
      data: {
        hasGraduated: true,
        graduationDate
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
  }

  /**
   * Get comprehensive academic summary
   */
  async getAcademicSummary(studentId: number) {
    const history = await this.getAcademicHistory(studentId);

    // Get all semester records
    const semesterRecords = await prisma.studentSemesterRecord.findMany({
      where: { studentId },
      include: {
        semester: {
          select: {
            id: true,
            name: true,
            semesterNumber: true,
            academicYear: {
              select: {
                yearCode: true
              }
            }
          }
        }
      },
      orderBy: [
        { semester: { academicYear: { yearCode: 'asc' } } },
        { semester: { semesterNumber: 'asc' } }
      ]
    });

    // Calculate progression
    const levelProgression = await this.checkLevelProgression(studentId);
    const graduationEligibility = await this.checkGraduationEligibility(studentId);

    return {
      history,
      semesterRecords: semesterRecords.map((record: any) => ({
        semesterId: record.semesterId,
        semesterName: record.semester.name,
        academicYear: record.semester.academicYear.yearCode,
        semesterGPA: record.semesterGPA,
        creditsEarned: record.creditsEarned,
        creditsAttempted: record.creditsAttempted,
        academicStanding: record.academicStanding,
        isFinalized: record.isFinalized
      })),
      levelProgression,
      graduationEligibility,
      summary: {
        totalSemesters: semesterRecords.length,
        completedSemesters: semesterRecords.filter((r: any) => r.isFinalized).length,
        averageGPA: history.cumulativeGPA,
        totalCredits: history.overallCreditsEarned,
        currentLevel: history.currentLevel,
        academicStatus: history.currentStatus,
        hasGraduated: history.hasGraduated
      }
    };
  }

  /**
   * Get academic transcript
   */
  async getTranscript(studentId: number) {
    const summary = await this.getAcademicSummary(studentId);

    // Get all enrollments grouped by semester
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId,
        status: 'COMPLETED'
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            creditHours: true,
            level: true
          }
        },
        semester: {
          select: {
            id: true,
            name: true,
            semesterNumber: true,
            academicYear: {
              select: {
                yearCode: true
              }
            }
          }
        }
      },
      orderBy: [
        { semester: { academicYear: { yearCode: 'asc' } } },
        { semester: { semesterNumber: 'asc' } },
        { course: { code: 'asc' } }
      ]
    });

    // Group by semester
    const transcript = enrollments.reduce((acc: any, enrollment: any) => {
      const key = `${enrollment.semester.academicYear.yearCode}-${enrollment.semester.semesterNumber}`;
      if (!acc[key]) {
        acc[key] = {
          semesterName: enrollment.semester.name,
          academicYear: enrollment.semester.academicYear.yearCode,
          semesterNumber: enrollment.semester.semesterNumber,
          courses: []
        };
      }
      acc[key].courses.push({
        courseCode: enrollment.course.code,
        courseName: enrollment.course.name,
        credits: enrollment.course.creditHours,
        grade: enrollment.grade,
        level: enrollment.course.level
      });
      return acc;
    }, {});

    return {
      studentInfo: {
        id: summary.history.student.id,
        name: `${summary.history.student.firstName} ${summary.history.student.lastName}`,
        email: summary.history.student.email,
        studentId: summary.history.student.studentProfiles[0]?.studentId,
        program: summary.history.student.studentProfiles[0]?.program?.name
      },
      academicInfo: {
        admissionYear: summary.history.admissionYear,
        currentLevel: summary.history.currentLevel,
        cumulativeGPA: summary.history.cumulativeGPA,
        totalCredits: summary.history.overallCreditsEarned,
        academicStanding: summary.history.currentStatus,
        hasGraduated: summary.history.hasGraduated,
        graduationDate: summary.history.graduationDate
      },
      transcript: Object.values(transcript),
      summary: summary.summary
    };
  }
}

// Export singleton instance
export const studentAcademicHistoryService = new StudentAcademicHistoryService();
