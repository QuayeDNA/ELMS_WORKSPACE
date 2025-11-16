import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import institutionData from './seed-data/institutions';
import facultiesData from './seed-data/faculties';
import departmentsData from './seed-data/departments';
import programsData from './seed-data/programs';
import coursesData from './seed-data/courses';
import programCoursesData from './seed-data/programCourses';
import usersData, { lecturerProfilesData, studentProfilesData } from './seed-data/users';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Password123!';

async function upsertInstitution() {
  const code = institutionData.code;
  const existing = await prisma.institution.findUnique({ where: { code } });
  if (existing) return existing;
  return prisma.institution.create({ data: institutionData as any });
}

async function upsertFaculties(institutionId: number) {
  const created: any[] = [];
  for (const f of facultiesData) {
    const existing = await prisma.faculty.findFirst({ where: { code: f.code, institutionId } });
    if (existing) {
      created.push(existing);
      continue;
    }
    const rec = await prisma.faculty.create({ data: { ...f, institutionId } as any });
    created.push(rec);
  }
  return created;
}

async function upsertDepartments(faculties: any[]) {
  const created: any[] = [];
  for (const d of departmentsData) {
    const faculty = faculties.find((f) => f.code === d.facultyCode);
    if (!faculty) {
      console.warn(`⚠️ Faculty with code ${d.facultyCode} not found for department ${d.name}`);
      continue;
    }
    const existing = await prisma.department.findFirst({ where: { code: d.code, facultyId: faculty.id } });
    if (existing) {
      created.push(existing);
      continue;
    }
    const { facultyCode, ...deptData } = d;
    const rec = await prisma.department.create({ data: { ...deptData, facultyId: faculty.id } as any });
    created.push(rec);
  }
  return created;
}

async function upsertPrograms(departments: any[]) {
  const created: any[] = [];
  for (const p of programsData) {
    const department = departments.find((d) => d.code === p.departmentCode);
    if (!department) {
      console.warn(`⚠️ Department with code ${p.departmentCode} not found for program ${p.name}`);
      continue;
    }
    const existing = await prisma.program.findFirst({ where: { code: p.code, departmentId: department.id } });
    if (existing) {
      created.push(existing);
      continue;
    }
    const { departmentCode, ...progData } = p;
    const rec = await prisma.program.create({ data: { ...progData, departmentId: department.id } as any });
    created.push(rec);
  }
  return created;
}

async function upsertUsers(institutionId: number, faculties: any[], departments: any[]) {
  const createdUsers: any[] = [];

  for (const u of usersData) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      createdUsers.push(existing);
      continue;
    }

    const faculty = u.facultyCode ? faculties.find((f) => f.code === u.facultyCode) : null;
    const department = u.departmentCode ? departments.find((d) => d.code === u.departmentCode) : null;

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);

    const { facultyCode, departmentCode, ...userData } = u;

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        middleName: userData.middleName || null,
        title: userData.title || null,
        status: userData.status || 'ACTIVE',
        emailVerified: !!userData.emailVerified,
        phone: userData.phone || null,
        dateOfBirth: userData.dateOfBirth || null,
        gender: userData.gender || null,
        nationality: userData.nationality || null,
        address: userData.address || null,
        institutionId,
        facultyId: faculty ? faculty.id : null,
        departmentId: department ? department.id : null
      } as any
    });

    createdUsers.push(user);
  }

  // Create lecturer profiles
  for (const lp of lecturerProfilesData) {
    const user = await prisma.user.findUnique({ where: { email: lp.email } });
    if (!user) continue;
    const existing = await prisma.lecturerProfile.findUnique({ where: { userId: user.id } });
    if (existing) continue;
    await prisma.lecturerProfile.create({
      data: {
        userId: user.id,
        staffId: lp.staffId,
        academicRank: lp.academicRank,
        employmentType: lp.employmentType,
        employmentStatus: lp.employmentStatus,
        hireDate: lp.hireDate,
        highestQualification: lp.highestQualification,
        specialization: lp.specialization,
        permissions: lp.permissions as any
      } as any
    });
  }

  // Create student profiles
  for (const sp of studentProfilesData) {
    const user = await prisma.user.findUnique({ where: { email: sp.email } });
    if (!user) continue;
    const existing = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (existing) continue;

    // find program id
    const program = await prisma.program.findFirst({ where: { code: sp.programCode } });

    await prisma.studentProfile.create({
      data: {
        userId: user.id,
        studentId: sp.studentId,
        indexNumber: sp.indexNumber || null,
        level: sp.level,
        semester: sp.semester,
        academicYear: sp.academicYear || null,
        admissionDate: sp.admissionDate || null,
        expectedGraduation: sp.expectedGraduation || null,
        enrollmentStatus: sp.enrollmentStatus,
        academicStatus: sp.academicStatus,
        programId: program ? program.id : null
      } as any
    });
  }

  return createdUsers;
}

