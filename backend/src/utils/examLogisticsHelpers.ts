import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface ExamLogisticsMetrics {
  totalExpected: number;
  totalPresent: number;
  totalAbsent: number;
  totalLateArrivals: number;
  scriptsSubmitted: number;
  scriptsCollected: number;
  scriptsPending: number;
  invigilatorsAssigned: number;
  invigilatorsPresent: number;
  invigilatorsAbsent: number;
  hasIncidents: boolean;
  hasUnresolvedIncidents: boolean;
  capacityExceeded: boolean;
  sessionStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
  dataVerificationStatus: 'PENDING' | 'VERIFIED' | 'FAILED' | 'OVERRIDDEN' | 'ABSENT';
}

/**
 * Calculate logistics metrics for an exam entry
 */
export async function calculateExamLogisticsMetrics(
  examEntryId: number,
  tx?: Prisma.TransactionClient
): Promise<ExamLogisticsMetrics> {
  const client = tx || prisma;

  // Get exam entry details
  const examEntry = await client.examTimetableEntry.findUnique({
    where: { id: examEntryId },
    include: {
      rooms: {
        include: {
          room: true
        }
      }
    }
  });

  if (!examEntry) {
    throw new Error('Exam entry not found');
  }

  // Calculate student metrics
  const [totalExpected, totalPresent, totalLate] = await Promise.all([
    client.examRegistration.count({
      where: { examEntryId }
    }),
    client.examRegistration.count({
      where: { examEntryId, isPresent: true }
    }),
    client.studentVerification.count({
      where: {
        examEntryId,
        status: 'VERIFIED',
        notes: {
          contains: 'late'
        }
      }
    })
  ]);

  const totalAbsent = totalExpected - totalPresent;

  // Calculate script metrics
  const [scriptsSubmitted, scriptsCollected] = await Promise.all([
    client.examRegistration.count({
      where: { examEntryId, scriptSubmitted: true }
    }),
    client.script.count({
      where: {
        batchScript: {
          examEntryId
        },
        status: {
          in: ['COLLECTED', 'VERIFIED', 'SCANNED', 'DISPATCHED', 'RECEIVED_FOR_GRADING', 'GRADING_IN_PROGRESS', 'GRADED']
        }
      }
    })
  ]);

  const scriptsPending = totalPresent - scriptsSubmitted;

  // Calculate invigilator metrics
  const [invigilatorsAssigned, invigilatorsPresent] = await Promise.all([
    client.invigilatorAssignment.count({
      where: { examEntryId }
    }),
    client.invigilatorAssignment.count({
      where: {
        examEntryId,
        status: {
          in: ['CHECKED_IN', 'ACTIVE']
        }
      }
    })
  ]);

  const invigilatorsAbsent = invigilatorsAssigned - invigilatorsPresent;

  // Check for incidents
  const [totalIncidents, unresolvedIncidents] = await Promise.all([
    client.examIncident.count({
      where: { examEntryId }
    }),
    client.examIncident.count({
      where: {
        examEntryId,
        status: {
          not: 'RESOLVED'
        }
      }
    })
  ]);

  // Check capacity
  const totalRoomCapacity = examEntry.rooms?.reduce((sum: number, r: any) => sum + (r.capacity || r.room.capacity || 0), 0) || 0;
  const capacityExceeded = totalExpected > totalRoomCapacity;

  // Determine session status
  const now = new Date();
  const startTime = new Date(examEntry.startTime);
  const endTime = new Date(examEntry.endTime);

  let sessionStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED' = 'NOT_STARTED';
  if (examEntry.status === 'CANCELLED') {
    sessionStatus = 'CANCELLED';
  } else if (now >= endTime) {
    sessionStatus = 'COMPLETED';
  } else if (now >= startTime && now < endTime) {
    sessionStatus = 'IN_PROGRESS';
  }

  // Determine data verification status
  const verificationRate = totalExpected > 0 ? (totalPresent / totalExpected) : 0;
  let dataVerificationStatus: 'PENDING' | 'VERIFIED' | 'FAILED' | 'OVERRIDDEN' | 'ABSENT' = 'PENDING';

  if (sessionStatus === 'COMPLETED') {
    if (verificationRate >= 0.95) {
      dataVerificationStatus = 'VERIFIED';
    } else if (verificationRate < 0.5) {
      dataVerificationStatus = 'FAILED';
    } else {
      dataVerificationStatus = 'OVERRIDDEN'; // Partial verification
    }
  }

  return {
    totalExpected,
    totalPresent,
    totalAbsent,
    totalLateArrivals: totalLate,
    scriptsSubmitted,
    scriptsCollected,
    scriptsPending,
    invigilatorsAssigned,
    invigilatorsPresent,
    invigilatorsAbsent,
    hasIncidents: totalIncidents > 0,
    hasUnresolvedIncidents: unresolvedIncidents > 0,
    capacityExceeded,
    sessionStatus,
    dataVerificationStatus
  };
}

/**
 * Create or update ExamLogistics record for an exam entry
 */
