import { Request, Response } from 'express';
import { prisma } from '../server';

/**
 * QR Code Verification Controller
 * Handles verification of student QR codes
 */

/**
 * Verify student QR code data
 * POST /api/qr/verify
 */
export const verifyQRCode = async (req: Request, res: Response) => {
  try {
    const { sid, uid, pid } = req.body;

    // Validate required fields
    if (!sid || !uid || !pid) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: sid, uid, pid',
      });
    }

    // Verify student exists and data matches
    const student = await prisma.studentProfile.findUnique({
      where: { studentId: sid },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            middleName: true,
            phone: true,
            status: true,
          },
        },
        program: {
          select: {
            id: true,
            name: true,
            code: true,
            department: {
              select: {
                name: true,
                faculty: {
                  select: {
                    name: true,
                    institution: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Verify user ID matches
    if (student.userId !== parseInt(uid)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code data',
      });
    }

    // Verify program ID matches
    if (student.programId !== parseInt(pid)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code data',
      });
    }

    // Return verified student data
    return res.json({
      success: true,
      message: 'QR code verified successfully',
      data: {
        studentId: student.studentId,
        indexNumber: student.indexNumber,
        fullName: `${student.user.firstName} ${student.user.middleName || ''} ${student.user.lastName}`.trim(),
        email: student.user.email,
        phone: student.user.phone,
        program: student.program?.name,
        programCode: student.program?.code,
        department: student.program?.department?.name,
        faculty: student.program?.department?.faculty?.name,
        institution: student.program?.department?.faculty?.institution?.name,
        level: student.level,
        semester: student.semester,
        enrollmentStatus: student.enrollmentStatus,
        academicStatus: student.academicStatus,
        userStatus: student.user.status,
      },
    });
  } catch (error: unknown) {
    console.error('Error verifying QR code:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify QR code',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Quick student lookup by QR data
 * GET /api/qr/student/:studentId
 */
export const quickStudentLookup = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    const student = await prisma.studentProfile.findUnique({
      where: { studentId },
      select: {
        studentId: true,
        indexNumber: true,
        level: true,
        semester: true,
        enrollmentStatus: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            status: true,
          },
        },
        program: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    return res.json({
      success: true,
      data: student,
    });
  } catch (error: unknown) {
    console.error('Error looking up student:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to lookup student',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
