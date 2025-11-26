import React from 'react';
import { View, ViewStyle } from 'react-native';
import { colors, spacing } from '../../constants/theme';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  style?: ViewStyle;
  className?: string;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const getVariantStyles = (variant: CardProps['variant'] = 'default') => {
  const baseStyles = {
    backgroundColor: colors.surface.primary,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
  };

  switch (variant) {
    case 'outlined':
      return {
        ...baseStyles,
        borderColor: colors.neutral[200],
        borderWidth: 1,
        ...spacing.elevation.none,
      };
    case 'elevated':
      return {
        ...baseStyles,
        ...spacing.elevation.md,
      };
    default:
      return {
        ...baseStyles,
        ...spacing.elevation.sm,
      };
  }
};

export const Card: React.FC<CardProps> = ({ children, variant = 'default', style, className }) => {
  const variantStyles = getVariantStyles(variant);

  return (
    <View className={className} style={[variantStyles, style]}>
      {children}
    </View>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({ children, style }) => {
  return (
    <View style={[{ marginBottom: spacing.md }, style]}>
      {children}
    </View>
  );
};

export const CardContent: React.FC<CardContentProps> = ({ children, style }) => {
  return (
    <View style={[{ marginBottom: spacing.md }, style]}>
      {children}
    </View>
  );
};

export const CardFooter: React.FC<CardFooterProps> = ({ children, style }) => {
  return (
    <View style={[{ flexDirection: 'row', justifyContent: 'flex-end' }, style]}>
      {children}
    </View>
  );
};
