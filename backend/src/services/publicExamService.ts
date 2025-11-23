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
      startTime: string;
      endTime: string;
      duration: number;
      venue: string;
      venueLocation: string;
    };
    registration: {
      id: number;
      examRegistrationId: number;
      seatNumber: string | null;
      isPresent: boolean;
      isVerified: boolean;
    };
    checkIn: {
      isOpen: boolean;
      canCheckIn: boolean;
      message: string;
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
    // Find student by index number in RoleProfile metadata
    const student = await prisma.user.findFirst({
      where: {
        roleProfiles: {
          some: {
            role: 'STUDENT',
            metadata: {
              path: ['indexNumber'],
              equals: indexNumber
            }
          }
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        roleProfiles: {
          where: { role: 'STUDENT' },
          select: {
            metadata: true
          }
        }
      }
    });

    if (!student) {
      throw new Error('Student not found with the provided index number');
    }

    const studentMetadata = student.roleProfiles[0]?.metadata as any;
    const studentIndexNumber = studentMetadata?.indexNumber || studentMetadata?.studentId || indexNumber;

    // Get current time
    const now = new Date();

    // Find all exam registrations for this student with upcoming or ongoing exams
    // Check-in window: 30 minutes before exam start to exam end time
    const registrations = await prisma.examRegistration.findMany({
      where: {
        studentId: student.id,
        examEntry: {
          timetable: {
            isPublished: true
          },
          // Get exams happening today or within check-in window
          examDate: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lte: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          }
        }
      },
      include: {
        examEntry: {
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
            }
          }
        }
      }
    });

    // Map registrations to active exams with check-in status
    const activeExams = await Promise.all(
      registrations.map(async (registration) => {
        const startTime = new Date(registration.examEntry.startTime);
        const endTime = new Date(registration.examEntry.endTime);
        const checkInOpenTime = new Date(startTime.getTime() - 30 * 60 * 1000);

        // Check if already verified
        const existingVerification = await prisma.studentVerification.findFirst({
          where: {
            examEntryId: registration.examEntryId,
            studentId: student.id
          }
        });

        const isCheckInOpen = now >= checkInOpenTime && now <= endTime;
        const canCheckIn = isCheckInOpen && !existingVerification;

        let message = '';
        if (existingVerification) {
          message = 'Already checked in';
        } else if (isCheckInOpen) {
          message = 'Check-in is open';
        } else if (now < checkInOpenTime) {
          message = 'Check-in opens 30 minutes before exam';
        } else {
          message = 'Check-in is closed';
        }

        return {
          examEntry: {
            id: registration.examEntry.id,
            courseCode: registration.examEntry.course.code,
            courseName: registration.examEntry.course.name,
            startTime: registration.examEntry.startTime.toISOString(),
            endTime: registration.examEntry.endTime.toISOString(),
            duration: registration.examEntry.duration,
            venue: registration.examEntry.venue.name,
            venueLocation: registration.examEntry.venue.location || ''
          },
          registration: {
            id: registration.id,
            examRegistrationId: registration.id,
            seatNumber: registration.seatNumber,
            isPresent: registration.isPresent,
            isVerified: !!existingVerification
          },
          checkIn: {
            isOpen: isCheckInOpen,
            canCheckIn,
            message
          }
        };
      })
    );

    return {
      student: {
        id: student.id,
        indexNumber: studentIndexNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email
      },
      activeExams: activeExams.filter(exam => exam.checkIn.isOpen || exam.registration.isVerified)
    };
  },

  /**
   * Check in a student for an exam using their index number
   */
  async checkInStudent(data: CheckInData) {
    // Find student by index number
    const student = await prisma.user.findFirst({
      where: {
        roleProfiles: {
          some: {
            role: 'STUDENT',
            metadata: {
              path: ['indexNumber'],
              equals: data.indexNumber
            }
          }
        }
      },
      include: {
        roleProfiles: {
          where: { role: 'STUDENT' }
        }
      }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Get registration details
    const registration = await prisma.examRegistration.findFirst({
      where: {
        studentId: student.id,
        examEntryId: data.examEntryId
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

    if (!registration) {
      throw new Error('No exam registration found for this student and exam');
    }

    // Check if already verified
    const existingVerification = await prisma.studentVerification.findFirst({
      where: {
        examEntryId: data.examEntryId,
        studentId: student.id
      }
    });

    if (existingVerification) {
      throw new Error('Student has already checked in for this exam');
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
          examEntryId: data.examEntryId,
          studentId: student.id,
          method: data.verificationMethod as VerificationMethod,
          seatNumber: registration.seatNumber,
          verifiedBy: student.id, // Self check-in
          qrCode: data.indexNumber, // Store index number as QR code
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
          attendanceMarkedBy: student.id
        }
      });

      // Update exam logistics
      await tx.examLogistics.updateMany({
        where: { examEntryId: data.examEntryId },
        data: {
          totalPresent: {
            increment: 1
          }
        }
      });

      // Log the check-in action
      await tx.examSessionLog.create({
        data: {
          examEntryId: data.examEntryId,
          action: ExamSessionAction.STUDENT_CHECK_IN,
          performedBy: student.id,
          details: {
            action: ExamSessionAction.STUDENT_CHECK_IN,
            description: 'Student checked in via index number QR code',
            metadata: {
              studentId: student.id,
              indexNumber: data.indexNumber,
              seatNumber: registration.seatNumber,
              verificationMethod: data.verificationMethod
            }
          },
          notes: `${student.firstName} ${student.lastName} checked in for ${registration.examEntry.course.code}`
        }
      });

      return verification;
    });

    // Emit WebSocket event for real-time updates
    try {
      // Get institution ID from exam entry
      const examEntry = await prisma.examTimetableEntry.findUnique({
        where: { id: data.examEntryId },
        include: {
          timetable: {
            select: { institutionId: true }
          }
        }
      });

      if (examEntry?.timetable.institutionId) {
        // Extract student number from role profile metadata
        const studentProfile = student.roleProfiles.find(p => p.role === 'STUDENT');
        const studentMetadata = studentProfile?.metadata as any;
        const studentNumber = studentMetadata?.indexNumber || studentMetadata?.studentId || data.indexNumber;

        // Emit student check-in event
        const checkInPayload: StudentCheckedInPayload = {
          verificationId: result.id,
          examEntryId: data.examEntryId,
          studentId: student.id,
          student: {
            studentNumber: studentNumber,
            firstName: student.firstName,
            lastName: student.lastName,
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
        const stats = await this.getSessionCheckInStats(data.examEntryId);
        const statsPayload: CheckInStatsUpdatedPayload = {
          examEntryId: data.examEntryId,
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
      success: true,
      verification: {
        id: result.id,
        timestamp: result.verifiedAt.toISOString()
      },
      student: {
        indexNumber: data.indexNumber,
        name: `${student.firstName} ${student.lastName}`
      },
      exam: {
        courseCode: registration.examEntry.course.code,
        courseName: registration.examEntry.course.name,
        venue: registration.examEntry.venue.name,
        seatNumber: registration.seatNumber
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
