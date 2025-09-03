import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/types/auth';
import { 
  Users, 
  GraduationCap, 
  FileText, 
  Calendar,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardCard {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
}

export function DashboardPage() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  const getRoleBasedCards = () => {
    const baseCards = [
      {
        title: 'Settings',
        description: 'View and edit your profile information',
        icon: Settings,
        href: '/settings',
      },
    ];

    const roleSpecificCards: Record<UserRole, DashboardCard[]> = {
      [UserRole.SUPER_ADMIN]: [
        {
          title: 'Institution Management',
          description: 'Manage institutions and system settings',
          icon: GraduationCap,
          href: '/institutions',
        },
        {
          title: 'User Management',
          description: 'Manage all users and permissions',
          icon: Users,
          href: '/users',
        },
        {
          title: 'System Analytics',
          description: 'View system-wide analytics and reports',
          icon: BarChart3,
          href: '/settings', // Placeholder - can be updated when analytics route is added
        },
      ],
      [UserRole.ADMIN]: [
        {
          title: 'Institution Dashboard',
          description: 'Manage faculties, departments, and users',
          icon: GraduationCap,
          href: '/admin/institution',
        },
        {
          title: 'User Management',
          description: 'Manage faculty and staff accounts',
          icon: Users,
          href: '/users',
        },
      ],
      [UserRole.FACULTY_ADMIN]: [
        {
          title: 'Faculty Management',
          description: 'Manage departments and programs',
          icon: GraduationCap,
          href: '/settings', // Placeholder - can be updated when faculty route is added
        },
        {
          title: 'Exam Management',
          description: 'Schedule and manage examinations',
          icon: Calendar,
          href: '/settings', // Placeholder - can be updated when exams route is added
        },
      ],
      [UserRole.DEAN]: [
        {
          title: 'Faculty Management',
          description: 'Manage faculty departments and programs',
          icon: GraduationCap,
          href: '/settings', // Placeholder - can be updated when dean route is added
        },
      ],
      [UserRole.HOD]: [
        {
          title: 'Department Management',
          description: 'Manage department courses and staff',
          icon: GraduationCap,
          href: '/settings', // Placeholder - can be updated when hod route is added
        },
      ],
      [UserRole.EXAMS_OFFICER]: [
        {
          title: 'Exam Scheduling',
          description: 'Schedule and coordinate examinations',
          icon: Calendar,
          href: '/settings', // Placeholder - can be updated when exams route is added
        },
      ],
      [UserRole.SCRIPT_HANDLER]: [
        {
          title: 'Script Management',
          description: 'Handle script distribution and collection',
          icon: FileText,
          href: '/settings', // Placeholder - can be updated when scripts route is added
        },
      ],
      [UserRole.INVIGILATOR]: [
        {
          title: 'Exam Supervision',
          description: 'View assigned exam supervision duties',
          icon: Calendar,
          href: '/settings', // Placeholder - can be updated when invigilator route is added
        },
      ],
      [UserRole.LECTURER]: [
        {
          title: 'My Courses',
          description: 'View and manage your courses',
          icon: FileText,
          href: '/settings', // Placeholder - can be updated when lecturer route is added
        },
        {
          title: 'Exam Creation',
          description: 'Create and manage exam papers',
          icon: FileText,
          href: '/settings', // Placeholder - can be updated when lecturer route is added
        },
      ],
      [UserRole.STUDENT]: [
        {
          title: 'My Courses',
          description: 'View enrolled courses and materials',
          icon: GraduationCap,
          href: '/settings', // Placeholder - can be updated when student route is added
        },
        {
          title: 'Exam Schedule',
          description: 'View upcoming examinations',
          icon: Calendar,
          href: '/settings', // Placeholder - can be updated when student route is added
        },
      ],
    };

    return [...baseCards, ...(roleSpecificCards[user?.role as UserRole] || [])];
  };

  const dashboardCards = getRoleBasedCards();

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Role: {user?.role.replace('_', ' ')} | Institution ID: {user?.institutionId || 'System Level'}
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card key={`${card.title}-${index}`} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <IconComponent className="ml-auto h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {card.description}
                </CardDescription>
                <Button
                  className="w-full mt-4"
                  variant="outline"
                  asChild
                >
                  <Link to={card.href}>
                    Access
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground">
                Account is verified and active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Login</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Today</div>
              <p className="text-xs text-muted-foreground">
                {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'First time'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user?.twoFactorEnabled ? '2FA' : 'Basic'}
              </div>
              <p className="text-xs text-muted-foreground">
                {user?.twoFactorEnabled ? 'Two-factor enabled' : 'Consider enabling 2FA'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Role Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {user?.role.split('_')[0]}
              </div>
              <p className="text-xs text-muted-foreground">
                Access level: {user?.role}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
