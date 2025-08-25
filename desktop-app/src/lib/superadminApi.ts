export async function getInstitutions(token: string | null) {
  if (!token) throw new Error('No auth token')
  const res = await fetch('http://localhost:3000/api/superadmin/institutions', {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to fetch institutions')
  }
  return res.json()
}

export async function getUsers(token: string | null, params: Record<string, string | number | boolean> = {}) {
  if (!token) throw new Error('No auth token')
  const qp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) qp.set(k, String(v)) })
  const res = await fetch(`http://localhost:3000/api/superadmin/users?${qp.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to fetch users')
  }
  return res.json()
}

export async function createUser(token: string | null, userData: unknown) {
  if (!token) throw new Error('No auth token')
  const res = await fetch('http://localhost:3000/api/superadmin/users', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to create user')
  }
  return res.json()
}

export async function updateUser(token: string | null, userId: string, userData: unknown) {
  if (!token) throw new Error('No auth token')
  const res = await fetch(`http://localhost:3000/api/superadmin/users/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to update user')
  }
  return res.json()
}

export async function toggleUserStatus(token: string | null, userId: string, isActive: boolean) {
  if (!token) throw new Error('No auth token')
  const res = await fetch(`http://localhost:3000/api/superadmin/users/${encodeURIComponent(userId)}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to update user status')
  }
  return res.json()
}

export async function deleteUser(token: string | null, userId: string) {
  if (!token) throw new Error('No auth token')
  const res = await fetch(`http://localhost:3000/api/superadmin/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to delete user')
  }
  return res.json()
}

export async function getAuditLogs(token: string | null, params: Record<string, string | number | boolean> = {}) {
  if (!token) throw new Error('No auth token')
  const qp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) qp.set(k, String(v)) })
  const res = await fetch(`http://localhost:3000/api/superadmin/audit-logs?${qp.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to fetch audit logs')
  }
  return res.json()
}

export async function getAnalytics(token: string | null, timeframe = '7d') {
  if (!token) throw new Error('No auth token')
  const res = await fetch(`http://localhost:3000/api/superadmin/analytics?timeframe=${encodeURIComponent(timeframe)}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to fetch analytics')
  }
  return res.json()
}

export async function postInstitution(token: string | null, payload: unknown) {
  if (!token) throw new Error('No auth token')
  const res = await fetch('http://localhost:3000/api/superadmin/institutions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to create institution')
  }
  return res.json()
}

export async function putInstitution(token: string | null, id: string, payload: unknown) {
  if (!token) throw new Error('No auth token')
  const res = await fetch(`http://localhost:3000/api/superadmin/institutions/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to update institution')
  }
  return res.json()
}

export async function deleteInstitution(token: string | null, id: string) {
  if (!token) throw new Error('No auth token')
  const res = await fetch(`http://localhost:3000/api/superadmin/institutions/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to delete institution')
  }
  return res.json()
}

export async function getOverview(token: string | null) {
  if (!token) throw new Error('No auth token')
  const res = await fetch('http://localhost:3000/api/superadmin/overview', {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to fetch overview')
  }
  return res.json()
}

export async function getHealth(token: string | null) {
  if (!token) throw new Error('No auth token')
  const res = await fetch('http://localhost:3000/api/superadmin/health', {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to fetch health')
  }
  return res.json()
}

export async function updateConfiguration(token: string | null, configurations: unknown[]) {
  if (!token) throw new Error('No auth token')
  const res = await fetch('http://localhost:3000/api/superadmin/configuration', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ configurations })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to update configuration')
  }
  return res.json()
}