async function upsertAcademicYearAndSemesters(institutionId: number) {
  const yearCode = '2024/2025';
  let academicYear = await prisma.academicYear.findUnique({ where: { yearCode } });
  if (!academicYear) {
    academicYear = await prisma.academicYear.create({
      data: {
        yearCode,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        isCurrent: true,
        institutionId
      }
    });
  }

  // semester 1
  let sem1 = await prisma.semester.findFirst({ where: { academicYearId: academicYear.id, semesterNumber: 1 } });
  if (!sem1) {
    sem1 = await prisma.semester.create({
      data: {
        academicYearId: academicYear.id,
        semesterNumber: 1,
        name: 'Semester 1',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-01-15'),
        isCurrent: true
      }
    });
  }

  let sem2 = await prisma.semester.findFirst({ where: { academicYearId: academicYear.id, semesterNumber: 2 } });
  if (!sem2) {
    sem2 = await prisma.semester.create({
      data: {
        academicYearId: academicYear.id,
        semesterNumber: 2,
        name: 'Semester 2',
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-06-30'),
        isCurrent: false
      }
    });
  }

  return { academicYear, sem1, sem2 };
}

async function upsertCoursesAndProgramLinks(departments: any[], programs: any[], lecturers: any[], semester: any) {
  const createdCourses: any[] = [];

  // Create all courses first
  for (const c of coursesData) {
    const department = departments.find((d) => d.code === c.departmentCode);
    if (!department) {
      console.warn(`⚠️ Department with code ${c.departmentCode} not found for course ${c.name}`);
      continue;
    }

    const existing = await prisma.course.findUnique({ where: { code: c.code } });
    let courseRec;
    if (existing) {
      courseRec = existing;
    } else {
      const { departmentCode, ...courseData } = c;
      courseRec = await prisma.course.create({ data: { ...courseData, departmentId: department.id } as any });
    }

    createdCourses.push(courseRec);
  }

  console.log(`✅ Created/verified ${createdCourses.length} courses`);

  // Now create program-course links using programCoursesData
  let linkedCount = 0;
  for (const pc of programCoursesData) {
    const program = programs.find((p) => p.code === pc.programCode);
    const course = createdCourses.find((c) => c.code === pc.courseCode);

    if (!program) {
      console.warn(`⚠️ Program ${pc.programCode} not found for program-course link`);
      continue;
    }

    if (!course) {
      console.warn(`⚠️ Course ${pc.courseCode} not found for program-course link`);
      continue;
    }

    // Check if link already exists
    const existing = await prisma.programCourse.findFirst({
      where: {
        programId: program.id,
        courseId: course.id,
        level: pc.level,
        semester: pc.semester
      }
    });

    if (!existing) {
      await prisma.programCourse.create({
        data: {
          programId: program.id,
          courseId: course.id,
          level: pc.level,
          semester: pc.semester,
          isRequired: pc.isRequired,
          isCore: pc.isCore,
          yearInProgram: pc.yearInProgram,
          offeredInSemester1: pc.semester === 1,
          offeredInSemester2: pc.semester === 2
        } as any
      });
      linkedCount++;
    }
  }

  console.log(`✅ Created ${linkedCount} program-course links`);

  // Create CourseOfferings for semester 1 courses
  let offeringsCount = 0;
  for (const courseRec of createdCourses) {
    const department = departments.find((d) => d.id === courseRec.departmentId);
    if (!department) continue;

    // Check if this course is offered in semester 1 for any program
    const isOfferedInSem1 = programCoursesData.some(
      pc => pc.courseCode === courseRec.code && pc.semester === semester.semesterNumber
    );

    if (!isOfferedInSem1) continue;

    const lecturer = lecturers.find((l) => l.departmentId === department.id) || null;
    const existingOffering = await prisma.courseOffering.findFirst({
      where: { courseId: courseRec.id, semesterId: semester.id }
    });

    if (!existingOffering) {
      await prisma.courseOffering.create({
        data: {
          courseId: courseRec.id,
          semesterId: semester.id,
          primaryLecturerId: lecturer ? lecturer.id : null,
          maxEnrollment: 200,
          status: 'active'
        } as any
      });
      offeringsCount++;
    }
  }

  console.log(`✅ Created ${offeringsCount} course offerings for ${semester.name}`);

  return createdCourses;
}

async function main() {
  console.log('🌱 Starting full ELMS database seeding...');

  try {
    const institution = await upsertInstitution();
    console.log(`🏫 Institution: ${institution.name} (id=${institution.id})`);

    const faculties = await upsertFaculties(institution.id);
    console.log(`📚 Faculties seeded: ${faculties.length}`);

    const departments = await upsertDepartments(faculties);
    console.log(`🏛️ Departments seeded: ${departments.length}`);

    const programs = await upsertPrograms(departments);
    console.log(`🎓 Programs seeded: ${programs.length}`);

    const users = await upsertUsers(institution.id, faculties, departments);
    console.log(`👥 Users seeded/verified: ${users.length}`);

    // collect lecturer user objects for assignments
    const lecturers = await prisma.user.findMany({ where: { role: 'LECTURER' } });

    const { academicYear, sem1 } = await upsertAcademicYearAndSemesters(institution.id);
    console.log(`📆 Academic Year created: ${academicYear.yearCode}`);

    const courses = await upsertCoursesAndProgramLinks(departments, programs, lecturers, sem1);
    console.log(`📘 Courses created/linked: ${courses.length}`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Institution: ${institution.code}`);
    console.log(`- Faculties: ${faculties.length}`);
    console.log(`- Departments: ${departments.length}`);
    console.log(`- Programs: ${programs.length}`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Courses seeded & linked (first 10): ${courses.length}`);
    console.log('\n🔑 Default user password for seeded users: ' + DEFAULT_PASSWORD);

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
