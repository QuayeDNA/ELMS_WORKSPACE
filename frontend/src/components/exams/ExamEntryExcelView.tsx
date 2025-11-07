import { useMemo, useState, useCallback } from 'react';
import DataGrid, { Column } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import {
  Plus,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Edit2,
  Upload,
  Download,
  FileText
} from 'lucide-react';

// Import external cell editors
import { CourseSearchEditor } from './cell-editors/CourseSearchEditor';
import { DatePickerEditor } from './cell-editors/DatePickerEditor';
import { LevelSelectorEditor } from './cell-editors/LevelSelectorEditor';
import { TimePickerEditor } from './cell-editors/TimePickerEditor';
import { VenueSearchEditor } from './cell-editors/VenueSearchEditor';

// Import service and types
import { examTimetableService, BulkUploadValidationResult } from '@/services/examTimetable.service';

// Type definitions
export interface ExamEntryRow {
  id: string;
  courseCode: string;
  courseId?: number;
  courseName: string;
  examDate: string;
  startTime: string;
  duration: number;
  venueName: string;
  venueId?: number;
  venueLocation: string;
  venueCapacity?: number;
  level: string;
  notes: string;
  specialRequirements: string;
  isNew: boolean;
  isValid?: boolean;
  errors?: string[];
  warnings?: string[];
  [key: string]: unknown; // Allow string indexing
}

interface SaveResult {
  success: number;
  failed: number;
  errors: string[];
}

interface ExamEntryExcelViewProps {
  timetableId: string;
  institutionId: string;
  startDate?: string;
  endDate?: string;
  entries?: ExamEntryRow[];
  onSave?: (entries: ExamEntryRow[]) => Promise<void>;
}

