import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Package,
  TrendingUp,
  AlertCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { batchScriptService } from '@/services/batchScript.service';
import { BatchStatus } from '@/types/batchScript';
import { format } from 'date-fns';

export function ScriptSubmissionOversightPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BatchStatus | 'ALL'>('ALL');

  // Fetch batch scripts
  const { data: batchesData, isLoading: batchesLoading, refetch: refetchBatches } = useQuery({
    queryKey: ['batch-scripts', statusFilter],
    queryFn: async () => {
      const response = await batchScriptService.getBatchScripts({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        page: 1,
        limit: 50,
      });
      return response;
    },
  });

  // Fetch pending batches
  const { data: pendingBatchesData } = useQuery({
    queryKey: ['pending-batches'],
    queryFn: async () => {
      const response = await batchScriptService.getPendingAssignment();
      return response;
    },
  });

  const batches = batchesData?.data || [];
  const pendingBatches = pendingBatchesData?.data || [];

  // Calculate overview statistics
  const totalBatches = batches.length;
  const totalScripts = batches.reduce((sum, b) => sum + b.totalScripts, 0);
  const submittedScripts = batches.reduce((sum, b) => sum + b.submittedCount, 0);
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

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.course?.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.course?.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Script Submission Oversight</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage script submissions across all exams
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchBatches()}>
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
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBatches}</div>
            <p className="text-xs text-muted-foreground">
              {pendingBatches.length} pending assignment
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
              Across all exam entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted Scripts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submittedScripts}</div>
            <p className="text-xs text-muted-foreground">
              {submissionRate}% submission rate
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
              Yet to be submitted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">All Batches</TabsTrigger>
          <TabsTrigger value="pending">
            Pending Assignment ({pendingBatches.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Script Batches</CardTitle>
                  <CardDescription>
                    View and manage all script submission batches
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search batches..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-[250px]"
                    />
                  </div>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as BatchStatus | 'ALL')}
                  >
                    <SelectTrigger className="w-[150px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="SEALED">Sealed</SelectItem>
                      <SelectItem value="ASSIGNED">Assigned</SelectItem>
                      <SelectItem value="GRADING">Grading</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {batchesLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading batches...</p>
                </div>
              ) : filteredBatches.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No batches found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? 'Try adjusting your search or filters'
                      : 'Script batches will appear here once exams are conducted'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch Number</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Exam Date</TableHead>
                      <TableHead>Scripts</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBatches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-medium">
                          {batch.batchNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{batch.course?.code}</div>
                            <div className="text-sm text-muted-foreground">
                              {batch.course?.title}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {batch.examEntry?.date
                            ? format(new Date(batch.examEntry.date), 'MMM dd, yyyy')
                            : 'N/A'}
                        </TableCell>
                        <TableCell>{batch.totalScripts}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{batch.submittedCount}</span>
                            <Badge
                              variant={
                                batch.submittedCount === batch.totalScripts
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {batch.totalScripts > 0
                                ? `${((batch.submittedCount / batch.totalScripts) * 100).toFixed(0)}%`
                                : '0%'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {batch.assignedTo ? (
                            <div>
                              <div className="text-sm">
                                {batch.assignedTo.firstName} {batch.assignedTo.lastName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {batch.assignedTo.email}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(batch.status)}>
                            {batch.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/scripts/${batch.id}`)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batches Pending Assignment</CardTitle>
              <CardDescription>
                These batches need to be assigned to lecturers for grading
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingBatches.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No pending batches</h3>
                  <p className="text-muted-foreground">
                    All sealed batches have been assigned
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingBatches.map((batch) => (
                    <div
                      key={batch.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{batch.batchNumber}</h4>
                        <p className="text-sm text-muted-foreground">
                          {batch.course?.code} - {batch.course?.title}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm">
                            {batch.submittedCount} / {batch.totalScripts} scripts
                          </span>
                          <Badge className={getStatusColor(batch.status)}>
                            {batch.status}
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm">Assign Lecturer</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batches In Progress</CardTitle>
              <CardDescription>
                Scripts are currently being submitted for these batches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Filter showing batches with IN_PROGRESS status
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Batches</CardTitle>
              <CardDescription>
                All scripts submitted and grading completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Filter showing batches with COMPLETED status
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ScriptSubmissionOversightPage;
