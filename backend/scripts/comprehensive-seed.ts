import { PrismaClient, UserRole, UserStatus, StudentIdFormat, StudentIdYearPosition } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { studentIdConfigService } from '../src/services/studentIdConfigService';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Password123!';

/**
 * Comprehensive ELMS Database Seeding Script
 * Seeds complete data from institution setup to exam timetables
 */

async function main() {
  console.log('🌱 Starting comprehensive ELMS database seeding...\n');

  try {
    // ========================================
    // 1. CREATE INSTITUTION
    // ========================================
    console.log('📍 Step 1: Creating Institution...');

    const institution = await prisma.institution.upsert({
      where: { code: 'TU-GH' },
      update: {},
      create: {
        name: 'Technology University of Ghana',
        code: 'TU-GH',
        type: 'TECHNICAL_UNIVERSITY',
        status: 'ACTIVE',
        establishedYear: 1992,
        address: 'University Road, Technology Park',
        city: 'Accra',
        state: 'Greater Accra Region',
        country: 'Ghana',
        contactEmail: 'info@tughana.edu.gh',
        contactPhone: '+233-302-123-456',
        website: 'https://www.tughana.edu.gh',
        description: 'A premier technical university focused on STEM education, research, and innovation in Ghana.'
      }
    });
    console.log(`✅ Institution created: ${institution.name} (ID: ${institution.id})\n`);

    // ========================================
    // 2. CREATE SUPER ADMIN
    // ========================================
    console.log('📍 Step 2: Creating Super Admin...');

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);
    const superAdmin = await prisma.user.upsert({
      where: { email: 'admin@tughana.edu.gh' },
      update: {},
      create: {
        email: 'admin@tughana.edu.gh',
        password: hashedPassword,
        firstName: 'David',
        lastName: 'Mensah',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        phone: '+233-24-555-0001',
        institutionId: institution.id
      }
    });
    console.log(`✅ Institution Admin created: ${superAdmin.email}\n`);

    // Create role profile for admin
    await prisma.roleProfile.upsert({
      where: { userId_role: { userId: superAdmin.id, role: UserRole.ADMIN } },
      update: {},
      create: {
        userId: superAdmin.id,
        role: UserRole.ADMIN,
        permissions: {
          canManageInstitution: true,
          canManageFaculties: true,
          canManageDepartments: true,
          canManagePrograms: true,
          canManageUsers: true,
          canManageCourses: true,
          canViewReports: true
        },
        metadata: {
          staffId: 'TU-ADM-001',
          position: 'System Administrator'
        },
        isActive: true,
        isPrimary: true
      }
    });

    // ========================================
    // 3. CONFIGURE STUDENT ID FORMAT
    // ========================================
    console.log('📍 Step 3: Configuring Student ID Format...');

    let studentIdConfig = await prisma.studentIdConfig.findUnique({
      where: { institutionId: institution.id }
    });

    if (!studentIdConfig) {
      await studentIdConfigService.createConfig({
        institutionId: institution.id,
        format: StudentIdFormat.ACADEMIC_YEAR,
        prefix: 'TU',
        useAcademicYear: true,
        academicYearPos: StudentIdYearPosition.MIDDLE,
        separator: '/',
        paddingLength: 4,
        startNumber: 1
      });
      console.log(`✅ Student ID format configured: TU/24/0001\n`);
    } else {
      console.log(`✅ Student ID format already exists\n`);
    }    // ========================================
    // 4. CREATE FACULTIES
    // ========================================
    console.log('📍 Step 4: Creating Faculties...');

    const facultiesData = [
      {
        name: 'Faculty of Engineering',
        code: 'FOEN',
        description: 'Offers comprehensive engineering programs'
      },
      {
        name: 'Faculty of Applied Sciences',
        code: 'FOAS',
        description: 'Focuses on applied sciences and technology'
      },
      {
        name: 'Faculty of Business and Management',
        code: 'FOBM',
        description: 'Business and management education'
      }
    ];

    const faculties = [];
    for (const fData of facultiesData) {
      const faculty = await prisma.faculty.upsert({
        where: {
          institutionId_code: {
            institutionId: institution.id,
            code: fData.code
          }
        },
        update: {},
        create: {
          ...fData,
          institutionId: institution.id,
          establishedYear: 1995
        }
      });
      faculties.push(faculty);
    }
    console.log(`✅ Created ${faculties.length} faculties\n`);

    // ========================================
    // 5. CREATE DEPARTMENTS
    // ========================================
    console.log('📍 Step 5: Creating Departments...');

    const departmentsData = [
      // Engineering
      { name: 'Computer Engineering', code: 'CE', facultyCode: 'FOEN' },
      { name: 'Electrical Engineering', code: 'EE', facultyCode: 'FOEN' },
      { name: 'Mechanical Engineering', code: 'ME', facultyCode: 'FOEN' },
      // Applied Sciences
      { name: 'Computer Science', code: 'CS', facultyCode: 'FOAS' },
      { name: 'Information Technology', code: 'IT', facultyCode: 'FOAS' },
      { name: 'Mathematics', code: 'MATH', facultyCode: 'FOAS' },
      // Business
      { name: 'Business Administration', code: 'BA', facultyCode: 'FOBM' },
      { name: 'Accounting', code: 'ACC', facultyCode: 'FOBM' }
    ];

    const departments: any[] = [];
    for (const dData of departmentsData) {
      const faculty = faculties.find(f => f.code === dData.facultyCode);
      if (!faculty) continue;

      const dept = await prisma.department.upsert({
        where: {
          facultyId_code: {
            facultyId: faculty.id,
            code: dData.code
          }
        },
        update: {},
        create: {
          name: dData.name,
          code: dData.code,
          facultyId: faculty.id
        }
      });
      departments.push(dept);
    }
    console.log(`✅ Created ${departments.length} departments\n`);

    // ========================================
    // 6. CREATE PROGRAMS
    // ========================================
    console.log('📍 Step 6: Creating Programs...');

    const programsData = [
      { name: 'BSc Computer Engineering', code: 'BCE', deptCode: 'CE', type: 'BACHELOR', level: 'UNDERGRADUATE', duration: 4 },
      { name: 'BSc Electrical Engineering', code: 'BEE', deptCode: 'EE', type: 'BACHELOR', level: 'UNDERGRADUATE', duration: 4 },
      { name: 'BSc Mechanical Engineering', code: 'BME', deptCode: 'ME', type: 'BACHELOR', level: 'UNDERGRADUATE', duration: 4 },
      { name: 'BSc Computer Science', code: 'BCS', deptCode: 'CS', type: 'BACHELOR', level: 'UNDERGRADUATE', duration: 4 },
      { name: 'BSc Information Technology', code: 'BIT', deptCode: 'IT', type: 'BACHELOR', level: 'UNDERGRADUATE', duration: 4 },
      { name: 'BSc Business Administration', code: 'BBA', deptCode: 'BA', type: 'BACHELOR', level: 'UNDERGRADUATE', duration: 4 }
    ];

    const programs = [];
    for (const pData of programsData) {
      const dept = departments.find(d => d.code === pData.deptCode);
      if (!dept) continue;

      const program = await prisma.program.upsert({
        where: {
          departmentId_code: {
            departmentId: dept.id,
            code: pData.code
          }
        },
        update: {},
        create: {
          name: pData.name,
          code: pData.code,
          departmentId: dept.id,
          type: pData.type as any,
          level: pData.level as any,
          durationYears: pData.duration
        }
      });
      programs.push(program);
    }
    console.log(`✅ Created ${programs.length} programs\n`);

    // ========================================
    // 7. CREATE ACADEMIC YEAR & SEMESTERS
    // ========================================
    console.log('📍 Step 7: Creating Academic Year & Semesters...');

    const academicYear = await prisma.academicYear.upsert({
      where: { yearCode: '2024/2025' },
      update: {},
      create: {
        yearCode: '2024/2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-08-31'),
        isCurrent: true,
        institutionId: institution.id
      }
    });

    const semester1 = await prisma.semester.upsert({
      where: { academicYearId_semesterNumber: { academicYearId: academicYear.id, semesterNumber: 1 } },
      update: {},
      create: {
        academicYearId: academicYear.id,
        semesterNumber: 1,
        name: 'First Semester',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-12-20'),
        isCurrent: true
      }
    });

    const semester2 = await prisma.semester.upsert({
      where: { academicYearId_semesterNumber: { academicYearId: academicYear.id, semesterNumber: 2 } },
      update: {},
      create: {
        academicYearId: academicYear.id,
        semesterNumber: 2,
        name: 'Second Semester',
        startDate: new Date('2025-01-06'),
        endDate: new Date('2025-05-30'),
        isCurrent: false
      }
    });

    console.log(`✅ Academic Year: ${academicYear.yearCode}, Semester: ${semester1.name}\n`);

    // ========================================
    // 7B. CREATE ACADEMIC PERIODS
    // ========================================
    console.log('📍 Step 7B: Creating Academic Periods...');

    // Create academic period for Semester 1
    const academicPeriod1 = await prisma.academicPeriod.upsert({
      where: { semesterId: semester1.id },
      update: {},
      create: {
        semesterId: semester1.id,
        registrationStartDate: new Date('2024-08-01'), // 1 month before semester
        registrationEndDate: new Date('2024-09-15'), // 2 weeks into semester
        addDropStartDate: new Date('2024-09-01'),
        addDropEndDate: new Date('2024-09-21'), // 3 weeks into semester
        lectureStartDate: semester1.startDate,
        lectureEndDate: semester1.endDate,
        examStartDate: new Date('2024-12-21'), // 1 day after lectures end
        examEndDate: new Date('2025-01-05'), // 2 weeks for exams
        resultsReleaseDate: new Date('2025-01-15'), // 2 weeks after exams end
        maxCreditsPerStudent: 24,
        minCreditsPerStudent: 12,
        isActive: true,
        isRegistrationOpen: true, // Open for registration
        isAddDropOpen: true,
        createdBy: superAdmin.id
      }
    });

    // Create academic period for Semester 2
    const academicPeriod2 = await prisma.academicPeriod.upsert({
      where: { semesterId: semester2.id },
      update: {},
      create: {
        semesterId: semester2.id,
        registrationStartDate: new Date('2024-12-01'),
        registrationEndDate: new Date('2025-01-20'),
        addDropStartDate: new Date('2025-01-06'),
        addDropEndDate: new Date('2025-01-27'),
        lectureStartDate: semester2.startDate,
        lectureEndDate: semester2.endDate,
        examStartDate: new Date('2025-05-31'),
        examEndDate: new Date('2025-06-14'),
        resultsReleaseDate: new Date('2025-06-25'),
        maxCreditsPerStudent: 24,
        minCreditsPerStudent: 12,
        isActive: false,
        isRegistrationOpen: false,
        isAddDropOpen: false,
        createdBy: superAdmin.id
      }
    });

    console.log(`✅ Created Academic Periods for both semesters\n`);

    // ========================================
    // 8. CREATE LECTURERS
    // ========================================
    console.log('📍 Step 8: Creating Lecturers...');

    const lecturersData = [
      { firstName: 'Kwame', lastName: 'Asante', email: 'k.asante@tughana.edu.gh', deptCode: 'CE', staffId: 'TU-LEC-001' },
      { firstName: 'Akua', lastName: 'Owusu', email: 'a.owusu@tughana.edu.gh', deptCode: 'EE', staffId: 'TU-LEC-002' },
      { firstName: 'Kofi', lastName: 'Mensah', email: 'k.mensah@tughana.edu.gh', deptCode: 'ME', staffId: 'TU-LEC-003' },
      { firstName: 'Ama', lastName: 'Boateng', email: 'a.boateng@tughana.edu.gh', deptCode: 'CS', staffId: 'TU-LEC-004' },
      { firstName: 'Yaw', lastName: 'Agyeman', email: 'y.agyeman@tughana.edu.gh', deptCode: 'IT', staffId: 'TU-LEC-005' },
      { firstName: 'Efua', lastName: 'Anane', email: 'e.anane@tughana.edu.gh', deptCode: 'MATH', staffId: 'TU-LEC-006' },
      { firstName: 'Kwesi', lastName: 'Darko', email: 'k.darko@tughana.edu.gh', deptCode: 'BA', staffId: 'TU-LEC-007' },
      { firstName: 'Abena', lastName: 'Frimpong', email: 'a.frimpong@tughana.edu.gh', deptCode: 'ACC', staffId: 'TU-LEC-008' }
    ];

    const lecturers = [];
    for (const lData of lecturersData) {
      const dept = departments.find(d => d.code === lData.deptCode);
      if (!dept) continue;

      const lecturer = await prisma.user.upsert({
        where: { email: lData.email },
        update: {},
        create: {
          email: lData.email,
          password: hashedPassword,
          firstName: lData.firstName,
          lastName: lData.lastName,
          role: UserRole.LECTURER,
          status: UserStatus.ACTIVE,
          emailVerified: true,
          institutionId: institution.id,
          departmentId: dept.id
        }
      });

      await prisma.roleProfile.upsert({
        where: { userId_role: { userId: lecturer.id, role: UserRole.LECTURER } },
        update: {},
        create: {
          userId: lecturer.id,
          role: UserRole.LECTURER,
          permissions: {
            canGradeStudents: true,
            canManageCourseContent: true,
            canViewStudentRecords: true
          },
          metadata: {
            staffId: lData.staffId,
            academicRank: 'Senior Lecturer',
            specialization: dept.name
          },
          isActive: true,
          isPrimary: true
        }
      });

      lecturers.push(lecturer);
    }
    console.log(`✅ Created ${lecturers.length} lecturers\n`);

    // ========================================
    // 9. CREATE COURSES
    // ========================================
    console.log('📍 Step 9: Creating Courses...');

    const coursesData = [
      // Computer Engineering
      { code: 'CE101', name: 'Introduction to Computing', credits: 3, deptCode: 'CE', level: 100, semester: 1 },
      { code: 'CE102', name: 'Digital Logic Design', credits: 3, deptCode: 'CE', level: 100, semester: 1 },
      { code: 'CE201', name: 'Data Structures & Algorithms', credits: 4, deptCode: 'CE', level: 200, semester: 1 },
      { code: 'CE202', name: 'Computer Architecture', credits: 3, deptCode: 'CE', level: 200, semester: 1 },
      // Computer Science
      { code: 'CS101', name: 'Programming Fundamentals', credits: 3, deptCode: 'CS', level: 100, semester: 1 },
      { code: 'CS102', name: 'Discrete Mathematics', credits: 3, deptCode: 'CS', level: 100, semester: 1 },
      { code: 'CS201', name: 'Object-Oriented Programming', credits: 4, deptCode: 'CS', level: 200, semester: 1 },
      { code: 'CS202', name: 'Database Systems', credits: 3, deptCode: 'CS', level: 200, semester: 1 },
      // Information Technology
      { code: 'IT101', name: 'Introduction to IT', credits: 3, deptCode: 'IT', level: 100, semester: 1 },
      { code: 'IT102', name: 'Web Technologies', credits: 3, deptCode: 'IT', level: 100, semester: 1 },
      { code: 'IT201', name: 'Network Fundamentals', credits: 3, deptCode: 'IT', level: 200, semester: 1 },
      { code: 'IT202', name: 'Systems Analysis', credits: 3, deptCode: 'IT', level: 200, semester: 1 },
      // Mathematics (Core for all programs)
      { code: 'MATH101', name: 'Calculus I', credits: 3, deptCode: 'MATH', level: 100, semester: 1 },
      { code: 'MATH102', name: 'Linear Algebra', credits: 3, deptCode: 'MATH', level: 100, semester: 1 },
      // Business
      { code: 'BA101', name: 'Principles of Management', credits: 3, deptCode: 'BA', level: 100, semester: 1 },
      { code: 'ACC101', name: 'Financial Accounting', credits: 3, deptCode: 'ACC', level: 100, semester: 1 }
    ];

    const courses = [];
    for (const cData of coursesData) {
      const dept = departments.find(d => d.code === cData.deptCode);
      if (!dept) continue;

      const course = await prisma.course.upsert({
        where: { code: cData.code },
        update: {},
        create: {
          code: cData.code,
          name: cData.name,
          creditHours: cData.credits,
          level: cData.level,
          departmentId: dept.id,
          description: `${cData.name} course`,
          courseType: 'CORE'
        }
      });

      courses.push({ ...course, level: cData.level, semester: cData.semester, deptCode: cData.deptCode });
    }
    console.log(`✅ Created ${courses.length} courses\n`);

    // ========================================
    // 10. LINK COURSES TO PROGRAMS
    // ========================================
    console.log('📍 Step 10: Linking Courses to Programs...');

    let linkCount = 0;
    for (const course of courses) {
      // Link to programs in the same department
      const programsInDept = programs.filter(p => {
        const dept = departments.find(d => d.id === p.departmentId);
        return dept?.code === course.deptCode;
      });

      for (const program of programsInDept) {
        await prisma.programCourse.upsert({
          where: {
            programId_courseId_level_semester: {
              programId: program.id,
              courseId: course.id,
              level: course.level,
              semester: course.semester
            }
          },
          update: {},
          create: {
            programId: program.id,
            courseId: course.id,
            level: course.level,
            semester: course.semester,
            isRequired: true,
            isCore: true,
            yearInProgram: Math.ceil(course.level / 100),
            offeredInSemester1: course.semester === 1,
            offeredInSemester2: course.semester === 2
          }
        });
        linkCount++;
      }

      // Math courses are core for engineering/CS programs
      if (course.deptCode === 'MATH') {
        const techPrograms = programs.filter(p =>
          ['BCE', 'BEE', 'BME', 'BCS', 'BIT'].includes(p.code)
        );
        for (const program of techPrograms) {
          await prisma.programCourse.upsert({
            where: {
              programId_courseId_level_semester: {
                programId: program.id,
                courseId: course.id,
                level: course.level,
                semester: course.semester
              }
            },
            update: {},
            create: {
              programId: program.id,
              courseId: course.id,
              level: course.level,
              semester: course.semester,
              isRequired: true,
              isCore: true,
              yearInProgram: 1,
              offeredInSemester1: true,
              offeredInSemester2: false
            }
          });
          linkCount++;
        }
      }
    }
    console.log(`✅ Created ${linkCount} program-course links\n`);

    // ========================================
    // 11. CREATE COURSE OFFERINGS
    // ========================================
    console.log('📍 Step 11: Creating Course Offerings...');

    let offeringsCount = 0;
    for (const course of courses.filter(c => c.semester === 1)) {
      const dept = departments.find(d => d.code === course.deptCode);
      const lecturer = lecturers.find(l => l.departmentId === dept?.id);

      await prisma.courseOffering.upsert({
        where: {
          courseId_semesterId: {
            courseId: course.id,
            semesterId: semester1.id
          }
        },
        update: {},
        create: {
          courseId: course.id,
          semesterId: semester1.id,
          primaryLecturerId: lecturer?.id,
          maxEnrollment: 150,
          status: 'active'
        }
      });
      offeringsCount++;
    }
    console.log(`✅ Created ${offeringsCount} course offerings\n`);

    // ========================================
    // 12. CREATE STUDENTS
    // ========================================
    console.log('📍 Step 12: Creating Students...');

    const studentsData = [
      // Computer Engineering (BCE)
      { firstName: 'Kwabena', lastName: 'Osei', email: 'kwabena.osei@student.tughana.edu.gh', programCode: 'BCE', level: 100 },
      { firstName: 'Akosua', lastName: 'Adjei', email: 'akosua.adjei@student.tughana.edu.gh', programCode: 'BCE', level: 100 },
      { firstName: 'Yaw', lastName: 'Mensah', email: 'yaw.mensah@student.tughana.edu.gh', programCode: 'BCE', level: 200 },
      // Computer Science (BCS)
      { firstName: 'Esi', lastName: 'Agyemang', email: 'esi.agyemang@student.tughana.edu.gh', programCode: 'BCS', level: 100 },
      { firstName: 'Kojo', lastName: 'Boakye', email: 'kojo.boakye@student.tughana.edu.gh', programCode: 'BCS', level: 100 },
      { firstName: 'Afia', lastName: 'Appiah', email: 'afia.appiah@student.tughana.edu.gh', programCode: 'BCS', level: 200 },
      // Information Technology (BIT)
      { firstName: 'Kofi', lastName: 'Antwi', email: 'kofi.antwi@student.tughana.edu.gh', programCode: 'BIT', level: 100 },
      { firstName: 'Adwoa', lastName: 'Nyarko', email: 'adwoa.nyarko@student.tughana.edu.gh', programCode: 'BIT', level: 100 },
      { firstName: 'Kwame', lastName: 'Owusu', email: 'kwame.owusu@student.tughana.edu.gh', programCode: 'BIT', level: 200 },
      // Business Administration (BBA)
      { firstName: 'Ama', lastName: 'Serwaa', email: 'ama.serwaa@student.tughana.edu.gh', programCode: 'BBA', level: 100 },
      { firstName: 'Kwesi', lastName: 'Tawiah', email: 'kwesi.tawiah@student.tughana.edu.gh', programCode: 'BBA', level: 100 }
    ];

    const students = [];
    for (const sData of studentsData) {
      const program = programs.find(p => p.code === sData.programCode);
      if (!program) continue;

      const student = await prisma.user.upsert({
        where: { email: sData.email },
        update: {},
        create: {
          email: sData.email,
          password: hashedPassword,
          firstName: sData.firstName,
          lastName: sData.lastName,
          role: UserRole.STUDENT,
          status: UserStatus.ACTIVE,
          emailVerified: true,
          institutionId: institution.id
        }
      });

      // Generate student ID using the service
      const studentId = await studentIdConfigService.generateStudentId({
        institutionId: institution.id,
        academicYearId: academicYear.id,
        programCode: program.code
      });

      await prisma.roleProfile.upsert({
        where: { userId_role: { userId: student.id, role: UserRole.STUDENT } },
        update: {},
        create: {
          userId: student.id,
          role: UserRole.STUDENT,
          permissions: {
            canViewCourses: true,
            canRegisterCourses: true,
            canViewGrades: true
          },
          metadata: {
            studentId: studentId,
            indexNumber: studentId,
            programId: program.id,
            level: sData.level,
            semester: 1,
            enrollmentStatus: 'ENROLLED',
            academicStatus: 'GOOD_STANDING',
            admissionDate: '2024-09-01'
          },
          isActive: true,
          isPrimary: true
        }
      });

      students.push({ ...student, studentId, programId: program.id, level: sData.level });
    }
    console.log(`✅ Created ${students.length} students with generated IDs\n`);

    // ========================================
    // 13. CREATE VENUES & ROOMS
    // ========================================
    console.log('📍 Step 13: Creating Venues & Rooms...');

    const venue = await prisma.venue.upsert({
      where: { id: -1 }, // Use dummy ID as Venue doesn't have unique constraint on name+institution
      update: {},
      create: {
        name: 'Main Examination Hall',
        location: 'Central Campus Building',
        institutionId: institution.id,
        capacity: 500
      }
    });

    const roomsData = [
      { name: 'Exam Hall A', capacity: 150 },
      { name: 'Exam Hall B', capacity: 150 },
      { name: 'Exam Hall C', capacity: 200 }
    ];

    const rooms = [];
    for (const rData of roomsData) {
      const room = await prisma.room.upsert({
        where: {
          venueId_name: {
            venueId: venue.id,
            name: rData.name
          }
        },
        update: {},
        create: {
          name: rData.name,
          venueId: venue.id,
          capacity: rData.capacity
        }
      });
      rooms.push(room);
    }
    console.log(`✅ Created venue with ${rooms.length} rooms\n`);

    // ========================================
    // 14. CREATE EXAM TIMETABLE
    // ========================================
    console.log('📍 Step 14: Creating Exam Timetable...');

    const examTimetable = await prisma.examTimetable.create({
      data: {
        title: 'First Semester Examinations 2024/2025',
        description: 'End of semester examinations for all level 100 and 200 students',
        academicYearId: academicYear.id,
        semesterId: semester1.id,
        institutionId: institution.id,
        status: 'PUBLISHED',
        startDate: new Date('2024-12-10'),
        endDate: new Date('2024-12-20'),
        createdBy: superAdmin.id,
        publishedBy: superAdmin.id,
        publishedAt: new Date(),
        isPublished: true
      }
    });
    console.log(`✅ Exam timetable created: ${examTimetable.title}\n`);

    // ========================================
    // 15. CREATE TIMETABLE ENTRIES
    // ========================================
    console.log('📍 Step 15: Creating Timetable Entries...');

    const examDates = [
      new Date('2024-12-10T08:00:00'),
      new Date('2024-12-10T14:00:00'),
      new Date('2024-12-11T08:00:00'),
      new Date('2024-12-11T14:00:00'),
      new Date('2024-12-12T08:00:00'),
      new Date('2024-12-12T14:00:00')
    ];

    let entryCount = 0;
    const level100Courses = courses.filter(c => c.level === 100 && c.semester === 1);

    for (let i = 0; i < Math.min(level100Courses.length, examDates.length); i++) {
      const course = level100Courses[i];
      const courseOffering = await prisma.courseOffering.findFirst({
        where: { courseId: course.id, semesterId: semester1.id }
      });

      if (!courseOffering) continue;

      const entry = await prisma.examTimetableEntry.create({
        data: {
          timetableId: examTimetable.id,
          courseId: course.id,
          examDate: examDates[i],
          startTime: examDates[i],
          endTime: new Date(examDates[i].getTime() + 3 * 60 * 60 * 1000), // 3 hours
          duration: 180,
          status: 'SCHEDULED',
          venueId: venue.id,
          level: 100
        }
      });

      // Link to room
      await prisma.examTimetableRoom.create({
        data: {
          timetableEntryId: entry.id,
          roomId: rooms[i % rooms.length].id
        }
      });

      // Link to programs
      const programsForCourse = await prisma.programCourse.findMany({
        where: { courseId: course.id, level: 100 }
      });

      for (const pc of programsForCourse) {
        await prisma.examTimetableProgram.create({
          data: {
            timetableEntryId: entry.id,
            programId: pc.programId
          }
        });
      }

      entryCount++;
    }
    console.log(`✅ Created ${entryCount} timetable entries\n`);

    // ========================================
    // 16. REGISTER STUDENTS FOR EXAMS
    // ========================================
    console.log('📍 Step 16: Registering Students for Exams...');

    let registrationCount = 0;
    const level100Students = students.filter(s => s.level === 100);

    for (const student of level100Students) {
      const program = programs.find(p => p.id === student.programId);
      if (!program) continue;

      // Get courses for this student's program
      const programCourses = await prisma.programCourse.findMany({
        where: {
          programId: program.id,
          level: 100,
          semester: 1
        },
        include: { course: true }
      });

      for (const pc of programCourses) {
        const timetableEntry = await prisma.examTimetableEntry.findFirst({
          where: {
            timetableId: examTimetable.id,
            courseId: pc.courseId
          }
        });

        if (!timetableEntry) continue;

        await prisma.examRegistration.create({
          data: {
            studentId: student.id,
            examEntryId: timetableEntry.id,
            studentQRCode: `QR-${student.studentId}-${timetableEntry.id}`
          }
        });
        registrationCount++;
      }
    }
    console.log(`✅ Created ${registrationCount} exam registrations\n`);

    // ========================================
    // FINAL SUMMARY
    // ========================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ COMPREHENSIVE SEEDING COMPLETED!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 SEEDING SUMMARY:');
    console.log('─────────────────────────────────────────');
    console.log(`🏛️  Institution: ${institution.name}`);
    console.log(`👤 Admin Email: ${superAdmin.email}`);
    console.log(`🔑 Default Password: ${DEFAULT_PASSWORD}`);
    console.log(`📚 Faculties: ${faculties.length}`);
    console.log(`🏢 Departments: ${departments.length}`);
    console.log(`🎓 Programs: ${programs.length}`);
    console.log(`📖 Courses: ${courses.length}`);
    console.log(`👨‍🏫 Lecturers: ${lecturers.length}`);
    console.log(`👨‍🎓 Students: ${students.length}`);
    console.log(`📋 Course Offerings: ${offeringsCount}`);
    console.log(`🏛️  Exam Venues: 1`);
    console.log(`🚪 Exam Rooms: ${rooms.length}`);
    console.log(`📅 Exam Timetables: 1`);
    console.log(`📝 Timetable Entries: ${entryCount}`);
    console.log(`✍️  Exam Registrations: ${registrationCount}`);
    console.log('─────────────────────────────────────────\n');

    console.log('🎯 SAMPLE STUDENT IDs GENERATED:');
    students.slice(0, 5).forEach(s => {
      console.log(`   ${s.firstName} ${s.lastName}: ${s.studentId}`);
    });
    console.log('\n');

    console.log('🔐 LOGIN CREDENTIALS:');
    console.log('─────────────────────────────────────────');
    console.log('Institution Admin:');
    console.log(`  Email: ${superAdmin.email}`);
    console.log(`  Password: ${DEFAULT_PASSWORD}`);
    console.log('\nSample Lecturer:');
    console.log(`  Email: ${lecturers[0].email}`);
    console.log(`  Password: ${DEFAULT_PASSWORD}`);
    console.log('\nSample Student:');
    console.log(`  Email: ${students[0].email}`);
    console.log(`  Password: ${DEFAULT_PASSWORD}`);
    console.log('─────────────────────────────────────────\n');

  } catch (error) {
    console.error('❌ Error during comprehensive seeding:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('🎉 Database connection closed. Seeding complete!');
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('💥 Seeding failed with error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
