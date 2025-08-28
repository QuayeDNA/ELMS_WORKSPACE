import React, { useState } from "react";
import { Eye, EyeOff, Lock, Mail, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

interface LoginFormProps {
  onSuccess?: () => void;
}

type ViewState = "login" | "forgot-password" | "reset-sent";

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [currentView, setCurrentView] = useState<ViewState>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const demoAccounts = [
    {
      label: "Super Admin",
      email: "admin@elms.local",
      password: "admin123",
    },
    {
      label: "Institution Admin",
      email: "institution@elms.local",
      password: "institution123",
    },
    {
      label: "Student",
      email: "student@elms.local",
      password: "student123",
    },
  ];

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(formData.email, formData.password);
      onSuccess?.();
      navigate("/dashboard");
    } catch (err: unknown) {
      setError("Invalid credentials. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentView("reset-sent");
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
      console.error("Forgot password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDemoAccount = (account: typeof demoAccounts[0]) => {
    setFormData(prev => ({
      ...prev,
      email: account.email,
      password: account.password,
    }));
  };

  const resetToLogin = () => {
    setCurrentView("login");
    setError("");
    setFormData(prev => ({ ...prev, email: "", password: "" }));
  };

  const renderHeader = () => {
    const headerConfig = {
      login: {
        title: "Welcome back",
        subtitle: "Sign in to access your dashboard",
      },
      "forgot-password": {
        title: "Reset your password",
        subtitle: "Enter your email to receive reset instructions",
      },
      "reset-sent": {
        title: "Check your email",
        subtitle: "We've sent password reset instructions to your email",
      },
    };

    const config = headerConfig[currentView];

    return (
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          {config.title}
        </h2>
        <p className="text-sm text-muted-foreground">
          {config.subtitle}
        </p>
      </div>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
        <p className="text-sm text-destructive font-medium">{error}</p>
      </div>
    );
  };

  const renderLoginForm = () => (
    <>
      <form className="space-y-5" onSubmit={handleLogin}>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground/80">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground/80">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 text-sm text-foreground/80">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => handleInputChange("rememberMe", e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            onClick={() => setCurrentView("forgot-password")}
            className="text-sm text-primary hover:text-primary/80"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || !formData.email || !formData.password}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <div className="text-center">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Quick Demo Access
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              onClick={() => loadDemoAccount(account)}
              className="w-full text-left p-2 rounded border border-border hover:bg-muted text-sm"
            >
              <div className="font-medium">{account.label}</div>
              <div className="text-muted-foreground text-xs">{account.email}</div>
            </button>
          ))}
        </div>
      </div>
    </>
  );

  const renderForgotPasswordForm = () => (
    <form className="space-y-5" onSubmit={handleForgotPassword}>
      <div className="space-y-2">
        <label htmlFor="forgot-email" className="text-sm font-medium text-foreground/80">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            id="forgot-email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading || !formData.email}
      >
        {isLoading ? "Sending..." : "Send Reset Instructions"}
      </button>

      <button
        type="button"
        onClick={resetToLogin}
        className="w-full bg-muted text-muted-foreground py-2 px-4 rounded-lg font-semibold hover:bg-muted/80"
      >
        Back to Login
      </button>
    </form>
  );

  const renderResetSent = () => (
    <div className="text-center space-y-5">
      <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-success" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Check your email</h3>
        <p className="text-muted-foreground">
          We've sent password reset instructions to <strong>{formData.email}</strong>
        </p>
      </div>

      <button
        onClick={resetToLogin}
        className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg font-semibold hover:bg-primary/90"
      >
        Back to Login
      </button>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {renderHeader()}
      {renderError()}

      {currentView === "login" && renderLoginForm()}
      {currentView === "forgot-password" && renderForgotPasswordForm()}
      {currentView === "reset-sent" && renderResetSent()}
    </div>
  );
};
