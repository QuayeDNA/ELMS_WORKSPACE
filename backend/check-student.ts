import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStudent() {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: 18 },
      include: { user: true }
    });
    console.log('Student level:', student?.level);
    console.log('Student email:', student?.user?.email);

    // Check course CSE201
    const course = await prisma.course.findUnique({
      where: { code: 'CSE201' }
    });
    console.log('Course CSE201 exists:', !!course);
    console.log('Course code:', course?.code);
    console.log('Course level from DB:', course?.level);
    console.log('Course code starts with:', course?.code?.charAt(0));

    // Check what courses are available for this student
    if (student?.programId && student?.level) {
      const availableCourses = await prisma.programCourse.findMany({
        where: {
          programId: student.programId,
          level: student.level
        },
        include: { course: true }
      });

      console.log('Available courses for student level', student.level, ':');
      availableCourses.forEach(pc => {
        console.log(`- ${pc.course.code}: DB level ${pc.course.level}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudent();
