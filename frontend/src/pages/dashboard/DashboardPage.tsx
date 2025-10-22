import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/types/auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SuperAdminDashboard } from '@/pages/super-admin/SuperAdminDashboard';

export function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect users based on their role to their specific dashboards
    if (user) {
      switch (user.role) {
        case UserRole.SUPER_ADMIN:
          // SuperAdmin stays on dashboard but shows SuperAdmin content
          break;
        case UserRole.ADMIN:
          // Redirect Admin to their admin dashboard
          navigate('/admin', { replace: true });
          break;
        default:
          // Other roles stay on general dashboard
          break;
      }
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show role-specific dashboard content
  switch (user.role) {
    case UserRole.SUPER_ADMIN:
      return <SuperAdminDashboard />;

    default:
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user.firstName} {user.lastName}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Role: {user.role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </h2>
            <p className="text-gray-600">
              Your dashboard content will be available here based on your role and permissions.
            </p>
          </div>
        </div>
      );
  }
}



