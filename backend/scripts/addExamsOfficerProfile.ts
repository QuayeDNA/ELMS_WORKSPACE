import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Adding RoleProfile for Exams Officer...\n');

  try {
    // Find the exams officer user
    const examsOfficer = await prisma.user.findUnique({
      where: { email: 'exams.officer@tughana.edu.gh' }
    });

    if (!examsOfficer) {
      console.error('❌ Exams officer user not found!');
      return;
    }

    console.log(`✅ Found user: ${examsOfficer.firstName} ${examsOfficer.lastName} (ID: ${examsOfficer.id})`);

    // Check if profile already exists
    const existingProfile = await prisma.roleProfile.findUnique({
      where: {
        userId_role: {
          userId: examsOfficer.id,
          role: UserRole.EXAMS_OFFICER
        }
      }
    });

    if (existingProfile) {
      console.log('⚠️  RoleProfile already exists, updating to active...');

      await prisma.roleProfile.update({
        where: { id: existingProfile.id },
        data: {
          isActive: true,
          isPrimary: true
        }
      });

      console.log('✅ RoleProfile updated successfully!');
      return;
    }

    // Create new RoleProfile
    const roleProfile = await prisma.roleProfile.create({
      data: {
        userId: examsOfficer.id,
        role: UserRole.EXAMS_OFFICER,
        isActive: true,
        isPrimary: true,
        permissions: {
          exams: {
            read: true,
            schedule: true,
            manage: true,
            conduct: true
          },
          scripts: {
            read: true,
            track: true,
            handle: true
          },
          incidents: {
            create: true,
            read: true,
            report: true,
            manage: true,
            resolve: true
          },
          venues: {
            read: true,
            manage: true
          },
          analytics: {
            view: true
          },
          reports: {
            view: true,
            export: true
          }
        },
        metadata: {
          staffId: 'TU-EXAM-001',
          title: 'Exams Officer',
          department: 'Examinations Office'
        }
      }
    });

    console.log('\n✅ RoleProfile created successfully!');
    console.log('─────────────────────────────────────');
    console.log(`Profile ID: ${roleProfile.id}`);
    console.log(`User ID: ${roleProfile.userId}`);
    console.log(`Role: ${roleProfile.role}`);
    console.log(`Active: ${roleProfile.isActive}`);
    console.log(`Primary: ${roleProfile.isPrimary}`);
    console.log('─────────────────────────────────────\n');

    console.log('✅ Exams officer can now login!');
    console.log('\n📧 Login Credentials:');
    console.log('   Email: exams.officer@tughana.edu.gh');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
