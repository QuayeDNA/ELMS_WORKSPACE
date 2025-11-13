import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { RoleBadge } from '@/components/ui/role-badge';
import {
  LogOut,
  User,
  Bell,
  Settings,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate, useLocation } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

export function Header() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  // Get breadcrumb from current path
  const getBreadcrumb = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return 'Home';
    return paths[paths.length - 1]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 h-16 flex-shrink-0 shadow-sm">
      <div className="h-full px-4 lg:px-6 flex justify-between items-center">
        {/* Left section - Breadcrumb */}
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 text-sm">
            <span className="text-gray-500">Dashboard</span>
            <span className="text-gray-400">/</span>
            <span className="font-medium text-gray-900">{getBreadcrumb()}</span>
          </div>
          <span className="lg:hidden text-lg font-semibold text-gray-900">
            ELMS
          </span>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            title="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
          </Button>

          {/* Help */}
          <Button
            variant="ghost"
            size="icon"
            title="Help & Support"
          >
            <HelpCircle className="h-5 w-5 text-gray-600" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-3 h-10 px-3"
              >
                {/* Avatar */}
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    {user?.lastName?.charAt(0)?.toUpperCase() || ''}
                  </span>
                </div>

                {/* User Info - Hidden on mobile */}
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user?.email || 'No email'}
                  </span>
                </div>

                <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-medium">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email || 'No email'}</p>
                  <RoleBadge role={user.role} className="w-fit" />
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                My Profile
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}



