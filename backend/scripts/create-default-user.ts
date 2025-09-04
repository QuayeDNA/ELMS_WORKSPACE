import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDefaultUser() {
  try {
    console.log('Creating default super admin user...');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@elms.com' }
    });

    if (existingUser) {
      console.log('Default user already exists!');
      console.log('Email: admin@elms.com');
      console.log('Password: admin123');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create default super admin user
    const user = await prisma.user.create({
      data: {
        email: 'admin@elms.com',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: UserRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        emailVerified: true,
      }
    });

    console.log('✅ Default user created successfully!');
    console.log('Email: admin@elms.com');
    console.log('Password: admin123');
    console.log('Role: SUPER_ADMIN');
    console.log('User ID:', user.id);

  } catch (error) {
    console.error('❌ Error creating default user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultUser();
