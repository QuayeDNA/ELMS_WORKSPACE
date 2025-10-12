import { Navigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuthStore } from '@/stores/auth.store';
import { useLoginRedirect } from '@/hooks/useLoginRedirect';

export function LoginPage() {
  const { isAuthenticated } = useAuthStore();
  const { redirectAfterLogin } = useLoginRedirect();

  // Redirect to appropriate dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLoginSuccess = () => {
    // Use role-based redirect (delay is handled in the hook)
    redirectAfterLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ELMS
          </h1>
          <p className="text-gray-600">
            Examination Logistics Management System
          </p>
        </div>
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}



