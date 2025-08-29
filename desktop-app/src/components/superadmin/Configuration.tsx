import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { superAdminApi } from '../../services/superadmin'
import { ConfigurationItem } from '../../types/superadmin/superadmin.types'

const Configuration: React.FC = () => {
  const { token } = useAuthStore()
  const [configs, setConfigs] = useState<ConfigurationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!token) return setLoading(false)
      
      // Set token in the API client
      superAdminApi.setToken(token)
      
      try {
        setLoading(true)
        // reuse overview for fetching configurations quickly (backend exposes /configuration separately but overview gives a quick snapshot)
        const res = await superAdminApi.getOverview()
        if (res && 'systemStats' in res) {
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
      // Set token in the API client
      superAdminApi.setToken(token)
      // for now just send the existing configs back
      await superAdminApi.updateConfiguration(configs)
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
