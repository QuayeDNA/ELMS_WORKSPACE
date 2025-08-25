import { useEffect, useState, useRef } from 'react'
import cache from '../lib/cache'

type Fetcher<T> = () => Promise<T>

export function useCachedQuery<T = unknown>(key: string, fetcher: Fetcher<T>, options?: { enabled?: boolean }) {
  const { enabled = true } = options || {}
  const [data, setData] = useState<T | null>(() => cache.getCached(key) as T || null)
  const [loading, setLoading] = useState(!cache.hasCached(key))
  const [error, setError] = useState<string | null>(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const cached = cache.getCached(key) as T | undefined
    if (cached !== undefined) {
      setData(cached)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    fetcher()
      .then((res) => {
        if (cancelled) return
        cache.setCached(key, res)
        if (mounted.current) setData(res)
      })
      .catch((err) => {
        if (cancelled) return
        if (mounted.current) setError((err as Error).message || String(err))
      })
      .finally(() => {
        if (cancelled) return
        if (mounted.current) setLoading(false)
      })

    return () => { cancelled = true }
  }, [key, enabled, fetcher])

  useEffect(() => {
    // subscribe to invalidation
    const unsub = cache.subscribe(key, () => {
      // refetch when key invalidated
      fetcher().then((res) => {
        cache.setCached(key, res)
        if (mounted.current) setData(res)
      }).catch(err => {
        if (mounted.current) setError((err as Error).message || String(err))
      })
    })
    return () => { unsub() }
  }, [key, fetcher])

  return { data, loading, error }
}

export default useCachedQuery
