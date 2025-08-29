import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Shield, UserPlus, KeyRound, ArrowLeft } from "lucide-react";

export type AuthMode = "login" | "register" | "forgot-password";

interface AuthSwitcherProps {
  initialMode?: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
}

const authModes = [
  {
    id: "login" as AuthMode,
    label: "Sign In",
    icon: Shield,
    description: "Access your account"
  },
  {
    id: "register" as AuthMode,
    label: "Sign Up",
    icon: UserPlus,
    description: "Create new account"
  },
  {
    id: "forgot-password" as AuthMode,
    label: "Reset Password",
    icon: KeyRound,
    description: "Recover your account"
  }
];

export default function AuthSwitcher({
  initialMode = "login",
  onModeChange
}: AuthSwitcherProps) {
  const [currentMode, setCurrentMode] = useState<AuthMode>(initialMode);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleModeChange = (mode: AuthMode) => {
    if (mode === currentMode) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMode(mode);
      setIsTransitioning(false);
      onModeChange?.(mode);
    }, 150);
  };

  const handleBackToLogin = () => {
    handleModeChange("login");
  };

  const renderAuthForm = () => {
    switch (currentMode) {
      case "login":
        return (
          <LoginForm
            onSwitchToRegister={() => handleModeChange("register")}
            onSwitchToForgotPassword={() => handleModeChange("forgot-password")}
          />
        );
      case "register":
        return (
          <RegisterForm
            onSwitchToLogin={() => handleModeChange("login")}
          />
        );
      case "forgot-password":
        return (
          <ForgotPasswordForm
            onSwitchToLogin={handleBackToLogin}
          />
        );
    }
  };

  const currentModeData = authModes.find(mode => mode.id === currentMode);

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-0">
      {/* Mode Selector - Minimalist Design */}
      <div className="mb-6">
        <div className="flex rounded-xl bg-muted/30 p-1 border border-border/50 backdrop-blur-sm">
          {authModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              disabled={isTransitioning}
              className={`flex-1 flex flex-col sm:flex-row items-center gap-1.5 py-2.5 px-3 text-xs font-medium rounded-lg transition-all duration-200 ${
                currentMode === mode.id
                  ? "bg-background shadow-sm text-foreground border border-border/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <mode.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Mode Description - Simplified */}
        <div className="mt-4 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-1"
            >
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                {currentModeData?.label}
              </h2>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {currentModeData?.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Auth Form Container - Enhanced */}
      <Card className="border border-border/50 shadow-lg bg-card/95 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {renderAuthForm()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Quick Actions - Streamlined */}
      <div className="mt-4 text-center space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Need help?</span>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs text-primary hover:text-primary/80 font-medium"
            onClick={() => handleModeChange("forgot-password")}
          >
            Reset Password
          </Button>
        </div>

        {currentMode !== "login" && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md px-2 py-1"
            onClick={handleBackToLogin}
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Back to Sign In
          </Button>
        )}
      </div>

      {/* Terms and Privacy - Minimalist */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground leading-relaxed">
          By continuing, you agree to our{" "}
          <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary hover:text-primary/80">
            Terms
          </Button>{" "}
          and{" "}
          <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary hover:text-primary/80">
            Privacy
          </Button>
        </p>
      </div>
    </div>
  );
}
