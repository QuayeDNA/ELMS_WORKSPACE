import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  FileText, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Server,
  Wifi,
  Database,
  Shield
} from 'lucide-react';
import { realTimeService, useConnectionStatus } from '../../services/realTimeService';
import { LiveIndicator } from './ConnectionStatus';

interface SystemMetrics {
  scriptsProcessed: number;
  activeUsers: number;
  ongoingExams: number;
  activeIncidents: number;
  systemUptime: number;
  serverLoad: number;
  databaseConnections: number;
  networkStatus: 'healthy' | 'warning' | 'critical';
  lastUpdated: Date;
}

interface ActivityFeed {
  id: string;
  type: 'script' | 'exam' | 'user' | 'incident' | 'system';
  action: string;
  user: string;
  timestamp: Date;
  details?: string;
}

const RealTimeDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    scriptsProcessed: 1247,
    activeUsers: 23,
    ongoingExams: 3,
    activeIncidents: 2,
    systemUptime: 99.8,
    serverLoad: 34,
    databaseConnections: 45,
    networkStatus: 'healthy',
    lastUpdated: new Date()
  });

  const [activities, setActivities] = useState<ActivityFeed[]>([
    {
      id: '1',
      type: 'script',
      action: 'QR Code Scanned',
      user: 'John Doe',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      details: 'Batch SCR-2025-001, Script #045'
    },
    {
      id: '2',
      type: 'exam',
      action: 'Exam Started',
      user: 'Dr. Smith',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      details: 'COMP 101 Final Exam, Hall A'
    },
    {
      id: '3',
      type: 'incident',
      action: 'Incident Resolved',
      user: 'Security Team',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      details: 'INC-2025-010: Scanner malfunction'
    },
    {
      id: '4',
      type: 'user',
      action: 'User Login',
      user: 'Jane Wilson',
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      details: 'Role: Invigilator'
    },
    {
      id: '5',
      type: 'system',
      action: 'Backup Completed',
      user: 'System',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      details: 'Daily database backup'
    }
  ]);

  const [isConnected, setIsConnected] = useState(true);
  const connectionStatus = useConnectionStatus();

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        scriptsProcessed: prev.scriptsProcessed + Math.floor(Math.random() * 5),
        activeUsers: Math.max(1, prev.activeUsers + (Math.random() > 0.5 ? 1 : -1)),
        serverLoad: Math.max(0, Math.min(100, prev.serverLoad + (Math.random() - 0.5) * 10)),
        databaseConnections: Math.max(0, prev.databaseConnections + (Math.random() > 0.5 ? 1 : -1)),
        lastUpdated: new Date()
      }));

      // Occasionally add new activity
      if (Math.random() > 0.7) {
        const newActivity: ActivityFeed = {
          id: Date.now().toString(),
          type: ['script', 'exam', 'user', 'incident', 'system'][Math.floor(Math.random() * 5)] as any,
          action: 'Real-time Action',
          user: 'Live User',
          timestamp: new Date(),
          details: 'Simulated real-time activity'
        };
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: ActivityFeed['type']) => {
    switch (type) {
      case 'script':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'exam':
        return <Users className="w-4 h-4 text-green-500" />;
      case 'user':
        return <Users className="w-4 h-4 text-purple-500" />;
      case 'incident':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'system':
        return <Server className="w-4 h-4 text-gray-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(1)}%`;
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getLoadColor = (load: number) => {
    if (load < 50) return 'bg-green-500';
    if (load < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${connectionStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium">
            {connectionStatus ? 'Real-time Connected' : 'Connection Lost'}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Last updated: {formatTimestamp(metrics.lastUpdated)}</span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Scripts Processed */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scripts Processed</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.scriptsProcessed}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+12%</span>
            <span className="text-gray-500 ml-1">from yesterday</span>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.activeUsers}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Activity className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-blue-500 font-medium">Real-time</span>
            <span className="text-gray-500 ml-1">online now</span>
          </div>
        </div>

        {/* Ongoing Exams */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ongoing Exams</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.ongoingExams}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Clock className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-purple-500 font-medium">In progress</span>
            <span className="text-gray-500 ml-1">across venues</span>
          </div>
        </div>

        {/* Active Incidents */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Incidents</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.activeIncidents}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">-25%</span>
            <span className="text-gray-500 ml-1">from last week</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            {/* Uptime */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium">System Uptime</span>
              </div>
              <span className="text-sm font-bold text-green-600">
                {formatUptime(metrics.systemUptime)}
              </span>
            </div>

            {/* Server Load */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium">Server Load</span>
                </div>
                <span className="text-sm font-bold">{metrics.serverLoad}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getLoadColor(metrics.serverLoad)}`}
                  style={{ width: `${metrics.serverLoad}%` }}
                ></div>
              </div>
            </div>

            {/* Database Connections */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium">DB Connections</span>
              </div>
              <span className="text-sm font-bold">{metrics.databaseConnections}</span>
            </div>

            {/* Network Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wifi className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium">Network Status</span>
              </div>
              <span className={`text-sm font-bold capitalize ${getStatusColor(metrics.networkStatus)}`}>
                {metrics.networkStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Activity Feed */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Live Activity Feed</h3>
            <LiveIndicator />
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                {getActivityIcon(activity.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">by {activity.user}</p>
                  {activity.details && (
                    <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeDashboard;
