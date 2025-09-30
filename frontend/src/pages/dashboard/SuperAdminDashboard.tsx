import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { 
  Building, 
  Users, 
  Settings,
  BarChart3,
  LogOut,
  Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardCard {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  count?: string;
}

export function SuperAdminDashboard() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  const dashboardCards: DashboardCard[] = [
    {
      title: 'Institutions',
      description: 'Manage registered institutions',
      icon: Building,
      href: '/institutions',
      count: '0' // Will be populated from API
    },
    {
      title: 'System Users',
      description: 'Manage all system users',
      icon: Users,
      href: '/users',
      count: '0' // Will be populated from API
    },
    {
      title: 'Analytics',
      description: 'System-wide analytics and reports',
      icon: BarChart3,
      href: '/analytics',
      count: '0' // Will be populated from API
    },
    {
      title: 'System Settings',
      description: 'Global system configuration',
      icon: Settings,
      href: '/settings'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.firstName} {user?.lastName}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-800 rounded-lg">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Super Admin</span>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.href} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <Icon className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                {card.count && (
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {card.count}
                  </div>
                )}
                <CardDescription className="text-sm text-gray-600 mb-4">
                  {card.description}
                </CardDescription>
                <Link to={card.href}>
                  <Button size="sm" className="w-full">
                    Manage
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Current system health and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Server Status</span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-sm font-medium text-gray-900">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest system activities and events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                No recent activities to display
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



