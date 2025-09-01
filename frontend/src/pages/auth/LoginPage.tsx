import { Navigate, useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuthStore } from '@/stores/auth.store';

export function LoginPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    console.log('LoginPage: User is authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  const handleLoginSuccess = () => {
    console.log('Login success - redirecting to dashboard');
    // Force navigation to dashboard
    setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 100);
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
