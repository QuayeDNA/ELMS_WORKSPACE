import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, GraduationCap, Clock, AlertCircle } from "lucide-react";

interface AcademicPeriod {
  name: string;
  type: "registration" | "classes" | "exams" | "break";
  status: "active" | "upcoming" | "completed";
  startDate: string;
  endDate: string;
  daysRemaining?: number;
}

interface UpcomingEvent {
  title: string;
  date: string;
  type: "deadline" | "event" | "exam";
  description: string;
}

export function AcademicOverview() {
  // TODO: Replace with actual API data
  const currentPeriod: AcademicPeriod = {
    name: "Fall 2025 - Registration",
    type: "registration",
    status: "active",
    startDate: "Oct 1, 2025",
    endDate: "Oct 31, 2025",
    daysRemaining: 10,
  };

  const upcomingEvents: UpcomingEvent[] = [
    {
      title: "Late Registration Deadline",
      date: "Oct 25, 2025",
      type: "deadline",
      description: "Last day for late course registration",
    },
    {
      title: "Classes Begin",
      date: "Nov 1, 2025",
      type: "event",
      description: "Fall semester classes commence",
    },
    {
      title: "Mid-Semester Exams",
      date: "Dec 15, 2025",
      type: "exam",
      description: "Mid-semester examination period",
    },
  ];

  const getStatusColor = (status: AcademicPeriod["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-100";
      case "upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-100";
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-100";
    }
  };

  const getEventIcon = (type: UpcomingEvent["type"]) => {
    switch (type) {
      case "deadline":
        return AlertCircle;
      case "event":
        return Calendar;
      case "exam":
        return GraduationCap;
    }
  };

  const getEventColor = (type: UpcomingEvent["type"]) => {
    switch (type) {
      case "deadline":
        return "text-red-600 bg-red-100 dark:bg-red-950";
      case "event":
        return "text-blue-600 bg-blue-100 dark:bg-blue-950";
      case "exam":
        return "text-orange-600 bg-orange-100 dark:bg-orange-950";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Current Academic Period */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Current Academic Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg">{currentPeriod.name}</h3>
                <Badge className={getStatusColor(currentPeriod.status)}>
                  {currentPeriod.status}
                </Badge>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {currentPeriod.startDate} - {currentPeriod.endDate}
                  </span>
                </div>
                {currentPeriod.daysRemaining !== undefined && (
                  <div className="mt-3 p-2 rounded bg-background">
                    <p className="text-xs font-medium text-primary">
                      {currentPeriod.daysRemaining} days remaining
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border bg-card">
                <p className="text-xs text-muted-foreground">Total Enrolled</p>
                <p className="text-2xl font-bold mt-1">1,850</p>
              </div>
              <div className="p-3 rounded-lg border bg-card">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold mt-1">73</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Upcoming Events & Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => {
              const Icon = getEventIcon(event.type);
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${getEventColor(event.type)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">{event.title}</p>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {event.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.description}
                    </p>
                    <p className="text-xs font-medium text-primary mt-2">
                      {event.date}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
