import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { RoleBadge } from "@/components/ui/role-badge";
import { UserRole } from "@/types/auth";
import {
  LayoutDashboard,
  Building,
  Settings,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  FileCheck,
  AlertTriangle,
  FileText,
  BarChart3,
  ChevronDown,
  ChevronRight,
  School,
  ClipboardCheck,
  Cog,
  Calendar,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  description?: string;
}

interface SidebarGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SidebarItem[];
  roles: UserRole[];
}

type SidebarContent = SidebarItem | SidebarGroup;

// Role-specific navigation items
const getSidebarItemsForRole = (role: UserRole): SidebarContent[] => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
          roles: [UserRole.SUPER_ADMIN],
          description: "System overview and analytics",
        },
        {
          title: "Management",
          icon: Building,
          roles: [UserRole.SUPER_ADMIN],
          items: [
            {
              title: "Institutions",
              href: "/institutions",
              icon: Building,
              roles: [UserRole.SUPER_ADMIN],
              description: "Register and manage institutions",
            },
            {
              title: "Users",
              href: "/users",
              icon: Users,
              roles: [UserRole.SUPER_ADMIN],
              description: "Manage all system users",
            },
          ],
        },
        {
          title: "System",
          icon: Cog,
          roles: [UserRole.SUPER_ADMIN],
          items: [
            {
              title: "Audit Logs",
              href: "/system/audit-logs",
              icon: FileText,
              roles: [UserRole.SUPER_ADMIN],
              description: "View system audit logs",
            },
            {
              title: "System Health",
              href: "/system/health",
              icon: BarChart3,
              roles: [UserRole.SUPER_ADMIN],
              description: "Monitor system health",
            },
            {
              title: "Backups",
              href: "/system/backups",
              icon: FileCheck,
              roles: [UserRole.SUPER_ADMIN],
              description: "Manage system backups",
            },
          ],
        },
        {
          title: "Settings",
          href: "/settings",
          icon: Settings,
          roles: [UserRole.SUPER_ADMIN],
          description: "System configuration",
        },
      ];

    case UserRole.ADMIN:
      return [
        {
          title: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
          roles: [UserRole.ADMIN],
          description: "Institution overview",
        },
        {
          title: "Academics",
          icon: School,
          roles: [UserRole.ADMIN],
          items: [
            {
              title: "Students",
              href: "/admin/students",
              icon: GraduationCap,
              roles: [UserRole.ADMIN],
              description: "Manage students",
            },
            {
              title: "Instructors",
              href: "/admin/instructors",
              icon: Users,
              roles: [UserRole.ADMIN],
              description: "Manage instructors",
            },
            {
              title: "Faculty",
              href: "/admin/faculty",
              icon: Building2,
              roles: [UserRole.ADMIN],
              description: "Manage faculty",
            },
            {
              title: "Departments",
              href: "/admin/departments",
              icon: Building2,
              roles: [UserRole.ADMIN],
              description: "Manage departments",
            },
            {
              title: "Courses",
              href: "/admin/courses",
              icon: BookOpen,
              roles: [UserRole.ADMIN],
              description: "Manage courses",
            },
            {
              title: "Programs",
              href: "/admin/programs",
              icon: GraduationCap,
              roles: [UserRole.ADMIN],
              description: "Manage programs",
            },
          ],
        },
        {
          title: "Academic Calendar",
          href: "/admin/academic-calendar",
          icon: Calendar,
          roles: [UserRole.ADMIN],
          description: "Manage academic years, semesters, and periods",
        },
        {
          title: "Examination",
          icon: ClipboardCheck,
          roles: [UserRole.ADMIN],
          items: [
            {
              title: "Exams",
              href: "/admin/exams",
              icon: FileCheck,
              roles: [UserRole.ADMIN],
              description: "Manage examinations",
            },
            {
              title: "Venues",
              href: "/admin/venues",
              icon: Building2,
              roles: [UserRole.ADMIN],
              description: "Manage exam venues and rooms",
            },
            {
              title: "Incidents",
              href: "/admin/incidents",
              icon: AlertTriangle,
              roles: [UserRole.ADMIN],
              description: "Track incidents",
            },
            {
              title: "Scripts",
              href: "/admin/scripts",
              icon: FileText,
              roles: [UserRole.ADMIN],
              description: "Manage scripts",
            },
          ],
        },
        {
          title: "System",
          icon: Cog,
          roles: [UserRole.ADMIN],
          items: [
            {
              title: "Users",
              href: "/admin/users",
              icon: Users,
              roles: [UserRole.ADMIN],
              description: "Manage users",
            },
            {
              title: "Reports",
              href: "/admin/reports",
              icon: BarChart3,
              roles: [UserRole.ADMIN],
              description: "View reports",
            },
            {
              title: "Settings",
              href: "/admin/settings",
              icon: Settings,
              roles: [UserRole.ADMIN],
              description: "Institution settings",
            },
          ],
        },
      ];

    case UserRole.FACULTY_ADMIN:
      return [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
          roles: [UserRole.FACULTY_ADMIN],
          description: "Faculty overview",
        },
        {
          title: "Settings",
          href: "/settings",
          icon: Settings,
          roles: [UserRole.FACULTY_ADMIN],
          description: "Faculty settings",
        },
      ];

    case UserRole.STUDENT:
      return [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
          roles: [UserRole.STUDENT],
          description: "My exams and results",
        },
        {
          title: "Settings",
          href: "/settings",
          icon: Settings,
          roles: [UserRole.STUDENT],
          description: "My profile",
        },
      ];

    default:
      return [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
          roles: [role],
          description: "Overview",
        },
        {
          title: "Settings",
          href: "/settings",
          icon: Settings,
          roles: [role],
          description: "Settings",
        },
      ];
  }
};

interface SidebarProps {
  readonly collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuthStore();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["Academics"])
  );

  if (!user) return null;

  const sidebarItems = getSidebarItemsForRole(user.role);

  const isActive = (href: string): boolean => {
    if (href === "/dashboard" || href === "/admin") {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupTitle)) {
        newSet.delete(groupTitle);
      } else {
        newSet.add(groupTitle);
      }
      return newSet;
    });
  };

  const isGroupActive = (group: SidebarGroup): boolean => {
    return group.items.some((item) => isActive(item.href));
  };

  const renderNavItem = (item: SidebarItem) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link
        key={item.href}
        to={item.href}
        className={cn(
          "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ml-4 relative",
          active
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
          collapsed ? "justify-center px-2 ml-0" : ""
        )}
        title={collapsed ? item.title : undefined}
      >
        {/* Active indicator */}
        {active && !collapsed && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground rounded-r-full" />
        )}

        <Icon className={cn(
          "h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110",
          !collapsed && "mr-3",
          active && "drop-shadow-sm"
        )} />

        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="truncate">{item.title}</div>
          </div>
        )}
      </Link>
    );
  };

  const renderNavGroup = (group: SidebarGroup) => {
    const Icon = group.icon;
    const isExpanded = expandedGroups.has(group.title);
    const active = isGroupActive(group);

    return (
      <div key={group.title} className="space-y-1">
        <button
          onClick={() => toggleGroup(group.title)}
          className={cn(
            "flex items-center w-full px-3 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 group",
            active
              ? "bg-primary/10 text-primary"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
            collapsed ? "justify-center px-2" : ""
          )}
          title={collapsed ? group.title : undefined}
        >
          <Icon className={cn(
            "h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110",
            !collapsed && "mr-3"
          )} />
          {!collapsed && (
            <div className="flex-1 flex items-center justify-between min-w-0">
              <div className="truncate">{group.title}</div>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-400 transition-transform" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400 transition-transform" />
              )}
            </div>
          )}
        </button>
        {!collapsed && (
          <div
            className={cn(
              "space-y-1 overflow-hidden transition-all duration-300",
              isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            {group.items.map((item) => renderNavItem(item))}
          </div>
        )}
      </div>
    );
  };

  const renderSidebarContent = (content: SidebarContent) => {
    if ("items" in content) {
      return renderNavGroup(content);
    } else {
      return renderNavItem(content);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-16 px-4 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-transparent",
          collapsed && "justify-center px-2"
        )}
      >
        {collapsed ? (
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">E</span>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg">ELMS</h1>
              <p className="text-xs text-gray-500">Exam Logistics</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <nav className="space-y-2">
          {sidebarItems.map((content) => renderSidebarContent(content))}
        </nav>
      </div>

      {/* User Section */}
      {user && (
        <>
          <Separator />
          <div className={cn(
            "p-4 bg-gradient-to-r from-primary/5 to-transparent",
            collapsed && "p-2"
          )}>
            {collapsed ? (
              <div className="w-10 h-10 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || 'U'}
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.firstName || 'User'} {user?.lastName || ''}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || 'No email'}
                    </p>
                  </div>
                </div>
                <RoleBadge role={user.role} className="w-full justify-center" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

