import { programPrefixService } from "../dist/services/programPrefixService.js";
import { PrismaClient } from "@prisma/client";

async function testPrefixUpdate() {
  console.log("Testing prefix update and propagation...");

  const prisma = new PrismaClient();

  try {
    // Check current students
    const studentsBefore = await prisma.studentProfile.findMany({
      where: { program: { type: "BACHELOR" } },
      select: { id: true, indexNumber: true, studentId: true },
    });

    console.log("Students before prefix update:");
    studentsBefore.forEach((student) => {
      console.log(`  ${student.studentId}: ${student.indexNumber}`);
    });

    // Update the BACHELOR prefix from "BSc" to "BSc(CS)"
    console.log('Updating BACHELOR prefix from "BSc" to "BSc(CS)"...');
    const updatedPrefix = await programPrefixService.updateProgramPrefix(
      "BACHELOR",
      {
        prefix: "BSc(CS)",
        description: "Bachelor of Science in Computer Science",
      }
    );

    console.log("Prefix updated successfully");

    // Check students after update
    const studentsAfter = await prisma.studentProfile.findMany({
      where: { program: { type: "BACHELOR" } },
      select: { id: true, indexNumber: true, studentId: true },
    });

    console.log("Students after prefix update:");
    studentsAfter.forEach((student) => {
      console.log(`  ${student.studentId}: ${student.indexNumber}`);
    });
  } catch (error) {
    console.error("Error testing prefix update:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrefixUpdate();
