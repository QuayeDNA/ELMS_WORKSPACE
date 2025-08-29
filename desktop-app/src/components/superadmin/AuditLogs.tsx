import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { superAdminApi } from '../../services/superadmin'
import { AuditLog, PaginatedResponse } from '../../types/superadmin/superadmin.types'

const AuditLogs: React.FC = () => {
  const { token } = useAuthStore()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [actionFilter, setActionFilter] = useState<string | undefined>(undefined)
  const [entityFilter, setEntityFilter] = useState<string | undefined>(undefined)
  const [dateFrom, setDateFrom] = useState<string | undefined>(undefined)
  const [dateTo, setDateTo] = useState<string | undefined>(undefined)

  useEffect(() => {
    const load = async () => {
      if (!token) return setLoading(false)

      // Set token in the API client
      superAdminApi.setToken(token)

      try {
        setLoading(true)
        const filters: Record<string, string | number | boolean> = { page, limit };
        if (actionFilter) filters.action = actionFilter;
        if (entityFilter) filters.entityType = entityFilter;
        if (dateFrom) filters.startDate = dateFrom;
        if (dateTo) filters.endDate = dateTo;

        const response: PaginatedResponse<AuditLog> = await superAdminApi.getAuditLogs(filters)
        // PaginatedResponse has data in response.data and pagination in response.pagination
        setLogs(response.data || [])
        setTotal(response.pagination.total)
        setTotalPages(response.pagination.totalPages)
      } catch (err: unknown) {
        setError((err as Error).message || 'Failed to load audit logs')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token, page, limit, actionFilter, entityFilter, dateFrom, dateTo])

  if (loading) return <div className="p-6">Loading audit logs...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Audit Logs</h2>
      <div className="mb-4 flex items-center space-x-2">
        <input type="text" placeholder="Action" value={actionFilter || ''} onChange={e => setActionFilter(e.target.value || undefined)} className="border p-2 rounded" />
        <input type="text" placeholder="Entity Type" value={entityFilter || ''} onChange={e => setEntityFilter(e.target.value || undefined)} className="border p-2 rounded" />
        <input type="date" value={dateFrom || ''} onChange={e => setDateFrom(e.target.value || undefined)} className="border p-2 rounded" />
        <input type="date" value={dateTo || ''} onChange={e => setDateTo(e.target.value || undefined)} className="border p-2 rounded" />
        <select value={limit} onChange={e => setLimit(Number(e.target.value))} className="border p-2 rounded">
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
      <div className="bg-white rounded shadow overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Actor</th>
              <th className="p-3 text-left">Action</th>
              <th className="p-3 text-left">Target</th>
              <th className="p-3 text-left">Severity</th>
              <th className="p-3 text-left">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-t">
                <td className="p-3">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="p-3">{log.actor}</td>
                <td className="p-3">{log.action}</td>
                <td className="p-3">{log.target}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    log.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    log.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {log.severity}
                  </span>
                </td>
                <td className="p-3">{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Showing {logs.length} of {total} audit logs
        </div>
        <div className="space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 py-1">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuditLogs