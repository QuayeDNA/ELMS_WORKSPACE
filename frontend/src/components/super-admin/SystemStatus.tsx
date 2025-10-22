import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  Server,
  Database,
  Cloud,
  Shield,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface SystemService {
  name: string;
  status: "active" | "inactive" | "error" | "pending";
  icon: React.ElementType;
  uptime: string;
  lastChecked: string;
}

export function SystemStatus() {
  // TODO: Replace with actual API data
  const services: SystemService[] = [
    {
      name: "API Server",
      status: "active",
      icon: Server,
      uptime: "99.9%",
      lastChecked: "2 min ago",
    },
    {
      name: "Database",
      status: "active",
      icon: Database,
      uptime: "99.8%",
      lastChecked: "2 min ago",
    },
    {
      name: "Cloud Storage",
      status: "active",
      icon: Cloud,
      uptime: "100%",
      lastChecked: "5 min ago",
    },
    {
      name: "Authentication",
      status: "active",
      icon: Shield,
      uptime: "99.9%",
      lastChecked: "1 min ago",
    },
  ];

  const alerts = [
    {
      type: "info",
      message: "Scheduled maintenance: Database backup at 2:00 AM",
      time: "Tomorrow",
    },
    {
      type: "success",
      message: "All systems operating normally",
      time: "Now",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            System Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Uptime: {service.uptime}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={service.status} />
                    <p className="text-xs text-muted-foreground">
                      {service.lastChecked}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card"
              >
                {alert.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {alert.time}
                  </p>
                </div>
                <Badge
                  variant={alert.type === "success" ? "default" : "secondary"}
                  className="flex-shrink-0"
                >
                  {alert.type}
                </Badge>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                All Systems Operational
              </p>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              No critical issues detected. System performance is optimal.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
