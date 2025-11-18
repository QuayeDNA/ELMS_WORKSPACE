import { PrismaClient, ExamTimetableStatus } from "@prisma/client";

const prisma = new PrismaClient();

export class TimetableStatusScheduler {
  private static instance: TimetableStatusScheduler;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 60 * 60 * 1000; // Check every hour

  private constructor() {}

  static getInstance(): TimetableStatusScheduler {
    if (!TimetableStatusScheduler.instance) {
      TimetableStatusScheduler.instance = new TimetableStatusScheduler();
    }
    return TimetableStatusScheduler.instance;
  }

  /**
   * Start the automatic status update scheduler
   */
  start() {
    console.log("🚀 Starting Timetable Status Scheduler...");

    // Run initial check
    this.checkAndUpdateStatuses();

    // Set up periodic checks
    this.intervalId = setInterval(() => {
      this.checkAndUpdateStatuses();
    }, this.CHECK_INTERVAL);

    console.log(`⏰ Scheduler running - checking every ${this.CHECK_INTERVAL / (60 * 1000)} minutes`);
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("🛑 Timetable Status Scheduler stopped");
    }
  }

  /**
   * Check and update timetable statuses based on exam completion
   */
  private async checkAndUpdateStatuses() {
    try {
      console.log("🔍 Checking timetable statuses for automatic updates...");

      const now = new Date();

      // 1. Update PUBLISHED timetables to COMPLETED when all exams are done
      const publishedTimetables = await prisma.examTimetable.findMany({
        where: {
          status: ExamTimetableStatus.PUBLISHED,
        },
        include: {
          entries: {
            select: {
              id: true,
              examDate: true,
              endTime: true,
            },
          },
        },
      });

      for (const timetable of publishedTimetables) {
        // Check if all exams in this timetable have ended
        const allExamsCompleted = timetable.entries.every((entry) => {
          const examEndTime = new Date(entry.examDate);
          examEndTime.setHours(
            entry.endTime.getHours(),
            entry.endTime.getMinutes(),
            entry.endTime.getSeconds()
          );
          return examEndTime < now;
        });

        if (allExamsCompleted && timetable.entries.length > 0) {
          await prisma.examTimetable.update({
            where: { id: timetable.id },
            data: { status: ExamTimetableStatus.COMPLETED },
          });

          console.log(`✅ Timetable ${timetable.id} (${timetable.title}) automatically updated to COMPLETED`);
        }
      }

      // 2. Update COMPLETED timetables to ARCHIVED after a delay (e.g., 7 days after completion)
      const completedTimetables = await prisma.examTimetable.findMany({
        where: {
          status: ExamTimetableStatus.COMPLETED,
        },
        include: {
          entries: {
            select: {
              examDate: true,
              endTime: true,
            },
            orderBy: {
              examDate: 'desc',
            },
            take: 1, // Get the latest exam
          },
        },
      });

      const ARCHIVE_DELAY_DAYS = 7; // Archive 7 days after the last exam

      for (const timetable of completedTimetables) {
        if (timetable.entries.length > 0) {
          const lastExam = timetable.entries[0];
          const lastExamEndTime = new Date(lastExam.examDate);
          lastExamEndTime.setHours(
            lastExam.endTime.getHours(),
            lastExam.endTime.getMinutes(),
            lastExam.endTime.getSeconds()
          );

          const archiveTime = new Date(lastExamEndTime);
          archiveTime.setDate(archiveTime.getDate() + ARCHIVE_DELAY_DAYS);

          if (now >= archiveTime) {
            await prisma.examTimetable.update({
              where: { id: timetable.id },
              data: { status: ExamTimetableStatus.ARCHIVED },
            });

            console.log(`📦 Timetable ${timetable.id} (${timetable.title}) automatically archived`);
          }
        }
      }

      console.log("✅ Timetable status check completed");

    } catch (error) {
      console.error("❌ Error in timetable status scheduler:", error);
    }
  }

  /**
   * Manually trigger status check (for testing or immediate updates)
   */
  async triggerManualCheck() {
    console.log("🔧 Manual timetable status check triggered");
    await this.checkAndUpdateStatuses();
  }
}

// Export singleton instance
export const timetableStatusScheduler = TimetableStatusScheduler.getInstance();
