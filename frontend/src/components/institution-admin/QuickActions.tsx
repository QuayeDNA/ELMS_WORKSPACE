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

export function QuickActions() {
  const actions = [
    {
      title: "Manage Students",
      description: "View, add, and manage student records",
      icon: GraduationCap,
      href: "/admin/students",
      badge: "1,923 Active",
    },
    {
      title: "Manage Instructors",
      description: "Faculty members and staff management",
      icon: Users,
      href: "/admin/instructors",
      badge: "145 Faculty",
    },
    {
      title: "Course Management",
      description: "Courses, offerings, and enrollments",
      icon: BookOpen,
      href: "/admin/courses",
      badge: "87 Courses",
    },
    {
      title: "Departments",
      description: "Department structure and programs",
      icon: Building2,
      href: "/admin/departments",
      badge: "12 Depts",
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
