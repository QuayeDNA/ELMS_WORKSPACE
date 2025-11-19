import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PrerequisiteCheck {
  courseId: number;
  courseCode: string;
  prerequisitesMet: boolean;
  missingPrerequisites: Array<{
    courseId: number;
    courseCode: string;
    courseName: string;
  }>;
  completedPrerequisites: Array<{
    courseId: number;
    courseCode: string;
    courseName: string;
    grade: string;
  }>;
}

/**
 * PrerequisiteService
 * Handles prerequisite validation for course registration
 */
export class PrerequisiteService {

  /**
   * Check if a student has met prerequisites for a course
   */
  async checkPrerequisites(
    studentId: number,
    courseId: number,
    programId?: number
  ): Promise<PrerequisiteCheck> {
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new Error('Course not found');
    }

    // Get student details
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        courseEnrollments: {
          where: {
            grade: { not: null },
            status: 'ACTIVE'
          },
          include: {
            courseOffering: {
              include: {
                course: true
              }
            }
          }
        },
        roleProfiles: true,
        academicHistory: true
      }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Get program ID from student role profile
    const studentRoleProfile = student.roleProfiles?.find(rp => rp.role === 'STUDENT');
    const studentMetadata = studentRoleProfile?.metadata as any;
    const effectiveProgramId = programId || studentMetadata?.programId;

    if (!effectiveProgramId) {
      throw new Error('Program not found for student');
    }

    // Get program course with prerequisites
    const programCourse = await prisma.programCourse.findFirst({
      where: {
        programId: effectiveProgramId,
        courseId
      }
    });

    // If no program course found or no prerequisites, return met
    if (!programCourse || !programCourse.prerequisiteCourseIds) {
      return {
        courseId,
        courseCode: course.code,
        prerequisitesMet: true,
        missingPrerequisites: [],
        completedPrerequisites: []
      };
    }

    // Parse prerequisite IDs from JSON string to number array
    const prerequisiteIds = programCourse.prerequisiteCourseIds
      ? JSON.parse(programCourse.prerequisiteCourseIds) as number[]
      : [];
    const missingPrerequisites: PrerequisiteCheck['missingPrerequisites'] = [];
    const completedPrerequisites: PrerequisiteCheck['completedPrerequisites'] = [];

    // Check each prerequisite
    for (const prereqId of prerequisiteIds) {
      const prereqCourse = await prisma.course.findUnique({
        where: { id: prereqId }
      });

      if (!prereqCourse) continue;

      // Check if student has completed this prerequisite
      const enrollment = student.courseEnrollments?.find(
        (e: any) => e.courseOffering.courseId === prereqId && e.grade && !['F', 'W'].includes(e.grade)
      );

      if (enrollment) {
        completedPrerequisites.push({
          courseId: prereqCourse.id,
          courseCode: prereqCourse.code,
          courseName: prereqCourse.name,
          grade: enrollment.grade || 'N/A'
        });
      } else {
        missingPrerequisites.push({
          courseId: prereqCourse.id,
          courseCode: prereqCourse.code,
          courseName: prereqCourse.name
        });
      }
    }

    return {
      courseId,
      courseCode: course.code,
      prerequisitesMet: missingPrerequisites.length === 0,
      missingPrerequisites,
      completedPrerequisites
    };
  }

  /**
   * Get list of missing prerequisites for a course
   */
  async getMissingPrerequisites(
    studentId: number,
    courseId: number
  ): Promise<string[]> {
    const check = await this.checkPrerequisites(studentId, courseId);
    return check.missingPrerequisites.map(p => p.courseCode);
  }

  /**
   * Check if a user can override prerequisites
   */
  canOverridePrerequisites(role: string): boolean {
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'FACULTY_ADMIN'];
    return allowedRoles.includes(role);
  }

  /**
   * Get all prerequisites for a course
   */
  async getCoursePrerequisites(courseId: number, programId: number) {
    const programCourse = await prisma.programCourse.findFirst({
      where: {
        programId,
        courseId
      }
    });

    if (!programCourse || !programCourse.prerequisiteCourseIds) {
      return [];
    }

    // Parse prerequisite IDs from JSON string to number array
    const prerequisiteIds = JSON.parse(programCourse.prerequisiteCourseIds) as number[];

    const prerequisites = await prisma.course.findMany({
      where: {
        id: { in: prerequisiteIds }
      }
    });

    return prerequisites;
  }

  /**
   * Batch check prerequisites for multiple courses
   */
  async batchCheckPrerequisites(
    studentId: number,
    courseIds: number[]
  ): Promise<PrerequisiteCheck[]> {
    const checks: PrerequisiteCheck[] = [];

    for (const courseId of courseIds) {
      const check = await this.checkPrerequisites(studentId, courseId);
      checks.push(check);
    }

    return checks;
  }

  /**
   * Get courses that require this course as a prerequisite
   */
  async getCoursesRequiringPrerequisite(
    courseId: number,
    programId: number
  ): Promise<any[]> {
    const programCourses = await prisma.programCourse.findMany({
      where: {
        programId
      },
      include: {
        course: true
      }
    });

    // Filter courses that have this course in their prerequisites
    const dependentCourses = programCourses.filter(pc => {
      if (!pc.prerequisiteCourseIds) return false;
      const prereqIds = JSON.parse(pc.prerequisiteCourseIds) as number[];
      return prereqIds.includes(courseId);
    });

    return dependentCourses.map(pc => ({
      courseId: pc.courseId,
      courseCode: pc.course.code,
      courseName: pc.course.name,
      yearInProgram: pc.yearInProgram || 1
    }));
  }

  /**
   * Validate prerequisite chain (check if prerequisites have their prerequisites met)
   */
  async validatePrerequisiteChain(
    studentId: number,
    courseId: number
  ): Promise<{
    isValid: boolean;
    chain: Array<{
      level: number;
      courseCode: string;
      met: boolean;
    }>;
  }> {
    const chain: Array<{
      level: number;
      courseCode: string;
      met: boolean;
    }> = [];

    const visited = new Set<number>();

    const checkLevel = async (cId: number, level: number = 0): Promise<boolean> => {
      if (visited.has(cId)) return true;
      visited.add(cId);

      const check = await this.checkPrerequisites(studentId, cId);

      chain.push({
        level,
        courseCode: check.courseCode,
        met: check.prerequisitesMet
      });

      if (!check.prerequisitesMet) {
        // Check each missing prerequisite
        for (const missing of check.missingPrerequisites) {
          await checkLevel(missing.courseId, level + 1);
        }
        return false;
      }

      return true;
    };

    const isValid = await checkLevel(courseId);

    return {
      isValid,
      chain: chain.sort((a, b) => b.level - a.level)
    };
  }
}

export const prerequisiteService = new PrerequisiteService();
