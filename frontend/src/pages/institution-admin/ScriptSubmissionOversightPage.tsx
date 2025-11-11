import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Package,
  Calendar,
  AlertCircle,
  Download,
  RefreshCw,
  ChevronRight,
  Clock,
  MapPin,
  PackagePlus,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import { SearchAndFilter, FilterGroup } from '@/components/shared/SearchAndFilter';
import { examTimetableService, ExamTimetableEntry } from '@/services/examTimetable.service';
import { BatchStatus, BatchScript } from '@/types/batchScript';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function ScriptSubmissionOversightPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimetable, setSelectedTimetable] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<BatchStatus | 'ALL'>('ALL');
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [selectedTimetableForBatch, setSelectedTimetableForBatch] = useState<number | null>(null);

  // Mutation for creating batches
  const createBatchesMutation = useMutation({
    mutationFn: (timetableId: number) => examTimetableService.createBatchScripts(timetableId),
    onSuccess: (data) => {
      toast.success(data.message || 'Batch scripts created successfully');
      // Refetch data
      queryClient.invalidateQueries({ queryKey: ['published-timetables'] });
      setShowBatchDialog(false);
      setSelectedTimetableForBatch(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create batch scripts');
    },
  });

  // Fetch published exam timetables with their entries and batches
  const { data: timetablesData, refetch: refetchTimetables } = useQuery({
    queryKey: ['published-timetables'],
    queryFn: async () => {
      const response = await examTimetableService.getPublishedTimetables();
      return response;
    },
  });

  const timetables = timetablesData?.data || [];

  // Debug logging
  console.log('📊 Timetables:', timetables.length, timetables);

  // Extract all batches from timetable entries for statistics
  const allBatches = timetables.flatMap(t =>
    (t.entries || t.examEntries || []).flatMap(e => e.batchScripts || e.batches || [])
  );
  console.log('� Batches from entries:', allBatches.length, allBatches);

  // Define entry with batches type
  type EntryWithBatches = ExamTimetableEntry & {
    batches: BatchScript[];
  };

  // Group batches by timetable and exam entry
  const groupedData = timetables
    .filter(timetable =>
      selectedTimetable === 'all' || timetable.id.toString() === selectedTimetable
    )
    .map(timetable => {
      // Get exam entries for this timetable, sorted by date and time
      // Backend returns 'entries' not 'examEntries'
      const entries = (timetable.examEntries || timetable.entries || [])
        .sort((a, b) => {
          const dateCompare = new Date(a.examDate).getTime() - new Date(b.examDate).getTime();
          if (dateCompare !== 0) return dateCompare;
          return a.startTime.localeCompare(b.startTime);
        });

      // Map entries with their batches (already included in the entries from backend)
      const entriesWithBatches: EntryWithBatches[] = entries.map(entry => {
        // Use batchScripts from the entry (already included by backend)
        const entryBatches = (entry.batchScripts || entry.batches || [])
          .filter(batch => {
            // Apply status filter
            if (statusFilter === 'ALL') return true;
            return batch.status === statusFilter;
          });
        return {
          ...entry,
          batches: entryBatches,
        };
      }).filter(entry => {
        // Filter by search term
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
          entry.course?.code.toLowerCase().includes(searchLower) ||
          entry.course?.name.toLowerCase().includes(searchLower) ||
          entry.batches.some(b => b.batchNumber.toLowerCase().includes(searchLower))
        );
      });

      return {
        ...timetable,
        entries: entriesWithBatches,
      };
    })
    // Only filter out timetables with no entries if there's an active search term
    // Otherwise, show all timetables so users can create batches
    .filter(timetable => !searchTerm || timetable.entries.length > 0);

  // Calculate overview statistics
  const totalTimetables = timetables.length;
  const totalBatches = allBatches.length;
  const totalScripts = allBatches.reduce((sum, b) => sum + (b.totalRegistered || 0), 0);
  const submittedScripts = allBatches.reduce((sum, b) => sum + (b.scriptsSubmitted || 0), 0);
  const submissionRate = totalScripts > 0 ? ((submittedScripts / totalScripts) * 100).toFixed(1) : '0';

  const getStatusColor = (status: BatchStatus) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      SEALED: 'bg-purple-100 text-purple-800',
      ASSIGNED: 'bg-indigo-100 text-indigo-800',
      GRADING: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Filter groups for SearchAndFilter component
  const filterGroups: FilterGroup[] = [
    {
      id: 'timetable',
      label: 'Exam Timetable',
      type: 'select',
      value: selectedTimetable,
      onChange: (value) => setSelectedTimetable(value as string),
      options: [
        { label: 'All Timetables', value: 'all' },
        ...timetables.map(t => ({
          label: `${t.title} (${t.academicPeriod?.name || t.semester?.name || 'N/A'})`,
          value: t.id.toString(),
        })),
      ],
    },
    {
      id: 'status',
      label: 'Batch Status',
      type: 'select',
      value: statusFilter,
      onChange: (value) => setStatusFilter(value as BatchStatus | 'ALL'),
      options: [
        { label: 'All Status', value: 'ALL' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'Sealed', value: 'SEALED' },
        { label: 'Assigned', value: 'ASSIGNED' },
        { label: 'Grading', value: 'GRADING' },
        { label: 'Completed', value: 'COMPLETED' },
      ],
    },
  ];

  const handleRefresh = () => {
    refetchTimetables();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Script Batch Overview</h1>
          <p className="text-muted-foreground mt-2">
            View and manage script batches from published exam timetables
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Timetables</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTimetables}</div>
            <p className="text-xs text-muted-foreground">
              Active exam timetables
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBatches}</div>
            <p className="text-xs text-muted-foreground">
              Script batches created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scripts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScripts}</div>
            <p className="text-xs text-muted-foreground">
              {submittedScripts} submitted ({submissionRate}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Scripts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScripts - submittedScripts}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting submission
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <SearchAndFilter
        searchPlaceholder="Search by course, batch number..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filterGroups={filterGroups}
        showSort={false}
      />

      {/* Timetables and Batches List */}
      <Card>
        <CardHeader>
          <CardTitle>Exam Timetables & Script Batches</CardTitle>
          <CardDescription>
            Batches are organized by timetable and exam entry, in chronological order
          </CardDescription>
        </CardHeader>
        <CardContent>
          {timetables.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading timetables...</p>
            </div>
          ) : groupedData.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No batches found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'Try adjusting your search or filters'
                  : selectedTimetable !== 'all'
                  ? 'No batches found for the selected timetable'
                  : 'Script batches will appear here once exam timetables are published'}
              </p>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-4">
              {groupedData.map((timetable) => (
                <AccordionItem
                  key={timetable.id}
                  value={`timetable-${timetable.id}`}
                  className="border rounded-lg px-4"
                >
                  <div className="flex items-center justify-between py-4">
                    <AccordionTrigger className="hover:no-underline flex-1">
                      <div className="flex items-center gap-4">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <div className="text-left">
                          <h3 className="font-semibold text-base">{timetable.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {timetable.academicPeriod?.name || timetable.semester?.name} • {timetable.entries?.length || 0} exam entries
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant={timetable.entries?.reduce((sum: number, e) => sum + (e.batches?.length || 0), 0) === 0 ? "default" : "outline"}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTimetableForBatch(timetable.id);
                          setShowBatchDialog(true);
                        }}
                        disabled={createBatchesMutation.isPending}
                      >
                        <PackagePlus className="w-4 h-4 mr-2" />
                        {timetable.entries?.reduce((sum: number, e) => sum + (e.batches?.length || 0), 0) === 0
                          ? 'Create Batches'
                          : 'Add More Batches'}
                      </Button>
                      <Badge variant="outline">
                        {timetable.entries?.reduce((sum: number, e) => sum + (e.batches?.length || 0), 0) || 0} batches
                      </Badge>
                      <Badge variant={timetable.isPublished ? 'default' : 'secondary'}>
                        {timetable.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  </div>
                  <AccordionContent className="pt-4">
                    <div className="space-y-4">
                      {timetable.entries.map((entry) => (
                        <div key={entry.id} className="border rounded-lg p-4 space-y-3">
                          {/* Exam Entry Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <FileText className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium">
                                  {entry.course?.code} - {entry.course?.name}
                                </h4>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(entry.examDate), 'MMM dd, yyyy')}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {entry.startTime} - {entry.endTime}
                                  </span>
                                  {entry.venue && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {entry.venue.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {entry.batches.length} {entry.batches.length === 1 ? 'batch' : 'batches'}
                            </Badge>
                          </div>

                          {/* Batches for this Entry */}
                          {entry.batches.length === 0 ? (
                            <div className="text-center py-6 bg-muted/50 rounded-lg">
                              <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">
                                No batches created yet
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {entry.batches.map((batch) => (
                                <div
                                  key={batch.id}
                                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                                  onClick={() => navigate(`/admin/scripts/batch/${batch.id}`)}
                                >
                                  <div className="flex items-center gap-3">
                                    <Package className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                      <p className="font-medium text-sm">{batch.batchNumber}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {batch.submittedCount} / {batch.totalScripts} scripts submitted
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {batch.assignedTo && (
                                      <div className="text-xs text-muted-foreground">
                                        Assigned to: {batch.assignedTo.firstName} {batch.assignedTo.lastName}
                                      </div>
                                    )}
                                    <Badge className={getStatusColor(batch.status)}>
                                      {batch.status}
                                    </Badge>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Batch Creation Confirmation Dialog */}
      <AlertDialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Batch Scripts</AlertDialogTitle>
            <AlertDialogDescription>
              This will create batch scripts for all exam entries in the selected timetable.
              Batches that already exist will be skipped. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={createBatchesMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedTimetableForBatch) {
                  createBatchesMutation.mutate(selectedTimetableForBatch);
                }
              }}
              disabled={createBatchesMutation.isPending}
            >
              {createBatchesMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Create Batches
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ScriptSubmissionOversightPage;
