import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  AlertTriangle,
  Loader2,
  Eye,
  Settings,
  History,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

import {
  examTimetableService,
  ExamTimetable,
  ExamTimetableEntry,
  ExamTimetableStatus,
  TimetableApprovalStatus,
  UpdateTimetableData,
} from '@/services/examTimetable.service';
import { useAuthStore } from '@/stores/auth.store';
import ExamEntryExcelView, { ExamEntryRow } from '@/components/exams/ExamEntryExcelView';
import { TimetableEditDialog } from '@/components/exams/TimetableEditDialog';
import { extractTimeFromISO, combineDateTime, calculateEndTime } from '@/utils/timeUtils';

export default function ExamTimetableDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // State management
  const [timetable, setTimetable] = useState<ExamTimetable | null>(null);
  const [entries, setEntries] = useState<ExamTimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [statusUpdateDialogOpen, setStatusUpdateDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ExamTimetableStatus | "">("");

  // Memoized transformed entries for performance
  const transformedEntries = useMemo((): ExamEntryRow[] => {
    return entries.map(entry => {
      const roomIds = typeof entry.roomIds === 'string'
        ? JSON.parse(entry.roomIds)
        : (entry.roomIds || []);

      interface EntryWithRooms {
        rooms?: Array<{ id: number; name: string; capacity: number }>;
      }
      const rooms = (entry as EntryWithRooms).rooms || [];
      const roomNames = rooms.length > 0
        ? rooms.map(r => r.name).join(', ')
        : '';
      const roomCapacity = rooms.length > 0
        ? rooms.reduce((sum, r) => sum + r.capacity, 0)
        : entry.seatingCapacity || 0;

      return {
        id: entry.id.toString(),
        courseCode: entry.course?.code || '',
        courseId: entry.courseId,
        courseName: entry.course?.name || '',
        examDate: entry.examDate,
        startTime: extractTimeFromISO(entry.startTime),
        duration: entry.duration,
        venueName: entry.venue?.name || '',
        venueId: entry.venueId,
        venueLocation: entry.venue?.location || '',
        venueCapacity: entry.venue?.capacity,
        roomIds: roomIds.length > 0 ? roomIds.join(',') : undefined,
        roomNames: roomNames || undefined,
        roomCapacity: roomCapacity || undefined,
        level: entry.level?.toString() || '',
        notes: entry.notes || '',
        specialRequirements: entry.specialRequirements || '',
        isNew: false,
        isValid: true,
        errors: [],
        warnings: [],
      };
    });
  }, [entries]);

  useEffect(() => {
    if (id) {
      fetchTimetable();
      fetchEntries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchTimetable = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await examTimetableService.getTimetableById(parseInt(id));

      if (response.success && response.data) {
        setTimetable(response.data);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      toast.error('Failed to load timetable details');
      navigate('/admin/exams');
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async () => {
    if (!id) return;

    try {
      const response = await examTimetableService.getTimetableEntries(parseInt(id));

      if (response.success && Array.isArray(response.data)) {
        setEntries(response.data);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast.error('Failed to load timetable entries');
    }
  };

  const handleDeleteEntries = async (entryIds: number[]) => {
    if (!timetable?.id) return;

    try {
      setActionLoading(true);
      // Delete multiple entries
      await Promise.all(
        entryIds.map(entryId => examTimetableService.deleteTimetableEntry(timetable.id, entryId))
      );

      toast.success(`Successfully deleted ${entryIds.length} entries`);
      fetchEntries();
      fetchTimetable(); // Refresh to update totalExams count
    } catch (error) {
      console.error('Error deleting entries:', error);
      toast.error('Failed to delete some entries');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleSpreadsheetSave = async (rows: ExamEntryRow[]) => {
    if (!timetable?.id) return;

    try {
      const results = { success: 0, failed: 0, errors: [] as string[] };

      // Process each entry
      for (const row of rows) {
        try {
          // Skip invalid entries
          if (!row.isValid || !row.courseId || !row.examDate || !row.startTime || !row.venueId) {
            results.failed++;
            results.errors.push(`Invalid entry for ${row.courseCode || 'Unknown course'}: Missing required fields`);
            continue;
          }

          // Combine date and time into ISO datetime strings
          const startTimeISO = combineDateTime(row.examDate, row.startTime);
          if (!startTimeISO) {
            results.failed++;
            results.errors.push(`Invalid date/time for ${row.courseCode}: date=${row.examDate}, time=${row.startTime}`);
            continue;
          }

          const endTime = calculateEndTime(row.startTime, row.duration);
          const endTimeISO = combineDateTime(row.examDate, endTime);
          if (!endTimeISO) {
            results.failed++;
            results.errors.push(`Invalid end date/time for ${row.courseCode}: date=${row.examDate}, time=${endTime}`);
            continue;
          }

          const entryData = {
            courseId: row.courseId,
            programIds: [], // Default, can be enhanced later
            level: row.level ? parseInt(row.level) : undefined,
            examDate: row.examDate,
            startTime: startTimeISO,
            endTime: endTimeISO,
            duration: row.duration,
            venueId: row.venueId,
            roomIds: row.roomIds ? row.roomIds.split(',').map(id => parseInt(id.trim())) : [], // Parse room IDs
            invigilatorIds: [], // Default, can be enhanced later
            notes: row.notes,
            specialRequirements: row.specialRequirements,
          };

          // Check if this is a new entry or an existing one
          // New entries have IDs starting with 'new-' or are marked as isNew
          const isNewEntry = row.isNew || row.id.startsWith('new-') || row.id.startsWith('bulk-');

          if (!isNewEntry) {
            // Find the existing entry in our state to get the numeric ID
            const existingEntry = entries.find(e => e.id.toString() === row.id);
            if (existingEntry) {
              // Update existing entry
              await examTimetableService.updateTimetableEntry(timetable.id, existingEntry.id, entryData);
            } else {
              // Create new entry (in case we couldn't match)
              await examTimetableService.createTimetableEntry(timetable.id, entryData);
            }
          } else {
            // Create new entry
            await examTimetableService.createTimetableEntry(timetable.id, entryData);
          }

          results.success++;
        } catch (error) {
          results.failed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.errors.push(`Failed to save ${row.courseCode || 'Unknown course'}: ${errorMessage}`);
        }
      }

      // Show results
      if (results.success > 0) {
        toast.success(`Successfully saved ${results.success} entries`);
      }
      if (results.failed > 0) {
        toast.warning(`${results.failed} entries failed to save`);
        if (results.errors.length > 0) {
          console.error('Save errors:', results.errors);
        }
      }

      // Refresh data
      await fetchEntries();
      await fetchTimetable();
    } catch (error) {
      console.error('Error saving entries:', error);
      toast.error('Failed to save entries');
      throw error;
    }
  };

  const handlePublish = async () => {
    if (!timetable?.id) return;

    try {
      setActionLoading(true);
      const response = await examTimetableService.publishTimetable(timetable.id);

      if (response.data) {
        toast.success('Timetable published successfully');
        fetchTimetable();
      }
    } catch (error) {
      console.error('Error publishing timetable:', error);
      toast.error('Failed to publish timetable');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!timetable?.id) return;

    try {
      setActionLoading(true);
      const response = await examTimetableService.submitForApproval(
        timetable.id,
        'Submitting for approval'
      );

      if (response.data) {
        toast.success('Timetable submitted for approval');
        fetchTimetable();
      }
    } catch (error) {
      console.error('Error submitting for approval:', error);
      toast.error('Failed to submit for approval');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!timetable?.id) return;

    try {
      setActionLoading(true);
      const response = await examTimetableService.deleteTimetable(timetable.id);

      if (response.data) {
        toast.success('Timetable deleted successfully');
        navigate('/admin/exams');
      }
    } catch (error) {
      console.error('Error deleting timetable:', error);
      toast.error('Failed to delete timetable');
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  // Approval handlers
  const handleApprove = async () => {
    if (!timetable?.id) return;

    try {
      setActionLoading(true);
      const response = await examTimetableService.approveTimetable(timetable.id);

      if (response.success) {
        toast.success('Timetable approved successfully');
        fetchTimetable();
      } else {
        toast.error(response.message || 'Failed to approve timetable');
      }
    } catch (error) {
      console.error('Error approving timetable:', error);
      toast.error('Failed to approve timetable');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!timetable?.id || !rejectionReason.trim()) return;

    try {
      setActionLoading(true);
      const response = await examTimetableService.rejectTimetable(timetable.id, rejectionReason);

      if (response.success) {
        toast.success('Timetable rejected');
        fetchTimetable();
        setRejectDialogOpen(false);
        setRejectionReason("");
      } else {
        toast.error(response.message || 'Failed to reject timetable');
      }
    } catch (error) {
      console.error('Error rejecting timetable:', error);
      toast.error('Failed to reject timetable');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditTimetable = () => {
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (data: UpdateTimetableData) => {
    if (!timetable?.id) return;

    try {
      setActionLoading(true);
      const response = await examTimetableService.updateTimetable(timetable.id, data);

      if (response.success) {
        toast.success('Timetable updated successfully');
        fetchTimetable();
        setEditDialogOpen(false);
      } else {
        toast.error(response.message || 'Failed to update timetable');
      }
    } catch (error) {
      console.error('Error updating timetable:', error);
      toast.error('Failed to update timetable');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!timetable?.id || !selectedStatus) return;

    try {
      setActionLoading(true);
      const response = await examTimetableService.updateTimetableStatus(timetable.id, selectedStatus);

      if (response.success) {
        toast.success(`Timetable status updated to ${selectedStatus}`);
        fetchTimetable();
        setStatusUpdateDialogOpen(false);
        setSelectedStatus("");
      } else {
        toast.error(response.message || 'Failed to update timetable status');
      }
    } catch (error) {
      console.error('Error updating timetable status:', error);
      toast.error('Failed to update timetable status');
    } finally {
      setActionLoading(false);
    }
  };

  const getValidStatusTransitions = (currentStatus: ExamTimetableStatus): ExamTimetableStatus[] => {
    // Based on backend validation rules
    const transitions: Record<ExamTimetableStatus, ExamTimetableStatus[]> = {
      [ExamTimetableStatus.DRAFT]: [
        ExamTimetableStatus.PENDING_APPROVAL,
        ExamTimetableStatus.APPROVED,
        ExamTimetableStatus.PUBLISHED,
        ExamTimetableStatus.IN_PROGRESS,
        ExamTimetableStatus.COMPLETED,
        ExamTimetableStatus.ARCHIVED,
      ],
      [ExamTimetableStatus.PENDING_APPROVAL]: [
        ExamTimetableStatus.DRAFT,
        ExamTimetableStatus.APPROVED,
        ExamTimetableStatus.PUBLISHED,
        ExamTimetableStatus.IN_PROGRESS,
        ExamTimetableStatus.COMPLETED,
        ExamTimetableStatus.ARCHIVED,
      ],
      [ExamTimetableStatus.APPROVED]: [
        ExamTimetableStatus.DRAFT,
        ExamTimetableStatus.PENDING_APPROVAL,
        ExamTimetableStatus.PUBLISHED,
        ExamTimetableStatus.IN_PROGRESS,
        ExamTimetableStatus.COMPLETED,
        ExamTimetableStatus.ARCHIVED,
      ],
      [ExamTimetableStatus.PUBLISHED]: [
        ExamTimetableStatus.COMPLETED,
        ExamTimetableStatus.ARCHIVED,
      ],
      [ExamTimetableStatus.IN_PROGRESS]: [
        ExamTimetableStatus.COMPLETED,
        ExamTimetableStatus.ARCHIVED,
      ],
      [ExamTimetableStatus.COMPLETED]: [
        ExamTimetableStatus.ARCHIVED,
      ],
      [ExamTimetableStatus.ARCHIVED]: [], // Terminal state
    };

    return transitions[currentStatus] || [];
  };

  const getStatusOptions = () => {
    if (!timetable) return [];

    const validStatuses = getValidStatusTransitions(timetable.status);
    return validStatuses.map(status => ({
      value: status,
      label: status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
    }));
  };

  const getStatusBadge = (status: ExamTimetableStatus) => {
    const statusConfig = {
      [ExamTimetableStatus.DRAFT]: { variant: 'secondary' as const, icon: FileText, label: 'Draft' },
      [ExamTimetableStatus.PENDING_APPROVAL]: { variant: 'default' as const, icon: Clock, label: 'Pending Approval' },
      [ExamTimetableStatus.APPROVED]: { variant: 'default' as const, icon: CheckCircle, label: 'Approved' },
      [ExamTimetableStatus.PUBLISHED]: { variant: 'default' as const, icon: CheckCircle, label: 'Published' },
      [ExamTimetableStatus.IN_PROGRESS]: { variant: 'default' as const, icon: Clock, label: 'In Progress' },
      [ExamTimetableStatus.COMPLETED]: { variant: 'default' as const, icon: CheckCircle, label: 'Completed' },
      [ExamTimetableStatus.ARCHIVED]: { variant: 'secondary' as const, icon: FileText, label: 'Archived' },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1.5 px-3 py-1">
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </Badge>
    );
  };

  const getApprovalBadge = (approvalStatus: TimetableApprovalStatus) => {
    const statusConfig: Record<string, { variant: 'secondary' | 'default' | 'destructive'; icon: React.ElementType; label: string }> = {
      [TimetableApprovalStatus.NOT_SUBMITTED]: { variant: 'secondary', icon: FileText, label: 'Not Submitted' },
      [TimetableApprovalStatus.PENDING]: { variant: 'secondary', icon: Clock, label: 'Pending' },
      [TimetableApprovalStatus.APPROVED]: { variant: 'default', icon: CheckCircle, label: 'Approved' },
      [TimetableApprovalStatus.REJECTED]: { variant: 'destructive', icon: XCircle, label: 'Rejected' },
      [TimetableApprovalStatus.REVISION_REQUIRED]: { variant: 'default', icon: AlertTriangle, label: 'Revision Required' },
    };

    const config = statusConfig[approvalStatus] || statusConfig[TimetableApprovalStatus.NOT_SUBMITTED];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1.5 px-3 py-1">
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </Badge>
    );
  };

  // Permission checks
  const canEdit = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'EXAMS_OFFICER';
  const canDelete = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const canPublish = (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') &&
    timetable?.status === ExamTimetableStatus.APPROVED;
  const canSubmit = canEdit && timetable?.status === ExamTimetableStatus.DRAFT;
  const canApprove = (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'FACULTY_ADMIN') &&
    timetable?.approvalStatus === TimetableApprovalStatus.PENDING;
  const canUpdateStatus = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  if (loading) {
    return (
      <div className="container mx-auto p-4 lg:p-6">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-96" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>

          {/* Status Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-16" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Content Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!timetable) {
    return (
      <div className="container mx-auto p-4 lg:p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Timetable not found</h3>
            <p className="text-muted-foreground text-center mb-6">
              The timetable you're looking for doesn't exist or has been deleted
            </p>
            <Button onClick={() => navigate('/admin/exams')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Timetables
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/exams')}
            className="gap-2 w-fit -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Timetables
          </Button>
          <h1 className="text-2xl lg:text-3xl font-bold">{timetable.title}</h1>
          <p className="text-muted-foreground">
            {timetable.academicYear?.yearCode} - {timetable.semester?.name}
          </p>
          <div className="space-y-1">
            <div>
              <p className="font-medium">{timetable.institution?.name}</p>
              <p className="text-sm text-muted-foreground">{timetable.institution?.code}</p>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>{timetable.institution?.city}, {timetable.institution?.country}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canApprove && (
            <>
              <Button
                variant="default"
                onClick={handleApprove}
                disabled={actionLoading}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => setRejectDialogOpen(true)}
                disabled={actionLoading}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </>
          )}
          {canSubmit && (
            <Button
              variant="outline"
              onClick={handleSubmitForApproval}
              disabled={actionLoading}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Submit for Approval
            </Button>
          )}
          {canPublish && (
            <Button
              onClick={handlePublish}
              disabled={actionLoading}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Publish
            </Button>
          )}
          {canUpdateStatus && (
            <Button
              variant="outline"
              onClick={() => setStatusUpdateDialogOpen(true)}
              disabled={actionLoading}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Update Status
            </Button>
          )}
          {canEdit && (
            <Button
              variant="outline"
              onClick={handleEditTimetable}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={actionLoading}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Status and Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getStatusBadge(timetable.status)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Approval Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getApprovalBadge(timetable.approvalStatus)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Total Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{timetable.totalExams || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Conflicts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{timetable.totalConflicts || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="entries" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Exams ({timetable.totalExams || 0})
          </TabsTrigger>
          <TabsTrigger value="conflicts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Conflicts ({timetable.totalConflicts || 0})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details Card */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Details
                  </CardTitle>
                  <CardDescription>General information about this exam timetable</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <label className="text-sm font-medium text-muted-foreground">Academic Year</label>
                      </div>
                      <p className="text-sm font-medium">
                        {timetable.academicYear?.yearCode}
                        <span className="text-muted-foreground ml-2">
                          ({timetable.academicYear?.startDate && format(new Date(timetable.academicYear.startDate), 'yyyy')} -
                          {timetable.academicYear?.endDate && format(new Date(timetable.academicYear.endDate), 'yyyy')})
                        </span>
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <label className="text-sm font-medium text-muted-foreground">Semester</label>
                      </div>
                      <p className="text-sm font-medium">{timetable.semester?.name}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                      </div>
                      <p className="text-sm font-medium">
                        {timetable.startDate ? format(new Date(timetable.startDate), 'PPP') : 'N/A'}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <label className="text-sm font-medium text-muted-foreground">End Date</label>
                      </div>
                      <p className="text-sm font-medium">
                        {timetable.endDate ? format(new Date(timetable.endDate), 'PPP') : 'N/A'}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <label className="text-sm font-medium text-muted-foreground">Default Exam Duration</label>
                      </div>
                      <p className="text-sm font-medium">{timetable.defaultExamDuration || 180} minutes</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <label className="text-sm font-medium text-muted-foreground">Published</label>
                      </div>
                      <div>
                        {timetable.isPublished ? (
                          <Badge variant="default" className="gap-1.5">
                            <CheckCircle className="h-3 w-3" />
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1.5">
                            <XCircle className="h-3 w-3" />
                            No
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {timetable.description && (
                    <>
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                        <p className="text-sm leading-relaxed">{timetable.description}</p>
                      </div>
                      <Separator />
                    </>
                  )}

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">Configuration</label>
                    <div className="flex flex-wrap gap-3">
                      <Badge variant={timetable.allowOverlaps ? 'default' : 'secondary'} className="gap-1.5">
                        <Settings className="h-3 w-3" />
                        Allow Overlaps: {timetable.allowOverlaps ? 'Yes' : 'No'}
                      </Badge>
                      <Badge variant={timetable.autoResolveConflicts ? 'default' : 'secondary'} className="gap-1.5">
                        <AlertTriangle className="h-3 w-3" />
                        Auto-Resolve Conflicts: {timetable.autoResolveConflicts ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>

                  {timetable.publishedAt && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground">Published At</label>
                        <p className="text-sm font-medium">
                          {format(new Date(timetable.publishedAt), 'PPP p')}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Manage this exam timetable</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full gap-2 justify-start">
                    <Upload className="h-4 w-4" />
                    Import Exams
                  </Button>
                  <Button variant="outline" className="w-full gap-2 justify-start">
                    <Download className="h-4 w-4" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="w-full gap-2 justify-start">
                    <AlertTriangle className="h-4 w-4" />
                    Detect Conflicts
                  </Button>
                  <Button variant="outline" className="w-full gap-2 justify-start">
                    <Calendar className="h-4 w-4" />
                    Calendar View
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Entries Tab */}
        <TabsContent value="entries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Exam Entries
              </CardTitle>
              <CardDescription>
                Manage exam entries using the spreadsheet interface below. Add, edit, or remove exam entries for this timetable.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timetable && (
                <ExamEntryExcelView
                  timetableId={id!}
                  entries={transformedEntries}
                  onSave={handleSpreadsheetSave}
                  onDelete={handleDeleteEntries}
                  institutionId={timetable.institutionId?.toString()}
                  startDate={timetable.startDate}
                  endDate={timetable.endDate}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conflicts Tab */}
        <TabsContent value="conflicts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Scheduling Conflicts
              </CardTitle>
              <CardDescription>
                Detected scheduling conflicts and overlaps in the exam timetable
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timetable.totalConflicts === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Conflicts Detected</h3>
                  <p className="text-muted-foreground max-w-md">
                    Great! There are currently no scheduling conflicts in this exam timetable.
                    All exams are properly scheduled without overlaps.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Conflicts Detected</h3>
                  <p className="text-muted-foreground max-w-md mb-4">
                    There are {timetable.totalConflicts} scheduling conflicts that need to be resolved.
                  </p>
                  <Button variant="outline" className="gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    View Conflict Details
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Activity History
              </CardTitle>
              <CardDescription>
                Timeline of changes, approvals, and modifications to this exam timetable
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">History Timeline</h3>
                <p className="text-muted-foreground max-w-md">
                  Activity history and audit trail will be displayed here, showing all changes,
                  approvals, and modifications made to this timetable.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the exam timetable
              and all associated exam entries.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {/* Reject Timetable Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reject Timetable</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this timetable. This will be recorded for audit purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason("");
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason.trim()}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject Timetable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Timetable Dialog */}
      {timetable && (
        <TimetableEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          timetable={timetable}
          onSubmit={handleEditSubmit}
          loading={actionLoading}
        />
      )}

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateDialogOpen} onOpenChange={setStatusUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Timetable Status</DialogTitle>
            <DialogDescription>
              Change the status of this exam timetable. Only valid status transitions are allowed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">New Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as ExamTimetableStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {getStatusOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {timetable && (
              <div className="text-sm text-muted-foreground">
                Current status: <span className="font-medium">{getStatusBadge(timetable.status)}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStatusUpdateDialogOpen(false);
                setSelectedStatus("");
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleStatusUpdate}
              disabled={actionLoading || !selectedStatus}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
