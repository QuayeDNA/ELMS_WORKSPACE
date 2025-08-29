import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Mail, Lock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useAuthStore } from '@/stores/authStore';
import { authService, loginSchema, type LoginFormData } from '@/services/auth';
import { toast } from 'sonner';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
  onSwitchToForgotPassword?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onSwitchToForgotPassword
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const rememberMe = watch('rememberMe');

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(data);
      await login(data.email, data.password);

      toast.success('Login successful!', {
        description: `Welcome back, ${response.user.profile.firstName}!`
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      toast.error('Login failed', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            className="mx-auto w-14 h-14 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center mb-4 border border-border/20"
          >
            <Shield className="w-7 h-7 text-primary" />
          </motion.div>
          <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Sign in to your ELMS account to continue
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
                  placeholder="Enter your email"
                  className="pl-10 h-11 border-border/50 focus:border-primary/50 focus:ring-primary/20"
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

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-11 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                  {...register('password')}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-muted/50"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-destructive"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setValue('rememberMe', !!checked)}
                  disabled={isLoading}
                  className="border-border/50"
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm font-normal cursor-pointer text-muted-foreground"
                >
                  Remember me
                </Label>
              </div>

              {onSwitchToForgotPassword && (
                <Button
                  type="button"
                  variant="link"
                  className="px-0 font-normal text-sm text-primary hover:text-primary/80 h-auto"
                  onClick={onSwitchToForgotPassword}
                  disabled={isLoading}
                >
                  Forgot password?
                </Button>
              )}
            </div>

            {/* Submit Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                className="w-full h-11 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
                disabled={isLoading || !isValid}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </motion.div>
          </form>

          {/* Register Link */}
          {onSwitchToRegister && (
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Button
                  type="button"
                  variant="link"
                  className="px-0 font-normal text-primary hover:text-primary/80 h-auto"
                  onClick={onSwitchToRegister}
                  disabled={isLoading}
                >
                  Sign up
                </Button>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
