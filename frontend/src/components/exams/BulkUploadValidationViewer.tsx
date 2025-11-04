import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  Edit2,
  Save,
  X,
} from 'lucide-react';
import { ValidatedEntry, ValidationError } from '@/services/examTimetable.service';

interface BulkUploadValidationViewerProps {
  entries: ValidatedEntry[];
  onSubmit: (entries: ValidatedEntry[]) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

interface EditingCell {
  rowIndex: number;
  field: keyof ValidatedEntry;
}

export const BulkUploadValidationViewer: React.FC<BulkUploadValidationViewerProps> = ({
  entries: initialEntries,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [entries, setEntries] = useState<ValidatedEntry[]>(initialEntries);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Calculate summary statistics
  const summary = useMemo(() => {
    const validRows = entries.filter((e) => e.isValid).length;
    const invalidRows = entries.filter((e) => !e.isValid).length;
    const rowsWithWarnings = entries.filter((e) => e.warnings.length > 0).length;

    return {
      totalRows: entries.length,
      validRows,
      invalidRows,
      rowsWithWarnings,
    };
  }, [entries]);

  const canSubmit = summary.invalidRows === 0 && summary.totalRows > 0;

  // Start editing a cell
  const handleStartEdit = (rowIndex: number, field: keyof ValidatedEntry) => {
    const value = entries[rowIndex][field];
    setEditValue(String(value ?? ''));
    setEditingCell({ rowIndex, field });
  };

  // Save edited cell value
  const handleSaveEdit = () => {
    if (!editingCell) return;

    const { rowIndex, field } = editingCell;
    const updatedEntries = [...entries];
    const entry = { ...updatedEntries[rowIndex] };

    // Update the field value
    if (field === 'duration' || field === 'level') {
      (entry[field] as any) = editValue ? parseInt(editValue, 10) : undefined;
    } else {
      (entry[field] as any) = editValue;
    }

    // Re-validate the entry (simple client-side validation)
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Course code validation
    if (!entry.courseCode || entry.courseCode.trim() === '') {
      errors.push({
        field: 'courseCode',
        message: 'Course code is required',
        severity: 'error',
      });
    }

    // Exam date validation
    if (!entry.examDate || !/^\d{4}-\d{2}-\d{2}$/.test(entry.examDate)) {
      errors.push({
        field: 'examDate',
        message: 'Invalid date format. Use YYYY-MM-DD',
        severity: 'error',
      });
    }

    // Start time validation
    if (!entry.startTime || !/^\d{2}:\d{2}$/.test(entry.startTime)) {
      errors.push({
        field: 'startTime',
        message: 'Invalid time format. Use HH:MM',
        severity: 'error',
      });
    }

    // Duration validation
    if (!entry.duration || entry.duration < 30 || entry.duration > 480) {
      errors.push({
        field: 'duration',
        message: 'Duration must be between 30 and 480 minutes',
        severity: 'error',
      });
    }

    // Venue name validation
    if (!entry.venueName || entry.venueName.trim() === '') {
      errors.push({
        field: 'venueName',
        message: 'Venue name is required',
        severity: 'error',
      });
    }

    // Level validation (optional but must be valid if provided)
    if (entry.level && (entry.level < 100 || entry.level > 900)) {
      errors.push({
        field: 'level',
        message: 'Level must be between 100 and 900',
        severity: 'error',
      });
    }

    entry.errors = errors;
    entry.warnings = warnings;
    entry.isValid = errors.length === 0;

    updatedEntries[rowIndex] = entry;
    setEntries(updatedEntries);
    setEditingCell(null);
    setEditValue('');
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // Get row status icon and color
  const getRowStatus = (entry: ValidatedEntry) => {
    if (!entry.isValid) {
      return {
        icon: <XCircle className="h-4 w-4" />,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
      };
    }
    if (entry.warnings.length > 0) {
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
      };
    }
    return {
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    };
  };

  // Render cell content (editable or display)
  const renderCell = (
    entry: ValidatedEntry,
    rowIndex: number,
    field: keyof ValidatedEntry,
    displayValue: string | number | undefined
  ) => {
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.field === field;
    const hasError = entry.errors.some((e) => e.field === field);

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') handleCancelEdit();
            }}
            className="h-7 text-xs"
            autoFocus
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={handleSaveEdit}
          >
            <Save className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={handleCancelEdit}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    return (
      <div
        className={`group flex items-center justify-between cursor-pointer ${
          hasError ? 'text-red-600' : ''
        }`}
        onClick={() => handleStartEdit(rowIndex, field)}
      >
        <span className="text-xs">{displayValue ?? '-'}</span>
        <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-50" />
      </div>
    );
  };

  // Get all errors and warnings for a row
  const getRowMessages = (entry: ValidatedEntry) => {
    return [...entry.errors, ...entry.warnings];
  };

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Upload Validation Results
          </CardTitle>
          <CardDescription>
            Review and edit the data before submitting. Click on any cell to edit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{summary.totalRows}</div>
              <div className="text-sm text-gray-500">Total Rows</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.validRows}</div>
              <div className="text-sm text-gray-500">Valid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.invalidRows}</div>
              <div className="text-sm text-gray-500">Invalid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {summary.rowsWithWarnings}
              </div>
              <div className="text-sm text-gray-500">Warnings</div>
            </div>
          </div>

          {!canSubmit && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>
                Please fix all errors before submitting. {summary.invalidRows} row(s) have errors.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead className="w-12">Row</TableHead>
                  <TableHead className="w-12">Status</TableHead>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Exam Date</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Duration (min)</TableHead>
                  <TableHead>Venue Name</TableHead>
                  <TableHead>Venue Location</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Special Req.</TableHead>
                  <TableHead className="w-64">Messages</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry, index) => {
                  const status = getRowStatus(entry);
                  const messages = getRowMessages(entry);

                  return (
                    <TableRow key={index} className={status.bgColor}>
                      <TableCell className="text-xs font-medium">
                        {entry.rowNumber}
                      </TableCell>
                      <TableCell>
                        <div className={status.color}>{status.icon}</div>
                      </TableCell>
                      <TableCell>
                        {renderCell(entry, index, 'courseCode', entry.courseCode)}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-600">
                          {entry.courseName ?? '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {renderCell(entry, index, 'examDate', entry.examDate)}
                      </TableCell>
                      <TableCell>
                        {renderCell(entry, index, 'startTime', entry.startTime)}
                      </TableCell>
                      <TableCell>
                        {renderCell(entry, index, 'duration', entry.duration)}
                      </TableCell>
                      <TableCell>
                        {renderCell(entry, index, 'venueName', entry.venueName)}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-600">
                          {entry.venueLocation ?? '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {renderCell(entry, index, 'level', entry.level)}
                      </TableCell>
                      <TableCell>
                        {renderCell(entry, index, 'notes', entry.notes)}
                      </TableCell>
                      <TableCell>
                        {renderCell(
                          entry,
                          index,
                          'specialRequirements',
                          entry.specialRequirements
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {messages.map((msg, msgIndex) => (
                            <Badge
                              key={msgIndex}
                              variant={msg.severity === 'error' ? 'destructive' : 'outline'}
                              className="text-xs"
                            >
                              {msg.field}: {msg.message}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit(entries)}
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : `Submit ${summary.validRows} Entries`}
        </Button>
      </div>
    </div>
  );
};
