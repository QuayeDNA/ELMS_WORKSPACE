import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import {
  downloadTemplate,
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
  authenticate,
  downloadTemplate
);

// Upload and process bulk entries
router.post(
  '/timetables/:timetableId/bulk-upload',
  authenticate,
  upload.single('file'),
  uploadBulkEntries
);

export default router;
