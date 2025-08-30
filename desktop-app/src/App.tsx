import { useEffect } from 'react'
import { AppRouter } from './routes/AppRoutesNew'
import { useAuthStore } from './stores/authStore'
import { useThemeStore } from './stores/themeStore'
import { apiClient } from './lib/api-client'
import './App.css'

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth)
  const token = useAuthStore((state) => state.token)
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    // Check authentication status on app startup
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    // Initialize API client with token when it changes
    if (token) {
      apiClient.setToken(token)
    } else {
      apiClient.clearToken()
    }
  }, [token])

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
    <div>
      {/* <AuthBackgroundPattern /> */}
      <AppRouter />
    </div>
  )
}

export default App
