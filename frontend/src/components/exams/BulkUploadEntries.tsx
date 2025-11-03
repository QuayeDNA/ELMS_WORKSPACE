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
  onUploadComplete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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

      // TODO: Implement actual upload to backend
      // For now, show a placeholder message
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success('Bulk upload functionality will be implemented shortly');

      onUploadComplete();
      handleClose();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload entries. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV template
    const headers = [
      'courseCode',
      'examDate',
      'startTime',
      'duration',
      'venueCode',
      'level',
      'notes',
      'specialRequirements',
    ];

    const sampleData = [
      [
        'CSC101',
        '2024-05-15',
        '09:00',
        '180',
        'HALL-A',
        '100',
        'First semester exam',
        'Calculator required',
      ],
      [
        'CSC201',
        '2024-05-16',
        '14:00',
        '120',
        'HALL-B',
        '200',
        '',
        '',
      ],
    ];

    const csvContent = [
      headers.join(','),
      ...sampleData.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'exam-entries-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Template downloaded successfully');
  };

  const handleClose = () => {
    setSelectedFile(null);
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
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Download the template file and fill it with your exam entries
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
              The file must contain columns: courseCode, examDate, startTime, duration, venueCode, level (optional), notes (optional), specialRequirements (optional).
            </AlertDescription>
          </Alert>
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
