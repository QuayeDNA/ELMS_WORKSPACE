import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import {
  Shield,
  Users,
  Building2,
  Activity,
  Database,
  Settings,
  BarChart3,
  AlertTriangle,
  Clock,
  TrendingUp,
  Server
} from 'lucide-react'
import { Button } from '../ui/button'

interface SystemStats {
  totalUsers: number
  totalInstitutions: number
  totalExams: number
  totalIncidents: number
}

interface SystemHealth {
  database: string
  uptime: number
  memory: {
    heapUsed: number
    heapTotal: number
    external: number
  }
  timestamp: string
}

interface RecentActivity {
  id: string
  userId: string
  action: string
  entityType: string
  timestamp: string
  user: {
    email: string
  }
}

export const SuperAdminDashboard: React.FC = () => {
  const { token } = useAuthStore()
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        const [overviewRes, healthRes] = await Promise.all([
          fetch('http://localhost:3000/api/superadmin/overview', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('http://localhost:3000/api/superadmin/health', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        if (overviewRes.ok) {
          const overviewData = await overviewRes.json()
          setSystemStats(overviewData.systemStats)
          setRecentActivity(overviewData.recentActivity)
        }

        if (healthRes.ok) {
          const healthData = await healthRes.json()
          setSystemHealth(healthData)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [token])

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const formatMemory = (bytes: number) => {
    return `${Math.round(bytes / 1024 / 1024)} MB`
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={`skeleton-${i}`} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Super Admin Dashboard
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Complete system overview and administrative controls
        </p>
      </div>

      {/* System Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {systemStats?.totalUsers || 0}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+12% from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Institutions</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {systemStats?.totalInstitutions || 0}
              </p>
            </div>
            <Building2 className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">Active institutions</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Exams</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {systemStats?.totalExams || 0}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">Across all institutions</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Incidents</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {systemStats?.totalIncidents || 0}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">Total reported</span>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Server className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              System Health
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Database Status</span>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                systemHealth?.database === 'healthy' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {systemHealth?.database || 'Unknown'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Uptime</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {systemHealth ? formatUptime(systemHealth.uptime) : 'Unknown'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Memory Usage</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {systemHealth ? formatMemory(systemHealth.memory.heapUsed) : 'Unknown'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Check</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {systemHealth ? new Date(systemHealth.timestamp).toLocaleTimeString() : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
          </div>
          
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white truncate">
                      {activity.user.email} {activity.action.toLowerCase().replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-auto py-4"
            onClick={() => window.location.href = '/superadmin/users'}
          >
            <Users className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Manage Users</div>
              <div className="text-xs text-gray-500">Create, edit, delete users</div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-auto py-4"
            onClick={() => window.location.href = '/superadmin/institutions'}
          >
            <Building2 className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Institutions</div>
              <div className="text-xs text-gray-500">Manage institutions</div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-auto py-4"
            onClick={() => window.location.href = '/superadmin/audit'}
          >
            <Database className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Audit Logs</div>
              <div className="text-xs text-gray-500">View system logs</div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-auto py-4"
            onClick={() => window.location.href = '/superadmin/settings'}
          >
            <Settings className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Settings</div>
              <div className="text-xs text-gray-500">System configuration</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}
