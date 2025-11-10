import { PrismaClient, MovementType } from '@prisma/client';
import { QRCodeService } from './qrCodeService';
import { BatchScriptService } from './batchScriptService';
import { ExamRegistrationService } from './examRegistrationService';
import {
  ScriptSubmissionData,
  ScriptSubmissionResult,
  ScanStudentResult
} from '../types/scriptSubmission';

const prisma = new PrismaClient();

export class ScriptSubmissionService {
  /**
   * Submit a script by scanning student QR code
   * Optionally can scan batch QR code first, or auto-detect active exam
   */
  static async submitScript(data: ScriptSubmissionData): Promise<ScriptSubmissionResult> {
    try {
      // Validate and decode student QR code
      const qrValidation = QRCodeService.validateStudentQRCode(data.studentQRCode);

      if (!qrValidation.isValid || !qrValidation.data) {
        throw new Error(qrValidation.errorMessage || 'Invalid QR code');
      }

      const { studentId: qrStudentId, examEntryId, courseId } = qrValidation.data;
      const studentId = qrStudentId || data.studentId;

      if (!studentId) {
        throw new Error('Student ID is required');
      }

      // Get the registration with relations
      const registration = await prisma.examRegistration.findUnique({
        where: {
          studentId_examEntryId: {
            studentId,
            examEntryId: data.examEntryId || examEntryId
          }
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
        }
      });

      if (!registration) {
        throw new Error('Student not registered for this exam');
      }

      // Check if already submitted
      if (registration.scriptSubmitted) {
        throw new Error('Script already submitted for this student');
      }

      // Check if student is marked present
      if (!registration.isPresent) {
        // Auto-mark as present on script submission
        await prisma.examRegistration.update({
          where: { id: registration.id },
          data: {
            isPresent: true,
            attendanceMarkedAt: new Date(),
            attendanceMarkedBy: data.invigilatorId
          }
        });
      }

      // Get or create batch script using courseId from QR data
      let batchScript = await prisma.batchScript.findUnique({
        where: {
          examEntryId_courseId: {
            examEntryId: registration.examEntryId,
            courseId: courseId
          }
        }
      });

      if (!batchScript) {
        throw new Error('Batch script not found. Please contact exam officer.');
      }

      // Get exam entry for additional data
      const examEntry = await prisma.examTimetableEntry.findUnique({
        where: { id: registration.examEntryId },
        include: { course: true, venue: true }
      });

      if (!examEntry) {
        throw new Error('Exam entry not found');
      }

      // Create script record
      const script = await prisma.script.create({
        data: {
          qrCode: data.studentQRCode,
          studentId: studentId.toString(),
          examId: examEntry.examId || 0,
          batchScriptId: batchScript.id,
          currentHolderId: data.invigilatorId,
          status: 'COLLECTED',
          notes: data.notes
        }
      });

      // Get student for movement notes
      const student = await prisma.user.findUnique({
        where: { id: studentId }
      });

      // Create movement record
      await prisma.scriptMovement.create({
        data: {
          scriptId: script.id,
          batchScriptId: batchScript.id,
          type: 'COLLECTED_FROM_STUDENT',
          toUserId: data.invigilatorId,
          location: data.location || examEntry.venue?.name || 'Exam Hall',
          notes: student ? `Collected from ${student.firstName} ${student.lastName}` : 'Script collected'
        }
      });

      // Update registration
      await prisma.examRegistration.update({
        where: { id: registration.id },
        data: {
          scriptSubmitted: true,
          scriptSubmittedAt: new Date(),
          submittedTo: data.invigilatorId,
          batchScriptId: batchScript.id,
          scriptId: script.id
        }
      });

      // Update batch script counts
      await BatchScriptService.updateSubmissionCount(batchScript.id);

      // Get updated batch stats
      const updatedBatch = await prisma.batchScript.findUnique({
        where: { id: batchScript.id }
      });

      return {
        success: true,
        message: 'Script submitted successfully',
        data: {
          registrationId: registration.id,
          studentName: `${registration.student!.firstName} ${registration.student!.lastName}`,
          courseCode: registration.examEntry!.course!.code,
          courseName: registration.examEntry!.course!.name,
          batchScriptId: batchScript.id,
          submittedAt: new Date(),
          batchStats: {
            totalRegistered: updatedBatch?.totalRegistered || 0,
            totalSubmitted: updatedBatch?.scriptsSubmitted || 0,
            remaining: (updatedBatch?.totalRegistered || 0) - (updatedBatch?.scriptsSubmitted || 0)
          }
        }
      };
    } catch (error) {
      console.error('Error in submitScript:', error);
      throw error;
    }
  }

