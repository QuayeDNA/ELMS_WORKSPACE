import React, { useState } from 'react'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardBody } from '@heroui/card'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Spinner } from '@heroui/spinner'

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
          <div className="mx-auto w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Check your email</h2>
          <p className="text-sm text-foreground/70">
            We've sent a password reset link to
          </p>
          <p className="text-sm font-medium text-primary">{email}</p>
        </div>

        <Card className="bg-background/80 backdrop-blur-sm border-divider shadow-lg">
          <CardBody className="gap-4 p-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-foreground/70">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              
              <div className="space-y-2">
                <Button
                  color="primary"
                  variant="flat"
                  onPress={() => setIsSubmitted(false)}
                  className="w-full"
                >
                  Try another email
                </Button>
                
                <Button
                  variant="light"
                  onPress={handleSubmit}
                  isLoading={isLoading}
                  className="w-full"
                >
                  Resend email
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"
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
        <p className="text-sm text-foreground/70">
          No worries, we'll send you reset instructions
        </p>
      </div>

      <Card className="bg-background/80 backdrop-blur-sm border-divider shadow-lg">
        <CardBody className="gap-6 p-6">
          {error && (
            <Card className="bg-danger-50 border-danger-200 dark:bg-danger-950 dark:border-danger-800">
              <CardBody className="p-3">
                <p className="text-sm text-danger">{error}</p>
              </CardBody>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              label="Email Address"
              placeholder="Enter your email address"
              value={email}
              onValueChange={setEmail}
              startContent={<Mail className="h-4 w-4 text-default-400" />}
              variant="bordered"
              isRequired
              description="We'll send a password reset link to this email"
              classNames={{
                input: "text-sm",
                inputWrapper: "border-divider hover:border-default-400 focus-within:!border-primary"
              }}
            />

            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full font-medium"
              isLoading={isLoading}
              isDisabled={isLoading || !email}
              spinner={<Spinner size="sm" color="current" />}
            >
              {isLoading ? 'Sending...' : 'Send reset email'}
            </Button>
          </form>
        </CardBody>
      </Card>

      <div className="text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  )
}