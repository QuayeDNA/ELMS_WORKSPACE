import { useEffect, useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { GraduationCap, Users, BookOpen, Building2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { institutionService } from "@/services/institution.service";

interface InstitutionStats {
  totalUsers: number;
  totalStudents: number;
  totalLecturers: number;
  totalFaculties: number;
  usersByRole: Record<string, number>;
}

export function DashboardStats() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<InstitutionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.institutionId) return;

      try {
        setLoading(true);
        const response = await institutionService.getInstitutionAnalytics(user.institutionId);
        if (response) {
          setStats(response);
        }
      } catch (error) {
        console.error("Error loading institution stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user?.institutionId]);

  const statCards = [
    {
      title: "Total Students",
      value: loading ? "..." : (stats?.totalStudents || 0).toLocaleString(),
      icon: GraduationCap,
      description: "Active enrollments",
    },
    {
      title: "Total Instructors",
      value: loading ? "..." : (stats?.totalLecturers || 0).toLocaleString(),
      icon: Users,
      description: "Faculty members",
    },
    {
      title: "Total Users",
      value: loading ? "..." : (stats?.totalUsers || 0).toLocaleString(),
      icon: BookOpen,
      description: "All system users",
    },
    {
      title: "Faculties",
      value: loading ? "..." : (stats?.totalFaculties || 0).toLocaleString(),
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
