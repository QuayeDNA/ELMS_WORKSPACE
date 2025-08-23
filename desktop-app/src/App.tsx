import { useEffect } from 'react'
import { AppRoutes } from './routes/AppRoutes'
import { useAuthStore } from './stores/authStore'
import './App.css'

function App() {
  const checkAuth = useAuthStore((state: any) => state.checkAuth)

  useEffect(() => {
    // Check authentication status on app startup
    checkAuth()
  }, [checkAuth])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppRoutes />
    </div>
  )
}

export default App
