import { useState, useMemo } from 'react';
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
  Users,
  GraduationCap,
  Shield,
  AlertTriangle,
  MapPin,
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
import { CarouselStatCard, StatItem } from '@/components/ui/carousel-stat-card';
import { batchScriptService } from '@/services/batchScript.service';
import { scriptSubmissionService } from '@/services/scriptSubmission.service';
import { courseService } from '@/services/course.service';
import { programService } from '@/services/program.service';
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

  // Fetch course details (includes department, faculty, institution, and courseLecturers)
  const { data: courseData } = useQuery({
    queryKey: ['course', batch?.courseId],
    queryFn: async () => {
      if (!batch?.courseId) throw new Error('Course ID required');
      const response = await courseService.getCourseById(batch.courseId);
      return response;
    },
    enabled: !!batch?.courseId,
  });

  // Parse program IDs from examEntry
  const programIds = useMemo(() => {
    if (!batch?.examEntry?.programIds) return [];
    try {
      const ids = JSON.parse(batch.examEntry.programIds);
      return Array.isArray(ids) ? ids.map(Number).filter(Boolean) : [];
    } catch {
      return [];
    }
  }, [batch?.examEntry?.programIds]);

  // Fetch all programs in a single batch request with filtering
  const { data: programsResponse } = useQuery({
    queryKey: ['programs-batch', programIds],
    queryFn: async () => {
      if (programIds.length === 0) return { data: [] };

      // Fetch programs with a filter - more efficient than individual requests
      const response = await programService.getPrograms({
        limit: programIds.length,
        // If the API supports filtering by IDs, use it; otherwise fetch and filter client-side
      });

      return response;
    },
    enabled: programIds.length > 0,
  });

  // Filter programs to only those in our list
  const programs = useMemo(() => {
    if (!programsResponse?.data) return [];
    return programsResponse.data.filter(program =>
      programIds.includes(program.id)
    );
  }, [programsResponse, programIds]);

  // Get course instructor - prefer courseLecturers, fallback to department lecturers
  const courseInstructor = useMemo(() => {
    // First try to get from courseOfferings
    if (courseData?.courseOfferings && courseData.courseOfferings.length > 0) {
      const offeringWithLecturer = courseData.courseOfferings
        .find(offering =>
          offering.courseLecturers && offering.courseLecturers.length > 0
        );

      if (offeringWithLecturer?.courseLecturers?.[0]?.lecturer) {
        return offeringWithLecturer.courseLecturers[0].lecturer;
      }
    }

    // Fallback: use primary lecturer from department
    if (courseData?.department?.lecturerDepartments &&
        courseData.department.lecturerDepartments.length > 0) {
      const primaryLecturer = courseData.department.lecturerDepartments[0]?.lecturer;
      if (primaryLecturer) {
        return primaryLecturer;
      }
    }

    // No instructor found
    return null;
  }, [courseData]);  // Prepare additional stats for carousel
  const additionalStats: StatItem[] = [
    {
      label: 'Graded',
      value: stats?.scriptsGraded || batch?.scriptsGraded || 0,
      description: 'Grading complete',
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
    },
    {
      label: 'Collected',
      value: stats?.scriptsCollected || batch?.scriptsCollected || 0,
      description: 'Scripts collected',
      icon: <Package className="h-4 w-4 text-muted-foreground" />,
    },
    {
      label: 'Grading Progress',
      value: `${stats?.gradingProgress || 0}%`,
      description: 'Overall grading progress',
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
    },
  ];

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
            <h1 className="text-3xl font-bold">{batch.batchQRCode}</h1>
            <p className="text-muted-foreground mt-1">
              {batch.course?.code} - {batch.course?.name}
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
            <div className="text-2xl font-bold">{stats?.totalRegistered || batch.totalRegistered}</div>
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
            <div className="text-2xl font-bold">{stats?.scriptsSubmitted || batch.scriptsSubmitted}</div>
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
            <div className="text-2xl font-bold">{stats?.pending || (batch.totalRegistered - batch.scriptsSubmitted)}</div>
            <p className="text-xs text-muted-foreground">
              Yet to submit
            </p>
          </CardContent>
        </Card>

        <CarouselStatCard
          title="Additional Stats"
          stats={additionalStats}
          autoRotate={true}
          rotateInterval={4000}
        />
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
                    <span className="text-sm font-medium">Batch QR Code</span>
                  </div>
                  <span className="text-sm font-mono">{batch.batchQRCode}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Exam Date</span>
                  </div>
                  <span className="text-sm">
                    {batch.examEntry?.examDate
                      ? format(new Date(batch.examEntry.examDate), 'MMM dd, yyyy')
                      : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Exam Time</span>
                  </div>
                  <span className="text-sm">
                    {batch.examEntry?.startTime && batch.examEntry?.endTime
                      ? `${format(new Date(batch.examEntry.startTime), 'HH:mm')} - ${format(new Date(batch.examEntry.endTime), 'HH:mm')}`
                      : 'N/A'}
                  </span>
                </div>

                {batch.assignedLecturer && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Assigned To</span>
                    </div>
                    <div className="text-sm text-right">
                      <div>{batch.assignedLecturer.firstName} {batch.assignedLecturer.lastName}</div>
                      <div className="text-xs text-muted-foreground">
                        {batch.assignedLecturer.email}
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

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Venue</span>
                    </div>
                    <div className="text-sm text-right">
                      <div>{batch.examEntry?.venue?.name || 'Not assigned'}</div>
                      {batch.examEntry?.venue?.location && (
                        <div className="text-xs text-muted-foreground">
                          {batch.examEntry.venue.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {batch.examEntry?.level && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Level</span>
                    </div>
                    <span className="text-sm">Level {batch.examEntry.level}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course & Program Information */}
            <Card>
              <CardHeader>
                <CardTitle>Course & Program Details</CardTitle>
                <CardDescription>Academic information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Course</div>
                      <div className="text-sm text-muted-foreground">
                        {batch.course?.code} - {batch.course?.name}
                      </div>
                      {batch.course?.creditHours && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {batch.course.creditHours} Credit Hours
                        </div>
                      )}
                    </div>
                  </div>

                  {batch.examEntry?.duration && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Duration</span>
                      </div>
                      <span className="text-sm">{batch.examEntry.duration} minutes</span>
                    </div>
                  )}

                  {/* Course Instructor */}
                  {courseInstructor && (
                    <div className="flex items-start gap-2 pt-2 border-t">
                      <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Course Instructor</div>
                        <div className="text-sm text-muted-foreground">
                          {courseInstructor.firstName} {courseInstructor.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {courseInstructor.email}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Program(s) */}
                  {programs && programs.length > 0 && (
                    <div className="flex items-start gap-2 pt-2 border-t">
                      <GraduationCap className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Program(s)</div>
                        <div className="space-y-1 mt-1">
                          {programs.map((program) => (
                            <div key={program.id} className="text-sm text-muted-foreground">
                              {program.code} - {program.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Invigilators & Staff */}
            <Card>
              <CardHeader>
                <CardTitle>Invigilators & Staff</CardTitle>
                <CardDescription>Examination supervision details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Placeholder for Chief Invigilator */}
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Chief Invigilator</div>
                    <div className="text-xs text-muted-foreground">
                      To be assigned
                    </div>
                  </div>
                </div>

                {/* Placeholder for Invigilators */}
                <div className="flex items-start gap-2 pt-2 border-t">
                  <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Invigilators</div>
                    <div className="text-xs text-muted-foreground">
                      No invigilators assigned yet
                    </div>
                  </div>
                </div>

                {/* Script Grading Assigned Lecturer */}
                {batch.assignedLecturer && (
                  <div className="flex items-start gap-2 pt-2 border-t">
                    <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Assigned for Grading</div>
                      <div className="text-sm text-muted-foreground">
                        {batch.assignedLecturer.firstName} {batch.assignedLecturer.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {batch.assignedLecturer.email}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Incidents (Placeholder) */}
            <Card>
              <CardHeader>
                <CardTitle>Incidents & Reports</CardTitle>
                <CardDescription>Examination incidents and issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h4 className="text-sm font-medium mb-1">No incidents reported</h4>
                  <p className="text-xs text-muted-foreground">
                    Incidents will appear here if any issues are reported during or after the examination
                  </p>
                </div>

                {/* Placeholder for future incidents */}
                <div className="mt-4 space-y-2 hidden">
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-yellow-900">
                        Example: Student missing answer booklet
                      </div>
                      <div className="text-xs text-yellow-700 mt-1">
                        Reported by: John Doe • Time: 10:30 AM
                      </div>
                      <Badge className="mt-2 bg-yellow-100 text-yellow-800 border-yellow-300">
                        RESOLVED
                      </Badge>
                    </div>
                  </div>
                </div>
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
