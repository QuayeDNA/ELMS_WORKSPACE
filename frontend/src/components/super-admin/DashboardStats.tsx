import { StatCard } from "@/components/ui/stat-card";
import { Building2, Users, GraduationCap, Activity } from "lucide-react";

export function DashboardStats() {
  // TODO: Replace with actual API data
  const stats = [
    {
      title: "Total Institutions",
      value: "12",
      icon: Building2,
      trend: { value: 8.2, label: "from last month" },
      description: "Active educational institutions",
    },
    {
      title: "Total Users",
      value: "2,847",
      icon: Users,
      trend: { value: 12.5, label: "from last month" },
      description: "Across all institutions",
    },
    {
      title: "Active Students",
      value: "1,923",
      icon: GraduationCap,
      trend: { value: 5.3, label: "from last month" },
      description: "Currently enrolled",
    },
    {
      title: "System Health",
      value: "99.8%",
      icon: Activity,
      trend: { value: 0.2, label: "from last month" },
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
          trend={stat.trend}
          description={stat.description}
        />
      ))}
    </div>
  );
}
