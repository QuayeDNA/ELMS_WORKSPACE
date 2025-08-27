import { useEffect } from 'react'
import { AppRouter } from './routes/AppRoutes'
import { useAuthStore } from './stores/authStore'
import { useThemeStore } from './stores/themeStore'
import './App.css'
import { AuthBackgroundPattern } from './components/ui/BackgroundPattern'

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
    <div>
      <AuthBackgroundPattern />
      <AppRouter />
    </div>
  )
}

export default App
