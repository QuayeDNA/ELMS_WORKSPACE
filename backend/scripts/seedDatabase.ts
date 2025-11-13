import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Create super admin user with specified credentials
 */
async function createSuperAdmin() {
  const email = 'admin@elms.com';
  const password = 'Admin@123';

  // Check if super admin already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.log('⚠️ Super Admin user already exists, skipping creation...');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    return existingUser;
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
  console.log('🌱 Starting ELMS database seeding (Super Admin Only)...');

  try {
    // Create only super admin user
    const superAdmin = await createSuperAdmin();

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Super Admin user created/verified');

    console.log('\n🔑 Login Credentials:');
    console.log('Email: admin@elms.com');
    console.log('Password: Admin@123');

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
