import { useSelector } from 'react-redux';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { RootState } from '../store';

export function useProtectedRoute() {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Don't do anything while loading
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to auth if not authenticated and not in auth group
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app if authenticated and in auth group
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  return {
    isAuthenticated,
    isLoading,
  };
}
