import { PrismaClient, ExamTimetableStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function forceArchive() {
  try {
    const archived = await prisma.examTimetable.update({
      where: { id: 3 },
      data: { status: ExamTimetableStatus.ARCHIVED }
    });
    console.log('✅ Timetable archived successfully - Status:', archived.status);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

forceArchive();
