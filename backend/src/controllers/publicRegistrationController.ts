import { Request, Response } from 'express';
import { prisma } from '../server';
import { studentIdConfigService } from '../services/studentIdConfigService';
import bcrypt from 'bcryptjs';

/**
 * Public Student Registration Controller
 * Allows students to self-register without authentication
 */

/**
 * Register a new student (PUBLIC endpoint)
 * POST /api/public/students/register
 */
export const registerStudent = async (req: Request, res: Response) => {
  try {
    const {
      institutionId,
      firstName,
      lastName,
      middleName,
      email,
      phone,
      dateOfBirth,
      gender,
      programId,
      academicYearId,
      entryLevel,
    } = req.body;

    // Validate required fields
    if (!institutionId || !firstName || !lastName || !email || !programId || !academicYearId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Check if institution exists
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found',
      });
    }

    // Check if program exists
    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: { department: true },
    });

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found',
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Generate student ID
    const studentId = await studentIdConfigService.generateStudentId({
      institutionId,
      academicYearId,
      programCode: program.code,
    });

    // Generate student email using institution domain
    const institutionDomain = institution.website?.replace(/^https?:\/\//, '') || 'institution.edu';
    const studentEmail = `${studentId}@${institutionDomain}`;

    // Generate random password (8 characters, alphanumeric)
    const generatedPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Create user and student profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user account
      const user = await tx.user.create({
        data: {
          email: studentEmail,
          password: hashedPassword,
          firstName,
          lastName,
          middleName,
          role: 'STUDENT',
          status: 'ACTIVE',
          phone,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender,
          institutionId,
          facultyId: program.department.facultyId,
          departmentId: program.departmentId,
        },
      });

      // Create student profile
      const studentProfile = await tx.studentProfile.create({
        data: {
          userId: user.id,
          studentId,
          indexNumber: studentId, // Same as student ID
          programId,
          level: entryLevel || 100,
          semester: 1,
          admissionDate: new Date(),
          enrollmentStatus: 'ACTIVE',
          academicStatus: 'GOOD_STANDING',
        },
      });

      // Create academic history
      await tx.studentAcademicHistory.create({
        data: {
          studentId: user.id,
          admissionYear: new Date().getFullYear().toString(),
          admissionSemester: 1,
          currentLevel: entryLevel || 100,
          currentSemester: 1,
          totalSemestersCompleted: 0,
          overallCreditsEarned: 0,
          overallCreditsAttempted: 0,
          currentStatus: 'GOOD_STANDING',
        },
      });

      return { user, studentProfile };
    });

    // Return success with credentials
    return res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: {
        studentId,
        email: studentEmail,
        password: generatedPassword, // Return plain password for first-time login
        user: {
          id: result.user.id,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          email: result.user.email,
        },
        studentProfile: {
          studentId: result.studentProfile.studentId,
          indexNumber: result.studentProfile.indexNumber,
          programId: result.studentProfile.programId,
        },
        loginInstructions: {
          message: 'Please save your credentials. You can use them to login to the student dashboard.',
          loginUrl: '/auth/login',
        },
      },
    });
  } catch (error: any) {
    console.error('Error registering student:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register student',
      error: error.message,
    });
  }
};

/**
 * Generate random password
 */
function generatePassword(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Get available programs for registration
 * GET /api/public/institutions/:institutionId/programs
 */
export const getAvailablePrograms = async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.params;

    const programs = await prisma.program.findMany({
      where: {
        department: {
          faculty: {
            institutionId: parseInt(institutionId),
          },
        },
      },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return res.json({
      success: true,
      data: programs,
    });
  } catch (error: any) {
    console.error('Error fetching programs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch programs',
      error: error.message,
    });
  }
};

/**
 * Get available academic years
 * GET /api/public/institutions/:institutionId/academic-years
 */
export const getAvailableAcademicYears = async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.params;

    const academicYears = await prisma.academicYear.findMany({
      where: {
        institutionId: parseInt(institutionId),
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return res.json({
      success: true,
      data: academicYears,
    });
  } catch (error: any) {
    console.error('Error fetching academic years:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch academic years',
      error: error.message,
    });
  }
};
