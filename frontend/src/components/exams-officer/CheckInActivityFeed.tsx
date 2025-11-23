import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRealtimeContext } from '@/contexts/RealtimeContext';
import { RealtimeEvent } from '@/types/realtime';
import { CheckCircle, Clock, MapPin, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CheckInEvent {
  verificationId: number;
  examEntryId: number;
  studentId: number;
  student: {
    studentNumber: string;
    firstName: string;
    lastName: string;
  };
  exam: {
    courseCode: string;
    courseName: string;
    examDate: string;
    startTime: string;
    venue: string;
  };
  seatNumber: string | null;
  checkedInAt: string;
  method: string;
}

interface CheckInStats {
  examEntryId: number;
  courseCode: string;
  stats: {
    expected: number;
    checkedIn: number;
    pending: number;
    attendanceRate: number;
  };
}

interface Props {
  examEntryId?: number;
  maxEvents?: number;
}

export function CheckInActivityFeed({ examEntryId, maxEvents = 20 }: Props) {
  const [checkIns, setCheckIns] = useState<CheckInEvent[]>([]);
  const [stats, setStats] = useState<Map<number, CheckInStats>>(new Map());
  const { socket, isConnected } = useRealtimeContext();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for check-in events
    const handleCheckIn = (event: RealtimeEvent) => {
      const payload = event.payload as CheckInEvent;

      // Filter by exam entry if specified
      if (examEntryId && payload.examEntryId !== examEntryId) {
        return;
      }

      setCheckIns((prev) => {
        const updated = [payload, ...prev].slice(0, maxEvents);
        return updated;
      });
    };

    // Listen for stats updates
    const handleStatsUpdate = (event: RealtimeEvent) => {
      const payload = event.payload as CheckInStats;

      setStats((prev) => {
        const updated = new Map(prev);
        updated.set(payload.examEntryId, payload);
        return updated;
      });
    };

    socket.on('exam:checkin', (event: RealtimeEvent) => {
      if (event.event === 'student:checked-in') {
        handleCheckIn(event);
      } else if (event.event === 'checkin:stats:updated') {
        handleStatsUpdate(event);
      }
    });

    return () => {
      socket.off('exam:checkin');
    };
  }, [socket, isConnected, examEntryId, maxEvents]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getMethodBadge = (method: string) => {
    switch (method.toUpperCase()) {
      case 'QR_CODE':
        return <Badge variant="default">QR Code</Badge>;
      case 'MANUAL':
        return <Badge variant="secondary">Manual</Badge>;
      case 'BIOMETRIC':
        return <Badge variant="outline">Biometric</Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Check-In Activity
          </CardTitle>
          <CardDescription>Real-time student check-in notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <p>Connecting to real-time updates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Check-In Activity
          {isConnected && (
            <Badge variant="outline" className="ml-auto">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Real-time student check-in notifications</CardDescription>
      </CardHeader>
      <CardContent>
        {checkIns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mb-4 text-muted-foreground/30" />
            <p>No check-ins yet</p>
            <p className="text-sm">Check-ins will appear here in real-time</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {checkIns.map((checkIn) => {
                const examStats = stats.get(checkIn.examEntryId);

                return (
                  <div
                    key={checkIn.verificationId}
                    className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors animate-in fade-in slide-in-from-top-2 duration-300"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(checkIn.student.firstName, checkIn.student.lastName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">
                            {checkIn.student.firstName} {checkIn.student.lastName}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{checkIn.student.studentNumber}</span>
                          </div>
                        </div>
                        {getMethodBadge(checkIn.method)}
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="font-medium text-foreground">
                          {checkIn.exam.courseCode} - {checkIn.exam.courseName}
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{checkIn.exam.venue}</span>
                          </div>
                          {checkIn.seatNumber && (
                            <div className="flex items-center gap-1">
                              <span>Seat: {checkIn.seatNumber}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatDistanceToNow(new Date(checkIn.checkedInAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>

                        {examStats && (
                          <div className="flex items-center gap-2 pt-2">
                            <Badge variant="secondary" className="text-xs">
                              {examStats.stats.checkedIn} / {examStats.stats.expected} students
                            </Badge>
                            <Badge
                              variant={
                                examStats.stats.attendanceRate >= 90
                                  ? 'default'
                                  : examStats.stats.attendanceRate >= 70
                                  ? 'secondary'
                                  : 'destructive'
                              }
                              className="text-xs"
                            >
                              {examStats.stats.attendanceRate.toFixed(1)}% attendance
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
