import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments, usePathname } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { Colors } from '../constants/theme';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const navigationInProgress = useRef(false);

  useEffect(() => {
    if (isLoading || navigationInProgress.current) {
      return; // Still checking auth status or navigation in progress
    }

    const inAuthGroup = segments[0] === 'login' || pathname === '/login';

    // User is authenticated and trying to access login page
    if (isAuthenticated && inAuthGroup) {
      navigationInProgress.current = true;
      router.replace('/(tabs)');
      // Reset flag after navigation
      setTimeout(() => {
        navigationInProgress.current = false;
      }, 500);
      return;
    }

    // User is not authenticated and not on login page
    if (!isAuthenticated && !inAuthGroup) {
      navigationInProgress.current = true;
      router.replace('/login');
      // Reset flag after navigation
      setTimeout(() => {
        navigationInProgress.current = false;
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, segments, pathname, router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
});
