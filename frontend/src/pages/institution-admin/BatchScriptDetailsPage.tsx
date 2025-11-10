import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  FileText,
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { scriptSubmissionService } from '@/services/scriptSubmission.service';
import { BatchStatus, ScriptStatus } from '@/types/batchScript';
import { format } from 'date-fns';

export function BatchScriptDetailsPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch batch details
  const { data: batchData, isLoading: batchLoading } = useQuery({
    queryKey: ['batch-script', batchId],
    queryFn: async () => {
      if (!batchId) throw new Error('Batch ID required');
      const response = await batchScriptService.getBatchScriptById(parseInt(batchId));
      return response;
    },
    enabled: !!batchId,
  });

  // Fetch batch statistics
  const { data: statsData } = useQuery({
    queryKey: ['batch-statistics', batchId],
    queryFn: async () => {
      if (!batchId) throw new Error('Batch ID required');
      const response = await batchScriptService.getBatchStatistics(parseInt(batchId));
      return response;
    },
    enabled: !!batchId,
  });

  // Fetch submission history
  const { data: historyData } = useQuery({
    queryKey: ['submission-history', batchId],
    queryFn: async () => {
      if (!batchId) throw new Error('Batch ID required');
      const response = await scriptSubmissionService.getBatchSubmissionHistory(
        parseInt(batchId)
      );
      return response;
    },
    enabled: !!batchId,
  });

  const batch = batchData?.data;
  const stats = statsData?.data;
  const history = historyData?.data || [];

  const getStatusColor = (status: BatchStatus | ScriptStatus) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      SEALED: 'bg-purple-100 text-purple-800',
      ASSIGNED: 'bg-indigo-100 text-indigo-800',
      GRADING: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-green-100 text-green-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      VERIFIED: 'bg-green-100 text-green-800',
      GRADING_IN_PROGRESS: 'bg-orange-100 text-orange-800',
      GRADED: 'bg-purple-100 text-purple-800',
      REVIEWED: 'bg-indigo-100 text-indigo-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (batchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading batch details...</p>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Batch not found</h3>
            <p className="text-muted-foreground">
              The requested batch script could not be found
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{batch.batchNumber}</h1>
            <p className="text-muted-foreground mt-1">
              {batch.course?.code} - {batch.course?.title}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Badge className={getStatusColor(batch.status)}>
            {batch.status}
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scripts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalScripts || batch.totalScripts}</div>
            <p className="text-xs text-muted-foreground">
              Expected scripts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.submittedCount || batch.submittedCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.submissionRate || 0}% submission rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingCount || (batch.totalScripts - batch.submittedCount)}</div>
            <p className="text-xs text-muted-foreground">
              Yet to submit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graded</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.gradedCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Grading complete
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">Submissions ({history.length})</TabsTrigger>
          <TabsTrigger value="registrations">Registered Students</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Batch Information */}
            <Card>
              <CardHeader>
                <CardTitle>Batch Information</CardTitle>
                <CardDescription>Details about this script batch</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Batch Number</span>
                  </div>
                  <span className="text-sm">{batch.batchNumber}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Exam Date</span>
                  </div>
                  <span className="text-sm">
                    {batch.examEntry?.date
                      ? format(new Date(batch.examEntry.date), 'MMM dd, yyyy')
                      : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Exam Time</span>
                  </div>
                  <span className="text-sm">
                    {batch.examEntry?.startTime} - {batch.examEntry?.endTime}
                  </span>
                </div>

                {batch.assignedTo && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Assigned To</span>
                    </div>
                    <div className="text-sm text-right">
                      <div>{batch.assignedTo.firstName} {batch.assignedTo.lastName}</div>
                      <div className="text-xs text-muted-foreground">
                        {batch.assignedTo.email}
                      </div>
                    </div>
                  </div>
                )}

                {batch.sealedAt && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Sealed At</span>
                    </div>
                    <span className="text-sm">
                      {format(new Date(batch.sealedAt), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submission Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Submission Timeline</CardTitle>
                <CardDescription>Script submission progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats?.firstSubmission && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">First Submission</span>
                    <span className="text-sm">
                      {format(new Date(stats.firstSubmission), 'MMM dd, HH:mm')}
                    </span>
                  </div>
                )}

                {stats?.lastSubmission && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Submission</span>
                    <span className="text-sm">
                      {format(new Date(stats.lastSubmission), 'MMM dd, HH:mm')}
                    </span>
                  </div>
                )}

                {stats?.averageSubmissionTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg Submission Time</span>
                    <span className="text-sm">
                      {Math.round(stats.averageSubmissionTime)} minutes
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="text-sm font-medium mb-2">Status Distribution</div>
                  <div className="space-y-2">
                    {stats?.scriptsByStatus && Object.entries(stats.scriptsByStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <Badge className={getStatusColor(status as ScriptStatus)}>
                          {status}
                        </Badge>
                        <span className="text-sm">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submission History</CardTitle>
              <CardDescription>
                Chronological list of all script submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No submissions yet</h3>
                  <p className="text-muted-foreground">
                    Scripts will appear here as they are submitted
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Script Number</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Submitted At</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((submission) => (
                      <TableRow key={submission.scriptId}>
                        <TableCell className="font-medium">
                          {submission.scriptNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{submission.studentName}</div>
                            <div className="text-sm text-muted-foreground">
                              {submission.studentNumber}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(submission.submittedAt), 'MMM dd, HH:mm')}
                        </TableCell>
                        <TableCell>{submission.submittedBy}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(submission.status)}>
                            {submission.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {submission.verifiedAt ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm">
                                {format(new Date(submission.verifiedAt), 'MMM dd')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Pending</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registered Students</CardTitle>
              <CardDescription>
                Students registered for this exam
              </CardDescription>
            </CardHeader>
            <CardContent>
              {batch.registrations && batch.registrations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Registration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batch.registrations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell className="font-medium">
                          {reg.student.studentId}
                        </TableCell>
                        <TableCell>
                          {reg.student.firstName} {reg.student.lastName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Registered</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No registrations</h3>
                  <p className="text-muted-foreground">
                    Student registration data not available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default BatchScriptDetailsPage;
