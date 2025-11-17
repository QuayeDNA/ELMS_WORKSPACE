import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { Loading } from '@/components/ui/Loading';
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
  AlertCircle
} from 'lucide-react';
import { examLogisticsService } from '@/services/examLogistics.service';
import { qrCodeService } from '@/services/qrCode.service';
import { ExamsOfficerDashboard, VenueSessionDetail, ExamIncident } from '@/types/examLogistics';
import { useRealtimeContext } from '@/contexts/RealtimeContext';
import { useLogisticsDashboardRealtime } from '@/hooks/useExamLogisticsRealtime';
import { toast } from 'sonner';

export function ExamsOfficerDashboard() {
  const [dashboard, setDashboard] = useState<ExamsOfficerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const { isConnected } = useRealtimeContext();

  // Load dashboard data
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await examLogisticsService.getExamsOfficerDashboard();
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
  }, []);

  // Use real-time dashboard updates
  useLogisticsDashboardRealtime(loadDashboard);

  // Load dashboard on mount
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Handle QR code scan
  const handleQRScan = async (qrData: string) => {
    try {
      const result = await qrCodeService.scanQRCode(qrData);
      if (result.success && result.data) {
        const { type, data } = result.data;

        if (type === 'student_checkin') {
          // Handle student check-in
          const checkInResult = await examLogisticsService.checkInStudent({
            examEntryId: data.examEntryId,
            studentId: data.studentId,
            venueId: data.venueId,
            checkInTime: new Date(),
            verificationMethod: 'qr_code'
          });

          if (checkInResult.success) {
            toast.success('Student checked in successfully');
            loadDashboard(); // Refresh dashboard
          } else {
            toast.error('Failed to check in student');
          }
        } else if (type === 'invigilator_checkin') {
          // Handle invigilator check-in
          const checkInResult = await examLogisticsService.checkInInvigilator({
            assignmentId: data.assignmentId,
            checkInTime: new Date(),
            verificationMethod: 'qr_code'
          });

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
        </div>
        <Loading />
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
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground">
                No exam sessions assigned to you today.
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
            Manage exam sessions and logistics • {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
        <StatCard
          title="My Venues"
          value={dashboard.venues.length.toString()}
          icon={Building2}
          description="Under supervision"
        />
        <StatCard
          title="Total Students"
          value={dashboard.totalStudentsExpected.toLocaleString()}
          icon={Users}
          description="Across all venues"
        />
        <StatCard
          title="Students Verified"
          value={`${dashboard.totalStudentsVerified.toLocaleString()} (${dashboard.overallAttendanceRate.toFixed(1)}%)`}
          icon={UserCheck}
          description="Check-in completed"
          trend={dashboard.overallAttendanceRate >= 90 ? 'up' : dashboard.overallAttendanceRate >= 70 ? 'neutral' : 'down'}
        />
        <StatCard
          title="Active Issues"
          value={dashboard.totalUnresolvedIncidents.toString()}
          icon={AlertTriangle}
          description={`${dashboard.criticalIncidents} critical`}
          trend={dashboard.totalUnresolvedIncidents === 0 ? 'up' : dashboard.totalUnresolvedIncidents <= 5 ? 'neutral' : 'down'}
        />
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
              {dashboard.venues.map((venue) => (
                <VenueManagementCard
                  key={venue.venueId}
                  venue={venue}
                  isSelected={selectedVenue === venue.venueId}
                  onSelect={() => setSelectedVenue(selectedVenue === venue.venueId ? null : venue.venueId)}
                />
              ))}

              {dashboard.venues.length === 0 && (
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
            venue={dashboard.venues.find(v => v.venueId === selectedVenue)!}
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
  venue: VenueSessionDetail;
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
          <Badge variant={venue.isActive ? "default" : "secondary"}>
            {venue.isActive ? 'Active' : 'Inactive'}
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
          <div className={`text-lg font-bold ${venue.unresolvedIncidents === 0 ? 'text-green-600' : venue.unresolvedIncidents <= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
            {venue.unresolvedIncidents}
          </div>
          <div className="text-xs text-muted-foreground">Issues</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{venue.sessions.length} exam session{venue.sessions.length !== 1 ? 's' : ''}</span>
        <span>Capacity: {venue.capacity}</span>
      </div>
    </div>
  );
}

// Venue Detail View Component
function VenueDetailView({ venue }: { venue: VenueSessionDetail }) {
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
              {venue.sessions.map((session) => (
                <SessionCard key={session.examEntryId} session={session} />
              ))}
            </div>
          </div>

          {/* Recent Incidents */}
          {venue.recentIncidents.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Incidents</h3>
              <div className="space-y-3">
                {venue.recentIncidents.map((incident) => (
                  <IncidentCard key={incident.incidentId} incident={incident} />
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
        <Badge variant={session.status === 'in_progress' ? "default" : session.status === 'completed' ? "secondary" : "outline"}>
          {session.status.replace('_', ' ')}
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
          <div className="text-lg font-bold">{session.invigilatorsPresent}/{session.invigilatorsAssigned}</div>
          <div className="text-xs text-muted-foreground">Invigilators</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">{session.incidents}</div>
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
