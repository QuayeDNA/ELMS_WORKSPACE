import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { getRedirectPath } from '@/utils/routeConfig';

/**
 * Hook to handle login success redirection
 */
export function useLoginRedirect() {
  const navigate = useNavigate();

  const redirectAfterLogin = () => {
    // Add a small delay to ensure user state is updated
    setTimeout(() => {
      const currentUser = useAuthStore.getState().user;

      if (!currentUser) {
        console.warn('No user found after login');
        navigate('/dashboard', { replace: true });
        return;
      }

      const redirectPath = getRedirectPath(currentUser.role);
      navigate(redirectPath, { replace: true });
    }, 50); // Small delay to ensure state is updated
  };

  return { redirectAfterLogin };
}
