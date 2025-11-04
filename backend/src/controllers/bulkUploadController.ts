import { Request, Response } from 'express';
import { JwtPayload } from '../types/auth';
import {
  generateBulkUploadTemplate,
  parseAndValidateBulkUpload,
  createBulkEntriesFromValidated,
  ValidatedEntry,
} from '../services/bulkUploadService';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ========================================
// DOWNLOAD TEMPLATE
// ========================================

export const downloadTemplate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { timetableId } = req.params;
    const institutionId = req.user?.institutionId;

    if (!institutionId) {
      res.status(403).json({ message: 'Institution ID not found' });
      return;
    }

    // Generate template
    const buffer = await generateBulkUploadTemplate(
      parseInt(timetableId),
      institutionId
    );

    // Set headers for file download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="exam-entries-template-${timetableId}.xlsx"`
    );
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
  } catch (error: any) {
    console.error('Error downloading template:', error);
    res.status(500).json({
      message: error.message || 'Failed to generate template',
    });
  }
};

// ========================================
// VALIDATE FILE (WITHOUT CREATING ENTRIES)
// ========================================

export const validateBulkUpload = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { timetableId } = req.params;
    const institutionId = req.user?.institutionId;

    if (!institutionId) {
      res.status(403).json({ message: 'Institution ID not found' });
      return;
    }

    // Check if file was uploaded
    const file = (req as any).file;
    if (!file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    // Parse and validate the file (doesn't create entries)
    const validationResult = await parseAndValidateBulkUpload(
      file.buffer,
      parseInt(timetableId),
      institutionId
    );

    // Return validation results to frontend
    res.status(200).json(validationResult);
  } catch (error: any) {
    console.error('Error validating bulk upload:', error);
    res.status(500).json({
      message: error.message || 'Failed to validate file',
    });
  }
};

// ========================================
// CREATE ENTRIES FROM VALIDATED DATA
// ========================================

export const uploadBulkEntries = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { timetableId } = req.params;
    const institutionId = req.user?.institutionId;
    const userId = req.user?.userId;

    if (!institutionId) {
      res.status(403).json({ message: 'Institution ID not found' });
      return;
    }

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Expect validated entries in request body
    const { entries } = req.body as { entries: ValidatedEntry[] };

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      res.status(400).json({ message: 'No entries provided' });
      return;
    }

    // Create entries from pre-validated data
    const result = await createBulkEntriesFromValidated(
      entries,
      parseInt(timetableId),
      userId
    );

    // Return result
    res.status(200).json({
      message: `Processed ${result.totalRows} rows: ${result.successCount} succeeded, ${result.failureCount} failed`,
      result,
    });
  } catch (error: any) {
    console.error('Error uploading bulk entries:', error);
    res.status(500).json({
      message: error.message || 'Failed to process bulk upload',
    });
  }
};
