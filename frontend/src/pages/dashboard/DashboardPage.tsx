import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
        title: 'Profile',
        description: 'View and edit your profile information',
        icon: Users,
        href: '/profile',
      },
    ];

    const roleSpecificCards: Record<UserRole, DashboardCard[]> = {
      [UserRole.SUPER_ADMIN]: [
        {
          title: 'System Management',
          description: 'Manage institutions, users, and system settings',
          icon: Settings,
          href: '/admin/system',
        },
        {
          title: 'Analytics',
          description: 'View system-wide analytics and reports',
          icon: BarChart3,
          href: '/admin/analytics',
        },
      ],
      [UserRole.ADMIN]: [
        {
          title: 'Institution Management',
          description: 'Manage faculties, departments, and users',
          icon: GraduationCap,
          href: '/admin/institution',
        },
        {
          title: 'User Management',
          description: 'Manage faculty and staff accounts',
          icon: Users,
          href: '/admin/users',
        },
      ],
      [UserRole.FACULTY_ADMIN]: [
        {
          title: 'Faculty Management',
          description: 'Manage departments and programs',
          icon: GraduationCap,
          href: '/faculty/management',
        },
        {
          title: 'Exam Management',
          description: 'Schedule and manage examinations',
          icon: Calendar,
          href: '/faculty/exams',
        },
      ],
      [UserRole.DEAN]: [
        {
          title: 'Faculty Management',
          description: 'Manage faculty departments and programs',
          icon: GraduationCap,
          href: '/dean/management',
        },
      ],
      [UserRole.HOD]: [
        {
          title: 'Department Management',
          description: 'Manage department courses and staff',
          icon: GraduationCap,
          href: '/hod/management',
        },
      ],
      [UserRole.EXAMS_OFFICER]: [
        {
          title: 'Exam Scheduling',
          description: 'Schedule and coordinate examinations',
          icon: Calendar,
          href: '/exams/schedule',
        },
      ],
      [UserRole.SCRIPT_HANDLER]: [
        {
          title: 'Script Management',
          description: 'Handle script distribution and collection',
          icon: FileText,
          href: '/scripts/management',
        },
      ],
      [UserRole.INVIGILATOR]: [
        {
          title: 'Exam Supervision',
          description: 'View assigned exam supervision duties',
          icon: Calendar,
          href: '/invigilator/duties',
        },
      ],
      [UserRole.LECTURER]: [
        {
          title: 'My Courses',
          description: 'View and manage your courses',
          icon: FileText,
          href: '/lecturer/courses',
        },
        {
          title: 'Exam Creation',
          description: 'Create and manage exam papers',
          icon: FileText,
          href: '/lecturer/exams',
        },
      ],
      [UserRole.STUDENT]: [
        {
          title: 'My Courses',
          description: 'View enrolled courses and materials',
          icon: GraduationCap,
          href: '/student/courses',
        },
        {
          title: 'Exam Schedule',
          description: 'View upcoming examinations',
          icon: Calendar,
          href: '/student/exams',
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
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
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
                <Button className="w-full mt-4" variant="outline">
                  Access
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
