import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  UserPlus,
  BookPlus,
  Calendar,
  FileEdit,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { institutionService } from "@/services/institution.service";

interface Activity {
  id: string;
  type: "student" | "instructor" | "course" | "academic" | "exam";
  title: string;
  description: string;
  user: {
    name: string;
    initials: string;
  };
  timestamp: string;
  icon: React.ElementType;
}

export function RecentActivity() {
  const { user } = useAuthStore();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const loadRecentActivity = async () => {
      if (!user?.institutionId) return;

      try {
        const response = await institutionService.getInstitutionAnalytics(user.institutionId);

        if (response?.recentActivity) {
          // Transform backend activity data to match our Activity interface
          interface BackendActivity {
            type: string;
            count: number;
            time: string;
          }

          const transformedActivities: Activity[] = response.recentActivity.map((item: BackendActivity, index: number) => ({
            id: `activity-${index}`,
            type: (item.type as Activity["type"]) || "academic",
            title: `${item.type}: ${item.count}`,
            description: `${item.count} ${item.type} activities`,
            user: { name: "System", initials: "SY" },
            timestamp: item.time || "Recently",
            icon: getIconForType(item.type),
          }));
          setActivities(transformedActivities);
        } else {
          setActivities(getDefaultActivities());
        }
      } catch (error) {
        console.error("Error loading recent activity:", error);
        // Fallback to default activities
        setActivities(getDefaultActivities());
      }
    };

    loadRecentActivity();
  }, [user?.institutionId]);

  const getIconForType = (type: string) => {
    switch (type) {
      case "student":
        return UserPlus;
      case "instructor":
        return Users;
      case "course":
        return BookPlus;
      case "academic":
        return Calendar;
      case "exam":
        return FileEdit;
      default:
        return Calendar;
    }
  };

  const getDefaultActivities = (): Activity[] => [
    {
      id: "1",
      type: "student",
      title: "New Student Enrollment",
      description: "15 students enrolled in Computer Science program",
      user: { name: "Admissions Office", initials: "AO" },
      timestamp: "10 minutes ago",
      icon: UserPlus,
    },
    {
      id: "2",
      type: "course",
      title: "Course Updated",
      description: "CS301 - Data Structures syllabus updated",
      user: { name: "Dr. Sarah Jones", initials: "SJ" },
      timestamp: "1 hour ago",
      icon: BookPlus,
    },
    {
      id: "3",
      type: "academic",
      title: "Academic Period Created",
      description: "Registration period for Fall 2025 semester",
      user: { name: "Academic Office", initials: "AC" },
      timestamp: "2 hours ago",
      icon: Calendar,
    },
  ];

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "student":
        return "text-blue-600 bg-blue-100 dark:bg-blue-950";
      case "instructor":
        return "text-purple-600 bg-purple-100 dark:bg-purple-950";
      case "course":
        return "text-green-600 bg-green-100 dark:bg-green-950";
      case "academic":
        return "text-orange-600 bg-orange-100 dark:bg-orange-950";
      case "exam":
        return "text-red-600 bg-red-100 dark:bg-red-950";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-950";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div
                  className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {activity.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-5 w-5 text-xs">
                      {activity.user.initials}
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {activity.user.name}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
