import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { authService, forgotPasswordSchema, type ForgotPasswordFormData } from '@/services/auth';
import { toast } from 'sonner';

interface ForgotPasswordFormProps {
  onSwitchToLogin?: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSwitchToLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authService.forgotPassword(data);

      setSuccess(response.message || 'Password reset instructions have been sent to your email.');

      toast.success('Reset instructions sent!', {
        description: 'Please check your email for password reset instructions.'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset instructions';
      setError(errorMessage);
      toast.error('Failed to send reset instructions', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="border border-border/50 shadow-xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-14 h-14 bg-gradient-to-br from-success/10 to-success/5 rounded-2xl flex items-center justify-center mb-4 border border-success/20"
            >
              <CheckCircle className="w-7 h-7 text-success" />
            </motion.div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-success">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              {success}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>Didn't receive the email? Check your spam folder or try again.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={onSwitchToLogin}
                variant="outline"
                className="flex-1 h-11 border-border/50 hover:bg-muted/50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
              <Button
                onClick={() => {
                  setSuccess(null);
                  setError(null);
                }}
                className="flex-1 h-11 bg-gradient-to-r from-info to-info/90 hover:from-info/90 hover:to-info shadow-lg"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="border border-border/50 shadow-xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-14 h-14 bg-gradient-to-br from-warning/10 to-warning/5 rounded-2xl flex items-center justify-center mb-4 border border-warning/20"
          >
            <Mail className="w-7 h-7 text-warning" />
          </motion.div>
          <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-warning to-warning/70 bg-clip-text text-transparent">
            Reset Password
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4"
            >
              <Alert variant="destructive" className="border-destructive/20">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="pl-10 h-11 border-border/50 focus:border-warning/50 focus:ring-warning/20"
                  {...register('email')}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-destructive"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Submit Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                className="w-full h-11 text-base font-medium bg-gradient-to-r from-warning to-warning/90 hover:from-warning/90 hover:to-warning shadow-lg"
                disabled={isLoading || !isValid}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset instructions...
                  </>
                ) : (
                  'Send Reset Instructions'
                )}
              </Button>
            </motion.div>
          </form>

          {/* Back to Login */}
          {onSwitchToLogin && (
            <div className="text-center pt-2">
              <Button
                type="button"
                variant="link"
                className="text-warning hover:text-warning/80 h-auto px-0"
                onClick={onSwitchToLogin}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
