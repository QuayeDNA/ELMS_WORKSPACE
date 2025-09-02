import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { getRedirectPath } from '@/utils/routeConfig';

/**
 * Hook to handle login success redirection
 */
export function useLoginRedirect() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const redirectAfterLogin = () => {
    if (!user) {
      console.warn('No user found after login');
      navigate('/dashboard', { replace: true });
      return;
    }

    const redirectPath = getRedirectPath(user.role);
    console.log(`Redirecting ${user.role} to ${redirectPath}`);
    navigate(redirectPath, { replace: true });
  };

  return { redirectAfterLogin };
}
