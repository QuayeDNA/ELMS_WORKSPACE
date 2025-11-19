/**
 * Seed Super Admin User
 * Creates a super admin user with full system access
 */

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedSuperAdmin() {
  try {
    console.log('🌱 Seeding Super Admin...');

    // Check if super admin already exists
    const existingSuperAdmin = await prisma.user.findFirst({
      where: {
        role: UserRole.SUPER_ADMIN,
      },
    });

    if (existingSuperAdmin) {
      console.log('✅ Super Admin already exists:');
      console.log('   Email:', existingSuperAdmin.email);
      console.log('   Name:', `${existingSuperAdmin.firstName} ${existingSuperAdmin.lastName}`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('SuperAdmin@123', 10);

    // Create super admin user
    const superAdmin = await prisma.user.create({
      data: {
        email: 'admin@elms.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: UserRole.SUPER_ADMIN,
        status: 'ACTIVE',
        emailVerified: true,
        twoFactorEnabled: false,
        roleProfiles: {
          create: [
            {
              role: UserRole.SUPER_ADMIN,
              permissions: {
                system: {
                  fullAccess: true,
                  manageUsers: true,
                  manageInstitutions: true,
                  manageFaculties: true,
                  manageDepartments: true,
                  managePrograms: true,
                  manageCourses: true,
                  manageExams: true,
                  viewReports: true,
                  systemSettings: true,
                },
              },
              metadata: {
                description: 'System Super Administrator',
                accessLevel: 'FULL',
              },
              isActive: true,
              isPrimary: true,
            },
          ],
        },
      },
      include: {
        roleProfiles: true,
      },
    });

    console.log('✅ Super Admin created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('   Email:    admin@elms.com');
    console.log('   Password: SuperAdmin@123');
    console.log('\n⚠️  IMPORTANT: Change this password after first login!\n');
    console.log('   User ID:', superAdmin.id);
    console.log('   Role Profile ID:', superAdmin.roleProfiles[0].id);

  } catch (error) {
    console.error('❌ Error seeding super admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedSuperAdmin()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
