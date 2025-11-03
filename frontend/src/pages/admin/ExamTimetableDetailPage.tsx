import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
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
  examTimetableService,
  ExamTimetable,
  ExamTimetableEntry,
  ExamTimetableStatus,
  TimetableApprovalStatus,
  CreateTimetableEntryData,
} from '@/services/examTimetable.service';
import { useAuthStore } from '@/stores/auth.store';
import { TimetableEntryList } from '@/components/exams/TimetableEntryList';
import { TimetableEntryForm } from '@/components/exams/TimetableEntryForm';
import { BulkUploadEntries } from '@/components/exams/BulkUploadEntries';

export default function ExamTimetableDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [timetable, setTimetable] = useState<ExamTimetable | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Entry management state
  const [entries, setEntries] = useState<ExamTimetableEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [entryFormOpen, setEntryFormOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ExamTimetableEntry | null>(null);
  const [deleteEntryDialogOpen, setDeleteEntryDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<ExamTimetableEntry | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  // Fetch timetable entries
  const fetchEntries = async () => {
    if (!id) return;

    try {
      setEntriesLoading(true);
      const response = await examTimetableService.getTimetableEntries(parseInt(id));

      if (response.success && Array.isArray(response.data)) {
        setEntries(response.data);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast.error('Failed to load timetable entries');
    } finally {
      setEntriesLoading(false);
    }
  };

  // Entry management handlers
  const handleAddEntry = () => {
    setSelectedEntry(null);
    setEntryFormOpen(true);
  };

  const handleEditEntry = (entry: ExamTimetableEntry) => {
    setSelectedEntry(entry);
    setEntryFormOpen(true);
  };

  const handleDeleteEntry = (entry: ExamTimetableEntry) => {
    setEntryToDelete(entry);
    setDeleteEntryDialogOpen(true);
  };

  const confirmDeleteEntry = async () => {
    if (!entryToDelete || !timetable?.id) return;

    try {
      setActionLoading(true);
      await examTimetableService.deleteTimetableEntry(timetable.id, entryToDelete.id);

      toast.success('Entry deleted successfully');
      fetchEntries();
      fetchTimetable(); // Refresh to update totalExams count
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    } finally {
      setActionLoading(false);
      setDeleteEntryDialogOpen(false);
      setEntryToDelete(null);
    }
  };

  const handleEntrySubmit = async (data: CreateTimetableEntryData) => {
    if (!timetable?.id) return;

    if (selectedEntry) {
      // Update existing entry
      await examTimetableService.updateTimetableEntry(timetable.id, selectedEntry.id, data);
    } else {
      // Create new entry
      await examTimetableService.createTimetableEntry(timetable.id, data);
    }

    await fetchEntries();
    await fetchTimetable(); // Refresh to update totalExams count
  };

  const handleBulkUpload = () => {
    setUploadDialogOpen(true);
  };

  const handleUploadComplete = async () => {
    await fetchEntries();
    await fetchTimetable();
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
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getApprovalBadge = (approvalStatus: TimetableApprovalStatus) => {
    type StatusConfigType = {
      variant: 'secondary' | 'default' | 'destructive';
      icon: React.ElementType;
      label: string;
    };

    const statusConfig: Record<string, StatusConfigType> = {
      [TimetableApprovalStatus.NOT_SUBMITTED]: { variant: 'secondary', icon: FileText, label: 'Not Submitted' },
      [TimetableApprovalStatus.PENDING]: { variant: 'secondary', icon: Clock, label: 'Pending' },
      [TimetableApprovalStatus.APPROVED]: { variant: 'default', icon: CheckCircle, label: 'Approved' },
      [TimetableApprovalStatus.REJECTED]: { variant: 'destructive', icon: XCircle, label: 'Rejected' },
      [TimetableApprovalStatus.REVISION_REQUIRED]: { variant: 'default', icon: AlertTriangle, label: 'Revision Required' },
    };

    const config = statusConfig[approvalStatus] || statusConfig[TimetableApprovalStatus.NOT_SUBMITTED];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!timetable) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Timetable not found</h3>
            <p className="text-muted-foreground text-center mb-6">
              The timetable you're looking for doesn't exist or has been deleted
            </p>
            <Button onClick={() => navigate('/admin/exams')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Timetables
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canEdit = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'EXAMS_OFFICER';
  const canDelete = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const canPublish = (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') &&
    timetable.status === ExamTimetableStatus.APPROVED;
  const canSubmit = canEdit && timetable.status === ExamTimetableStatus.DRAFT;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/exams')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold">{timetable.title}</h1>
          <p className="text-muted-foreground">
            {timetable.academicYear?.yearCode} - {timetable.semester?.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
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
          {canEdit && (
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/exams/${timetable.id}?edit=true`)}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            {getStatusBadge(timetable.status)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approval Status</CardTitle>
          </CardHeader>
          <CardContent>
            {getApprovalBadge(timetable.approvalStatus)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{timetable.totalExams || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conflicts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{timetable.totalConflicts || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="entries">
            Exams ({timetable.totalExams || 0})
          </TabsTrigger>
          <TabsTrigger value="conflicts">
            Conflicts ({timetable.totalConflicts || 0})
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>General information about this exam timetable</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Academic Year</label>
                  <p className="text-sm">
                    {timetable.academicYear?.yearCode} (
                    {timetable.academicYear?.startDate && format(new Date(timetable.academicYear.startDate), 'yyyy')} -{' '}
                    {timetable.academicYear?.endDate && format(new Date(timetable.academicYear.endDate), 'yyyy')})
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Semester</label>
                  <p className="text-sm">{timetable.semester?.name}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Start Date
                  </label>
                  <p className="text-sm">
                    {timetable.startDate ? format(new Date(timetable.startDate), 'PPP') : 'N/A'}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    End Date
                  </label>
                  <p className="text-sm">
                    {timetable.endDate ? format(new Date(timetable.endDate), 'PPP') : 'N/A'}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Default Exam Duration
                  </label>
                  <p className="text-sm">{timetable.defaultExamDuration || 180} minutes</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Published</label>
                  <p className="text-sm">
                    {timetable.isPublished ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        No
                      </Badge>
                    )}
                  </p>
                </div>
              </div>

              <Separator />

              {timetable.description && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm">{timetable.description}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Configuration</label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={timetable.allowOverlaps ? 'default' : 'secondary'}>
                      Allow Overlaps: {timetable.allowOverlaps ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={timetable.autoResolveConflicts ? 'default' : 'secondary'}>
                      Auto-Resolve Conflicts: {timetable.autoResolveConflicts ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>

              {timetable.publishedAt && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Published At</label>
                  <p className="text-sm">
                    {format(new Date(timetable.publishedAt), 'PPP p')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Manage this exam timetable</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Import Exams
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Detect Conflicts
              </Button>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                Calendar View
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Entries Tab */}
        <TabsContent value="entries">
          <Card>
            <CardHeader>
              <CardTitle>Exam Entries</CardTitle>
              <CardDescription>All scheduled exams in this timetable</CardDescription>
            </CardHeader>
            <CardContent>
              <TimetableEntryList
                entries={entries}
                loading={entriesLoading}
                onAddEntry={handleAddEntry}
                onBulkUpload={handleBulkUpload}
                onEditEntry={handleEditEntry}
                onDeleteEntry={handleDeleteEntry}
                canEdit={timetable?.status === 'DRAFT' && user?.role !== 'STUDENT'}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conflicts Tab */}
        <TabsContent value="conflicts">
          <Card>
            <CardHeader>
              <CardTitle>Conflicts</CardTitle>
              <CardDescription>Detected scheduling conflicts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Conflict viewer component coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
              <CardDescription>Timeline of changes and approvals</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                History timeline component coming soon...
              </p>
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

      {/* Delete Entry Confirmation Dialog */}
      <AlertDialog open={deleteEntryDialogOpen} onOpenChange={setDeleteEntryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the exam entry for{' '}
              <strong>{entryToDelete?.course?.code}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEntry}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Entry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Entry Form Dialog */}
      {timetable && (
        <TimetableEntryForm
          open={entryFormOpen}
          onOpenChange={setEntryFormOpen}
          timetableId={timetable.id}
          timetableStartDate={new Date(timetable.startDate)}
          timetableEndDate={new Date(timetable.endDate)}
          defaultDuration={timetable.defaultExamDuration}
          institutionId={timetable.institutionId}
          entry={selectedEntry}
          onSubmit={handleEntrySubmit}
        />
      )}

      {/* Bulk Upload Dialog */}
      {timetable && (
        <BulkUploadEntries
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          timetableId={timetable.id}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </div>
  );
}
