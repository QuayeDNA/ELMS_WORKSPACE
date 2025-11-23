/**
 * ELMS Mobile - Loading Components
 * Spinner, skeleton placeholders, and loading states
 */

import React from 'react';
import { View, ActivityIndicator, ViewProps, Animated } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);

// ============================================================================
// Spinner - Basic loading indicator
// ============================================================================

export interface SpinnerProps extends ViewProps {
  size?: 'small' | 'large' | number;
  color?: string;
  centered?: boolean;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'large',
  color = '#2563eb', // primary-600
  centered = false,
  className = '',
  ...props
}) => {
  const containerClass = centered
    ? `flex-1 items-center justify-center ${className}`
    : className;

  return (
    <StyledView className={containerClass} {...props}>
      <ActivityIndicator size={size} color={color} />
    </StyledView>
  );
};

// ============================================================================
// Skeleton - Loading placeholder
// ============================================================================

export interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number | string;
  variant?: 'text' | 'circular' | 'rectangular';
  animated?: boolean;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  variant = 'text',
  animated = true,
  className = '',
  style,
  ...props
}) => {
  const opacity = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();

      return () => animation.stop();
    }
  }, [animated, opacity]);

  const borderRadius =
    variant === 'circular'
      ? 9999
      : variant === 'text'
      ? 4
      : 8;

  return (
    <Animated.View
      className={`bg-neutral-200 ${className}`}
      style={[
        {
          width,
          height,
          borderRadius,
          opacity: animated ? opacity : 0.3,
        },
        style,
      ]}
      {...props}
    />
  );
};

// ============================================================================
// SkeletonCard - Card loading placeholder
// ============================================================================

export interface SkeletonCardProps extends ViewProps {
  lines?: number;
  showAvatar?: boolean;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  lines = 3,
  showAvatar = false,
  className = '',
  ...props
}) => {
  return (
    <StyledView className={`p-4 bg-white rounded-lg ${className}`} {...props}>
      <View className="flex-row items-start">
        {showAvatar && (
          <Skeleton
            width={40}
            height={40}
            variant="circular"
            className="mr-3"
          />
        )}
        <View className="flex-1">
          <Skeleton width="60%" height={20} className="mb-2" />
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton
              key={index}
              width={index === lines - 1 ? '40%' : '100%'}
              height={14}
              className="mb-2"
            />
          ))}
        </View>
      </View>
    </StyledView>
  );
};

// ============================================================================
// SkeletonList - List loading placeholder
// ============================================================================

export interface SkeletonListProps extends ViewProps {
  count?: number;
  showAvatar?: boolean;
  className?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 5,
  showAvatar = true,
  className = '',
  ...props
}) => {
  return (
    <StyledView className={className} {...props}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          className="flex-row items-center px-4 py-3 border-b border-neutral-100"
        >
          {showAvatar && (
            <Skeleton width={40} height={40} variant="circular" className="mr-3" />
          )}
          <View className="flex-1">
            <Skeleton width="70%" height={16} className="mb-2" />
            <Skeleton width="50%" height={12} />
          </View>
        </View>
      ))}
    </StyledView>
  );
};

// ============================================================================
// LoadingOverlay - Full-screen loading overlay
// ============================================================================

export interface LoadingOverlayProps extends ViewProps {
  visible?: boolean;
  text?: string;
  color?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible = false,
  text,
  color = '#2563eb',
  className = '',
  ...props
}) => {
  if (!visible) return null;

  return (
    <StyledView
      className={`absolute inset-0 bg-black/50 items-center justify-center z-50 ${className}`}
      {...props}
    >
      <View className="bg-white rounded-xl p-6 items-center shadow-lg">
        <ActivityIndicator size="large" color={color} />
        {text && (
          <styled.Text className="mt-4 text-base text-neutral-900">
            {text}
          </styled.Text>
        )}
      </View>
    </StyledView>
  );
};

export default Spinner;
