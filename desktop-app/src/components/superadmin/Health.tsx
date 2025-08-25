import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { getHealth } from '../../lib/superadminApi'
import {
  Activity,
  Server,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Zap,
  MemoryStick,
  RefreshCw
} from 'lucide-react'

interface SystemHealth {
  database: string
  uptime: number
  memory: {
    heapUsed: number
    heapTotal: number
    external: number
    arrayBuffers?: number
  }
  timestamp: string
}

const Health: React.FC = () => {
  const { token } = useAuthStore()
  const [data, setData] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadHealth = async () => {
    if (!token) return setLoading(false)
    try {
      setLoading(true)
      setError(null)
      const res = await getHealth(token)
      setData(res)
    } catch (err: unknown) {
      setError((err as Error).message || String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      if (!token) return setLoading(false)
      try {
        setLoading(true)
        setError(null)
        const res = await getHealth(token)
        setData(res)
      } catch (err: unknown) {
        setError((err as Error).message || String(err))
      } finally {
        setLoading(false)
      }
    }
    
    load()
    // Auto-refresh every 30 seconds
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [token])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const getHealthStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          label: 'Healthy'
        }
      case 'unhealthy':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          label: 'Unhealthy'
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          label: 'Warning'
        }
      default:
        return {
          icon: AlertTriangle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          label: 'Unknown'
        }
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-600 mt-1">Monitor system performance and status</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Health Check Failed</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button 
                onClick={loadHealth}
                className="mt-2 text-sm text-red-600 hover:text-red-500 flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center text-gray-500 py-8">
        No health data available
      </div>
    )
  }

  const dbStatus = getHealthStatus(data.database)
  const DbIcon = dbStatus.icon
  const memoryUsagePercent = Math.round((data.memory.heapUsed / data.memory.heapTotal) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-600 mt-1">Monitor system performance and status</p>
        </div>
        <button 
          onClick={loadHealth}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Main Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Database Status */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${dbStatus.bgColor}`}>
              <DbIcon className={`h-6 w-6 ${dbStatus.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Database</p>
              <p className={`text-lg font-bold ${dbStatus.color}`}>
                {dbStatus.label}
              </p>
            </div>
          </div>
        </div>

        {/* System Uptime */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-lg font-bold text-blue-600">
                {formatUptime(data.uptime)}
              </p>
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${memoryUsagePercent > 80 ? 'bg-red-100' : 'bg-green-100'}`}>
              <MemoryStick className={`h-6 w-6 ${memoryUsagePercent > 80 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Memory Usage</p>
              <p className={`text-lg font-bold ${memoryUsagePercent > 80 ? 'text-red-600' : 'text-green-600'}`}>
                {memoryUsagePercent}%
              </p>
            </div>
          </div>
        </div>

        {/* Last Check */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last Check</p>
              <p className="text-lg font-bold text-purple-600">
                {new Date(data.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Memory Information */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Server className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Memory Details</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Heap Used</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatBytes(data.memory.heapUsed)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Heap Total</p>
              <p className="text-2xl font-bold text-green-600">
                {formatBytes(data.memory.heapTotal)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">External</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatBytes(data.memory.external)}
              </p>
            </div>
          </div>
          
          {/* Memory Usage Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Memory Usage</span>
              <span>{memoryUsagePercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  memoryUsagePercent > 80 ? 'bg-red-500' : 
                  memoryUsagePercent > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${memoryUsagePercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Zap className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">System Information</h2>
          </div>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-600">Database Status</dt>
              <dd className="mt-1 text-sm text-gray-900">{data.database}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">System Uptime</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatUptime(data.uptime)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Last Health Check</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(data.timestamp).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Memory Efficiency</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {memoryUsagePercent < 60 ? 'Excellent' : 
                 memoryUsagePercent < 80 ? 'Good' : 'Needs Attention'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

export default Health
