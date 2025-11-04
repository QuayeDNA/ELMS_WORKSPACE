import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  examTimetableService,
  BulkUploadResult,
  BulkUploadValidationResult,
  ValidatedEntry,
} from '@/services/examTimetable.service';
import { BulkUploadValidationViewer } from './BulkUploadValidationViewer';

// ========================================
// TYPES
// ========================================

interface BulkUploadEntriesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timetableId: number;
  onUploadComplete: () => void;
}

// ========================================
// COMPONENT
// ========================================

export const BulkUploadEntries: React.FC<BulkUploadEntriesProps> = ({
  open,
  onOpenChange,
  timetableId,
  onUploadComplete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<BulkUploadValidationResult | null>(
    null
  );
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [showValidationView, setShowValidationView] = useState(false);

  // ========================================
  // FILE HANDLING
  // ========================================

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];

      if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
        toast.error('Please select a CSV or Excel file');
        return;
      }

      setSelectedFile(file);
    }
  };

  // Validate the uploaded file
  const handleValidate = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to validate');
      return;
    }

    try {
      setValidating(true);
      setValidationResult(null);
      setUploadResult(null);

      // Call validation endpoint
      const result = await examTimetableService.validateBulkUpload(timetableId, selectedFile);

      setValidationResult(result);
      setShowValidationView(true);

      toast.success(
        `Validated ${result.summary.totalRows} rows: ${result.summary.validRows} valid, ${result.summary.invalidRows} invalid`
      );
    } catch (error: unknown) {
      console.error('Error validating file:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to validate file. Please try again.'
      );
    } finally {
      setValidating(false);
    }
  };

  // Submit validated entries
  const handleSubmitValidated = async (entries: ValidatedEntry[]) => {
    try {
      setUploading(true);

      // Submit the validated entries
      const response = await examTimetableService.submitValidatedEntries(timetableId, entries);

      setUploadResult(response.result);

      // Show results
      if (response.result.successCount > 0) {
        toast.success(
          `Successfully created ${response.result.successCount} of ${response.result.totalRows} entries`
        );
      }

      if (response.result.failureCount > 0) {
        toast.error(
          `${response.result.failureCount} entries failed. Check the error details.`
        );
      }

      // If all succeeded, close dialog and refresh
      if (response.result.failureCount === 0) {
        onUploadComplete();
        setTimeout(() => handleClose(), 1500);
      } else {
        // Go back to validation view to show errors
        setShowValidationView(false);
      }
    } catch (error: unknown) {
      console.error('Error submitting entries:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to submit entries. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);

      // Download the dynamic template
      const blob = await examTimetableService.downloadBulkUploadTemplate(timetableId);

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `exam-entries-template-${timetableId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Dynamic template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template. Please try again.');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setValidationResult(null);
    setUploadResult(null);
    setShowValidationView(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  const handleCancelValidation = () => {
    setShowValidationView(false);
    setValidationResult(null);
  };

  // ========================================
  // RENDER
  // ========================================

  // Show validation viewer if we have validation results
  if (showValidationView && validationResult) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-7xl max-h-[90vh]">
          <BulkUploadValidationViewer
            entries={validationResult.entries}
            onSubmit={handleSubmitValidated}
            onCancel={handleCancelValidation}
            isSubmitting={uploading}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Upload Exam Entries</DialogTitle>
          <DialogDescription>
            Upload an Excel file to add multiple exam entries at once. The file will be validated
            before creating entries.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download Template */}
          <div>
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              className="w-full gap-2"
              disabled={downloadingTemplate}
            >
              <Download className="h-4 w-4" />
              {downloadingTemplate ? 'Downloading...' : 'Download Excel Template'}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Download a simple Excel template with sample data and instructions
            </p>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed rounded-lg p-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFile ? (
              <div className="text-center space-y-2">
                <FileSpreadsheet className="h-12 w-12 mx-auto text-primary" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Different File
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-medium">Select a file to upload</p>
                  <p className="text-sm text-muted-foreground">
                    CSV or Excel files only
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </Button>
              </div>
            )}
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>How it works:</strong>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Download the Excel template with sample data</li>
                <li>Fill in your exam entry data manually</li>
                <li>Upload the file to validate the data</li>
                <li>Review and edit any errors in the validation viewer</li>
                <li>Submit when all entries are valid</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Upload Results */}
          {uploadResult && (
            <div className="space-y-3">
              <h3 className="font-medium">Upload Results</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{uploadResult.totalRows}</div>
                  <div className="text-sm text-muted-foreground">Total Rows</div>
                </div>
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{uploadResult.successCount}</div>
                  <div className="text-sm text-green-700">Succeeded</div>
                </div>
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{uploadResult.failureCount}</div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
              </div>

              {uploadResult.errors.length > 0 && (
                <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
                  <h4 className="font-medium text-sm text-destructive">Errors:</h4>
                  {uploadResult.errors.map((error, index) => (
                    <div key={index} className="text-sm bg-red-50 border border-red-200 p-2 rounded">
                      <span className="font-medium">Row {error.row}:</span>{' '}
                      {error.field && <span className="text-muted-foreground">({error.field})</span>}{' '}
                      {error.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={validating || uploading}>
            Cancel
          </Button>
          <Button onClick={handleValidate} disabled={!selectedFile || validating || uploading}>
            {validating ? 'Validating...' : 'Validate & Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
