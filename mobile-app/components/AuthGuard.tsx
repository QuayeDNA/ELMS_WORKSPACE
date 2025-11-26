import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { Colors } from '../constants/theme';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Still checking auth status

    const inAuthGroup = segments[0] === 'login';

    if (inAuthGroup) {
      // Don't redirect when on login screen - let the login component handle its own logic
      return;
    }

    if (!isAuthenticated) {
      // Redirect to login if not authenticated and not on login screen
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, segments, router]);

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
