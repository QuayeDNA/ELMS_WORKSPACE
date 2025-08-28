import React, { useState } from 'react'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsSubmitted(true)
    } catch (err) {
      // Handle the caught exception by logging it and showing a user-friendly message
      console.error(err)
      setError('Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Check your email</h2>
          <p className="text-sm text-muted-foreground">
            We've sent a password reset link to
          </p>
          <p className="text-sm font-medium text-primary">{email}</p>
        </div>

        <div className="bg-background/80 backdrop-blur-sm border border-border rounded-lg shadow-lg">
          <div className="p-6 space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or try again.
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full bg-primary/10 text-primary py-2 px-4 rounded-lg hover:bg-primary/20"
                >
                  Try another email
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-muted text-muted-foreground py-2 px-4 rounded-lg hover:bg-muted/80 disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Resend email'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Forgot password?</h2>
        <p className="text-sm text-muted-foreground">
          No worries, we'll send you reset instructions
        </p>
      </div>

      <div className="bg-background/80 backdrop-blur-sm border border-border rounded-lg shadow-lg">
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground/80">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">We'll send a password reset link to this email</p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send reset email'}
            </button>
          </form>
        </div>
      </div>

      <div className="text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
