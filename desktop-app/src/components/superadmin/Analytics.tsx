import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { getAnalytics } from '../../lib/superadminApi'

interface AnalyticsResponse {
  timeframe?: string
  userActivity?: unknown
  roleDistribution?: unknown
  incidentTrends?: unknown
  examActivity?: unknown
}

export const Analytics: React.FC = () => {
  const { token } = useAuthStore()
  const [data, setData] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!token) return setLoading(false)
      try {
        setLoading(true)
        const res = await getAnalytics(token)
        setData(res)
      } catch (err: unknown) {
        setError((err as Error).message || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  if (loading) return <div className="p-6">Loading analytics...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  const parsed = (data as AnalyticsResponse) || {}

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">System Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  <div className="bg-white rounded shadow p-4">Users Activity: {JSON.stringify(parsed.userActivity || {})}</div>
  <div className="bg-white rounded shadow p-4">Role Distribution: {JSON.stringify(parsed.roleDistribution || {})}</div>
  <div className="bg-white rounded shadow p-4">Incident Trends: {JSON.stringify(parsed.incidentTrends || {})}</div>
  <div className="bg-white rounded shadow p-4">Exam Activity: {JSON.stringify(parsed.examActivity ?? '-')}</div>
      </div>
      <div className="bg-white rounded shadow p-4">Charts placeholder (implement with Chart.js)</div>
    </div>
  )
}
