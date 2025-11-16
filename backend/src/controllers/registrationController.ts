import { Request, Response } from 'express';
import { registrationService } from '../services/registrationService';
import { RegistrationStatus } from '@prisma/client';

/**
 * Course Registration Controller
 * Handles student course registration workflow
 */
export class RegistrationController {
  /**
   * Create a new course registration
   * POST /api/registrations
   * Access: Student, Advisor
   */
  async createRegistration(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, semesterId, advisorId, notes } = req.body;

      // Validate required fields
      if (!studentId || !semesterId) {
        res.status(400).json({
          success: false,
          message: 'Student ID and Semester ID are required'
        });
        return;
      }

      const registration = await registrationService.createRegistration({
        studentId,
        semesterId,
        advisorId,
        notes
      });

      res.status(201).json({
        success: true,
        message: 'Registration created successfully',
        data: registration
      });
    } catch (error) {
      console.error('Error creating registration:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create registration'
      });
    }
  }

  /**
   * Get a specific registration by ID
   * GET /api/registrations/:id
   * Access: Student (own), Advisor, Admin
   */
  async getRegistrationById(req: Request, res: Response): Promise<void> {
    try {
      const registrationId = parseInt(req.params.id);

      if (isNaN(registrationId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid registration ID'
        });
        return;
      }

      const registration = await registrationService.getRegistrationById(registrationId);

      if (!registration) {
        res.status(404).json({
          success: false,
          message: 'Registration not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: registration
      });
    } catch (error) {
      console.error('Error fetching registration:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch registration'
      });
    }
  }

  /**
   * Get all registrations for a student
   * GET /api/registrations/student/:studentId
   * Access: Student (own), Advisor, Admin
   */
  async getStudentRegistrations(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);
      const semesterId = req.query.semesterId ? parseInt(req.query.semesterId as string) : undefined;

      if (isNaN(studentId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
        return;
      }

      const registrations = await registrationService.getStudentRegistrations(
        studentId,
        semesterId
      );

      res.status(200).json({
        success: true,
        data: registrations,
        count: registrations.length
      });
    } catch (error) {
      console.error('Error fetching student registrations:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch registrations'
      });
    }
  }

  /**
   * Add a course to a registration
   * POST /api/registrations/:id/courses
   * Access: Student (own), Advisor
   */
  async addCourseToRegistration(req: Request, res: Response): Promise<void> {
    try {
      const registrationId = parseInt(req.params.id);
      const { courseOfferingId, registrationType, notes } = req.body;

      if (isNaN(registrationId) || !courseOfferingId) {
        res.status(400).json({
          success: false,
          message: 'Registration ID and Course Offering ID are required'
        });
        return;
      }

      const updatedRegistration = await registrationService.addCourseToRegistration(
        registrationId,
        {
          courseOfferingId,
          registrationType: registrationType || 'REGULAR'
        }
      );

      res.status(200).json({
        success: true,
        message: 'Course added to registration successfully',
        data: updatedRegistration
      });
    } catch (error) {
      console.error('Error adding course to registration:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add course to registration'
      });
    }
  }

  /**
   * Remove a course from a registration
   * DELETE /api/registrations/courses/:courseId
   * Access: Student (own), Advisor
   */
  async removeCourseFromRegistration(req: Request, res: Response): Promise<void> {
    try {
      const registeredCourseId = parseInt(req.params.courseId);
      const { dropReason } = req.body;

      if (isNaN(registeredCourseId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid registered course ID'
        });
        return;
      }

      await registrationService.removeCourseFromRegistration(
        registeredCourseId,
        dropReason
      );

      res.status(200).json({
        success: true,
        message: 'Course removed from registration successfully'
      });
    } catch (error) {
      console.error('Error removing course from registration:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove course from registration'
      });
    }
  }

  /**
   * Submit a registration for approval
   * POST /api/registrations/:id/submit
   * Access: Student (own)
   */
  async submitRegistration(req: Request, res: Response): Promise<void> {
    try {
      const registrationId = parseInt(req.params.id);

      if (isNaN(registrationId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid registration ID'
        });
        return;
      }

      const updatedRegistration = await registrationService.submitRegistration(registrationId);

      res.status(200).json({
        success: true,
        message: 'Registration submitted successfully',
        data: updatedRegistration
      });
    } catch (error) {
      console.error('Error submitting registration:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit registration'
      });
    }
  }

  /**
   * Approve a registration
   * POST /api/registrations/:id/approve
   * Access: Advisor, Admin
   */
  async approveRegistration(req: Request, res: Response): Promise<void> {
    try {
      const registrationId = parseInt(req.params.id);
      const approverId = req.user?.userId; // From auth middleware

      if (isNaN(registrationId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid registration ID'
        });
        return;
      }

      if (!approverId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const updatedRegistration = await registrationService.approveRegistration(
        registrationId,
        approverId
      );

      res.status(200).json({
        success: true,
        message: 'Registration approved successfully',
        data: updatedRegistration
      });
    } catch (error) {
      console.error('Error approving registration:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to approve registration'
      });
    }
  }

  /**
   * Reject a registration
   * POST /api/registrations/:id/reject
   * Access: Advisor, Admin
   */
  async rejectRegistration(req: Request, res: Response): Promise<void> {
    try {
      const registrationId = parseInt(req.params.id);
      const { rejectionReason } = req.body;

      if (isNaN(registrationId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid registration ID'
        });
        return;
      }

      if (!rejectionReason) {
        res.status(400).json({
          success: false,
          message: 'Rejection reason is required'
        });
        return;
      }

      const updatedRegistration = await registrationService.rejectRegistration(
        registrationId,
        rejectionReason
      );

      res.status(200).json({
        success: true,
        message: 'Registration rejected successfully',
        data: updatedRegistration
      });
    } catch (error) {
      console.error('Error rejecting registration:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reject registration'
      });
    }
  }

  /**
   * Validate a registration
   * GET /api/registrations/:id/validate
   * Access: Student (own), Advisor, Admin
   */
  async validateRegistration(req: Request, res: Response): Promise<void> {
    try {
      const registrationId = parseInt(req.params.id);

      if (isNaN(registrationId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid registration ID'
        });
        return;
      }

      const validation = await registrationService.validateRegistration(registrationId);

      res.status(200).json({
        success: true,
        data: validation
      });
    } catch (error) {
      console.error('Error validating registration:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to validate registration'
      });
    }
  }

  /**
   * Check course eligibility for a student
   * GET /api/registrations/eligibility/:studentId/:courseOfferingId
   * Access: Student (own), Advisor, Admin
   */
  async checkCourseEligibility(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);
      const courseOfferingId = parseInt(req.params.courseOfferingId);

      if (isNaN(studentId) || isNaN(courseOfferingId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid student ID or course offering ID'
        });
        return;
      }

      const eligibility = await registrationService.checkCourseEligibility(
        studentId,
        courseOfferingId
      );

      res.status(200).json({
        success: true,
        data: eligibility
      });
    } catch (error) {
      console.error('Error checking course eligibility:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to check course eligibility'
      });
    }
  }

  /**
   * Get eligible courses for a student in a semester
   * GET /api/registrations/eligible-courses/:studentId/:semesterId
   * Access: Student (own), Advisor, Admin
   */
  async getEligibleCourses(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);
      const semesterId = parseInt(req.params.semesterId);

      if (isNaN(studentId) || isNaN(semesterId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid student ID or semester ID'
        });
        return;
      }

      const eligibleCourses = await registrationService.getEligibleCourses(
        studentId,
        semesterId
      );

      res.status(200).json({
        success: true,
        data: eligibleCourses,
        count: eligibleCourses.length
      });
    } catch (error) {
      console.error('Error fetching eligible courses:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch eligible courses'
      });
    }
  }

  /**
   * Get registration summary for a student
   * GET /api/registrations/summary/:studentId/:semesterId
   * Access: Student (own), Advisor, Admin
   */
  async getRegistrationSummary(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);
      const semesterId = parseInt(req.params.semesterId);

      if (isNaN(studentId) || isNaN(semesterId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid student ID or semester ID'
        });
        return;
      }

      const summary = await registrationService.getRegistrationSummary(
        studentId,
        semesterId
      );

      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error fetching registration summary:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch registration summary'
      });
    }
  }

  /**
   * Bulk create registrations for multiple students
   * POST /api/registrations/bulk
   * Access: Admin only
   */
  async bulkCreateRegistrations(req: Request, res: Response): Promise<void> {
    try {
      const { studentIds, semesterId, courseOfferingIds } = req.body;
      const createdBy = req.user?.userId;

      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Student IDs array is required'
        });
        return;
      }

      if (!semesterId) {
        res.status(400).json({
          success: false,
          message: 'Semester ID is required'
        });
        return;
      }

      if (!courseOfferingIds || !Array.isArray(courseOfferingIds) || courseOfferingIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Course offering IDs array is required'
        });
        return;
      }

      if (!createdBy) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const result = await registrationService.bulkCreateRegistrations(
        studentIds,
        semesterId,
        courseOfferingIds,
        createdBy
      );

      res.status(200).json({
        success: true,
        message: `Bulk registration completed: ${result.succeeded.length} succeeded, ${result.failed.length} failed`,
        data: result
      });
    } catch (error) {
      console.error('Error in bulk registration:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create bulk registrations'
      });
    }
  }

  /**
   * Get students by registration status
   * GET /api/registrations/students-by-status/:semesterId
   * Access: Admin only
   */
  async getStudentsByRegistrationStatus(req: Request, res: Response): Promise<void> {
    try {
      const semesterId = parseInt(req.params.semesterId);
      const programId = req.query.programId ? parseInt(req.query.programId as string) : undefined;
      const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined;
      const institutionId = (req as any).user?.institutionId;

      if (isNaN(semesterId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid semester ID'
        });
        return;
      }

      if (!institutionId) {
        res.status(400).json({
          success: false,
          message: 'Institution ID not found in user context'
        });
        return;
      }

      const result = await registrationService.getStudentsByRegistrationStatus(
        semesterId,
        institutionId,
        programId,
        departmentId
      );

      res.status(200).json({
        success: true,
        data: result,
        summary: {
          totalStudents: result.registered.length + result.notRegistered.length,
          registered: result.registered.length,
          notRegistered: result.notRegistered.length
        }
      });
    } catch (error) {
      console.error('Error fetching students by registration status:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch students by registration status'
      });
    }
  }
}

// Export a singleton instance
export const registrationController = new RegistrationController();
