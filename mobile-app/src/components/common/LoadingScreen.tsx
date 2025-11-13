import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading ELMS...'
}) => {
  const theme = useTheme();
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Animated Background Circles */}
      <View style={styles.backgroundCircles}>
        <View style={[styles.circle, styles.circle1, { backgroundColor: theme.colors.primary + '10' }]} />
        <View style={[styles.circle, styles.circle2, { backgroundColor: theme.colors.primary + '08' }]} />
      </View>

      {/* Logo Container */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            backgroundColor: theme.colors.primary,
            transform: [{ scale: pulseAnim }]
          }
        ]}
      >
        <MaterialCommunityIcons
          name="school"
          size={56}
          color="#ffffff"
        />
      </Animated.View>

      {/* Brand Name */}
      <Text
        variant="headlineMedium"
        style={[styles.brandName, { color: theme.colors.onBackground }]}
      >
        ELMS
      </Text>

      <Text
        variant="labelMedium"
        style={[styles.subtitle, { color: theme.colors.primary }]}
      >
        Examination Logistics Management System
      </Text>

      {/* Loading Spinner */}
      <ActivityIndicator
        size="large"
        color={theme.colors.primary}
        style={styles.spinner}
      />

      {/* Loading Message */}
      <Text
        variant="bodyLarge"
        style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
      >
        {message}
      </Text>

      <Text
        variant="bodySmall"
        style={[styles.submessage, { color: theme.colors.onSurfaceVariant }]}
      >
        Please wait while we prepare everything for you
      </Text>

      {/* Loading Dots */}
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
        <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
        <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
      </View>

      {/* Footer */}
      <Text
        variant="labelSmall"
        style={[styles.footer, { color: theme.colors.onSurfaceVariant }]}
      >
        Powered by Academic Excellence
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backgroundCircles: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
  },
  circle1: {
    width: 300,
    height: 300,
    opacity: 0.3,
  },
  circle2: {
    width: 200,
    height: 200,
    opacity: 0.2,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  brandName: {
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 1,
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 12,
  },
  spinner: {
    marginVertical: 24,
  },
  message: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  submessage: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    opacity: 0.5,
  },
});

export default LoadingScreen;
