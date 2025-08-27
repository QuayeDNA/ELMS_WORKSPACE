import React, { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Loader } from "../ui/Loader";

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
      onSuccess?.();
      navigate("/dashboard");
    } catch (err: unknown) {
      setError("Invalid credentials. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Welcome Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
        <p className="text-sm text-foreground/70">
          Sign in to access your dashboard
        </p>
      </div>

      {/* Login Card */}
      <Card className="bg-background/80 backdrop-blur-sm border-divider shadow-lg">
        <CardBody className="gap-6 p-6">
          {error && (
            <Card className="bg-danger-50 border-danger-200 dark:bg-danger-950 dark:border-danger-800">
              <CardBody className="p-3">
                <p className="text-sm text-danger">{error}</p>
              </CardBody>
            </Card>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-3 rounded-md border border-var outline-none"
                  style={{
                    backgroundColor: "var(--ds-surface)",
                    borderColor: "var(--ds-outline)",
                    color: "var(--ds-on-surface)",
                  }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  className="block w-full pl-10 pr-10 py-3 rounded-md border"
                  style={{
                    backgroundColor: "var(--ds-surface)",
                    borderColor: "var(--ds-outline)",
                    color: "var(--ds-on-surface)",
                  }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  type={showPassword ? "text" : "password"}
                />

                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div>
              <Button
                color="primary"
                type="submit"
                className="w-full flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader size={16} /> Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <button
                  type="button"
                  className="text-sm text-gray-600 dark:text-gray-300 underline bg-transparent border-none"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot your password?
                </button>
              </div>
              <div className="text-sm text-gray-500">
                Need an account?{" "}
                <button
                  onClick={() => console.log("signup")}
                  className="underline"
                >
                  Contact admin
                </button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Quick Access Demo Accounts */}
      <Card className="bg-default-50 dark:bg-default-100/50 border-divider">
        <CardBody className="p-4">
          <div className="text-center space-y-3">
            <p className="text-xs font-medium text-foreground/80">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Button
                size="sm"
                variant="flat"
                color="secondary"
                className="text-xs"
                onPress={() => {
                  setEmail("admin@elms.local");
                  setPassword("admin123");
                }}
              >
                Super Admin
              </Button>
              <Button
                size="sm"
                variant="flat"
                color="secondary"
                className="text-xs"
                onPress={() => {
                  setEmail("student@elms.local");
                  setPassword("student123");
                }}
              >
                Student
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Divider className="my-4" />

      {/* Footer Links */}
      <div className="text-center space-y-4">
        <p className="text-xs text-foreground/60">
          Don't have an account?{" "}
          <button
            onClick={() => console.log("Contact admin for account creation")}
            className="text-primary hover:underline font-medium focus:outline-none focus:underline"
          >
            Contact Administrator
          </button>
        </p>

        <div className="flex items-center justify-center gap-4 text-xs text-foreground/50">
          <button className="hover:text-foreground/70 transition-colors">
            Privacy Policy
          </button>
          <span>•</span>
          <button className="hover:text-foreground/70 transition-colors">
            Terms of Service
          </button>
          <span>•</span>
          <button className="hover:text-foreground/70 transition-colors">
            Help & Support
          </button>
        </div>
      </div>
    </div>
  );
};
