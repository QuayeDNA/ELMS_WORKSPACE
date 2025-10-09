import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Clean all data from the database in proper dependency order
 */
async function cleanDatabase() {
  console.log('🧹 Cleaning existing data...');

  // Delete in reverse dependency order to avoid foreign key constraints
  await prisma.auditLog.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.scriptMovement.deleteMany();
  await prisma.script.deleteMany();
  await prisma.examSession.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.studentAssessment.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.assessmentType.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.courseLecturer.deleteMany();
  await prisma.courseOffering.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.programCourse.deleteMany();
  await prisma.course.deleteMany();
  await prisma.program.deleteMany();
  await prisma.programPrefix.deleteMany();
  await prisma.lecturerDepartment.deleteMany();
  await prisma.room.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.lecturerProfile.deleteMany();
  await prisma.invigilatorProfile.deleteMany();
  await prisma.scriptHandlerProfile.deleteMany();
  await prisma.examOfficerProfile.deleteMany();
  await prisma.facultyAdminProfile.deleteMany();
  await prisma.adminProfile.deleteMany();
  await prisma.department.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();

  console.log('✅ Database cleaned successfully');
}

/**
 * Check if super admin user already exists
 */
async function checkSuperAdminExists(email: string) {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });
  return existingUser !== null;
}

/**
 * Create super admin user with specified credentials
 */
async function createSuperAdmin() {
  const email = 'admin@elms.com';
  const password = 'Admin@123';

  // Check if super admin already exists
  if (await checkSuperAdminExists(email)) {
    console.log('⚠️ Super Admin user already exists, skipping creation...');
    return;
  }

  console.log('👤 Creating Super Admin user...');

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create the super admin user
  const superAdmin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Administrator',
      title: 'Mr',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      phone: '+1-555-000-0000',
    }
  });

  console.log('✅ Super Admin user created successfully');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);

  return superAdmin;
}

async function main() {
  console.log('🌱 Starting ELMS database seeding...');

  try {
    // Create super admin user (with duplicate check)
    await createSuperAdmin();

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Super Admin user created/verified');

    console.log('\n🔑 Login Credentials:');
    console.log('Super Admin: admin@elms.com / Admin@123');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('🎉 Seeding process completed successfully!');
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('💥 Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
