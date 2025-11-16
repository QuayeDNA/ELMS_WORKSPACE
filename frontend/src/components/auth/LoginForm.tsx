import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/auth.store";
import type { LoginRequest } from "@/types/auth";
import { forwardRef, useImperativeHandle } from "react";
import { toast } from "sonner";
import type { DevCredential } from '@/components/auth/devCredentials';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
}
export interface LoginFormRef {
  fillCredentials: (credential: DevCredential) => void;
}

export const LoginForm = forwardRef<LoginFormRef, LoginFormProps>(
  ({ onSuccess }: Readonly<LoginFormProps>, ref) => {
    const { login, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      // Trim email and password to prevent whitespace issues
      const loginData = {
        ...data,
        email: data.email.trim(),
        password: data.password.trim(),
      };
      await login(loginData as LoginRequest);
      reset();
      toast.success("Login successful!");
      onSuccess?.();
    } catch (err) {
      // Error is already set in store by login action
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      console.error("Login failed:", err);
      toast.error(errorMessage);
      // Don't reset form on error so user can see what they entered
    }
  };

    // Expose the ability to auto-fill the form from a parent (FAB, etc.)
    useImperativeHandle(ref, () => ({
      fillCredentials: (credential: DevCredential) => {
        setValue("email", credential.email);
        setValue("password", credential.password);
        toast.success(`Selected ${credential.role}: ${credential.name}`);
      },
    }));

  return (
    <div className="space-y-6">
      {/* Welcome message moved to LoginPage for a centralized UX */}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10"
                {...register("email")}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="pl-10"
                {...register("password")}
                disabled={isLoading}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="rememberMe"
              type="checkbox"
              className="rounded border-gray-300"
              {...register("rememberMe")}
              disabled={isLoading}
            />
            <Label htmlFor="rememberMe" className="text-sm">
              Remember me
            </Label>
          </div>

          {/* Development helper moved into a floating FAB at page level */}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
    </div>
  );
});
