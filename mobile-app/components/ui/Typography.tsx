import React from 'react';
import { Text, TextStyle } from 'react-native';
import { colors, typography } from '../../constants/theme';

export type TypographyVariant =
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'headlineLarge'
  | 'headlineMedium'
  | 'headlineSmall'
  | 'titleLarge'
  | 'titleMedium'
  | 'titleSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall';

export type TypographyColor = 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'warning';

export interface TypographyProps {
  children: React.ReactNode;
  variant?: TypographyVariant;
  color?: TypographyColor;
  style?: TextStyle;
  numberOfLines?: number;
}

const getTextColor = (color: TypographyColor = 'primary') => {
  switch (color) {
    case 'secondary':
      return colors.text.secondary;
    case 'tertiary':
      return colors.text.tertiary;
    case 'error':
      return colors.error[600];
    case 'success':
      return colors.success[600];
    case 'warning':
      return colors.warning[600];
    default:
      return colors.text.primary;
  }
};

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'bodyMedium',
  color = 'primary',
  style,
  numberOfLines,
}) => {
  const textColor = getTextColor(color);
  const variantStyles = typography[variant];

  return (
    <Text
      style={[
        {
          color: textColor,
          fontSize: variantStyles.fontSize,
          lineHeight: variantStyles.lineHeight,
          fontWeight: variantStyles.fontWeight,
        },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
};

// Convenience components
export const Heading: React.FC<Omit<TypographyProps, 'variant'> & { level?: 1 | 2 | 3 }> = ({
  level = 1,
  ...props
}) => {
  const variants: Record<1 | 2 | 3, TypographyVariant> = {
    1: 'headlineLarge',
    2: 'headlineMedium',
    3: 'headlineSmall',
  };

  return <Typography variant={variants[level]} {...props} />;
};

export const Title: React.FC<Omit<TypographyProps, 'variant'> & { size?: 'sm' | 'md' | 'lg' }> = ({
  size = 'md',
  ...props
}) => {
  const variants: Record<'sm' | 'md' | 'lg', TypographyVariant> = {
    sm: 'titleSmall',
    md: 'titleMedium',
    lg: 'titleLarge',
  };

  return <Typography variant={variants[size]} {...props} />;
};

export const Body: React.FC<Omit<TypographyProps, 'variant'> & { size?: 'sm' | 'md' | 'lg' }> = ({
  size = 'md',
  ...props
}) => {
  const variants: Record<'sm' | 'md' | 'lg', TypographyVariant> = {
    sm: 'bodySmall',
    md: 'bodyMedium',
    lg: 'bodyLarge',
  };

  return <Typography variant={variants[size]} {...props} />;
};

export const Label: React.FC<Omit<TypographyProps, 'variant'> & { size?: 'sm' | 'md' | 'lg' }> = ({
  size = 'md',
  ...props
}) => {
  const variants: Record<'sm' | 'md' | 'lg', TypographyVariant> = {
    sm: 'labelSmall',
    md: 'labelMedium',
    lg: 'labelLarge',
  };

  return <Typography variant={variants[size]} {...props} />;
};
