import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ========================================
// TYPES
// ========================================

export interface BulkUploadEntry {
  courseCode: string;
  examDate: string;
  startTime: string;
  duration: number;
  venueCode: string;
  level?: string;
  notes?: string;
  specialRequirements?: string;
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
 * Generate a dynamic Excel template with data validation
 * Includes reference sheets for courses, venues, etc.
 */
export const generateBulkUploadTemplate = async (
  timetableId: number,
  institutionId: number
): Promise<Buffer> => {
  try {
    // Fetch reference data
    const timetable = await prisma.examTimetable.findUnique({
      where: { id: timetableId },
      include: { academicPeriod: true },
    });

    if (!timetable) {
      throw new Error('Timetable not found');
    }

    // Fetch courses for the institution
    const courses = await prisma.course.findMany({
      where: { institutionId },
      select: {
        id: true,
        courseCode: true,
        courseName: true,
        level: true,
      },
      orderBy: { courseCode: 'asc' },
    });

    // Fetch venues for the institution
    const venues = await prisma.venue.findMany({
      where: { institutionId },
      select: {
        id: true,
        venueCode: true,
        venueName: true,
        capacity: true,
      },
      orderBy: { venueCode: 'asc' },
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // ========================================
    // MAIN SHEET - Entry Form
    // ========================================
    const mainData = [
      [
        'Course Code *',
        'Course Name (auto)',
        'Exam Date *',
        'Start Time *',
        'Duration (mins) *',
        'Venue Code *',
        'Venue Name (auto)',
        'Level',
        'Notes',
        'Special Requirements',
      ],
      [
        'CSC101',
        '(Select course)',
        timetable.startDate.toISOString().split('T')[0],
        '09:00',
        '180',
        'HALL-A',
        '(Select venue)',
        '100',
        'First semester exam',
        'Calculator required',
      ],
      [
        'CSC201',
        '(Select course)',
        timetable.startDate.toISOString().split('T')[0],
        '14:00',
        '120',
        'HALL-B',
        '(Select venue)',
        '200',
        '',
        '',
      ],
    ];

    const mainSheet = XLSX.utils.aoa_to_sheet(mainData);

    // Set column widths
    mainSheet['!cols'] = [
      { wch: 15 }, // Course Code
      { wch: 30 }, // Course Name
      { wch: 12 }, // Exam Date
      { wch: 12 }, // Start Time
      { wch: 15 }, // Duration
      { wch: 15 }, // Venue Code
      { wch: 30 }, // Venue Name
      { wch: 10 }, // Level
      { wch: 25 }, // Notes
      { wch: 25 }, // Special Requirements
    ];

    // Add data validation for dropdowns
    const dataValidations: any[] = [];

    // Course Code dropdown validation (column A, rows 2-1000)
    if (courses.length > 0) {
      dataValidations.push({
        sqref: 'A2:A1000',
        type: 'list',
        formula1: `Courses!$A$2:$A$${courses.length + 1}`,
        showErrorMessage: true,
        errorTitle: 'Invalid Course',
        error: 'Please select a course from the dropdown list',
      });
    }

    // Venue Code dropdown validation (column F, rows 2-1000)
    if (venues.length > 0) {
      dataValidations.push({
        sqref: 'F2:F1000',
        type: 'list',
        formula1: `Venues!$A$2:$A$${venues.length + 1}`,
        showErrorMessage: true,
        errorTitle: 'Invalid Venue',
        error: 'Please select a venue from the dropdown list',
      });
    }

    // Add formulas for auto-fill columns
    // Course Name formula (column B) - VLOOKUP to Courses sheet
    if (courses.length > 0) {
      for (let row = 2; row <= 1000; row++) {
        const cellRef = XLSX.utils.encode_cell({ r: row - 1, c: 1 });
        mainSheet[cellRef] = {
          f: `IF(A${row}="","",IFERROR(VLOOKUP(A${row},Courses!$A$2:$C$${courses.length + 1},2,FALSE),""))`,
          t: 's',
        };
      }
    }

    // Venue Name formula (column G) - VLOOKUP to Venues sheet
    if (venues.length > 0) {
      for (let row = 2; row <= 1000; row++) {
        const cellRef = XLSX.utils.encode_cell({ r: row - 1, c: 6 });
        mainSheet[cellRef] = {
          f: `IF(F${row}="","",IFERROR(VLOOKUP(F${row},Venues!$A$2:$C$${venues.length + 1},2,FALSE),""))`,
          t: 's',
        };
      }
    }

    mainSheet['!dataValidation'] = dataValidations;

    XLSX.utils.book_append_sheet(workbook, mainSheet, 'Exam Entries');

    // ========================================
    // COURSES REFERENCE SHEET
    // ========================================
    const coursesData = [
      ['Course Code', 'Course Name', 'Level', 'Course ID'],
      ...courses.map((c) => [c.courseCode, c.courseName, c.level || '', c.id]),
    ];

    const coursesSheet = XLSX.utils.aoa_to_sheet(coursesData);
    coursesSheet['!cols'] = [
      { wch: 15 },
      { wch: 40 },
      { wch: 10 },
      { wch: 10 },
    ];

    XLSX.utils.book_append_sheet(workbook, coursesSheet, 'Courses');

    // ========================================
    // VENUES REFERENCE SHEET
    // ========================================
    const venuesData = [
      ['Venue Code', 'Venue Name', 'Capacity', 'Venue ID'],
      ...venues.map((v) => [v.venueCode, v.venueName, v.capacity, v.id]),
    ];

    const venuesSheet = XLSX.utils.aoa_to_sheet(venuesData);
    venuesSheet['!cols'] = [
      { wch: 15 },
      { wch: 30 },
      { wch: 12 },
      { wch: 10 },
    ];

    XLSX.utils.book_append_sheet(workbook, venuesSheet, 'Venues');

    // ========================================
    // INSTRUCTIONS SHEET
    // ========================================
    const instructionsData = [
      ['BULK UPLOAD INSTRUCTIONS'],
      [''],
      ['1. Fill out the "Exam Entries" sheet with your exam data'],
      ['2. Use the dropdowns for Course Code and Venue Code (data from your institution)'],
      ['3. Course Name and Venue Name will auto-fill based on your selection'],
      ['4. Required fields are marked with * in the header'],
      ['5. Date format: YYYY-MM-DD (e.g., 2024-05-15)'],
      ['6. Time format: HH:MM (24-hour, e.g., 09:00, 14:30)'],
      ['7. Duration should be in minutes (e.g., 120 for 2 hours)'],
      ['8. Delete the sample rows before uploading'],
      ['9. Save the file and upload it back to the system'],
      [''],
      ['FIELD DESCRIPTIONS:'],
      ['- Course Code: Select from dropdown (required)'],
      ['- Exam Date: Must be within timetable date range (required)'],
      ['- Start Time: Exam start time in 24-hour format (required)'],
      ['- Duration: Exam duration in minutes, min: 30, max: 480 (required)'],
      ['- Venue Code: Select from dropdown (required)'],
      ['- Level: Student level (optional)'],
      ['- Notes: Any additional notes (optional)'],
      ['- Special Requirements: E.g., calculator, formula sheet (optional)'],
      [''],
      [`TIMETABLE INFO:`],
      [`Title: ${timetable.title}`],
      [`Period: ${timetable.startDate.toISOString().split('T')[0]} to ${timetable.endDate.toISOString().split('T')[0]}`],
      [`Default Duration: ${timetable.defaultExamDuration} minutes`],
    ];

    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
    instructionsSheet['!cols'] = [{ wch: 80 }];

    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    // Generate buffer
    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
      cellStyles: true,
    });

    return buffer;
  } catch (error) {
    console.error('Error generating template:', error);
    throw new Error('Failed to generate Excel template');
  }
};

// ========================================
// FILE PARSING
// ========================================

/**
 * Parse uploaded Excel file and validate entries
 */
export const parseBulkUploadFile = async (
  fileBuffer: Buffer,
  timetableId: number,
  institutionId: number
): Promise<BulkUploadEntry[]> => {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    // Read the main sheet
    const sheetName = 'Exam Entries';
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      throw new Error('Invalid file format: "Exam Entries" sheet not found');
    }

