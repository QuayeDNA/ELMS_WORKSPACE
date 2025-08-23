import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  role: string
  profile: {
    firstName: string
    lastName: string
    department?: string
    faculty?: string
  }
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          // Make API call to backend
          const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          if (!response.ok) {
            throw new Error('Login failed')
          }

          const data = await response.json()
          
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          })
        } catch (error) {
          console.error('Login error:', error)
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      checkAuth: () => {
        const { token } = get()
        if (token) {
          // Verify token with backend
          // For now, just check if token exists
          set({ isAuthenticated: !!token })
        }
      },
    }),
    {
      name: 'elms-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
