import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate room capacity for an exam entry
 * Checks if the number of registered students exceeds room capacity
 */
export async function validateRoomCapacity(examEntryId: number): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    // Get exam logistics
    const logistics = await prisma.examLogistics.findUnique({
      where: { examEntryId },
      include: {
        examEntry: {
          include: {
            rooms: {
              include: {
                room: true
              }
            }
          }
        }
      }
    });

    if (!logistics) {
      result.isValid = false;
      result.errors.push('Exam logistics not found for this entry');
      return result;
    }

    // Calculate total room capacity
    const totalCapacity = logistics.examEntry.rooms?.reduce(
      (sum: number, r: any) => sum + (r.capacity || r.room.capacity || 0),
      0
    ) || 0;

    // Check capacity exceeded flag
    if (logistics.capacityExceeded) {
      result.isValid = false;
      result.errors.push(
        `Room capacity exceeded: ${logistics.totalExpected} students registered, but only ${totalCapacity} seats available`
      );
    }

    // Warning if approaching capacity (>90%)
    const utilizationRate = totalCapacity > 0 ? (logistics.totalExpected / totalCapacity) : 0;
    if (utilizationRate > 0.9 && utilizationRate <= 1.0) {
      result.warnings.push(
        `High capacity utilization: ${Math.round(utilizationRate * 100)}% (${logistics.totalExpected}/${totalCapacity})`
      );
    }

    // Check if any room has no capacity set
    const roomsWithoutCapacity = logistics.examEntry.rooms?.filter(
      (r: any) => !r.capacity && !r.room.capacity
    ) || [];

    if (roomsWithoutCapacity.length > 0) {
      result.warnings.push(
        `${roomsWithoutCapacity.length} room(s) have no capacity defined`
      );
    }

  } catch (error) {
    result.isValid = false;
    result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

/**
 * Prevent invigilator double-booking
 * Checks if an invigilator is already assigned to another exam at the same time
 */
export async function preventInvigilatorDoubleBooking(
  invigilatorId: number,
  examEntryId: number
): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    // Get the exam entry details
    const examEntry = await prisma.examTimetableEntry.findUnique({
      where: { id: examEntryId },
      select: {
        startTime: true,
        endTime: true,
        examDate: true,
        course: {
          select: {
            code: true,
            name: true
          }
        }
      }
    });

    if (!examEntry) {
      result.isValid = false;
      result.errors.push('Exam entry not found');
      return result;
    }

    // Check for conflicting assignments
    const conflictingAssignments = await prisma.invigilatorAssignment.findMany({
      where: {
        invigilatorId,
        examEntry: {
          examDate: examEntry.examDate,
          OR: [
            {
              // Exam starts during this exam
              startTime: {
                gte: examEntry.startTime,
                lt: examEntry.endTime
              }
            },
            {
              // Exam ends during this exam
              endTime: {
                gt: examEntry.startTime,
                lte: examEntry.endTime
              }
            },
            {
              // This exam falls entirely within another exam
              AND: [
                { startTime: { lte: examEntry.startTime } },
                { endTime: { gte: examEntry.endTime } }
              ]
            }
          ]
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

    if (conflictingAssignments.length > 0) {
      result.isValid = false;

      conflictingAssignments.forEach((assignment) => {
        const conflictCourse = assignment.examEntry.course;
        const conflictVenue = assignment.examEntry.venue;
        result.errors.push(
          `Invigilator already assigned to ${conflictCourse?.code} at ${conflictVenue?.name} ` +
          `from ${new Date(assignment.examEntry.startTime).toLocaleTimeString()} ` +
          `to ${new Date(assignment.examEntry.endTime).toLocaleTimeString()}`
        );
      });
    }

  } catch (error) {
    result.isValid = false;
    result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

/**
 * Validate exam session state
 * Ensures operations are allowed based on session status
 */
export async function validateSessionState(
  examEntryId: number,
  operation: 'CHECK_IN' | 'SUBMIT_SCRIPT' | 'ASSIGN_INVIGILATOR' | 'REPORT_INCIDENT'
): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    const logistics = await prisma.examLogistics.findUnique({
      where: { examEntryId },
      include: {
        examEntry: {
          select: {
            startTime: true,
            endTime: true,
            status: true
          }
        }
      }
    });

    if (!logistics) {
      result.isValid = false;
      result.errors.push('Exam logistics not found');
      return result;
    }

    const { sessionStatus } = logistics;
    const examStatus = logistics.examEntry.status;

    // Check if exam is cancelled
    if (examStatus === 'CANCELLED' || sessionStatus === 'CANCELLED') {
      result.isValid = false;
      result.errors.push('Cannot perform operation on a cancelled exam');
      return result;
    }

    // Operation-specific validations
    switch (operation) {
      case 'CHECK_IN':
        if (sessionStatus === 'COMPLETED') {
          result.isValid = false;
          result.errors.push('Cannot check in students after exam completion');
        }
        if (sessionStatus === 'NOT_STARTED') {
          result.warnings.push('Checking in before exam start time');
        }
        break;

      case 'SUBMIT_SCRIPT':
        if (sessionStatus === 'NOT_STARTED') {
          result.isValid = false;
          result.errors.push('Cannot submit scripts before exam starts');
        }
        if (sessionStatus === 'COMPLETED') {
          result.warnings.push('Submitting script after exam end time');
        }
        break;

      case 'ASSIGN_INVIGILATOR':
        if (sessionStatus === 'COMPLETED') {
          result.isValid = false;
          result.errors.push('Cannot assign invigilators after exam completion');
        }
        break;

      case 'REPORT_INCIDENT':
        // Incidents can be reported at any time except cancelled
        if (sessionStatus === 'COMPLETED') {
          result.warnings.push('Reporting incident after exam completion');
        }
        break;
    }

  } catch (error) {
    result.isValid = false;
    result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

/**
 * Validate student check-in eligibility
 * Ensures student is registered and hasn't already checked in
 */
export async function validateStudentCheckIn(
  studentId: number,
  examEntryId: number
): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    // Check registration
    const registration = await prisma.examRegistration.findUnique({
      where: {
        studentId_examEntryId: {
          studentId,
          examEntryId
        }
      }
    });

    if (!registration) {
      result.isValid = false;
      result.errors.push('Student is not registered for this exam');
      return result;
    }

    // Check if already checked in
    if (registration.isPresent) {
      result.isValid = false;
      result.errors.push('Student has already been checked in');
      return result;
    }

    // Check exam entry timing
    const examEntry = await prisma.examTimetableEntry.findUnique({
      where: { id: examEntryId },
      select: {
        startTime: true,
        endTime: true
      }
    });

    if (examEntry) {
      const now = new Date();
      const startTime = new Date(examEntry.startTime);
      const endTime = new Date(examEntry.endTime);

      if (now > endTime) {
        result.warnings.push('Checking in after exam end time');
      } else if (now > startTime) {
        result.warnings.push('Late arrival - student arriving after exam start time');
      }
    }

  } catch (error) {
    result.isValid = false;
    result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

/**
 * Validate script submission
 * Ensures student is present and hasn't already submitted
 */
export async function validateScriptSubmission(
  studentId: number,
  examEntryId: number
): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    const registration = await prisma.examRegistration.findUnique({
      where: {
        studentId_examEntryId: {
          studentId,
          examEntryId
        }
      }
    });

    if (!registration) {
      result.isValid = false;
      result.errors.push('Student is not registered for this exam');
      return result;
    }

    if (!registration.isPresent) {
      result.warnings.push('Student not marked as present - will be auto-marked on submission');
    }

    if (registration.scriptSubmitted) {
      result.isValid = false;
      result.errors.push('Script already submitted for this student');
      return result;
    }

  } catch (error) {
    result.isValid = false;
    result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

/**
 * Batch validate operations
 * Validates multiple checks at once for efficiency
 */
export async function batchValidate(
  examEntryId: number,
  checks: Array<'CAPACITY' | 'SESSION_STATE'>
): Promise<{ [key: string]: ValidationResult }> {
  const results: { [key: string]: ValidationResult } = {};

  const promises = checks.map(async (check) => {
    switch (check) {
      case 'CAPACITY':
        results.CAPACITY = await validateRoomCapacity(examEntryId);
        break;
      case 'SESSION_STATE':
        results.SESSION_STATE = await validateSessionState(examEntryId, 'CHECK_IN');
        break;
    }
  });

  await Promise.all(promises);

  return results;
}
