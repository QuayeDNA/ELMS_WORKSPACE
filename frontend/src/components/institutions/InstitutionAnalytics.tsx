import { Building2, TrendingUp, AlertTriangle, Archive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InstitutionType } from '@/types/institution';

// ========================================
// INTERFACE DEFINITIONS
// ========================================

export interface InstitutionAnalyticsData {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  suspended: number;
  byType: Record<InstitutionType, number>;
  recentlyCreated: number;
  recentlyUpdated: number;
}

interface InstitutionAnalyticsProps {
  data: InstitutionAnalyticsData;
  loading?: boolean;
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
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
      {trend && (
        <div className="flex items-center text-xs mt-2">
          <TrendingUp className={`h-3 w-3 mr-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600 rotate-180'}`} />
          <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-gray-500 ml-1">from last month</span>
        </div>
      )}
    </CardContent>
  </Card>
);

const TypeDistributionCard = ({ data }: { data: Record<InstitutionType, number> }) => {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);
  
  const typeLabels: Record<InstitutionType, string> = {
    UNIVERSITY: 'Universities',
    TECHNICAL_UNIVERSITY: 'Technical Universities',
    POLYTECHNIC: 'Polytechnics',
    COLLEGE: 'Colleges',
    INSTITUTE: 'Institutes',
    OTHER: 'Other'
  };

  const typeColors: Record<InstitutionType, string> = {
    UNIVERSITY: 'bg-blue-100 text-blue-800',
    TECHNICAL_UNIVERSITY: 'bg-purple-100 text-purple-800',
    POLYTECHNIC: 'bg-green-100 text-green-800',
    COLLEGE: 'bg-orange-100 text-orange-800',
    INSTITUTE: 'bg-teal-100 text-teal-800',
    OTHER: 'bg-gray-100 text-gray-800'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Distribution by Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(data).map(([type, count]) => {
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${typeColors[type as InstitutionType]}`}>
                    {typeLabels[type as InstitutionType]}
                  </Badge>
                  <span className="text-sm text-gray-600">({percentage}%)</span>
                </div>
                <span className="font-medium">{count}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const StatusDistributionCard = ({ data }: { data: InstitutionAnalyticsData }) => {
  const statusData = [
    { status: 'Active', count: data.active, color: 'bg-green-100 text-green-800' },
    { status: 'Inactive', count: data.inactive, color: 'bg-gray-100 text-gray-800' },
    { status: 'Pending', count: data.pending, color: 'bg-yellow-100 text-yellow-800' },
    { status: 'Suspended', count: data.suspended, color: 'bg-red-100 text-red-800' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Status Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {statusData.map(({ status, count, color }) => {
            const percentage = data.total > 0 ? Math.round((count / data.total) * 100) : 0;
            return (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${color}`}>
                    {status}
                  </Badge>
                  <span className="text-sm text-gray-600">({percentage}%)</span>
                </div>
                <span className="font-medium">{count}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// ========================================
// MAIN COMPONENT
// ========================================

export const InstitutionAnalytics = ({ data, loading = false }: InstitutionAnalyticsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['total', 'active', 'attention', 'inactive'].map((key) => (
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Institutions"
          value={data.total}
          icon={<Building2 className="h-4 w-4" />}
          color="bg-blue-100 text-blue-600"
          description="All registered institutions"
        />
        
        <StatCard
          title="Active Institutions"
          value={data.active}
          icon={<TrendingUp className="h-4 w-4" />}
          color="bg-green-100 text-green-600"
          description={`${data.total > 0 ? Math.round((data.active / data.total) * 100) : 0}% of total`}
        />
        
        <StatCard
          title="Needs Attention"
          value={data.pending + data.suspended}
          icon={<AlertTriangle className="h-4 w-4" />}
          color="bg-yellow-100 text-yellow-600"
          description="Pending or suspended institutions"
        />
        
        <StatCard
          title="Inactive"
          value={data.inactive}
          icon={<Archive className="h-4 w-4" />}
          color="bg-gray-100 text-gray-600"
          description="Temporarily disabled institutions"
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusDistributionCard data={data} />
        <TypeDistributionCard data={data.byType} />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Recently Created</span>
                <Badge variant="outline">{data.recentlyCreated}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Recently Updated</span>
                <Badge variant="outline">{data.recentlyUpdated}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-green-600">
                {data.total > 0 ? Math.round((data.active / data.total) * 100) : 0}%
              </div>
              <p className="text-sm text-gray-600">
                System health based on active institutions
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${data.total > 0 ? (data.active / data.total) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstitutionAnalytics;
