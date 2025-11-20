import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

// Create a client for React Query with disabled cache to prevent layout shifts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0, // Disable retries
      staleTime: 0, // Data always stale
      cacheTime: 0, // Don't cache data
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Don't refetch on mount
      refetchOnReconnect: false,
      refetchInterval: false, // Disable polling
    },
    mutations: {
      retry: 0,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)



