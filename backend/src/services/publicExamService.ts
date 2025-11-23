import { PrismaClient } from '@prisma/client';
import { VerificationMethod, ExamSessionAction } from '../types/examLogistics';
import { realtimeService } from './realtimeService';
import {
  RealtimeChannel,
  ExamCheckInEvent,
  StudentCheckedInPayload,
  CheckInStatsUpdatedPayload
} from '../types/realtime';

const prisma = new PrismaClient();

interface ValidateIndexNumberResult {
  student: {
    id: number;
    indexNumber: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  activeExams: Array<{
    examEntry: {
      id: number;
      courseCode: string;
      courseName: string;
      startTime: Date;
      endTime: Date;
      duration: number;
      venue: string;
    };
    registration: {
      id: number;
      examRegistrationId: number;
      seatNumber: string | null;
      isPresent: boolean;
      isVerified: boolean;
    };
  }>;
}

interface CheckInData {
  indexNumber: string;
  examEntryId: number;
  verificationMethod: string;
}

export const publicExamService = {
  /**
   * Validate student index number and return active exam sessions
   * This replaces the old QR token validation
   */
  async validateIndexNumber(indexNumber: string): Promise<ValidateIndexNumberResult> {
    const registration = await prisma.examRegistration.findFirst({
      where: {
        id: tokenData.examRegistrationId,
        studentId: tokenData.studentId,
        examEntry: {
          id: tokenData.examEntryId
        }
      },
      include: {
        examEntry: {
          include: {
            course: {
              select: {
                code: true,
                name: true,
                creditHours: true
              }
            },
            venue: {
              select: {
                name: true,
                location: true,
                capacity: true
              }
            },
            timetable: {
              select: {
                title: true,
                academicYear: true,
                semester: true,
                isPublished: true
              }
            }
          }
        },
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

    if (!registration) {
      throw new Error('Invalid exam registration');
    }

    if (!registration.examEntry.timetable.isPublished) {
      throw new Error('Exam timetable is not published');
    }

    // Check if already verified
    const existingVerification = await prisma.studentVerification.findFirst({
      where: {
        examEntryId: registration.examEntryId,
        studentId: tokenData.studentId
      }
    });

    // Check if exam is in progress or upcoming
    const examDate = new Date(registration.examEntry.examDate);
    const startTime = new Date(registration.examEntry.startTime);
    const endTime = new Date(registration.examEntry.endTime);
    const now = new Date();

    // Allow check-in 30 minutes before exam starts
    const checkInOpenTime = new Date(startTime.getTime() - 30 * 60 * 1000);
    const isCheckInOpen = now >= checkInOpenTime && now <= endTime;

    return {
      registration: {
        id: registration.id,
        seatNumber: registration.seatNumber,
        isPresent: registration.isPresent,
        isVerified: !!existingVerification,
        verifiedAt: existingVerification?.verifiedAt || null
      },
      exam: {
        id: registration.examEntry.id,
        courseCode: registration.examEntry.course.code,
        courseTitle: registration.examEntry.course.name,
        credits: registration.examEntry.course.creditHours,
        examDate: examDate.toISOString(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: registration.examEntry.duration,
        venue: registration.examEntry.venue,
        timetable: registration.examEntry.timetable
      },
      student: registration.student,
      checkIn: {
        isOpen: isCheckInOpen,
        canCheckIn: isCheckInOpen && !existingVerification,
        message: existingVerification
          ? 'Already checked in'
          : isCheckInOpen
          ? 'Check-in is open'
          : now < checkInOpenTime
          ? 'Check-in opens 30 minutes before exam'
          : 'Check-in is closed'
      }
    };
  },

  /**
   * Check in a student for an exam
   */
  async checkInStudent(data: CheckInData) {
    // Get registration details
    const registration = await prisma.examRegistration.findUnique({
      where: { id: data.examRegistrationId },
      include: {
        examEntry: {
          include: {
            course: true,
            venue: true
          }
        },
        student: {
          include: {
            roleProfiles: {
              where: { role: 'STUDENT' }
            }
          }
        }
      }
    });

    if (!registration) {
      throw new Error('Exam registration not found');
    }

    if (registration.studentId !== data.studentId) {
      throw new Error('Student ID mismatch');
    }

    // Check if already verified
    const existingVerification = await prisma.studentVerification.findFirst({
      where: {
        examEntryId: registration.examEntryId,
        studentId: data.studentId
      }
    });

    if (existingVerification) {
      throw new Error('Student has already checked in');
    }

    // Verify check-in window
    const startTime = new Date(registration.examEntry.startTime);
    const endTime = new Date(registration.examEntry.endTime);
    const now = new Date();
    const checkInOpenTime = new Date(startTime.getTime() - 30 * 60 * 1000);

    if (now < checkInOpenTime) {
      throw new Error('Check-in is not yet open. Opens 30 minutes before exam.');
    }

    if (now > endTime) {
      throw new Error('Check-in is closed. Exam has ended.');
    }

    // Create verification record (using transaction)
    const result = await prisma.$transaction(async (tx) => {
      // Create student verification
      const verification = await tx.studentVerification.create({
        data: {
          examEntryId: registration.examEntryId,
          studentId: data.studentId,
          method: data.verificationMethod as VerificationMethod,
          seatNumber: registration.seatNumber,
          verifiedBy: data.studentId, // Self check-in
          qrCode: data.qrCode,
          verifiedAt: now
        },
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      // Update exam registration
      await tx.examRegistration.update({
        where: { id: registration.id },
        data: {
          isPresent: true,
          attendanceMarkedAt: now,
          attendanceMarkedBy: data.studentId
        }
      });

      // Update exam logistics
      await tx.examLogistics.updateMany({
        where: { examEntryId: registration.examEntryId },
        data: {
          totalPresent: {
            increment: 1
          }
        }
      });

      // Log the check-in action
      await tx.examSessionLog.create({
        data: {
          examEntryId: registration.examEntryId,
          action: ExamSessionAction.STUDENT_CHECK_IN,
          performedBy: data.studentId,
          details: {
            action: ExamSessionAction.STUDENT_CHECK_IN,
            description: 'Student checked in via QR code',
            metadata: {
              studentId: data.studentId,
              seatNumber: registration.seatNumber,
              verificationMethod: data.verificationMethod,
              qrCode: data.qrCode
            }
          },
          notes: `${registration.student.firstName} ${registration.student.lastName} checked in for ${registration.examEntry.course.code}`
        }
      });

      return verification;
    });

    // Emit WebSocket event for real-time updates
    try {
      // Get institution ID from exam entry
      const examEntry = await prisma.examTimetableEntry.findUnique({
        where: { id: registration.examEntryId },
        include: {
          timetable: {
            select: { institutionId: true }
          }
        }
      });

      if (examEntry?.timetable.institutionId) {
        // Extract student number from role profile metadata
        const studentProfile = registration.student.roleProfiles.find(p => p.role === 'STUDENT');
        const studentMetadata = studentProfile?.metadata as any;
        const studentNumber = studentMetadata?.studentNumber || studentMetadata?.indexNumber || registration.student.email.split('@')[0];

        // Emit student check-in event
        const checkInPayload: StudentCheckedInPayload = {
          verificationId: result.id,
          examEntryId: registration.examEntryId,
          studentId: data.studentId,
          student: {
            studentNumber: studentNumber,
            firstName: registration.student.firstName,
            lastName: registration.student.lastName,
          },
          exam: {
            courseCode: registration.examEntry.course.code,
            courseName: registration.examEntry.course.name,
            examDate: registration.examEntry.examDate.toISOString(),
            startTime: registration.examEntry.startTime.toISOString().split('T')[1].substring(0, 5),
            venue: registration.examEntry.venue.name,
          },
          seatNumber: registration.seatNumber,
          checkedInAt: result.verifiedAt.toISOString(),
          method: data.verificationMethod,
        };

        realtimeService.emitToInstitution(examEntry.timetable.institutionId, {
          channel: RealtimeChannel.EXAM_CHECKIN,
          event: ExamCheckInEvent.STUDENT_CHECKED_IN,
          payload: checkInPayload,
          timestamp: new Date().toISOString(),
          institutionId: examEntry.timetable.institutionId,
        });

        // Emit updated statistics
        const stats = await this.getSessionCheckInStats(registration.examEntryId);
        const statsPayload: CheckInStatsUpdatedPayload = {
          examEntryId: registration.examEntryId,
          courseCode: registration.examEntry.course.code,
          stats: {
            expected: stats.expected,
            checkedIn: stats.checkedIn,
            pending: stats.pending,
            attendanceRate: stats.attendanceRate,
          },
        };

        realtimeService.emitToInstitution(examEntry.timetable.institutionId, {
          channel: RealtimeChannel.EXAM_CHECKIN,
          event: ExamCheckInEvent.CHECKIN_STATS_UPDATED,
          payload: statsPayload,
          timestamp: new Date().toISOString(),
          institutionId: examEntry.timetable.institutionId,
        });
      }
    } catch (wsError) {
      // Log WebSocket error but don't fail the check-in
      console.error('Failed to emit check-in WebSocket event:', wsError);
    }

    return {
      verification: result,
      exam: {
        courseCode: registration.examEntry.course.code,
        courseTitle: registration.examEntry.course.name,
        venue: registration.examEntry.venue.name,
        seatNumber: registration.seatNumber,
        startTime: registration.examEntry.startTime
      }
    };
  },

  /**
   * Get public exam session details (limited info, no auth required)
   */
  async getPublicSessionDetails(sessionId: number) {
    const session = await prisma.examTimetableEntry.findUnique({
      where: { id: sessionId },
      include: {
        course: {
          select: {
            code: true,
            name: true
          }
        },
        venue: {
          select: {
            name: true,
            location: true
          }
        },
        timetable: {
          select: {
            title: true,
            isPublished: true
          }
        }
      }
    });

    if (!session) {
      throw new Error('Exam session not found');
    }

    if (!session.timetable.isPublished) {
      throw new Error('Exam session is not published');
    }

    return {
      id: session.id,
      courseCode: session.course.code,
      courseTitle: session.course.name,
      examDate: session.examDate,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      venue: session.venue,
      timetable: session.timetable.title
    };
  },

  /**
   * Get check-in statistics for a session
   */
  async getSessionCheckInStats(sessionId: number) {
    const [registrations, verifications, logistics] = await Promise.all([
      prisma.examRegistration.count({
        where: { examEntryId: sessionId }
      }),
      prisma.studentVerification.count({
        where: {
          examEntryId: sessionId
        }
      }),
      prisma.examLogistics.findFirst({
        where: { examEntryId: sessionId },
        select: {
          totalExpected: true,
          totalPresent: true,
          invigilatorsAssigned: true
        }
      })
    ]);

    const expectedCount = logistics?.totalExpected || registrations;
    const checkedInCount = verifications;
    const pendingCount = expectedCount - checkedInCount;
    const attendanceRate = expectedCount > 0 ? (checkedInCount / expectedCount) * 100 : 0;

    return {
      expected: expectedCount,
      checkedIn: checkedInCount,
      pending: pendingCount,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      invigilators: logistics?.invigilatorsAssigned || 0
    };
  }
};
