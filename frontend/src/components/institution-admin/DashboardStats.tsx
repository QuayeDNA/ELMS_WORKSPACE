import { StatCard } from "@/components/ui/stat-card";
import { GraduationCap, Users, BookOpen, Building2 } from "lucide-react";
import { useInstitutionAnalytics } from "@/contexts/InstitutionAnalyticsContext";

export function DashboardStats() {
  const { analytics, loading } = useInstitutionAnalytics();

  const statCards = [
    {
      title: "Total Students",
      value: loading ? "..." : (analytics?.totalStudents || 0).toLocaleString(),
      icon: GraduationCap,
      description: "Active enrollments",
    },
    {
      title: "Total Instructors",
      value: loading ? "..." : (analytics?.totalLecturers || 0).toLocaleString(),
      icon: Users,
      description: "Faculty members",
    },
    {
      title: "Total Users",
      value: loading ? "..." : (analytics?.totalUsers || 0).toLocaleString(),
      icon: BookOpen,
      description: "All system users",
    },
    {
      title: "Faculties",
      value: loading ? "..." : (analytics?.totalFaculties || 0).toLocaleString(),
      icon: Building2,
      description: "Across institution",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
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
