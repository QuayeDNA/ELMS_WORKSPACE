import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const permissions = usePermissions();
  const navigate = useNavigate();

  if (!user) {
    return <div>Loading...</div>;
  }

  const quickStats = [
    {
      title: 'Students',
      description: 'Manage student enrollment and records',
      icon: GraduationCap,
      count: '0', // Will be populated from API
      path: '/admin/students',
      canAccess: permissions.canViewStudents,
    },
    {
      title: 'Instructors',
      description: 'Manage faculty and staff members',
      icon: Users,
      count: '0', // Will be populated from API
      path: '/admin/instructors',
      canAccess: permissions.canViewInstructors,
    },
    {
      title: 'Courses',
      description: 'Manage course catalog and offerings',
      icon: BookOpen,
      count: '0', // Will be populated from API
      path: '/admin/courses',
      canAccess: true, // Assuming course viewing is available to most roles
    },
    {
      title: 'Analytics',
      description: 'View reports and analytics',
      icon: BarChart3,
      count: '0', // Will be populated from API
      path: '/admin/analytics',
      canAccess: permissions.canViewStudentStats || permissions.canViewInstructorStats,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-gray-600 mt-2">
          {user.role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())} Dashboard
        </p>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats
          .filter(stat => stat.canAccess)
          .map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.title} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(stat.path)}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.count}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Management */}
        {permissions.canViewStudents && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Student Management
              </CardTitle>
              <CardDescription>
                Manage student enrollment and academic records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/admin/students')}
                >
                  View All Students
                </Button>
                {permissions.canCreateStudents && (
                  <Button 
                    size="sm"
                    onClick={() => navigate('/admin/students/new')}
                  >
                    Add New Student
                  </Button>
                )}
              </div>
              <div className="text-sm text-gray-600">
                <p>• View and manage student profiles</p>
                <p>• Track academic progress and enrollment</p>
                <p>• Generate student reports</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructor Management */}
        {permissions.canViewInstructors && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Instructor Management
              </CardTitle>
              <CardDescription>
                Manage faculty and staff information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/admin/instructors')}
                >
                  View All Instructors
                </Button>
                {permissions.canCreateInstructors && (
                  <Button 
                    size="sm"
                    onClick={() => navigate('/admin/instructors/new')}
                  >
                    Add New Instructor
                  </Button>
                )}
              </div>
              <div className="text-sm text-gray-600">
                <p>• Manage faculty profiles and assignments</p>
                <p>• Track workload and department assignments</p>
                <p>• View instructor statistics</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates and activities in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            <p>No recent activity to display.</p>
            <p className="mt-2">
              Activity logs will appear here when you start using the system.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