// Main component
export default function ExamEntryExcelView({
  timetableId,
  institutionId,
  startDate,
  endDate,
  entries = [],
  onSave
}: ExamEntryExcelViewProps) {
  const [rowData, setRowData] = useState<ExamEntryRow[]>(() => {
    // If entries are provided, use them; otherwise start with one empty row
    if (entries.length > 0) {
      return entries.map(entry => ({
        ...entry,
        isValid: true, // Assume existing entries are valid
        errors: [],
        warnings: []
      }));
    }
    return [
      {
        id: '1',
        courseCode: '',
        courseName: '',
        examDate: '',
        startTime: '',
        duration: 120,
        venueName: '',
        venueLocation: '',
        level: '',
        notes: '',
        specialRequirements: '',
        isValid: false,
        errors: ['Course is required', 'Exam date is required', 'Start time is required', 'Venue is required'],
        warnings: [],
        isNew: true,
      },
    ];
  });

  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkAddDialog, setShowBulkAddDialog] = useState(false);
  const [bulkAddCount, setBulkAddCount] = useState('5');
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);

  // Bulk upload state
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false);
  const [bulkUploadFile, setBulkUploadFile] = useState<File | null>(null);
  const [isValidatingBulk, setIsValidatingBulk] = useState(false);
  const [bulkValidationResult, setBulkValidationResult] = useState<BulkUploadValidationResult | null>(null);
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);

  // Validation function
  const validateRow = useCallback((row: ExamEntryRow) => {
    const errors = [];
    const warnings = [];

    if (!row.courseCode) errors.push('Course is required');
    if (!row.examDate) errors.push('Exam date is required');
    if (!row.startTime) errors.push('Start time is required');
    if (!row.venueName) errors.push('Venue is required');

    if (!row.duration) warnings.push('Duration not set');
    if (!row.level) warnings.push('Level not specified');

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, []);

  // Add new rows
  const handleAddRows = useCallback((count = 1) => {
    const newRows: ExamEntryRow[] = Array.from({ length: count }, (_, i) => ({
      id: `new-${Date.now()}-${i}`,
      courseCode: '',
      courseName: '',
      examDate: '',
      startTime: '',
      duration: 120,
      venueName: '',
      venueLocation: '',
      level: '',
      notes: '',
      specialRequirements: '',
      isValid: false,
      errors: ['Course is required', 'Exam date is required', 'Start time is required', 'Venue is required'],
      warnings: [],
      isNew: true,
    }));
    setRowData((prev) => [...newRows, ...prev]);
  }, []);

  // Delete selected rows
  const handleDeleteSelected = useCallback(() => {
    setRowData((prev) => prev.filter((row) => !selectedRows.has(row.id)));
    setSelectedRows(new Set());
    setShowDeleteDialog(false);
  }, [selectedRows]);

  // Save changes
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveResult(null);

    try {
      const validEntries = rowData.filter((row) => row.isValid && row.courseCode);

      if (validEntries.length === 0) {
        alert('No valid entries to save. Please fill in the required fields.');
        setIsSaving(false);
        return;
      }

      // Use the onSave prop if provided, otherwise use the service directly
      if (onSave) {
        await onSave(validEntries);
      } else {
        // Fallback: use service directly (though this should be handled by parent)
        console.warn('No onSave handler provided');
      }

      // Mark new entries as saved
      setRowData((prev) =>
        prev.map((row) => ({
          ...row,
          isNew: false,
        }))
      );

      setSaveResult({ success: validEntries.length, failed: 0, errors: [] });
    } catch (error) {
      console.error('Save error:', error);
      setSaveResult({
        success: 0,
        failed: rowData.length,
        errors: [error instanceof Error ? error.message : 'Failed to save entries'],
      });
    } finally {
      setIsSaving(false);
    }
  }, [rowData, onSave]);

  // Download bulk upload template
  const handleDownloadTemplate = useCallback(async () => {
    try {
      const blob = await examTimetableService.downloadBulkUploadTemplate(parseInt(timetableId));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exam_entries_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download template:', error);
      alert('Failed to download template. Please try again.');
    }
  }, [timetableId]);

  // Handle bulk upload file validation
  const handleBulkUploadValidation = useCallback(async (file: File) => {
    setIsValidatingBulk(true);
    setBulkValidationResult(null);

    try {
      const result = await examTimetableService.validateBulkUpload(parseInt(timetableId), file);
      setBulkValidationResult(result);
    } catch (error) {
      console.error('Bulk upload validation failed:', error);
      alert('Failed to validate file. Please check the format and try again.');
    } finally {
      setIsValidatingBulk(false);
    }
  }, [timetableId]);

  // Handle bulk upload submission
  const handleBulkUploadSubmit = useCallback(async () => {
    if (!bulkValidationResult) return;

    setIsSubmittingBulk(true);
    try {
      const result = await examTimetableService.submitValidatedEntries(parseInt(timetableId), bulkValidationResult.entries);

      // Refresh the data by calling onSave or reloading entries
      if (onSave) {
        // Convert validated entries back to ExamEntryRow format
        const newRows: ExamEntryRow[] = bulkValidationResult.entries
          .filter(entry => entry.isValid)
          .map(entry => ({
            id: `bulk-${Date.now()}-${entry.rowNumber}`,
            courseCode: entry.courseCode,
            courseId: entry.courseId,
            courseName: entry.courseName || '',
            examDate: entry.examDate,
            startTime: entry.startTime,
            duration: entry.duration,
            venueName: entry.venueName,
            venueId: entry.venueId,
            venueLocation: entry.venueLocation || '',
            level: entry.level?.toString() || '',
            notes: entry.notes || '',
            specialRequirements: entry.specialRequirements || '',
            isNew: false,
            isValid: true,
            errors: [],
            warnings: entry.warnings.map(w => w.message),
          }));

        await onSave(newRows);
      }

      setShowBulkUploadDialog(false);
      setBulkUploadFile(null);
      setBulkValidationResult(null);
      alert(`Successfully uploaded ${result.result.successCount} entries!`);
    } catch (error) {
      console.error('Bulk upload submission failed:', error);
      alert('Failed to submit entries. Please try again.');
    } finally {
      setIsSubmittingBulk(false);
    }
  }, [bulkValidationResult, timetableId, onSave]);

  // Handle row changes
  const handleRowsChange = useCallback((rows: ExamEntryRow[]) => {
    const validatedRows = rows.map((row) => {
      const validation = validateRow(row);
      return {
        ...row,
        ...validation,
      };
    });
    setRowData(validatedRows);
  }, [validateRow]);

  // Define columns
  const columns: Column<ExamEntryRow>[] = useMemo(
    () => [
      {
        key: 'select',
        name: '',
        width: 50,
        frozen: true,
        resizable: false,
        headerCellClass: 'flex items-center justify-center',
        renderHeaderCell: () => (
          <input
            type="checkbox"
            checked={selectedRows.size > 0 && selectedRows.size === rowData.length}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedRows(new Set(rowData.map((r) => r.id)));
              } else {
                setSelectedRows(new Set());
              }
            }}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        ),
        renderCell: ({ row }: { row: ExamEntryRow }) => (
          <div className="flex items-center justify-center h-full">
            <input
              type="checkbox"
              checked={selectedRows.has(row.id)}
              onChange={(e) => {
                const newSelected = new Set(selectedRows);
                if (e.target.checked) {
                  newSelected.add(row.id);
                } else {
                  newSelected.delete(row.id);
                }
                setSelectedRows(newSelected);
              }}
              onClick={(e) => e.stopPropagation()}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        ),
      },
      {
        key: 'status',
        name: 'Status',
        width: 70,
        frozen: true,
        renderCell: ({ row }: { row: ExamEntryRow }) => (
          <div className="flex items-center justify-center h-full">
            {row.isNew && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                New
              </span>
            )}
            {!row.isNew && row.isValid && <CheckCircle className="w-4 h-4 text-green-600" />}
            {!row.isNew && !row.isValid && <AlertTriangle className="w-4 h-4 text-red-600" />}
          </div>
        ),
      },
      {
        key: 'courseCode',
        name: 'Course Code *',
        width: 150,
        editable: true,
        renderEditCell: (props) => <CourseSearchEditor {...props} institutionId={institutionId} />,
        renderCell: ({ row }: { row: ExamEntryRow }) => (
          <div className="flex items-center gap-2 h-full px-2">
            <BookOpen className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="font-mono text-sm">{row.courseCode || '-'}</span>
          </div>
        ),
      },
      {
        key: 'courseName',
        name: 'Course Name',
        width: 250,
        renderCell: ({ row }: { row: ExamEntryRow }) => (
          <div className="px-2 truncate text-sm text-gray-700">{row.courseName || '-'}</div>
        ),
      },
      {
        key: 'examDate',
        name: 'Exam Date *',
        width: 150,
        editable: true,
        renderEditCell: (props) => (
          <DatePickerEditor
            {...props}
            minDate={startDate ? new Date(startDate) : undefined}
            maxDate={endDate ? new Date(endDate) : undefined}
          />
        ),
        renderCell: ({ row }: { row: ExamEntryRow }) => (
          <div className="flex items-center gap-2 h-full px-2">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm">
              {row.examDate
                ? new Date(row.examDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '-'}
            </span>
          </div>
        ),
      },
      {
        key: 'startTime',
        name: 'Start Time *',
        width: 120,
        editable: true,
        renderEditCell: TimePickerEditor,
        renderCell: ({ row }: { row: ExamEntryRow }) => (
          <div className="flex items-center gap-2 h-full px-2">
            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="font-mono text-sm">{row.startTime || '-'}</span>
          </div>
        ),
      },
      {
        key: 'duration',
        name: 'Duration (min)',
        width: 130,
        editable: true,
        renderEditCell: (props) => (
          <input
            type="number"
            className="w-full h-full px-2 border-0 outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            value={(props.row[props.column.key] as number) ?? ''}
            onChange={(e) => props.onRowChange({ ...props.row, [props.column.key]: parseInt(e.target.value) || undefined })}
            onBlur={() => props.onClose(true)}
          />
        ),
        renderCell: ({ row }: { row: ExamEntryRow }) => <div className="px-2 text-sm text-right">{row.duration || '-'}</div>,
      },
      {
        key: 'venueName',
        name: 'Venue *',
        width: 180,
        editable: true,
        renderEditCell: (props) => <VenueSearchEditor {...props} institutionId={institutionId} />,
        renderCell: ({ row }: { row: ExamEntryRow }) => (
          <div className="flex items-center gap-2 h-full px-2">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm truncate">{row.venueName || '-'}</span>
          </div>
        ),
      },
      {
        key: 'venueLocation',
        name: 'Location',
        width: 150,
        renderCell: ({ row }: { row: ExamEntryRow }) => (
          <div className="px-2 text-sm text-gray-600 truncate">{row.venueLocation || '-'}</div>
        ),
      },
      {
        key: 'venueCapacity',
        name: 'Capacity',
        width: 100,
        renderCell: ({ row }: { row: ExamEntryRow }) => <div className="px-2 text-sm text-right">{row.venueCapacity || '-'}</div>,
      },
      {
        key: 'level',
        name: 'Level',
        width: 100,
        editable: true,
        renderEditCell: LevelSelectorEditor,
        renderCell: ({ row }: { row: ExamEntryRow }) => (
          <div className="px-2">
            {row.level && (
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded border border-gray-300">
                {row.level}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'notes',
        name: 'Notes',
        width: 200,
        editable: true,
        renderEditCell: (props) => (
          <input
            className="w-full h-full px-2 border-0 outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            value={(props.row[props.column.key] as string) ?? ''}
            onChange={(e) => props.onRowChange({ ...props.row, [props.column.key]: e.target.value })}
            onBlur={() => props.onClose(true)}
          />
        ),
        renderCell: ({ row }: { row: ExamEntryRow }) => <div className="px-2 text-sm text-gray-600 truncate">{row.notes || '-'}</div>,
      },
      {
        key: 'specialRequirements',
        name: 'Special Requirements',
        width: 200,
        editable: true,
        renderEditCell: (props) => (
          <input
            className="w-full h-full px-2 border-0 outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            value={(props.row[props.column.key] as string) ?? ''}
            onChange={(e) => props.onRowChange({ ...props.row, [props.column.key]: e.target.value })}
            onBlur={() => props.onClose(true)}
          />
        ),
        renderCell: ({ row }: { row: ExamEntryRow }) => (
          <div className="px-2 text-sm text-gray-600 truncate">{row.specialRequirements || '-'}</div>
        ),
      },
    ],
    [selectedRows, rowData, institutionId, startDate, endDate]
  );

  // Calculate statistics
  const stats = useMemo(() => {
    const valid = rowData.filter((r) => r.isValid && r.courseCode).length;
    const invalid = rowData.filter((r) => !r.isValid && (r.courseCode || r.examDate || r.venueName)).length;
    const warnings = rowData.filter((r) => r.warnings && r.warnings.length > 0).length;
    const newEntries = rowData.filter((r) => r.isNew).length;
    return { valid, invalid, warnings, newEntries, total: rowData.length };
  }, [rowData]);

  return (
    <div className="p-6 space-y-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Exam Entries</h3>
            <p className="text-sm text-gray-500 mt-1">Click any cell to edit. Required fields are marked with *</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleAddRows(1)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4" />
              Add Row
            </button>
            <button
              onClick={() => setShowBulkAddDialog(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4" />
              Bulk Add
            </button>
            <button
              onClick={() => setShowBulkUploadDialog(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Upload className="w-4 h-4" />
              Bulk Upload
            </button>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Download className="w-4 h-4" />
              Template
            </button>
            {selectedRows.size > 0 && (
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedRows.size})
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving || stats.valid === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : `Save Changes (${stats.valid})`}
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">{stats.valid} Valid</span>
          </div>
          {stats.invalid > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-gray-700">{stats.invalid} Invalid</span>
            </div>
          )}
          {stats.newEntries > 0 && (
            <div className="flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700">{stats.newEntries} New</span>
            </div>
          )}
          <div className="text-gray-500">Total: {stats.total}</div>
        </div>
      </div>

      {/* Save Result */}
      {saveResult && (
        <div
          className={`rounded-lg p-4 ${
            saveResult.success > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}
        >
          <p className={`text-sm ${saveResult.success > 0 ? 'text-green-700' : 'text-red-700'}`}>
            {saveResult.success > 0 && `✓ Successfully saved ${saveResult.success} entries!`}
            {saveResult.failed > 0 && `✗ ${saveResult.failed} entries failed to save.`}
          </p>
        </div>
      )}

      {/* Excel Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <DataGrid
          columns={columns}
          rows={rowData}
          rowKeyGetter={(row) => row.id}
          onRowsChange={handleRowsChange}
          className="rdg-light"
          style={{
            height: '600px',
            '--rdg-color': '#374151',
            '--rdg-border-color': '#e5e7eb',
            '--rdg-background-color': '#ffffff',
            '--rdg-header-background-color': '#f9fafb',
            '--rdg-row-hover-background-color': '#f3f4f6',
            '--rdg-row-selected-background-color': '#dbeafe',
            '--rdg-frozen-cell-box-shadow': '2px 0 4px -2px rgba(0, 0, 0, 0.1)',
            '--rdg-font-size': '14px',
          } as React.CSSProperties}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 bg-white p-3 rounded-lg border border-gray-200">
        <div>Click any cell to edit • Use Tab to navigate • Required fields: Course, Date, Time, Venue</div>
        <div>Showing {rowData.length} entries</div>
      </div>

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Selected Entries?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete {selectedRows.size} selected entries? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Add Dialog */}
      {showBulkAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Add Rows</h3>
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 block mb-2">Number of rows to add</label>
              <input
                type="number"
                min="1"
                max="100"
                value={bulkAddCount}
                onChange={(e) => setBulkAddCount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter number (1-100)"
              />
              <p className="text-xs text-gray-500 mt-1">You can add up to 100 rows at once</p>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowBulkAddDialog(false);
                  setBulkAddCount('5');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const count = parseInt(bulkAddCount);
                  if (count > 0 && count <= 100) {
                    handleAddRows(count);
                    setShowBulkAddDialog(false);
                    setBulkAddCount('5');
                  }
                }}
                disabled={!bulkAddCount || parseInt(bulkAddCount) < 1 || parseInt(bulkAddCount) > 100}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add {bulkAddCount || 0} Rows
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Dialog */}
      {showBulkUploadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Upload Exam Entries</h3>

            {!bulkValidationResult ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">CSV Format Requirements</h4>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• First row should be headers</li>
                        <li>• Required columns: courseCode, examDate, startTime, venueName</li>
                        <li>• Optional columns: duration, level, notes, specialRequirements</li>
                        <li>• Date format: YYYY-MM-DD</li>
                        <li>• Time format: HH:MM (24-hour)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Select CSV File</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setBulkUploadFile(file);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {bulkUploadFile && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {bulkUploadFile.name} ({(bulkUploadFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowBulkUploadDialog(false);
                      setBulkUploadFile(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (bulkUploadFile) {
                        handleBulkUploadValidation(bulkUploadFile);
                      }
                    }}
                    disabled={!bulkUploadFile || isValidatingBulk}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isValidatingBulk ? 'Validating...' : 'Validate File'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Validation Results</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">{bulkValidationResult.summary.validRows} Valid</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-gray-700">{bulkValidationResult.summary.invalidRows} Invalid</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-gray-700">{bulkValidationResult.summary.rowsWithWarnings} With Warnings</span>
                    </div>
                    <div className="text-gray-500">
                      Total: {bulkValidationResult.summary.totalRows}
                    </div>
                  </div>
                </div>

                {bulkValidationResult.entries.some(entry => !entry.isValid || entry.errors.length > 0) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <h4 className="text-sm font-medium text-red-900 mb-2">Errors Found</h4>
                    <div className="space-y-1">
                      {bulkValidationResult.entries
                        .filter(entry => !entry.isValid || entry.errors.length > 0)
                        .slice(0, 10)
                        .map((entry, index) => (
                          <div key={index} className="text-sm text-red-700">
                            Row {entry.rowNumber}: {entry.errors.map(e => e.message).join(', ')}
                          </div>
                        ))}
                      {bulkValidationResult.entries.filter(entry => !entry.isValid || entry.errors.length > 0).length > 10 && (
                        <div className="text-sm text-red-700 font-medium">
                          ... and {bulkValidationResult.entries.filter(entry => !entry.isValid || entry.errors.length > 0).length - 10} more errors
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setBulkValidationResult(null);
                      setBulkUploadFile(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleBulkUploadSubmit}
                    disabled={bulkValidationResult.summary.validRows === 0 || isSubmittingBulk}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingBulk ? 'Uploading...' : `Upload ${bulkValidationResult.summary.validRows} Valid Entries`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