  /**
   * Scan student QR to get their info and active exams
   * Used by mobile app before submission
   */
  static async scanStudent(studentQRCode: string): Promise<ScanStudentResult> {
    try {
      // Validate QR code
      const qrValidation = QRCodeService.validateStudentQRCode(studentQRCode);

      if (!qrValidation.isValid || !qrValidation.data) {
        return {
          success: false,
          studentInfo: {} as any,
          activeExams: [],
          canSubmit: false,
          message: qrValidation.errorMessage || 'Invalid QR code'
        };
      }

      const { studentId } = qrValidation.data;

      // Get student info
      const student = await prisma.user.findUnique({
        where: { id: studentId },
        include: {
          studentProfiles: true
        }
      });

      if (!student || !student.studentProfiles || student.studentProfiles.length === 0) {
        return {
          success: false,
          studentInfo: {} as any,
          activeExams: [],
          canSubmit: false,
          message: 'Student not found or no profile available'
        };
      }

      const studentProfile = student.studentProfiles[0]; // Get first profile

      // Get active exams for this student
      const activeExams = await ExamRegistrationService.getActiveExamsForStudent(studentId!);

      const canSubmit = activeExams.some(exam => exam.canSubmit);

      return {
        success: true,
        studentInfo: {
          studentId: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          indexNumber: studentProfile.indexNumber || '',
          programId: studentProfile.programId || 0,
          level: studentProfile.level
        },
        activeExams,
        canSubmit,
        message: canSubmit
          ? `${activeExams.length} active exam(s) found`
          : 'No active exams for submission'
      };
    } catch (error) {
      console.error('Error in scanStudent:', error);
      throw error;
    }
  }

  /**
   * Verify script submission (secondary verification)
   */
  static async verifyScript(scriptId: number, verifiedBy: number): Promise<any> {
    try {
      const script = await prisma.script.update({
        where: { id: scriptId },
        data: {
          status: 'VERIFIED',
          currentHolderId: verifiedBy
        },
        include: {
          batchScript: true
        }
      });

      // Create movement record
      await prisma.scriptMovement.create({
        data: {
          scriptId: script.id,
          batchScriptId: script.batchScriptId || undefined,
          type: 'VERIFIED_BY_INVIGILATOR',
          toUserId: verifiedBy,
          location: 'Verification Area',
          notes: 'Script verified'
        }
      });

      return script;
    } catch (error) {
      console.error('Error in verifyScript:', error);
      throw error;
    }
  }

  /**
   * Bulk submit scripts (for offline sync)
   */
  static async bulkSubmitScripts(
    submissions: ScriptSubmissionData[],
    invigilatorId: number
  ): Promise<{
    success: boolean;
    totalSubmissions: number;
    successCount: number;
    failureCount: number;
    results: Array<{ success: boolean; message: string; studentQRCode: string }>;
  }> {
    const results: Array<{ success: boolean; message: string; studentQRCode: string }> = [];
    let successCount = 0;
    let failureCount = 0;

    for (const submission of submissions) {
      try {
        await this.submitScript({
          ...submission,
          invigilatorId
        });

        results.push({
          success: true,
          message: 'Submitted successfully',
          studentQRCode: submission.studentQRCode
        });
        successCount++;
      } catch (error) {
        results.push({
          success: false,
          message: error instanceof Error ? error.message : 'Submission failed',
          studentQRCode: submission.studentQRCode
        });
        failureCount++;
      }
    }

    return {
      success: successCount > 0,
      totalSubmissions: submissions.length,
      successCount,
      failureCount,
      results
    };
  }

  /**
   * Get submission history for a batch
   */
  static async getBatchSubmissionHistory(batchId: number): Promise<any[]> {
    try {
      const movements = await prisma.scriptMovement.findMany({
        where: {
          batchScriptId: batchId
        },
        include: {
          script: true,
          toUser: true
        },
        orderBy: {
          timestamp: 'desc'
        }
      });

      return movements;
    } catch (error) {
      console.error('Error in getBatchSubmissionHistory:', error);
      throw error;
    }
  }

  /**
   * Get student's script submission status
   */
  static async getStudentSubmissionStatus(
    studentId: number,
    examEntryId: number
  ): Promise<any> {
    try {
      const registration = await prisma.examRegistration.findUnique({
        where: {
          studentId_examEntryId: {
            studentId,
            examEntryId
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

      if (!registration) {
        return null;
      }

      // Get script if submitted
      let script = null;
      if (registration.scriptSubmitted) {
        script = await prisma.script.findFirst({
          where: {
            studentId: studentId.toString(),
            examId: registration.examEntry.examId || 0
          },
          include: {
            batchScript: true,
            currentHolder: true,
            movements: {
              orderBy: {
                timestamp: 'desc'
              }
            }
          }
        });
      }

      return {
        registration,
        script,
        status: registration.scriptSubmitted ? 'SUBMITTED' : 'PENDING'
      };
    } catch (error) {
      console.error('Error in getStudentSubmissionStatus:', error);
      throw error;
    }
  }
}
