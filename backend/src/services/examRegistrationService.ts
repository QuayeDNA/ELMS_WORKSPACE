import { PrismaClient } from '@prisma/client';
import { QRCodeService } from './qrCodeService';
import {
  ExamRegistration,
  CreateExamRegistrationData,
  ExamRegistrationQuery,
  StudentAttendanceData,
  RegistrationStatistics
} from '../types/examRegistration';

const prisma = new PrismaClient();

export class ExamRegistrationService {
  /**
   * Auto-register all eligible students when timetable is published
   * This is triggered when timetable status changes to PUBLISHED
   */
  static async autoRegisterStudentsForTimetable(timetableId: number): Promise<{
    success: boolean;
    registrationsCreated: number;
    batchScriptsCreated: number;
    message: string;
  }> {
    try {
      // Get all exam entries for this timetable
      const examEntries = await prisma.examTimetableEntry.findMany({
        where: { timetableId },
        include: {
          course: {
            include: {
              department: {
                include: {
                  programs: true
                }
              }
            }
          },
          timetable: {
            include: {
              semester: true,
              academicYear: true
            }
          }
        }
      });

      let totalRegistrations = 0;
      let totalBatchScripts = 0;

      // Process each exam entry
      for (const entry of examEntries) {
        const result = await this.autoRegisterStudentsForExamEntry(entry.id);
        totalRegistrations += result.registrationsCreated;
        totalBatchScripts += result.batchScriptsCreated;
      }

      return {
        success: true,
        registrationsCreated: totalRegistrations,
        batchScriptsCreated: totalBatchScripts,
        message: `Successfully registered ${totalRegistrations} students for ${examEntries.length} exams`
      };
    } catch (error) {
      console.error('Error in autoRegisterStudentsForTimetable:', error);
      throw error;
    }
  }

  /**
   * Auto-register students for a specific exam entry
   */
  static async autoRegisterStudentsForExamEntry(examEntryId: number): Promise<{
    registrationsCreated: number;
    batchScriptsCreated: number;
  }> {
    try {
      // Get exam entry details
      const examEntry = await prisma.examTimetableEntry.findUnique({
        where: { id: examEntryId },
        include: {
          course: true,
          timetable: {
            include: {
              semester: true
            }
          }
        }
      });

      if (!examEntry) {
        throw new Error('Exam entry not found');
      }

      // Parse program IDs from the exam entry
      const programIds = JSON.parse(examEntry.programIds) as number[];

      // Get all students enrolled in this course for these programs
      const enrolledStudents = await prisma.enrollment.findMany({
        where: {
          courseId: examEntry.courseId,
          semesterId: examEntry.timetable.semesterId,
          student: {
            studentProfiles: {
              programId: {
                in: programIds
              }
            }
          }
        },
        include: {
          student: {
            include: {
              studentProfiles: true
            }
          }
        }
      });

      const registrations: CreateExamRegistrationData[] = [];

      // Create registration data for each student
      for (const enrollment of enrolledStudents) {
        const studentQRCode = QRCodeService.generateStudentQRCode({
          studentId: enrollment.studentId,
          examEntryId: examEntry.id,
          courseId: examEntry.courseId
        });

        registrations.push({
          studentId: enrollment.studentId,
          examEntryId: examEntry.id,
          courseId: examEntry.courseId,
          studentQRCode
        });
      }

      // Bulk create registrations
      await prisma.examRegistration.createMany({
        data: registrations,
        skipDuplicates: true
      });

      // Create batch script container
      const batchQRCode = QRCodeService.generateBatchQRCode({
        batchId: 0, // Temporary, will be updated after creation
        courseId: examEntry.courseId,
        courseCode: examEntry.course.code,
        examEntryId: examEntry.id
      });

      const batchScript = await prisma.batchScript.create({
        data: {
          examEntryId: examEntry.id,
          courseId: examEntry.courseId,
          batchQRCode,
          totalRegistered: registrations.length,
          status: 'PENDING'
        }
      });

      // Update batch QR code with actual batch ID
      const updatedBatchQRCode = QRCodeService.generateBatchQRCode({
        batchId: batchScript.id,
        courseId: examEntry.courseId,
        courseCode: examEntry.course.code,
        examEntryId: examEntry.id
      });

      await prisma.batchScript.update({
        where: { id: batchScript.id },
        data: { batchQRCode: updatedBatchQRCode }
      });

      return {
        registrationsCreated: registrations.length,
        batchScriptsCreated: 1
      };
    } catch (error) {
      console.error('Error in autoRegisterStudentsForExamEntry:', error);
      throw error;
    }
  }

  /**
   * Get all registrations for a specific exam entry
   */
  static async getRegistrationsForExamEntry(
    examEntryId: number,
    query?: ExamRegistrationQuery
  ): Promise<ExamRegistration[]> {
    try {
      const registrations = await prisma.examRegistration.findMany({
        where: {
          examEntryId,
          ...(query?.scriptSubmitted !== undefined && { scriptSubmitted: query.scriptSubmitted }),
          ...(query?.isPresent !== undefined && { isPresent: query.isPresent })
        },
        include: {
          student: {
            include: {
              studentProfiles: true
            }
          },
          examEntry: {
            include: {
              course: true,
              venue: true
            }
          }
        },
        orderBy: {
          student: {
            lastName: 'asc'
          }
        }
      });

      return registrations as any;
    } catch (error) {
      console.error('Error in getRegistrationsForExamEntry:', error);
      throw error;
    }
  }

