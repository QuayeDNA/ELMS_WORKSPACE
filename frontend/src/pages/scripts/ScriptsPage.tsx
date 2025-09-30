import { Outlet, Link, useLocation } from 'react-router-dom';
import { QrCode, BarChart3, UserCheck, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/types/auth';

const scriptTabs = [
  {
    name: 'Generate Scripts',
    href: '/scripts/generate',
    icon: QrCode,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.EXAMS_OFFICER]
  },
  {
    name: 'Track Status',
    href: '/scripts/tracking',
    icon: BarChart3,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.EXAMS_OFFICER, UserRole.SCRIPT_HANDLER, UserRole.INVIGILATOR]
  },
  {
    name: 'Handler Assignment',
    href: '/scripts/handlers',
    icon: UserCheck,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.EXAMS_OFFICER]
  },
  {
    name: 'QR Scanner',
    href: '/scripts/scanner',
    icon: Smartphone,
    roles: [UserRole.SCRIPT_HANDLER, UserRole.INVIGILATOR, UserRole.EXAMS_OFFICER]
  }
];

export function ScriptsPage() {
  const location = useLocation();
  const { user } = useAuthStore();

  const hasRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const filteredTabs = scriptTabs.filter(tab => hasRole(tab.roles));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Script Tracking</h1>
        <p className="text-gray-600">Generate, track, and manage examination scripts with QR codes</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {filteredTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.href;
            
            return (
              <Link
                key={tab.name}
                to={tab.href}
                className={cn(
                  'flex items-center py-2 px-1 border-b-2 font-medium text-sm',
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="bg-white rounded-lg border">
        <Outlet />
      </div>
    </div>
  );
}



