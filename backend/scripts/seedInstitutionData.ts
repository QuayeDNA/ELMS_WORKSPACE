import {
  PrismaClient,
  UserRole,
  UserStatus,
  ProgramType,
  ProgramLevel,
  CourseType,
  AcademicRankLevel,
  EmploymentType,
  EmploymentStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { AuthService } from "../src/services/authService";
import { FacultyService } from "../src/services/facultyService";
import { departmentService } from "../src/services/departmentService";
import { programService } from "../src/services/programService";
import { courseService } from "../src/services/courseService";
import { UserService } from "../src/services/userService";
import { studentService } from "../src/services/studentService";

const prisma = new PrismaClient();

// Faculty data from the provided JSON
const FACULTY_DATA = [
  {
    id: "FBNE001",
    name: "Faculty of Built and Natural Environment",
  },
  {
    id: "FAS001",
    name: "Faculty of Applied Sciences",
  },
  {
    id: "FE001",
    name: "Faculty Of Engineering",
  },
  {
    id: "FAAT001",
    name: "Faculty of Applied Arts and Technology",
  },
  {
    id: "FBMS001",
    name: "Faculty of Business and Management Studies",
  },
];

// Department data for each faculty
const DEPARTMENT_DATA = {
  FBNE001: [
    { code: "ARCH", name: "Architecture" },
    { code: "BTECH", name: "Building Technology" },
    { code: "ESTM", name: "Estate Management" },
    { code: "QSV", name: "Quantity Surveying and Construction Economics" },
  ],
  FAS001: [
    { code: "CHEM", name: "Chemical Sciences" },
    { code: "COMP", name: "Computer Science" },
    { code: "MATH", name: "Mathematics and Statistics" },
    { code: "PHYS", name: "Physics" },
  ],
  FE001: [
    { code: "CIVIL", name: "Civil Engineering" },
    { code: "ELEC", name: "Electrical Engineering" },
    { code: "MECH", name: "Mechanical Engineering" },
    { code: "TELECOM", name: "Telecommunications Engineering" },
  ],
  FAAT001: [
    { code: "FASH", name: "Fashion Design and Textiles" },
    { code: "GRAPH", name: "Graphic Design" },
    { code: "HOTEL", name: "Hotel, Catering and Institutional Management" },
  ],
  FBMS001: [
    { code: "ACCT", name: "Accounting" },
    { code: "BANK", name: "Banking and Finance" },
    { code: "MKT", name: "Marketing" },
    { code: "MGMT", name: "Management Studies" },
  ],
};

// Program data
const PROGRAM_DATA = [
  // Built and Natural Environment
  {
    code: "BSc-ARCH",
    name: "Bachelor of Science in Architecture",
    type: ProgramType.BACHELOR,
    level: ProgramLevel.UNDERGRADUATE,
    duration: 5,
    department: "ARCH",
  },
  {
    code: "BSc-BTECH",
    name: "Bachelor of Science in Building Technology",
    type: ProgramType.BACHELOR,
    level: ProgramLevel.UNDERGRADUATE,
    duration: 4,
    department: "BTECH",
  },
  {
    code: "BSc-ESTM",
    name: "Bachelor of Science in Estate Management",
    type: ProgramType.BACHELOR,
    level: ProgramLevel.UNDERGRADUATE,
    duration: 4,
    department: "ESTM",
  },
  {
    code: "BSc-QSV",
    name: "Bachelor of Science in Quantity Surveying",
    type: ProgramType.BACHELOR,
    level: ProgramLevel.UNDERGRADUATE,
    duration: 4,
    department: "QSV",
  },

  // Applied Sciences
  {
    code: "BSc-COMP",
    name: "Bachelor of Science in Computer Science",
    type: ProgramType.BACHELOR,
    level: ProgramLevel.UNDERGRADUATE,
    duration: 4,
    department: "COMP",
  },
  {
    code: "BSc-CHEM",
    name: "Bachelor of Science in Chemistry",
    type: ProgramType.BACHELOR,
    level: ProgramLevel.UNDERGRADUATE,
    duration: 4,
    department: "CHEM",
  },
  {
    code: "BSc-MATH",
    name: "Bachelor of Science in Mathematics",
    type: ProgramType.BACHELOR,
    level: ProgramLevel.UNDERGRADUATE,
    duration: 4,
    department: "MATH",
  },
  {
    code: "BSc-PHYS",
    name: "Bachelor of Science in Physics",
    type: ProgramType.BACHELOR,
    level: ProgramLevel.UNDERGRADUATE,
    duration: 4,
    department: "PHYS",
  },

  // Engineering
  {
    code: "BSc-CIVIL",
    name: "Bachelor of Science in Civil Engineering",
    type: ProgramType.BACHELOR,
    level: ProgramLevel.UNDERGRADUATE,
    duration: 4,
    department: "CIVIL",
  },
  {
    code: "BSc-ELEC",
    name: "Bachelor of Science in Electrical Engineering",
    type: ProgramType.BACHELOR,
    level: ProgramLevel.UNDERGRADUATE,
    duration: 4,
    department: "ELEC",
  },
  {
    code: "BSc-MECH",
    name: "Bachelor of Science in Mechanical Engineering",
    type: ProgramType.BACHELOR,
    level: ProgramLevel.UNDERGRADUATE,
    duration: 4,
    department: "MECH",
  },
  {
    code: "BSc-TELECOM",
    name: "Bachelor of Science in Telecommunications",
    type: ProgramType.BACHELOR,
    level: ProgramLevel.UNDERGRADUATE,
    duration: 4,
    department: "TELECOM",
  },

  // Applied Arts and Technology
  {
    code: "BSc-FASH",
    name: "Bachelor of Science in Fashion Design",
    type: ProgramType.BACHELOR,
    level: ProgramLevel.UNDERGRADUATE,
    duration: 4,
    department: "FASH",
  },
  {
    code: "BSc-GRAPH",
    name: "Bachelor of Science in Graphic Design",
    type: ProgramType.BACHELOR,
    level: ProgramLevel.UNDERGRADUATE,
    duration: 4,
    department: "GRAPH",
  },
  {
    code: "BSc-HOTEL",
    name: "Bachelor of Science in Hotel Management",
    type: ProgramType.BACHELOR,
    level: ProgramLevel.UNDERGRADUATE,
    duration: 4,
    department: "HOTEL",
  },

  // Business and Management Studies
  {
    code: "BSc-ACCT",
    name: "Bachelor of Science in Accounting",
    type: ProgramType.BACHELOR,
    level: ProgramLevel.UNDERGRADUATE,
    duration: 4,
    department: "ACCT",
  },
  {
    code: "BSc-BANK",
    name: "Bachelor of Science in Banking and Finance",
    type: ProgramType.BACHELOR,
    level: ProgramLevel.UNDERGRADUATE,
    duration: 4,
    department: "BANK",
  },
  {
    code: "BSc-MKT",
    name: "Bachelor of Science in Marketing",
    type: ProgramType.BACHELOR,
    level: ProgramLevel.UNDERGRADUATE,
    duration: 4,
    department: "MKT",
  },
  {
    code: "BSc-MGMT",
    name: "Bachelor of Science in Management",
    type: ProgramType.BACHELOR,
    level: ProgramLevel.UNDERGRADUATE,
    duration: 4,
    department: "MGMT",
  },
];

// Course data (sample courses for each level)
const COURSE_DATA = [
  // Level 100
  {
    code: "MATH101",
    name: "Mathematics I",
    level: 100,
    creditHours: 3,
    department: "MATH",
  },
  {
    code: "ENG101",
    name: "English Communication",
    level: 100,
    creditHours: 2,
    department: "COMP",
  },
  {
    code: "PHY101",
    name: "Physics I",
    level: 100,
    creditHours: 3,
    department: "PHYS",
  },
  {
    code: "CHEM101",
    name: "Chemistry I",
    level: 100,
    creditHours: 3,
    department: "CHEM",
  },

  // Level 200
  {
    code: "MATH201",
    name: "Mathematics II",
    level: 200,
    creditHours: 3,
    department: "MATH",
  },
  {
    code: "COMP201",
    name: "Introduction to Programming",
    level: 200,
    creditHours: 3,
    department: "COMP",
  },
  {
    code: "PHY201",
    name: "Physics II",
    level: 200,
    creditHours: 3,
    department: "PHYS",
  },
  {
    code: "CIVIL201",
    name: "Engineering Drawing",
    level: 200,
    creditHours: 3,
    department: "CIVIL",
  },

  // Level 300
  {
    code: "COMP301",
    name: "Data Structures and Algorithms",
    level: 300,
    creditHours: 3,
    department: "COMP",
  },
  {
    code: "ACCT301",
    name: "Financial Accounting",
    level: 300,
    creditHours: 3,
    department: "ACCT",
  },
  {
    code: "MECH301",
    name: "Thermodynamics",
    level: 300,
    creditHours: 3,
    department: "MECH",
  },
  {
    code: "ARCH301",
    name: "Architectural Design I",
    level: 300,
    creditHours: 4,
    department: "ARCH",
  },

  // Level 400
  {
    code: "COMP401",
    name: "Software Engineering",
    level: 400,
    creditHours: 3,
    department: "COMP",
  },
  {
    code: "ACCT401",
    name: "Advanced Accounting",
    level: 400,
    creditHours: 3,
    department: "ACCT",
  },
  {
    code: "ELEC401",
    name: "Power Systems",
    level: 400,
    creditHours: 3,
    department: "ELEC",
  },
  {
    code: "MKT401",
    name: "Strategic Marketing",
    level: 400,
    creditHours: 3,
    department: "MKT",
  },
];

// Lecturer data
const LECTURER_DATA = [
  {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@ttu.edu.gh",
    department: "COMP",
    rank: AcademicRankLevel.LECTURER,
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@ttu.edu.gh",
    department: "COMP",
    rank: AcademicRankLevel.SENIOR_LECTURER,
  },
  {
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.johnson@ttu.edu.gh",
    department: "MATH",
    rank: AcademicRankLevel.ASSISTANT_LECTURER,
  },
  {
    firstName: "Sarah",
    lastName: "Williams",
    email: "sarah.williams@ttu.edu.gh",
    department: "PHYS",
    rank: AcademicRankLevel.LECTURER,
  },
  {
    firstName: "David",
    lastName: "Brown",
    email: "david.brown@ttu.edu.gh",
    department: "CHEM",
    rank: AcademicRankLevel.PRINCIPAL_LECTURER,
  },
  {
    firstName: "Emma",
    lastName: "Davis",
    email: "emma.davis@ttu.edu.gh",
    department: "ACCT",
    rank: AcademicRankLevel.LECTURER,
  },
  {
    firstName: "Robert",
    lastName: "Miller",
    email: "robert.miller@ttu.edu.gh",
    department: "CIVIL",
    rank: AcademicRankLevel.SENIOR_LECTURER,
  },
  {
    firstName: "Lisa",
    lastName: "Wilson",
    email: "lisa.wilson@ttu.edu.gh",
    department: "ELEC",
    rank: AcademicRankLevel.LECTURER,
  },
];

// Student data
const STUDENT_DATA = [
  {
    firstName: "Alex",
    lastName: "Thompson",
    email: "alex.thompson@ttu.edu.gh",
    program: "BSc-COMP",
    level: 200,
  },
  {
    firstName: "Maria",
    lastName: "Garcia",
    email: "maria.garcia@ttu.edu.gh",
    program: "BSc-COMP",
    level: 300,
  },
  {
    firstName: "James",
    lastName: "Anderson",
    email: "james.anderson@ttu.edu.gh",
    program: "BSc-MATH",
    level: 100,
  },
  {
    firstName: "Sophia",
    lastName: "Martinez",
    email: "sophia.martinez@ttu.edu.gh",
    program: "BSc-PHYS",
    level: 200,
  },
  {
    firstName: "William",
    lastName: "Taylor",
    email: "william.taylor@ttu.edu.gh",
    program: "BSc-CHEM",
    level: 300,
  },
  {
    firstName: "Olivia",
    lastName: "Rodriguez",
    email: "olivia.rodriguez@ttu.edu.gh",
    program: "BSc-ACCT",
    level: 100,
  },
  {
    firstName: "Benjamin",
    lastName: "Lee",
    email: "benjamin.lee@ttu.edu.gh",
    program: "BSc-CIVIL",
    level: 200,
  },
  {
    firstName: "Isabella",
    lastName: "Walker",
    email: "isabella.walker@ttu.edu.gh",
    program: "BSc-ELEC",
    level: 300,
  },
  {
    firstName: "Lucas",
    lastName: "Hall",
    email: "lucas.hall@ttu.edu.gh",
    program: "BSc-MECH",
    level: 100,
  },
  {
    firstName: "Charlotte",
    lastName: "Young",
    email: "charlotte.young@ttu.edu.gh",
    program: "BSc-ARCH",
    level: 200,
  },
];

async function seedInstitutionData() {
  try {
    console.log("🚀 Starting comprehensive institution data seeding...");

    // Step 1: Create/find TTU institution
    console.log("\n📚 Step 1: Creating/finding TTU institution...");
    const institution = await prisma.institution.upsert({
      where: { code: "TTU" },
      update: {},
      create: {
        name: "Takoradi Technical University",
        code: "TTU",
        type: "UNIVERSITY",
        status: "ACTIVE",
        establishedYear: 2016,
        address: "Takoradi, Ghana",
        city: "Takoradi",
        country: "Ghana",
        contactEmail: "info@ttu.edu.gh",
        website: "https://ttu.edu.gh",
        description:
          "Takoradi Technical University - Excellence in Technical Education",
      },
    });
    console.log(
      `✅ Institution created/found: ${institution.name} (ID: ${institution.id})`
    );

    // Step 2: Create institution admin user
    console.log("\n👤 Step 2: Creating institution admin user...");
    const hashedPassword = await bcrypt.hash("Admin@123", 12);

    const adminUser = await prisma.user.upsert({
      where: { email: "ttu.admin@ttu.edu.gh" },
      update: {},
      create: {
        email: "ttu.admin@ttu.edu.gh",
        password: hashedPassword,
        firstName: "Institution",
        lastName: "Administrator",
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        institutionId: institution.id,
        phone: "+233501234567",
        address: "Takoradi Technical University, Takoradi, Ghana",
      },
    });

    // Create admin profile
    await prisma.adminProfile.upsert({
      where: { userId: adminUser.id },
      update: {},
      create: {
        userId: adminUser.id,
        permissions: {},
        canManageFaculties: true,
        canManageUsers: true,
        canViewAnalytics: true,
      },
    });
    console.log(`✅ Institution admin created: ${adminUser.email}`);

    // Step 3: Authenticate as institution admin (simulate login to get token)
    console.log("\n🔐 Step 3: Authenticating as institution admin...");
    const authResult = await AuthService.login({
      email: "ttu.admin@ttu.edu.gh",
      password: "Admin@123",
    });
    console.log("✅ Authentication successful");

    // For this seeding script, we'll use direct database operations since we're running as a script
    // In a real application, we'd use the API endpoints with the auth token

    // Step 4: Seed faculties
    console.log("\n🏫 Step 4: Seeding faculties...");
    const faculties = [];
    for (const facultyData of FACULTY_DATA) {
      const faculty = await prisma.faculty.upsert({
        where: {
          institutionId_code: {
            institutionId: institution.id,
            code: facultyData.id,
          },
        },
        update: {},
        create: {
          name: facultyData.name,
          code: facultyData.id,
          institutionId: institution.id,
          description: `${facultyData.name} at Takoradi Technical University`,
        },
      });
      faculties.push(faculty);
      console.log(`✅ Created faculty: ${faculty.name} (${faculty.code})`);
    }

    // Step 5: Seed departments
    console.log("\n🏢 Step 5: Seeding departments...");
    const departments = [];
    for (const faculty of faculties) {
      const deptData =
        DEPARTMENT_DATA[faculty.code as keyof typeof DEPARTMENT_DATA];
      if (deptData) {
        for (const dept of deptData) {
          const department = await prisma.department.upsert({
            where: {
              facultyId_code: {
                facultyId: faculty.id,
                code: dept.code,
              },
            },
            update: {},
            create: {
              name: dept.name,
              code: dept.code,
              facultyId: faculty.id,
              description: `${dept.name} Department`,
              type: "department",
            },
          });
          departments.push(department);
          console.log(
            `✅ Created department: ${department.name} (${department.code}) in ${faculty.name}`
          );
        }
      }
    }

    // Step 6: Seed programs
    console.log("\n📚 Step 6: Seeding programs...");
    const programs = [];
    for (const programData of PROGRAM_DATA) {
      const department = departments.find(
        (d) => d.code === programData.department
      );
      if (department) {
        const program = await prisma.program.upsert({
          where: {
            departmentId_code: {
              departmentId: department.id,
              code: programData.code,
            },
          },
          update: {},
          create: {
            name: programData.name,
            code: programData.code,
            type: programData.type,
            level: programData.level,
            durationYears: programData.duration,
            creditHours: programData.duration * 30, // Approximate credit hours
            description: programData.name,
            departmentId: department.id,
            isActive: true,
          },
        });
        programs.push(program);
        console.log(`✅ Created program: ${program.name} (${program.code})`);
      }
    }

    // Step 7: Seed courses
    console.log("\n📖 Step 7: Seeding courses...");
    const courses = [];
    for (const courseData of COURSE_DATA) {
      const department = departments.find(
        (d) => d.code === courseData.department
      );
      if (department) {
        const course = await prisma.course.upsert({
          where: { code: courseData.code },
          update: {},
          create: {
            name: courseData.name,
            code: courseData.code,
            description: courseData.name,
            creditHours: courseData.creditHours,
            level: courseData.level,
            courseType: CourseType.CORE,
            departmentId: department.id,
            isActive: true,
          },
        });
        courses.push(course);
        console.log(
          `✅ Created course: ${course.name} (${course.code}) - Level ${course.level}`
        );
      }
    }

    // Step 8: Seed lecturers
    console.log("\n👨‍🏫 Step 8: Seeding lecturers...");
    const lecturers = [];
    for (const lecturerData of LECTURER_DATA) {
      const department = departments.find(
        (d) => d.code === lecturerData.department
      );
      if (department) {
        // Generate staff ID
        const staffId: string = `LEC${String(lecturers.length + 1).padStart(3, "0")}`;

        // Hash password
        const lecturerPassword = await bcrypt.hash("Lecturer@123", 12);

        const lecturerUser = await prisma.user.upsert({
          where: { email: lecturerData.email },
          update: {},
          create: {
            email: lecturerData.email,
            password: lecturerPassword,
            firstName: lecturerData.firstName,
            lastName: lecturerData.lastName,
            role: UserRole.LECTURER,
            status: UserStatus.ACTIVE,
            emailVerified: true,
            institutionId: institution.id,
            facultyId: department.facultyId,
            departmentId: department.id,
            phone:
              "+23350" +
              String(Math.floor(Math.random() * 1000000)).padStart(6, "0"),
            address: "Takoradi Technical University, Takoradi, Ghana",
          },
        });

        // Create lecturer profile
        const lecturerProfile = await prisma.lecturerProfile.upsert({
          where: { userId: lecturerUser.id },
          update: {},
          create: {
            userId: lecturerUser.id,
            staffId: staffId,
            academicRank: lecturerData.rank,
            employmentType: EmploymentType.FULL_TIME,
            employmentStatus: EmploymentStatus.ACTIVE,
            hireDate: new Date("2020-01-01"),
            specialization: department.name,
            officeLocation: `Room ${Math.floor(Math.random() * 100) + 1}, ${department.name} Department`,
            permissions: {},
            canCreateExams: true,
            canGradeScripts: true,
            canViewResults: true,
            canTeachCourses: true,
          },
        });

        lecturers.push({ user: lecturerUser, profile: lecturerProfile });
        console.log(
          `✅ Created lecturer: ${lecturerUser.firstName} ${lecturerUser.lastName} (${lecturerProfile.staffId})`
        );
      }
    }

    // Step 9: Seed students
    console.log("\n👨‍🎓 Step 9: Seeding students...");
    const students = [];
    for (const studentData of STUDENT_DATA) {
      const program = programs.find((p) => p.code === studentData.program);
      if (program) {
        const department = departments.find(
          (d) => d.id === program.departmentId
        );
        if (department) {
          // Generate student ID
          const studentId: string = `TTU${new Date().getFullYear()}${String(students.length + 1).padStart(4, "0")}`;

          // Hash password
          const studentPassword = await bcrypt.hash("Student@123", 12);

          const studentUser = await prisma.user.upsert({
            where: { email: studentData.email },
            update: {},
            create: {
              email: studentData.email,
              password: studentPassword,
              firstName: studentData.firstName,
              lastName: studentData.lastName,
              role: UserRole.STUDENT,
              status: UserStatus.ACTIVE,
              emailVerified: true,
              institutionId: institution.id,
              facultyId: department.facultyId,
              departmentId: department.id,
              phone:
                "+23350" +
                String(Math.floor(Math.random() * 1000000)).padStart(6, "0"),
              address: "Takoradi Technical University, Takoradi, Ghana",
              dateOfBirth: new Date(
                2000 + Math.floor(Math.random() * 5),
                Math.floor(Math.random() * 12),
                Math.floor(Math.random() * 28) + 1
              ),
            },
          });

          // Create student profile
          const studentProfile: any = await prisma.studentProfile.upsert({
            where: { userId: studentUser.id },
            update: {},
            create: {
              userId: studentUser.id,
              studentId: studentId,
              indexNumber: `IDX${String(students.length + 1).padStart(4, "0")}`,
              level: studentData.level,
              semester:
                studentData.level === 100
                  ? 1
                  : studentData.level === 200
                    ? 3
                    : studentData.level === 300
                      ? 5
                      : 7,
              academicYear: "2024/2025",
              programId: program.id,
              admissionDate: new Date("2023-09-01"),
              expectedGraduation: new Date("2027-06-30"),
              enrollmentStatus: "ACTIVE",
              academicStatus: "GOOD_STANDING",
            },
          });

          students.push({ user: studentUser, profile: studentProfile });
          console.log(
            `✅ Created student: ${studentUser.firstName} ${studentUser.lastName} (${studentProfile.studentId}) - ${program.name}`
          );
        }
      }
    }

    console.log("\n🎉 Institution data seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Institution: 1 (${institution.name})`);
    console.log(`   - Faculties: ${faculties.length}`);
    console.log(`   - Departments: ${departments.length}`);
    console.log(`   - Programs: ${programs.length}`);
    console.log(`   - Courses: ${courses.length}`);
    console.log(`   - Lecturers: ${lecturers.length}`);
    console.log(`   - Students: ${students.length}`);

    console.log("\n🔑 Access Credentials:");
    console.log("Institution Admin:");
    console.log("  Email: ttu.admin@ttu.edu.gh");
    console.log("  Password: Admin@123");
    console.log("Lecturers:");
    console.log("  Password: Lecturer@123");
    console.log("Students:");
    console.log("  Password: Student@123");
  } catch (error) {
    console.error("❌ Error seeding institution data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedInstitutionData()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