    // Convert to JSON
    const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      defval: '',
    });

    if (rawData.length === 0) {
      throw new Error('No data found in the file');
    }

    // Map and validate entries
    const entries: BulkUploadEntry[] = rawData.map((row, index) => {
      const entry: BulkUploadEntry = {
        courseCode: row['Course Code *']?.toString().trim() || '',
        examDate: row['Exam Date *']?.toString().trim() || '',
        startTime: row['Start Time *']?.toString().trim() || '',
        duration: parseInt(row['Duration (mins) *']?.toString() || '0', 10),
        venueCode: row['Venue Code *']?.toString().trim() || '',
        level: row['Level']?.toString().trim() || undefined,
        notes: row['Notes']?.toString().trim() || undefined,
        specialRequirements:
          row['Special Requirements']?.toString().trim() || undefined,
      };

      return entry;
    });

    // Filter out empty rows
    const validEntries = entries.filter(
      (entry) =>
        entry.courseCode ||
        entry.examDate ||
        entry.startTime ||
        entry.venueCode
    );

    return validEntries;
  } catch (error) {
    console.error('Error parsing file:', error);
    throw new Error('Failed to parse Excel file');
  }
};

// ========================================
// BULK CREATION
// ========================================

/**
 * Create exam entries in bulk with validation
 */
