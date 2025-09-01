import { Outlet, Link, useLocation } from 'react-router-dom';
import { Calendar, UserCheck, MapPin, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/types/auth';

const examTabs = [
  {
    name: 'Schedule Exams',
    href: '/exams/schedule',
    icon: Calendar,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.EXAMS_OFFICER, UserRole.LECTURER]
  },
  {
    name: 'Student Assignment',
    href: '/exams/assignments',
    icon: UserCheck,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.EXAMS_OFFICER]
  },
  {
    name: 'Room Allocation',
    href: '/exams/rooms',
    icon: MapPin,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.EXAMS_OFFICER]
  },
  {
    name: 'Timetables',
    href: '/exams/timetables',
    icon: ClipboardList,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.EXAMS_OFFICER, UserRole.INVIGILATOR, UserRole.STUDENT]
  }
];

export function ExamsPage() {
  const location = useLocation();
  const { user } = useAuthStore();

  const hasRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const filteredTabs = examTabs.filter(tab => hasRole(tab.roles));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Exam Management</h1>
        <p className="text-gray-600">Schedule exams, assign students, and manage logistics</p>
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
