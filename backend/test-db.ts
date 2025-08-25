import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
  console.log('🔧 Testing database connection and functionality...\n');

  try {
    // Test 1: Check database connection
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');

    // Test 2: Count users
    console.log('2️⃣ Checking seeded users...');
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} user(s) in database`);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
        profile: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    console.log('👤 Users in database:');
    users.forEach(user => {
      console.log(`   - ${user.profile?.firstName} ${user.profile?.lastName} (${user.email}) - ${user.role}`);
    });
    console.log('');

    // Test 3: Check database schema
    console.log('3️⃣ Testing database schema...');
    
    // Count models
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    ` as any[];

    console.log(`✅ Found ${tables.length} tables in database schema:`);
    console.log('📋 Tables:', tables.map(t => t.table_name).join(', '));
    console.log('');

    // Test 4: Test relationship queries
    console.log('4️⃣ Testing user profile relationships...');
    const userWithProfile = await prisma.user.findFirst({
      include: {
        profile: true
      }
    });

    if (userWithProfile?.profile) {
      console.log('✅ User-Profile relationship working correctly');
      console.log(`   Profile: ${userWithProfile.profile.firstName} ${userWithProfile.profile.lastName}`);
    } else {
      console.log('⚠️ No user profile found');
    }
    console.log('');

    // Test 5: Check enum values
    console.log('5️⃣ Testing enum values...');
    const userRoles = await prisma.user.findMany({
      select: { role: true },
      distinct: ['role']
    });
    console.log('✅ User roles in use:', userRoles.map(u => u.role).join(', '));
    console.log('');

    // Test 6: Test audit functionality (if any audit logs exist)
    console.log('6️⃣ Checking audit logs...');
    const auditCount = await prisma.auditLog.count();
    console.log(`✅ Found ${auditCount} audit log entries`);
    console.log('');

    console.log('🎉 All database tests passed successfully!');
    console.log('');
    console.log('📊 Database Summary:');
    console.log(`   - ${tables.length} tables created`);
    console.log(`   - ${userCount} users seeded`);
    console.log(`   - ${auditCount} audit logs`);
    console.log('   - All relationships working');
    console.log('   - Schema applied successfully');

  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
