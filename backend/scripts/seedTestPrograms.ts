import { PrismaClient, ProgramType, ProgramLevel } from "@prisma/client";

const prisma = new PrismaClient();

async function seedTestPrograms() {
  console.log("Seeding test programs...");

  // First, ensure we have institutions, faculties, and departments
  const institution = await prisma.institution.upsert({
    where: { code: "TU" },
    update: {},
    create: {
      name: "Test University",
      code: "TU",
      type: "UNIVERSITY",
      address: "Test Address",
    },
  });

  const faculty = await prisma.faculty.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Faculty of Science",
      code: "SCI",
      institutionId: institution.id,
      deanId: null,
    },
  });

  const department = await prisma.department.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Computer Science",
      code: "CS",
      facultyId: faculty.id,
      hodId: null,
    },
  });

  // Create test programs
  const programs = [
    {
      name: "Bachelor of Science in Computer Science",
      code: "BSc-CS",
      type: ProgramType.BACHELOR,
      level: ProgramLevel.UNDERGRADUATE,
      durationYears: 4,
      description: "Computer Science undergraduate program",
      departmentId: department.id,
    },
    {
      name: "Master of Science in Computer Science",
      code: "MSc-CS",
      type: ProgramType.MASTERS,
      level: ProgramLevel.POSTGRADUATE,
      durationYears: 2,
      description: "Computer Science postgraduate program",
      departmentId: department.id,
    },
    {
      name: "Higher National Diploma in IT",
      code: "HND-IT",
      type: ProgramType.HND,
      level: ProgramLevel.UNDERGRADUATE,
      durationYears: 3,
      description: "IT diploma program",
      departmentId: department.id,
    },
  ];

  for (const program of programs) {
    const existing = await prisma.program.findFirst({
      where: {
        code: program.code,
        departmentId: program.departmentId,
      },
    });

    if (!existing) {
      await prisma.program.create({
        data: program,
      });
    } else {
      console.log(`Program ${program.code} already exists, skipping...`);
    }
  }

  console.log("Test programs seeded successfully!");
}

seedTestPrograms()
  .catch((e) => {
    console.error("Error seeding test programs:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
