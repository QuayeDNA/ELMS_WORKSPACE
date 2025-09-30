import { Building2, Users, BookOpen, GraduationCap, UserCheck, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { InstitutionSpecificAnalytics as InstitutionAnalyticsData } from '@/types/institution';

// ========================================
// INTERFACE DEFINITIONS
// ========================================

interface InstitutionSpecificAnalyticsProps {
  data: InstitutionAnalyticsData;
  loading?: boolean;
  institutionName: string;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

// ========================================
// HELPER COMPONENTS
// ========================================

const StatCard = ({ title, value, icon, color, description, trend }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={`p-2 rounded-lg ${color}`}>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
      {trend && (
        <div className={`flex items-center text-xs mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className={`h-3 w-3 mr-1 ${!trend.isPositive ? 'rotate-180' : ''}`} />
          {trend.value > 0 ? '+' : ''}{trend.value}% from last month
        </div>
      )}
    </CardContent>
  </Card>
);

const QuickStatsCard = ({ data, institutionName }: { data: InstitutionAnalyticsData; institutionName: string }) => {
  // Use actual data from the analytics
  const totalUsers = data.totalUsers;
  const totalStudents = data.totalStudents;
  const totalLecturers = data.totalLecturers;
  const totalAdmins = data.totalAdmins;
  const totalFaculties = data.totalFaculties;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Statistics</CardTitle>
        <p className="text-sm text-gray-600">Key metrics for {institutionName}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm font-medium">Total Users</span>
            </div>
            <Badge variant="outline" className="font-semibold">
              {totalUsers.toLocaleString()}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <GraduationCap className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm font-medium">Students</span>
            </div>
            <Badge variant="outline" className="font-semibold">
              {totalStudents.toLocaleString()}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UserCheck className="h-4 w-4 text-purple-500 mr-2" />
              <span className="text-sm font-medium">Lecturers</span>
            </div>
            <Badge variant="outline" className="font-semibold">
              {totalLecturers.toLocaleString()}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building2 className="h-4 w-4 text-orange-500 mr-2" />
              <span className="text-sm font-medium">Administrators</span>
            </div>
            <Badge variant="outline" className="font-semibold">
              {totalAdmins.toLocaleString()}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-sm font-medium">Faculties</span>
            </div>
            <Badge variant="outline" className="font-semibold">
              {totalFaculties.toLocaleString()}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ActivityTimelineCard = ({ data }: { data: InstitutionAnalyticsData }) => {
  const activities = data.recentActivity.map(activity => ({
    type: activity.type,
    count: activity.count,
    time: activity.time,
    color: activity.type === 'User Registration' ? 'bg-blue-100 text-blue-600' :
           activity.type === 'Faculty Created' ? 'bg-green-100 text-green-600' :
           'bg-purple-100 text-purple-600'
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <p className="text-sm text-gray-600">Latest institution activities</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-3 ${activity.color.split(' ')[0]}`}></div>
                <div>
                  <p className="text-sm font-medium">{activity.type}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                +{activity.count}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ========================================
// MAIN COMPONENT
// ========================================

export const InstitutionSpecificAnalytics = ({ 
  data, 
  loading = false, 
  institutionName 
}: InstitutionSpecificAnalyticsProps) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((key) => (
            <Card key={key} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Calculate some derived metrics for this institution
  const totalUsers = data.totalUsers;
  const activeRate = data.totalUsers > 0 ? (data.activeUsers / data.totalUsers) * 100 : 0;
  const totalFaculties = data.totalFaculties;
  const totalCourses = data.facultyDetails.length * 5; // Estimate courses based on faculties

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Institution Analytics</h2>
          <p className="text-gray-600">Performance insights for {institutionName}</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={<Users className="h-4 w-4" />}
          color="bg-blue-100 text-blue-600"
          description="All registered users"
          trend={{ value: 12, isPositive: true }}
        />
        
        <StatCard
          title="Faculties"
          value={totalFaculties}
          icon={<BookOpen className="h-4 w-4" />}
          color="bg-green-100 text-green-600"
          description="Academic departments"
          trend={{ value: 5, isPositive: true }}
        />
        
        <StatCard
          title="Courses"
          value={totalCourses}
          icon={<GraduationCap className="h-4 w-4" />}
          color="bg-purple-100 text-purple-600"
          description="Active courses"
          trend={{ value: 8, isPositive: true }}
        />
        
        <StatCard
          title="Active Rate"
          value={activeRate}
          icon={<TrendingUp className="h-4 w-4" />}
          color="bg-orange-100 text-orange-600"
          description="Institution status"
        />
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickStatsCard data={data} institutionName={institutionName} />
        <ActivityTimelineCard data={data} />
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{data.performanceMetrics.studentSatisfaction}%</div>
              <div className="text-sm text-gray-600">Student Satisfaction</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{data.performanceMetrics.courseCompletion}%</div>
              <div className="text-sm text-gray-600">Course Completion</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{data.performanceMetrics.facultyRating}%</div>
              <div className="text-sm text-gray-600">Faculty Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstitutionSpecificAnalytics;



