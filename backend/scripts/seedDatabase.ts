import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Import seed data
import { institutionData } from './seed-data/institutions.ts';
import { facultiesData } from './seed-data/faculties.ts';
import { departmentsData } from './seed-data/departments.ts';
import { programsData } from './seed-data/programs.ts';
import { coursesData } from './seed-data/courses.ts';
import { usersData, lecturerProfilesData, studentProfilesData } from './seed-data/users.ts';

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
    return null;
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

/**
 * Create institution with duplicate check
 */
async function createInstitution() {
  // Check if institution already exists
  const existingInstitution = await prisma.institution.findUnique({
    where: { code: institutionData.code }
  });

  if (existingInstitution) {
    console.log(`⚠️ Institution ${institutionData.name} already exists, skipping creation...`);
    return existingInstitution;
  }

  console.log('🏫 Creating institution...');
  const institution = await prisma.institution.create({
    data: institutionData
  });

  console.log(`✅ Institution created: ${institution.name}`);
  return institution;
}

/**
 * Create faculties with duplicate check
 */
async function createFaculties(institutionId: number) {
  console.log('🎓 Creating faculties...');
  const createdFaculties = [];

  for (const facultyData of facultiesData) {
    // Check if faculty already exists
    const existingFaculty = await prisma.faculty.findFirst({
      where: {
        institutionId,
        code: facultyData.code
      }
    });

    if (existingFaculty) {
      console.log(`⚠️ Faculty ${facultyData.name} already exists, skipping...`);
      createdFaculties.push(existingFaculty);
      continue;
    }

    const faculty = await prisma.faculty.create({
      data: {
        ...facultyData,
        institutionId
      }
    });

    createdFaculties.push(faculty);
    console.log(`✅ Faculty created: ${faculty.name}`);
  }

  return createdFaculties;
}

/**
 * Create departments with duplicate check
 */
async function createDepartments(faculties: any[]) {
  console.log('🏢 Creating departments...');
  const createdDepartments = [];

  for (const departmentData of departmentsData) {
    // Find the faculty for this department
    const faculty = faculties.find(f => f.code === departmentData.facultyCode);
    if (!faculty) {
      console.log(`⚠️ Faculty ${departmentData.facultyCode} not found for department ${departmentData.name}`);
      continue;
    }

    // Check if department already exists
    const existingDepartment = await prisma.department.findFirst({
      where: {
        facultyId: faculty.id,
        code: departmentData.code
      }
    });

    if (existingDepartment) {
      console.log(`⚠️ Department ${departmentData.name} already exists, skipping...`);
      createdDepartments.push(existingDepartment);
      continue;
    }

    const { facultyCode, ...deptData } = departmentData;
    const department = await prisma.department.create({
      data: {
        ...deptData,
        facultyId: faculty.id
      }
    });

    createdDepartments.push(department);
    console.log(`✅ Department created: ${department.name}`);
  }

  return createdDepartments;
}

/**
 * Create programs with duplicate check
 */
async function createPrograms(departments: any[]) {
  console.log('📖 Creating programs...');
  const createdPrograms = [];

  for (const programData of programsData) {
    // Find the department for this program
    const department = departments.find(d => d.code === programData.departmentCode);
    if (!department) {
      console.log(`⚠️ Department ${programData.departmentCode} not found for program ${programData.name}`);
      continue;
    }

    // Check if program already exists
    const existingProgram = await prisma.program.findFirst({
      where: {
        departmentId: department.id,
        code: programData.code
      }
    });

    if (existingProgram) {
      console.log(`⚠️ Program ${programData.name} already exists, skipping...`);
      createdPrograms.push(existingProgram);
      continue;
    }

    const { departmentCode, ...progData } = programData;
    const program = await prisma.program.create({
      data: {
        ...progData,
        departmentId: department.id
      } as any
    });

    createdPrograms.push(program);
    console.log(`✅ Program created: ${program.name}`);
  }

  return createdPrograms;
}

/**
 * Create courses with duplicate check
 */
async function createCourses(departments: any[]) {
  console.log('📚 Creating courses...');
  const createdCourses = [];

  for (const courseData of coursesData) {
    // Find the department for this course
    const department = departments.find(d => d.code === courseData.departmentCode);
    if (!department) {
      console.log(`⚠️ Department ${courseData.departmentCode} not found for course ${courseData.name}`);
      continue;
    }

    // Check if course already exists
    const existingCourse = await prisma.course.findUnique({
      where: { code: courseData.code }
    });

    if (existingCourse) {
      console.log(`⚠️ Course ${courseData.name} already exists, skipping...`);
      createdCourses.push(existingCourse);
      continue;
    }

    const { departmentCode, ...courseCreateData } = courseData;
    const course = await prisma.course.create({
      data: {
        ...courseCreateData,
        departmentId: department.id
      } as any
    });

    createdCourses.push(course);
    console.log(`✅ Course created: ${course.name}`);
  }

  return createdCourses;
}

