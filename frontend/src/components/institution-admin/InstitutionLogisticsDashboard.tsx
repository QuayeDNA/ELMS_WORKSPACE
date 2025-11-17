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
  Building2
} from 'lucide-react';
import { examLogisticsService } from '@/services/examLogistics.service';
import { InstitutionLogisticsDashboard, VenueSessionOverview } from '@/types/examLogistics';
import { useLogisticsDashboardRealtime } from '@/hooks/useExamLogisticsRealtime';
import { toast } from 'sonner';

export function InstitutionLogisticsDashboard() {
  const [dashboard, setDashboard] = useState<InstitutionLogisticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const { isConnected } = useRealtimeContext();

  // Load dashboard data
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await examLogisticsService.getInstitutionDashboard();
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
  }, []);

  // Use real-time dashboard updates
  useLogisticsDashboardRealtime(() => {
    loadDashboard();
  });

  // Load dashboard on mount
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Exam Logistics Dashboard</h1>
            <p className="text-muted-foreground">Real-time exam session monitoring</p>
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
            <h1 className="text-3xl font-bold">Exam Logistics Dashboard</h1>
            <p className="text-muted-foreground">Real-time exam session monitoring</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground">
                No exam sessions found for the selected date.
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
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          value={dashboard.totalExpectedStudents.toLocaleString()}
          icon={Users}
          description="Across all venues"
        />
        <StatCard
          title="Students Verified"
          value={`${dashboard.totalVerifiedStudents.toLocaleString()} (${dashboard.attendanceRate.toFixed(1)}%)`}
          icon={UserCheck}
          description="Check-in completed"
          trend={dashboard.attendanceRate >= 90 ? 'up' : dashboard.attendanceRate >= 70 ? 'neutral' : 'down'}
        />
        <StatCard
          title="Invigilators Present"
          value={`${dashboard.totalPresentInvigilators}/${dashboard.totalAssignedInvigilators}`}
          icon={UserCheck}
          description={`${dashboard.invigilatorAttendanceRate.toFixed(1)}% attendance rate`}
          trend={dashboard.invigilatorAttendanceRate >= 95 ? 'up' : dashboard.invigilatorAttendanceRate >= 80 ? 'neutral' : 'down'}
        />
        <StatCard
          title="Active Issues"
          value={dashboard.unresolvedIncidents.toString()}
          icon={AlertTriangle}
          description={`${dashboard.criticalIncidents} critical`}
          trend={dashboard.unresolvedIncidents === 0 ? 'up' : dashboard.unresolvedIncidents <= 5 ? 'neutral' : 'down'}
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
                    {dashboard.activeExamSessions}
                  </div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">
                    {dashboard.totalExamSessions - dashboard.activeExamSessions}
                  </div>
                  <div className="text-sm text-muted-foreground">Scheduled</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Venues Active</span>
                  <span className="font-medium">{dashboard.activeVenues}/{dashboard.totalVenues}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(dashboard.activeVenues / dashboard.totalVenues) * 100}%` }}
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
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div className="text-lg font-bold text-red-600">
                    {dashboard.criticalIncidents}
                  </div>
                  <div className="text-xs text-red-600">Critical</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <div className="text-lg font-bold text-yellow-600">
                    {dashboard.unresolvedIncidents - dashboard.criticalIncidents}
                  </div>
                  <div className="text-xs text-yellow-600">Pending</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {dashboard.totalIncidents - dashboard.unresolvedIncidents}
                  </div>
                  <div className="text-xs text-green-600">Resolved</div>
                </div>
              </div>

              {dashboard.unresolvedIncidents > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {dashboard.unresolvedIncidents} unresolved incident{dashboard.unresolvedIncidents !== 1 ? 's' : ''} require attention
                    </span>
                  </div>
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
  const attendanceRate = venue.totalStudentsExpected > 0
    ? (venue.totalStudentsVerified / venue.totalStudentsExpected) * 100
    : 0;

  const invigilatorRate = venue.totalInvigilatorsAssigned > 0
    ? (venue.totalInvigilatorsPresent / venue.totalInvigilatorsAssigned) * 100
    : 0;

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">{venue.venueName}</h3>
        </div>
        <Badge variant={venue.activeSessions.length > 0 ? "default" : "secondary"}>
          {venue.activeSessions.length} active
        </Badge>
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
          <div className={`text-lg font-bold ${invigilatorRate >= 95 ? 'text-green-600' : invigilatorRate >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
            {venue.totalInvigilatorsPresent}/{venue.totalInvigilatorsAssigned}
          </div>
          <div className="text-xs text-muted-foreground">Invigilators</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${venue.unresolvedIssues === 0 ? 'text-green-600' : venue.unresolvedIssues <= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
            {venue.unresolvedIssues}
          </div>
          <div className="text-xs text-muted-foreground">Issues</div>
        </div>
      </div>

      {venue.activeSessions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Active Sessions:</h4>
          <div className="space-y-1">
            {venue.activeSessions.slice(0, 2).map((session) => (
              <div key={session.examEntryId} className="flex items-center justify-between text-sm bg-accent/50 p-2 rounded">
                <span className="font-medium">{session.courseCode}</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <Badge variant="outline" className="text-xs">
                    {session.verifiedStudents}/{session.expectedStudents}
                  </Badge>
                </div>
              </div>
            ))}
            {venue.activeSessions.length > 2 && (
              <div className="text-xs text-muted-foreground text-center">
                +{venue.activeSessions.length - 2} more sessions
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
