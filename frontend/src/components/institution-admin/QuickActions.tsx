import { useEffect, useState } from "react";
import { ActionCard } from "@/components/ui/action-card";
import {
  GraduationCap,
  Users,
  BookOpen,
  Building2,
  Calendar,
  FileText,
  ClipboardList,
  Settings,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { institutionService } from "@/services/institution.service";

interface InstitutionStats {
  totalStudents: number;
  totalLecturers: number;
}

export function QuickActions() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<InstitutionStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.institutionId) return;

      try {
        const response = await institutionService.getInstitutionAnalytics(user.institutionId);
        if (response) {
          setStats(response);
        }
      } catch (error) {
        console.error("Error loading stats for quick actions:", error);
      }
    };

    loadStats();
  }, [user?.institutionId]);

  const actions = [
    {
      title: "Manage Students",
      description: "View, add, and manage student records",
      icon: GraduationCap,
      href: "/admin/students",
      badge: stats ? `${stats.totalStudents} Active` : undefined,
    },
    {
      title: "Manage Instructors",
      description: "Faculty members and staff management",
      icon: Users,
      href: "/admin/instructors",
      badge: stats ? `${stats.totalLecturers} Faculty` : undefined,
    },
    {
      title: "Course Management",
      description: "Courses, offerings, and enrollments",
      icon: BookOpen,
      href: "/admin/courses",
    },
    {
      title: "Departments",
      description: "Department structure and programs",
      icon: Building2,
      href: "/admin/departments",
    },
    {
      title: "Academic Calendar",
      description: "Manage semesters and academic periods",
      icon: Calendar,
      href: "/admin/academic/years",
    },
    {
      title: "Exams Management",
      description: "Schedule and manage examinations",
      icon: ClipboardList,
      href: "/admin/exams",
    },
    {
      title: "Reports",
      description: "Generate institutional reports",
      icon: FileText,
      href: "/admin/reports",
    },
    {
      title: "Settings",
      description: "Institution configuration",
      icon: Settings,
      href: "/admin/settings",
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
