import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import {
  downloadTemplate,
  validateBulkUpload,
  uploadBulkEntries,
} from '../controllers/bulkUploadController';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];

    if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel and CSV files are allowed'));
    }
  },
});

// ========================================
// ROUTES
// ========================================

// Download template for a specific timetable
router.get(
  '/timetables/:timetableId/bulk-upload/template',
  authenticateToken,
  downloadTemplate
);

// Validate bulk upload file (doesn't create entries)
router.post(
  '/timetables/:timetableId/bulk-upload/validate',
  authenticateToken,
  upload.single('file'),
  validateBulkUpload
);

// Upload and process bulk entries (from pre-validated data)
router.post(
  '/timetables/:timetableId/bulk-upload',
  authenticateToken,
  uploadBulkEntries
);

export default router;
