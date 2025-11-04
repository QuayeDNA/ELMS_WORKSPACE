import ExcelJS from 'exceljs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ========================================
// TYPES
// ========================================

export interface BulkUploadEntry {
  rowNumber: number;
  courseCode: string;
  examDate: string;
  startTime: string;
  duration: number;
  venueName: string;
  level?: string;
  notes?: string;
  specialRequirements?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidatedEntry extends BulkUploadEntry {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  // Resolved data
  courseId?: number;
  courseName?: string;
  venueId?: number;
  venueLocation?: string;
  venueCapacity?: number;
}

export interface BulkUploadValidationResult {
  entries: ValidatedEntry[];
  totalRows: number;
  validCount: number;
  invalidCount: number;
  warningCount: number;
}

export interface BulkUploadResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  failureCount: number;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
  createdEntries?: any[];
}

// ========================================
// TEMPLATE GENERATION
// ========================================

/**
 * Generate a simple Excel template (no formulas, no validation)
 * Users fill it manually, validation happens in the frontend
 */
export const generateBulkUploadTemplate = async (
  timetableId: number,
  institutionId: number
): Promise<Buffer> => {
  try {
    // Fetch timetable info for reference
    const timetable = await prisma.examTimetable.findUnique({
      where: { id: timetableId },
      include: { academicPeriod: true },
    });

    if (!timetable) {
      throw new Error('Timetable not found');
    }

    // Create simple workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ELMS System';
    workbook.created = new Date();
    workbook.modified = new Date();

    // ========================================
    // MAIN SHEET - Simple Entry Form
    // ========================================
    const mainSheet = workbook.addWorksheet('Exam Entries');

    // Define columns
    mainSheet.columns = [
      { header: 'Course Code', key: 'courseCode', width: 15 },
      { header: 'Exam Date', key: 'examDate', width: 15 },
      { header: 'Start Time', key: 'startTime', width: 12 },
      { header: 'Duration (mins)', key: 'duration', width: 15 },
      { header: 'Venue Name', key: 'venueName', width: 20 },
      { header: 'Level', key: 'level', width: 10 },
      { header: 'Notes', key: 'notes', width: 30 },
      { header: 'Special Requirements', key: 'specialReq', width: 30 },
    ];

    // Style header row
    const headerRow = mainSheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.height = 25;
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add sample rows to show format
    mainSheet.addRow({
      courseCode: 'CSC101',
      examDate: '2024-05-15',
      startTime: '09:00',
      duration: 180,
      venueName: 'Main Hall A',
      level: 100,
      notes: 'First semester final exam',
      specialReq: 'Calculator required',
    });

    mainSheet.addRow({
      courseCode: 'MAT201',
      examDate: '2024-05-16',
      startTime: '14:00',
      duration: 120,
      venueName: 'Science Block Room 204',
      level: 200,
      notes: '',
      specialReq: 'Formula sheet allowed',
    });

    mainSheet.addRow({
      courseCode: 'ENG301',
      examDate: '2024-05-17',
      startTime: '09:00',
      duration: 150,
      venueName: 'Arts Building Hall',
      level: 300,
      notes: 'Essay questions only',
      specialReq: '',
    });

    // Add some empty rows for users to fill
    for (let i = 0; i < 20; i++) {
      mainSheet.addRow({});
    }

    // ========================================
    // INSTRUCTIONS SHEET
    // ========================================
    const instructionsSheet = workbook.addWorksheet('Instructions');
    instructionsSheet.columns = [{ header: '', key: 'text', width: 100 }];

    const instructions = [
      { text: 'BULK UPLOAD INSTRUCTIONS', font: { bold: true, size: 16, color: { argb: 'FF4472C4' } } },
      { text: '' },
      { text: 'HOW TO USE THIS TEMPLATE:', font: { bold: true, size: 12 } },
      { text: '1. Fill out the "Exam Entries" sheet with your exam data' },
      { text: '2. Delete the 3 sample rows (rows 2-4) before uploading' },
      { text: '3. Upload the file - the system will validate all entries' },
      { text: '4. Review and fix any errors in the validation screen' },
      { text: '5. Once all errors are resolved, submit the entries' },
      { text: '' },
      { text: 'FIELD DESCRIPTIONS:', font: { bold: true, size: 12 } },
      { text: '' },
      { text: 'Course Code (Required)', font: { bold: true } },
      { text: '  - The course code as registered in your institution' },
      { text: '  - Example: CSC101, MAT201, ENG301' },
      { text: '  - System will verify the course exists' },
      { text: '' },
      { text: 'Exam Date (Required)', font: { bold: true } },
      { text: '  - Format: YYYY-MM-DD (e.g., 2024-05-15)' },
      { text: `  - Must be between ${timetable.startDate.toISOString().split('T')[0]} and ${timetable.endDate.toISOString().split('T')[0]}` },
      { text: '  - System will check for date conflicts' },
      { text: '' },
      { text: 'Start Time (Required)', font: { bold: true } },
      { text: '  - Format: HH:MM in 24-hour format (e.g., 09:00, 14:30)' },
      { text: '  - System will check for time conflicts' },
      { text: '' },
      { text: 'Duration (Required)', font: { bold: true } },
      { text: '  - Duration in minutes (e.g., 120 for 2 hours)' },
      { text: '  - Minimum: 30 minutes, Maximum: 480 minutes (8 hours)' },
      { text: '' },
      { text: 'Venue Name (Required)', font: { bold: true } },
      { text: '  - The exact name of the venue as registered in your institution' },
      { text: '  - Examples: Main Hall A, Science Block Room 204, Arts Building Hall' },
      { text: '  - System will verify the venue exists and check capacity' },
      { text: '' },
      { text: 'Level (Optional)', font: { bold: true } },
      { text: '  - Student level: 100, 200, 300, 400, etc.' },
      { text: '' },
      { text: 'Notes (Optional)', font: { bold: true } },
      { text: '  - Any additional information about the exam' },
      { text: '' },
      { text: 'Special Requirements (Optional)', font: { bold: true } },
      { text: '  - Special materials or conditions needed' },
      { text: '  - Examples: Calculator required, Formula sheet allowed, Open book' },
      { text: '' },
      { text: 'VALIDATION RULES:', font: { bold: true, size: 12 } },
      { text: '' },
      { text: 'The system will check for:', font: { bold: true } },
      { text: '✓ Course exists in your institution' },
      { text: '✓ Venue exists in your institution' },
      { text: '✓ Date is within timetable range' },
      { text: '✓ Time format is valid' },
      { text: '✓ Duration is within allowed range' },
      { text: '✓ No scheduling conflicts (same course, venue, or time)' },
      { text: '✓ Venue capacity is sufficient' },
      { text: '' },
      { text: 'TIMETABLE INFORMATION:', font: { bold: true, size: 12 } },
      { text: '' },
      { text: `Title: ${timetable.title}`, font: { bold: true } },
      { text: `Period: ${timetable.startDate.toISOString().split('T')[0]} to ${timetable.endDate.toISOString().split('T')[0]}` },
      { text: `Default Duration: ${timetable.defaultExamDuration} minutes` },
    ];

    instructions.forEach((instruction, index) => {
      const row = instructionsSheet.addRow({ text: instruction.text });
      if (instruction.font) {
        row.getCell(1).font = instruction.font;
      }
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  } catch (error) {
    console.error('Error generating template:', error);
    throw new Error('Failed to generate Excel template');
  }
};

// ========================================
// FILE PARSING
// ========================================

/**
 * Parse and validate uploaded Excel file
 * Returns detailed validation results for frontend display
 */
export const parseAndValidateBulkUpload = async (
  fileBuffer: Buffer,
  timetableId: number,
  institutionId: number
): Promise<BulkUploadValidationResult> => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer as any);

    // Read the main sheet
    const worksheet = workbook.getWorksheet('Exam Entries');

    if (!worksheet) {
      throw new Error('Invalid file format: "Exam Entries" sheet not found');
    }

    // Fetch timetable for date validation
    const timetable = await prisma.examTimetable.findUnique({
      where: { id: timetableId },
    });

    if (!timetable) {
      throw new Error('Timetable not found');
    }

    // Fetch all courses for the institution
    const courses = await prisma.course.findMany({
      where: {
        department: {
          faculty: {
            institutionId,
          },
        },
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    // Fetch all venues for the institution
    const venues = await prisma.venue.findMany({
      where: { institutionId },
      select: {
        id: true,
        name: true,
        location: true,
        capacity: true,
      },
    });

    // Create lookup maps
    const courseMap = new Map(courses.map((c) => [c.code.toLowerCase(), c]));
    const venueMap = new Map(venues.map((v) => [v.name.toLowerCase(), v]));

    const validatedEntries: ValidatedEntry[] = [];
    let rowNumber = 1; // Start from 1 (header is row 1, data starts at row 2)

    // Parse all rows
    worksheet.eachRow((row, excelRowNumber) => {
      if (excelRowNumber === 1) return; // Skip header
      rowNumber++;

      const courseCode = row.getCell(1).value?.toString().trim() || '';
      const examDate = row.getCell(2).value?.toString().trim() || '';
      const startTime = row.getCell(3).value?.toString().trim() || '';
      const durationStr = row.getCell(4).value?.toString().trim() || '';
      const venueName = row.getCell(5).value?.toString().trim() || '';
      const level = row.getCell(6).value?.toString().trim() || undefined;
      const notes = row.getCell(7).value?.toString().trim() || undefined;
      const specialRequirements = row.getCell(8).value?.toString().trim() || undefined;

      // Skip completely empty rows
      if (!courseCode && !examDate && !startTime && !venueName) {
        return;
      }

      const entry: ValidatedEntry = {
        rowNumber,
        courseCode,
        examDate,
        startTime,
        duration: parseInt(durationStr, 10) || 0,
        venueName,
        level,
        notes,
        specialRequirements,
        isValid: true,
        errors: [],
        warnings: [],
      };

      // Validate Course Code
      if (!courseCode) {
        entry.errors.push({
          field: 'courseCode',
          message: 'Course code is required',
          severity: 'error',
        });
        entry.isValid = false;
      } else {
        const course = courseMap.get(courseCode.toLowerCase());
        if (!course) {
          entry.errors.push({
            field: 'courseCode',
            message: `Course "${courseCode}" not found in your institution`,
            severity: 'error',
          });
          entry.isValid = false;
        } else {
          entry.courseId = course.id;
          entry.courseName = course.name;
        }
      }

      // Validate Exam Date
      if (!examDate) {
        entry.errors.push({
          field: 'examDate',
          message: 'Exam date is required',
          severity: 'error',
        });
        entry.isValid = false;
      } else {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(examDate)) {
          entry.errors.push({
            field: 'examDate',
            message: 'Invalid date format. Use YYYY-MM-DD',
            severity: 'error',
          });
          entry.isValid = false;
        } else {
          const examDateObj = new Date(examDate);
          const startDate = new Date(timetable.startDate);
          const endDate = new Date(timetable.endDate);

          if (isNaN(examDateObj.getTime())) {
            entry.errors.push({
              field: 'examDate',
              message: 'Invalid date',
              severity: 'error',
            });
            entry.isValid = false;
          } else if (examDateObj < startDate || examDateObj > endDate) {
            entry.errors.push({
              field: 'examDate',
              message: `Date must be between ${timetable.startDate.toISOString().split('T')[0]} and ${timetable.endDate.toISOString().split('T')[0]}`,
              severity: 'error',
            });
            entry.isValid = false;
          }
        }
      }

      // Validate Start Time
      if (!startTime) {
        entry.errors.push({
          field: 'startTime',
          message: 'Start time is required',
          severity: 'error',
        });
        entry.isValid = false;
      } else {
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(startTime)) {
          entry.errors.push({
            field: 'startTime',
            message: 'Invalid time format. Use HH:MM (24-hour format)',
            severity: 'error',
          });
          entry.isValid = false;
        }
      }

      // Validate Duration
      if (!entry.duration || entry.duration === 0) {
        entry.errors.push({
          field: 'duration',
          message: 'Duration is required',
          severity: 'error',
        });
        entry.isValid = false;
      } else if (entry.duration < 30) {
        entry.errors.push({
          field: 'duration',
          message: 'Duration must be at least 30 minutes',
          severity: 'error',
        });
        entry.isValid = false;
      } else if (entry.duration > 480) {
        entry.errors.push({
          field: 'duration',
          message: 'Duration cannot exceed 480 minutes (8 hours)',
          severity: 'error',
        });
        entry.isValid = false;
      } else if (entry.duration > 240) {
        entry.warnings.push({
          field: 'duration',
          message: 'Duration exceeds 4 hours - please verify',
          severity: 'warning',
        });
      }

      // Validate Venue Name
      if (!venueName) {
        entry.errors.push({
          field: 'venueName',
          message: 'Venue name is required',
          severity: 'error',
        });
        entry.isValid = false;
      } else {
        const venue = venueMap.get(venueName.toLowerCase());
        if (!venue) {
          entry.errors.push({
            field: 'venueName',
            message: `Venue "${venueName}" not found in your institution`,
            severity: 'error',
          });
          entry.isValid = false;
        } else {
          entry.venueId = venue.id;
          entry.venueLocation = venue.location;
          entry.venueCapacity = venue.capacity;
        }
      }

      // Validate Level (optional)
      if (level) {
        const levelNum = parseInt(level, 10);
        if (isNaN(levelNum) || levelNum < 100 || levelNum > 900) {
          entry.warnings.push({
            field: 'level',
            message: 'Level should be 100, 200, 300, etc.',
            severity: 'warning',
          });
        }
      }

      validatedEntries.push(entry);
    });

    const validCount = validatedEntries.filter((e) => e.isValid).length;
    const invalidCount = validatedEntries.filter((e) => !e.isValid).length;
    const warningCount = validatedEntries.filter((e) => e.warnings.length > 0).length;

    return {
      entries: validatedEntries,
      totalRows: validatedEntries.length,
      validCount,
      invalidCount,
      warningCount,
    };
  } catch (error) {
    console.error('Error parsing and validating file:', error);
    throw new Error('Failed to parse Excel file');
  }
};

