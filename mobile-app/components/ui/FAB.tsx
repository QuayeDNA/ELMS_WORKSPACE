import React from 'react';
import { TouchableOpacity, ActivityIndicator, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../constants/theme';

export type FABVariant = 'primary' | 'secondary' | 'success' | 'error';
export type FABSize = 'md' | 'lg';

export interface FABProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: FABVariant;
  size?: FABSize;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  className?: string;
}

const getVariantStyles = (variant: FABVariant = 'primary') => {
  switch (variant) {
    case 'secondary':
      return {
        backgroundColor: colors.neutral[100],
        iconColor: colors.neutral[700],
      };
    case 'success':
      return {
        backgroundColor: colors.success[600],
        iconColor: colors.neutral[50],
      };
    case 'error':
      return {
        backgroundColor: colors.error[600],
        iconColor: colors.neutral[50],
      };
    default:
      return {
        backgroundColor: colors.primary[600],
        iconColor: colors.neutral[50],
      };
  }
};

const getSizeStyles = (size: FABSize = 'md') => {
  switch (size) {
    case 'lg':
      return {
        width: 56,
        height: 56,
        borderRadius: 28,
        iconSize: 24,
      };
    default:
      return {
        width: 48,
        height: 48,
        borderRadius: 24,
        iconSize: 20,
      };
  }
};

export const FAB: React.FC<FABProps> = ({
  icon,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  className,
}) => {
  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={className}
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      style={[
        {
          width: sizeStyles.width,
          height: sizeStyles.height,
          borderRadius: sizeStyles.borderRadius,
          backgroundColor: variantStyles.backgroundColor,
          justifyContent: 'center',
          alignItems: 'center',
          ...spacing.elevation.lg,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyles.iconColor} />
      ) : (
        <Ionicons
          name={icon}
          size={sizeStyles.iconSize}
          color={variantStyles.iconColor}
        />
      )}
    </TouchableOpacity>
  );
};
