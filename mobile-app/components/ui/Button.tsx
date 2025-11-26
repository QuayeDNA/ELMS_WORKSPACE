import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../constants/theme';

export interface ButtonProps {
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  className?: string;
  textStyle?: TextStyle;
}

const getVariantStyles = (variant: ButtonProps['variant'] = 'default') => {
  switch (variant) {
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderColor: colors.primary[600],
        borderWidth: 1,
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
      };
    case 'destructive':
      return {
        backgroundColor: colors.error[600],
        borderColor: colors.error[600],
        borderWidth: 0,
      };
    case 'success':
      return {
        backgroundColor: colors.success[600],
        borderColor: colors.success[600],
        borderWidth: 0,
      };
    default:
      return {
        backgroundColor: colors.primary[600],
        borderColor: colors.primary[600],
        borderWidth: 0,
      };
  }
};

const getSizeStyles = (size: ButtonProps['size'] = 'md') => {
  switch (size) {
    case 'sm':
      return {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        minHeight: 32,
      };
    case 'lg':
      return {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        minHeight: 48,
      };
    case 'icon':
      return {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        minHeight: 40,
        minWidth: 40,
      };
    default:
      return {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        minHeight: 40,
      };
  }
};

const getTextVariant = (size: ButtonProps['size'] = 'md') => {
  switch (size) {
    case 'sm':
      return 'labelMedium';
    case 'lg':
      return 'labelLarge';
    default:
      return 'labelMedium';
  }
};

const getTextColor = (variant: ButtonProps['variant'] = 'default', disabled?: boolean) => {
  if (disabled) return colors.text.disabled;

  switch (variant) {
    case 'outline':
    case 'ghost':
      return colors.primary[600];
    case 'destructive':
      return colors.neutral[50];
    case 'success':
      return colors.neutral[50];
    default:
      return colors.neutral[50];
  }
};

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'default',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  className,
  textStyle,
}) => {
  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);
  const textVariant = getTextVariant(size);
  const textColor = getTextColor(variant, disabled);

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={className}
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      style={[
        {
          borderRadius: spacing.borderRadius.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          ...variantStyles,
          ...sizeStyles,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={textColor}
          style={{ marginRight: leftIcon || rightIcon ? spacing.xs : 0 }}
        />
      )}

      {leftIcon && !loading && (
        <Ionicons
          name={leftIcon}
          size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18}
          color={textColor}
          style={{ marginRight: spacing.xs }}
        />
      )}

      {size !== 'icon' && (
        <Text
          style={[
            {
              color: textColor,
              fontSize: typography[textVariant].fontSize,
              fontWeight: typography[textVariant].fontWeight,
              lineHeight: typography[textVariant].lineHeight,
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}

      {rightIcon && !loading && (
        <Ionicons
          name={rightIcon}
          size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18}
          color={textColor}
          style={{ marginLeft: spacing.xs }}
        />
      )}
    </TouchableOpacity>
  );
};