export async function upsertExamLogistics(
  examEntryId: number,
  metrics?: Partial<ExamLogisticsMetrics>,
  tx?: Prisma.TransactionClient
): Promise<any> {
  const client = tx || prisma;

  // Calculate fresh metrics if not provided
  const calculatedMetrics = metrics || await calculateExamLogisticsMetrics(examEntryId, client);

  // Determine session timestamps
  const examEntry = await client.examTimetableEntry.findUnique({
    where: { id: examEntryId }
  });

  const now = new Date();
  const startTime = examEntry ? new Date(examEntry.startTime) : now;
  const endTime = examEntry ? new Date(examEntry.endTime) : now;

  const sessionStartedAt = calculatedMetrics.sessionStatus === 'IN_PROGRESS' || calculatedMetrics.sessionStatus === 'COMPLETED'
    ? (now >= startTime ? startTime : null)
    : null;

  const sessionEndedAt = calculatedMetrics.sessionStatus === 'COMPLETED'
    ? (now >= endTime ? endTime : now)
    : null;

  // Upsert logistics record
  const logistics = await client.examLogistics.upsert({
    where: { examEntryId },
    create: {
      examEntryId,
      ...calculatedMetrics,
      sessionStartedAt,
      sessionEndedAt,
      lastSyncedAt: now
    },
    update: {
      ...calculatedMetrics,
      sessionStartedAt: sessionStartedAt || undefined,
      sessionEndedAt: sessionEndedAt || undefined,
      lastSyncedAt: now
    }
  });

  return logistics;
}

/**
 * Increment student presence counter
 */
export async function incrementStudentPresence(
  examEntryId: number,
  isLate: boolean = false,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx || prisma;

  await client.examLogistics.update({
    where: { examEntryId },
    data: {
      totalPresent: { increment: 1 },
      totalAbsent: { decrement: 1 },
      ...(isLate && { totalLateArrivals: { increment: 1 } }),
      lastSyncedAt: new Date()
    }
  });
}

/**
 * Increment script submission counter
 */
export async function incrementScriptSubmission(
  examEntryId: number,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx || prisma;

  await client.examLogistics.update({
    where: { examEntryId },
    data: {
      scriptsSubmitted: { increment: 1 },
      scriptsCollected: { increment: 1 },
      scriptsPending: { decrement: 1 },
      lastSyncedAt: new Date()
    }
  });
}

/**
 * Update incident flags
 */
export async function updateIncidentFlags(
  examEntryId: number,
  hasUnresolved: boolean,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx || prisma;

  await client.examLogistics.update({
    where: { examEntryId },
    data: {
      hasIncidents: true,
      hasUnresolvedIncidents: hasUnresolved,
      lastIncidentAt: new Date(),
      lastSyncedAt: new Date()
    }
  });
}

/**
 * Update invigilator presence counter
 */
export async function updateInvigilatorPresence(
  examEntryId: number,
  increment: boolean = true,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx || prisma;

  await client.examLogistics.update({
    where: { examEntryId },
    data: {
      invigilatorsPresent: { [increment ? 'increment' : 'decrement']: 1 },
      invigilatorsAbsent: { [increment ? 'decrement' : 'increment']: 1 },
      lastSyncedAt: new Date()
    }
  });
}

/**
 * Update session status
 */
export async function updateSessionStatus(
  examEntryId: number,
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED',
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx || prisma;

  const updateData: any = {
    sessionStatus: status,
    lastSyncedAt: new Date()
  };

  if (status === 'IN_PROGRESS') {
    updateData.sessionStartedAt = new Date();
  } else if (status === 'COMPLETED') {
    updateData.sessionEndedAt = new Date();
    // Recalculate verification status
    const metrics = await calculateExamLogisticsMetrics(examEntryId, client);
    updateData.dataVerificationStatus = metrics.dataVerificationStatus;
  }

  await client.examLogistics.update({
    where: { examEntryId },
    data: updateData
  });
}

/**
 * Get exam logistics for a specific entry
 */
export async function getExamLogistics(
  examEntryId: number,
  tx?: Prisma.TransactionClient
): Promise<any> {
  const client = tx || prisma;

  return await client.examLogistics.findUnique({
    where: { examEntryId },
    include: {
      examEntry: {
        include: {
          course: true,
          venue: true,
          timetable: true
        }
      }
    }
  });
}

/**
 * Sync exam logistics from database (recalculate all metrics)
 */
export async function syncExamLogistics(
  examEntryId: number,
  tx?: Prisma.TransactionClient
): Promise<any> {
  const metrics = await calculateExamLogisticsMetrics(examEntryId, tx);
  return await upsertExamLogistics(examEntryId, metrics, tx);
}

/**
 * Batch sync multiple exam logistics
 */
export async function batchSyncExamLogistics(
  examEntryIds: number[],
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx || prisma;

  for (const examEntryId of examEntryIds) {
    try {
      await syncExamLogistics(examEntryId, client);
    } catch (error) {
      console.error(`Failed to sync logistics for exam entry ${examEntryId}:`, error);
    }
  }
}

/**
 * Initialize exam logistics for a new exam entry
 */
export async function initializeExamLogistics(
  examEntryId: number,
  totalExpected: number,
  tx?: Prisma.TransactionClient
): Promise<any> {
  const client = tx || prisma;

  return await client.examLogistics.create({
    data: {
      examEntryId,
      totalExpected,
      totalAbsent: totalExpected,
      scriptsPending: totalExpected,
      sessionStatus: 'NOT_STARTED',
      dataVerificationStatus: 'PENDING',
      lastSyncedAt: new Date()
    }
  });
}
