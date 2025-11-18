import { PrismaClient, ExamTimetableStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function testStatusUpdate() {
  try {
    console.log('Testing timetable status management...');

    // Get admin user for authentication
    const adminUser = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (!adminUser) {
      console.log('No admin user found');
      return;
    }

    console.log('Found admin user:', adminUser.firstName, adminUser.lastName);

    // Test publishing the timetable
    const publishedTimetable = await prisma.examTimetable.update({
      where: { id: 3 },
      data: {
        status: ExamTimetableStatus.PUBLISHED,
        isPublished: true,
        publishedAt: new Date(),
        publishedBy: adminUser.id
      }
    });

    console.log('✅ Timetable published successfully');
    console.log('- Status:', publishedTimetable.status);
    console.log('- Published At:', publishedTimetable.publishedAt?.toISOString());

    // Test manual status update to COMPLETED
    const completedTimetable = await prisma.examTimetable.update({
      where: { id: 3 },
      data: {
        status: ExamTimetableStatus.COMPLETED
      }
    });

    console.log('✅ Timetable marked as completed');
    console.log('- Status:', completedTimetable.status);

    console.log('Status management test completed successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testStatusUpdate();
