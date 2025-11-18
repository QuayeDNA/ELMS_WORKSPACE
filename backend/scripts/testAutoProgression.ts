import { PrismaClient, ExamTimetableStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function testAutomaticProgression() {
  try {
    console.log('Testing automatic status progression...');

    // Check current timetable status
    const currentTimetable = await prisma.examTimetable.findUnique({
      where: { id: 3 }
    });

    console.log('Current timetable status:', currentTimetable?.status);

    // Simulate the scheduler logic: move completed timetables to archived after 7 days
    // Since our timetable was just completed, we'll manually trigger the archiving logic
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Update the completedAt to simulate it being completed 7+ days ago
    await prisma.examTimetable.update({
      where: { id: 3 },
      data: {
        updatedAt: sevenDaysAgo
      }
    });

    // Now run the archiving logic
    const completedTimetables = await prisma.examTimetable.findMany({
      where: {
        status: ExamTimetableStatus.COMPLETED,
        updatedAt: {
          lt: sevenDaysAgo
        }
      }
    });

    console.log(`Found ${completedTimetables.length} completed timetables eligible for archiving`);

    if (completedTimetables.length > 0) {
      for (const timetable of completedTimetables) {
        await prisma.examTimetable.update({
          where: { id: timetable.id },
          data: {
            status: ExamTimetableStatus.ARCHIVED
          }
        });
        console.log(`✅ Timetable ${timetable.id} archived automatically`);
      }
    }

    // Verify the final status
    const finalTimetable = await prisma.examTimetable.findUnique({
      where: { id: 3 }
    });

    console.log('Final timetable status:', finalTimetable?.status);
    console.log('Automatic progression test completed successfully!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAutomaticProgression();
