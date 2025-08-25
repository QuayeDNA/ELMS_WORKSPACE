import { useEffect } from 'react'
import { AppRoutes } from './routes/AppRoutes'
import { useAuthStore } from './stores/authStore'
import { useThemeStore } from './stores/themeStore'
import './App.css'

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth)
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    // Check authentication status on app startup
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    // Apply theme class to root html element
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [theme])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppRoutes />
    </div>
  )
}

export default App
