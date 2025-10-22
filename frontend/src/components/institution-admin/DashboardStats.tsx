import { StatCard } from "@/components/ui/stat-card";
import { GraduationCap, Users, BookOpen, Building2 } from "lucide-react";

export function DashboardStats() {
  // TODO: Replace with actual API data
  const stats = [
    {
      title: "Total Students",
      value: "1,923",
      icon: GraduationCap,
      trend: { value: 5.3, isPositive: true },
      description: "Active enrollments",
    },
    {
      title: "Total Instructors",
      value: "145",
      icon: Users,
      trend: { value: 3.2, isPositive: true },
      description: "Faculty members",
    },
    {
      title: "Active Courses",
      value: "87",
      icon: BookOpen,
      trend: { value: 2.1, isPositive: true },
      description: "This semester",
    },
    {
      title: "Departments",
      value: "12",
      icon: Building2,
      trend: { value: 0, isPositive: true },
      description: "Across all faculties",
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
