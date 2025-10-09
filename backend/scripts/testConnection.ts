import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');

    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');

    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Found ${userCount} users in the database`);

    // Test a more complex query
    const institutions = await prisma.institution.findMany({
      include: {
        faculties: {
          include: {
            departments: true
          }
        }
      }
    });

    console.log(`🏫 Found ${institutions.length} institution(s):`);
    institutions.forEach(inst => {
      console.log(`  - ${inst.name} (${inst.code})`);
      inst.faculties.forEach(faculty => {
        console.log(`    └─ ${faculty.name} (${faculty.code})`);
        faculty.departments.forEach(dept => {
          console.log(`       └─ ${dept.name} (${dept.code})`);
        });
      });
    });

    // Test authentication-related query
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'SUPER_ADMIN'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true
      }
    });

    console.log(`👤 Super Admin users:`);
    adminUsers.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) - ${user.status}`);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }
}

testConnection();
