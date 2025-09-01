import { Outlet, Link, useLocation } from 'react-router-dom';
import { Building, BookOpen, Users, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/types/auth';

const academicTabs = [
  {
    name: 'Institutions',
    href: '/academic/institutions',
    icon: Building,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN]
  },
  {
    name: 'Courses',
    href: '/academic/courses',
    icon: BookOpen,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.DEAN, UserRole.HOD]
  },
  {
    name: 'Students',
    href: '/academic/students',
    icon: Users,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.DEAN, UserRole.HOD]
  },
  {
    name: 'Venues',
    href: '/academic/venues',
    icon: MapPin,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN, UserRole.EXAMS_OFFICER]
  }
];

export function AcademicPage() {
  const location = useLocation();
  const { user } = useAuthStore();

  const hasRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const filteredTabs = academicTabs.filter(tab => hasRole(tab.roles));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Academic Data Management</h1>
        <p className="text-gray-600">Manage institutions, courses, students, and venues</p>
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
