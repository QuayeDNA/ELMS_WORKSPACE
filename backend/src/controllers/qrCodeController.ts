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

    // Verify student exists via roleProfile
    const studentRole = await prisma.roleProfile.findFirst({
      where: {
        role: 'STUDENT',
        metadata: {
          path: ['studentId'],
          equals: sid
        }
      },
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
        }
      },
    });

    if (!studentRole) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const metadata = studentRole.metadata as any;

    // Verify user ID matches
    if (studentRole.userId !== parseInt(uid)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code data',
      });
    }

    // Verify program ID matches
    if (metadata.programId !== parseInt(pid)) {
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
        studentId: metadata.studentId || '',
        indexNumber: metadata.indexNumber || '',
        fullName: `${studentRole.user.firstName} ${studentRole.user.middleName || ''} ${studentRole.user.lastName}`.trim(),
        email: studentRole.user.email,
        phone: studentRole.user.phone,
        level: metadata.level || 100,
        semester: metadata.semester || 1,
        enrollmentStatus: metadata.enrollmentStatus || 'UNKNOWN',
        academicStatus: metadata.academicStatus || 'UNKNOWN',
        userStatus: studentRole.user.status,
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

    const studentRole = await prisma.roleProfile.findFirst({
      where: {
        role: 'STUDENT',
        metadata: {
          path: ['studentId'],
          equals: studentId
        }
      },
      select: {
        id: true,
        metadata: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            status: true,
          },
        },
      },
    });

    if (!studentRole) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const metadata = studentRole.metadata as any;

    return res.json({
      success: true,
      data: {
        studentId: metadata.studentId || '',
        indexNumber: metadata.indexNumber || '',
        fullName: `${studentRole.user.firstName} ${studentRole.user.lastName}`,
        level: metadata.level || 100,
        semester: metadata.semester || 1,
        enrollmentStatus: metadata.enrollmentStatus || 'UNKNOWN',
        userStatus: studentRole.user.status,
      },
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
