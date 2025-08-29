import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { authService, registerSchema, type RegisterFormData } from '@/services/auth';
import { toast } from 'sonner';

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
}

const USER_ROLES = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'LECTURER', label: 'Lecturer' },
  { value: 'DEPARTMENT_HEAD', label: 'Department Head' },
  { value: 'EXAM_COORDINATOR', label: 'Exam Coordinator' },
  { value: 'IT_SUPPORT', label: 'IT Support' },
];

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      role: 'STUDENT'
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authService.register(data);

      setSuccess(response.message || 'Registration successful! Please check your email to verify your account.');

      toast.success('Registration successful!', {
        description: 'Please check your email to verify your account.'
      });

      // Optionally switch to login after a delay
      setTimeout(() => {
        if (onSwitchToLogin) {
          onSwitchToLogin();
        }
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      toast.error('Registration failed', {
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
              <Shield className="w-7 h-7 text-success" />
            </motion.div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-success">
              Registration Successful!
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              {success}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              onClick={onSwitchToLogin}
              className="w-full h-11 bg-gradient-to-r from-success to-success/90 hover:from-success/90 hover:to-success shadow-lg"
              variant="default"
            >
              Back to Login
            </Button>
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
            className="mx-auto w-14 h-14 bg-gradient-to-br from-secondary/10 to-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-border/20"
          >
            <User className="w-7 h-7 text-secondary" />
          </motion.div>
          <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-secondary to-secondary/70 bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Join the ELMS platform to get started
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
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  className="h-11 border-border/50 focus:border-secondary/50 focus:ring-secondary/20"
                  {...register('firstName')}
                  disabled={isLoading}
                />
                {errors.firstName && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-destructive"
                  >
                    {errors.firstName.message}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  className="h-11 border-border/50 focus:border-secondary/50 focus:ring-secondary/20"
                  {...register('lastName')}
                  disabled={isLoading}
                />
                {errors.lastName && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-destructive"
                  >
                    {errors.lastName.message}
                  </motion.p>
                )}
              </div>
            </div>

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
                  placeholder="john.doe@university.edu"
                  className="pl-10 h-11 border-border/50 focus:border-secondary/50 focus:ring-secondary/20"
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

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium text-foreground">
                Role
              </Label>
              <select
                id="role"
                className="flex h-11 w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/50 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('role')}
                disabled={isLoading}
              >
                {USER_ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {errors.role && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-destructive"
                >
                  {errors.role.message}
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
                  placeholder="Create a strong password"
                  className="pl-10 pr-10 h-11 border-border/50 focus:border-secondary/50 focus:ring-secondary/20"
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

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className="pl-10 pr-10 h-11 border-border/50 focus:border-secondary/50 focus:ring-secondary/20"
                  {...register('confirmPassword')}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-muted/50"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-destructive"
                >
                  {errors.confirmPassword.message}
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
                className="w-full h-11 text-base font-medium bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary shadow-lg"
                disabled={isLoading || !isValid}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </motion.div>
          </form>

          {/* Login Link */}
          {onSwitchToLogin && (
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Button
                  type="button"
                  variant="link"
                  className="px-0 font-normal text-secondary hover:text-secondary/80 h-auto"
                  onClick={onSwitchToLogin}
                  disabled={isLoading}
                >
                  Sign in
                </Button>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
