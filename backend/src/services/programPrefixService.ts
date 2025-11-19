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
        // Find all students with this program type via roleProfiles
        // Note: This would require querying programs first to get programIds
        // For now, skip automatic index number updates
        // TODO: Implement roleProfile-based index number updates
        /*
        const studentsToUpdate = await tx.roleProfile.findMany({
          where: {
            role: 'STUDENT',
            metadata: { path: ['programId'], in: programIds }
          }
        });
        */

        // Skip update loop - roleProfile metadata update needs custom implementation
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
