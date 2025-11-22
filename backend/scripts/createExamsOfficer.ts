import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createExamsOfficer() {
  try {
    // Option 1: Create a new EXAMS_OFFICER user
    const hashedPassword = await bcrypt.hash("password123", 10);

    const newOfficer = await prisma.user.create({
      data: {
        email: "exams.officer@tughana.edu.gh",
        password: hashedPassword,
        firstName: "Exams",
        lastName: "Officer",
        role: "EXAMS_OFFICER",
        status: "ACTIVE",
        emailVerified: true,
        institutionId: 1, // Assuming institution ID 1
      },
    });

    console.log("\n✅ Created new EXAMS_OFFICER user:");
    console.log({
      id: newOfficer.id,
      email: newOfficer.email,
      name: `${newOfficer.firstName} ${newOfficer.lastName}`,
      role: newOfficer.role,
    });

    // Option 2: Update an existing LECTURER to EXAMS_OFFICER
    // Uncomment the following if you want to convert a lecturer to exams officer
    /*
    const updatedUser = await prisma.user.update({
      where: { id: 3 }, // Change ID to the user you want to update
      data: {
        role: "EXAMS_OFFICER",
      },
    });

    console.log("\n✅ Updated user to EXAMS_OFFICER:");
    console.log({
      id: updatedUser.id,
      email: updatedUser.email,
      name: `${updatedUser.firstName} ${updatedUser.lastName}`,
      role: updatedUser.role,
    });
    */

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createExamsOfficer();
