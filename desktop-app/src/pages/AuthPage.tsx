import AuthLayout from "@/components/layout/AuthLayout";
import AuthSwitcher, { type AuthMode } from "@/components/auth/AuthSwitcher";

export default function AuthPage() {
  const handleModeChange = (mode: AuthMode) => {
    console.log("Auth mode changed to:", mode);
  };

  return (
    <AuthLayout>
      <AuthSwitcher
        initialMode="login"
        onModeChange={handleModeChange}
      />
    </AuthLayout>
  );
}