export const createBulkEntries = async (
  entries: BulkUploadEntry[],
  timetableId: number,
  institutionId: number,
  userId: number
): Promise<BulkUploadResult> => {
  const errors: BulkUploadResult['errors'] = [];
  const createdEntries: any[] = [];
  let successCount = 0;
  let failureCount = 0;

  try {
    // Validate timetable exists
    const timetable = await prisma.examTimetable.findUnique({
      where: { id: timetableId },
    });

    if (!timetable) {
      throw new Error('Timetable not found');
    }

    // Fetch all courses and venues for validation
    const courses = await prisma.course.findMany({
      where: { institutionId },
      select: { id: true, courseCode: true },
    });

    const venues = await prisma.venue.findMany({
      where: { institutionId },
      select: { id: true, venueCode: true },
    });

    const courseMap = new Map(courses.map((c) => [c.courseCode, c.id]));
    const venueMap = new Map(venues.map((v) => [v.venueCode, v.id]));

    // Process each entry
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const rowNumber = i + 2; // +2 because Excel is 1-indexed and row 1 is header

      try {
        // Validate required fields
        if (!entry.courseCode) {
          errors.push({
            row: rowNumber,
            field: 'courseCode',
            message: 'Course code is required',
          });
          failureCount++;
          continue;
        }

        if (!entry.examDate) {
          errors.push({
            row: rowNumber,
            field: 'examDate',
            message: 'Exam date is required',
          });
          failureCount++;
          continue;
        }

        if (!entry.startTime) {
          errors.push({
            row: rowNumber,
            field: 'startTime',
            message: 'Start time is required',
          });
          failureCount++;
          continue;
        }

        if (!entry.duration || entry.duration < 30 || entry.duration > 480) {
          errors.push({
            row: rowNumber,
            field: 'duration',
            message: 'Duration must be between 30 and 480 minutes',
          });
          failureCount++;
          continue;
        }

        if (!entry.venueCode) {
          errors.push({
            row: rowNumber,
            field: 'venueCode',
            message: 'Venue code is required',
          });
          failureCount++;
          continue;
        }

        // Validate course exists
        const courseId = courseMap.get(entry.courseCode);
        if (!courseId) {
          errors.push({
            row: rowNumber,
            field: 'courseCode',
            message: `Course "${entry.courseCode}" not found`,
          });
          failureCount++;
          continue;
        }

        // Validate venue exists
        const venueId = venueMap.get(entry.venueCode);
        if (!venueId) {
          errors.push({
            row: rowNumber,
            field: 'venueCode',
            message: `Venue "${entry.venueCode}" not found`,
          });
          failureCount++;
          continue;
        }

        // Validate date format and range
        const examDate = new Date(entry.examDate);
        if (isNaN(examDate.getTime())) {
          errors.push({
            row: rowNumber,
            field: 'examDate',
            message: 'Invalid date format. Use YYYY-MM-DD',
          });
          failureCount++;
          continue;
        }

        if (
          examDate < timetable.startDate ||
          examDate > timetable.endDate
        ) {
          errors.push({
            row: rowNumber,
            field: 'examDate',
            message: `Date must be within timetable range (${timetable.startDate.toISOString().split('T')[0]} to ${timetable.endDate.toISOString().split('T')[0]})`,
          });
          failureCount++;
          continue;
        }

        // Validate time format
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(entry.startTime)) {
          errors.push({
            row: rowNumber,
            field: 'startTime',
            message: 'Invalid time format. Use HH:MM (24-hour)',
          });
          failureCount++;
          continue;
        }

        // Create exam entry
        const [hours, minutes] = entry.startTime.split(':').map(Number);
        const startDateTime = new Date(examDate);
        startDateTime.setHours(hours, minutes, 0, 0);

        const endDateTime = new Date(startDateTime);
        endDateTime.setMinutes(endDateTime.getMinutes() + entry.duration);

        const timetableEntry = await prisma.timetableEntry.create({
          data: {
            timetableId,
            courseId,
            examDate: examDate,
            startTime: startDateTime,
            endTime: endDateTime,
            duration: entry.duration,
            venueId,
            status: 'SCHEDULED',
            level: entry.level,
            notes: entry.notes,
            specialRequirements: entry.specialRequirements,
            createdBy: userId,
          },
          include: {
            course: {
              select: {
                courseCode: true,
                courseName: true,
              },
            },
            venue: {
              select: {
                venueCode: true,
                venueName: true,
              },
            },
          },
        });

        createdEntries.push(timetableEntry);
        successCount++;
      } catch (error: any) {
        errors.push({
          row: rowNumber,
          message: error.message || 'Failed to create entry',
        });
        failureCount++;
      }
    }

    return {
      success: successCount > 0,
      totalRows: entries.length,
      successCount,
      failureCount,
      errors,
      createdEntries,
    };
  } catch (error: any) {
    console.error('Error in bulk creation:', error);
    throw new Error(error.message || 'Failed to process bulk upload');
  }
};