/**
 * Create users with duplicate check
 */
async function createUsers(institution: any, faculties: any[], departments: any[]) {
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 12);
  const createdUsers = [];

  for (const userData of usersData) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      console.log(`⚠️ User ${userData.email} already exists, skipping...`);
      createdUsers.push(existingUser);
      continue;
    }

    // Find faculty and department if specified
    let facultyId = null;
    let departmentId = null;

    if (userData.facultyCode) {
      const faculty = faculties.find(f => f.code === userData.facultyCode);
      if (faculty) {
        facultyId = faculty.id;
      }
    }

    if (userData.departmentCode) {
      const department = departments.find(d => d.code === userData.departmentCode);
      if (department) {
        departmentId = department.id;
      }
    }

    const { facultyCode, departmentCode, ...userCreateData } = userData;
    const user = await prisma.user.create({
      data: {
        ...userCreateData,
        password: hashedPassword,
        institutionId: institution.id,
        facultyId,
        departmentId
      } as any
    });

    createdUsers.push(user);
    console.log(`✅ User created: ${user.firstName} ${user.lastName} (${user.role})`);
  }

  return createdUsers;
}

/**
 * Create lecturer profiles
 */
async function createLecturerProfiles(users: any[]) {
  console.log('👨‍🏫 Creating lecturer profiles...');

  for (const profileData of lecturerProfilesData) {
    const user = users.find(u => u.email === profileData.email);
    if (!user) {
      console.log(`⚠️ User not found for lecturer profile: ${profileData.email}`);
      continue;
    }

    // Check if profile already exists
    const existingProfile = await prisma.lecturerProfile.findUnique({
      where: { userId: user.id }
    });

    if (existingProfile) {
      console.log(`⚠️ Lecturer profile already exists for ${profileData.email}, skipping...`);
      continue;
    }

    const { email, ...lecturerData } = profileData;
    await prisma.lecturerProfile.create({
      data: {
        ...lecturerData,
        userId: user.id
      } as any
    });

    console.log(`✅ Lecturer profile created for: ${user.firstName} ${user.lastName}`);
  }
}

/**
 * Create student profiles
 */
async function createStudentProfiles(users: any[], programs: any[]) {
  console.log('👨‍🎓 Creating student profiles...');

  for (const profileData of studentProfilesData) {
    const user = users.find(u => u.email === profileData.email);
    if (!user) {
      console.log(`⚠️ User not found for student profile: ${profileData.email}`);
      continue;
    }

    const program = programs.find(p => p.code === profileData.programCode);
    if (!program) {
      console.log(`⚠️ Program not found for student profile: ${profileData.programCode}`);
      continue;
    }

    // Check if profile already exists
    const existingProfile = await prisma.studentProfile.findUnique({
      where: { userId: user.id }
    });

    if (existingProfile) {
      console.log(`⚠️ Student profile already exists for ${profileData.email}, skipping...`);
      continue;
    }

    const { email, programCode, ...studentData } = profileData;
    await prisma.studentProfile.create({
      data: {
        ...studentData,
        userId: user.id,
        programId: program.id
      } as any
    });

    console.log(`✅ Student profile created for: ${user.firstName} ${user.lastName}`);
  }
}

async function main() {
  console.log('🌱 Starting ELMS database seeding...');

  try {
    // 1. Create super admin user (with duplicate check)
    await createSuperAdmin();

    // 2. Create institution
    const institution = await createInstitution();

    // 3. Create faculties
    const faculties = await createFaculties(institution.id);

    // 4. Create departments
    const departments = await createDepartments(faculties);

    // 5. Create programs
    const programs = await createPrograms(departments);

    // 6. Create courses
    const courses = await createCourses(departments);

    // 7. Create users
    const users = await createUsers(institution, faculties, departments);

    // 8. Create lecturer profiles
    await createLecturerProfiles(users);

    // 9. Create student profiles
    await createStudentProfiles(users, programs);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Super Admin user created/verified');
    console.log(`- Institution: ${institution.name}`);
    console.log(`- Faculties: ${faculties.length}`);
    console.log(`- Departments: ${departments.length}`);
    console.log(`- Programs: ${programs.length}`);
    console.log(`- Courses: ${courses.length}`);
    console.log(`- Users: ${users.length + 1} (including super admin)`);

    console.log('\n🔑 Login Credentials:');
    console.log('Super Admin: admin@elms.com / Admin@123');
    console.log('All other users: [email] / password123');
    console.log('\nExample user logins:');
    console.log('Admin: admin@git.edu.gh / password123');
    console.log('Dean (Engineering): dean.engineering@git.edu.gh / password123');
    console.log('HOD (CSE): hod.cse@git.edu.gh / password123');
    console.log('Lecturer: james.lecturer@git.edu.gh / password123');
    console.log('Student: alice.student@st.git.edu.gh / password123');

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
