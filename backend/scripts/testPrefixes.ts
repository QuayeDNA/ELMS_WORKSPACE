import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testProgramPrefixes() {
  console.log("Testing program prefixes...");

  // Check if prefixes exist
  const prefixes = await prisma.programPrefix.findMany();
  console.log("Current prefixes:", prefixes);

  // Check if programs exist
  const programs = await prisma.program.findMany();
  console.log("Programs count:", programs.length);

  if (programs.length > 0) {
    console.log("First program:", programs[0]);
  }

  await prisma.$disconnect();
}

testProgramPrefixes().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
