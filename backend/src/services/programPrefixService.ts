import { PrismaClient, ProgramType } from "@prisma/client";

const prisma = new PrismaClient();

export interface UpdatePrefixData {
  prefix?: string;
  description?: string;
  isActive?: boolean;
}

export interface BulkUpdatePrefixData {
  programType: ProgramType;
  prefix?: string;
  description?: string;
  isActive?: boolean;
}

export const programPrefixService = {
  // Get all program prefixes
  async getProgramPrefixes() {
    return await prisma.programPrefix.findMany({
      orderBy: { programType: "asc" },
    });
  },

  // Get prefix by program type
  async getProgramPrefix(programType: ProgramType) {
    return await prisma.programPrefix.findUnique({
      where: { programType },
    });
  },

  // Update program prefix
  async updateProgramPrefix(programType: ProgramType, data: UpdatePrefixData) {
    // If prefix is being updated, we need to update all existing student index numbers
    const existingPrefix = await prisma.programPrefix.findUnique({
      where: { programType },
    });

    if (!existingPrefix) {
      throw new Error("Program prefix not found");
    }

    const oldPrefix = existingPrefix.prefix;
    const newPrefix = data.prefix || oldPrefix;

    return await prisma.$transaction(async (tx) => {
      // Update the prefix record
      const updatedPrefix = await tx.programPrefix.update({
        where: { programType },
        data,
      });

      // If prefix changed, update all existing student index numbers
      if (data.prefix && data.prefix !== oldPrefix) {
        // Find all students with this program type
        const studentsToUpdate = await tx.studentProfile.findMany({
          where: {
            program: { type: programType },
            indexNumber: { not: null },
          },
          select: { id: true, indexNumber: true },
        });

        // Update each student's index number
        for (const student of studentsToUpdate) {
          if (student.indexNumber) {
            const newIndexNumber = student.indexNumber.replace(
              new RegExp(`^${oldPrefix}`),
              newPrefix
            );
            await tx.studentProfile.update({
              where: { id: student.id },
              data: { indexNumber: newIndexNumber },
            });
          }
        }
      }

      return updatedPrefix;
    });
  },

  // Bulk update prefixes
  async bulkUpdatePrefixes(prefixes: BulkUpdatePrefixData[]) {
    const results = [];

    for (const prefixData of prefixes) {
      const result = await this.updateProgramPrefix(prefixData.programType, {
        prefix: prefixData.prefix,
        description: prefixData.description,
        isActive: prefixData.isActive,
      });
      results.push(result);
    }

    return results;
  },
};
