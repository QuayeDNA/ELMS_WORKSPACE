import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { institutionService } from "@/services/institution.service";
import { formatDistanceToNow } from "date-fns";

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
  // Fetch recent institutions
  const { data: institutionStats, isLoading } = useQuery({
    queryKey: ['institutionStats'],
    queryFn: async () => {
      const response = await institutionService.getOverallAnalytics();
      return response.data;
    },
    staleTime: 60000,
  });

  // Map recent institutions to activities
  const activities: Activity[] = (
    institutionStats?.recentInstitutions?.slice(0, 5).map((inst, idx) => ({
      id: String(inst.id || idx),
      type: "institution" as const,
      title: "New Institution Added",
      description: `${inst.name} registered`,
      user: { name: "System", initials: "SY" },
      timestamp: inst.createdAt ? formatDistanceToNow(new Date(inst.createdAt), { addSuffix: true }) : "Recently",
      icon: Building2,
    })) || []
  );

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
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading recent activities...</div>
          ) : activities.length === 0 ? (
            <div className="text-sm text-muted-foreground">No recent activities to display</div>
          ) : (
            activities.map((activity) => {
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
          })
        )}
        </div>
      </CardContent>
    </Card>
  );
}
