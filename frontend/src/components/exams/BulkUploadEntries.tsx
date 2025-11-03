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
import { examTimetableService, BulkUploadResult } from '@/services/examTimetable.service';

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
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

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

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setUploadResult(null);

      // Upload the file
      const response = await examTimetableService.uploadBulkEntries(timetableId, selectedFile);

      setUploadResult(response.result);

      // Show results
      if (response.result.successCount > 0) {
        toast.success(
          `Successfully uploaded ${response.result.successCount} of ${response.result.totalRows} entries`
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
      }
    } catch (error: unknown) {
      console.error('Error uploading file:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload entries. Please try again.'
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
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Upload Exam Entries</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to add multiple exam entries at once
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
              {downloadingTemplate ? 'Downloading...' : 'Download Dynamic Template'}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Download an Excel template with course and venue dropdowns pre-filled from your institution's data
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
              <strong>Template Features:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Dropdown menus for Course Codes (from your institution)</li>
                <li>Dropdown menus for Venue Codes (from your institution)</li>
                <li>Auto-fill for Course Names and Venue Names</li>
                <li>Built-in validation and instructions</li>
                <li>Sample data to guide you</li>
              </ul>
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
          <Button variant="outline" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
            {uploading ? 'Uploading...' : 'Upload Entries'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
