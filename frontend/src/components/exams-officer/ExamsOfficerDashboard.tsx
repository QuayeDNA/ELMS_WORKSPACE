import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { LoadingSpinner } from '@/components/ui/Loading';
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
  Calendar
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { examLogisticsService } from '@/services/examLogistics.service';
import { examTimetableService } from '@/services/examTimetable.service';
import { qrCodeService } from '@/services/qrCode.service';
import type { ExamsOfficerDashboard, VenueSessionOverview, ExamSessionStatus, ExamIncident, QRCodeData } from '@/types/examLogistics';
import { ExamTimetable } from '@/types/examTimetable';
import { VerificationMethod } from '@/types/examLogistics';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeContext } from '@/contexts/RealtimeContext';
import { useLogisticsDashboardRealtime } from '@/hooks/useExamLogisticsRealtime';
import { toast } from 'sonner';

export function ExamsOfficerDashboard() {
  const [dashboard, setDashboard] = useState<ExamsOfficerDashboard | null>(null);
  const [timetables, setTimetables] = useState<ExamTimetable[]>([]);
  const [selectedTimetableId, setSelectedTimetableId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState<number | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const { isConnected } = useRealtimeContext();
  const { user } = useAuth();

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
  }, []); // Remove selectedTimetableId dependency to avoid infinite loop

  // Load dashboard data
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await examLogisticsService.getExamsOfficerDashboard(
        selectedTimetableId ? { timetableId: selectedTimetableId } : undefined
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

  // Load timetables on mount
  useEffect(() => {
    loadTimetables();
  }, [loadTimetables]);

  // Load dashboard when timetable selection changes
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Exams Officer Dashboard</h1>
            <p className="text-muted-foreground">Manage exam sessions and logistics</p>
          </div>
          <div className="flex items-center gap-3">
            {timetables.length > 0 && (
              <Select
                value={selectedTimetableId?.toString()}
                onValueChange={(value) => setSelectedTimetableId(parseInt(value, 10))}
              >
                <SelectTrigger className="w-[280px]">
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
        <LoadingSpinner />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Exams Officer Dashboard</h1>
            <p className="text-muted-foreground">Manage exam sessions and logistics</p>
          </div>
          <div className="flex items-center gap-3">
            {timetables.length > 0 && (
              <Select
                value={selectedTimetableId?.toString()}
                onValueChange={(value) => setSelectedTimetableId(parseInt(value, 10))}
              >
                <SelectTrigger className="w-[280px]">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Exams Officer Dashboard</h1>
          <p className="text-muted-foreground">
            Manage exam sessions and logistics
            {selectedTimetableId && timetables.length > 0 && (
              <span className="ml-2">
                - {timetables.find(t => t.id === selectedTimetableId)?.title}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {timetables.length > 0 && (
            <Select
              value={selectedTimetableId?.toString()}
              onValueChange={(value) => setSelectedTimetableId(parseInt(value, 10))}
            >
              <SelectTrigger className="w-[280px]">
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQRScanner(!showQRScanner)}
          >
            <QrCode className="h-4 w-4 mr-2" />
            {showQRScanner ? 'Hide Scanner' : 'Scan QR'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadDashboard()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? 'Live' : 'Offline'}
          </Badge>
        </div>
      </div>

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
                description={`${dashboard.pendingIncidents.filter(i => i.severity === 'critical').length} critical`}
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
          />
        )}
      </div>
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

// Venue Detail View Component
function VenueDetailView({ venue, sessions, incidents }: { venue: VenueSessionOverview; sessions: ExamSessionStatus[]; incidents: ExamIncident[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          {venue.venueName} - Session Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Session List */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Exam Sessions</h3>
            <div className="space-y-3">
              {sessions.map((session) => (
                <SessionCard key={session.examEntryId} session={session} />
              ))}
            </div>
          </div>

          {/* Recent Incidents */}
          {incidents.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Incidents</h3>
              <div className="space-y-3">
                {incidents.map((incident) => (
                  <IncidentCard key={incident.id} incident={incident} />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Session Card Component
function SessionCard({ session }: { session: ExamSessionStatus }) {
  const attendanceRate = session.expectedStudents > 0
    ? (session.verifiedStudents / session.expectedStudents) * 100
    : 0;

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold">{session.courseCode} - {session.courseName}</h4>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {session.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span>{session.expectedStudents} students expected</span>
          </div>
        </div>
        <Badge variant={session.status === 'IN_PROGRESS' ? "default" : session.status === 'COMPLETED' ? "secondary" : "outline"}>
          {String(session.status).replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className={`text-lg font-bold ${attendanceRate >= 90 ? 'text-green-600' : attendanceRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
            {session.verifiedStudents}/{session.expectedStudents}
          </div>
          <div className="text-xs text-muted-foreground">Verified</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">{(session.presentInvigilators ?? 0)}/{(session.assignedInvigilators ?? 0)}</div>
          <div className="text-xs text-muted-foreground">Invigilators</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">{session.incidentCount ?? 0}</div>
          <div className="text-xs text-muted-foreground">Incidents</div>
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
