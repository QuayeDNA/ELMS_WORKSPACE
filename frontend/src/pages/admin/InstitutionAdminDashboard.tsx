import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/auth.store';
import { institutionService } from '@/services/institution.service';
import { facultyService } from '@/services/faculty.service';
import { userService } from '@/services/user.service';
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Faculty } from '@/types/faculty';
import { User } from '@/types/user';

interface InstitutionStats {
  totalUsers: number;
  activeUsers: number;
  totalStudents: number;
  totalLecturers: number;
  totalAdmins: number;
  totalFaculties: number;
  usersByRole: Record<string, number>;
  facultyDetails: Array<{
    id: number;
    name: string;
    code: string;
    userCount: number;
  }>;
  recentActivity: Array<{
    type: string;
    count: number;
    time: string;
  }>;
  performanceMetrics: {
    studentSatisfaction: number;
    courseCompletion: number;
    facultyRating: number;
  };
}

export function InstitutionAdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<InstitutionStats | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const loadDashboardData = useCallback(async () => {
    if (!user?.institutionId) return;

    setLoading(true);
    try {
      // Load institution analytics
      const statsResponse = await institutionService.getInstitutionAnalytics(user.institutionId);
      if (statsResponse) {
        setStats(statsResponse);
      }

      // Load faculties
      const facultiesResponse = await facultyService.getFaculties({
        institutionId: user.institutionId
      });
      if (facultiesResponse.success && facultiesResponse.data) {
        setFaculties(facultiesResponse.data);
      }

      // Load users in institution
      const usersResponse = await userService.getUsers({
        institutionId: user.institutionId,
        page: 1,
        limit: 20
      });
      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.institutionId) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  const handleCreateFaculty = () => {
    // TODO: Open faculty creation modal
  };

  const handleEditFaculty = (_faculty: Faculty) => {
    // TODO: Open faculty edit modal
  };

  const handleDeleteFaculty = (_faculty: Faculty) => {
    // TODO: Open delete confirmation modal
  };

  const handleCreateUser = () => {
    // TODO: Open user creation modal
  };

  const handleEditUser = (_user: User) => {
    // TODO: Open user edit modal
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Institution Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your institution's faculties, departments, and users
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateFaculty}>
            <Plus className="w-4 h-4 mr-2" />
            Add Faculty
          </Button>
          <Button variant="outline" onClick={handleCreateUser}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeUsers || 0} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faculties</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalFaculties || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active faculties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lecturers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLecturers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Teaching staff
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="faculties">Faculties</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest changes in your institution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.recentActivity?.slice(0, 5).map((activity, index) => (
                    <div key={`activity-${activity.type}-${index}`} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.type}: {activity.count}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Faculty
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Add New User
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Create Department
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="faculties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Faculty Management</CardTitle>
              <CardDescription>Manage faculties in your institution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faculties.length > 0 ? (
                  faculties.map((faculty) => (
                    <div key={faculty.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{faculty.name}</h3>
                        <p className="text-sm text-muted-foreground">{faculty.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{faculty.code}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {faculty._count?.users || 0} users
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditFaculty(faculty)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteFaculty(faculty)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No faculties yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first faculty to get started
                    </p>
                    <Button onClick={handleCreateFaculty}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Faculty
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage users in your institution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.length > 0 ? (
                  users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{user.role}</Badge>
                          <Badge variant="secondary">{user.status}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No users yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Add users to your institution
                    </p>
                    <Button onClick={handleCreateUser}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Management</CardTitle>
              <CardDescription>Manage departments across all faculties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Department management coming soon</h3>
                <p className="text-muted-foreground">
                  This feature will allow you to manage departments within faculties
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}



