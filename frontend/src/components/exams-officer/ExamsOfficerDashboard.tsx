import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { LoadingSpinner } from '@/components/ui/Loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  UserCheck,
  AlertTriangle,
  MapPin,
  Clock,
  RefreshCw,
  Eye,
  Building2,
  QrCode,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Info
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { examLogisticsService } from '@/services/examLogistics.service';
import { examTimetableService, type ExamTimetable } from '@/services/examTimetable.service';
import { qrCodeService } from '@/services/qrCode.service';
import type { ExamsOfficerDashboard, VenueSessionOverview, ExamSessionStatus, ExamIncident, QRCodeData } from '@/types/examLogistics';
import { InvigilatorRole } from '@/types/examLogistics';
import { VerificationMethod } from '@/types/examLogistics';

// Define types for session data
interface SessionData {
  id: number;
  courseCode: string;
  courseName: string;
  level: number;
  examDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  venue: {
    id: number;
    name: string;
    location: string;
    capacity: number;
  };
  studentCount: number;
  registeredCount: number;
  verifiedCount: number;
  status: string;
  assignments: Array<{
    id: number;
    invigilator: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      fullName: string;
    };
    role: string;
    status: string;
    checkedInAt: string | null;
    assignedAt: string;
  }>;
}

interface AvailableInvigilator {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
  role: string;
  department: string;
  departmentCode: string;
  isAvailable: boolean;
  conflict: {
    courseCode: string;
    courseName: string;
    startTime: string;
    endTime: string;
  } | null;
}
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeContext } from '@/contexts/RealtimeContext';
import { useLogisticsDashboardRealtime } from '@/hooks/useExamLogisticsRealtime';
import { toast } from 'sonner';
import { CheckInActivityFeed } from './CheckInActivityFeed';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function ExamsOfficerDashboard() {
  const [dashboard, setDashboard] = useState<ExamsOfficerDashboard | null>(null);
  const [timetables, setTimetables] = useState<ExamTimetable[]>([]);
  const [selectedTimetableId, setSelectedTimetableId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState<number | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { isConnected } = useRealtimeContext();
  const { user } = useAuth();

  // Session management states
  const [sessionsData, setSessionsData] = useState<SessionData[]>([]);

  // Load available timetables
  const loadTimetables = useCallback(async () => {
    try {
      const response = await examTimetableService.getTimetables({
        isPublished: true,
        limit: 100
      });
      if (response.success && response.data) {
        setTimetables(response.data);
        // Auto-select most recent timetable if none selected
        if (!selectedTimetableId && response.data.length > 0) {
          const mostRecent = response.data.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];
          setSelectedTimetableId(mostRecent.id);
        } else if (response.data.length === 0) {
          // No published timetables found - stop loading
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error loading timetables:', error);
      toast.error('Failed to load timetables');
      setLoading(false);
    }
  }, [selectedTimetableId]);

  // Load session data for assignment management
  const loadSessionsData = useCallback(async () => {
    if (!selectedTimetableId) return;

    try {
      const response = await examLogisticsService.getSessionsForAssignment(selectedTimetableId);
      if (response.success && response.data) {
        setSessionsData(response.data);
      }
    } catch (error) {
      console.error('Error loading sessions data:', error);
      toast.error('Failed to load session data');
    }
  }, [selectedTimetableId]);

  // Load sessions data when timetable changes
  useEffect(() => {
    if (selectedTimetableId) {
      loadSessionsData();
    }
  }, [selectedTimetableId, loadSessionsData]);

  // Load dashboard data
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const options: { timetableId?: number } = {};

      if (selectedTimetableId) {
        options.timetableId = selectedTimetableId;
      }

      const response = await examLogisticsService.getExamsOfficerDashboard(
        Object.keys(options).length > 0 ? options : undefined
      );
      if (response.success && response.data) {
        setDashboard(response.data);
      } else {
        toast.error('Failed to load exams officer dashboard');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load exams officer dashboard');
    } finally {
      setLoading(false);
    }
  }, [selectedTimetableId]);

  // Use real-time dashboard updates
  useLogisticsDashboardRealtime(loadDashboard);

  // Load timetables and venue assignments on mount
  useEffect(() => {
    loadTimetables();
  }, [loadTimetables]);

  // Load dashboard when timetable changes
  useEffect(() => {
    if (selectedTimetableId !== undefined) {
      loadDashboard();
    }
  }, [selectedTimetableId, loadDashboard]);

  // Handle QR code scan
  const handleQRScan = async (qrData: string) => {
    try {
      const result = await qrCodeService.scanQRCode(qrData);
      if (result.success && result.data) {
        const qr = result.data as QRCodeData;

        if (!user) {
          toast.error('You must be signed in to perform check-ins');
          return;
        }

        if (qr.type === 'student_verification') {
          // Handle student check-in
          const checkInResult = await examLogisticsService.checkInStudent({
            examEntryId: qr.examEntryId,
            studentId: qr.studentId!,
            verificationMethod: VerificationMethod.QR_CODE,
            verifiedBy: user.id,
            qrCode: qr.examEntryId ? String(qr.examEntryId) : undefined,
          });

          if (checkInResult.success) {
            toast.success('Student checked in successfully');
            loadDashboard(); // Refresh dashboard
          } else {
            toast.error('Failed to check in student');
          }
        } else if (qr.type === 'invigilator_checkin') {
          // Handle invigilator check-in
          const checkInResult = await examLogisticsService.updateInvigilatorPresence(
            qr.invigilatorId!,
            'check_in'
          );

          if (checkInResult.success) {
            toast.success('Invigilator checked in successfully');
            loadDashboard(); // Refresh dashboard
          } else {
            toast.error('Failed to check in invigilator');
          }
        }
      } else {
        toast.error('Invalid QR code');
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      toast.error('Failed to process QR code');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          {/* Title Section */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Exams Officer Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage exam sessions and logistics</p>
          </div>

          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {timetables.length > 0 && (
                <Select
                  value={selectedTimetableId?.toString()}
                  onValueChange={(value) => setSelectedTimetableId(parseInt(value, 10))}
                >
                  <SelectTrigger className="w-full sm:w-[280px]">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select timetable" />
                  </SelectTrigger>
                  <SelectContent>
                    {timetables.map((timetable) => (
                      <SelectItem key={timetable.id} value={timetable.id.toString()}>
                        {timetable.title}
                        {timetable.status === 'ARCHIVED' && ' (Archived)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          {/* Title Section */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Exams Officer Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage exam sessions and logistics</p>
          </div>

          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {timetables.length > 0 && (
                <Select
                  value={selectedTimetableId?.toString()}
                  onValueChange={(value) => setSelectedTimetableId(parseInt(value, 10))}
                >
                  <SelectTrigger className="w-full sm:w-[280px]">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select timetable" />
                  </SelectTrigger>
                  <SelectContent>
                    {timetables.map((timetable) => (
                      <SelectItem key={timetable.id} value={timetable.id.toString()}>
                        {timetable.title}
                        {timetable.status === 'ARCHIVED' && ' (Archived)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground">
                No exam sessions found for the selected timetable.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Title and Context */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Exams Officer Dashboard</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
            <span>Manage exam sessions and logistics</span>
            {selectedTimetableId && timetables.length > 0 && (
              <>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="font-medium text-foreground">
                    {timetables.find(t => t.id === selectedTimetableId)?.title}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-3xl">
            {timetables.length > 0 && (
              <Select
                value={selectedTimetableId?.toString()}
                onValueChange={(value) => setSelectedTimetableId(parseInt(value, 10))}
              >
                <SelectTrigger className="w-full sm:w-[280px]">
                  <Calendar className="h-4 w-4 mr-2 shrink-0" />
                  <SelectValue placeholder="Select timetable" />
                </SelectTrigger>
                <SelectContent>
                  {timetables.map((timetable) => (
                    <SelectItem key={timetable.id} value={timetable.id.toString()}>
                      {timetable.title}
                      {timetable.status === 'ARCHIVED' && ' (Archived)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {activeTab === 'overview' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQRScanner(!showQRScanner)}
                className="shrink-0"
              >
                <QrCode className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{showQRScanner ? 'Hide' : 'Scan'} QR</span>
                <span className="sm:hidden">QR</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadDashboard()}
              disabled={loading}
              className="shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''} sm:mr-2`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Badge
              variant={isConnected ? "default" : "destructive"}
              className="shrink-0 h-8 px-3"
            >
              <div className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              {isConnected ? 'Live' : 'Offline'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Venue Overview
          </TabsTrigger>
          <TabsTrigger value="checkins" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Live Check-Ins
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value="overview" className="space-y-6">
          {/* QR Scanner */}
          {showQRScanner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-primary" />
                  QR Code Scanner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QRCodeScanner onScan={handleQRScan} />
              </CardContent>
            </Card>
          )}

          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(() => {
              const totalExpected = dashboard.todaysSessions.reduce((s, sess) => s + (sess.expectedStudents || 0), 0);
              const totalVerified = dashboard.todaysSessions.reduce((s, sess) => s + (sess.verifiedStudents || 0), 0);
              const attendancePercent = totalExpected > 0 ? Math.round((totalVerified / totalExpected) * 100) : 0;

              return (
                <>
                  <StatCard
                    title="My Venues"
                    value={dashboard.venueOverviews.length}
                    icon={Building2}
                    description="Under supervision"
                  />

                  <StatCard
                    title="Total Students"
                    value={totalExpected.toLocaleString()}
                    icon={Users}
                    description="Across all sessions"
                  />

                  <StatCard
                    title="Students Verified"
                    value={`${totalVerified.toLocaleString()} (${attendancePercent}%)`}
                    icon={UserCheck}
                    description="Check-in completed"
                    trend={{ value: attendancePercent, label: `${attendancePercent}%` }}
                  />

                  <StatCard
                    title="Active Issues"
                    value={dashboard.pendingIncidents.length}
                    icon={AlertTriangle}
                    description={`${dashboard.pendingIncidents.filter(i => i.severity === 'CRITICAL').length} critical`}
                    trend={{ value: -dashboard.pendingIncidents.length, label: 'Pending Issues' }}
                  />
                </>
              );
            })()}
          </div>

      {/* Venue Management */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Venue Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.venueOverviews.map((venue) => (
                <VenueManagementCard
                  key={venue.venueId}
                  venue={venue}
                  isSelected={selectedVenue === venue.venueId}
                  onSelect={() => setSelectedVenue(selectedVenue === venue.venueId ? null : venue.venueId)}
                />
              ))}

              {dashboard.venueOverviews.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No venues assigned to you today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Venue View */}
        {selectedVenue && (
          <VenueDetailView
            venue={dashboard.venueOverviews.find(v => v.venueId === selectedVenue)!}
            sessions={dashboard.todaysSessions.filter(s => s.examEntryId && dashboard.venueOverviews.find(v => v.venueId === selectedVenue)?.activeSessions.some(as => as.examEntryId === s.examEntryId))}
            incidents={dashboard.pendingIncidents.filter(i => dashboard.venueOverviews.find(v => v.venueId === selectedVenue)?.activeSessions.some(as => as.examEntryId === i.examEntryId))}
            sessionsData={sessionsData}
            onAssignmentChange={() => {
              loadDashboard();
              loadSessionsData();
            }}
          />
        )}
      </div>
        </TabsContent>

        {/* Live Check-Ins Tab Content */}
        <TabsContent value="checkins" className="space-y-6">
          <CheckInActivityFeed maxEvents={50} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Venue Management Card Component
function VenueManagementCard({
  venue,
  isSelected,
  onSelect
}: {
  venue: VenueSessionOverview;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const attendanceRate = venue.totalStudentsExpected > 0
    ? (venue.totalStudentsVerified / venue.totalStudentsExpected) * 100
    : 0;

  return (
    <div className={`border rounded-lg p-4 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary bg-accent/50' : 'hover:shadow-md'}`} onClick={onSelect}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">{venue.venueName}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={venue.activeSessions.length > 0 ? "default" : "secondary"}>
            {venue.activeSessions.length > 0 ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        <div className="text-center">
          <div className="text-lg font-bold">{venue.totalStudentsExpected}</div>
          <div className="text-xs text-muted-foreground">Expected</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${attendanceRate >= 90 ? 'text-green-600' : attendanceRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
            {venue.totalStudentsVerified}
          </div>
          <div className="text-xs text-muted-foreground">Verified</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">{venue.totalInvigilatorsAssigned}</div>
          <div className="text-xs text-muted-foreground">Invigilators</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${venue.unresolvedIssues === 0 ? 'text-green-600' : venue.unresolvedIssues <= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
            {venue.unresolvedIssues}
          </div>
          <div className="text-xs text-muted-foreground">Issues</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{venue.activeSessions.length} exam session{venue.activeSessions.length !== 1 ? 's' : ''}</span>
        <span>Capacity: {venue.rooms.reduce((sum, room) => sum + room.capacity, 0)}</span>
      </div>
    </div>
  );
}

// Venue Detail View Component with Accordion
function VenueDetailView({
  venue,
  sessions,
  incidents,
  sessionsData,
  onAssignmentChange
}: {
  venue: VenueSessionOverview;
  sessions: ExamSessionStatus[];
  incidents: ExamIncident[];
  sessionsData: SessionData[];
  onAssignmentChange: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          {venue.venueName} - Session Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-2">
          {sessions.map((session) => {
            // Find the corresponding session data with assignments
            const sessionData = sessionsData.find(s => s.id === session.examEntryId);
            const assignedInvigilators = sessionData?.assignments || [];
            const assignedCount = assignedInvigilators.length;
            const presentCount = assignedInvigilators.filter((a) => a.checkedInAt).length;

            return (
              <AccordionItem key={session.examEntryId} value={`session-${session.examEntryId}`} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full mr-4">
                    <div className="text-left">
                      <div className="font-semibold">{session.courseCode} - {session.courseName}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                          {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>{session.expectedStudents} students expected</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-sm font-bold">{presentCount}/{assignedCount}</div>
                        <div className="text-xs text-muted-foreground">Invigilators</div>
                      </div>
                      <Badge variant={session.status === 'IN_PROGRESS' ? "default" : session.status === 'COMPLETED' ? "secondary" : "outline"}>
                        {String(session.status).replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="space-y-4">
                    {/* Session Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className={`text-lg font-bold ${session.expectedStudents > 0 && (session.verifiedStudents / session.expectedStudents) >= 0.9 ? 'text-green-600' : (session.verifiedStudents / session.expectedStudents) >= 0.7 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {session.verifiedStudents}/{session.expectedStudents}
                        </div>
                        <div className="text-xs text-muted-foreground">Students Verified</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{presentCount}/{assignedCount}</div>
                        <div className="text-xs text-muted-foreground">Invigilators Present</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{session.incidentCount ?? 0}</div>
                        <div className="text-xs text-muted-foreground">Incidents</div>
                      </div>
                    </div>

                    {/* Assigned Invigilators */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Assigned Invigilators ({assignedCount})</h4>
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Info className="h-4 w-4 mr-2" />
                              Details & Assign
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="sm:max-w-[600px]">
                            <SheetHeader>
                              <SheetTitle>Session Details & Assignment</SheetTitle>
                            </SheetHeader>
                            <SessionDetailsSheet
                              session={session}
                              sessionData={sessionData}
                              onAssignmentChange={onAssignmentChange}
                            />
                          </SheetContent>
                        </Sheet>
                      </div>

                      {assignedInvigilators.length > 0 ? (
                        <div className="space-y-2">
                          {assignedInvigilators.map((assignment) => (
                            <div key={assignment.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{assignment.invigilator?.fullName}</span>
                                <Badge variant="outline" className="text-xs">
                                  {assignment.role.replace('_', ' ')}
                                </Badge>
                                {assignment.checkedInAt && (
                                  <Badge variant="default" className="text-xs gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Checked In
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-4 bg-secondary/30 rounded">
                          No invigilators assigned
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Recent Incidents */}
        {incidents.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Recent Incidents</h3>
            <div className="space-y-3">
              {incidents.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Session Details Sheet Component
function SessionDetailsSheet({
  session,
  sessionData,
  onAssignmentChange
}: {
  session: ExamSessionStatus;
  sessionData: SessionData | undefined;
  onAssignmentChange: () => void;
}) {
  const [availableInvigilators, setAvailableInvigilators] = useState<AvailableInvigilator[]>([]);
  const [loadingInvigilators, setLoadingInvigilators] = useState(false);
  const [selectedInvigilatorId, setSelectedInvigilatorId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<InvigilatorRole>(InvigilatorRole.INVIGILATOR);
  const [duties, setDuties] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const loadAvailableInvigilators = useCallback(async () => {
    if (!sessionData) return;

    try {
      setLoadingInvigilators(true);
      const response = await examLogisticsService.getAvailableInvigilators({
        examDate: sessionData.examDate,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime
      });
      if (response.success && response.data) {
        setAvailableInvigilators(response.data);
      }
    } catch (error) {
      toast.error('Failed to load available invigilators');
    } finally {
      setLoadingInvigilators(false);
    }
  }, [sessionData]);

  useEffect(() => {
    loadAvailableInvigilators();
  }, [loadAvailableInvigilators]);

  const handleAssignInvigilator = async () => {
    if (!selectedInvigilatorId || !user) {
      toast.error('Please select an invigilator');
      return;
    }

    try {
      setSubmitting(true);
      const response = await examLogisticsService.assignInvigilator({
        examEntryId: session.examEntryId,
        invigilatorId: parseInt(selectedInvigilatorId),
        role: selectedRole,
        venueId: sessionData?.venue?.id || 0,
        assignedBy: user.id,
        duties: duties || undefined
      });

      if (response.success) {
        toast.success('Invigilator assigned successfully');
        setSelectedInvigilatorId('');
        setSelectedRole(InvigilatorRole.INVIGILATOR);
        setDuties('');
        onAssignmentChange();
        loadAvailableInvigilators(); // Refresh the list
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to assign invigilator');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: number) => {
    if (!confirm('Are you sure you want to remove this invigilator assignment?')) {
      return;
    }

    try {
      const response = await examLogisticsService.removeInvigilatorAssignment(assignmentId);
      if (response.success) {
        toast.success('Invigilator assignment removed');
        onAssignmentChange();
        loadAvailableInvigilators(); // Refresh the list
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove assignment');
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Session Info */}
      <div>
        <h4 className="font-semibold mb-2">{session.courseCode} - {session.courseName}</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>{new Date(sessionData?.examDate || session.startTime).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>
              {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
              {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            <span>{sessionData?.venue.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3" />
            <span>{session.expectedStudents} students expected</span>
          </div>
        </div>
      </div>

      {/* Current Assignments */}
      <div>
        <h5 className="font-medium mb-2">Current Assignments ({sessionData?.assignments?.length ?? 0})</h5>
        {(sessionData?.assignments?.length ?? 0) > 0 ? (
          <div className="space-y-2">
            {sessionData?.assignments?.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded text-sm">
                <div className="flex items-center gap-2">
                  <span>{assignment.invigilator.fullName}</span>
                  <Badge variant="outline" className="text-xs">
                    {assignment.role.replace('_', ' ')}
                  </Badge>
                  {assignment.checkedInAt && (
                    <Badge variant="default" className="text-xs gap-1">
                      <CheckCircle className="h-3 w-3" />
                      In
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAssignment(assignment.id)}
                  className="h-6 w-6 p-0"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-2 bg-secondary/30 rounded">
            No invigilators assigned
          </div>
        )}
      </div>

      {/* Assignment Form */}
      <div className="border-t pt-4">
        <h5 className="font-medium mb-3">Assign New Invigilator</h5>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Role</label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as InvigilatorRole)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={InvigilatorRole.CHIEF_INVIGILATOR}>Chief Invigilator</SelectItem>
                <SelectItem value={InvigilatorRole.INVIGILATOR}>Invigilator</SelectItem>
                <SelectItem value={InvigilatorRole.RELIEF_INVIGILATOR}>Relief Invigilator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Duties (Optional)</label>
            <input
              type="text"
              placeholder="e.g., Main hall supervision"
              value={duties}
              onChange={(e) => setDuties(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Available Invigilators</label>
            {loadingInvigilators ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Loading...
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1">
                {availableInvigilators.map((invigilator) => (
                  <div
                    key={invigilator.id}
                    className={`p-2 border rounded cursor-pointer text-sm ${
                      selectedInvigilatorId === String(invigilator.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-secondary/50'
                    } ${!invigilator.isAvailable ? 'opacity-60' : ''}`}
                    onClick={() => {
                      if (invigilator.isAvailable) {
                        setSelectedInvigilatorId(String(invigilator.id));
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{invigilator.fullName}</div>
                        <div className="text-xs text-muted-foreground">
                          {invigilator.department} • {invigilator.role}
                        </div>
                      </div>
                      {invigilator.isAvailable ? (
                        <Badge variant="outline" className="text-xs">Available</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Busy</Badge>
                      )}
                    </div>
                    {invigilator.conflict && (
                      <div className="mt-1 text-xs text-red-600">
                        Conflicts with: {invigilator.conflict.courseCode}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleAssignInvigilator}
            disabled={!selectedInvigilatorId || submitting}
            className="w-full"
            size="sm"
          >
            {submitting ? 'Assigning...' : 'Assign Invigilator'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Incident Card Component
function IncidentCard({ incident }: { incident: ExamIncident }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-950/20';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-950/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20';
      case 'low': return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'investigating': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'escalated': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getSeverityColor(incident.severity)}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon(incident.status)}
          <span className="font-medium">{incident.title}</span>
        </div>
        <Badge variant="outline" className="text-xs">
          {incident.severity}
        </Badge>
      </div>
      <p className="text-sm mb-2">{incident.description}</p>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{incident.reportedBy} • {incident.reportedAt.toLocaleTimeString()}</span>
        <span>{incident.status}</span>
      </div>
    </div>
  );
}

// QR Code Scanner Component (placeholder - would need actual QR scanning library)
function QRCodeScanner({ onScan }: { onScan: (data: string) => void }) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onScan(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <QrCode className="h-16 w-16 text-primary mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">
          Scan QR codes from students or invigilators, or enter manually for testing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter QR code data..."
          className="flex-1 px-3 py-2 border rounded-md"
        />
        <Button type="submit" disabled={!inputValue.trim()}>
          Process
        </Button>
      </form>

      <div className="text-xs text-muted-foreground text-center">
        In production, this would use a camera-based QR scanner
      </div>
    </div>
  );
}
