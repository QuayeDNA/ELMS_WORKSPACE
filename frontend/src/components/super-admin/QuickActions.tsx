import { ActionCard } from "@/components/ui/action-card";
import {
  Building2,
  Users,
  Settings,
  BarChart3,
  Shield,
  Database,
} from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "Manage Institutions",
      description: "View, add, or edit registered institutions",
      icon: Building2,
      href: "/institutions",
      badge: "12 Active",
    },
    {
      title: "System Users",
      description: "Manage all user accounts and permissions",
      icon: Users,
      href: "/users",
      badge: "2,847 Users",
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
