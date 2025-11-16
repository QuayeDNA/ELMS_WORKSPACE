import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAcademicPeriods() {
  console.log('Creating AcademicPeriod records for existing semesters...');

  try {
    // Get all semesters that don't have academic periods
    const semestersWithoutPeriods = await prisma.semester.findMany({
      where: {
        academicPeriod: null
      },
      include: {
        academicYear: true
      }
    });

    console.log(`Found ${semestersWithoutPeriods.length} semesters without academic periods`);

    for (const semester of semestersWithoutPeriods) {
      const academicPeriodData = {
        semesterId: semester.id,
        registrationStartDate: new Date(semester.startDate.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days before semester start
        registrationEndDate: new Date(semester.startDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days after semester start
        addDropStartDate: new Date(semester.startDate.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days after semester start
        addDropEndDate: new Date(semester.startDate.getTime() + 28 * 24 * 60 * 60 * 1000), // 28 days after semester start
        lectureStartDate: semester.startDate,
        lectureEndDate: semester.endDate,
        examStartDate: new Date(semester.endDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week after semester end
        examEndDate: new Date(semester.endDate.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks after semester end
        resultsReleaseDate: new Date(semester.endDate.getTime() + 21 * 24 * 60 * 60 * 1000), // 3 weeks after semester end
        maxCreditsPerStudent: 24,
        minCreditsPerStudent: 12,
        isActive: semester.isCurrent,
        isRegistrationOpen: semester.isCurrent,
        isAddDropOpen: semester.isCurrent,
        createdBy: 1 // Assuming admin user ID 1
      };

      await prisma.academicPeriod.create({
        data: academicPeriodData
      });

      console.log(`Created AcademicPeriod for Semester ${semester.semesterNumber} (${semester.academicYear.yearCode})`);
    }

    console.log('✅ AcademicPeriod creation completed successfully!');

  } catch (error) {
    console.error('❌ Error creating AcademicPeriod records:', error);
    throw error;
  }
}

createAcademicPeriods()
  .then(async () => {
    await prisma.$disconnect();
    console.log('🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('💥 Script failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
