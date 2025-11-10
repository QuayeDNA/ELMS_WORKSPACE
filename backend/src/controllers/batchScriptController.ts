import { Request, Response } from 'express';
import { BatchScriptService } from '../services/batchScriptService';
import { BatchScriptStatus } from '@prisma/client';

export class BatchScriptController {
  /**
   * Get batch script by ID
   * GET /api/batch-scripts/:batchId
   */
  static async getBatchScriptById(req: Request, res: Response) {
    try {
      const batchId = parseInt(req.params.batchId);

      if (isNaN(batchId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid batch ID'
        });
      }

      const batchScript = await BatchScriptService.getBatchScriptById(batchId);

      if (!batchScript) {
        return res.status(404).json({
          success: false,
          message: 'Batch script not found'
        });
      }

      res.status(200).json({
        success: true,
        data: batchScript
      });
    } catch (error) {
      console.error('Error in getBatchScriptById:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get batch script'
      });
    }
  }

  /**
   * Get batch script for an exam entry and course
   * GET /api/batch-scripts/entry/:examEntryId/course/:courseId
   */
  static async getBatchScriptForExamEntry(req: Request, res: Response) {
    try {
      const examEntryId = parseInt(req.params.examEntryId);
      const courseId = parseInt(req.params.courseId);

      if (isNaN(examEntryId) || isNaN(courseId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid exam entry ID or course ID'
        });
      }

      const batchScript = await BatchScriptService.getBatchScriptForExamEntry(
        examEntryId,
        courseId
      );

      if (!batchScript) {
        return res.status(404).json({
          success: false,
          message: 'Batch script not found'
        });
      }

      res.status(200).json({
        success: true,
        data: batchScript
      });
    } catch (error) {
      console.error('Error in getBatchScriptForExamEntry:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get batch script'
      });
    }
  }

  /**
   * Get all batch scripts with filters
   * GET /api/batch-scripts
   */
  static async getBatchScripts(req: Request, res: Response) {
    try {
      const { courseId, examEntryId, status, assignedLecturerId } = req.query;

      const query: any = {};
      if (courseId) query.courseId = parseInt(courseId as string);
      if (examEntryId) query.examEntryId = parseInt(examEntryId as string);
      if (status) query.status = status as BatchScriptStatus;
      if (assignedLecturerId) query.assignedLecturerId = parseInt(assignedLecturerId as string);

      const batchScripts = await BatchScriptService.getBatchScripts(query);

      res.status(200).json({
        success: true,
        count: batchScripts.length,
        data: batchScripts
      });
    } catch (error) {
      console.error('Error in getBatchScripts:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get batch scripts'
      });
    }
  }

  /**
   * Seal a batch script
   * POST /api/batch-scripts/:batchId/seal
   */
  static async sealBatchScript(req: Request, res: Response) {
    try {
      const batchId = parseInt(req.params.batchId);
      const { notes } = req.body;
      const sealedBy = req.user?.id;

      if (isNaN(batchId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid batch ID'
        });
      }

      if (!sealedBy) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const batchScript = await BatchScriptService.sealBatchScript(
        batchId,
        sealedBy,
        notes
      );

      res.status(200).json({
        success: true,
        message: 'Batch script sealed successfully',
        data: batchScript
      });
    } catch (error) {
      console.error('Error in sealBatchScript:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to seal batch script'
      });
    }
  }

  /**
   * Assign batch to lecturer
   * POST /api/batch-scripts/:batchId/assign
   */
  static async assignBatchToLecturer(req: Request, res: Response) {
    try {
      const batchId = parseInt(req.params.batchId);
      const { lecturerId } = req.body;
      const assignedBy = req.user?.id;

      if (isNaN(batchId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid batch ID'
        });
      }

      if (!lecturerId) {
        return res.status(400).json({
          success: false,
          message: 'Lecturer ID is required'
        });
      }

      if (!assignedBy) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const batchScript = await BatchScriptService.assignBatchToLecturer(
        batchId,
        parseInt(lecturerId),
        assignedBy
      );

      res.status(200).json({
        success: true,
        message: 'Batch assigned to lecturer successfully',
        data: batchScript
      });
    } catch (error) {
      console.error('Error in assignBatchToLecturer:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to assign batch'
      });
    }
  }

  /**
   * Update batch status
   * PATCH /api/batch-scripts/:batchId/status
   */
  static async updateBatchStatus(req: Request, res: Response) {
    try {
      const batchId = parseInt(req.params.batchId);
      const { status, notes } = req.body;

      if (isNaN(batchId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid batch ID'
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const batchScript = await BatchScriptService.updateBatchStatus(
        batchId,
        status as BatchScriptStatus,
        notes
      );

      res.status(200).json({
        success: true,
        message: 'Batch status updated successfully',
        data: batchScript
      });
    } catch (error) {
      console.error('Error in updateBatchStatus:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update batch status'
      });
    }
  }

  /**
   * Get batch statistics
   * GET /api/batch-scripts/:batchId/statistics
   */
  static async getBatchStatistics(req: Request, res: Response) {
    try {
      const batchId = parseInt(req.params.batchId);

      if (isNaN(batchId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid batch ID'
        });
      }

      const statistics = await BatchScriptService.getBatchStatistics(batchId);

      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error in getBatchStatistics:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get batch statistics'
      });
    }
  }

  /**
   * Get batches pending assignment
   * GET /api/batch-scripts/pending-assignment
   */
  static async getPendingAssignment(req: Request, res: Response) {
    try {
      const batches = await BatchScriptService.getPendingAssignment();

      res.status(200).json({
        success: true,
        count: batches.length,
        data: batches
      });
    } catch (error) {
      console.error('Error in getPendingAssignment:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get pending batches'
      });
    }
  }

  /**
   * Get batches for a lecturer
   * GET /api/batch-scripts/lecturer/:lecturerId
   */
  static async getBatchesForLecturer(req: Request, res: Response) {
    try {
      const lecturerId = parseInt(req.params.lecturerId);
      const { status } = req.query;

      if (isNaN(lecturerId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid lecturer ID'
        });
      }

      const batches = await BatchScriptService.getBatchesForLecturer(
        lecturerId,
        status as BatchScriptStatus | undefined
      );

      res.status(200).json({
        success: true,
        count: batches.length,
        data: batches
      });
    } catch (error) {
      console.error('Error in getBatchesForLecturer:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get lecturer batches'
      });
    }
  }

  /**
   * Update submission count for a batch
   * POST /api/batch-scripts/:batchId/update-counts
   */
  static async updateSubmissionCount(req: Request, res: Response) {
    try {
      const batchId = parseInt(req.params.batchId);

      if (isNaN(batchId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid batch ID'
        });
      }

      const batchScript = await BatchScriptService.updateSubmissionCount(batchId);

      res.status(200).json({
        success: true,
        message: 'Batch counts updated successfully',
        data: batchScript
      });
    } catch (error) {
      console.error('Error in updateSubmissionCount:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update batch counts'
      });
    }
  }
}
