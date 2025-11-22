import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    console.log('\n=== All Users in Database ===\n');
    console.table(users);

    const examsOfficers = users.filter(u => u.role === 'EXAMS_OFFICER');
    const admins = users.filter(u => u.role === 'ADMIN');

    console.log('\n=== EXAMS_OFFICER Users ===');
    console.log(`Count: ${examsOfficers.length}`);
    console.table(examsOfficers);

    console.log('\n=== ADMIN Users ===');
    console.log(`Count: ${admins.length}`);
    console.table(admins);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
