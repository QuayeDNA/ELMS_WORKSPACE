import React from 'react';
import { View, ActivityIndicator, ViewStyle, DimensionValue } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';

export interface SpinnerProps {
  size?: 'small' | 'large' | number;
  color?: string;
  centered?: boolean;
  style?: ViewStyle;
}

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  variant?: 'text' | 'circular' | 'rectangular';
  animated?: boolean;
  style?: ViewStyle;
}

export interface SkeletonCardProps {
  lines?: number;
  showAvatar?: boolean;
  style?: ViewStyle;
}

export interface SkeletonListProps {
  count?: number;
  showAvatar?: boolean;
  style?: ViewStyle;
}

export interface LoadingOverlayProps {
  visible: boolean;
  text?: string;
  color?: string;
  style?: ViewStyle;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'large',
  color = colors.primary[600],
  centered = false,
  style,
}) => {
  const spinner = (
    <ActivityIndicator
      size={size}
      color={color}
      style={style}
    />
  );

  if (centered) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {spinner}
      </View>
    );
  }

  return spinner;
};

const SkeletonPulse: React.FC<{ style?: ViewStyle; children?: React.ReactNode }> = ({ style, children }) => (
  <View
    style={[
      {
        backgroundColor: colors.neutral[200],
        opacity: 0.5,
      },
      style,
    ]}
  >
    {children}
  </View>
);

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  variant = 'text',
  animated = true,
  style,
}) => {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'circular':
        return {
          borderRadius: height / 2,
          width: height,
          height,
        };
      case 'rectangular':
        return {
          borderRadius: spacing.borderRadius.sm,
          width: typeof width === 'number' ? width : width,
          height,
        };
      default: // text
        return {
          borderRadius: spacing.borderRadius.sm,
          width,
          height,
        };
    }
  };

  const variantStyles = getVariantStyles();

  if (animated) {
    return (
      <SkeletonPulse style={variantStyles} />
    );
  }

  return (
    <View
      style={[
        {
          backgroundColor: colors.neutral[200],
          ...variantStyles,
        },
        style,
      ]}
    />
  );
};

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  lines = 3,
  showAvatar = false,
  style,
}) => {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface.primary,
          borderRadius: spacing.borderRadius.lg,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: colors.neutral[200],
        },
        style,
      ]}
    >
      {showAvatar && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
          <Skeleton variant="circular" width={40} height={40} />
          <View style={{ marginLeft: spacing.sm, flex: 1 }}>
            <Skeleton width="60%" height={16} style={{ marginBottom: spacing.xs }} />
            <Skeleton width="40%" height={14} />
          </View>
        </View>
      )}

      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? '70%' : '100%'}
          height={14}
          style={{ marginBottom: index < lines - 1 ? spacing.sm : 0 }}
        />
      ))}
    </View>
  );
};

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 5,
  showAvatar = false,
  style,
}) => {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            borderBottomWidth: index < count - 1 ? 1 : 0,
            borderBottomColor: colors.neutral[100],
          }}
        >
          {showAvatar && (
            <Skeleton variant="circular" width={40} height={40} style={{ marginRight: spacing.md }} />
          )}

          <View style={{ flex: 1 }}>
            <Skeleton width="80%" height={16} style={{ marginBottom: spacing.xs }} />
            <Skeleton width="60%" height={14} />
          </View>

          <Skeleton width={20} height={20} variant="circular" />
        </View>
      ))}
    </View>
  );
};

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  text,
  color = colors.primary[600],
  style,
}) => {
  if (!visible) return null;

  return (
    <View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        },
        style,
      ]}
    >
      <View
        style={{
          backgroundColor: colors.surface.primary,
          borderRadius: spacing.borderRadius.lg,
          padding: spacing.lg,
          alignItems: 'center',
          ...spacing.elevation.md,
        }}
      >
        <ActivityIndicator size="large" color={color} />
        {text && (
          <View style={{ marginTop: spacing.md }}>
            <Skeleton width={100} height={typography.bodyMedium.fontSize} />
          </View>
        )}
      </View>
    </View>
  );
};
