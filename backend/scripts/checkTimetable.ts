import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTimetable() {
  try {
    const timetable = await prisma.examTimetable.findUnique({
      where: { id: 3 },
      include: {
        entries: {
          take: 5,
          include: {
            course: true,
            venue: true
          }
        },
        _count: {
          select: { entries: true }
        }
      }
    });

    console.log('Timetable Details:');
    console.log('- Title:', timetable?.title);
    console.log('- Status:', timetable?.status);
    console.log('- Total Entries:', timetable?._count.entries);
    console.log('- Start Date:', timetable?.startDate.toDateString());
    console.log('- End Date:', timetable?.endDate.toDateString());
    console.log('\nSample Entries:');
    timetable?.entries.forEach((entry, i) => {
      console.log(`${i+1}. ${entry.course.name} - ${entry.venue.name} (${entry.examDate.toDateString()})`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTimetable();
