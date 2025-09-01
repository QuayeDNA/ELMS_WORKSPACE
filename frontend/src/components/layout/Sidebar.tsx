import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/types/auth';
import {
  LayoutDashboard,
  Building,
  Settings
} from 'lucide-react';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  description?: string;
}

// Role-specific navigation items
const getSidebarItemsForRole = (role: UserRole): SidebarItem[] => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return [
        {
          title: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          roles: [UserRole.SUPER_ADMIN],
          description: 'System overview and analytics'
        },
        {
          title: 'Institutions',
          href: '/institutions',
          icon: Building,
          roles: [UserRole.SUPER_ADMIN],
          description: 'Register and manage institutions'
        },
        {
          title: 'Settings',
          href: '/settings',
          icon: Settings,
          roles: [UserRole.SUPER_ADMIN],
          description: 'System configuration'
        }
      ];

    case UserRole.ADMIN:
      return [
        {
          title: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          roles: [UserRole.ADMIN],
          description: 'Institution overview'
        },
        {
          title: 'Settings',
          href: '/settings',
          icon: Settings,
          roles: [UserRole.ADMIN],
          description: 'Institution settings'
        }
      ];

    case UserRole.FACULTY_ADMIN:
      return [
        {
          title: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          roles: [UserRole.FACULTY_ADMIN],
          description: 'Faculty overview'
        },
        {
          title: 'Settings',
          href: '/settings',
          icon: Settings,
          roles: [UserRole.FACULTY_ADMIN],
          description: 'Faculty settings'
        }
      ];

    case UserRole.STUDENT:
      return [
        {
          title: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          roles: [UserRole.STUDENT],
          description: 'My exams and results'
        },
        {
          title: 'Settings',
          href: '/settings',
          icon: Settings,
          roles: [UserRole.STUDENT],
          description: 'My profile'
        }
      ];

    default:
      return [
        {
          title: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          roles: [role],
          description: 'Overview'
        },
        {
          title: 'Settings',
          href: '/settings',
          icon: Settings,
          roles: [role],
          description: 'Settings'
        }
      ];
  }
};

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuthStore();

  if (!user) return null;

  const sidebarItems = getSidebarItemsForRole(user.role);

  const isActive = (href: string): boolean => {
    if (href === '/dashboard') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const renderNavItem = (item: SidebarItem) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link
        key={item.href}
        to={item.href}
        className={cn(
          'flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors group',
          active
            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
          collapsed ? 'justify-center px-2' : ''
        )}
        title={collapsed ? item.title : undefined}
      >
        <Icon className={cn('h-5 w-5 flex-shrink-0', !collapsed && 'mr-3')} />
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

  return (
    <div className={cn(
      'flex flex-col h-full bg-white border-r border-gray-200',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className={cn(
        'flex items-center px-4 py-4 border-b border-gray-200',
        collapsed && 'justify-center px-2'
      )}>
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
        {sidebarItems.map(item => renderNavItem(item))}
      </nav>

      {/* User Role Badge */}
      {!collapsed && user && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Current Role</div>
          <div className="inline-block px-3 py-2 bg-blue-100 text-blue-800 text-xs rounded-lg font-medium">
            {user.role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {user.firstName} {user.lastName}
          </div>
        </div>
      )}
    </div>
  );
}