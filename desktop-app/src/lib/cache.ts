type CacheEntry = {
  data: unknown
  ts: number
}

const store = new Map<string, CacheEntry>()

// listeners for key invalidation
const listeners = new Map<string, Set<() => void>>()

export const getCached = (key: string) => {
  return store.get(key)?.data
}

export const setCached = (key: string, data: unknown) => {
  store.set(key, { data, ts: Date.now() })
  // notify listeners
  const subs = listeners.get(key)
  if (subs) subs.forEach(cb => cb())
}

export const invalidate = (key: string) => {
  store.delete(key)
  const subs = listeners.get(key)
  if (subs) subs.forEach(cb => cb())
}

export const clearCache = () => store.clear()

export const subscribe = (key: string, cb: () => void) => {
  if (!listeners.has(key)) listeners.set(key, new Set())
  listeners.get(key)!.add(cb)
  return () => listeners.get(key)!.delete(cb)
}

export const hasCached = (key: string) => store.has(key)

export default {
  getCached,
  setCached,
  invalidate,
  clearCache,
  subscribe,
  hasCached,
}
