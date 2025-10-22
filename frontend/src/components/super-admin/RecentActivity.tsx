import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, UserPlus, Building2, Settings, Shield } from "lucide-react";

interface Activity {
  id: string;
  type: "user" | "institution" | "system" | "security";
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
  // TODO: Replace with actual API data
  const activities: Activity[] = [
    {
      id: "1",
      type: "institution",
      title: "New Institution Added",
      description: "Ghana Institute of Technology registered",
      user: { name: "System", initials: "SY" },
      timestamp: "10 minutes ago",
      icon: Building2,
    },
    {
      id: "2",
      type: "user",
      title: "Admin User Created",
      description: "John Administrator added to GIT",
      user: { name: "Super Admin", initials: "SA" },
      timestamp: "25 minutes ago",
      icon: UserPlus,
    },
    {
      id: "3",
      type: "security",
      title: "Security Settings Updated",
      description: "Two-factor authentication enabled system-wide",
      user: { name: "Super Admin", initials: "SA" },
      timestamp: "1 hour ago",
      icon: Shield,
    },
    {
      id: "4",
      type: "system",
      title: "System Configuration Changed",
      description: "Email notification settings updated",
      user: { name: "System", initials: "SY" },
      timestamp: "2 hours ago",
      icon: Settings,
    },
    {
      id: "5",
      type: "user",
      title: "Bulk User Import",
      description: "145 student accounts created",
      user: { name: "John Administrator", initials: "JA" },
      timestamp: "3 hours ago",
      icon: UserPlus,
    },
  ];

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "institution":
        return "text-blue-600 bg-blue-100 dark:bg-blue-950";
      case "user":
        return "text-green-600 bg-green-100 dark:bg-green-950";
      case "security":
        return "text-red-600 bg-red-100 dark:bg-red-950";
      case "system":
        return "text-orange-600 bg-orange-100 dark:bg-orange-950";
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
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
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
