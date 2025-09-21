import { PrismaClient, ProgramType } from "@prisma/client";

const prisma = new PrismaClient();

async function seedProgramPrefixes() {
  console.log("Seeding program prefixes...");

  const prefixes = [
    {
      programType: ProgramType.CERTIFICATE,
      prefix: "CERT",
      description: "Certificate programs",
    },
    {
      programType: ProgramType.DIPLOMA,
      prefix: "DIP",
      description: "Diploma programs",
    },
    {
      programType: ProgramType.HND,
      prefix: "HND",
      description: "Higher National Diploma programs",
    },
    {
      programType: ProgramType.BACHELOR,
      prefix: "BSc",
      description:
        "Bachelor degree programs (can be modified to BA, BEng, etc.)",
    },
    {
      programType: ProgramType.MASTERS,
      prefix: "MSc",
      description: "Master degree programs (can be modified to MA, MEng, etc.)",
    },
    {
      programType: ProgramType.PHD,
      prefix: "PhD",
      description: "Doctor of Philosophy programs",
    },
  ];

  for (const prefix of prefixes) {
    await prisma.programPrefix.upsert({
      where: { programType: prefix.programType },
      update: {
        prefix: prefix.prefix,
        description: prefix.description,
        isActive: true,
      },
      create: {
        programType: prefix.programType,
        prefix: prefix.prefix,
        description: prefix.description,
        isActive: true,
      },
    });
  }

  console.log("Program prefixes seeded successfully!");
}

seedProgramPrefixes()
  .catch((e) => {
    console.error("Error seeding program prefixes:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
