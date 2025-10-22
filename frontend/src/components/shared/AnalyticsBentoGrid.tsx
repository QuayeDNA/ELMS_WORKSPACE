import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  icon: React.ElementType;
  value?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

function ChartCard({ title, icon: Icon, value, trend, className }: ChartCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {value && (
          <div className="text-2xl font-bold mb-2">{value}</div>
        )}
        {trend && (
          <div className="flex items-center gap-1 text-xs">
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span
              className={cn(
                "font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.value}%
            </span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        )}
        {/* Placeholder for actual chart */}
        <div className="mt-4 h-24 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
          <Icon className="h-8 w-8 text-primary/30" />
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsBentoGrid() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Analytics & Insights
      </h2>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Large card - spans 2 columns on lg screens */}
        <Card className="md:col-span-2 lg:col-span-2 lg:row-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              System Growth Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">User Growth</span>
                <span className="text-sm font-medium">+12.5%</span>
              </div>
              {/* Placeholder for line chart */}
              <div className="h-48 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Chart: User growth over time</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Small cards */}
        <ChartCard
          title="Active Sessions"
          icon={Activity}
          value="847"
          trend={{ value: 8.2, isPositive: true }}
        />

        <ChartCard
          title="New Users"
          icon={Users}
          value="124"
          trend={{ value: 15.3, isPositive: true }}
        />

        {/* Medium card - spans 2 columns */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Distribution Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Placeholder for pie chart */}
            <div className="h-32 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <PieChart className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Chart: Distribution breakdown</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
