import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
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
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

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
          description: "Manage all users in the system",
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
          ],
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
          "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group ml-4",
          active
            ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
          collapsed ? "justify-center px-2 ml-0" : ""
        )}
        title={collapsed ? item.title : undefined}
      >
        <Icon className={cn("h-4 w-4 flex-shrink-0", !collapsed && "mr-3")} />
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="truncate font-medium">{item.title}</div>
            {item.description && (
              <div className="text-xs text-gray-500 truncate mt-0.5">
                {item.description}
              </div>
            )}
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
            "flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
            active
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
            collapsed ? "justify-center px-2" : ""
          )}
          title={collapsed ? group.title : undefined}
        >
          <Icon className={cn("h-5 w-5 flex-shrink-0", !collapsed && "mr-3")} />
          {!collapsed && (
            <div className="flex-1 flex items-center justify-between min-w-0">
              <div className="truncate font-medium">{group.title}</div>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </div>
          )}
        </button>
        {!collapsed && isExpanded && (
          <div className="space-y-1">
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
        "flex flex-col h-full bg-white border-r border-gray-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center px-4 py-4 border-b border-gray-200",
          collapsed && "justify-center px-2"
        )}
      >
        {collapsed ? (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">ELMS</h1>
              <p className="text-xs text-gray-500">Exam System</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((content) => renderSidebarContent(content))}
      </nav>

      {/* User Role Badge */}
      {!collapsed && user && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Current Role</div>
          <div className="inline-block px-3 py-2 bg-blue-100 text-blue-800 text-xs rounded-lg font-medium">
            {user.role
              .replace("_", " ")
              .toLowerCase()
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {user.firstName} {user.lastName}
          </div>
        </div>
      )}
    </div>
  );
}
