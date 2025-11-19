import { ActionCard } from "@/components/ui/action-card";
import {
  Building2,
  Users,
  Settings,
  BarChart3,
  Shield,
  Database,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { institutionService } from "@/services/institution.service";
import { userService } from "@/services/user.service";

export function QuickActions() {
  // Fetch stats for badges
  const { data: institutionStats } = useQuery({
    queryKey: ['institutionStats'],
    queryFn: async () => {
      const response = await institutionService.getOverallAnalytics();
      return response.data;
    },
    staleTime: 60000,
  });

  const { data: userStats } = useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const response = await userService.getUsers({ limit: 1 });
      return response.pagination;
    },
    staleTime: 60000,
  });

  const actions = [
    {
      title: "Manage Institutions",
      description: "View, add, or edit registered institutions",
      icon: Building2,
      href: "/institutions",
      badge: `${institutionStats?.activeInstitutions || 0} Active`,
    },
    {
      title: "System Users",
      description: "Manage all user accounts and permissions",
      icon: Users,
      href: "/users",
      badge: `${userStats?.total?.toLocaleString() || 0} Users`,
    },
    {
      title: "System Analytics",
      description: "View system-wide reports and insights",
      icon: BarChart3,
      href: "/analytics",
      badge: "New Reports",
    },
    {
      title: "Access Control",
      description: "Manage roles and permissions",
      icon: Shield,
      href: "/settings/permissions",
    },
    {
      title: "System Settings",
      description: "Configure global system preferences",
      icon: Settings,
      href: "/settings",
    },
    {
      title: "Database Management",
      description: "Backup, restore, and maintain data",
      icon: Database,
      href: "/settings/database",
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => (
          <ActionCard
            key={action.title}
            title={action.title}
            description={action.description}
            icon={action.icon}
            href={action.href}
            badge={action.badge}
          />
        ))}
      </div>
    </div>
  );
}
