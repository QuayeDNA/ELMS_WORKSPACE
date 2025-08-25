import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { getOverview } from '../../lib/superadminApi'
import { 
  Users, 
  Building2, 
  BookOpen, 
  AlertTriangle, 
  Activity,
  Clock,
  Database
} from 'lucide-react'

interface SystemStats {
  totalUsers: number
  totalInstitutions: number
  totalExams: number
  totalIncidents: number
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

interface OverviewData {
  systemStats: SystemStats
  recentActivity: RecentActivity[]
}

const Overview: React.FC = () => {
  const { token } = useAuthStore()
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!token) return setLoading(false)
      try {
        setLoading(true)
        const res = await getOverview(token)
        setData(res)
      } catch (err: unknown) {
        setError((err as Error).message || String(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Overview</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center text-gray-500 py-8">
        No data available
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: data.systemStats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Institutions',
      value: data.systemStats.totalInstitutions,
      icon: Building2,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Exams',
      value: data.systemStats.totalExams,
      icon: BookOpen,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Active Incidents',
      value: data.systemStats.totalIncidents,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
        <p className="text-gray-600 mt-1">Monitor system statistics and recent activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>
                    {stat.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {data.recentActivity.length > 0 ? (
            data.recentActivity.map((activity) => (
              <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Database className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action} {activity.entityType}
                      </p>
                      <p className="text-sm text-gray-500">by {activity.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Overview
