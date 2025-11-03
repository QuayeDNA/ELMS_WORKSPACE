import { format } from 'date-fns';
import { Plus, Upload, MoreVertical, Edit, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ExamTimetableEntry, ExamTimetableEntryStatus } from '@/services/examTimetable.service';
import { cn } from '@/lib/utils';

// ========================================
// TYPES
// ========================================

interface TimetableEntryListProps {
  entries: ExamTimetableEntry[];
  loading?: boolean;
  onAddEntry: () => void;
  onBulkUpload: () => void;
  onEditEntry: (entry: ExamTimetableEntry) => void;
  onDeleteEntry: (entry: ExamTimetableEntry) => void;
  canEdit?: boolean;
}

// ========================================
// STATUS BADGE
// ========================================

const getStatusColor = (status: ExamTimetableEntryStatus): string => {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'SCHEDULED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'COMPLETED':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// ========================================
// COMPONENT
// ========================================

export const TimetableEntryList: React.FC<TimetableEntryListProps> = ({
  entries,
  loading = false,
  onAddEntry,
  onBulkUpload,
  onEditEntry,
  onDeleteEntry,
  canEdit = true,
}) => {
  return (
    <div className="space-y-4">
      {/* Actions Toolbar */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </div>

        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onBulkUpload} className="gap-2">
              <Upload className="h-4 w-4" />
              Bulk Upload
            </Button>
            <Button size="sm" onClick={onAddEntry} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
          </div>
        )}
      </div>

      {/* Entries Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading entries...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Exam Entries</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add exam entries to schedule exams in this timetable
          </p>
          {canEdit && (
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={onBulkUpload} className="gap-2">
                <Upload className="h-4 w-4" />
                Upload CSV
              </Button>
              <Button onClick={onAddEntry} className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Entry
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                {canEdit && <TableHead className="w-[50px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  {/* Course */}
                  <TableCell>
                    <div>
                      <div className="font-medium">{entry.course?.code}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {entry.course?.name}
                      </div>
                    </div>
                  </TableCell>

                  {/* Date & Time */}
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {format(new Date(entry.examDate), 'dd MMM yyyy')}
                      </div>
                      <div className="text-muted-foreground">
                        {format(new Date(entry.startTime), 'hh:mm a')} -{' '}
                        {format(new Date(entry.endTime), 'hh:mm a')}
                      </div>
                    </div>
                  </TableCell>

                  {/* Duration */}
                  <TableCell>
                    <span className="text-sm">{entry.duration} mins</span>
                  </TableCell>

                  {/* Venue */}
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{entry.venue?.name}</div>
                      {entry.roomIds.length > 0 && (
                        <div className="text-muted-foreground">
                          {entry.roomIds.length} {entry.roomIds.length === 1 ? 'room' : 'rooms'}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Level */}
                  <TableCell>
                    {entry.level ? (
                      <Badge variant="outline">{entry.level} Level</Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  {/* Students */}
                  <TableCell>
                    {entry.studentCount ? (
                      <span className="text-sm">{entry.studentCount}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge variant="outline" className={cn('border', getStatusColor(entry.status))}>
                      {entry.status}
                    </Badge>
                    {entry.hasConflicts && (
                      <Badge variant="destructive" className="ml-2">
                        Conflict
                      </Badge>
                    )}
                  </TableCell>

                  {/* Actions */}
                  {canEdit && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditEntry(entry)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDeleteEntry(entry)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
