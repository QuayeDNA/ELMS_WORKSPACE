import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { getOverview, updateConfiguration } from '../../lib/superadminApi'

const Configuration: React.FC = () => {
  const { token } = useAuthStore()
  const [configs, setConfigs] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!token) return setLoading(false)
      try {
        setLoading(true)
        // reuse overview for fetching configurations quickly (backend exposes /configuration separately but overview gives a quick snapshot)
        const res = await getOverview(token)
        if (res && typeof res === 'object' && res !== null && 'systemStats' in (res as Record<string, unknown>)) {
          setConfigs([])
        }
      } catch (err: unknown) {
        setError((err as Error).message || String(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const handleSave = async () => {
    if (!token) return
    setSaving(true)
    setError(null)
    try {
      // for now just send the existing configs back
      await updateConfiguration(token, configs)
    } catch (err: unknown) {
      setError((err as Error).message || String(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">Loading configurations...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">System Configuration</h2>
      <div className="bg-white rounded p-4">(Configuration editor placeholder)</div>
      <div className="mt-4">
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </div>
  )
}

export default Configuration