  /**
   * Get registration by student QR code
   */
  static async getRegistrationByQRCode(studentQRCode: string): Promise<ExamRegistration | null> {
    try {
      const registration = await prisma.examRegistration.findUnique({
        where: { studentQRCode },
        include: {
          student: {
            include: {
              studentProfiles: true
            }
          },
          examEntry: {
            include: {
              course: true,
              venue: true,
              timetable: true
            }
          }
        }
      });

      return registration as any;
    } catch (error) {
      console.error('Error in getRegistrationByQRCode:', error);
      throw error;
    }
  }

  /**
   * Mark student attendance
   */
  static async markAttendance(data: StudentAttendanceData): Promise<ExamRegistration> {
    try {
      const registration = await prisma.examRegistration.update({
        where: {
          studentId_examEntryId: {
            studentId: data.studentId,
            examEntryId: data.examEntryId
          }
        },
        data: {
          isPresent: data.isPresent,
          attendanceMarkedAt: new Date(),
          attendanceMarkedBy: data.markedBy,
          seatNumber: data.seatNumber,
          notes: data.notes
        },
        include: {
          student: {
            include: {
              studentProfiles: true
            }
          },
          examEntry: {
            include: {
              course: true
            }
          }
        }
      });

      return registration as any;
    } catch (error) {
      console.error('Error in markAttendance:', error);
      throw error;
    }
  }

  /**
   * Get registration statistics for an exam entry
   */
  static async getRegistrationStatistics(examEntryId: number): Promise<RegistrationStatistics> {
    try {
      const [total, present, submitted] = await Promise.all([
        prisma.examRegistration.count({
          where: { examEntryId }
        }),
        prisma.examRegistration.count({
          where: { examEntryId, isPresent: true }
        }),
        prisma.examRegistration.count({
          where: { examEntryId, scriptSubmitted: true }
        })
      ]);

      const pending = total - submitted;
      const submissionRate = total > 0 ? (submitted / total) * 100 : 0;
      const attendanceRate = total > 0 ? (present / total) * 100 : 0;

      return {
        totalRegistered: total,
        totalPresent: present,
        totalSubmitted: submitted,
        totalPending: pending,
        submissionRate: Math.round(submissionRate * 100) / 100,
        attendanceRate: Math.round(attendanceRate * 100) / 100
      };
    } catch (error) {
      console.error('Error in getRegistrationStatistics:', error);
      throw error;
    }
  }

  /**
   * Get active exam entries for a student (for QR scan)
   */
  static async getActiveExamsForStudent(studentId: number): Promise<any[]> {
    try {
      const now = new Date();

      // Get registrations for exams happening today or in near future
      const registrations = await prisma.examRegistration.findMany({
        where: {
          studentId,
          examEntry: {
            examDate: {
              gte: new Date(now.setHours(0, 0, 0, 0)), // Start of today
              lte: new Date(now.setHours(23, 59, 59, 999)) // End of today
            }
          }
        },
        include: {
          examEntry: {
            include: {
              course: true,
              venue: true
            }
          }
        }
      });

      return registrations.map(reg => ({
        examEntryId: reg.examEntry.id,
        courseId: reg.examEntry.courseId,
        courseCode: reg.examEntry.course.code,
        courseName: reg.examEntry.course.name,
        examDate: reg.examEntry.examDate,
        startTime: reg.examEntry.startTime,
        endTime: reg.examEntry.endTime,
        venueName: reg.examEntry.venue.name,
        canSubmit: reg.isPresent && !reg.scriptSubmitted,
        alreadySubmitted: reg.scriptSubmitted,
        isPresent: reg.isPresent
      }));
    } catch (error) {
      console.error('Error in getActiveExamsForStudent:', error);
      throw error;
    }
  }

  /**
   * Get students who haven't submitted scripts
   */
  static async getMissingScripts(examEntryId: number): Promise<any[]> {
    try {
      const registrations = await prisma.examRegistration.findMany({
        where: {
          examEntryId,
          isPresent: true,
          scriptSubmitted: false
        },
        include: {
          student: {
            include: {
              studentProfiles: true
            }
          }
        },
        orderBy: {
          student: {
            lastName: 'asc'
          }
        }
      });

      return registrations.map(reg => ({
        registrationId: reg.id,
        studentId: reg.studentId,
        firstName: reg.student.firstName,
        lastName: reg.student.lastName,
        indexNumber: reg.student.studentProfiles?.indexNumber,
        seatNumber: reg.seatNumber,
        attendanceMarkedAt: reg.attendanceMarkedAt
      }));
    } catch (error) {
      console.error('Error in getMissingScripts:', error);
      throw error;
    }
  }
}
