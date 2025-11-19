import { StatCard } from "@/components/ui/stat-card";
import { Building2, Users, GraduationCap, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { institutionService } from "@/services/institution.service";
import { userService } from "@/services/user.service";

export function DashboardStats() {
  // Fetch institution stats
  const { data: institutionStats, isLoading: institutionLoading } = useQuery({
    queryKey: ['institutionStats'],
    queryFn: async () => {
      const response = await institutionService.getOverallAnalytics();
      return response.data;
    },
    staleTime: 60000, // 1 minute
  });

  // Fetch user stats
  const { data: userStats, isLoading: userLoading } = useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const response = await userService.getUsers({ limit: 1 });
      return response.pagination;
    },
    staleTime: 60000, // 1 minute
  });

  const isLoading = institutionLoading || userLoading;

  const stats = [
    {
      title: "Total Institutions",
      value: isLoading ? "..." : String(institutionStats?.totalInstitutions || 0),
      icon: Building2,
      description: "Active educational institutions",
    },
    {
      title: "Total Users",
      value: isLoading ? "..." : String(userStats?.total || 0),
      icon: Users,
      description: "Across all institutions",
    },
    {
      title: "Active Institutions",
      value: isLoading ? "..." : String(institutionStats?.activeInstitutions || 0),
      icon: GraduationCap,
      description: "Currently operational",
    },
    {
      title: "System Health",
      value: "99.8%",
      icon: Activity,
      description: "Uptime this month",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          description={stat.description}
        />
      ))}
    </div>
  );
}
