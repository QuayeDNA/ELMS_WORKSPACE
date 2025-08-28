import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { getAuditLogs } from '../../lib/superadminApi'

interface AuditLog { id: string; action: string; entityType: string; timestamp: string; user?: { email?: string } }
interface AuditLogsResponse { auditLogs?: AuditLog[]; pagination?: { currentPage: number } }

export const AuditLogsList: React.FC = () => {
  const { token } = useAuthStore()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [actionFilter, setActionFilter] = useState<string | undefined>(undefined)
  const [entityFilter, setEntityFilter] = useState<string | undefined>(undefined)
  const [dateFrom, setDateFrom] = useState<string | undefined>(undefined)
  const [dateTo, setDateTo] = useState<string | undefined>(undefined)

  useEffect(() => {
    const load = async () => {
      if (!token) return setLoading(false)
      try {
        setLoading(true)
        const filters: Record<string, string | number | boolean> = { page, limit };
        if (actionFilter) filters.action = actionFilter;
        if (entityFilter) filters.entityType = entityFilter;
        if (dateFrom) filters.dateFrom = dateFrom;
        if (dateTo) filters.dateTo = dateTo;
        
        const data = await getAuditLogs(token, filters)
        // data may be { auditLogs, pagination }
        const d = data as AuditLogsResponse | AuditLog[]
        const payload = Array.isArray(d) ? d : (d.auditLogs || [])
        setLogs(payload)
      } catch (err: unknown) {
        setError((err as Error).message || 'Failed to load')
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
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Action</th>
              <th className="p-3 text-left">Entity</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-t">
                <td className="p-3">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="p-3">{log.user?.email || '-'}</td>
                <td className="p-3">{log.action}</td>
                <td className="p-3">{log.entityType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div />
        <div className="space-x-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 border rounded">Prev</button>
          <span>Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded">Next</button>
        </div>
      </div>
    </div>
  )
}
