import { PrismaClient, BatchScriptStatus } from '@prisma/client';
import {
  BatchScript,
  CreateBatchScriptData,
  UpdateBatchScriptData,
  BatchSubmissionStats,
  BatchScriptQuery
} from '../types/batchScript';

const prisma = new PrismaClient();

export class BatchScriptService {
  /**
   * Get batch script for an exam entry
   */
  static async getBatchScriptForExamEntry(
    examEntryId: number,
    courseId: number
  ): Promise<BatchScript | null> {
    try {
      const batchScript = await prisma.batchScript.findUnique({
        where: {
          examEntryId_courseId: {
            examEntryId,
            courseId
          }
        },
        include: {
          examEntry: {
            include: {
              course: true,
              venue: true,
              timetable: true
            }
          },
          course: true,
          assignedLecturer: {
            include: {
              roleProfiles: true
            }
          },
          sealedByUser: true,
          scripts: {
            include: {
              currentHolder: true
            }
          }
        }
      });

      return batchScript as any;
    } catch (error) {
      console.error('Error in getBatchScriptForExamEntry:', error);
      throw error;
    }
  }

  /**
   * Get batch script by ID
   */
  static async getBatchScriptById(batchId: number): Promise<BatchScript | null> {
    try {
      const batchScript = await prisma.batchScript.findUnique({
        where: { id: batchId },
        include: {
          examEntry: {
            include: {
              course: true,
              venue: true
            }
          },
          course: true,
          assignedLecturer: {
            include: {
              roleProfiles: true
            }
          },
          sealedByUser: true,
          scripts: {
            include: {
              currentHolder: true,
              gradedBy: true
            }
          },
          movements: {
            include: {
              toUser: true
            },
            orderBy: {
              timestamp: 'desc'
            },
            take: 10
          }
        }
      });

      return batchScript as any;
    } catch (error) {
      console.error('Error in getBatchScriptById:', error);
      throw error;
    }
  }

  /**
   * Get all batch scripts with optional filters
   */
  static async getBatchScripts(query?: BatchScriptQuery): Promise<BatchScript[]> {
    try {
      const batchScripts = await prisma.batchScript.findMany({
        where: {
          ...(query?.courseId && { courseId: query.courseId }),
          ...(query?.examEntryId && { examEntryId: query.examEntryId }),
          ...(query?.status && { status: query.status as any }),
          ...(query?.assignedLecturerId && { assignedLecturerId: query.assignedLecturerId })
        },
        include: {
          examEntry: {
            include: {
              course: true,
              venue: true
            }
          },
          course: true,
          assignedLecturer: {
            include: {
              roleProfiles: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return batchScripts as any;
    } catch (error) {
      console.error('Error in getBatchScripts:', error);
      throw error;
    }
  }

  /**
   * Update batch script submission count
   */
  static async updateSubmissionCount(batchId: number): Promise<BatchScript> {
    try {
      // Count submitted scripts in this batch
      const submittedCount = await prisma.script.count({
        where: {
          batchScriptId: batchId,
          status: {
            in: ['COLLECTED', 'VERIFIED', 'SCANNED', 'DISPATCHED', 'RECEIVED_FOR_GRADING', 'GRADING_IN_PROGRESS', 'GRADED']
          }
        }
      });

      const collectedCount = await prisma.script.count({
        where: {
          batchScriptId: batchId,
          status: {
            in: ['COLLECTED', 'VERIFIED', 'SCANNED', 'DISPATCHED', 'RECEIVED_FOR_GRADING', 'GRADING_IN_PROGRESS', 'GRADED']
          }
        }
      });

      const gradedCount = await prisma.script.count({
        where: {
          batchScriptId: batchId,
          status: 'GRADED'
        }
      });

      const batchScript = await prisma.batchScript.update({
        where: { id: batchId },
        data: {
          scriptsSubmitted: submittedCount,
          scriptsCollected: collectedCount,
          scriptsGraded: gradedCount
        },
        include: {
          examEntry: {
            include: {
              course: true
            }
          },
          course: true
        }
      });

      return batchScript as any;
    } catch (error) {
      console.error('Error in updateSubmissionCount:', error);
      throw error;
    }
  }

  /**
   * Seal a batch script (marks it as ready for dispatch)
   */
  static async sealBatchScript(
    batchId: number,
    sealedBy: number,
    notes?: string
  ): Promise<BatchScript> {
    try {
      const batchScript = await prisma.batchScript.update({
        where: { id: batchId },
        data: {
          status: 'SEALED',
          sealedAt: new Date(),
          sealedBy,
          notes
        },
        include: {
          examEntry: {
            include: {
              course: true,
              venue: true
            }
          },
          course: true,
          sealedByUser: true
        }
      });

      // Create a movement record for batch sealing
      await prisma.scriptMovement.create({
        data: {
          scriptId: 0, // Batch-level movement, not specific script
          batchScriptId: batchId,
          type: 'BATCH_SEALED',
          toUserId: sealedBy,
          location: 'Exam Venue',
          notes: `Batch sealed with ${batchScript.scriptsSubmitted} scripts`
        }
      });

      return batchScript as any;
    } catch (error) {
      console.error('Error in sealBatchScript:', error);
      throw error;
    }
  }

  /**
   * Assign batch to lecturer for grading
   */
  static async assignBatchToLecturer(
    batchId: number,
    lecturerId: number,
    assignedBy: number
  ): Promise<BatchScript> {
    try {
      const batchScript = await prisma.batchScript.update({
        where: { id: batchId },
        data: {
          assignedLecturerId: lecturerId,
          status: 'WITH_LECTURER',
          deliveredAt: new Date()
        },
        include: {
          examEntry: {
            include: {
              course: true
            }
          },
          course: true,
          assignedLecturer: {
            include: {
              roleProfiles: true
            }
          }
        }
      });

      // Create movement record
      await prisma.scriptMovement.create({
        data: {
          scriptId: 0,
          batchScriptId: batchId,
          type: 'BATCH_TRANSFERRED',
          toUserId: lecturerId,
          location: 'Lecturer Office',
          notes: `Batch assigned to ${batchScript.assignedLecturer?.firstName || ''} ${batchScript.assignedLecturer?.lastName || ''}`
        }
      });

      // Update all scripts in batch to be held by lecturer
      await prisma.script.updateMany({
        where: { batchScriptId: batchId },
        data: {
          currentHolderId: lecturerId,
          status: 'RECEIVED_FOR_GRADING'
        }
      });

      return batchScript as any;
    } catch (error) {
      console.error('Error in assignBatchToLecturer:', error);
      throw error;
    }
  }

  /**
   * Update batch script status
   */
  static async updateBatchStatus(
    batchId: number,
    status: BatchScriptStatus,
    notes?: string
  ): Promise<BatchScript> {
    try {
      const data: any = { status };

      if (status === 'GRADING_COMPLETED') {
        data.completedAt = new Date();
      }

      if (notes) {
        data.notes = notes;
      }

      const batchScript = await prisma.batchScript.update({
        where: { id: batchId },
        data,
        include: {
          examEntry: {
            include: {
              course: true
            }
          },
          course: true
        }
      });

      return batchScript as any;
    } catch (error) {
      console.error('Error in updateBatchStatus:', error);
      throw error;
    }
  }

  /**
   * Get batch submission statistics
   */
  static async getBatchStatistics(batchId: number): Promise<BatchSubmissionStats> {
    try {
      const batchScript = await prisma.batchScript.findUnique({
        where: { id: batchId },
        include: {
          scripts: true
        }
      });

      if (!batchScript) {
        throw new Error('Batch script not found');
      }

      const pending = batchScript.totalRegistered - batchScript.scriptsSubmitted;
      const submissionRate = batchScript.totalRegistered > 0
        ? (batchScript.scriptsSubmitted / batchScript.totalRegistered) * 100
        : 0;

      const gradingProgress = batchScript.scriptsSubmitted > 0
        ? (batchScript.scriptsGraded / batchScript.scriptsSubmitted) * 100
        : 0;

      return {
        batchId: batchScript.id,
        totalRegistered: batchScript.totalRegistered,
        scriptsSubmitted: batchScript.scriptsSubmitted,
        scriptsCollected: batchScript.scriptsCollected,
        scriptsGraded: batchScript.scriptsGraded,
        pending,
        submissionRate: Math.round(submissionRate * 100) / 100,
        gradingProgress: Math.round(gradingProgress * 100) / 100,
        status: batchScript.status
      };
    } catch (error) {
      console.error('Error in getBatchStatistics:', error);
      throw error;
    }
  }

  /**
   * Get batches pending lecturer assignment
   */
  static async getPendingAssignment(): Promise<BatchScript[]> {
    try {
      const batches = await prisma.batchScript.findMany({
        where: {
          status: 'SEALED',
          assignedLecturerId: null
        },
        include: {
          examEntry: {
            include: {
              course: true,
              venue: true
            }
          },
          course: true
        },
        orderBy: {
          sealedAt: 'asc'
        }
      });

      return batches as any;
    } catch (error) {
      console.error('Error in getPendingAssignment:', error);
      throw error;
    }
  }

  /**
   * Get batches assigned to a specific lecturer
   */
  static async getBatchesForLecturer(
    lecturerId: number,
    status?: BatchScriptStatus
  ): Promise<BatchScript[]> {
    try {
      const batches = await prisma.batchScript.findMany({
        where: {
          assignedLecturerId: lecturerId,
          ...(status && { status })
        },
        include: {
          examEntry: {
            include: {
              course: true,
              venue: true,
              timetable: {
                include: {
                  academicYear: true,
                  semester: true
                }
              }
            }
          },
          course: true,
          scripts: {
            where: {
              status: {
                not: 'GRADED'
              }
            }
          }
        },
        orderBy: {
          deliveredAt: 'desc'
        }
      });

      return batches as any;
    } catch (error) {
      console.error('Error in getBatchesForLecturer:', error);
      throw error;
    }
  }
}
