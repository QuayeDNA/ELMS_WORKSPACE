import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import LoadingScreen from '../src/components/common/LoadingScreen';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/auth/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return <LoadingScreen />;
}