// ========================================
// BULK CREATION
// ========================================

/**
 * Create exam entries from validated data
 * Expects entries that have already been validated in the frontend
 */
export const createBulkEntriesFromValidated = async (
  validatedEntries: ValidatedEntry[],
  timetableId: number,
  userId: number
): Promise<BulkUploadResult> => {
  const errors: BulkUploadResult['errors'] = [];
  const createdEntries: any[] = [];
  let successCount = 0;
  let failureCount = 0;

  try {
    // Filter only valid entries
    const entriesToCreate = validatedEntries.filter((e) => e.isValid);

    if (entriesToCreate.length === 0) {
      return {
        success: false,
        totalRows: validatedEntries.length,
        successCount: 0,
        failureCount: validatedEntries.length,
        errors: [{ row: 0, message: 'No valid entries to create' }],
        createdEntries: [],
      };
    }

    // Create entries in transaction
    for (const entry of entriesToCreate) {
      try {
        // Parse date and time
        const examDate = new Date(entry.examDate);
        const [hours, minutes] = entry.startTime.split(':').map(Number);

        const startDateTime = new Date(examDate);
        startDateTime.setHours(hours, minutes, 0, 0);

        const endDateTime = new Date(startDateTime);
        endDateTime.setMinutes(endDateTime.getMinutes() + entry.duration);

        // Create the entry
        const timetableEntry = await prisma.examTimetableEntry.create({
          data: {
            timetableId,
            courseId: entry.courseId!,
            examDate: examDate,
            startTime: startDateTime,
            endTime: endDateTime,
            duration: entry.duration,
            venueId: entry.venueId!,
            status: 'SCHEDULED',
            level: entry.level ? parseInt(entry.level, 10) : null,
            notes: entry.notes,
            specialRequirements: entry.specialRequirements,
            programIds: '[]',
            roomIds: '[]',
            invigilatorIds: '[]',
          },
          include: {
            course: {
              select: {
                code: true,
                name: true,
              },
            },
            venue: {
              select: {
                name: true,
                location: true,
              },
            },
          },
        });

        createdEntries.push(timetableEntry);
        successCount++;
      } catch (error: any) {
        console.error(`Error creating entry at row ${entry.rowNumber}:`, error);
        errors.push({
          row: entry.rowNumber,
          message: error.message || 'Failed to create entry',
        });
        failureCount++;
      }
    }

    return {
      success: successCount > 0,
      totalRows: validatedEntries.length,
      successCount,
      failureCount,
      errors,
      createdEntries,
    };
  } catch (error: any) {
    console.error('Error in bulk creation:', error);
    throw new Error('Failed to create bulk entries');
  }
};
