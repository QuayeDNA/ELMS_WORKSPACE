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
  Building2,
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
import { InstitutionLogisticsDashboard, VenueSessionOverview } from '@/types/examLogistics';
import { ExamTimetable } from '@/types/examTimetable';
import { useLogisticsDashboardRealtime } from '@/hooks/useExamLogisticsRealtime';
import { useRealtimeContext } from '@/contexts/RealtimeContext';
import { toast } from 'sonner';

export function InstitutionLogisticsDashboardView() {
  const [dashboard, setDashboard] = useState<InstitutionLogisticsDashboard | null>(null);
  const [timetables, setTimetables] = useState<ExamTimetable[]>([]);
  const [selectedTimetableId, setSelectedTimetableId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { isConnected } = useRealtimeContext();

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
      const response = await examLogisticsService.getInstitutionDashboard(
        selectedTimetableId ? { timetableId: selectedTimetableId } : undefined
      );
      if (response.success && response.data) {
        setDashboard(response.data);
      } else {
        toast.error('Failed to load logistics dashboard');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load logistics dashboard');
    } finally {
      setLoading(false);
    }
  }, [selectedTimetableId]);

  // Use real-time dashboard updates
  useLogisticsDashboardRealtime(() => {
    loadDashboard();
  });

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Exam Logistics Dashboard</h1>
            <p className="text-muted-foreground">Real-time exam session monitoring</p>
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
            <h1 className="text-3xl font-bold">Exam Logistics Dashboard</h1>
            <p className="text-muted-foreground">Real-time exam session monitoring</p>
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
          <h1 className="text-3xl font-bold">Exam Logistics Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time exam session monitoring
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
            onClick={() => loadDashboard()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge variant={isConnected ? "default" : "destructive"} className="ml-2">
            {isConnected ? 'Live' : 'Offline'}
          </Badge>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students Expected"
          value={(dashboard.totalExpectedStudents || 0).toLocaleString()}
          icon={Users}
          description="Across all venues"
        />
        <StatCard
          title="Students Present"
          value={`${(dashboard.totalPresentStudents || 0).toLocaleString()} (${(dashboard.attendanceRate || 0).toFixed(1)}%)`}
          icon={UserCheck}
          description="Check-in completed"
          trend={(dashboard.attendanceRate || 0) >= 90 ? 'up' : (dashboard.attendanceRate || 0) >= 70 ? 'neutral' : 'down'}
        />
        <StatCard
          title="Invigilators Present"
          value={`${dashboard.totalInvigilatorsPresent || 0}/${dashboard.totalAssignedInvigilators || 0}`}
          icon={UserCheck}
          description={`${(dashboard.invigilatorAttendanceRate || 0).toFixed(1)}% attendance rate`}
          trend={(dashboard.invigilatorAttendanceRate || 0) >= 95 ? 'up' : (dashboard.invigilatorAttendanceRate || 0) >= 80 ? 'neutral' : 'down'}
        />
        <StatCard
          title="Active Issues"
          value={(dashboard.unresolvedIncidents || 0).toString()}
          icon={AlertTriangle}
          description={dashboard.totalIncidents > 0 ? `${dashboard.totalIncidents} total` : 'No incidents'}
          trend={(dashboard.unresolvedIncidents || 0) === 0 ? 'up' : (dashboard.unresolvedIncidents || 0) <= 5 ? 'neutral' : 'down'}
        />
      </div>

      {/* Venue Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Sessions Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Active Exam Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-accent/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {dashboard.activeExamSessions || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">
                    {(dashboard.totalExamSessions || 0) - (dashboard.activeExamSessions || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Scheduled</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Venues Active</span>
                  <span className="font-medium">{dashboard.activeVenues || 0}/{dashboard.totalVenues || 0}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((dashboard.activeVenues || 0) / Math.max(dashboard.totalVenues || 1, 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Issues & Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <div className="text-lg font-bold text-yellow-600">
                    {dashboard.unresolvedIncidents || 0}
                  </div>
                  <div className="text-xs text-yellow-600">Unresolved</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {(dashboard.totalIncidents || 0) - (dashboard.unresolvedIncidents || 0)}
                  </div>
                  <div className="text-xs text-green-600">Resolved</div>
                </div>
              </div>

              {(dashboard.unresolvedIncidents || 0) > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {dashboard.unresolvedIncidents} unresolved incident{dashboard.unresolvedIncidents !== 1 ? 's' : ''} require attention
                    </span>
                  </div>
                </div>
              )}

              {(dashboard.totalIncidents || 0) === 0 && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg text-center">
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    No incidents reported today
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Venue Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Venue Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboard.venues.map((venue) => (
              <VenueCard key={venue.venueId} venue={venue} />
            ))}

            {dashboard.venues.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No venues with active sessions today</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Venue Card Component
function VenueCard({ venue }: { venue: VenueSessionOverview }) {
  const attendanceRate = (venue.totalStudentsExpected || 0) > 0
    ? ((venue.totalStudentsVerified || 0) / (venue.totalStudentsExpected || 0)) * 100
    : 0;

  const invigilatorRate = (venue.totalInvigilatorsAssigned || 0) > 0
    ? ((venue.totalInvigilatorsPresent || 0) / (venue.totalInvigilatorsAssigned || 0)) * 100
    : 0;

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">{venue.venueName}</h3>
        </div>
        <Badge variant={(venue.activeSessions?.length || 0) > 0 ? "default" : "secondary"}>
          {venue.activeSessions?.length || 0} active
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        <div className="text-center">
          <div className="text-lg font-bold">{venue.totalStudentsExpected || 0}</div>
          <div className="text-xs text-muted-foreground">Expected</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${attendanceRate >= 90 ? 'text-green-600' : attendanceRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
            {venue.totalStudentsVerified || 0}
          </div>
          <div className="text-xs text-muted-foreground">Verified</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${invigilatorRate >= 95 ? 'text-green-600' : invigilatorRate >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
            {venue.totalInvigilatorsPresent || 0}/{venue.totalInvigilatorsAssigned || 0}
          </div>
          <div className="text-xs text-muted-foreground">Invigilators</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${(venue.unresolvedIssues || 0) === 0 ? 'text-green-600' : (venue.unresolvedIssues || 0) <= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
            {venue.unresolvedIssues || 0}
          </div>
          <div className="text-xs text-muted-foreground">Issues</div>
        </div>
      </div>

      {(venue.activeSessions?.length || 0) > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Active Sessions:</h4>
          <div className="space-y-1">
            {(venue.activeSessions || []).slice(0, 2).map((session) => (
              <div key={session.examEntryId} className="flex items-center justify-between text-sm bg-accent/50 p-2 rounded">
                <span className="font-medium">{session.courseCode}</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <Badge variant="outline" className="text-xs">
                    {session.verifiedStudents || 0}/{session.expectedStudents || 0}
                  </Badge>
                </div>
              </div>
            ))}
            {(venue.activeSessions?.length || 0) > 2 && (
              <div className="text-xs text-muted-foreground text-center">
                +{(venue.activeSessions?.length || 0) - 2} more sessions
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
