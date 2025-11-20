import { PrismaClient } from '@prisma/client';
import { initializeExamLogistics, syncExamLogistics } from '../src/utils/examLogisticsHelpers';

const prisma = new PrismaClient();

/**
 * Backfill ExamLogistics for all existing ExamTimetableEntry records
 * This script:
 * 1. Finds all exam entries without logistics records
 * 2. Initializes logistics with registration count
 * 3. Syncs metrics from actual database state
 */
async function backfillExamLogistics() {
  console.log('🚀 Starting ExamLogistics backfill...\n');

  try {
    // Find all exam entries without logistics
    const entriesWithoutLogistics = await prisma.examTimetableEntry.findMany({
      where: {
        examLogistics: null
      },
      include: {
        _count: {
          select: {
            examRegistrations: true
          }
        }
      }
    });

    console.log(`📊 Found ${entriesWithoutLogistics.length} exam entries without logistics records\n`);

    if (entriesWithoutLogistics.length === 0) {
      console.log('✅ No entries to backfill. All exam entries already have logistics records.');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    // Process each entry
    for (const entry of entriesWithoutLogistics) {
      try {
        const registrationCount = entry._count.examRegistrations;

        console.log(`Processing Entry ID ${entry.id}:`);
        console.log(`  - Course ID: ${entry.courseId}`);
        console.log(`  - Venue ID: ${entry.venueId}`);
        console.log(`  - Registrations: ${registrationCount}`);

        // Initialize with registration count
        await initializeExamLogistics(entry.id, registrationCount);

        // Sync to calculate actual metrics from database
        await syncExamLogistics(entry.id);

        successCount++;
        console.log(`  ✅ Logistics created and synced\n`);
      } catch (error) {
        errorCount++;
        console.error(`  ❌ Error processing entry ${entry.id}:`, error);
        console.log();
      }
    }

    console.log('📈 Backfill Summary:');
    console.log(`  - Total processed: ${entriesWithoutLogistics.length}`);
    console.log(`  - Successful: ${successCount}`);
    console.log(`  - Failed: ${errorCount}`);
    console.log();

    // Verify results
    const totalLogisticsCount = await prisma.examLogistics.count();
    console.log(`✅ Total ExamLogistics records in database: ${totalLogisticsCount}`);

    // Show sample of created records
    const sampleLogistics = await prisma.examLogistics.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        examEntry: {
          select: {
            id: true,
            courseId: true,
            venueId: true
          }
        }
      }
    });

    console.log('\n📋 Sample of created logistics records:');
    sampleLogistics.forEach((logistics) => {
      console.log(`  Entry ${logistics.examEntryId}: ${logistics.totalPresent}/${logistics.totalExpected} present, ` +
        `${logistics.scriptsSubmitted} scripts, ${logistics.invigilatorsPresent}/${logistics.invigilatorsAssigned} invigilators`);
    });

  } catch (error) {
    console.error('❌ Fatal error during backfill:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Recalculate all logistics (optional - use with caution)
 * This will sync all existing logistics records with current database state
 */
async function recalculateAllLogistics() {
  console.log('🔄 Recalculating all ExamLogistics...\n');

  try {
    const allLogistics = await prisma.examLogistics.findMany({
      select: { examEntryId: true }
    });

    console.log(`📊 Found ${allLogistics.length} logistics records to recalculate\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const logistics of allLogistics) {
      try {
        await syncExamLogistics(logistics.examEntryId);
        successCount++;

        if (successCount % 10 === 0) {
          console.log(`  Progress: ${successCount}/${allLogistics.length} recalculated`);
        }
      } catch (error) {
        errorCount++;
        console.error(`  Error recalculating entry ${logistics.examEntryId}:`, error);
      }
    }

    console.log('\n📈 Recalculation Summary:');
    console.log(`  - Total processed: ${allLogistics.length}`);
    console.log(`  - Successful: ${successCount}`);
    console.log(`  - Failed: ${errorCount}`);

  } catch (error) {
    console.error('❌ Fatal error during recalculation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the appropriate function based on command line argument
const mode = process.argv[2];

if (mode === 'recalculate') {
  recalculateAllLogistics()
    .then(() => {
      console.log('\n✅ Recalculation completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Recalculation failed:', error);
      process.exit(1);
    });
} else {
  backfillExamLogistics()
    .then(() => {
      console.log('\n✅ Backfill completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Backfill failed:', error);
      process.exit(1);
    });
}
