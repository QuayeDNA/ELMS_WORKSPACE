import React, { useState } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import ThemeToggle from '../ui/ThemeToggle'
import { DSCard, DSButton } from '../../design-system/primitives'
import Loader from '../ui/Loader'

interface LoginFormProps {
  onSuccess?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const login = useAuthStore((state) => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login(email, password)
      onSuccess?.()
    } catch (err: unknown) {
      setError('Invalid credentials. Please try again.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left: Visual / branding */}
        <div className="hidden md:flex flex-col items-start justify-center gap-6 px-6">
          <div className="flex items-center gap-3">
            <div style={{ width: 56, height: 56, backgroundColor: 'var(--ds-primary)' }} className="rounded-lg flex items-center justify-center">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sign in to access the ELMS super admin panel</p>
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>Manage institutions, users, audits, and system configuration from a single place.</p>
          </div>

          <div className="w-full">
            <DSCard>
              <div className="space-y-3">
                <div className="text-sm text-gray-700 dark:text-gray-300">Need help?</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Contact support at support@elms.local</div>
              </div>
            </DSCard>
          </div>
        </div>

        {/* Right: Form */}
        <div className="px-4 py-6">
          <div className="flex items-center justify-end mb-4">
            <ThemeToggle />
          </div>

          <DSCard className="w-full">
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Sign in</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Exams Logistics Management System</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-3 rounded-md border border-var outline-none"
                    style={{ backgroundColor: 'var(--ds-surface)', borderColor: 'var(--ds-outline)', color: 'var(--ds-on-surface)' }}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    type="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    className="block w-full pl-10 pr-10 py-3 rounded-md border"
                    style={{ backgroundColor: 'var(--ds-surface)', borderColor: 'var(--ds-outline)', color: 'var(--ds-on-surface)' }}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    type={showPassword ? 'text' : 'password'}
                  />

                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div>
                <DSButton type="submit" className="w-full flex items-center justify-center" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2"><Loader size={16} /> Signing in...</span>
                  ) : (
                    'Sign in'
                  )}
                </DSButton>
              </div>

              <div className="text-center">
                <button type="button" className="text-sm text-blue-600 dark:text-blue-400 underline bg-transparent border-none" onClick={() => console.log('forgot')}>
                  Forgot your password?
                </button>
              </div>
            </form>
          </DSCard>
        </div>
      </div>
    </div>
  )
}
